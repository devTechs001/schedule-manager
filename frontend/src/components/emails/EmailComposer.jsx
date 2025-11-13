import React, { useState } from 'react';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import { FaPaperPlane, FaTimes, FaPaperclip } from 'react-icons/fa';
import toast from 'react-hot-toast';

const EmailComposer = ({ onSend, onClose, replyTo }) => {
  const [formData, setFormData] = useState({
    to: replyTo?.from || '',
    subject: replyTo ? `Re: ${replyTo.subject}` : '',
    body: '',
  });
  const [attachments, setAttachments] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSend({ ...formData, attachments });
      toast.success('Email sent successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to send email');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setAttachments([...attachments, ...Array.from(e.target.files)]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {replyTo ? 'Reply to Email' : 'New Email'}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <FaTimes />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <Input
          label="To"
          name="to"
          value={formData.to}
          onChange={handleChange}
          placeholder="recipient@example.com"
          required
        />

        <Input
          label="Subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Email subject"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Message
          </label>
          <textarea
            name="body"
            value={formData.body}
            onChange={handleChange}
            rows={10}
            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Write your message..."
            required
          />
        </div>

        {/* Attachments */}
        <div>
          <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600">
            <FaPaperclip />
            <span>Attach files</span>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {attachments.map((file, index) => (
                <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={<FaPaperPlane />}>
            Send Email
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmailComposer;