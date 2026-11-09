import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { startDemoSession } from '../controllers/demoController.js';

const router = express.Router();

/*
 * The demo sandbox is a development aid. In production the endpoint is not
 * registered at all, so it cannot be used to mint a session even if someone
 * calls the API directly. Registering it conditionally (rather than returning
 * 403) means the route simply does not exist in a production build.
 */
const DEMO_ROUTES_ENABLED = process.env.NODE_ENV !== 'production';

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
if (DEMO_ROUTES_ENABLED) {
  router.post('/demo', startDemoSession);
}
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

export default router;