import React, { useState } from 'react';
import { FaShieldAlt, FaUsers, FaCheck, FaTimes, FaEdit, FaPlus, FaTrash } from 'react-icons/fa';

const PermissionManager = ({ roles: initialRoles = [], onUpdate, onCreateRole }) => {
  const permissions = [
    { id: 'tasks.view', name: 'View Tasks', category: 'Tasks' },
    { id: 'tasks.create', name: 'Create Tasks', category: 'Tasks' },
    { id: 'tasks.edit', name: 'Edit Tasks', category: 'Tasks' },
    { id: 'tasks.delete', name: 'Delete Tasks', category: 'Tasks' },
    { id: 'calendar.view', name: 'View Calendar', category: 'Calendar' },
    { id: 'calendar.create', name: 'Create Events', category: 'Calendar' },
    { id: 'calendar.edit', name: 'Edit Events', category: 'Calendar' },
    { id: 'users.view', name: 'View Users', category: 'Users' },
    { id: 'users.manage', name: 'Manage Users', category: 'Users' },
    { id: 'settings.view', name: 'View Settings', category: 'Settings' },
    { id: 'settings.edit', name: 'Edit Settings', category: 'Settings' },
  ];

  const defaultRoles = [
    { id: 1, name: 'Admin', permissions: permissions.map(p => p.id), color: 'red', userCount: 3 },
    { id: 2, name: 'Manager', permissions: ['tasks.view', 'tasks.create', 'tasks.edit', 'calendar.view', 'calendar.create', 'calendar.edit', 'users.view'], color: 'blue', userCount: 8 },
    { id: 3, name: 'Member', permissions: ['tasks.view', 'tasks.create', 'calendar.view', 'calendar.create'], color: 'green', userCount: 24 },
    { id: 4, name: 'Viewer', permissions: ['tasks.view', 'calendar.view'], color: 'gray', userCount: 12 },
  ];

  const [roles, setRoles] = useState(initialRoles.length > 0 ? initialRoles : defaultRoles);
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [editMode, setEditMode] = useState(false);

  const togglePermission = (permissionId) => {
    if (!editMode) return;
    
    const updatedPermissions = selectedRole.permissions.includes(permissionId)
      ? selectedRole.permissions.filter(p => p !== permissionId)
      : [...selectedRole.permissions, permissionId];
    
    const updatedRole = { ...selectedRole, permissions: updatedPermissions };
    setSelectedRole(updatedRole);
    setRoles(roles.map(r => r.id === selectedRole.id ? updatedRole : r));
    onUpdate?.(updatedRole);
  };

  const groupedPermissions = permissions.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaShieldAlt className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Permission Manager</h3>
        </div>
        <button
          onClick={onCreateRole}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm"
        >
          <FaPlus /> New Role
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Roles List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Roles</h4>
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={`w-full p-3 rounded-lg text-left transition-colors ${
                selectedRole?.id === role.id
                  ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500'
                  : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-${role.color}-500`} />
                <span className="font-medium text-gray-900 dark:text-white">{role.name}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <FaUsers />
                <span>{role.userCount} users</span>
              </div>
            </button>
          ))}
        </div>

        {/* Permissions Grid */}
        <div className="col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Permissions for <span className="text-primary-600">{selectedRole?.name}</span>
            </h4>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                editMode
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <FaEdit /> {editMode ? 'Save Changes' : 'Edit'}
            </button>
          </div>

          <div className="space-y-4">
            {Object.entries(groupedPermissions).map(([category, perms]) => (
              <div key={category} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">{category}</h5>
                <div className="grid grid-cols-2 gap-2">
                  {perms.map((perm) => {
                    const hasPermission = selectedRole?.permissions.includes(perm.id);
                    return (
                      <button
                        key={perm.id}
                        onClick={() => togglePermission(perm.id)}
                        disabled={!editMode}
                        className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                          hasPermission
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-600 text-gray-500'
                        } ${editMode ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                      >
                        <span className="text-sm">{perm.name}</span>
                        {hasPermission ? (
                          <FaCheck className="text-green-500" />
                        ) : (
                          <FaTimes className="text-gray-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionManager;

