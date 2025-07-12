import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.01
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  // For advanced features
  productCode: String,
  unitOfMeasure: {
    type: String,
    default: 'NIU' // Unidad (SUNAT code)
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  }
});

const invoiceSchema = new mongoose.Schema({
  // Document Information
  type: {
    type: String,
    enum: ['boleta', 'factura', 'nota_credito', 'nota_debito'],
    required: true
  },
  series: {
    type: String,
    required: true,
    uppercase: true
  },
  number: {
    type: String,
    required: true
  },
  
  // User and Business
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Client Information
  client: {
    documentType: {
      type: String,
      enum: ['DNI', 'RUC', 'CE', 'PASSPORT'],
      required: true
    },
    documentNumber: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: String
  },
  
  // Items and Amounts
  items: [invoiceItemSchema],
  
  amounts: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    igv: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  
  // Currency and Exchange
  currency: {
    type: String,
    default: 'PEN',
    enum: ['PEN', 'USD', 'EUR']
  },
  exchangeRate: {
    type: Number,
    default: 1
  },
  
  // Document Status
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'cancelled', 'rejected'],
    default: 'draft'
  },
  
  // SUNAT Integration
  sunat: {
    status: {
      type: String,
      enum: ['pending', 'sent', 'accepted', 'rejected', 'cancelled'],
      default: 'pending'
    },
    responseCode: String,
    responseDescription: String,
    cdrHash: String,
    sentAt: Date,
    responseAt: Date,
    xmlFileName: String,
    pdfFileName: String
  },
  
  // Dates
  issueDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: Date,
  paidAt: Date,
  
  // Payment Information
  payment: {
    method: {
      type: String,
      enum: ['efectivo', 'transferencia', 'yape', 'plin', 'tarjeta', 'cheque'],
      default: 'efectivo'
    },
    reference: String,
    paidAmount: {
      type: Number,
      default: 0
    },
    remainingAmount: {
      type: Number,
      default: function() { return this.amounts.total; }
    }
  },
  
  // File References
  files: {
    originalDocument: String, // For uploaded invoices
    pdfDocument: String,
    xmlDocument: String,
    thumbnails: [String]
  },
  
  // Metadata
  notes: String,
  tags: [String],
  source: {
    type: String,
    enum: ['manual', 'upload', 'scan', 'api'],
    default: 'manual'
  },
  
  // Audit Trail
  history: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'sent_to_sunat', 'paid', 'cancelled']
    },
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

// Compound indexes for queries
invoiceSchema.index({ userId: 1, type: 1 });
invoiceSchema.index({ userId: 1, status: 1 });
invoiceSchema.index({ userId: 1, issueDate: -1 });
invoiceSchema.index({ userId: 1, 'sunat.status': 1 });
invoiceSchema.index({ series: 1, number: 1 }, { unique: true });
invoiceSchema.index({ 'client.documentNumber': 1 });

// Virtual for formatted invoice number
invoiceSchema.virtual('documentNumber').get(function() {
  return `${this.series}-${this.number.padStart(8, '0')}`;
});

// Method to calculate totals
invoiceSchema.methods.calculateTotals = function() {
  const subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  const discount = this.amounts.discount || 0;
  const subtotalAfterDiscount = subtotal - discount;
  const igv = subtotalAfterDiscount * 0.18; // 18% IGV
  const total = subtotalAfterDiscount + igv;
  
  this.amounts.subtotal = subtotal;
  this.amounts.igv = igv;
  this.amounts.total = total;
  this.payment.remainingAmount = total - (this.payment.paidAmount || 0);
  
  return this.amounts;
};

// Method to add history entry
invoiceSchema.methods.addHistory = function(action, description, userId) {
  this.history.push({
    action,
    description,
    userId,
    timestamp: new Date()
  });
};

// Pre-save middleware to calculate totals
invoiceSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isModified('amounts.discount')) {
    this.calculateTotals();
  }
  next();
});

// Static method to generate next invoice number
invoiceSchema.statics.generateNextNumber = async function(userId, type, series) {
  const lastInvoice = await this.findOne({
    userId,
    type,
    series
  }).sort({ number: -1 });
  
  if (!lastInvoice) {
    return '00000001';
  }
  
  const nextNumber = parseInt(lastInvoice.number) + 1;
  return nextNumber.toString().padStart(8, '0');
};

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;