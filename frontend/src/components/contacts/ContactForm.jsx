import React, { useState, useEffect } from 'react';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import { FaSave, FaTimes } from 'react-icons/fa';

const ContactForm = ({ contact, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    notes: '',
    tags: [],
  });

  useEffect(() => {
    if (contact) {
      setFormData(contact);
    }
  }, [contact]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="John Doe"
        required
      />

      <Input
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="john@example.com"
        required
      />

      <Input
        label="Phone"
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="+1 234 567 8900"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder="Company Name"
        />

        <Input
          label="Position"
          name="position"
          value={formData.position}
          onChange={handleChange}
          placeholder="Job Title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Additional notes..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" icon={<FaTimes />} onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" icon={<FaSave />}>
          {contact ? 'Update' : 'Create'} Contact
        </Button>
      </div>
    </form>
  );
};

export default ContactForm;