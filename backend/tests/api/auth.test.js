import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/server.js';
import User from '../../src/models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'quipu-ai-secret-key-2024';

describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    test('should register new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        ruc: '12345678901',
        businessName: 'Test Business SAC',
        taxRegime: 'RER',
        businessType: 'Servicios'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.firstName).toBe(userData.firstName);
      expect(response.body.data.user.ruc).toBe(userData.ruc);
      expect(response.body.data.user.profile.taxRegime).toBe(userData.taxRegime);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined(); // Should not expose password

      // Verify user was created in database
      const savedUser = await User.findOne({ email: userData.email });
      expect(savedUser).toBeTruthy();
      expect(savedUser.businessName).toBe(userData.businessName);
    });

    test('should fail with missing required fields', async () => {
      const incompleteData = {
        email: 'test@example.com',
        password: 'password123'
        // Missing firstName, lastName, ruc, etc.
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('All fields are required');
    });

    test('should fail with duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        ruc: '12345678901',
        businessName: 'Test Business',
        taxRegime: 'RER',
        businessType: 'Servicios'
      };

      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to create duplicate
      const duplicateData = {
        ...userData,
        ruc: '10987654321' // Different RUC
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Email already exists');
    });

    test('should fail with duplicate RUC', async () => {
      const userData = {
        email: 'user1@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        ruc: '12345678901',
        businessName: 'Test Business',
        taxRegime: 'RER',
        businessType: 'Servicios'
      };

      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to create duplicate
      const duplicateData = {
        ...userData,
        email: 'user2@example.com' // Different email
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('RUC already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      testUser = new User({
        email: 'testuser@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        ruc: '12345678901',
        businessName: 'Test Business'
      });
      await testUser.save();
    });

    test('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'testuser@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.message).toBe('Login successful');

      // Verify token is valid
      const decoded = jwt.verify(response.body.data.token, JWT_SECRET);
      expect(decoded.userId).toBe(testUser._id.toString());
      expect(decoded.email).toBe(testUser.email);

      // Verify lastLoginAt was updated
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.lastLoginAt).toBeDefined();
    });

    test('should fail with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('should fail with invalid password', async () => {
      const loginData = {
        email: 'testuser@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('should fail with missing fields', async () => {
      const loginData = {
        email: 'testuser@example.com'
        // Missing password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Email and password are required');
    });

    test('should fail with inactive user', async () => {
      // Deactivate user
      testUser.isActive = false;
      await testUser.save();

      const loginData = {
        email: 'testuser@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials or inactive account');
    });
  });

  describe('POST /api/auth/login/sunat', () => {
    test('should create user with SUNAT credentials', async () => {
      const sunatData = {
        ruc: '20123456789',
        username: 'TESTUSER',
        password: 'testpass123'
      };

      const response = await new Promise((resolve) => {
        request(app)
          .post('/api/auth/login/sunat')
          .send(sunatData)
          .end((err, res) => {
            resolve(res);
          });
      });

      // Wait for the setTimeout delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.ruc).toBe(sunatData.ruc);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.message).toBe('SUNAT login successful');

      // Verify user was created
      const createdUser = await User.findOne({ ruc: sunatData.ruc });
      expect(createdUser).toBeTruthy();
      expect(createdUser.sunatCredentials.username).toBe(sunatData.username);
      expect(createdUser.sunatCredentials.isConnected).toBe(true);
    });

    test('should update existing user SUNAT credentials', async () => {
      // Create existing user
      const existingUser = new User({
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        ruc: '20123456789',
        businessName: 'Existing Business'
      });
      await existingUser.save();

      const sunatData = {
        ruc: '20123456789',
        username: 'NEWUSER',
        password: 'newpass123'
      };

      const response = await new Promise((resolve) => {
        request(app)
          .post('/api/auth/login/sunat')
          .send(sunatData)
          .end((err, res) => {
            resolve(res);
          });
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify credentials were updated
      const updatedUser = await User.findOne({ ruc: sunatData.ruc });
      expect(updatedUser.sunatCredentials.username).toBe(sunatData.username);
      expect(updatedUser.sunatCredentials.isConnected).toBe(true);
      expect(updatedUser.sunatCredentials.lastSyncAt).toBeDefined();
    });

    test('should fail with invalid credentials', async () => {
      const invalidData = {
        ruc: '',
        username: '',
        password: ''
      };

      const response = await new Promise((resolve) => {
        request(app)
          .post('/api/auth/login/sunat')
          .send(invalidData)
          .end((err, res) => {
            resolve(res);
          });
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid SUNAT credentials');
    });
  });

  describe('GET /api/auth/profile', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      testUser = new User({
        email: 'profile@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        ruc: '12345678901',
        businessName: 'Profile Test Business'
      });
      await testUser.save();

      authToken = jwt.sign(
        { userId: testUser._id, email: testUser.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
    });

    test('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.firstName).toBe(testUser.firstName);
      expect(response.body.data.ruc).toBe(testUser.ruc);
      expect(response.body.data.password).toBeUndefined();
    });

    test('should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });

    test('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid or expired token');
    });

    test('should fail with inactive user', async () => {
      // Deactivate user
      testUser.isActive = false;
      await testUser.save();

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid or inactive user');
    });
  });
});