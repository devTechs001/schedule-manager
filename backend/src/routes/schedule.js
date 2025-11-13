import express from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/scheduleController.js';
import { protect } from '../middleware/auth.js';
import { validateEvent } from '../middleware/validation.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getEvents)
  .post(validateEvent, createEvent);

router.route('/:id')
  .get(getEvent)
  .put(validateEvent, updateEvent)
  .delete(deleteEvent);

export default router;