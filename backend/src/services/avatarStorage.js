/**
 * Avatar storage in MongoDB GridFS.
 *
 * Why GridFS instead of writing to disk: uploaded files must survive a restart
 * or redeploy. A container filesystem is ephemeral, so a disk-backed upload
 * silently disappears (and breaks every user's avatar) the next time the app
 * ships. GridFS stores the bytes in the same database as everything else, so a
 * single persistent Mongo instance is the only requirement.
 *
 * The public URL is `/api/avatars/:id` — a stable, cacheable path that streams
 * straight out of GridFS. We deliberately do not store the bytes as a base64
 * data URL on the user document: it bloats every /auth/me response and cannot
 * be cached independently.
 */
import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { logger } from '../utils/logger.js';

const BUCKET_NAME = 'avatars';

/** Max avatar size. Small on purpose — these render at 40–96px. */
export const MAX_AVATAR_BYTES = 4 * 1024 * 1024; // 4 MB

/** MIME types we accept for an avatar. Anything else is rejected outright. */
export const ALLOWED_AVATAR_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
]);

let bucket = null;

/**
 * Lazily create the bucket. Creating it eagerly at import time would throw when
 * Mongo is unreachable, taking down the whole API — the app must still boot in
 * degraded mode.
 */
const getBucket = () => {
  if (!bucket) {
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database not connected');
    bucket = new GridFSBucket(db, { bucketName: BUCKET_NAME });
  }
  return bucket;
};

/** Reset the cached handle (tests, or after a reconnect). */
export const resetBucket = () => {
  bucket = null;
};

/**
 * Validate an upload before it reaches GridFS.
 * Returns an error message, or null when the file is acceptable.
 */
export const validateAvatarFile = (file) => {
  if (!file || !file.buffer || !file.buffer.length) return 'No image was uploaded.';
  if (!ALLOWED_AVATAR_TYPES.has(file.mimetype)) {
    return 'Unsupported image type. Use JPEG, PNG, WebP or GIF.';
  }
  if (file.size > MAX_AVATAR_BYTES) {
    const mb = (MAX_AVATAR_BYTES / 1024 / 1024).toFixed(0);
    return `Image is too large. Maximum size is ${mb} MB.`;
  }
  return null;
};

/**
 * Write an avatar to GridFS.
 * @returns {Promise<{id: string, url: string, contentType: string, size: number}>}
 */
export const saveAvatar = (file, userId) =>
  new Promise((resolve, reject) => {
    const ext = ALLOWED_AVATAR_TYPES.get(file.mimetype) || 'bin';
    const filename = `avatar-${userId}-${Date.now()}.${ext}`;
    let stream;

    try {
      stream = getBucket().openUploadStream(filename, {
        contentType: file.mimetype,
        metadata: {
          userId: String(userId),
          originalName: file.originalname,
          uploadedAt: new Date(),
        },
      });
    } catch (error) {
      reject(error);
      return;
    }

    stream.on('error', reject);
    stream.on('finish', () => {
      const id = String(stream.id);
      resolve({
        id,
        url: `/api/avatars/${id}`,
        contentType: file.mimetype,
        size: file.size,
      });
    });
    stream.end(file.buffer);
  });

/**
 * Delete an avatar by id. Never throws: cleanup failure must not fail the
 * request that triggered it (e.g. replacing an avatar).
 */
export const deleteAvatar = async (id) => {
  if (!id || !ObjectId.isValid(id)) return false;
  try {
    await getBucket().delete(new ObjectId(id));
    return true;
  } catch (error) {
    // "FileNotFound" is fine — it was already removed.
    if (error?.code !== 'ENOENT' && !/FileNotFound/i.test(error?.message || '')) {
      logger.warn(`Could not delete avatar ${id}: ${error.message}`);
    }
    return false;
  }
};

/**
 * Open a read stream for an avatar. Resolves null when the id is invalid or the
 * file does not exist, so the route can answer 404 without throwing.
 */
export const openAvatarStream = (id) => {
  if (!id || !ObjectId.isValid(id)) return null;
  try {
    return getBucket().openDownloadStream(new ObjectId(id));
  } catch {
    return null;
  }
};

/** Look up the stored metadata (content type and length) before streaming. */
export const findAvatar = async (id) => {
  if (!id || !ObjectId.isValid(id)) return null;
  try {
    const files = await getBucket().find({ _id: new ObjectId(id) }).limit(1).toArray();
    return files[0] || null;
  } catch {
    return null;
  }
};

/**
 * Extract the GridFS id from a stored avatar URL.
 * Accepts `/api/avatars/<id>` and legacy absolute URLs; returns null otherwise
 * (e.g. an external image URL the user pasted).
 */
export const avatarIdFromUrl = (url) => {
  if (typeof url !== 'string') return null;
  const match = url.match(/\/api\/avatars\/([a-f0-9]{24})/i);
  return match ? match[1] : null;
};

export default {
  saveAvatar,
  deleteAvatar,
  openAvatarStream,
  findAvatar,
  validateAvatarFile,
  avatarIdFromUrl,
  resetBucket,
  MAX_AVATAR_BYTES,
  ALLOWED_AVATAR_TYPES,
};
