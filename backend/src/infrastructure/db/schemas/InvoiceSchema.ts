import { Schema, Document, Types } from 'mongoose';

export interface IInvoice extends Document {
  _id: string;
  userId: Types.ObjectId;
  type: 'boleta' | 'factura';
  series: string;
  number: number;
  fullNumber: string; // B001-00000123 or F001-00000456
  
  // Client information
  client: {
    documentType: 'DNI' | 'RUC' | 'CE' | 'PASSPORT';
    documentNumber: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };

  // Invoice details
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    subtotal: number;
    igv: number;
    total: number;
    unitMeasure?: string;
    productCode?: string;
  }>;

  // Amounts
  amounts: {
    subtotal: number;     // Base imponible
    igv: number;         // IGV (18%)
    isc?: number;        // Impuesto selectivo al consumo
    otherTaxes?: number; // Otros impuestos
    discount?: number;   // Descuentos
    total: number;       // Total final
  };

  // Tax information
  taxes: {
    igvRate: number;     // 18% typically
    iscRate?: number;
    exemptAmount?: number;
    taxableAmount: number;
  };

  // Payment information
  payment: {
    method: 'cash' | 'card' | 'transfer' | 'check' | 'yape' | 'plin' | 'other';
    currency: 'PEN' | 'USD';
    exchangeRate?: number;
    installments?: Array<{
      amount: number;
      dueDate: Date;
      status: 'pending' | 'paid' | 'overdue';
    }>;
  };

  // SUNAT information
  sunat: {
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'cancelled';
    cdr?: string;        // Constancia de recepción
    hash?: string;       // Hash del comprobante
    qrCode?: string;     // QR code data
    xmlPath?: string;    // Path to XML file
    pdfPath?: string;    // Path to PDF file
    errorMessage?: string;
    sentAt?: Date;
    acceptedAt?: Date;
    rejectedAt?: Date;
  };

  // File attachments
  attachments: Array<{
    fileName: string;
    originalName: string;
    path: string;
    mimeType: string;
    size: number;
    uploadedAt: Date;
  }>;

  // OCR data (if scanned)
  ocrData?: {
    extractedText: string;
    confidence: number;
    processedAt: Date;
    correctionsMade: Array<{
      field: string;
      originalValue: string;
      correctedValue: string;
    }>;
  };

  // Metadata
  metadata: {
    source: 'manual' | 'upload' | 'scan' | 'api';
    ipAddress?: string;
    userAgent?: string;
    location?: {
      lat: number;
      lng: number;
    };
  };

  // Dates
  issueDate: Date;
  dueDate?: Date;
  
  // Status
  status: 'active' | 'cancelled' | 'voided';
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export const InvoiceSchema = new Schema<IInvoice>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['boleta', 'factura'],
    required: true,
  },
  series: {
    type: String,
    required: true,
    match: [/^[BF]\d{3}$/, 'Series must be B001 or F001 format'],
  },
  number: {
    type: Number,
    required: true,
    min: 1,
  },
  fullNumber: {
    type: String,
    required: true,
    unique: true,
  },
  client: {
    documentType: {
      type: String,
      enum: ['DNI', 'RUC', 'CE', 'PASSPORT'],
      required: true,
    },
    documentNumber: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: { type: String },
    address: { type: String },
  },
  items: [{
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0.01 },
    unitPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    subtotal: { type: Number, required: true },
    igv: { type: Number, required: true },
    total: { type: Number, required: true },
    unitMeasure: { type: String, default: 'NIU' },
    productCode: { type: String },
  }],
  amounts: {
    subtotal: { type: Number, required: true, min: 0 },
    igv: { type: Number, required: true, min: 0 },
    isc: { type: Number, default: 0 },
    otherTaxes: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  taxes: {
    igvRate: { type: Number, default: 18 },
    iscRate: { type: Number, default: 0 },
    exemptAmount: { type: Number, default: 0 },
    taxableAmount: { type: Number, required: true },
  },
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'transfer', 'check', 'yape', 'plin', 'other'],
      default: 'cash',
    },
    currency: {
      type: String,
      enum: ['PEN', 'USD'],
      default: 'PEN',
    },
    exchangeRate: { type: Number, default: 1 },
    installments: [{
      amount: { type: Number, required: true },
      dueDate: { type: Date, required: true },
      status: {
        type: String,
        enum: ['pending', 'paid', 'overdue'],
        default: 'pending',
      },
    }],
  },
  sunat: {
    status: {
      type: String,
      enum: ['draft', 'sent', 'accepted', 'rejected', 'cancelled'],
      default: 'draft',
    },
    cdr: { type: String },
    hash: { type: String },
    qrCode: { type: String },
    xmlPath: { type: String },
    pdfPath: { type: String },
    errorMessage: { type: String },
    sentAt: { type: Date },
    acceptedAt: { type: Date },
    rejectedAt: { type: Date },
  },
  attachments: [{
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
  }],
  ocrData: {
    extractedText: { type: String },
    confidence: { type: Number, min: 0, max: 100 },
    processedAt: { type: Date },
    correctionsMade: [{
      field: { type: String },
      originalValue: { type: String },
      correctedValue: { type: String },
    }],
  },
  metadata: {
    source: {
      type: String,
      enum: ['manual', 'upload', 'scan', 'api'],
      required: true,
    },
    ipAddress: { type: String },
    userAgent: { type: String },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  issueDate: { type: Date, required: true },
  dueDate: { type: Date },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'voided'],
    default: 'active',
  },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
  collection: 'invoices',
});

// Indexes for performance
InvoiceSchema.index({ userId: 1, type: 1 });
InvoiceSchema.index({ fullNumber: 1 });
InvoiceSchema.index({ issueDate: -1 });
InvoiceSchema.index({ 'client.documentNumber': 1 });
InvoiceSchema.index({ 'sunat.status': 1 });
InvoiceSchema.index({ status: 1, isActive: 1 });
InvoiceSchema.index({ userId: 1, issueDate: -1 });

// Compound index for efficient queries
InvoiceSchema.index({
  userId: 1,
  type: 1,
  issueDate: -1,
});

// Pre-save middleware to generate fullNumber
InvoiceSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('series') || this.isModified('number')) {
    this.fullNumber = `${this.series}-${this.number.toString().padStart(8, '0')}`;
  }
  next();
});

// Virtual for formatted amount
InvoiceSchema.virtual('formattedTotal').get(function(this: IInvoice) {
  return `${this.payment.currency} ${this.amounts.total.toFixed(2)}`;
});

// Virtual for age in days
InvoiceSchema.virtual('ageInDays').get(function(this: IInvoice) {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - this.issueDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
InvoiceSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});