import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
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

// Seed admin user
const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      email: 'devtechs842@gmail.com'
    });

    if (existingAdmin) {
      console.log('User already exists:', existingAdmin.email);
      console.log('Current Role:', existingAdmin.role);

      let updated = false;

      // Update role to admin if not already admin
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        updated = true;
        console.log('Updated user role to admin:', existingAdmin.email);
      }

      // Reset password to default to ensure user can log in
      const defaultPassword = 'AdminPass123!';
      existingAdmin.password = defaultPassword; // Set raw password, let the middleware hash it
      existingAdmin.markModified('password'); // Explicitly mark password as modified
      updated = true;
      console.log('Reset user password to default:', defaultPassword);

      // Also ensure the name is set correctly
      if (existingAdmin.name !== 'Admin User') {
        existingAdmin.name = 'Admin User';
        updated = true;
        console.log('Updated user name to: Admin User');
      }

      if (updated) {
        await existingAdmin.save();
        console.log('Changes saved to user:', existingAdmin.email);
      } else {
        console.log('No changes needed for user:', existingAdmin.email);
      }

      process.exit(0);
    }

    // Create admin user
    const defaultPassword = 'AdminPass123!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10); // Default strong password

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'devtechs842@gmail.com',
      password: hashedPassword,
      role: 'admin', // Set as admin
      isVerified: true, // Mark as verified
    });

    console.log('Default password set to:', defaultPassword);

    console.log('Admin user created successfully:');
    console.log('- Name:', adminUser.name);
    console.log('- Email:', adminUser.email);
    console.log('- Role:', adminUser.role);
    console.log('- ID:', adminUser._id);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if this module is being run directly (not imported)
if (process.argv[1] === __filename) {
  seedAdmin();
}

export default seedAdmin;