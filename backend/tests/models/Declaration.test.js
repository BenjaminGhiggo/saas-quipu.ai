import mongoose from 'mongoose';
import User from '../../src/models/User.js';
import Declaration from '../../src/models/Declaration.js';

describe('Declaration Model', () => {
  let testUser;

  beforeEach(async () => {
    testUser = new User({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      ruc: '12345678901',
      businessName: 'Test Business SAC',
      profile: {
        taxRegime: 'RER',
        businessType: 'Servicios'
      }
    });
    await testUser.save();
  });

  describe('Schema Validation', () => {
    test('should create declaration with valid data', async () => {
      const declarationData = {
        userId: testUser._id,
        period: {
          month: 6,
          year: 2024,
          type: 'monthly'
        },
        regime: {
          type: 'RER',
          category: 'A'
        },
        sales: {
          taxable: 5000.00,
          exempt: 0,
          total: 5000.00,
          igvPaid: 0
        },
        sunat: {
          formType: 'PDT621'
        }
      };

      const declaration = new Declaration(declarationData);
      const savedDeclaration = await declaration.save();

      expect(savedDeclaration._id).toBeDefined();
      expect(savedDeclaration.period.month).toBe(6);
      expect(savedDeclaration.period.year).toBe(2024);
      expect(savedDeclaration.regime.type).toBe('RER');
      expect(savedDeclaration.sales.total).toBe(5000.00);
      expect(savedDeclaration.status).toBe('draft');
      expect(savedDeclaration.sunat.status).toBe('pending');
      expect(savedDeclaration.sunat.dueDate).toBeDefined();
    });

    test('should require userId', async () => {
      const declarationData = {
        period: {
          month: 6,
          year: 2024
        },
        regime: {
          type: 'RER'
        },
        sales: {
          total: 5000.00
        }
      };

      const declaration = new Declaration(declarationData);
      
      await expect(declaration.save()).rejects.toThrow(/userId/);
    });

    test('should validate month range', async () => {
      const declarationData = {
        userId: testUser._id,
        period: {
          month: 13, // Invalid month
          year: 2024
        },
        regime: {
          type: 'RER'
        },
        sales: {
          total: 5000.00
        }
      };

      const declaration = new Declaration(declarationData);
      
      await expect(declaration.save()).rejects.toThrow();
    });

    test('should validate regime type', async () => {
      const declarationData = {
        userId: testUser._id,
        period: {
          month: 6,
          year: 2024
        },
        regime: {
          type: 'INVALID_REGIME'
        },
        sales: {
          total: 5000.00
        }
      };

      const declaration = new Declaration(declarationData);
      
      await expect(declaration.save()).rejects.toThrow();
    });

    test('should enforce unique period per user', async () => {
      const declarationData = {
        userId: testUser._id,
        period: {
          month: 6,
          year: 2024,
          type: 'monthly'
        },
        regime: {
          type: 'RER'
        },
        sales: {
          total: 5000.00
        }
      };

      await new Declaration(declarationData).save();
      
      const duplicateDeclaration = new Declaration(declarationData);
      
      await expect(duplicateDeclaration.save()).rejects.toThrow();
    });
  });

  describe('Instance Methods', () => {
    describe('calculateTaxes', () => {
      test('should calculate RUS taxes correctly', async () => {
        const declaration = new Declaration({
          userId: testUser._id,
          period: {
            month: 6,
            year: 2024
          },
          regime: {
            type: 'RUS',
            category: 'C'
          },
          sales: {
            total: 3000.00
          }
        });

        const taxes = declaration.calculateTaxes();

        expect(taxes.fixedPayment).toBe(200); // Category C = S/ 200
        expect(declaration.payment.totalToPay).toBe(200);
      });

      test('should calculate RER taxes correctly', async () => {
        const declaration = new Declaration({
          userId: testUser._id,
          period: {
            month: 6,
            year: 2024
          },
          regime: {
            type: 'RER',
            category: 'A'
          },
          sales: {
            total: 5000.00
          }
        });

        const taxes = declaration.calculateTaxes();

        expect(taxes.rent.base).toBe(5000.00);
        expect(taxes.rent.rate).toBe(1.5);
        expect(taxes.rent.amount).toBe(75.00); // 5000 * 0.015
        expect(taxes.rent.balance).toBe(75.00);
        expect(declaration.payment.totalToPay).toBe(75.00);
      });

      test('should calculate RG taxes correctly', async () => {
        const declaration = new Declaration({
          userId: testUser._id,
          period: {
            month: 6,
            year: 2024
          },
          regime: {
            type: 'RG',
            category: 'services'
          },
          sales: {
            taxable: 5000.00,
            total: 5000.00
          },
          purchases: {
            igvPaid: 100.00
          }
        });

        const taxes = declaration.calculateTaxes();

        // IGV calculations
        expect(taxes.igv.collected).toBe(900.00); // 5000 * 0.18
        expect(taxes.igv.paid).toBe(100.00);
        expect(taxes.igv.balance).toBe(800.00); // 900 - 100

        // Rent calculations
        expect(taxes.rent.base).toBe(5000.00);
        expect(taxes.rent.rate).toBe(1.5); // Services = 1.5%
        expect(taxes.rent.amount).toBe(75.00); // 5000 * 0.015
        expect(taxes.rent.balance).toBe(75.00);

        expect(declaration.payment.totalToPay).toBe(875.00); // 800 + 75
      });
    });

    test('should generate due date correctly', () => {
      const declaration = new Declaration({
        userId: testUser._id,
        period: {
          month: 6,
          year: 2024
        },
        regime: {
          type: 'RER'
        },
        sales: {
          total: 5000.00
        }
      });

      const dueDate = declaration.generateDueDate();

      expect(dueDate.getFullYear()).toBe(2024);
      expect(dueDate.getMonth()).toBe(6); // July (0-indexed)
      expect(dueDate.getDate()).toBe(12);
    });

    test('should add history entry', () => {
      const declaration = new Declaration({
        userId: testUser._id,
        period: {
          month: 6,
          year: 2024
        },
        regime: {
          type: 'RER'
        },
        sales: {
          total: 5000.00
        }
      });

      const action = 'sent';
      const description = 'Declaration sent to SUNAT';
      const userId = testUser._id;

      declaration.addHistory(action, description, userId);

      expect(declaration.history).toHaveLength(1);
      expect(declaration.history[0].action).toBe(action);
      expect(declaration.history[0].description).toBe(description);
      expect(declaration.history[0].userId.toString()).toBe(userId.toString());
    });
  });

  describe('Virtual Properties', () => {
    test('should return period display', () => {
      const declaration = new Declaration({
        userId: testUser._id,
        period: {
          month: 6,
          year: 2024
        },
        regime: {
          type: 'RER'
        },
        sales: {
          total: 5000.00
        }
      });

      expect(declaration.periodDisplay).toBe('Junio 2024');
    });
  });

  describe('Static Methods', () => {
    test('should get current period', () => {
      const currentPeriod = Declaration.getCurrentPeriod();

      expect(currentPeriod.month).toBeDefined();
      expect(currentPeriod.year).toBeDefined();
      expect(currentPeriod.type).toBe('monthly');
      expect(currentPeriod.month).toBeGreaterThanOrEqual(0);
      expect(currentPeriod.month).toBeLessThanOrEqual(11);
    });
  });

  describe('Middleware', () => {
    test('should calculate taxes before saving', async () => {
      const declaration = new Declaration({
        userId: testUser._id,
        period: {
          month: 6,
          year: 2024
        },
        regime: {
          type: 'RER',
          category: 'A'
        },
        sales: {
          total: 5000.00
        }
      });

      await declaration.save();

      // Taxes should be calculated automatically
      expect(declaration.taxes.rent.amount).toBe(75.00);
      expect(declaration.payment.totalToPay).toBe(75.00);
    });

    test('should generate due date on creation', async () => {
      const declaration = new Declaration({
        userId: testUser._id,
        period: {
          month: 6,
          year: 2024
        },
        regime: {
          type: 'RER'
        },
        sales: {
          total: 5000.00
        }
      });

      await declaration.save();

      expect(declaration.sunat.dueDate).toBeDefined();
      expect(declaration.sunat.dueDate.getDate()).toBe(12);
    });

    test('should not recalculate if taxes not modified', async () => {
      const declaration = new Declaration({
        userId: testUser._id,
        period: {
          month: 6,
          year: 2024
        },
        regime: {
          type: 'RER',
          category: 'A'
        },
        sales: {
          total: 5000.00
        }
      });

      await declaration.save();
      const originalTotalToPay = declaration.payment.totalToPay;

      // Update non-tax field
      declaration.notes = 'Updated notes';
      await declaration.save();

      expect(declaration.payment.totalToPay).toBe(originalTotalToPay);
    });
  });

  describe('Population and Relationships', () => {
    test('should populate user information', async () => {
      const declaration = new Declaration({
        userId: testUser._id,
        period: {
          month: 6,
          year: 2024
        },
        regime: {
          type: 'RER'
        },
        sales: {
          total: 5000.00
        }
      });

      await declaration.save();

      const populatedDeclaration = await Declaration.findById(declaration._id)
        .populate('userId', 'businessName ruc profile.taxRegime');

      expect(populatedDeclaration.userId.businessName).toBe(testUser.businessName);
      expect(populatedDeclaration.userId.ruc).toBe(testUser.ruc);
      expect(populatedDeclaration.userId.profile.taxRegime).toBe(testUser.profile.taxRegime);
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero sales for RER', async () => {
      const declaration = new Declaration({
        userId: testUser._id,
        period: {
          month: 6,
          year: 2024
        },
        regime: {
          type: 'RER'
        },
        sales: {
          total: 0
        }
      });

      await declaration.save();

      expect(declaration.taxes.rent.amount).toBe(0);
      expect(declaration.payment.totalToPay).toBe(0);
    });

    test('should handle RG with zero IGV', async () => {
      const declaration = new Declaration({
        userId: testUser._id,
        period: {
          month: 6,
          year: 2024
        },
        regime: {
          type: 'RG',
          category: 'services'
        },
        sales: {
          taxable: 0,
          total: 1000.00 // Exempt sales
        }
      });

      await declaration.save();

      expect(declaration.taxes.igv.collected).toBe(0);
      expect(declaration.taxes.rent.amount).toBe(15.00); // 1000 * 0.015
    });
  });
});