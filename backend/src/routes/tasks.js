import express from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { requireDatabase } from '../utils/database.js';
import { validateTask, validateTaskUpdate } from '../middleware/validation.js';

const router = express.Router();

router.use(protect);
router.use(requireDatabase);

router.get('/stats', getTaskStats);

router.route('/')
  .get(getTasks)
  .post(validateTask, createTask);

router.route('/:id')
  .get(getTask)
  .put(validateTaskUpdate, updateTask)
  .delete(deleteTask);

export default router;