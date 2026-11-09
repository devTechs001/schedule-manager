import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  phone: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String,
    default: null,
  },
  /*
   * Profile details. Kept flat (rather than nested under `profile`) so the
   * existing updateProfile controller can whitelist them without reshaping
   * payloads the frontend already sends.
   */
  headline: {
    type: String,
    trim: true,
    maxlength: [120, 'Headline must be 120 characters or fewer'],
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [600, 'Bio must be 600 characters or fewer'],
  },
  jobTitle: {
    type: String,
    trim: true,
    maxlength: [120, 'Job title must be 120 characters or fewer'],
  },
  company: {
    type: String,
    trim: true,
    maxlength: [120, 'Company must be 120 characters or fewer'],
  },
  location: {
    type: String,
    trim: true,
    maxlength: [120, 'Location must be 120 characters or fewer'],
  },
  website: {
    type: String,
    trim: true,
    maxlength: [200, 'Website must be 200 characters or fewer'],
  },
  pronouns: {
    type: String,
    trim: true,
    maxlength: [40, 'Pronouns must be 40 characters or fewer'],
  },
  timezone: {
    type: String,
    trim: true,
    default: 'UTC',
  },
  /*
   * Organisations the user belongs to.
   *
   * Deliberately embedded rather than modelled as separate documents: a
   * membership is small, always read together with the profile, and this avoids
   * a second round trip on the settings screen. The Workspace collection stays
   * the source of truth for shared data; this is the user's view of it.
   */
  organisations: [
    {
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
      },
      role: {
        type: String,
        trim: true,
        default: 'Member',
        maxlength: 60,
      },
      website: {
        type: String,
        trim: true,
        maxlength: 200,
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  /** Free-form links shown on the profile card. */
  socials: {
    linkedin: { type: String, trim: true, maxlength: 200 },
    x: { type: String, trim: true, maxlength: 200 },
    github: { type: String, trim: true, maxlength: 200 },
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system', 'midnight', 'nord', 'sand'],
      default: 'dark',
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      taskReminders: { type: Boolean, default: true },
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date,
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verificationToken;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

export default mongoose.model('User', userSchema);