import express from 'express';
import CalendarEvent from '../models/CalendarEvent.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all events for current user
router.get('/events', protect, async (req, res) => {
  try {
    const { start, end, type } = req.query;
    const query = { user: req.user._id };

    if (start && end) {
      query.start = { $gte: new Date(start), $lte: new Date(end) };
    }

    if (type) {
      query.type = type;
    }

    const events = await CalendarEvent.find(query)
      .populate('attendees.user', 'name email')
      .populate('linkedTask')
      .sort({ start: 1 });

    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single event
router.get('/events/:id', protect, async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id)
      .populate('attendees.user', 'name email')
      .populate('linkedTask');

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    // Check if user has access
    const hasAccess = event.user.toString() === req.user._id.toString() ||
      event.attendees.some(a => a.user && a.user.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create event
router.post('/events', protect, async (req, res) => {
  try {
    const event = await CalendarEvent.create({
      ...req.body,
      user: req.user._id,
    });

    // Check for conflicts
    const hasConflict = await event.isConflicting();
    if (hasConflict) {
      await event.deleteOne();
      return res.status(400).json({
        success: false,
        error: 'Event conflicts with existing events',
      });
    }

    await event.populate('attendees.user', 'name email');
    await event.populate('linkedTask');

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update event
router.put('/events/:id', protect, async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    Object.assign(event, req.body);
    await event.save();

    await event.populate('attendees.user', 'name email');
    await event.populate('linkedTask');

    res.json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete event
router.delete('/events/:id', protect, async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    await event.deleteOne();
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update attendee status
router.patch('/events/:id/attendees/:attendeeId', protect, async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    await event.updateAttendeeStatus(req.params.attendeeId, req.body.status);
    await event.populate('attendees.user', 'name email');

    res.json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;

