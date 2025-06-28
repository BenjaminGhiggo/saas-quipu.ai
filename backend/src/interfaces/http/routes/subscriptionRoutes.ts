import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
router.use(authMiddleware);

const mockPlans = [
  {
    id: '1',
    name: 'Quipu Emprende',
    type: 'emprende',
    price: { monthly: 29, yearly: 290, currency: 'PEN' },
    features: [
      'Hasta 50 comprobantes/mes',
      'Declaraciones automáticas',
      'Soporte básico',
      'Kappi IA básico',
    ],
    limits: {
      invoicesPerMonth: 50,
      declarationsPerMonth: 12,
      storageGB: 1,
      supportLevel: 'basic',
    },
    description: 'Perfecto para emprendedores',
  },
  {
    id: '2',
    name: 'Quipu Crece',
    type: 'crece',
    price: { monthly: 59, yearly: 590, currency: 'PEN' },
    features: [
      'Hasta 200 comprobantes/mes',
      'Declaraciones automáticas',
      'Soporte prioritario',
      'Kappi IA avanzado',
      'Reportes detallados',
    ],
    limits: {
      invoicesPerMonth: 200,
      declarationsPerMonth: 12,
      storageGB: 5,
      supportLevel: 'priority',
    },
    popular: true,
    description: 'Para pequeñas empresas en crecimiento',
  },
  {
    id: '3',
    name: 'Quipu Pro',
    type: 'pro',
    price: { monthly: 99, yearly: 990, currency: 'PEN' },
    features: [
      'Comprobantes ilimitados',
      'Declaraciones automáticas',
      'Soporte premium 24/7',
      'Kappi IA completo',
      'API personalizada',
      'Contador dedicado',
    ],
    limits: {
      invoicesPerMonth: -1, // Unlimited
      declarationsPerMonth: 12,
      storageGB: 50,
      supportLevel: 'premium',
    },
    description: 'Para empresas establecidas',
  },
];

router.get('/plans', (req, res) => {
  res.json({
    success: true,
    data: mockPlans,
    timestamp: new Date().toISOString(),
  });
});

router.post('/subscribe', (req, res) => {
  const { planId, billingCycle } = req.body;
  
  // Simulate subscription process
  setTimeout(() => {
    res.json({
      success: true,
      data: {
        subscriptionId: Date.now().toString(),
        planId,
        billingCycle,
        status: 'active',
        startDate: new Date().toISOString(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      message: 'Subscription successful',
      timestamp: new Date().toISOString(),
    });
  }, 2000);
});

export { router as subscriptionRoutes };