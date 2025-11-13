import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  position: {
    type: String,
    trim: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
  },
  notes: String,
  tags: [String],
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContactGroup',
  }],
  socialLinks: {
    linkedin: String,
    twitter: String,
    facebook: String,
    website: String,
  },
  avatar: String,
  isFavorite: {
    type: Boolean,
    default: false,
  },
  lastContacted: Date,
}, {
  timestamps: true,
});

// Indexes
contactSchema.index({ user: 1, name: 1 });
contactSchema.index({ user: 1, email: 1 });
contactSchema.index({ name: 'text', email: 'text', company: 'text' });

export default mongoose.model('Contact', contactSchema);