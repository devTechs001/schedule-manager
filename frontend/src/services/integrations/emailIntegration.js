// Email Integration Service

class EmailIntegrationService {
  constructor() {
    this.accounts = [];
    this.syncInterval = null;
  }

  // Connect email account
  async connect(provider, credentials) {
    await new Promise(r => setTimeout(r, 1500));

    const account = {
      id: `${provider}-${Date.now()}`,
      provider,
      email: credentials.email,
      name: credentials.name || credentials.email.split('@')[0],
      connected: true,
      connectedAt: new Date(),
      lastSync: null,
      folders: ['inbox', 'sent', 'drafts', 'trash', 'spam'],
    };

    this.accounts.push(account);
    return { success: true, account };
  }

  // Disconnect account
  disconnect(accountId) {
    this.accounts = this.accounts.filter(a => a.id !== accountId);
  }

  // Get connected accounts
  getAccounts() {
    return this.accounts;
  }

  // Fetch emails from account
  async fetchEmails(accountId, options = {}) {
    const account = this.accounts.find(a => a.id === accountId);
    if (!account) throw new Error('Account not found');

    await new Promise(r => setTimeout(r, 1500));

    const { folder = 'inbox', limit = 50, offset = 0 } = options;

    return Array.from({ length: Math.min(limit, 20) }, (_, i) => ({
      id: `${accountId}-email-${offset + i}`,
      accountId,
      folder,
      from: `sender${i}@example.com`,
      to: account.email,
      subject: `Email Subject ${offset + i + 1}`,
      preview: 'This is a preview of the email content...',
      date: new Date(Date.now() - Math.random() * 7 * 86400000),
      read: Math.random() > 0.3,
      starred: Math.random() > 0.8,
      hasAttachments: Math.random() > 0.7,
    }));
  }

  // Send email
  async sendEmail(accountId, emailData) {
    const account = this.accounts.find(a => a.id === accountId);
    if (!account) throw new Error('Account not found');

    await new Promise(r => setTimeout(r, 1000));

    return {
      id: `${accountId}-sent-${Date.now()}`,
      ...emailData,
      from: account.email,
      date: new Date(),
      folder: 'sent',
    };
  }

  // Move email to folder
  async moveEmail(emailId, folder) {
    await new Promise(r => setTimeout(r, 500));
    return { success: true, emailId, folder };
  }

  // Delete email
  async deleteEmail(emailId) {
    await new Promise(r => setTimeout(r, 500));
    return { success: true, emailId };
  }

  // Mark as read/unread
  async markRead(emailId, read = true) {
    await new Promise(r => setTimeout(r, 200));
    return { success: true, emailId, read };
  }

  // Toggle star
  async toggleStar(emailId) {
    await new Promise(r => setTimeout(r, 200));
    return { success: true, emailId };
  }

  // Search emails
  async searchEmails(accountId, query) {
    await new Promise(r => setTimeout(r, 1000));

    return Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
      id: `search-result-${i}`,
      accountId,
      subject: `${query} - Result ${i + 1}`,
      from: `result${i}@example.com`,
      date: new Date(Date.now() - Math.random() * 30 * 86400000),
      preview: `Email containing "${query}"...`,
    }));
  }

  // Get folder counts
  async getFolderCounts(accountId) {
    await new Promise(r => setTimeout(r, 500));

    return {
      inbox: Math.floor(Math.random() * 50),
      sent: Math.floor(Math.random() * 30),
      drafts: Math.floor(Math.random() * 5),
      trash: Math.floor(Math.random() * 20),
      spam: Math.floor(Math.random() * 10),
    };
  }

  // Start auto-sync
  startAutoSync(interval = 60000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      for (const account of this.accounts) {
        try {
          await this.fetchEmails(account.id);
          account.lastSync = new Date();
        } catch (error) {
          console.error(`Sync failed for ${account.email}:`, error);
        }
      }
    }, interval);
  }

  // Stop auto-sync
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export const emailIntegration = new EmailIntegrationService();
export default emailIntegration;

