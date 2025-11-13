import React, { useState } from 'react';
import Button from '@components/ui/Button';
import { FaStar } from 'react-icons/fa';

const FeedbackForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    category: 'general',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ rating: 0, category: 'general', message: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Rating
        </label>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              className="focus:outline-none"
            >
              <FaStar
                size={32}
                className={
                  star <= formData.rating
                    ? 'text-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                }
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="general">General Feedback</option>
          <option value="bug">Bug Report</option>
          <option value="feature">Feature Request</option>
          <option value="ui">UI/UX</option>
          <option value="performance">Performance</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Feedback
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows={5}
          className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="Tell us what you think..."
          required
        />
      </div>

      <Button type="submit" variant="primary" fullWidth>
        Submit Feedback
      </Button>
    </form>
  );
};

export default FeedbackForm;