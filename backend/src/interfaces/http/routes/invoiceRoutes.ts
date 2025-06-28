import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// All invoice routes require authentication
router.use(authMiddleware);

// Mock invoice data
const mockInvoices = [
  {
    id: '1',
    type: 'boleta',
    series: 'B001',
    number: 123,
    fullNumber: 'B001-00000123',
    client: {
      documentType: 'DNI',
      documentNumber: '12345678',
      name: 'Juan Pérez',
      email: 'juan@email.com',
    },
    amounts: {
      subtotal: 100.00,
      igv: 18.00,
      total: 118.00,
    },
    sunat: {
      status: 'accepted',
    },
    issueDate: new Date().toISOString(),
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'factura',
    series: 'F001',
    number: 456,
    fullNumber: 'F001-00000456',
    client: {
      documentType: 'RUC',
      documentNumber: '12345678901',
      name: 'Empresa ABC SAC',
      email: 'empresa@abc.com',
    },
    amounts: {
      subtotal: 500.00,
      igv: 90.00,
      total: 590.00,
    },
    sunat: {
      status: 'accepted',
    },
    issueDate: new Date().toISOString(),
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];

// Get all invoices
router.get('/', (req, res) => {
  const { type, status, page = 1, limit = 10 } = req.query;
  
  let filteredInvoices = [...mockInvoices];
  
  if (type) {
    filteredInvoices = filteredInvoices.filter(invoice => invoice.type === type);
  }
  
  if (status) {
    filteredInvoices = filteredInvoices.filter(invoice => invoice.status === status);
  }

  const startIndex = (Number(page) - 1) * Number(limit);
  const endIndex = startIndex + Number(limit);
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: paginatedInvoices,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: filteredInvoices.length,
      totalPages: Math.ceil(filteredInvoices.length / Number(limit)),
      hasNext: endIndex < filteredInvoices.length,
      hasPrev: startIndex > 0,
    },
    timestamp: new Date().toISOString(),
  });
});

// Get invoice by ID
router.get('/:id', (req, res) => {
  const invoice = mockInvoices.find(inv => inv.id === req.params.id);
  
  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: 'Invoice not found',
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    success: true,
    data: invoice,
    timestamp: new Date().toISOString(),
  });
});

// Create new invoice
router.post('/', (req, res) => {
  const newInvoice = {
    id: Date.now().toString(),
    ...req.body,
    fullNumber: `${req.body.series}-${req.body.number.toString().padStart(8, '0')}`,
    sunat: {
      status: 'draft',
    },
    issueDate: new Date().toISOString(),
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockInvoices.push(newInvoice);

  res.status(201).json({
    success: true,
    data: newInvoice,
    message: 'Invoice created successfully',
    timestamp: new Date().toISOString(),
  });
});

// Upload invoice file
router.post('/upload', (req, res) => {
  // Simulate file processing
  setTimeout(() => {
    res.json({
      success: true,
      data: {
        fileName: 'invoice.pdf',
        extractedData: {
          type: 'boleta',
          amount: 118.00,
          client: 'Cliente Extraído',
          confidence: 85,
        },
      },
      message: 'File processed successfully',
      timestamp: new Date().toISOString(),
    });
  }, 2000);
});

// Send to SUNAT
router.post('/:id/send-sunat', (req, res) => {
  const invoice = mockInvoices.find(inv => inv.id === req.params.id);
  
  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: 'Invoice not found',
      timestamp: new Date().toISOString(),
    });
  }

  // Simulate SUNAT processing
  setTimeout(() => {
    invoice.sunat.status = 'accepted';
    invoice.sunat.sentAt = new Date().toISOString();
    invoice.sunat.acceptedAt = new Date().toISOString();

    res.json({
      success: true,
      data: invoice,
      message: 'Invoice sent to SUNAT successfully',
      timestamp: new Date().toISOString(),
    });
  }, 3000);
});

export { router as invoiceRoutes };