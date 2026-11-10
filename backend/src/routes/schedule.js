import express from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/scheduleController.js';
import { protect } from '../middleware/auth.js';
import { requireDatabase } from '../utils/database.js';
import { validateEvent, validateEventUpdate } from '../middleware/validation.js';

const router = express.Router();

router.use(protect);
router.use(requireDatabase);

router.route('/')
  .get(getEvents)
  .post(validateEvent, createEvent);

router.route('/:id')
  .get(getEvent)
  .put(validateEventUpdate, updateEvent)
  .delete(deleteEvent);

export default router;