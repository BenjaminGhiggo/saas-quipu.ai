import mongoose from 'mongoose';
import User from '../../src/models/User.js';

describe('User Model', () => {
  describe('Schema Validation', () => {
    test('should create user with valid data', async () => {
      const userData = {
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
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.firstName).toBe(userData.firstName);
      expect(savedUser.ruc).toBe(userData.ruc);
      expect(savedUser.profile.taxRegime).toBe(userData.profile.taxRegime);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
      expect(savedUser.isActive).toBe(true);
      expect(savedUser.subscription.planType).toBe('emprende');
    });

    test('should require email', async () => {
      const userData = {
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        ruc: '12345678901',
        businessName: 'Test Business'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow(/email/);
    });

    test('should require unique email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        ruc: '12345678901',
        businessName: 'Test Business'
      };

      await new User(userData).save();
      
      const duplicateUser = new User({
        ...userData,
        ruc: '10987654321'
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });

    test('should require unique RUC', async () => {
      const userData = {
        email: 'user1@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        ruc: '12345678901',
        businessName: 'Test Business'
      };

      await new User(userData).save();
      
      const duplicateUser = new User({
        ...userData,
        email: 'user2@example.com'
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });

    test('should validate RUC length', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        ruc: '123456789', // Invalid length
        businessName: 'Test Business'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    test('should validate tax regime', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        ruc: '12345678901',
        businessName: 'Test Business',
        profile: {
          taxRegime: 'INVALID_REGIME',
          businessType: 'Servicios'
        }
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('Instance Methods', () => {
    let user;

    beforeEach(async () => {
      user = new User({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        ruc: '12345678901',
        businessName: 'Test Business SAC'
      });
      await user.save();
    });

    test('should compare password correctly', async () => {
      const isMatch = await user.comparePassword('password123');
      expect(isMatch).toBe(true);

      const isNotMatch = await user.comparePassword('wrongpassword');
      expect(isNotMatch).toBe(false);
    });

    test('should generate email verification token', () => {
      const token = user.generateEmailVerificationToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes = 64 hex chars
      expect(user.emailVerificationToken).toBe(token);
    });

    test('should generate password reset token', () => {
      const token = user.generatePasswordResetToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64);
      expect(user.passwordResetToken).toBe(token);
      expect(user.passwordResetExpires).toBeDefined();
      
      const now = new Date();
      const expiresIn10Minutes = new Date(now.getTime() + 10 * 60 * 1000);
      expect(user.passwordResetExpires.getTime()).toBeCloseTo(expiresIn10Minutes.getTime(), -3);
    });
  });

  describe('Virtual Properties', () => {
    test('should return full name', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        ruc: '12345678901',
        businessName: 'Test Business'
      });

      expect(user.fullName).toBe('John Doe');
    });
  });

  describe('Middleware', () => {
    test('should hash password before saving', async () => {
      const plainPassword = 'password123';
      const user = new User({
        email: 'test@example.com',
        password: plainPassword,
        firstName: 'John',
        lastName: 'Doe',
        ruc: '12345678901',
        businessName: 'Test Business'
      });

      await user.save();
      
      expect(user.password).not.toBe(plainPassword);
      expect(user.password.startsWith('$2a$')).toBe(true); // bcrypt hash format
    });

    test('should not rehash password if not modified', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        ruc: '12345678901',
        businessName: 'Test Business'
      });

      await user.save();
      const originalHash = user.password;

      // Update non-password field
      user.firstName = 'Jane';
      await user.save();

      expect(user.password).toBe(originalHash);
    });
  });

  describe('JSON Transformation', () => {
    test('should exclude sensitive fields from JSON', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        ruc: '12345678901',
        businessName: 'Test Business'
      });

      user.generateEmailVerificationToken();
      user.generatePasswordResetToken();
      user.sunatCredentials = { username: 'test', isConnected: true };

      await user.save();
      const userJson = user.toJSON();

      expect(userJson.password).toBeUndefined();
      expect(userJson.emailVerificationToken).toBeUndefined();
      expect(userJson.passwordResetToken).toBeUndefined();
      expect(userJson.sunatCredentials).toBeUndefined();
      expect(userJson.email).toBe('test@example.com');
      expect(userJson.firstName).toBe('John');
    });
  });

  describe('Default Values', () => {
    test('should set default values', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        ruc: '12345678901',
        businessName: 'Test Business'
      });

      await user.save();

      expect(user.isActive).toBe(true);
      expect(user.isEmailVerified).toBe(false);
      expect(user.subscription.planType).toBe('emprende');
      expect(user.subscription.status).toBe('trial');
      expect(user.preferences.language).toBe('es');
      expect(user.preferences.timezone).toBe('America/Lima');
      expect(user.preferences.theme).toBe('light');
      expect(user.preferences.notifications.email).toBe(true);
      expect(user.preferences.notifications.sms).toBe(false);
      expect(user.preferences.notifications.push).toBe(true);
    });
  });
});