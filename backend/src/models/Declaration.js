import mongoose from 'mongoose';

const declarationSchema = new mongoose.Schema({
  // User and Period
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  period: {
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true,
      min: 2020
    },
    type: {
      type: String,
      enum: ['monthly', 'annual'],
      default: 'monthly'
    }
  },
  
  // Tax Regime Information
  regime: {
    type: {
      type: String,
      enum: ['RUS', 'RER', 'RG'],
      required: true
    },
    category: String // For RUS: categories A-H, for RER: categories 1-2
  },
  
  // Sales Information
  sales: {
    taxable: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    exempt: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    // IGV paid on purchases
    igvPaid: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // Purchases Information
  purchases: {
    total: {
      type: Number,
      default: 0,
      min: 0
    },
    igvPaid: {
      type: Number,
      default: 0,
      min: 0
    },
    withoutCredit: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // Tax Calculations
  taxes: {
    igv: {
      collected: {
        type: Number,
        default: 0,
        min: 0
      },
      paid: {
        type: Number,
        default: 0,
        min: 0
      },
      balance: {
        type: Number,
        default: 0
      }
    },
    rent: {
      base: {
        type: Number,
        default: 0,
        min: 0
      },
      rate: {
        type: Number,
        default: 1.5 // Default 1.5% for RER
      },
      amount: {
        type: Number,
        default: 0,
        min: 0
      },
      withheld: {
        type: Number,
        default: 0,
        min: 0
      },
      balance: {
        type: Number,
        default: 0
      }
    },
    // For RUS fixed payment
    fixedPayment: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // Payment Information
  payment: {
    totalToPay: {
      type: Number,
      required: true,
      min: 0
    },
    method: {
      type: String,
      enum: ['online', 'transfer', 'cash', 'check'],
      default: 'online'
    },
    paidAt: Date,
    reference: String,
    penalty: {
      type: Number,
      default: 0,
      min: 0
    },
    interest: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // SUNAT Integration
  sunat: {
    status: {
      type: String,
      enum: ['pending', 'sent', 'accepted', 'rejected', 'rectified'],
      default: 'pending'
    },
    formType: {
      type: String,
      enum: ['PDT621', 'PDT625', 'VIRTUAL'], // RER, RG, RUS
      required: true
    },
    presentationNumber: String,
    responseCode: String,
    responseDescription: String,
    sentAt: Date,
    responseAt: Date,
    dueDate: {
      type: Date,
      required: true
    }
  },
  
  // Document Status
  status: {
    type: String,
    enum: ['draft', 'completed', 'sent', 'rectified', 'cancelled'],
    default: 'draft'
  },
  
  // Rectification Information
  rectification: {
    originalDeclarationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Declaration'
    },
    reason: String,
    rectifiedAt: Date
  },
  
  // Calculation Details
  calculations: {
    // Detailed breakdown for auditing
    salesByDocument: [{
      documentType: String,
      count: Number,
      amount: Number
    }],
    purchasesByDocument: [{
      documentType: String,
      count: Number,
      amount: Number,
      igv: Number
    }],
    // Monthly accumulations
    accumulated: {
      sales: Number,
      purchases: Number,
      igvPaid: Number,
      rentPaid: Number
    }
  },
  
  // Files and Documents
  files: {
    pdt: String, // PDT file for download
    receipt: String, // Payment receipt
    supporting: [String] // Supporting documents
  },
  
  // Metadata
  notes: String,
  tags: [String],
  
  // Audit Trail
  history: [{
    action: {
      type: String,
      enum: ['created', 'calculated', 'sent', 'paid', 'rectified', 'cancelled']
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

// Compound indexes
declarationSchema.index({ userId: 1, 'period.year': -1, 'period.month': -1 });
declarationSchema.index({ userId: 1, status: 1 });
declarationSchema.index({ userId: 1, 'sunat.status': 1 });
declarationSchema.index({ 'sunat.dueDate': 1, status: 1 });

// Unique constraint for period per user
declarationSchema.index(
  { userId: 1, 'period.year': 1, 'period.month': 1, 'period.type': 1 }, 
  { unique: true }
);

// Virtual for period display
declarationSchema.virtual('periodDisplay').get(function() {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return `${months[this.period.month - 1]} ${this.period.year}`;
});

// Method to calculate taxes based on regime
declarationSchema.methods.calculateTaxes = function() {
  const { regime, sales, purchases } = this;
  
  switch (regime.type) {
    case 'RUS':
      // Fixed payment based on category
      const rusRates = {
        'A': 20, 'B': 50, 'C': 200, 'D': 400, 
        'E': 600, 'F': 600, 'G': 600, 'H': 600
      };
      this.taxes.fixedPayment = rusRates[regime.category] || 20;
      this.payment.totalToPay = this.taxes.fixedPayment;
      break;
      
    case 'RER':
      // 1.5% on income
      this.taxes.rent.base = sales.total;
      this.taxes.rent.rate = 1.5;
      this.taxes.rent.amount = sales.total * 0.015;
      this.taxes.rent.balance = this.taxes.rent.amount - this.taxes.rent.withheld;
      this.payment.totalToPay = this.taxes.rent.balance;
      break;
      
    case 'RG':
      // IGV and Income tax
      this.taxes.igv.collected = sales.taxable * 0.18;
      this.taxes.igv.paid = purchases.igvPaid || 0;
      this.taxes.igv.balance = this.taxes.igv.collected - this.taxes.igv.paid;
      
      // Income tax (simplified: 1.5% for services, 3% for commerce)
      const rentRate = regime.category === 'services' ? 0.015 : 0.03;
      this.taxes.rent.base = sales.total;
      this.taxes.rent.rate = rentRate * 100;
      this.taxes.rent.amount = sales.total * rentRate;
      this.taxes.rent.balance = this.taxes.rent.amount - this.taxes.rent.withheld;
      
      this.payment.totalToPay = this.taxes.igv.balance + this.taxes.rent.balance;
      break;
  }
  
  return this.taxes;
};

// Method to generate due date
declarationSchema.methods.generateDueDate = function() {
  // Generally 12th of following month
  const dueDate = new Date(this.period.year, this.period.month, 12);
  this.sunat.dueDate = dueDate;
  return dueDate;
};

// Method to add history entry
declarationSchema.methods.addHistory = function(action, description, userId) {
  this.history.push({
    action,
    description,
    userId,
    timestamp: new Date()
  });
};

// Pre-save middleware
declarationSchema.pre('save', function(next) {
  if (this.isModified('sales') || this.isModified('purchases')) {
    this.calculateTaxes();
  }
  
  if (this.isNew && !this.sunat.dueDate) {
    this.generateDueDate();
  }
  
  next();
});

// Static method to get current period
declarationSchema.statics.getCurrentPeriod = function() {
  const now = new Date();
  return {
    month: now.getMonth(), // Previous month
    year: now.getFullYear(),
    type: 'monthly'
  };
};

const Declaration = mongoose.model('Declaration', declarationSchema);

export default Declaration;