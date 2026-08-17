import express from 'express';
import {
  chat,
  getSuggestions,
  calculatePriority,
  getInsights,
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public endpoint for testing (without authentication)
router.get('/insights/public', getInsights);

// Protected endpoints
router.use(protect);
router.post('/chat', chat);
router.post('/suggestions', getSuggestions);
router.post('/priority', calculatePriority);
router.get('/insights', getInsights);

export default router;