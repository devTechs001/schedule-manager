/**
 * Rate limiting.
 *
 * The limits were hardcoded to development values with no production split:
 * 1000 requests per 15 minutes generally, and 100 login attempts per 15
 * minutes. The comment said "Increased for development" but nothing branched
 * on the environment, so production shipped the development numbers.
 *
 * 100 attempts per IP per 15 minutes is 9,600 password guesses per day per IP
 * against /api/auth/login, comfortably enough for credential stuffing, and the
 * limiter was the only thing standing in the way — there is no lockout or
 * captcha behind it.
 *
 * Production now gets strict limits. Development keeps the loose ones so the
 * test suite and local reload loops are not throttled. Both can be overridden
 * per deployment with RATE_LIMIT_MAX / AUTH_RATE_LIMIT_MAX.
 */
import rateLimit from 'express-rate-limit';

const isProd = process.env.NODE_ENV === 'production';

const positiveInt = (raw, fallback) => {
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/** General API ceiling. */
const API_MAX = positiveInt(process.env.RATE_LIMIT_MAX, isProd ? 300 : 1000);

/** Login / register ceiling — the brute-force surface. */
const AUTH_MAX = positiveInt(process.env.AUTH_RATE_LIMIT_MAX, isProd ? 10 : 100);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: API_MAX,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: AUTH_MAX,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // A successful login should not count toward the lockout: someone who logs in
  // and out repeatedly is not attacking, and only failures indicate guessing.
  skipSuccessfulRequests: true,
});

export const limits = { API_MAX, AUTH_MAX, isProd };

export default limiter;
