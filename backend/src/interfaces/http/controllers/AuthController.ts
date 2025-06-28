import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '@/shared/config/environment.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';

// Mock user data (replace with real database operations)
const mockUsers = [
  {
    id: '1',
    email: 'demo@quipu.ai',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
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
      industry: 'Tecnología',
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
];

const generateToken = (user: any) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      ruc: user.ruc 
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
          timestamp: new Date().toISOString(),
        });
      }

      // Find user (mock implementation)
      const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          timestamp: new Date().toISOString(),
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          timestamp: new Date().toISOString(),
        });
      }

      // Generate token
      const token = generateToken(user);

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
          token,
        },
        message: 'Login successful',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  static async loginWithSunat(req: Request, res: Response) {
    try {
      const { ruc, username, password } = req.body;

      if (!ruc || !username || !password) {
        return res.status(400).json({
          success: false,
          message: 'RUC, username and password are required',
          timestamp: new Date().toISOString(),
        });
      }

      if (ruc.length !== 11) {
        return res.status(400).json({
          success: false,
          message: 'RUC must be 11 digits',
          timestamp: new Date().toISOString(),
        });
      }

      // Simulate SUNAT connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock SUNAT validation
      if (ruc === '12345678901' && username === 'DEMO123' && password === 'demo123') {
        // Find or create user based on RUC
        let user = mockUsers.find(u => u.ruc === ruc);
        
        if (!user) {
          // Create new user from SUNAT data
          user = {
            id: Date.now().toString(),
            email: `${ruc}@sunat.mock`,
            password: await bcrypt.hash(password, 10),
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
              industry: 'Retail',
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
          };
          
          mockUsers.push(user);
        }

        // Generate token
        const token = generateToken(user);

        // Return user data without password
        const { password: _, ...userWithoutPassword } = user;

        res.json({
          success: true,
          data: {
            user: userWithoutPassword,
            token,
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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'SUNAT connection error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const { firstName, lastName, email, password, ruc, businessName, phone } = req.body;

      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Required fields missing',
          timestamp: new Date().toISOString(),
        });
      }

      // Check if user already exists
      const existingUser = mockUsers.find(u => 
        u.email.toLowerCase() === email.toLowerCase() || (ruc && u.ruc === ruc)
      );

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists',
          timestamp: new Date().toISOString(),
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        ruc,
        businessName,
        phone,
        subscription: {
          planType: 'emprende' as const,
          status: 'active' as const,
          startDate: new Date().toISOString(),
        },
        profile: {
          taxRegime: undefined,
          businessType: undefined,
          industry: undefined,
        },
        preferences: {
          language: 'es',
          timezone: 'America/Lima',
          theme: 'light' as const,
          notifications: {
            email: true,
            sms: false,
            push: true,
          },
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUsers.push(newUser);

      // Generate token
      const token = generateToken(newUser);

      // Return user data without password
      const { password: _, ...userWithoutPassword } = newUser;

      res.status(201).json({
        success: true,
        data: {
          user: userWithoutPassword,
          token,
        },
        message: 'Registration successful',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated',
          timestamp: new Date().toISOString(),
        });
      }

      const user = mockUsers.find(u => u.id === req.user!.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString(),
        });
      }

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: userWithoutPassword,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response) {
    try {
      // In a real implementation, you might blacklist the token
      // For now, just return success
      res.json({
        success: true,
        message: 'Logout successful',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }
}