import { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  ruc?: string;
  businessName?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
  sunatCredentials?: {
    ruc: string;
    username: string;
    password: string;
    isConnected: boolean;
    lastConnection?: Date;
  };
  subscription: {
    planType: 'emprende' | 'crece' | 'pro';
    status: 'active' | 'inactive' | 'suspended' | 'cancelled';
    startDate: Date;
    endDate?: Date;
    autoRenew: boolean;
  };
  profile: {
    avatar?: string;
    taxRegime?: 'RUS' | 'RER' | 'RG';
    businessType?: string;
    industry?: string;
  };
  preferences: {
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    theme: 'light' | 'dark' | 'system';
  };
  verification: {
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    isPhoneVerified: boolean;
    phoneVerificationCode?: string;
  };
  security: {
    lastLogin?: Date;
    loginAttempts: number;
    lockUntil?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
  };
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    source?: string;
    referrer?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  ruc: {
    type: String,
    unique: true,
    sparse: true,
    match: [/^\d{11}$/, 'RUC must be 11 digits'],
  },
  businessName: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  phone: {
    type: String,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number'],
  },
  address: {
    street: { type: String, maxlength: 200 },
    city: { type: String, maxlength: 50 },
    region: { type: String, maxlength: 50 },
    postalCode: { type: String, maxlength: 10 },
    country: { type: String, maxlength: 50, default: 'Peru' },
  },
  sunatCredentials: {
    ruc: { type: String, match: [/^\d{11}$/, 'RUC must be 11 digits'] },
    username: { type: String, trim: true },
    password: { type: String }, // Encrypted
    isConnected: { type: Boolean, default: false },
    lastConnection: { type: Date },
  },
  subscription: {
    planType: {
      type: String,
      enum: ['emprende', 'crece', 'pro'],
      default: 'emprende',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'cancelled'],
      default: 'active',
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    autoRenew: { type: Boolean, default: true },
  },
  profile: {
    avatar: { type: String },
    taxRegime: {
      type: String,
      enum: ['RUS', 'RER', 'RG'],
    },
    businessType: { type: String },
    industry: { type: String },
  },
  preferences: {
    language: { type: String, default: 'es' },
    timezone: { type: String, default: 'America/Lima' },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'light',
    },
  },
  verification: {
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    isPhoneVerified: { type: Boolean, default: false },
    phoneVerificationCode: { type: String },
  },
  security: {
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
  },
  metadata: {
    ipAddress: { type: String },
    userAgent: { type: String },
    source: { type: String },
    referrer: { type: String },
  },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
  collection: 'users',
});

// Indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ ruc: 1 });
UserSchema.index({ 'subscription.status': 1 });
UserSchema.index({ 'security.lockUntil': 1 });
UserSchema.index({ createdAt: 1 });
UserSchema.index({ isActive: 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function(this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock check
UserSchema.virtual('isLocked').get(function(this: IUser) {
  return !!(this.security.lockUntil && this.security.lockUntil > new Date());
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.security.passwordResetToken;
    delete ret.security.twoFactorSecret;
    delete ret.sunatCredentials?.password;
    delete ret.__v;
    return ret;
  }
});