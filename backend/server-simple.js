import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5000', 
    'http://127.0.0.1:5000', 
    'http://localhost:3000', 
    'http://127.0.0.1:3000', 
    'http://localhost:3002', 
    'http://127.0.0.1:3002',
    // VPS URLs
    'http://167.86.90.102:5000',
    'http://167.86.90.102:5001',
    'http://167.86.90.102:3000',
    'http://167.86.90.102:3001',
    // Ngrok URLs
    'https://27b0-201-218-159-83.ngrok-free.app',
    /^https:\/\/.*\.ngrok\.io$/,
    /^https:\/\/.*\.ngrok-free\.app$/
  ],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Quipu.ai Backend is running!'
  });
});

// Mock Auth Routes
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Mock authentication
  if (email === 'demo@quipu.ai' && password === 'password') {
    res.json({
      success: true,
      data: {
        user: {
          id: '1',
          email: 'demo@quipu.ai',
          firstName: 'Demo',
          lastName: 'User',
          fullName: 'Demo User',
          ruc: '12345678901',
          businessName: 'Demo Business',
          subscription: {
            planType: 'emprende',
            status: 'active',
            startDate: new Date().toISOString(),
          },
          profile: {
            taxRegime: 'RER',
            businessType: 'Servicios',
          },
          preferences: {
            language: 'es',
            timezone: 'America/Lima',
            theme: 'light',
            notifications: {
              email: true,
              sms: false,
              push: true,
            },
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: 'mock-jwt-token-' + Date.now(),
      },
      message: 'Login successful',
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials',
      timestamp: new Date().toISOString(),
    });
  }
});

// Mock SUNAT Login
app.post('/api/auth/login/sunat', async (req, res) => {
  const { ruc, username, password } = req.body;
  
  // Simulate delay
  setTimeout(() => {
    if (ruc === '12345678901' && username === 'DEMO123' && password === 'demo123') {
      res.json({
        success: true,
        data: {
          user: {
            id: '2',
            email: `${ruc}@sunat.mock`,
            firstName: 'Usuario',
            lastName: 'SUNAT',
            fullName: 'Usuario SUNAT',
            ruc,
            businessName: 'Empresa Demo SUNAT',
            subscription: {
              planType: 'emprende',
              status: 'active',
              startDate: new Date().toISOString(),
            },
            profile: {
              taxRegime: 'RG',
              businessType: 'Comercio',
            },
            preferences: {
              language: 'es',
              timezone: 'America/Lima',
              theme: 'light',
              notifications: { email: true, sms: false, push: true },
            },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          token: 'mock-sunat-jwt-token-' + Date.now(),
        },
        message: 'SUNAT login successful',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid SUNAT credentials',
        timestamp: new Date().toISOString(),
      });
    }
  }, 1500); // 1.5 second delay to simulate SUNAT
});

// Mock Chat API
app.post('/api/chat/message', (req, res) => {
  const { message } = req.body;
  
  const responses = {
    "¿cuánto debo declarar este mes?": "Según tus registros, debes declarar S/ 2,422.89 este mes. Esto incluye IGV por S/ 540 y renta por S/ 150.",
    "¿qué impuestos me tocan?": "Como empresa RER, te corresponden: IGV mensual (18%), Renta mensual (1.5% de ingresos netos), y EsSalud si tienes trabajadores.",
    "¿cuánto llevo declarando?": "Has declarado un total de S/ 15,847.32 en lo que va del año 2024.",
    "ayuda": "¡Hola! Soy Kappi, tu asistente contable. Puedo ayudarte con declaraciones, cálculos de impuestos, dudas sobre SUNAT y más. ¿En qué te ayudo hoy?"
  };

  const normalizedMessage = message.toLowerCase().trim();
  const response = responses[normalizedMessage] || responses["ayuda"];

  setTimeout(() => {
    res.json({
      success: true,
      data: {
        id: Date.now().toString(),
        content: response,
        sender: 'kappi',
        timestamp: new Date().toISOString(),
        suggestions: Math.random() > 0.7 ? [
          "¿Cuándo vence mi declaración?",
          "¿Cómo calculo el IGV?",
          "Ver mis métricas"
        ] : undefined
      },
      timestamp: new Date().toISOString(),
    });
  }, 1000 + Math.random() * 2000); // 1-3 second delay
});

// Mock Invoices API
app.get('/api/invoices', (req, res) => {
  const mockInvoices = [
    {
      id: 'INV-001',
      type: 'factura',
      series: 'F001',
      number: '00000123',
      date: '2024-06-25',
      client: {
        documentType: 'RUC',
        documentNumber: '20123456789',
        name: 'Empresa Demo SAC',
        address: 'Av. Lima 123, Lima, Perú'
      },
      items: [
        { description: 'Servicio de consultoría', quantity: 1, unitPrice: 1000.00, total: 1000.00 }
      ],
      amounts: {
        subtotal: 1000.00,
        igv: 180.00,
        total: 1180.00
      },
      status: 'sent',
      sunatStatus: 'accepted',
      createdAt: new Date().toISOString()
    },
    {
      id: 'BOL-002',
      type: 'boleta',
      series: 'B001',
      number: '00000456',
      date: '2024-06-26',
      client: {
        documentType: 'DNI',
        documentNumber: '12345678',
        name: 'Juan Pérez García'
      },
      items: [
        { description: 'Producto demo', quantity: 2, unitPrice: 50.00, total: 100.00 }
      ],
      amounts: {
        subtotal: 100.00,
        igv: 18.00,
        total: 118.00
      },
      status: 'draft',
      sunatStatus: 'pending',
      createdAt: new Date().toISOString()
    }
  ];

  res.json({
    success: true,
    data: mockInvoices,
    meta: { total: mockInvoices.length, page: 1, limit: 10 },
    timestamp: new Date().toISOString()
  });
});

// Mock Declarations API
app.get('/api/declarations', (req, res) => {
  const mockDeclarations = [
    {
      id: 'DECL-2024-06',
      period: { month: 6, year: 2024, type: 'monthly' },
      regime: { type: 'RER', category: 'A' },
      sales: { taxable: 5000.00, exempt: 0, total: 5000.00, igvPaid: 0 },
      taxes: {
        igv: { collected: 900.00, paid: 360.00, balance: 540.00 },
        rent: { base: 5000.00, rate: 1.5, amount: 75.00, withheld: 0, balance: 75.00 }
      },
      payment: { totalToPay: 615.00, method: 'online', paidAt: '2024-06-15T10:30:00Z' },
      sunat: { status: 'accepted', formType: 'PDT621', presentationNumber: 'PDT202406001' },
      status: 'completed',
      createdAt: '2024-06-01T00:00:00Z',
      updatedAt: '2024-06-15T10:30:00Z'
    },
    {
      id: 'DECL-2024-05',
      period: { month: 5, year: 2024, type: 'monthly' },
      regime: { type: 'RER', category: 'A' },
      sales: { taxable: 4500.00, exempt: 0, total: 4500.00, igvPaid: 0 },
      taxes: {
        igv: { collected: 810.00, paid: 324.00, balance: 486.00 },
        rent: { base: 4500.00, rate: 1.5, amount: 67.50, withheld: 0, balance: 67.50 }
      },
      payment: { totalToPay: 553.50, method: 'transfer', paidAt: '2024-05-18T14:20:00Z' },
      sunat: { status: 'accepted', formType: 'PDT621', presentationNumber: 'PDT202405001' },
      status: 'completed',
      createdAt: '2024-05-01T00:00:00Z',
      updatedAt: '2024-05-18T14:20:00Z'
    }
  ];

  res.json({
    success: true,
    data: mockDeclarations,
    meta: { total: mockDeclarations.length, page: 1, limit: 10 },
    timestamp: new Date().toISOString()
  });
});

// Mock Metrics API
app.get('/api/metrics', (req, res) => {
  const mockMetrics = {
    overview: {
      totalSales: 15847.32,
      totalTaxes: 2371.15,
      pendingDeclarations: 1,
      thisMonth: {
        sales: 5000.00,
        taxes: 615.00,
        invoices: 15
      }
    },
    salesByMonth: [
      { month: 'Ene', sales: 3200.00, taxes: 480.00 },
      { month: 'Feb', sales: 2800.00, taxes: 420.00 },
      { month: 'Mar', sales: 4100.00, taxes: 615.00 },
      { month: 'Abr', sales: 3500.00, taxes: 525.00 },
      { month: 'May', sales: 4500.00, taxes: 675.00 },
      { month: 'Jun', sales: 5000.00, taxes: 750.00 }
    ],
    taxBreakdown: {
      igv: { total: 1890.00, percentage: 75 },
      rent: { total: 481.15, percentage: 25 }
    },
    complianceStatus: {
      declarations: { onTime: 5, late: 0, pending: 1 },
      payments: { onTime: 5, late: 0, pending: 1 }
    }
  };

  res.json({
    success: true,
    data: mockMetrics,
    timestamp: new Date().toISOString()
  });
});

// Mock Notifications/Alerts API
app.get('/api/alerts', (req, res) => {
  const mockAlerts = [
    {
      id: 'ALERT-001',
      type: 'tax_deadline',
      priority: 'high',
      title: 'Declaración de IGV-Renta vence mañana',
      message: 'Tu declaración mensual de IGV-Renta del período junio 2024 vence el 12 de julio.',
      dueDate: '2024-07-12T23:59:59Z',
      status: 'active',
      createdAt: '2024-07-10T09:00:00Z'
    },
    {
      id: 'ALERT-002',
      type: 'invoice_pending',
      priority: 'medium',
      title: 'Tienes 3 boletas por enviar a SUNAT',
      message: 'Hay 3 boletas en estado borrador que necesitan ser enviadas a SUNAT.',
      status: 'active',
      createdAt: '2024-07-09T15:30:00Z'
    },
    {
      id: 'ALERT-003',
      type: 'payment_reminder',
      priority: 'low',
      title: 'Recordatorio: Pago programado',
      message: 'Tienes un pago programado de S/ 615.00 para el 15 de julio.',
      dueDate: '2024-07-15T10:00:00Z',
      status: 'active',
      createdAt: '2024-07-08T12:00:00Z'
    }
  ];

  res.json({
    success: true,
    data: mockAlerts,
    meta: { total: mockAlerts.length, unread: 2 },
    timestamp: new Date().toISOString()
  });
});

// Mock User Profile API
app.get('/api/user/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token required',
      timestamp: new Date().toISOString()
    });
  }

  const mockProfile = {
    id: '1',
    email: 'demo@quipu.ai',
    firstName: 'Demo',
    lastName: 'User',
    fullName: 'Demo User',
    ruc: '12345678901',
    businessName: 'Demo Business SAC',
    phone: '+51 999 888 777',
    address: 'Av. Demo 123, Lima, Perú',
    subscription: {
      planType: 'emprende',
      status: 'active',
      startDate: '2024-01-01T00:00:00Z',
      nextBillingDate: '2024-08-01T00:00:00Z'
    },
    profile: {
      taxRegime: 'RER',
      businessType: 'Servicios',
      sector: 'Tecnología'
    },
    preferences: {
      language: 'es',
      timezone: 'America/Lima',
      theme: 'light',
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: mockProfile,
    timestamp: new Date().toISOString()
  });
});

// Catch all route
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Quipu.ai Backend running on http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  console.log(`🎯 Ready for frontend connection!`);
});