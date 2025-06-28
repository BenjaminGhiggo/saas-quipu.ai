import { Request, Response, NextFunction } from 'express';
import { config } from '@/shared/config/environment.js';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorMiddleware = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = error.statusCode || 500;
  const isDevelopment = config.server.nodeEnv === 'development';

  // Log error for debugging
  console.error('❌ Error:', {
    message: error.message,
    statusCode,
    stack: isDevelopment ? error.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Prepare error response
  const errorResponse: any = {
    success: false,
    message: error.message || 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  };

  // Add additional details in development
  if (isDevelopment) {
    errorResponse.stack = error.stack;
    errorResponse.details = error.details;
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    errorResponse.message = 'Validation failed';
    errorResponse.details = error.details;
    return res.status(400).json(errorResponse);
  }

  if (error.name === 'CastError') {
    errorResponse.message = 'Invalid ID format';
    return res.status(400).json(errorResponse);
  }

  if (error.code === 11000) {
    errorResponse.message = 'Duplicate entry';
    return res.status(409).json(errorResponse);
  }

  if (error.name === 'JsonWebTokenError') {
    errorResponse.message = 'Invalid token';
    return res.status(401).json(errorResponse);
  }

  if (error.name === 'TokenExpiredError') {
    errorResponse.message = 'Token expired';
    return res.status(401).json(errorResponse);
  }

  res.status(statusCode).json(errorResponse);
};