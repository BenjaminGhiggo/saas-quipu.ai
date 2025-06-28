import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
router.use(authMiddleware);

// Mock Kappi responses
const kappiResponses = {
  "¿cuánto debo declarar este mes?": "Según tus registros, debes declarar S/ 2,422.89 este mes. Esto incluye IGV por S/ 540 y renta por S/ 150.",
  "¿qué impuestos me tocan?": "Como empresa RER, te corresponden: IGV mensual (18%), Renta mensual (1.5% de ingresos netos), y EsSalud si tienes trabajadores.",
  "¿cuánto llevo declarando?": "Has declarado un total de S/ 15,847.32 en lo que va del año 2024.",
  "ayuda": "¡Hola! Soy Kappi, tu asistente contable. Puedo ayudarte con declaraciones, cálculos de impuestos, dudas sobre SUNAT y más. ¿En qué te ayudo hoy?",
};

const suggestions = [
  "¿Cuánto debo declarar este mes?",
  "¿Cuánto llevo declarando?",
  "¿Qué impuestos me tocan?",
  "¿Cómo calculo el IGV?",
  "¿Cuándo vence mi declaración?",
];

router.post('/message', (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'Message is required',
      timestamp: new Date().toISOString(),
    });
  }

  // Find response or provide default
  const normalizedMessage = message.toLowerCase().trim();
  const response = kappiResponses[normalizedMessage] || 
                   kappiResponses["ayuda"] || 
                   "No estoy seguro de cómo responder a eso. ¿Puedes ser más específico?";

  // Simulate thinking delay
  setTimeout(() => {
    res.json({
      success: true,
      data: {
        id: Date.now().toString(),
        content: response,
        sender: 'kappi',
        timestamp: new Date().toISOString(),
        suggestions: Math.random() > 0.5 ? suggestions.slice(0, 3) : undefined,
      },
      timestamp: new Date().toISOString(),
    });
  }, 1000 + Math.random() * 2000); // 1-3 second delay
});

router.get('/suggestions', (req, res) => {
  res.json({
    success: true,
    data: suggestions,
    timestamp: new Date().toISOString(),
  });
});

export { router as chatRoutes };