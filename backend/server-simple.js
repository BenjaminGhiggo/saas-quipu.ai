import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;

// Ensure uploads directories exist
const uploadsDir = path.join(process.cwd(), 'uploads');
const requiredDirs = ['invoices', 'declarations', 'temp'];

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  requiredDirs.forEach(dir => {
    const dirPath = path.join(uploadsDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
  
  console.log('✅ Upload directories verified/created');
} catch (error) {
  console.warn('⚠️ Warning creating upload directories:', error.message);
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI("AIzaSyAsaDK2MGpqu9XzLQgsOMmn3m74DaZJDwE");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Kappi AI Context - Complete information about Quipu.ai services and modules
const KAPPI_CONTEXT = `
Eres Kappi, el asistente contable inteligente de Quipu.ai. Tu personalidad es amigable, profesional y experta en temas contables y tributarios de Perú.

INFORMACIÓN SOBRE QUIPU.AI:

MÓDULOS Y SERVICIOS PRINCIPALES:
1. **Gestión de Facturas y Boletas** - Crear, editar, enviar a SUNAT facturas electrónicas y boletas de venta
2. **Declaraciones Tributarias** - Cálculo automático y presentación de declaraciones mensuales de IGV-Renta
3. **Métricas y Reportes** - Dashboard con métricas de ventas, impuestos pagados, compliance tributario
4. **Alertas y Notificaciones** - Recordatorios de vencimientos, pagos pendientes, tareas contables
5. **Chat Inteligente** - Asistencia 24/7 con Kappi (tú mismo) para resolver dudas contables
6. **Gestión de Perfil** - Configuración de empresa, régimen tributario, preferencias
7. **Suscripciones** - Planes Emprende, Crece, Escala para diferentes tipos de negocio
8. **Historial Contable** - Registro completo de todas las operaciones y documentos
9. **Integración SUNAT** - Conexión directa con sistemas SUNAT para validación y envío

FUNCIONALIDADES ESPECÍFICAS:
- Cálculo automático de IGV (18%)
- Cálculo de Impuesto a la Renta según régimen (RER 1.5%, RG 1.5-3%)
- Generación automática de PDT 621 (RER) y PDT 621 (RG)
- Validación de RUC y datos SUNAT
- Recordatorios automáticos de vencimientos
- Análisis de compliance tributario
- Reportes de ventas mensuales/anuales
- Backup automático de documentos

REGÍMENES TRIBUTARIOS SOPORTADOS:
- RER (Régimen Especial de Renta): Para ingresos hasta S/ 525,000 anuales
- RG (Régimen General): Para empresas de cualquier tamaño
- NRUS (Nuevo RUS): Para pequeños negocios (hasta S/ 96,000 anuales)

TIPOS DE DOCUMENTOS:
- Facturas electrónicas (serie F)
- Boletas de venta electrónicas (serie B)
- Notas de crédito y débito
- Guías de remisión
- Recibos por honorarios

USUARIOS TÍPICOS:
- Emprendedores peruanos
- Pequeñas y medianas empresas
- Profesionales independientes
- Contadores y estudios contables

INSTRUCCIONES PARA KAPPI:
- Siempre responde en español peruano
- Usa ejemplos con montos en soles (S/)
- Menciona fechas de vencimiento relevantes (generalmente día 12 del mes siguiente)
- Sugiere acciones concretas dentro de la plataforma
- Sé proactivo sugiriendo funcionalidades que puedan ayudar
- Mantén un tono profesional pero cercano
- Si no estás seguro de algo específico, sugiere consultar con un contador
`;

// Function to generate AI response
async function generateAIResponse(userMessage) {
  try {
    const prompt = `${KAPPI_CONTEXT}

Usuario pregunta: "${userMessage}"

Responde como Kappi, el asistente contable de Quipu.ai. Sé específico, útil y menciona funcionalidades relevantes de la plataforma cuando sea apropiado.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "¡Hola! Soy Kappi, tu asistente contable. Disculpa, estoy teniendo problemas técnicos en este momento. Por favor intenta de nuevo en un momento o revisa las funcionalidades principales de Quipu.ai en el menú.";
  }
}

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
    'http://167.86.90.102:7000',
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

// AI-powered Chat API with Gemini
app.post('/api/chat/message', async (req, res) => {
  const { message } = req.body;
  
  if (!message || message.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Message is required',
      timestamp: new Date().toISOString()
    });
  }

  try {
    // Generate AI response using Gemini
    const aiResponse = await generateAIResponse(message);
    
    // Simulate typing delay for better UX
    setTimeout(() => {
      res.json({
        success: true,
        data: {
          id: Date.now().toString(),
          content: aiResponse,
          sender: 'kappi',
          timestamp: new Date().toISOString(),
          suggestions: [
            "¿Cuándo vence mi declaración?",
            "¿Cómo calculo el IGV?",
            "Ver mis métricas",
            "¿Qué documentos necesito?",
            "Ayuda con facturas"
          ]
        },
        timestamp: new Date().toISOString(),
      });
    }, 1000 + Math.random() * 2000); // 1-3 second delay
    
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing your message',
      timestamp: new Date().toISOString()
    });
  }
});

// Mock Invoices API
app.post('/api/invoices', (req, res) => {
  const { type, client, items, amounts, status, sunat } = req.body;
  
  // Validate required fields
  if (!type || !client || !items || !amounts) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: type, client, items, amounts',
      timestamp: new Date().toISOString()
    });
  }

  // Validate client data
  if (!client.documentNumber || !client.name) {
    return res.status(400).json({
      success: false,
      message: 'Client documentNumber and name are required',
      timestamp: new Date().toISOString()
    });
  }

  // Validate items
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'At least one item is required',
      timestamp: new Date().toISOString()
    });
  }

  // Generate invoice number
  const series = type === 'factura' ? 'F001' : 'B001';
  const number = String(Date.now()).padStart(8, '0');
  const invoiceId = `${type.toUpperCase()}-${Date.now()}`;

  // Create invoice object
  const newInvoice = {
    id: invoiceId,
    type,
    series,
    number,
    date: new Date().toISOString().split('T')[0],
    client: {
      documentType: client.documentType,
      documentNumber: client.documentNumber,
      name: client.name,
      address: client.address || '',
      email: client.email || ''
    },
    items: items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total
    })),
    amounts: {
      subtotal: amounts.subtotal,
      igv: amounts.igv,
      total: amounts.total
    },
    status: status || 'draft',
    sunatStatus: sunat?.status || 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Simulate processing delay
  setTimeout(() => {
    res.json({
      success: true,
      data: newInvoice,
      message: `${type === 'factura' ? 'Factura' : 'Boleta'} ${status === 'draft' ? 'guardada como borrador' : 'creada y enviada'} exitosamente`,
      timestamp: new Date().toISOString()
    });
  }, 1000 + Math.random() * 1000); // 1-2 second delay
});

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

// Mock Auth Profile API (alias for compatibility)
app.get('/api/auth/profile', (req, res) => {
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Quipu.ai Backend running on http://0.0.0.0:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  console.log(`🎯 Ready for frontend connection!`);
});