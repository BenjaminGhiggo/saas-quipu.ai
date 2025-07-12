import mongoose from 'mongoose';

class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // MongoDB connection options
      const options = {
        // Connection management
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      };

      // MongoDB connection string
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quipu_ai';
      
      console.log('🔄 Connecting to MongoDB...');
      
      this.connection = await mongoose.connect(mongoURI, options);
      this.isConnected = true;
      
      console.log('✅ MongoDB connected successfully');
      console.log(`📍 Database: ${this.connection.connection.name}`);
      console.log(`🔗 Host: ${this.connection.connection.host}:${this.connection.connection.port}`);
      
      // Handle connection events
      mongoose.connection.on('connected', () => {
        console.log('📡 Mongoose connected to MongoDB');
      });

      mongoose.connection.on('error', (err) => {
        console.error('❌ Mongoose connection error:', err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('📡 Mongoose disconnected from MongoDB');
        this.isConnected = false;
      });

      // Handle process termination
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

      return this.connection;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.connection.close();
        console.log('✅ MongoDB disconnected successfully');
        this.isConnected = false;
      }
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  getConnection() {
    return this.connection;
  }

  isConnectedToDB() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  // Health check method
  async healthCheck() {
    try {
      if (!this.isConnectedToDB()) {
        return { status: 'disconnected', message: 'Not connected to database' };
      }

      // Ping the database
      await mongoose.connection.db.admin().ping();
      
      return {
        status: 'connected',
        message: 'Database connection is healthy',
        database: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        readyState: mongoose.connection.readyState
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        error: error
      };
    }
  }

  // Get database statistics
  async getStats() {
    try {
      if (!this.isConnectedToDB()) {
        throw new Error('Not connected to database');
      }

      const stats = await mongoose.connection.db.stats();
      const collections = await mongoose.connection.db.listCollections().toArray();
      
      return {
        database: mongoose.connection.name,
        collections: collections.length,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        objects: stats.objects,
        avgObjSize: stats.avgObjSize
      };
    } catch (error) {
      throw new Error(`Failed to get database stats: ${error.message}`);
    }
  }

  // Initialize database with seed data if needed
  async initialize() {
    try {
      console.log('🌱 Initializing database...');
      
      // Check if we need to seed data
      const User = mongoose.model('User');
      const userCount = await User.countDocuments();
      
      if (userCount === 0) {
        console.log('📋 Creating demo user...');
        await this.createDemoUser();
      }
      
      console.log('✅ Database initialization complete');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  // Create demo user for testing
  async createDemoUser() {
    try {
      const User = mongoose.model('User');
      
      const demoUser = new User({
        email: 'demo@quipu.ai',
        password: 'password',
        firstName: 'Demo',
        lastName: 'User',
        ruc: '12345678901',
        businessName: 'Demo Business SAC',
        phone: '+51 999 888 777',
        address: 'Av. Demo 123, Lima, Perú',
        profile: {
          taxRegime: 'RER',
          businessType: 'Servicios',
          sector: 'Tecnología'
        },
        subscription: {
          planType: 'emprende',
          status: 'active',
          startDate: new Date(),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        },
        isEmailVerified: true,
        isActive: true
      });

      await demoUser.save();
      console.log('✅ Demo user created:', demoUser.email);
      
      return demoUser;
    } catch (error) {
      console.error('❌ Failed to create demo user:', error);
      throw error;
    }
  }
}

// Create singleton instance
const database = new DatabaseConnection();

export default database;