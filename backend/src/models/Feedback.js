import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  category: {
    type: String,
    enum: ['general', 'bug', 'feature', 'ui', 'performance'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  screenshot: String,
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'closed'],
    default: 'pending',
  },
  adminResponse: String,
  respondedAt: Date,
  metadata: {
    browser: String,
    os: String,
    version: String,
  },
}, {
  timestamps: true,
});

feedbackSchema.index({ user: 1, status: 1 });

export default mongoose.model('Feedback', feedbackSchema);