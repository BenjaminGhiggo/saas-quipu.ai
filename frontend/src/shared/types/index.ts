// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Auth Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  ruc?: string;
  businessName?: string;
  phone?: string;
  avatar?: string;
  subscription: {
    planType: 'emprende' | 'crece' | 'pro';
    status: 'active' | 'inactive' | 'suspended' | 'cancelled';
    startDate: string;
    endDate?: string;
  };
  profile: {
    taxRegime?: 'RUS' | 'RER' | 'RG';
    businessType?: string;
    industry?: string;
  };
  preferences: {
    language: string;
    timezone: string;
    theme: 'light' | 'dark' | 'system';
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Invoice Types
export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  subtotal: number;
  igv: number;
  total: number;
  unitMeasure?: string;
  productCode?: string;
}

export interface InvoiceClient {
  documentType: 'DNI' | 'RUC' | 'CE' | 'PASSPORT';
  documentNumber: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Invoice {
  id: string;
  userId: string;
  type: 'boleta' | 'factura';
  series: string;
  number: number;
  fullNumber: string;
  client: InvoiceClient;
  items: InvoiceItem[];
  amounts: {
    subtotal: number;
    igv: number;
    isc?: number;
    otherTaxes?: number;
    discount?: number;
    total: number;
  };
  payment: {
    method: 'cash' | 'card' | 'transfer' | 'check' | 'yape' | 'plin' | 'other';
    currency: 'PEN' | 'USD';
    exchangeRate?: number;
  };
  sunat: {
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'cancelled';
    cdr?: string;
    hash?: string;
    qrCode?: string;
    errorMessage?: string;
    sentAt?: string;
    acceptedAt?: string;
    rejectedAt?: string;
  };
  issueDate: string;
  dueDate?: string;
  status: 'active' | 'cancelled' | 'voided';
  createdAt: string;
  updatedAt: string;
}

// Declaration Types
export interface DeclarationPeriod {
  month: number;
  year: number;
  type: 'monthly' | 'quarterly' | 'annual';
  dueDate: string;
}

export interface TaxCalculation {
  igv: {
    collected: number;
    paid: number;
    balance: number;
  };
  rent: {
    base: number;
    rate: number;
    amount: number;
    withheld: number;
    balance: number;
  };
  essalud?: {
    base: number;
    rate: number;
    amount: number;
  };
}

export interface Declaration {
  id: string;
  userId: string;
  period: DeclarationPeriod;
  regime: {
    type: 'RUS' | 'RER' | 'RG';
    category?: string;
  };
  sales: {
    taxable: number;
    exempt: number;
    export: number;
    total: number;
    igvCollected: number;
  };
  purchases: {
    taxable: number;
    exempt: number;
    total: number;
    igvPaid: number;
  };
  taxes: TaxCalculation;
  payment: {
    totalToPay: number;
    method: 'yape' | 'transfer' | 'online' | 'bank' | 'other';
    paidAt?: string;
    reference?: string;
  };
  sunat: {
    status: 'draft' | 'submitted' | 'accepted' | 'rejected' | 'rectified';
    formType: string;
    presentationNumber?: string;
    submittedAt?: string;
    acceptedAt?: string;
    rejectedAt?: string;
    errorMessage?: string;
  };
  status: 'draft' | 'calculated' | 'submitted' | 'paid' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// Subscription Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'emprende' | 'crece' | 'pro';
  price: {
    monthly: number;
    yearly: number;
    currency: 'PEN' | 'USD';
  };
  features: string[];
  limits: {
    invoicesPerMonth?: number;
    declarationsPerMonth?: number;
    storageGB?: number;
    supportLevel: 'basic' | 'priority' | 'premium';
  };
  popular?: boolean;
  description: string;
}

// Alert Types
export interface Alert {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'declaration_due' | 'invoice_due' | 'payment_reminder' | 'system' | 'custom';
  priority: 'low' | 'medium' | 'high';
  triggerDate: string;
  isRead: boolean;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Chat Types
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'kappi';
  timestamp: string;
  type?: 'text' | 'suggestion' | 'action';
  metadata?: {
    suggestions?: string[];
    actionType?: string;
    actionData?: any;
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  title?: string;
  messages: ChatMessage[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Metrics Types
export interface MetricsPeriod {
  label: string;
  value: 'week' | 'month' | 'quarter' | 'year';
}

export interface MetricsData {
  period: MetricsPeriod;
  sales: {
    total: number;
    count: number;
    average: number;
    growth: number; // percentage
  };
  purchases: {
    total: number;
    count: number;
    average: number;
    growth: number;
  };
  taxes: {
    igv: number;
    rent: number;
    total: number;
  };
  charts: {
    salesByMonth: Array<{ month: string; amount: number; }>;
    purchasesByMonth: Array<{ month: string; amount: number; }>;
    taxesByMonth: Array<{ month: string; igv: number; rent: number; }>;
  };
}

// FAQ Types
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpful: number;
  notHelpful: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FAQCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SunatLoginFormData {
  ruc: string;
  username: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  ruc: string;
  businessName: string;
  phone?: string;
  address?: string;
  taxRegime: 'RUS' | 'RER' | 'RG';
  businessType: 'Servicios' | 'Comercio' | 'Manufactura' | 'Construcción' | 'Otros';
  acceptTerms: boolean;
}

// Common Types
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FileUpload {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// SIRE VENTAS Types
export interface SunatCredentials {
  ruc: string;
  usuarioSOL: string;
  claveSOL: string;
  clientId?: string;
  clientSecret?: string;
  isConfigured: boolean;
  lastSync?: string;
}

export interface SireAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  issued_at: string;
}

export interface SireTicket {
  numTicket: string;
  estado: 'En Proceso' | 'Terminado' | 'Error';
  fechaCreacion: string;
  fechaTermino?: string;
  nombreArchivo?: string;
  mensajeError?: string;
}

export interface SirePeriod {
  numEjercicio: string;
  desEstado: string;
  lisPeriodos: Array<{
    perTributario: string;
    codEstado: string;
    desEstado: string;
  }>;
}

export interface SireProposal {
  perTributario: string;
  totalComprobantes: number;
  montoTotal: number;
  comprobantes: Array<{
    codCar: string;
    tipoComprobante: string;
    serie: string;
    numero: string;
    fechaEmision: string;
    documentoCliente: string;
    nombreCliente: string;
    baseImponible: number;
    igv: number;
    total: number;
    moneda: string;
    estado: string;
  }>;
}

export interface SireUploadRequest {
  filename: string;
  filetype: string;
  perTributario: string;
  codOrigenEnvio: '2'; // Servicio web
  codProceso: string;
  codTipoCorrelativo: '01';
  nomArchivoImportacion: string;
  codLibro: '140000'; // RVIE
}

export interface SireProcess {
  id: string;
  tipo: 'propuesta' | 'reemplazo' | 'preliminar' | 'ajuste';
  periodo: string;
  estado: 'iniciado' | 'procesando' | 'completado' | 'error';
  ticket?: string;
  fechaInicio: string;
  fechaFin?: string;
  resultado?: any;
  error?: string;
}

export interface SireValidationError {
  cod: string;
  msg: string;
}

export interface SireApiResponse<T = any> {
  success: boolean;
  data?: T;
  cod?: string;
  msg?: string;
  errors?: SireValidationError[];
  exc?: string;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// State Types
export interface LoadingState {
  [key: string]: boolean;
}

export interface ErrorState {
  [key: string]: string | null;
}