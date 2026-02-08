import mongoose from 'mongoose';
import User from '../models/User.js';
import config from '../config/app.js';

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

// Verify user exists
const verifyUser = async () => {
  try {
    await connectDB();

    // Find the user
    const user = await User.findOne({ email: 'devtechs842@gmail.com' });
    
    if (user) {
      console.log('User found:');
      console.log('- ID:', user._id.toString());
      console.log('- Name:', user.name);
      console.log('- Email:', user.email);
      console.log('- Role:', user.role);
      console.log('- Is Verified:', user.isVerified);
      console.log('- Has Password Field:', user.password ? 'Yes' : 'No');
      console.log('- Created At:', user.createdAt);
      console.log('- Updated At:', user.updatedAt);
    } else {
      console.log('User NOT found with email: devtechs842@gmail.com');
      console.log('Available users in database:');
      const allUsers = await User.find({}, 'name email role createdAt updatedAt');
      allUsers.forEach((u, index) => {
        console.log(`${index + 1}. Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error verifying user:', error);
    process.exit(1);
  }
};

// Run verification
verifyUser();