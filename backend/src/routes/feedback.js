import express from 'express';
import {
  submitFeedback,
  submitPublicContact,
  getUserFeedback,
  getAllFeedback,
} from '../controllers/feedbackController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public — used by the marketing site contact form
router.post('/contact', submitPublicContact);

// Authenticated feedback routes
router.route('/')
  .get(protect, getUserFeedback)
  .post(protect, submitFeedback);

router.get('/all', protect, authorize('admin'), getAllFeedback);

export default router;
