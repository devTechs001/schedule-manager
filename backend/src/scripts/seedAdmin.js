import crypto from 'crypto';
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

// Seed admin user.
// Credentials come from the environment so nothing is baked into the repo:
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-strong-password' npm run seed:admin
// A password is generated and printed once if ADMIN_PASSWORD is omitted.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || null;

const generatePassword = () => {
  const bytes = crypto.randomBytes(12).toString('base64').replace(/[^A-Za-z0-9]/g, '');
  // Guarantee the password policy (upper, lower, digit) is satisfied.
  return `${bytes.slice(0, 12)}Aa1!`;
};

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

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

      // Only rotate the password when one was explicitly supplied. Resetting it
      // silently on every run would be a security hole.
      if (ADMIN_PASSWORD) {
        existingAdmin.password = ADMIN_PASSWORD; // raw — the model hashes it
        existingAdmin.markModified('password');
        updated = true;
        console.log('Password updated from ADMIN_PASSWORD.');
      }

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
    const defaultPassword = ADMIN_PASSWORD || generatePassword();
    if (!ADMIN_PASSWORD) {
      console.log('No ADMIN_PASSWORD supplied — generated one:');
      console.log(`  email:    ${ADMIN_EMAIL}`);
      console.log(`  password: ${defaultPassword}`);
      console.log('Copy it now; it is not stored anywhere.');
    }

    // NOTE: the User model hashes the password in a pre-save hook. Passing an
    // already-hashed value here would hash it twice and make login impossible.
    const adminUser = await User.create({
      name: 'Admin User',
      email: ADMIN_EMAIL,
      password: defaultPassword,
      role: 'admin',
      isVerified: true,
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