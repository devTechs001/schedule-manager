import React from 'react';
import { FaEnvelope, FaPhone, FaBuilding, FaEdit, FaTrash } from 'react-icons/fa';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';

const ContactCard = ({ contact, onEdit, onDelete }) => {
  return (
    <Card hoverable>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {contact.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {contact.name}
            </h3>
            {contact.company && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {contact.company}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <FaEnvelope className="mr-2 text-gray-400" size={14} />
          <a href={`mailto:${contact.email}`} className="hover:text-primary-600">
            {contact.email}
          </a>
        </div>
        {contact.phone && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <FaPhone className="mr-2 text-gray-400" size={14} />
            <a href={`tel:${contact.phone}`} className="hover:text-primary-600">
              {contact.phone}
            </a>
          </div>
        )}
      </div>

      {contact.tags && contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {contact.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" size="sm">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onEdit(contact)}
          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
        >
          <FaEdit size={16} />
        </button>
        <button
          onClick={() => onDelete(contact._id)}
          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
        >
          <FaTrash size={16} />
        </button>
      </div>
    </Card>
  );
};

export default ContactCard;