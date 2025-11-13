import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: [String],
    required: true,
  },
  cc: [String],
  bcc: [String],
  subject: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  html: String,
  type: {
    type: String,
    enum: ['inbox', 'sent', 'draft'],
    default: 'inbox',
  },
  read: {
    type: Boolean,
    default: false,
  },
  starred: {
    type: Boolean,
    default: false,
  },
  trash: {
    type: Boolean,
    default: false,
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    contentType: String,
  }],
  threadId: String,
  inReplyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Email',
  },
  labels: [String],
  metadata: {
    provider: String,
    messageId: String,
    headers: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Indexes
emailSchema.index({ user: 1, type: 1 });
emailSchema.index({ user: 1, read: 1 });
emailSchema.index({ user: 1, starred: 1 });
emailSchema.index({ user: 1, trash: 1 });
emailSchema.index({ subject: 'text', body: 'text' });

export default mongoose.model('Email', emailSchema);