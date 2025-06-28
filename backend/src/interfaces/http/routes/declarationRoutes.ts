import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
router.use(authMiddleware);

// Mock declaration data
const mockDeclarations = [
  {
    id: '1',
    period: {
      month: 4,
      year: 2024,
      type: 'monthly',
      dueDate: '2024-05-19',
    },
    regime: { type: 'RER' },
    sales: { total: 5000, igvCollected: 900 },
    purchases: { total: 2000, igvPaid: 360 },
    taxes: {
      igv: { balance: 540 },
      rent: { balance: 150 },
    },
    payment: { totalToPay: 690, method: 'online' },
    status: 'calculated',
    createdAt: new Date().toISOString(),
  },
];

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: mockDeclarations,
    timestamp: new Date().toISOString(),
  });
});

router.post('/', (req, res) => {
  const newDeclaration = {
    id: Date.now().toString(),
    ...req.body,
    status: 'draft',
    createdAt: new Date().toISOString(),
  };
  
  mockDeclarations.push(newDeclaration);
  
  res.status(201).json({
    success: true,
    data: newDeclaration,
    timestamp: new Date().toISOString(),
  });
});

export { router as declarationRoutes };