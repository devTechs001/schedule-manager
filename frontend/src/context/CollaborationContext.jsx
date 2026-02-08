import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CollaborationContext = createContext();

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
};

export const CollaborationProvider = ({ children }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [sharedItems, setSharedItems] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);

  // Simulate real-time presence
  useEffect(() => {
    const mockUsers = [
      { id: 1, name: 'Sarah Wilson', avatar: 'S', status: 'online', lastSeen: new Date() },
      { id: 2, name: 'Mike Chen', avatar: 'M', status: 'away', lastSeen: new Date() },
    ];
    setActiveUsers(mockUsers);
  }, []);

  // Create workspace
  const createWorkspace = useCallback((workspace) => {
    const newWorkspace = {
      id: Date.now(),
      ...workspace,
      createdAt: new Date(),
      members: [{ id: 'current-user', role: 'owner' }],
    };
    setWorkspaces(prev => [...prev, newWorkspace]);
    return newWorkspace;
  }, []);

  // Join workspace
  const joinWorkspace = useCallback((workspaceId) => {
    setActiveWorkspace(workspaceId);
  }, []);

  // Leave workspace
  const leaveWorkspace = useCallback(() => {
    setActiveWorkspace(null);
  }, []);

  // Invite collaborator
  const inviteCollaborator = useCallback((email, role = 'member') => {
    const invite = {
      id: Date.now(),
      email,
      role,
      status: 'pending',
      sentAt: new Date(),
    };
    setPendingInvites(prev => [...prev, invite]);
    return invite;
  }, []);

  // Remove collaborator
  const removeCollaborator = useCallback((userId) => {
    setCollaborators(prev => prev.filter(c => c.id !== userId));
  }, []);

  // Share item
  const shareItem = useCallback((item, permissions) => {
    const sharedItem = {
      id: Date.now(),
      itemId: item.id,
      itemType: item.type,
      permissions,
      sharedAt: new Date(),
      sharedBy: 'current-user',
    };
    setSharedItems(prev => [...prev, sharedItem]);
    return sharedItem;
  }, []);

  // Update permissions
  const updatePermissions = useCallback((itemId, userId, permissions) => {
    setSharedItems(prev =>
      prev.map(item =>
        item.itemId === itemId
          ? { ...item, permissions: { ...item.permissions, [userId]: permissions } }
          : item
      )
    );
  }, []);

  // Get user presence
  const getUserPresence = useCallback((userId) => {
    return activeUsers.find(u => u.id === userId);
  }, [activeUsers]);

  // Check permissions
  const hasPermission = useCallback((itemId, permission) => {
    const item = sharedItems.find(i => i.itemId === itemId);
    if (!item) return false;
    return item.permissions?.['current-user']?.includes(permission) || false;
  }, [sharedItems]);

  const value = {
    workspaces,
    activeWorkspace,
    collaborators,
    sharedItems,
    activeUsers,
    pendingInvites,
    createWorkspace,
    joinWorkspace,
    leaveWorkspace,
    inviteCollaborator,
    removeCollaborator,
    shareItem,
    updatePermissions,
    getUserPresence,
    hasPermission,
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
};

export default CollaborationContext;

