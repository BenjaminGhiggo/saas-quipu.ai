import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
router.use(authMiddleware);

const mockAlerts = [
  {
    id: '1',
    title: 'Declaración de abril vence pronto',
    description: 'Tu declaración mensual vence el 19 de mayo',
    type: 'declaration_due',
    priority: 'high',
    triggerDate: '2024-05-19',
    isRead: false,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Nuevo comprobante procesado',
    description: 'Se procesó correctamente la boleta B001-00000124',
    type: 'system',
    priority: 'medium',
    triggerDate: new Date().toISOString(),
    isRead: false,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: mockAlerts,
    timestamp: new Date().toISOString(),
  });
});

router.patch('/:id/read', (req, res) => {
  const alert = mockAlerts.find(a => a.id === req.params.id);
  if (alert) {
    alert.isRead = true;
  }
  
  res.json({
    success: true,
    data: alert,
    timestamp: new Date().toISOString(),
  });
});

export { router as alertRoutes };