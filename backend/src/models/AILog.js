import mongoose from 'mongoose';

const aiLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['chat', 'suggestion', 'priority', 'insight', 'analysis'],
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    default: 'gpt-4',
  },
  tokens: {
    prompt: Number,
    completion: Number,
    total: Number,
  },
  executionTime: Number, // in milliseconds
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: true,
});

aiLogSchema.index({ user: 1, type: 1 });
aiLogSchema.index({ createdAt: -1 });

export default mongoose.model('AILog', aiLogSchema);