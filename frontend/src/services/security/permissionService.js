// Permission and Role-Based Access Control Service

class PermissionService {
  constructor() {
    this.permissions = {};
    this.roles = {
      admin: {
        name: 'Administrator',
        permissions: ['*'],
      },
      manager: {
        name: 'Manager',
        permissions: [
          'tasks:read', 'tasks:write', 'tasks:delete',
          'calendar:read', 'calendar:write',
          'users:read',
          'reports:read',
        ],
      },
      user: {
        name: 'User',
        permissions: [
          'tasks:read', 'tasks:write',
          'calendar:read', 'calendar:write',
        ],
      },
      viewer: {
        name: 'Viewer',
        permissions: [
          'tasks:read',
          'calendar:read',
        ],
      },
    };
  }

  // Check if user has permission
  hasPermission(userRoles, permission) {
    if (!userRoles || userRoles.length === 0) return false;

    for (const role of userRoles) {
      const rolePermissions = this.roles[role]?.permissions || [];
      
      // Admin has all permissions
      if (rolePermissions.includes('*')) return true;
      
      // Check specific permission
      if (rolePermissions.includes(permission)) return true;
      
      // Check wildcard (e.g., 'tasks:*')
      const [resource] = permission.split(':');
      if (rolePermissions.includes(`${resource}:*`)) return true;
    }

    return false;
  }

  // Check multiple permissions (AND)
  hasAllPermissions(userRoles, permissions) {
    return permissions.every(p => this.hasPermission(userRoles, p));
  }

  // Check multiple permissions (OR)
  hasAnyPermission(userRoles, permissions) {
    return permissions.some(p => this.hasPermission(userRoles, p));
  }

  // Get user permissions
  getUserPermissions(userRoles) {
    const permissions = new Set();

    for (const role of userRoles) {
      const rolePermissions = this.roles[role]?.permissions || [];
      rolePermissions.forEach(p => permissions.add(p));
    }

    return Array.from(permissions);
  }

  // Check if user can access resource
  canAccess(userRoles, resource, action) {
    return this.hasPermission(userRoles, `${resource}:${action}`);
  }

  // Check if user can read
  canRead(userRoles, resource) {
    return this.canAccess(userRoles, resource, 'read');
  }

  // Check if user can write
  canWrite(userRoles, resource) {
    return this.canAccess(userRoles, resource, 'write');
  }

  // Check if user can delete
  canDelete(userRoles, resource) {
    return this.canAccess(userRoles, resource, 'delete');
  }

  // Get all roles
  getRoles() {
    return Object.entries(this.roles).map(([id, role]) => ({
      id,
      ...role,
    }));
  }

  // Get role by ID
  getRole(roleId) {
    return this.roles[roleId] ? { id: roleId, ...this.roles[roleId] } : null;
  }

  // Add custom role
  addRole(roleId, roleName, permissions) {
    this.roles[roleId] = {
      name: roleName,
      permissions,
    };
  }

  // Update role permissions
  updateRolePermissions(roleId, permissions) {
    if (this.roles[roleId]) {
      this.roles[roleId].permissions = permissions;
    }
  }

  // Filter data based on permissions
  filterByPermission(data, userRoles, resource) {
    if (this.hasPermission(userRoles, `${resource}:*`)) {
      return data;
    }

    if (!this.canRead(userRoles, resource)) {
      return [];
    }

    // Additional filtering logic based on ownership, etc.
    return data;
  }

  // Get permission categories
  getPermissionCategories() {
    return {
      tasks: ['read', 'write', 'delete', 'assign'],
      calendar: ['read', 'write', 'delete', 'share'],
      users: ['read', 'write', 'delete', 'invite'],
      reports: ['read', 'export'],
      settings: ['read', 'write'],
      integrations: ['read', 'write', 'delete'],
    };
  }
}

export const permissionService = new PermissionService();
export default permissionService;

