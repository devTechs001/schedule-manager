import express from 'express';
import {
  submitFeedback,
  getUserFeedback,
  getAllFeedback,
} from '../controllers/feedbackController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getUserFeedback)
  .post(submitFeedback);

router.get('/all', authorize('admin'), getAllFeedback);

export default router;