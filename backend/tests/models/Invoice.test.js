import mongoose from 'mongoose';
import User from '../../src/models/User.js';
import Invoice from '../../src/models/Invoice.js';

describe('Invoice Model', () => {
  let testUser;

  beforeEach(async () => {
    testUser = new User({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      ruc: '12345678901',
      businessName: 'Test Business SAC'
    });
    await testUser.save();
  });

  describe('Schema Validation', () => {
    test('should create invoice with valid data', async () => {
      const invoiceData = {
        userId: testUser._id,
        type: 'boleta',
        series: 'B001',
        number: '00000001',
        client: {
          documentType: 'DNI',
          documentNumber: '12345678',
          name: 'Juan Pérez',
          email: 'juan@example.com'
        },
        items: [
          {
            description: 'Producto de prueba',
            quantity: 2,
            unitPrice: 50.00,
            total: 100.00
          }
        ],
        amounts: {
          subtotal: 100.00,
          igv: 18.00,
          total: 118.00
        }
      };

      const invoice = new Invoice(invoiceData);
      const savedInvoice = await invoice.save();

      expect(savedInvoice._id).toBeDefined();
      expect(savedInvoice.type).toBe('boleta');
      expect(savedInvoice.series).toBe('B001');
      expect(savedInvoice.client.name).toBe('Juan Pérez');
      expect(savedInvoice.items).toHaveLength(1);
      expect(savedInvoice.amounts.total).toBe(118.00);
      expect(savedInvoice.status).toBe('draft');
      expect(savedInvoice.sunat.status).toBe('pending');
      expect(savedInvoice.issueDate).toBeDefined();
    });

    test('should require userId', async () => {
      const invoiceData = {
        type: 'boleta',
        series: 'B001',
        number: '00000001',
        client: {
          documentType: 'DNI',
          documentNumber: '12345678',
          name: 'Juan Pérez'
        },
        items: [
          {
            description: 'Producto',
            quantity: 1,
            unitPrice: 100,
            total: 100
          }
        ],
        amounts: {
          subtotal: 100,
          igv: 18,
          total: 118
        }
      };

      const invoice = new Invoice(invoiceData);
      
      await expect(invoice.save()).rejects.toThrow(/userId/);
    });

    test('should validate document type enum', async () => {
      const invoiceData = {
        userId: testUser._id,
        type: 'invalid_type',
        series: 'B001',
        number: '00000001',
        client: {
          documentType: 'DNI',
          documentNumber: '12345678',
          name: 'Juan Pérez'
        },
        items: [
          {
            description: 'Producto',
            quantity: 1,
            unitPrice: 100,
            total: 100
          }
        ],
        amounts: {
          subtotal: 100,
          igv: 18,
          total: 118
        }
      };

      const invoice = new Invoice(invoiceData);
      
      await expect(invoice.save()).rejects.toThrow();
    });

    test('should validate required client fields', async () => {
      const invoiceData = {
        userId: testUser._id,
        type: 'boleta',
        series: 'B001',
        number: '00000001',
        client: {
          documentType: 'DNI',
          // Missing documentNumber and name
        },
        items: [
          {
            description: 'Producto',
            quantity: 1,
            unitPrice: 100,
            total: 100
          }
        ],
        amounts: {
          subtotal: 100,
          igv: 18,
          total: 118
        }
      };

      const invoice = new Invoice(invoiceData);
      
      await expect(invoice.save()).rejects.toThrow();
    });

    test('should validate item fields', async () => {
      const invoiceData = {
        userId: testUser._id,
        type: 'boleta',
        series: 'B001',
        number: '00000001',
        client: {
          documentType: 'DNI',
          documentNumber: '12345678',
          name: 'Juan Pérez'
        },
        items: [
          {
            // Missing required fields
            quantity: 1,
            unitPrice: 100
          }
        ],
        amounts: {
          subtotal: 100,
          igv: 18,
          total: 118
        }
      };

      const invoice = new Invoice(invoiceData);
      
      await expect(invoice.save()).rejects.toThrow();
    });

    test('should enforce unique series-number combination', async () => {
      const invoiceData = {
        userId: testUser._id,
        type: 'boleta',
        series: 'B001',
        number: '00000001',
        client: {
          documentType: 'DNI',
          documentNumber: '12345678',
          name: 'Juan Pérez'
        },
        items: [
          {
            description: 'Producto',
            quantity: 1,
            unitPrice: 100,
            total: 100
          }
        ],
        amounts: {
          subtotal: 100,
          igv: 18,
          total: 118
        }
      };

      await new Invoice(invoiceData).save();
      
      const duplicateInvoice = new Invoice(invoiceData);
      
      await expect(duplicateInvoice.save()).rejects.toThrow();
    });
  });

  describe('Instance Methods', () => {
    let invoice;

    beforeEach(async () => {
      invoice = new Invoice({
        userId: testUser._id,
        type: 'boleta',
        series: 'B001',
        number: '00000001',
        client: {
          documentType: 'DNI',
          documentNumber: '12345678',
          name: 'Juan Pérez'
        },
        items: [
          {
            description: 'Producto 1',
            quantity: 2,
            unitPrice: 50.00,
            total: 100.00
          },
          {
            description: 'Producto 2',
            quantity: 1,
            unitPrice: 30.00,
            total: 30.00
          }
        ],
        amounts: {
          subtotal: 130.00,
          discount: 10.00,
          igv: 21.60,
          total: 141.60
        }
      });
    });

    test('should calculate totals correctly', () => {
      const totals = invoice.calculateTotals();
      
      const expectedSubtotal = 130.00; // 100 + 30
      const expectedDiscount = 10.00;
      const expectedSubtotalAfterDiscount = 120.00; // 130 - 10
      const expectedIGV = 21.60; // 120 * 0.18
      const expectedTotal = 141.60; // 120 + 21.60

      expect(totals.subtotal).toBeCloseTo(expectedSubtotal, 2);
      expect(totals.igv).toBeCloseTo(expectedIGV, 2);
      expect(totals.total).toBeCloseTo(expectedTotal, 2);
      expect(invoice.payment.remainingAmount).toBeCloseTo(expectedTotal, 2);
    });

    test('should add history entry', () => {
      const action = 'sent_to_sunat';
      const description = 'Invoice sent to SUNAT';
      const userId = testUser._id;

      invoice.addHistory(action, description, userId);

      expect(invoice.history).toHaveLength(1);
      expect(invoice.history[0].action).toBe(action);
      expect(invoice.history[0].description).toBe(description);
      expect(invoice.history[0].userId.toString()).toBe(userId.toString());
      expect(invoice.history[0].timestamp).toBeDefined();
    });
  });

  describe('Virtual Properties', () => {
    test('should return formatted document number', async () => {
      const invoice = new Invoice({
        userId: testUser._id,
        type: 'boleta',
        series: 'B001',
        number: '123',
        client: {
          documentType: 'DNI',
          documentNumber: '12345678',
          name: 'Juan Pérez'
        },
        items: [
          {
            description: 'Producto',
            quantity: 1,
            unitPrice: 100,
            total: 100
          }
        ],
        amounts: {
          subtotal: 100,
          igv: 18,
          total: 118
        }
      });

      expect(invoice.documentNumber).toBe('B001-00000123');
    });
  });

  describe('Static Methods', () => {
    test('should generate next invoice number', async () => {
      // Create some existing invoices
      await new Invoice({
        userId: testUser._id,
        type: 'boleta',
        series: 'B001',
        number: '00000001',
        client: {
          documentType: 'DNI',
          documentNumber: '12345678',
          name: 'Juan Pérez'
        },
        items: [{ description: 'Test', quantity: 1, unitPrice: 100, total: 100 }],
        amounts: { subtotal: 100, igv: 18, total: 118 }
      }).save();

      await new Invoice({
        userId: testUser._id,
        type: 'boleta',
        series: 'B001',
        number: '00000005',
        client: {
          documentType: 'DNI',
          documentNumber: '12345678',
          name: 'Juan Pérez'
        },
        items: [{ description: 'Test', quantity: 1, unitPrice: 100, total: 100 }],
        amounts: { subtotal: 100, igv: 18, total: 118 }
      }).save();

      const nextNumber = await Invoice.generateNextNumber(testUser._id, 'boleta', 'B001');
      expect(nextNumber).toBe('00000006');
    });

    test('should return 00000001 for first invoice', async () => {
      const nextNumber = await Invoice.generateNextNumber(testUser._id, 'boleta', 'B001');
      expect(nextNumber).toBe('00000001');
    });
  });

  describe('Middleware', () => {
    test('should calculate totals before saving', async () => {
      const invoice = new Invoice({
        userId: testUser._id,
        type: 'boleta',
        series: 'B001',
        number: '00000001',
        client: {
          documentType: 'DNI',
          documentNumber: '12345678',
          name: 'Juan Pérez'
        },
        items: [
          {
            description: 'Producto',
            quantity: 2,
            unitPrice: 50.00,
            total: 100.00
          }
        ],
        amounts: {
          subtotal: 0, // Will be calculated
          igv: 0, // Will be calculated
          total: 0 // Will be calculated
        }
      });

      await invoice.save();

      expect(invoice.amounts.subtotal).toBe(100.00);
      expect(invoice.amounts.igv).toBe(18.00);
      expect(invoice.amounts.total).toBe(118.00);
    });
  });

  describe('Indexes and Population', () => {
    test('should populate user information', async () => {
      const invoice = new Invoice({
        userId: testUser._id,
        type: 'boleta',
        series: 'B001',
        number: '00000001',
        client: {
          documentType: 'DNI',
          documentNumber: '12345678',
          name: 'Juan Pérez'
        },
        items: [
          {
            description: 'Producto',
            quantity: 1,
            unitPrice: 100,
            total: 100
          }
        ],
        amounts: {
          subtotal: 100,
          igv: 18,
          total: 118
        }
      });

      await invoice.save();

      const populatedInvoice = await Invoice.findById(invoice._id)
        .populate('userId', 'businessName ruc');

      expect(populatedInvoice.userId.businessName).toBe(testUser.businessName);
      expect(populatedInvoice.userId.ruc).toBe(testUser.ruc);
    });
  });
});