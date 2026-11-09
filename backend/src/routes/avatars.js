import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  uploadAvatar,
  removeAvatar,
  getAvatar,
  uploadAvatarMiddleware,
} from '../controllers/avatarController.js';

const router = express.Router();

// Stream an avatar. Public so <img src> works without attaching a token —
// browsers cannot set an Authorization header on an image request.
router.get('/:id', getAvatar);

// Mutations require a real session.
router.post('/', protect, uploadAvatarMiddleware, uploadAvatar);
router.delete('/', protect, removeAvatar);

export default router;
