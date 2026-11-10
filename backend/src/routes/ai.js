import express from 'express';
import {
  chat,
  getSuggestions,
  calculatePriority,
  getInsights,
  analyzeDocumentText,
  draftRepliesToMessage,
  summariseMeetingTranscript,
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
router.post('/document', analyzeDocumentText);
router.post('/replies', draftRepliesToMessage);
router.post('/meeting', summariseMeetingTranscript);

export default router;