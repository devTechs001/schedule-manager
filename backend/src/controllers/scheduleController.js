import Event from '../models/Event.js';
import { asyncHandler } from '../utils/helpers.js';

// @desc    Get all events
// @route   GET /api/schedule
// @access  Private
export const getEvents = asyncHandler(async (req, res) => {
  const { start, end, type } = req.query;

  let query = { user: req.user.id };

  if (type) query.type = type;

  if (start && end) {
    query.start = { $gte: new Date(start), $lte: new Date(end) };
  }

  const events = await Event.find(query).sort({ start: 1 });

  res.json({
    success: true,
    count: events.length,
    data: events,
  });
});

// @desc    Get single event
// @route   GET /api/schedule/:id
// @access  Private
export const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found',
    });
  }

  res.json({
    success: true,
    data: event,
  });
});

// @desc    Create event
// @route   POST /api/schedule
// @access  Private
export const createEvent = asyncHandler(async (req, res) => {
  req.body.user = req.user.id;

  const event = await Event.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    data: event,
  });
});

// @desc    Update event
// @route   PUT /api/schedule/:id
// @access  Private
export const updateEvent = asyncHandler(async (req, res) => {
  let event = await Event.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found',
    });
  }

  event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    message: 'Event updated successfully',
    data: event,
  });
});

// @desc    Delete event
// @route   DELETE /api/schedule/:id
// @access  Private
export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found',
    });
  }

  await event.deleteOne();

  res.json({
    success: true,
    message: 'Event deleted successfully',
  });
});