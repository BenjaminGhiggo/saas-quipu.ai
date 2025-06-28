import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
router.use(authMiddleware);

// Mock metrics data
const generateMetricsData = (period: string) => {
  const now = new Date();
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
  return {
    period: { label: period, value: period },
    sales: {
      total: 45230.50,
      count: 127,
      average: 356.15,
      growth: 12.5,
    },
    purchases: {
      total: 23450.30,
      count: 89,
      average: 263.48,
      growth: -5.2,
    },
    taxes: {
      igv: 4072.14,
      rent: 678.46,
      total: 4750.60,
    },
    charts: {
      salesByMonth: months.slice(0, now.getMonth() + 1).map((month, index) => ({
        month,
        amount: Math.random() * 10000 + 2000,
      })),
      purchasesByMonth: months.slice(0, now.getMonth() + 1).map((month, index) => ({
        month,
        amount: Math.random() * 5000 + 1000,
      })),
      taxesByMonth: months.slice(0, now.getMonth() + 1).map((month, index) => ({
        month,
        igv: Math.random() * 800 + 200,
        rent: Math.random() * 200 + 50,
      })),
    },
  };
};

router.get('/', (req, res) => {
  const { period = 'month' } = req.query;
  
  const data = generateMetricsData(period as string);
  
  res.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
});

export { router as metricsRoutes };