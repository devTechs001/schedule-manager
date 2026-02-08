import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
  },
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ['meeting', 'task', 'reminder', 'block', 'personal'],
    default: 'meeting',
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  allDay: {
    type: Boolean,
    default: false,
  },
  location: {
    type: String,
    trim: true,
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    email: String,
    name: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'tentative'],
      default: 'pending',
    },
    responseAt: Date,
  }],
  recurrence: {
    enabled: {
      type: Boolean,
      default: false,
    },
    rule: String, // RRULE format
    exceptions: [Date],
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'push', 'desktop'],
      default: 'push',
    },
    minutesBefore: {
      type: Number,
      default: 15,
    },
  }],
  videoConference: {
    provider: {
      type: String,
      enum: ['zoom', 'meet', 'teams', 'custom'],
    },
    url: String,
    meetingId: String,
    password: String,
  },
  linkedTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  },
  color: {
    type: String,
    default: '#3b82f6',
  },
  aiGenerated: {
    type: Boolean,
    default: false,
  },
  aiMetadata: {
    confidence: Number,
    suggestedBy: String,
    reason: String,
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled',
  },
}, {
  timestamps: true,
});

// Indexes
calendarEventSchema.index({ user: 1, start: 1, end: 1 });
calendarEventSchema.index({ workspace: 1, start: 1 });
calendarEventSchema.index({ 'attendees.user': 1 });
calendarEventSchema.index({ linkedTask: 1 });

// Validation
calendarEventSchema.pre('save', function(next) {
  if (this.end <= this.start) {
    next(new Error('End time must be after start time'));
  }
  next();
});

// Methods
calendarEventSchema.methods.updateAttendeeStatus = function(userId, status) {
  const attendee = this.attendees.find(a => 
    a.user && a.user.toString() === userId.toString()
  );
  if (attendee) {
    attendee.status = status;
    attendee.responseAt = new Date();
  }
  return this.save();
};

calendarEventSchema.methods.isConflicting = async function() {
  const Event = this.constructor;
  const conflicts = await Event.find({
    user: this.user,
    _id: { $ne: this._id },
    $or: [
      { start: { $lt: this.end, $gte: this.start } },
      { end: { $gt: this.start, $lte: this.end } },
      { start: { $lte: this.start }, end: { $gte: this.end } },
    ],
  });
  return conflicts.length > 0;
};

export default mongoose.model('CalendarEvent', calendarEventSchema);

