import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// Public routes
router.post('/login', AuthController.login);
router.post('/login/sunat', AuthController.loginWithSunat);
router.post('/register', AuthController.register);

// Protected routes
router.get('/profile', authMiddleware, AuthController.getProfile);
router.post('/logout', authMiddleware, AuthController.logout);

export { router as authRoutes };