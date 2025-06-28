import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from '@/shared/config/environment.js';
import { mongoConnection } from '@/infrastructure/db/config/mongodb.js';
import { errorMiddleware } from '@/interfaces/http/middlewares/errorMiddleware.js';
import { authRoutes } from '@/interfaces/http/routes/authRoutes.js';
import { invoiceRoutes } from '@/interfaces/http/routes/invoiceRoutes.js';
import { declarationRoutes } from '@/interfaces/http/routes/declarationRoutes.js';
import { chatRoutes } from '@/interfaces/http/routes/chatRoutes.js';
import { metricsRoutes } from '@/interfaces/http/routes/metricsRoutes.js';
import { historyRoutes } from '@/interfaces/http/routes/historyRoutes.js';
import { subscriptionRoutes } from '@/interfaces/http/routes/subscriptionRoutes.js';
import { alertRoutes } from '@/interfaces/http/routes/alertRoutes.js';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: config.server.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (config.server.nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.server.nodeEnv,
    database: mongoConnection.isConnectionReady() ? 'connected' : 'disconnected',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/declarations', declarationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/alerts', alertRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoConnection.connect();
    console.log('✅ Database connected successfully');

    // Start HTTP server
    const server = app.listen(config.server.port, () => {
      console.log(`🚀 Server running on port ${config.server.port}`);
      console.log(`📝 Environment: ${config.server.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${config.server.port}/health`);
    });

    // Graceful shutdown
    const shutdown = (signal: string) => {
      console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('🔒 HTTP server closed');
        
        try {
          await mongoConnection.disconnect();
          console.log('🔒 Database connection closed');
          
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;