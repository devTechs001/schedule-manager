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
import { validateTask } from '../middleware/validation.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(validateTask, createTask);

router.get('/stats', getTaskStats);

router.route('/:id')
  .get(getTask)
  .put(validateTask, updateTask)
  .delete(deleteTask);

export default router;