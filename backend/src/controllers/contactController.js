import Contact from '../models/Contact.js';
import { asyncHandler } from '../utils/helpers.js';

// @desc    Get all contacts
// @route   GET /api/contacts
// @access  Private
export const getContacts = asyncHandler(async (req, res) => {
  const { search } = req.query;

  let query = { user: req.user.id };

  if (search) {
    query.$text = { $search: search };
  }

  const contacts = await Contact.find(query).sort({ name: 1 });

  res.json({
    success: true,
    count: contacts.length,
    data: contacts,
  });
});

// @desc    Get single contact
// @route   GET /api/contacts/:id
// @access  Private
export const getContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: 'Contact not found',
    });
  }

  res.json({
    success: true,
    data: contact,
  });
});

// @desc    Create contact
// @route   POST /api/contacts
// @access  Private
export const createContact = asyncHandler(async (req, res) => {
  req.body.user = req.user.id;

  const contact = await Contact.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Contact created successfully',
    data: contact,
  });
});

// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private
export const updateContact = asyncHandler(async (req, res) => {
  let contact = await Contact.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: 'Contact not found',
    });
  }

  contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    message: 'Contact updated successfully',
    data: contact,
  });
});

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private
export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: 'Contact not found',
    });
  }

  await contact.deleteOne();

  res.json({
    success: true,
    message: 'Contact deleted successfully',
  });
});