import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import database from './config/database.js';
import User from './models/User.js';
import Invoice from './models/Invoice.js';
import Declaration from './models/Declaration.js';
import jwt from 'jsonwebtoken';
import pdfGenerator from './services/pdfGenerator.js';
import { upload, handleUploadError, processUploadedFile } from './middleware/upload.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'quipu-ai-secret-key-2024';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI("AIzaSyAsaDK2MGpqu9XzLQgsOMmn3m74DaZJDwE");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Kappi AI Context
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
7. **Suscripciones** - Planes Emprende, Crece, Pro para diferentes tipos de negocio
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

INSTRUCCIONES PARA KAPPI:
- Siempre responde en español peruano
- Usa ejemplos con montos en soles (S/)
- Menciona fechas de vencimiento relevantes (generalmente día 12 del mes siguiente)
- Sugiere acciones concretas dentro de la plataforma
- Sé proactivo sugiriendo funcionalidades que puedan ayudar
- Mantén un tono profesional pero cercano
- Si no estás seguro de algo específico, sugiere consultar con un contador
`;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5000', 'http://127.0.0.1:5000', 
    'http://localhost:3000', 'http://127.0.0.1:3000', 
    'http://localhost:3002', 'http://127.0.0.1:3002',
    'http://167.86.90.102:5000', 'http://167.86.90.102:7000',
    'http://167.86.90.102:3000', 'http://167.86.90.102:3001',
    'https://27b0-201-218-159-83.ngrok-free.app',
    /^https:\/\/.*\.ngrok\.io$/, /^https:\/\/.*\.ngrok-free\.app$/
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Auth middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or inactive user',
        timestamp: new Date().toISOString()
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
      timestamp: new Date().toISOString()
    });
  }
};

// AI Response Generation
async function generateAIResponse(userMessage, userContext = null) {
  try {
    let contextualPrompt = KAPPI_CONTEXT;
    
    if (userContext) {
      contextualPrompt += `\n\nCONTEXTO DEL USUARIO:
- Nombre: ${userContext.fullName}
- Empresa: ${userContext.businessName}
- RUC: ${userContext.ruc}
- Régimen: ${userContext.profile.taxRegime}
- Tipo de negocio: ${userContext.profile.businessType}
- Plan: ${userContext.subscription.planType}`;
    }

    const prompt = `${contextualPrompt}

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

// Routes

// Health check
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await database.healthCheck();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Quipu.ai Backend is running!',
      database: dbHealth
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
      error: error.message
    });
  }
});

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, ruc, businessName, taxRegime, businessType } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !ruc || !businessName || !taxRegime || !businessType) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { ruc }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'Email already exists' : 'RUC already exists',
        timestamp: new Date().toISOString()
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      ruc,
      businessName,
      profile: {
        taxRegime,
        businessType
      }
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        token
      },
      message: 'User registered successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        timestamp: new Date().toISOString()
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or inactive account',
        timestamp: new Date().toISOString()
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        timestamp: new Date().toISOString()
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        token
      },
      message: 'Login successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// SUNAT Login (simplified)
app.post('/api/auth/login/sunat', async (req, res) => {
  const { ruc, username, password } = req.body;
  
  // Simulate delay and validation
  setTimeout(async () => {
    try {
      if (ruc && username && password) {
        // Find or create user based on RUC
        let user = await User.findOne({ ruc });
        
        if (!user) {
          // Create new user from SUNAT data (simplified)
          user = new User({
            email: `${ruc}@sunat.mock`,
            password: 'temp_password',
            firstName: 'Usuario',
            lastName: 'SUNAT',
            ruc,
            businessName: `Empresa ${ruc}`,
            profile: {
              taxRegime: 'RG',
              businessType: 'Comercio'
            },
            sunatCredentials: {
              username,
              isConnected: true,
              lastSyncAt: new Date()
            }
          });
          await user.save();
        } else {
          // Update SUNAT credentials
          user.sunatCredentials = {
            username,
            isConnected: true,
            lastSyncAt: new Date()
          };
          await user.save();
        }

        const token = jwt.sign(
          { userId: user._id, email: user.email },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.json({
          success: true,
          data: {
            user: user.toJSON(),
            token
          },
          message: 'SUNAT login successful',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Invalid SUNAT credentials',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'SUNAT login failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }, 1500);
});

// Get User Profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  res.json({
    success: true,
    data: req.user,
    timestamp: new Date().toISOString()
  });
});

// AI Chat
app.post('/api/chat/message', authenticateToken, async (req, res) => {
  const { message } = req.body;
  
  if (!message || message.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Message is required',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const aiResponse = await generateAIResponse(message, req.user);
    
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
    }, 1000 + Math.random() * 2000);
    
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing your message',
      timestamp: new Date().toISOString()
    });
  }
});

// Invoice Routes

// Create Invoice
app.post('/api/invoices', authenticateToken, async (req, res) => {
  try {
    const { type, client, items, amounts, status, sunat } = req.body;
    
    // Validate required fields
    if (!type || !client || !items || !amounts) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: type, client, items, amounts',
        timestamp: new Date().toISOString()
      });
    }

    // Generate series and number
    const series = type === 'factura' ? 'F001' : 'B001';
    const number = await Invoice.generateNextNumber(req.user._id, type, series);

    // Create invoice
    const invoice = new Invoice({
      userId: req.user._id,
      type,
      series,
      number,
      client,
      items,
      amounts,
      status: status || 'draft',
      sunat: {
        status: sunat?.status || 'pending'
      },
      issueDate: new Date()
    });

    // Add creation history
    invoice.addHistory('created', `${type} created via ${req.body.source || 'manual'}`, req.user._id);

    await invoice.save();

    res.json({
      success: true,
      data: invoice,
      message: `${type === 'factura' ? 'Factura' : 'Boleta'} ${status === 'draft' ? 'guardada como borrador' : 'creada y enviada'} exitosamente`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Invoice creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating invoice',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get Invoices
app.get('/api/invoices', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, startDate, endDate } = req.query;
    
    // Build query
    const query = { userId: req.user._id };
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.issueDate = {};
      if (startDate) query.issueDate.$gte = new Date(startDate);
      if (endDate) query.issueDate.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const invoices = await Invoice.find(query)
      .sort({ issueDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'businessName ruc');

    const total = await Invoice.countDocuments(query);

    res.json({
      success: true,
      data: invoices,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get Single Invoice
app.get('/api/invoices/:id', authenticateToken, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('userId', 'businessName ruc');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: invoice,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Update Invoice
app.put('/api/invoices/:id', authenticateToken, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
        timestamp: new Date().toISOString()
      });
    }

    // Update allowed fields
    const allowedUpdates = ['client', 'items', 'amounts', 'status', 'notes', 'payment'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        invoice[field] = req.body[field];
      }
    });

    // Add update history
    invoice.addHistory('updated', 'Invoice updated', req.user._id);

    await invoice.save();

    res.json({
      success: true,
      data: invoice,
      message: 'Invoice updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating invoice',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Generate Invoice PDF
app.get('/api/invoices/:id/pdf', authenticateToken, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('userId');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
        timestamp: new Date().toISOString()
      });
    }

    // Generate PDF
    const result = await pdfGenerator.generateAndSaveInvoicePDF(invoice, req.user);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('Content-Length', result.buffer.length);

    // Send PDF buffer
    res.send(result.buffer);

    // Update invoice with PDF file reference
    invoice.files = invoice.files || {};
    invoice.files.pdfDocument = result.filename;
    await invoice.save();

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Upload Invoice Files
app.post('/api/invoices/upload', authenticateToken, upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se han subido archivos',
        timestamp: new Date().toISOString()
      });
    }

    // Process uploaded files
    const processedFiles = await Promise.all(
      req.files.map(file => processUploadedFile(file))
    );

    // You can add OCR processing here for image files
    // or Excel parsing for spreadsheet files

    res.json({
      success: true,
      data: {
        files: processedFiles,
        message: 'Archivos subidos correctamente'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar archivos',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}, handleUploadError);

// Create Invoice from Upload
app.post('/api/invoices/from-upload', authenticateToken, async (req, res) => {
  try {
    const { fileData, extractedData } = req.body;
    
    // Validate extracted data
    if (!extractedData || !extractedData.client || !extractedData.items) {
      return res.status(400).json({
        success: false,
        message: 'Datos extraídos incompletos',
        timestamp: new Date().toISOString()
      });
    }

    // Generate series and number
    const series = extractedData.type === 'factura' ? 'F001' : 'B001';
    const number = await Invoice.generateNextNumber(req.user._id, extractedData.type, series);

    // Create invoice with extracted data
    const invoice = new Invoice({
      userId: req.user._id,
      type: extractedData.type,
      series,
      number,
      client: extractedData.client,
      items: extractedData.items,
      amounts: extractedData.amounts,
      source: 'upload',
      files: {
        originalDocument: fileData.filename
      },
      issueDate: extractedData.date || new Date()
    });

    // Add creation history
    invoice.addHistory('created', `Invoice created from uploaded file: ${fileData.originalName}`, req.user._id);

    await invoice.save();

    res.json({
      success: true,
      data: invoice,
      message: 'Factura creada desde archivo subido exitosamente',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Create from upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear factura desde archivo',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Declaration Routes

// Get Declarations
app.get('/api/declarations', authenticateToken, async (req, res) => {
  try {
    const { year, status } = req.query;
    
    const query = { userId: req.user._id };
    if (year) query['period.year'] = parseInt(year);
    if (status) query.status = status;

    const declarations = await Declaration.find(query)
      .sort({ 'period.year': -1, 'period.month': -1 })
      .populate('userId', 'businessName ruc profile.taxRegime');

    res.json({
      success: true,
      data: declarations,
      meta: { total: declarations.length },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching declarations',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Create Declaration
app.post('/api/declarations', authenticateToken, async (req, res) => {
  try {
    const { period, sales, purchases } = req.body;
    
    // Check if declaration already exists
    const existingDeclaration = await Declaration.findOne({
      userId: req.user._id,
      'period.year': period.year,
      'period.month': period.month,
      'period.type': period.type || 'monthly'
    });

    if (existingDeclaration) {
      return res.status(400).json({
        success: false,
        message: 'Declaration for this period already exists',
        timestamp: new Date().toISOString()
      });
    }

    // Create new declaration
    const declaration = new Declaration({
      userId: req.user._id,
      period,
      regime: {
        type: req.user.profile.taxRegime,
        category: req.body.regime?.category || 'A'
      },
      sales,
      purchases: purchases || {},
      sunat: {
        formType: req.user.profile.taxRegime === 'RER' ? 'PDT621' : 
                 req.user.profile.taxRegime === 'RG' ? 'PDT625' : 'VIRTUAL'
      }
    });

    // Add creation history
    declaration.addHistory('created', 'Declaration created', req.user._id);

    await declaration.save();

    res.json({
      success: true,
      data: declaration,
      message: 'Declaration created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Declaration creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating declaration',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Metrics Routes
app.get('/api/metrics', authenticateToken, async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Get invoices for current year
    const invoices = await Invoice.find({
      userId: req.user._id,
      issueDate: {
        $gte: new Date(currentYear, 0, 1),
        $lte: new Date(currentYear, 11, 31)
      },
      status: { $ne: 'cancelled' }
    });

    // Calculate metrics
    const totalSales = invoices.reduce((sum, inv) => sum + inv.amounts.total, 0);
    const totalTaxes = invoices.reduce((sum, inv) => sum + inv.amounts.igv, 0);
    
    const thisMonthInvoices = invoices.filter(inv => 
      inv.issueDate.getMonth() + 1 === currentMonth
    );
    const thisMonthSales = thisMonthInvoices.reduce((sum, inv) => sum + inv.amounts.total, 0);
    const thisMonthTaxes = thisMonthInvoices.reduce((sum, inv) => sum + inv.amounts.igv, 0);

    // Sales by month
    const salesByMonth = [];
    for (let month = 1; month <= 12; month++) {
      const monthInvoices = invoices.filter(inv => 
        inv.issueDate.getMonth() + 1 === month
      );
      const monthSales = monthInvoices.reduce((sum, inv) => sum + inv.amounts.total, 0);
      const monthTaxes = monthInvoices.reduce((sum, inv) => sum + inv.amounts.igv, 0);
      
      salesByMonth.push({
        month: new Date(2024, month - 1).toLocaleString('es', { month: 'short' }),
        sales: monthSales,
        taxes: monthTaxes
      });
    }

    // Get pending declarations
    const pendingDeclarations = await Declaration.countDocuments({
      userId: req.user._id,
      status: { $in: ['draft', 'pending'] }
    });

    const metrics = {
      overview: {
        totalSales: totalSales,
        totalTaxes: totalTaxes,
        pendingDeclarations: pendingDeclarations,
        thisMonth: {
          sales: thisMonthSales,
          taxes: thisMonthTaxes,
          invoices: thisMonthInvoices.length
        }
      },
      salesByMonth,
      taxBreakdown: {
        igv: { total: totalTaxes, percentage: 100 },
        rent: { total: 0, percentage: 0 }
      },
      complianceStatus: {
        declarations: { onTime: 0, late: 0, pending: pendingDeclarations },
        payments: { onTime: 0, late: 0, pending: 0 }
      }
    };

    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching metrics',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Alerts Routes
app.get('/api/alerts', authenticateToken, async (req, res) => {
  try {
    const alerts = [];
    const now = new Date();
    
    // Check for pending declarations
    const pendingDeclarations = await Declaration.find({
      userId: req.user._id,
      status: 'draft',
      'sunat.dueDate': { $gte: now }
    }).sort({ 'sunat.dueDate': 1 }).limit(3);

    pendingDeclarations.forEach(decl => {
      const daysUntilDue = Math.ceil((decl.sunat.dueDate - now) / (1000 * 60 * 60 * 24));
      alerts.push({
        id: `DECL-${decl._id}`,
        type: 'tax_deadline',
        priority: daysUntilDue <= 3 ? 'high' : 'medium',
        title: `Declaración ${decl.periodDisplay} vence ${daysUntilDue <= 1 ? 'mañana' : `en ${daysUntilDue} días`}`,
        message: `Tu declaración de ${decl.regime.type} del período ${decl.periodDisplay} vence el ${decl.sunat.dueDate.toLocaleDateString()}.`,
        dueDate: decl.sunat.dueDate,
        status: 'active',
        createdAt: decl.createdAt
      });
    });

    // Check for draft invoices
    const draftInvoices = await Invoice.countDocuments({
      userId: req.user._id,
      status: 'draft'
    });

    if (draftInvoices > 0) {
      alerts.push({
        id: 'DRAFT-INVOICES',
        type: 'invoice_pending',
        priority: 'medium',
        title: `Tienes ${draftInvoices} comprobante${draftInvoices > 1 ? 's' : ''} en borrador`,
        message: `Hay ${draftInvoices} comprobante${draftInvoices > 1 ? 's' : ''} que necesita${draftInvoices > 1 ? 'n' : ''} ser enviado${draftInvoices > 1 ? 's' : ''} a SUNAT.`,
        status: 'active',
        createdAt: new Date()
      });
    }

    res.json({
      success: true,
      data: alerts,
      meta: { total: alerts.length, unread: alerts.length },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Database Statistics (for admin)
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    // Simple admin check (in production, you'd have proper role management)
    if (req.user.email !== 'demo@quipu.ai') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
        timestamp: new Date().toISOString()
      });
    }

    const stats = await database.getStats();
    const userCount = await User.countDocuments();
    const invoiceCount = await Invoice.countDocuments();
    const declarationCount = await Declaration.countDocuments();

    res.json({
      success: true,
      data: {
        database: stats,
        collections: {
          users: userCount,
          invoices: invoiceCount,
          declarations: declarationCount
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
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

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Start server function
async function startServer() {
  try {
    // Connect to database
    await database.connect();
    await database.initialize();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Quipu.ai Backend running on http://localhost:${PORT}`);
      console.log(`📝 Health check: http://localhost:${PORT}/health`);
      console.log(`🎯 Ready for frontend connection!`);
      console.log(`📊 Database: ${database.isConnectedToDB() ? '✅ Connected' : '❌ Disconnected'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Only start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export { app, database };