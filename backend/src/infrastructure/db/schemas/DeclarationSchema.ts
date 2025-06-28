import { Schema, Document, Types } from 'mongoose';

export interface IDeclaration extends Document {
  _id: string;
  userId: Types.ObjectId;
  
  // Declaration period
  period: {
    month: number;        // 1-12
    year: number;
    type: 'monthly' | 'quarterly' | 'annual';
    dueDate: Date;
  };

  // Tax regime
  regime: {
    type: 'RUS' | 'RER' | 'RG';
    category?: string;    // For RUS
  };

  // Sales and purchases summary
  sales: {
    taxable: number;      // Ventas gravadas
    exempt: number;       // Ventas exoneradas
    export: number;       // Exportaciones
    total: number;        // Total ventas
    igvCollected: number; // IGV cobrado
  };

  purchases: {
    taxable: number;      // Compras gravadas
    exempt: number;       // Compras exoneradas
    total: number;        // Total compras
    igvPaid: number;      // IGV pagado
  };

  // Tax calculations
  taxes: {
    igv: {
      collected: number;
      paid: number;
      balance: number;    // To pay or credit
    };
    rent: {
      base: number;       // Base imponible
      rate: number;       // Tax rate %
      amount: number;     // Amount to pay
      withheld: number;   // Retenciones
      balance: number;    // Final amount
    };
    essalud?: {
      base: number;
      rate: number;
      amount: number;
    };
    sctr?: {
      base: number;
      rate: number;
      amount: number;
    };
  };

  // Payment information
  payment: {
    totalToPay: number;
    method: 'yape' | 'transfer' | 'online' | 'bank' | 'other';
    installments?: Array<{
      amount: number;
      dueDate: Date;
      status: 'pending' | 'paid' | 'overdue';
      reference?: string;
    }>;
    paidAt?: Date;
    reference?: string;
  };

  // SUNAT submission
  sunat: {
    status: 'draft' | 'submitted' | 'accepted' | 'rejected' | 'rectified';
    formType: string;     // PDT form number
    presentationNumber?: string;
    submittedAt?: Date;
    acceptedAt?: Date;
    rejectedAt?: Date;
    errorMessage?: string;
    rectificationOf?: Types.ObjectId; // If this is a rectification
  };

  // Supporting documents
  documents: {
    invoices: Types.ObjectId[];     // Related invoices
    receipts: Types.ObjectId[];     // Payment receipts
    attachments: Array<{
      fileName: string;
      originalName: string;
      path: string;
      type: 'pdf' | 'excel' | 'image' | 'other';
      uploadedAt: Date;
    }>;
  };

  // Inconsistencies and corrections
  inconsistencies: Array<{
    type: 'missing_invoice' | 'amount_mismatch' | 'date_error' | 'tax_calculation' | 'other';
    description: string;
    severity: 'low' | 'medium' | 'high';
    resolved: boolean;
    resolvedAt?: Date;
    solution?: string;
  }>;

  // Metadata
  metadata: {
    source: 'manual' | 'automatic' | 'imported';
    calculatedAt: Date;
    lastCalculation?: Date;
    version: number;      // For tracking changes
  };

  // Status
  status: 'draft' | 'calculated' | 'submitted' | 'paid' | 'completed';
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export const DeclarationSchema = new Schema<IDeclaration>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  period: {
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2020 },
    type: {
      type: String,
      enum: ['monthly', 'quarterly', 'annual'],
      default: 'monthly',
    },
    dueDate: { type: Date, required: true },
  },
  regime: {
    type: {
      type: String,
      enum: ['RUS', 'RER', 'RG'],
      required: true,
    },
    category: { type: String },
  },
  sales: {
    taxable: { type: Number, default: 0, min: 0 },
    exempt: { type: Number, default: 0, min: 0 },
    export: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    igvCollected: { type: Number, default: 0, min: 0 },
  },
  purchases: {
    taxable: { type: Number, default: 0, min: 0 },
    exempt: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    igvPaid: { type: Number, default: 0, min: 0 },
  },
  taxes: {
    igv: {
      collected: { type: Number, default: 0 },
      paid: { type: Number, default: 0 },
      balance: { type: Number, default: 0 },
    },
    rent: {
      base: { type: Number, default: 0 },
      rate: { type: Number, default: 0 },
      amount: { type: Number, default: 0 },
      withheld: { type: Number, default: 0 },
      balance: { type: Number, default: 0 },
    },
    essalud: {
      base: { type: Number, default: 0 },
      rate: { type: Number, default: 9 },
      amount: { type: Number, default: 0 },
    },
    sctr: {
      base: { type: Number, default: 0 },
      rate: { type: Number, default: 0 },
      amount: { type: Number, default: 0 },
    },
  },
  payment: {
    totalToPay: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ['yape', 'transfer', 'online', 'bank', 'other'],
      default: 'online',
    },
    installments: [{
      amount: { type: Number, required: true },
      dueDate: { type: Date, required: true },
      status: {
        type: String,
        enum: ['pending', 'paid', 'overdue'],
        default: 'pending',
      },
      reference: { type: String },
    }],
    paidAt: { type: Date },
    reference: { type: String },
  },
  sunat: {
    status: {
      type: String,
      enum: ['draft', 'submitted', 'accepted', 'rejected', 'rectified'],
      default: 'draft',
    },
    formType: { type: String, required: true },
    presentationNumber: { type: String },
    submittedAt: { type: Date },
    acceptedAt: { type: Date },
    rejectedAt: { type: Date },
    errorMessage: { type: String },
    rectificationOf: { type: Schema.Types.ObjectId, ref: 'Declaration' },
  },
  documents: {
    invoices: [{ type: Schema.Types.ObjectId, ref: 'Invoice' }],
    receipts: [{ type: Schema.Types.ObjectId }],
    attachments: [{
      fileName: { type: String, required: true },
      originalName: { type: String, required: true },
      path: { type: String, required: true },
      type: {
        type: String,
        enum: ['pdf', 'excel', 'image', 'other'],
        required: true,
      },
      uploadedAt: { type: Date, default: Date.now },
    }],
  },
  inconsistencies: [{
    type: {
      type: String,
      enum: ['missing_invoice', 'amount_mismatch', 'date_error', 'tax_calculation', 'other'],
      required: true,
    },
    description: { type: String, required: true },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date },
    solution: { type: String },
  }],
  metadata: {
    source: {
      type: String,
      enum: ['manual', 'automatic', 'imported'],
      default: 'automatic',
    },
    calculatedAt: { type: Date, required: true },
    lastCalculation: { type: Date },
    version: { type: Number, default: 1 },
  },
  status: {
    type: String,
    enum: ['draft', 'calculated', 'submitted', 'paid', 'completed'],
    default: 'draft',
  },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
  collection: 'declarations',
});

// Indexes for performance
DeclarationSchema.index({ userId: 1, 'period.year': -1, 'period.month': -1 });
DeclarationSchema.index({ 'period.dueDate': 1 });
DeclarationSchema.index({ status: 1 });
DeclarationSchema.index({ 'sunat.status': 1 });
DeclarationSchema.index({ userId: 1, status: 1 });

// Unique constraint for user + period
DeclarationSchema.index({
  userId: 1,
  'period.year': 1,
  'period.month': 1,
  'regime.type': 1
}, { unique: true });

// Virtual for period string
DeclarationSchema.virtual('periodString').get(function(this: IDeclaration) {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return `${months[this.period.month - 1]} ${this.period.year}`;
});

// Virtual for days until due
DeclarationSchema.virtual('daysUntilDue').get(function(this: IDeclaration) {
  const now = new Date();
  const diffTime = this.period.dueDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
DeclarationSchema.virtual('isOverdue').get(function(this: IDeclaration) {
  return new Date() > this.period.dueDate && this.status !== 'completed';
});

// Ensure virtual fields are serialized
DeclarationSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});