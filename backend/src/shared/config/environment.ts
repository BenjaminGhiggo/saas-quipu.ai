import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

interface DatabaseConfig {
  mongoUri: string;
  dbName: string;
}

interface JWTConfig {
  secret: string;
  expiresIn: string;
}

interface ServerConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string[];
}

interface ExternalServicesConfig {
  sunat: {
    baseUrl: string;
    timeout: number;
  };
  email: {
    service: string;
    user: string;
    pass: string;
  };
  storage: {
    uploadDir: string;
    maxFileSize: number;
  };
  llm: {
    apiUrl: string;
    apiKey: string;
  };
  payment: {
    yapeApiUrl: string;
    yapeMerchantId: string;
  };
}

export interface Config {
  database: DatabaseConfig;
  jwt: JWTConfig;
  server: ServerConfig;
  external: ExternalServicesConfig;
}

function validateEnv(): Config {
  const requiredEnvVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'PORT'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  return {
    database: {
      mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/quipu_db',
      dbName: process.env.MONGO_DB_NAME || 'quipu_db',
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    server: {
      port: parseInt(process.env.PORT || '3001', 10),
      nodeEnv: process.env.NODE_ENV || 'development',
      corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    },
    external: {
      sunat: {
        baseUrl: process.env.SUNAT_BASE_URL || 'https://api.sunat.gob.pe',
        timeout: parseInt(process.env.SUNAT_TIMEOUT || '30000', 10),
      },
      email: {
        service: process.env.EMAIL_SERVICE || 'gmail',
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
      },
      storage: {
        uploadDir: process.env.UPLOAD_DIR || 'uploads/',
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
      },
      llm: {
        apiUrl: process.env.LLM_API_URL || 'https://api.openai.com/v1',
        apiKey: process.env.LLM_API_KEY || '',
      },
      payment: {
        yapeApiUrl: process.env.YAPE_API_URL || 'https://api.yape.com.pe',
        yapeMerchantId: process.env.YAPE_MERCHANT_ID || '',
      },
    },
  };
}

export const config = validateEnv();

// Environment helpers
export const isDevelopment = config.server.nodeEnv === 'development';
export const isProduction = config.server.nodeEnv === 'production';
export const isTest = config.server.nodeEnv === 'test';