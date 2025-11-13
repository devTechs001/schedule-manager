import mongoose from 'mongoose';
import { logger } from './logger.js';
import dbConfig from '../config/database.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(dbConfig.uri, dbConfig.options);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};