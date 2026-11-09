import multer from 'multer';
import User from '../models/User.js';
import { asyncHandler } from '../utils/helpers.js';
import {
  saveAvatar,
  deleteAvatar,
  openAvatarStream,
  findAvatar,
  validateAvatarFile,
  avatarIdFromUrl,
  MAX_AVATAR_BYTES,
} from '../services/avatarStorage.js';
import { isDbConnected } from '../utils/database.js';

// Keep the bytes in memory: GridFS wants a buffer/stream, and an avatar is
// capped at a few MB, so there is no reason to touch the filesystem first.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AVATAR_BYTES, files: 1 },
});

/** Express middleware for a single image field named `avatar`. */
export const uploadAvatarMiddleware = upload.single('avatar');

// @desc    Upload / replace the signed-in user's avatar
// @route   POST /api/avatars
// @access  Private
export const uploadAvatar = asyncHandler(async (req, res) => {
  const problem = validateAvatarFile(req.file);
  if (problem) {
    return res.status(400).json({ success: false, message: problem });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Replacing an avatar should not leak the previous blob.
  const previousId = avatarIdFromUrl(user.avatar);

  const stored = await saveAvatar(req.file, user._id);
  user.avatar = stored.url;
  await user.save();

  if (previousId) await deleteAvatar(previousId);

  res.status(201).json({
    success: true,
    message: 'Avatar updated',
    data: { avatar: stored.url, user },
  });
});

// @desc    Remove the signed-in user's avatar
// @route   DELETE /api/avatars
// @access  Private
export const removeAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const currentId = avatarIdFromUrl(user.avatar);
  user.avatar = null;
  await user.save();

  if (currentId) await deleteAvatar(currentId);

  res.json({
    success: true,
    message: 'Avatar removed',
    data: { avatar: null, user },
  });
});

// @desc    Stream an avatar from GridFS
// @route   GET /api/avatars/:id
// @access  Public (the id is an unguessable ObjectId; avatars are not secret)
export const getAvatar = asyncHandler(async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({ success: false, message: 'Database unavailable' });
  }

  const meta = await findAvatar(req.params.id);
  if (!meta) {
    return res.status(404).json({ success: false, message: 'Avatar not found' });
  }

  const stream = openAvatarStream(req.params.id);
  if (!stream) {
    return res.status(404).json({ success: false, message: 'Avatar not found' });
  }

  // Avatars are content-addressed by ObjectId and never change in place, so
  // they can be cached hard. `immutable` avoids a revalidation round trip.
  res.set('Content-Type', meta.contentType || 'application/octet-stream');
  if (meta.length) res.set('Content-Length', String(meta.length));
  res.set('Cache-Control', 'public, max-age=31536000, immutable');

  stream.on('error', () => {
    if (!res.headersSent) {
      res.status(404).json({ success: false, message: 'Avatar not found' });
    } else {
      res.end();
    }
  });
  stream.pipe(res);
});

export default { uploadAvatar, removeAvatar, getAvatar, uploadAvatarMiddleware };
