import mongoose from 'mongoose';
import { logger } from './logger.js';
import dbConfig from '../config/database.js';

/**
 * Connect to MongoDB.
 *
 * The API stays up even when Mongo is unreachable so that:
 *  - health checks and the marketing/demo endpoints keep responding
 *  - local development (and previews) can render the UI without a database
 *
 * Data endpoints will return 503s while `connected` is false.
 */
// Fail queries instantly when Mongo is down instead of buffering for 10s.
mongoose.set('bufferCommands', false);

export const connectDB = async () => {
  const retry = process.env.DB_RETRY !== 'false';

  try {
    const conn = await mongoose.connect(dbConfig.uri, {
      serverSelectionTimeoutMS: 4000,
      ...dbConfig.options,
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);

    if (process.env.NODE_ENV === 'development') {
      logger.warn('Running in DEGRADED mode (no database). Data endpoints will return 503.');
      if (retry) {
        setTimeout(() => {
          connectDB().catch(() => {});
        }, 30000).unref?.();
      }
      return null;
    }

    // Production still fails fast — a silent data outage is worse than a restart.
    process.exit(1);
  }
};

export const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Express middleware that answers 503 with a helpful message instead of
 * hanging or throwing a 500 from Mongoose buffering timeouts.
 */
export const requireDatabase = (req, res, next) => {
  if (isDbConnected()) return next();

  return res.status(503).json({
    success: false,
    message:
      'Database unavailable — start MongoDB (or set MONGODB_URI) to enable data features. The UI remains fully browsable in demo mode.',
    code: 'DB_UNAVAILABLE',
  });
};

export default connectDB;
