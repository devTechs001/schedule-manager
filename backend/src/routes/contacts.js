import express from 'express';
import {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
} from '../controllers/contactController.js';
import { protect } from '../middleware/auth.js';
import { validateContact } from '../middleware/validation.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getContacts)
  .post(validateContact, createContact);

router.route('/:id')
  .get(getContact)
  .put(validateContact, updateContact)
  .delete(deleteContact);

export default router;