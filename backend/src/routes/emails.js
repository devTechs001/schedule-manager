import express from 'express';
import {
  getEmails,
  getEmail,
  sendEmailMessage,
  markAsRead,
  toggleStar,
  deleteEmail,
} from '../controllers/emailController.js';
import { protect } from '../middleware/auth.js';
import { validateEmail } from '../middleware/validation.js';

const router = express.Router();

router.use(protect);

router.get('/', getEmails);
router.post('/send', validateEmail, sendEmailMessage);

router.route('/:id')
  .get(getEmail)
  .delete(deleteEmail);

router.patch('/:id/read', markAsRead);
router.patch('/:id/star', toggleStar);

export default router;