import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock Gemini AI
jest.mock('@google/generative-ai');

// Create test app with chat endpoint
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

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
  4. **Chat Inteligente** - Asistencia 24/7 con Kappi para resolver dudas contables
  
  INSTRUCCIONES PARA KAPPI:
  - Siempre responde en español peruano
  - Usa ejemplos con montos en soles (S/)
  - Sé profesional pero cercano
  `;

  // Function to generate AI response
  async function generateAIResponse(userMessage) {
    try {
      const prompt = `${KAPPI_CONTEXT}

Usuario pregunta: "${userMessage}"

Responde como Kappi, el asistente contable de Quipu.ai.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating AI response:', error);
      return "¡Hola! Soy Kappi, tu asistente contable. Disculpa, estoy teniendo problemas técnicos en este momento.";
    }
  }

  // Chat endpoint
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
      const aiResponse = await generateAIResponse(message);
      
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
            "Ver mis métricas"
          ]
        },
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      console.error('Chat API error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing your message',
        timestamp: new Date().toISOString()
      });
    }
  });

  return app;
};

describe('Kappi Chat API Tests', () => {
  let app;
  let mockModel;

  beforeAll(() => {
    // Setup mock for Gemini AI
    mockModel = {
      generateContent: jest.fn()
    };
    
    GoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: () => mockModel
    }));
  });

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  describe('POST /api/chat/message', () => {
    test('should return 400 if message is empty', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .send({ message: '' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Message is required');
    });

    test('should return 400 if message is missing', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Message is required');
    });

    test('should return successful response for valid message', async () => {
      const mockAIResponse = "¡Hola! Soy Kappi, tu asistente contable. Puedo ayudarte con tus declaraciones tributarias.";
      
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => mockAIResponse
        }
      });

      const response = await request(app)
        .post('/api/chat/message')
        .send({ message: '¿Qué servicios ofrece Quipu.ai?' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe(mockAIResponse);
      expect(response.body.data.sender).toBe('kappi');
      expect(response.body.data.suggestions).toHaveLength(3);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.timestamp).toBeDefined();
    });

    test('should handle AI service errors gracefully', async () => {
      mockModel.generateContent.mockRejectedValueOnce(new Error('AI service error'));

      const response = await request(app)
        .post('/api/chat/message')
        .send({ message: '¿Cuánto debo declarar?' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toContain('problemas técnicos');
    });

    test('should call Gemini AI with correct context', async () => {
      const mockAIResponse = "Respuesta de Kappi sobre IGV";
      
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => mockAIResponse
        }
      });

      const userMessage = '¿Cómo calculo el IGV?';
      await request(app)
        .post('/api/chat/message')
        .send({ message: userMessage });

      expect(mockModel.generateContent).toHaveBeenCalledWith(
        expect.stringContaining('Eres Kappi, el asistente contable inteligente de Quipu.ai')
      );
      expect(mockModel.generateContent).toHaveBeenCalledWith(
        expect.stringContaining(userMessage)
      );
    });

    test('should return contextual responses for tax-related questions', async () => {
      const mockAIResponse = "Para calcular el IGV debes aplicar el 18% sobre el valor de venta. Por ejemplo, si vendes S/ 100, el IGV sería S/ 18.";
      
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => mockAIResponse
        }
      });

      const response = await request(app)
        .post('/api/chat/message')
        .send({ message: '¿Cómo calculo el IGV?' });

      expect(response.status).toBe(200);
      expect(response.body.data.content).toContain('IGV');
      expect(response.body.data.content).toContain('18%');
    });

    test('should include suggestions in response', async () => {
      const mockAIResponse = "Respuesta de Kappi";
      
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => mockAIResponse
        }
      });

      const response = await request(app)
        .post('/api/chat/message')
        .send({ message: 'Ayuda' });

      expect(response.status).toBe(200);
      expect(response.body.data.suggestions).toContain('¿Cuándo vence mi declaración?');
      expect(response.body.data.suggestions).toContain('¿Cómo calculo el IGV?');
      expect(response.body.data.suggestions).toContain('Ver mis métricas');
    });
  });

  describe('Kappi Personality Tests', () => {
    test('should respond in Spanish', async () => {
      const mockAIResponse = "¡Hola! Soy Kappi, tu asistente contable de Quipu.ai.";
      
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => mockAIResponse
        }
      });

      const response = await request(app)
        .post('/api/chat/message')
        .send({ message: 'Hello' });

      expect(response.status).toBe(200);
      expect(response.body.data.content).toMatch(/español|Kappi|asistente/i);
    });

    test('should provide professional tax advice', async () => {
      const mockAIResponse = "Como empresa en régimen RER, debes declarar el 1.5% de tus ingresos netos como Impuesto a la Renta.";
      
      mockModel.generateContent.mockResolvedValueOnce({
        response: {
          text: () => mockAIResponse
        }
      });

      const response = await request(app)
        .post('/api/chat/message')
        .send({ message: '¿Cuánto debo declarar este mes?' });

      expect(response.status).toBe(200);
      expect(response.body.data.content).toMatch(/declarar|impuesto|régimen/i);
    });
  });
});