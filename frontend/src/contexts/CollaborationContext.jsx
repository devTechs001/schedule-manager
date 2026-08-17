import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { socketService } from '@services/socket/socketService';

const CollaborationContext = createContext();

const initialState = {
  workspaces: [],
  currentWorkspace: null,
  onlineUsers: [],
  activeCollaborators: [],
  sharedDocuments: [],
  comments: [],
  meetings: [],
  isLoading: false,
  error: null,
};

const collaborationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_WORKSPACES':
      return { ...state, workspaces: action.payload, isLoading: false };
    
    case 'SET_CURRENT_WORKSPACE':
      return { ...state, currentWorkspace: action.payload };
    
    case 'ADD_ONLINE_USER':
      return { 
        ...state, 
        onlineUsers: state.onlineUsers.find(u => u.id === action.payload.id)
          ? state.onlineUsers
          : [...state.onlineUsers, action.payload]
      };
    
    case 'REMOVE_ONLINE_USER':
      return { 
        ...state, 
        onlineUsers: state.onlineUsers.filter(u => u.id !== action.payload.id)
      };
    
    case 'ADD_COLLABORATOR':
      return { 
        ...state, 
        activeCollaborators: state.activeCollaborators.find(c => c.id === action.payload.id)
          ? state.activeCollaborators
          : [...state.activeCollaborators, action.payload]
      };
    
    case 'REMOVE_COLLABORATOR':
      return { 
        ...state, 
        activeCollaborators: state.activeCollaborators.filter(c => c.id !== action.payload.id)
      };
    
    case 'ADD_COMMENT':
      return { 
        ...state, 
        comments: [...state.comments, action.payload]
      };
    
    case 'UPDATE_COMMENT':
      return { 
        ...state, 
        comments: state.comments.map(c => 
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        )
      };
    
    case 'DELETE_COMMENT':
      return { 
        ...state, 
        comments: state.comments.filter(c => c.id !== action.payload.id)
      };
    
    case 'ADD_MEETING':
      return { 
        ...state, 
        meetings: [...state.meetings, action.payload]
      };
    
    case 'UPDATE_MEETING':
      return { 
        ...state, 
        meetings: state.meetings.map(m => 
          m.id === action.payload.id ? { ...m, ...action.payload } : m
        )
      };
    
    default:
      return state;
  }
};

export const CollaborationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(collaborationReducer, initialState);

  useEffect(() => {
    // Listen to socket events for real-time collaboration
    const unsubscribeUserJoined = socketService.on('user:joined', (user) => {
      dispatch({ type: 'ADD_ONLINE_USER', payload: user });
    });

    const unsubscribeUserLeft = socketService.on('user:left', (userId) => {
      dispatch({ type: 'REMOVE_ONLINE_USER', payload: { id: userId } });
    });

    const unsubscribeCollaboratorJoined = socketService.on('collaborator:joined', (collaborator) => {
      dispatch({ type: 'ADD_COLLABORATOR', payload: collaborator });
    });

    const unsubscribeCollaboratorLeft = socketService.on('collaborator:left', (collaboratorId) => {
      dispatch({ type: 'REMOVE_COLLABORATOR', payload: { id: collaboratorId } });
    });

    const unsubscribeNewComment = socketService.on('comment:new', (comment) => {
      dispatch({ type: 'ADD_COMMENT', payload: comment });
    });

    const unsubscribeUpdatedComment = socketService.on('comment:updated', (comment) => {
      dispatch({ type: 'UPDATE_COMMENT', payload: comment });
    });

    const unsubscribeDeletedComment = socketService.on('comment:deleted', (commentId) => {
      dispatch({ type: 'DELETE_COMMENT', payload: { id: commentId } });
    });

    return () => {
      unsubscribeUserJoined?.();
      unsubscribeUserLeft?.();
      unsubscribeCollaboratorJoined?.();
      unsubscribeCollaboratorLeft?.();
      unsubscribeNewComment?.();
      unsubscribeUpdatedComment?.();
      unsubscribeDeletedComment?.();
    };
  }, []);

  const fetchWorkspaces = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // API call to fetch workspaces
      // const response = await workspaceAPI.getWorkspaces();
      // dispatch({ type: 'SET_WORKSPACES', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const joinWorkspace = async (workspaceId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // API call to join workspace
      // const workspace = await workspaceAPI.joinWorkspace(workspaceId);
      // dispatch({ type: 'SET_CURRENT_WORKSPACE', payload: workspace });
      socketService.emit('workspace:join', { workspaceId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const leaveWorkspace = async (workspaceId) => {
    try {
      socketService.emit('workspace:leave', { workspaceId });
      dispatch({ type: 'SET_CURRENT_WORKSPACE', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const addComment = async (comment) => {
    try {
      // API call to add comment
      // const newComment = await commentAPI.createComment(comment);
      socketService.emit('comment:add', comment);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const updateComment = async (commentId, updates) => {
    try {
      socketService.emit('comment:update', { commentId, ...updates });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const deleteComment = async (commentId) => {
    try {
      socketService.emit('comment:delete', { commentId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const value = {
    ...state,
    fetchWorkspaces,
    joinWorkspace,
    leaveWorkspace,
    addComment,
    updateComment,
    deleteComment,
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
};

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
};

export default CollaborationContext;
