import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'completed'],
    default: 'todo',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  dueDate: {
    type: Date,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now },
  }],
  subtasks: [{
    title: String,
    completed: { type: Boolean, default: false },
  }],
  aiScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  completedAt: Date,
}, {
  timestamps: true,
});

// Indexes
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, priority: 1 });
taskSchema.index({ user: 1, dueDate: 1 });

// Virtual for checking if overdue
taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && this.status !== 'completed';
});

// Update completedAt when status changes to completed
taskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed') {
    this.completedAt = new Date();
  }
  next();
});

taskSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Task', taskSchema);