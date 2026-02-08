import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workspace name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'viewer'],
      default: 'member',
    },
    permissions: [{
      type: String,
      enum: ['read', 'write', 'delete', 'invite', 'manage'],
    }],
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  settings: {
    visibility: {
      type: String,
      enum: ['private', 'team', 'public'],
      default: 'private',
    },
    allowInvites: {
      type: Boolean,
      default: true,
    },
    requireApproval: {
      type: Boolean,
      default: false,
    },
  },
  integrations: {
    googleCalendar: {
      enabled: Boolean,
      accessToken: String,
      refreshToken: String,
      calendarId: String,
    },
    outlook: {
      enabled: Boolean,
      accessToken: String,
      refreshToken: String,
      calendarId: String,
    },
    slack: {
      enabled: Boolean,
      webhookUrl: String,
      channelId: String,
    },
  },
  stats: {
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    totalMembers: { type: Number, default: 1 },
  },
}, {
  timestamps: true,
});

// Indexes
workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ 'members.user': 1 });
workspaceSchema.index({ name: 'text', description: 'text' });

// Methods
workspaceSchema.methods.addMember = function(userId, role = 'member') {
  const exists = this.members.some(m => m.user.toString() === userId.toString());
  if (!exists) {
    this.members.push({ user: userId, role });
    this.stats.totalMembers = this.members.length;
  }
  return this.save();
};

workspaceSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(m => m.user.toString() !== userId.toString());
  this.stats.totalMembers = this.members.length;
  return this.save();
};

workspaceSchema.methods.updateMemberRole = function(userId, role) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  if (member) {
    member.role = role;
  }
  return this.save();
};

workspaceSchema.methods.hasPermission = function(userId, permission) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  if (!member) return false;
  if (member.role === 'owner' || member.role === 'admin') return true;
  return member.permissions.includes(permission);
};

// Statics
workspaceSchema.statics.findByMember = function(userId) {
  return this.find({ 'members.user': userId });
};

export default mongoose.model('Workspace', workspaceSchema);

