import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import emailRoutes from './routes/emails.js';
import contactRoutes from './routes/contacts.js';
import scheduleRoutes from './routes/schedule.js';
import aiRoutes from './routes/ai.js';
import feedbackRoutes from './routes/feedback.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import rateLimiter, { authLimiter } from './middleware/rateLimit.js';

// Import utils
import { logger } from './utils/logger.js';
import { connectDB } from './utils/database.js';

// Initialize express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
  transports: ['websocket', 'polling'],
});

// Connect to Database
connectDB();

// Trust proxy (important for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

// CORS Configuration
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:5173',
      'http://localhost:3000',
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize data
app.use(mongoSanitize());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
  }));
}

// Static files (for uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Documentation
app.get('/', (req, res) => {
  res.json({
    message: 'AI Schedule Manager API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      tasks: '/api/tasks',
      emails: '/api/emails',
      contacts: '/api/contacts',
      schedule: '/api/schedule',
      ai: '/api/ai',
      feedback: '/api/feedback',
    },
    documentation: '/api/docs',
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const healthcheck = {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    memory: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
    },
  };
  res.json(healthcheck);
});

// Rate limiting
app.use('/api/', rateLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/feedback', feedbackRoutes);

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  // Join user room
  socket.on('join', (userId) => {
    socket.join(`user-${userId}`);
    logger.info(`User ${userId} joined their room`);
    
    socket.emit('joined', {
      message: 'Successfully connected to real-time updates',
      userId,
    });
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    socket.to(`user-${data.userId}`).emit('user-typing', data);
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    logger.info(`Socket disconnected: ${socket.id}, Reason: ${reason}`);
  });

  // Handle errors
  socket.on('error', (error) => {
    logger.error(`Socket error: ${socket.id}`, error);
  });
});

// Make io accessible in routes
app.set('io', io);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Error Handler (must be last)
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Received shutdown signal, closing server gracefully...');
  
  httpServer.close(() => {
    logger.info('HTTP server closed');
    
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  gracefulShutdown();
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  gracefulShutdown();
});

// Start Server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  logger.info(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🤖 AI Schedule Manager API Server                      ║
║                                                           ║
║   Environment: ${process.env.NODE_ENV?.toUpperCase().padEnd(10)}                                 ║
║   Port:        ${PORT.toString().padEnd(10)}                                 ║
║   URL:         http://localhost:${PORT}                       ║
║                                                           ║
║   Status:      ✓ Running                                 ║
║   Database:    ✓ Connected                               ║
║   Socket.IO:   ✓ Ready                                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Export for testing
export { app, io };
export default httpServer;