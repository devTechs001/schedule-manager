import express from 'express';
import Workspace from '../models/Workspace.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all workspaces for current user
router.get('/', protect, async (req, res) => {
  try {
    const workspaces = await Workspace.findByMember(req.user._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');
    
    res.json({ success: true, data: workspaces });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single workspace
router.get('/:id', protect, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');
    
    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found' });
    }

    // Check if user is a member
    const isMember = workspace.members.some(
      m => m.user._id.toString() === req.user._id.toString()
    );
    
    if (!isMember && workspace.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    res.json({ success: true, data: workspace });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create workspace
router.post('/', protect, async (req, res) => {
  try {
    const workspace = await Workspace.create({
      ...req.body,
      owner: req.user._id,
      members: [{
        user: req.user._id,
        role: 'owner',
        permissions: ['read', 'write', 'delete', 'invite', 'manage'],
      }],
    });

    await workspace.populate('owner', 'name email');
    await workspace.populate('members.user', 'name email');

    res.status(201).json({ success: true, data: workspace });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update workspace
router.put('/:id', protect, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    
    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found' });
    }

    // Check permissions
    if (!workspace.hasPermission(req.user._id, 'manage')) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }

    Object.assign(workspace, req.body);
    await workspace.save();
    
    await workspace.populate('owner', 'name email');
    await workspace.populate('members.user', 'name email');

    res.json({ success: true, data: workspace });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete workspace
router.delete('/:id', protect, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    
    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found' });
    }

    // Only owner can delete
    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Only owner can delete workspace' });
    }

    await workspace.deleteOne();
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add member to workspace
router.post('/:id/members', protect, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    
    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found' });
    }

    if (!workspace.hasPermission(req.user._id, 'invite')) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }

    await workspace.addMember(req.body.userId, req.body.role || 'member');
    await workspace.populate('members.user', 'name email');

    res.json({ success: true, data: workspace });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Remove member from workspace
router.delete('/:id/members/:userId', protect, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    
    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found' });
    }

    if (!workspace.hasPermission(req.user._id, 'manage')) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }

    await workspace.removeMember(req.params.userId);
    res.json({ success: true, data: workspace });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;

