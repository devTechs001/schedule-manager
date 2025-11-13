import React, { useState } from 'react';
import { FaUsers, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';

const ContactGroups = ({ groups, onAddGroup, onEditGroup, onDeleteGroup }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      onAddGroup({ name: newGroupName, contactCount: 0 });
      setNewGroupName('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <FaUsers className="mr-2" />
          Contact Groups
        </h3>
        <Button
          variant="primary"
          size="sm"
          icon={<FaPlus />}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          Add Group
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-4 flex space-x-2">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Group name"
            className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
          />
          <Button onClick={handleAddGroup} size="sm">Add</Button>
          <Button onClick={() => setShowAddForm(false)} variant="secondary" size="sm">
            Cancel
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {groups.map((group) => (
          <div
            key={group._id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="font-medium text-gray-900 dark:text-white">
                {group.name}
              </span>
              <Badge variant="secondary" size="sm">
                {group.contactCount} contacts
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEditGroup(group)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
              >
                <FaEdit size={14} />
              </button>
              <button
                onClick={() => onDeleteGroup(group._id)}
                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                <FaTrash size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactGroups;