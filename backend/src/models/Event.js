import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
  },
  description: String,
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ['meeting', 'task', 'deadline', 'reminder'],
    default: 'meeting',
  },
  location: String,
  attendees: [{
    email: String,
    name: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
  }],
  reminder: {
    enabled: { type: Boolean, default: true },
    minutesBefore: { type: Number, default: 15 },
  },
  recurrence: {
    enabled: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
    },
    interval: Number,
    endDate: Date,
  },
  color: {
    type: String,
    default: '#6366f1',
  },
  isAllDay: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  meetingLink: String,
  notes: String,
}, {
  timestamps: true,
});

// Indexes
eventSchema.index({ user: 1, start: 1, end: 1 });
eventSchema.index({ user: 1, type: 1 });

// Validation
eventSchema.pre('save', function(next) {
  if (this.end <= this.start) {
    next(new Error('End time must be after start time'));
  }
  next();
});

export default mongoose.model('Event', eventSchema);