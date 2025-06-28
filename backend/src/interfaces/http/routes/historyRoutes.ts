import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const { startDate, endDate, type } = req.query;
  
  // Mock history data
  const mockHistory = [
    {
      id: '1',
      date: '2024-04-15',
      type: 'boleta',
      number: 'B001-00000123',
      client: 'Juan Pérez',
      amount: 118.00,
      status: 'accepted',
    },
    {
      id: '2',
      date: '2024-04-14',
      type: 'factura',
      number: 'F001-00000456',
      client: 'Empresa ABC SAC',
      amount: 590.00,
      status: 'accepted',
    },
  ];
  
  res.json({
    success: true,
    data: mockHistory,
    timestamp: new Date().toISOString(),
  });
});

export { router as historyRoutes };