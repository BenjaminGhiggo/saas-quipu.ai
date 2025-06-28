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