import mongoose from 'mongoose';
import User from '../models/User.js';
import config from '../config/app.js';
import bcrypt from 'bcryptjs';

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.database.mongoUri, config.database.options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test password verification
const testPassword = async () => {
  try {
    await connectDB();

    // Find the user with password field
    const user = await User.findOne({ email: 'devtechs842@gmail.com' }).select('+password');
    
    if (!user) {
      console.log('User NOT found with email: devtechs842@gmail.com');
      process.exit(1);
    }

    console.log('User found:', user.email);
    console.log('Password field exists:', !!user.password);

    // Test password comparison
    const testPassword = 'AdminPass123!';
    const isMatch = await user.matchPassword(testPassword);
    
    console.log('\nTesting password:', testPassword);
    console.log('Password match result:', isMatch);
    
    if (isMatch) {
      console.log('✅ Password verification SUCCESSFUL');
    } else {
      console.log('❌ Password verification FAILED');
      console.log('Expected password might not match what is stored in DB');
      
      // Let's try a few variations
      const variations = [
        'AdminPass123!',
        'AdminPass123',
        'adminpass123!',
        'ADMINPASS123!'
      ];
      
      for (const variation of variations) {
        const match = await user.matchPassword(variation);
        console.log(`Testing "${variation}": ${match ? 'MATCH' : 'NO MATCH'}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error testing password:', error);
    process.exit(1);
  }
};

// Run test
testPassword();