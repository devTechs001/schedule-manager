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
    permissions: {
      type: [{
        type: String,
        enum: ['read', 'write', 'delete', 'invite', 'manage'],
      }],
      // Without a default, a member created by addMember() had `permissions`
      // undefined, and hasPermission() below then threw on `.includes`.
      default: ['read'],
    },
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
  const target = userId.toString();
  const exists = this.members.some((m) => memberUserId(m) === target);
  if (!exists) {
    // Give the new member the permissions their role implies; an invite-only
    // member with no permissions could never do anything.
    this.members.push({
      user: userId,
      role,
      permissions: role === 'viewer' ? ['read'] : ['read', 'write'],
    });
    this.stats.totalMembers = this.members.length;
  }
  return this.save();
};

workspaceSchema.methods.removeMember = function(userId) {
  const target = userId.toString();
  this.members = this.members.filter((m) => memberUserId(m) !== target);
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

/**
 * Resolve a member's user id, whether `user` is still an ObjectId or has been
 * populated into a document. Calling .toString() on a populated doc yields
 * "[object Object]", so it never matched the caller.
 */
const memberUserId = (member) => {
  const user = member?.user;
  if (!user) return null;
  return (user._id || user).toString();
};

workspaceSchema.methods.hasPermission = function(userId, permission) {
  const target = userId.toString();
  const member = this.members.find((m) => memberUserId(m) === target);
  if (!member) return false;
  if (member.role === 'owner' || member.role === 'admin') return true;
  // Fail closed if a legacy document holds no permissions array.
  return Array.isArray(member.permissions) && member.permissions.includes(permission);
};

// Statics
workspaceSchema.statics.findByMember = function(userId) {
  return this.find({ 'members.user': userId });
};

export default mongoose.model('Workspace', workspaceSchema);

