// Audit Logging Service

class AuditService {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
    this.storageKey = 'audit_logs';
    this.loadFromStorage();
  }

  // Load logs from storage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    }
  }

  // Save logs to storage
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.logs.slice(-this.maxLogs)));
    } catch (e) {
      console.error('Failed to save audit logs:', e);
    }
  }

  // Log an action
  log(action, details = {}) {
    const entry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
      userId: details.userId || this.getCurrentUserId(),
      userEmail: details.userEmail || this.getCurrentUserEmail(),
      ipAddress: details.ipAddress || 'client',
      userAgent: navigator.userAgent,
      success: details.success !== false,
    };

    this.logs.push(entry);
    
    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    this.saveToStorage();
    
    // Send to server (in production)
    this.sendToServer(entry);

    return entry;
  }

  // Get current user ID
  getCurrentUserId() {
    try {
      const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
      return user.id || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  // Get current user email
  getCurrentUserEmail() {
    try {
      const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
      return user.email || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  // Send log to server
  async sendToServer(entry) {
    // In production, this would send to backend
    // await fetch('/api/audit', { method: 'POST', body: JSON.stringify(entry) });
  }

  // Log authentication events
  logAuth(event, details = {}) {
    return this.log(`auth:${event}`, {
      category: 'authentication',
      ...details,
    });
  }

  // Log data access
  logAccess(resource, action, details = {}) {
    return this.log(`${resource}:${action}`, {
      category: 'data_access',
      resource,
      ...details,
    });
  }

  // Log configuration changes
  logConfig(setting, oldValue, newValue) {
    return this.log('config:change', {
      category: 'configuration',
      setting,
      oldValue,
      newValue,
    });
  }

  // Log security events
  logSecurity(event, details = {}) {
    return this.log(`security:${event}`, {
      category: 'security',
      severity: details.severity || 'info',
      ...details,
    });
  }

  // Get logs
  getLogs(filter = {}) {
    let result = [...this.logs];

    if (filter.action) {
      result = result.filter(l => l.action.includes(filter.action));
    }
    if (filter.userId) {
      result = result.filter(l => l.userId === filter.userId);
    }
    if (filter.category) {
      result = result.filter(l => l.details?.category === filter.category);
    }
    if (filter.startDate) {
      result = result.filter(l => new Date(l.timestamp) >= new Date(filter.startDate));
    }
    if (filter.endDate) {
      result = result.filter(l => new Date(l.timestamp) <= new Date(filter.endDate));
    }
    if (filter.success !== undefined) {
      result = result.filter(l => l.success === filter.success);
    }

    return result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Search logs
  search(query) {
    const lowerQuery = query.toLowerCase();
    return this.logs.filter(log =>
      log.action.toLowerCase().includes(lowerQuery) ||
      log.userEmail?.toLowerCase().includes(lowerQuery) ||
      JSON.stringify(log.details).toLowerCase().includes(lowerQuery)
    );
  }

  // Export logs
  export(format = 'json') {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2);
    }
    if (format === 'csv') {
      const headers = 'Timestamp,Action,User,Success,Details\n';
      const rows = this.logs.map(l =>
        `"${l.timestamp}","${l.action}","${l.userEmail}",${l.success},"${JSON.stringify(l.details).replace(/"/g, '""')}"`
      );
      return headers + rows.join('\n');
    }
    return null;
  }

  // Clear logs
  clear() {
    this.logs = [];
    this.saveToStorage();
  }

  // Get statistics
  getStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 86400000);

    return {
      total: this.logs.length,
      today: this.logs.filter(l => new Date(l.timestamp) >= today).length,
      thisWeek: this.logs.filter(l => new Date(l.timestamp) >= thisWeek).length,
      failures: this.logs.filter(l => !l.success).length,
      byCategory: this.groupBy('category'),
    };
  }

  // Group logs by field
  groupBy(field) {
    return this.logs.reduce((acc, log) => {
      const key = log.details?.[field] || 'other';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }
}

export const auditService = new AuditService();
export default auditService;

