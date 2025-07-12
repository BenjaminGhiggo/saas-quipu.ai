import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/server.js';
import User from '../../src/models/User.js';
import Invoice from '../../src/models/Invoice.js';

const JWT_SECRET = process.env.JWT_SECRET || 'quipu-ai-secret-key-2024';

describe('Invoices API', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    testUser = new User({
      email: 'invoicetest@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      ruc: '12345678901',
      businessName: 'Invoice Test Business'
    });
    await testUser.save();

    authToken = jwt.sign(
      { userId: testUser._id, email: testUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  });

  describe('POST /api/invoices', () => {
    test('should create invoice successfully', async () => {
      const invoiceData = {
        type: 'boleta',
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
        },
        status: 'draft'
      };

      const response = await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invoiceData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('boleta');
      expect(response.body.data.series).toBe('B001');
      expect(response.body.data.number).toBe('00000001');
      expect(response.body.data.client.name).toBe('Juan Pérez');
      expect(response.body.data.amounts.total).toBe(118.00);
      expect(response.body.data.userId.toString()).toBe(testUser._id.toString());
      expect(response.body.data.history).toHaveLength(1);
      expect(response.body.data.history[0].action).toBe('created');

      // Verify invoice was saved to database
      const savedInvoice = await Invoice.findById(response.body.data._id);
      expect(savedInvoice).toBeTruthy();
      expect(savedInvoice.client.name).toBe('Juan Pérez');
    });

    test('should generate sequential invoice numbers', async () => {
      const invoiceData = {
        type: 'boleta',
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

      // Create first invoice
      const response1 = await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invoiceData)
        .expect(200);

      expect(response1.body.data.number).toBe('00000001');

      // Create second invoice
      const response2 = await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invoiceData)
        .expect(200);

      expect(response2.body.data.number).toBe('00000002');
    });

    test('should use different series for factura vs boleta', async () => {
      const boletaData = {
        type: 'boleta',
        client: {
          documentType: 'DNI',
          documentNumber: '12345678',
          name: 'Juan Pérez'
        },
        items: [{ description: 'Producto', quantity: 1, unitPrice: 100, total: 100 }],
        amounts: { subtotal: 100, igv: 18, total: 118 }
      };

      const facturaData = {
        type: 'factura',
        client: {
          documentType: 'RUC',
          documentNumber: '20123456789',
          name: 'Empresa SAC'
        },
        items: [{ description: 'Servicio', quantity: 1, unitPrice: 200, total: 200 }],
        amounts: { subtotal: 200, igv: 36, total: 236 }
      };

      const boletaResponse = await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send(boletaData)
        .expect(200);

      const facturaResponse = await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send(facturaData)
        .expect(200);

      expect(boletaResponse.body.data.series).toBe('B001');
      expect(facturaResponse.body.data.series).toBe('F001');
      expect(boletaResponse.body.data.number).toBe('00000001');
      expect(facturaResponse.body.data.number).toBe('00000001');
    });

    test('should fail with missing required fields', async () => {
      const invalidData = {
        type: 'boleta'
        // Missing client, items, amounts
      };

      const response = await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Missing required fields');
    });

    test('should fail without authentication', async () => {
      const invoiceData = {
        type: 'boleta',
        client: {
          documentType: 'DNI',
          documentNumber: '12345678',
          name: 'Juan Pérez'
        },
        items: [{ description: 'Producto', quantity: 1, unitPrice: 100, total: 100 }],
        amounts: { subtotal: 100, igv: 18, total: 118 }
      };

      const response = await request(app)
        .post('/api/invoices')
        .send(invoiceData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });
  });

  describe('GET /api/invoices', () => {
    beforeEach(async () => {
      // Create test invoices
      const invoices = [
        {
          userId: testUser._id,
          type: 'boleta',
          series: 'B001',
          number: '00000001',
          client: { documentType: 'DNI', documentNumber: '12345678', name: 'Cliente 1' },
          items: [{ description: 'Producto 1', quantity: 1, unitPrice: 100, total: 100 }],
          amounts: { subtotal: 100, igv: 18, total: 118 },
          status: 'draft',
          issueDate: new Date('2024-06-01')
        },
        {
          userId: testUser._id,
          type: 'factura',
          series: 'F001',
          number: '00000001',
          client: { documentType: 'RUC', documentNumber: '20123456789', name: 'Cliente 2' },
          items: [{ description: 'Servicio 1', quantity: 1, unitPrice: 200, total: 200 }],
          amounts: { subtotal: 200, igv: 36, total: 236 },
          status: 'sent',
          issueDate: new Date('2024-06-02')
        },
        {
          userId: testUser._id,
          type: 'boleta',
          series: 'B001',
          number: '00000002',
          client: { documentType: 'DNI', documentNumber: '87654321', name: 'Cliente 3' },
          items: [{ description: 'Producto 2', quantity: 2, unitPrice: 75, total: 150 }],
          amounts: { subtotal: 150, igv: 27, total: 177 },
          status: 'paid',
          issueDate: new Date('2024-06-03')
        }
      ];

      await Invoice.insertMany(invoices);
    });

    test('should get all user invoices', async () => {
      const response = await request(app)
        .get('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.meta.total).toBe(3);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(10);

      // Should be sorted by issueDate desc
      expect(response.body.data[0].client.name).toBe('Cliente 3');
      expect(response.body.data[1].client.name).toBe('Cliente 2');
      expect(response.body.data[2].client.name).toBe('Cliente 1');
    });

    test('should filter by type', async () => {
      const response = await request(app)
        .get('/api/invoices?type=boleta')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every(inv => inv.type === 'boleta')).toBe(true);
    });

    test('should filter by status', async () => {
      const response = await request(app)
        .get('/api/invoices?status=draft')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('draft');
    });

    test('should filter by date range', async () => {
      const response = await request(app)
        .get('/api/invoices?startDate=2024-06-02&endDate=2024-06-03')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every(inv => {
        const date = new Date(inv.issueDate);
        return date >= new Date('2024-06-02') && date <= new Date('2024-06-03');
      })).toBe(true);
    });

    test('should support pagination', async () => {
      const response = await request(app)
        .get('/api/invoices?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(2);
      expect(response.body.meta.pages).toBe(2);
    });

    test('should only return user\'s own invoices', async () => {
      // Create another user with invoices
      const otherUser = new User({
        email: 'other@example.com',
        password: 'password123',
        firstName: 'Other',
        lastName: 'User',
        ruc: '98765432109',
        businessName: 'Other Business'
      });
      await otherUser.save();

      await new Invoice({
        userId: otherUser._id,
        type: 'boleta',
        series: 'B001',
        number: '00000001',
        client: { documentType: 'DNI', documentNumber: '11111111', name: 'Other Client' },
        items: [{ description: 'Other Product', quantity: 1, unitPrice: 50, total: 50 }],
        amounts: { subtotal: 50, igv: 9, total: 59 }
      }).save();

      const response = await request(app)
        .get('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(3); // Only test user's invoices
      expect(response.body.data.every(inv => inv.userId.toString() === testUser._id.toString())).toBe(true);
    });
  });

  describe('GET /api/invoices/:id', () => {
    let testInvoice;

    beforeEach(async () => {
      testInvoice = new Invoice({
        userId: testUser._id,
        type: 'boleta',
        series: 'B001',
        number: '00000001',
        client: {
          documentType: 'DNI',
          documentNumber: '12345678',
          name: 'Test Client'
        },
        items: [
          {
            description: 'Test Product',
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
      await testInvoice.save();
    });

    test('should get invoice by ID', async () => {
      const response = await request(app)
        .get(`/api/invoices/${testInvoice._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testInvoice._id.toString());
      expect(response.body.data.client.name).toBe('Test Client');
    });

    test('should return 404 for non-existent invoice', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/invoices/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invoice not found');
    });

    test('should not allow access to other user\'s invoice', async () => {
      // Create other user and their invoice
      const otherUser = new User({
        email: 'other@example.com',
        password: 'password123',
        firstName: 'Other',
        lastName: 'User',
        ruc: '98765432109',
        businessName: 'Other Business'
      });
      await otherUser.save();

      const otherInvoice = new Invoice({
        userId: otherUser._id,
        type: 'boleta',
        series: 'B001',
        number: '00000001',
        client: { documentType: 'DNI', documentNumber: '11111111', name: 'Other Client' },
        items: [{ description: 'Other Product', quantity: 1, unitPrice: 50, total: 50 }],
        amounts: { subtotal: 50, igv: 9, total: 59 }
      });
      await otherInvoice.save();

      const response = await request(app)
        .get(`/api/invoices/${otherInvoice._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invoice not found');
    });
  });

  describe('PUT /api/invoices/:id', () => {
    let testInvoice;

    beforeEach(async () => {
      testInvoice = new Invoice({
        userId: testUser._id,
        type: 'boleta',
        series: 'B001',
        number: '00000001',
        client: {
          documentType: 'DNI',
          documentNumber: '12345678',
          name: 'Original Client'
        },
        items: [
          {
            description: 'Original Product',
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
      await testInvoice.save();
    });

    test('should update invoice successfully', async () => {
      const updateData = {
        client: {
          documentType: 'DNI',
          documentNumber: '87654321',
          name: 'Updated Client',
          email: 'updated@example.com'
        },
        status: 'sent',
        notes: 'Updated invoice notes'
      };

      const response = await request(app)
        .put(`/api/invoices/${testInvoice._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.client.name).toBe('Updated Client');
      expect(response.body.data.client.email).toBe('updated@example.com');
      expect(response.body.data.status).toBe('sent');
      expect(response.body.data.notes).toBe('Updated invoice notes');
      expect(response.body.data.history).toHaveLength(1);
      expect(response.body.data.history[0].action).toBe('updated');

      // Verify in database
      const updatedInvoice = await Invoice.findById(testInvoice._id);
      expect(updatedInvoice.client.name).toBe('Updated Client');
      expect(updatedInvoice.status).toBe('sent');
    });

    test('should return 404 for non-existent invoice', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .put(`/api/invoices/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'sent' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invoice not found');
    });

    test('should not allow updating other user\'s invoice', async () => {
      // Create other user and their invoice
      const otherUser = new User({
        email: 'other@example.com',
        password: 'password123',
        firstName: 'Other',
        lastName: 'User',
        ruc: '98765432109',
        businessName: 'Other Business'
      });
      await otherUser.save();

      const otherInvoice = new Invoice({
        userId: otherUser._id,
        type: 'boleta',
        series: 'B001',
        number: '00000001',
        client: { documentType: 'DNI', documentNumber: '11111111', name: 'Other Client' },
        items: [{ description: 'Other Product', quantity: 1, unitPrice: 50, total: 50 }],
        amounts: { subtotal: 50, igv: 9, total: 59 }
      });
      await otherInvoice.save();

      const response = await request(app)
        .put(`/api/invoices/${otherInvoice._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'sent' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invoice not found');
    });
  });
});