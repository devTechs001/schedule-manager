import dotenv from 'dotenv';
import { resolveJwtSecret } from './jwtSecret.js';

// Load environment variables if not already loaded
if (!process.env.MONGODB_URI) {
  dotenv.config();
}

// Configuration object for the backend
const config = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT) || 5000,
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development',
  },

  // Database Configuration
  database: {
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-schedule-manager',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  // JWT Configuration
  jwt: {
    secret:
      // Delegated so there is exactly one place that can decide this, and so a
      // production misconfiguration throws instead of silently using a secret
      // that is published in this repository.
      resolveJwtSecret(),
    expiresIn: process.env.JWT_EXPIRE || '7d',
  },

  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || null, // Will be checked in the service
    model: process.env.OPENAI_MODEL || 'gpt-4',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000,
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
  },

  // Email Configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    fromName: process.env.EMAIL_FROM_NAME || 'AI Schedule Manager',
  },

  // Client Configuration
  client: {
    url: process.env.CLIENT_URL || 'http://localhost:5173',
  },

  // File Upload Configuration
  upload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB default
    path: process.env.UPLOAD_PATH || './uploads',
  },

  /*
   * There is no `rateLimit` block here on purpose. It used to read
   * RATE_LIMIT_WINDOW_MS / RATE_LIMIT_MAX_REQUESTS and was never consumed by
   * anything: the real limits live in middleware/rateLimit.js, which reads
   * RATE_LIMIT_MAX / AUTH_RATE_LIMIT_MAX. That left .env.example documenting
   * two knobs that changed nothing, while the knobs that did matter were
   * undocumented. Same story for a `session` block that read SESSION_SECRET
   * for an API that has no session middleware.
   */

  // External Services Configuration
  services: {
    sentryDsn: process.env.SENTRY_DSN || null,
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || null,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || null,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || null,
      clientSecret: process.env.GITHUB_CLIENT_SECRET || null,
    },
  },

  // Redis Configuration (for caching and sessions)
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

export default config;