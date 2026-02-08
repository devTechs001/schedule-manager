import { useState, useCallback, useEffect } from 'react';

const useEmailSync = (options = {}) => {
  const {
    autoSync = true,
    syncInterval = 60000, // 1 minute
    maxEmails = 100,
  } = options;

  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [emails, setEmails] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Update unread count
  useEffect(() => {
    const emailsArray = Array.isArray(emails) ? emails : [];
    setUnreadCount(emailsArray.filter(e => !e.read).length);
  }, [emails]);

  // Auto-sync effect
  useEffect(() => {
    if (!autoSync || connectedAccounts.length === 0) return;

    const interval = setInterval(() => {
      syncAll();
    }, syncInterval);

    return () => clearInterval(interval);
  }, [autoSync, syncInterval, connectedAccounts]);

  // Connect email account
  const connect = useCallback(async (provider, credentials) => {
    try {
      await new Promise(r => setTimeout(r, 1500));

      const account = {
        id: `${provider}-${Date.now()}`,
        provider,
        email: credentials.email,
        connected: true,
        connectedAt: new Date(),
        folders: ['inbox', 'sent', 'drafts', 'trash', 'spam'],
        emailCount: 0,
      };

      setConnectedAccounts(prev => [...prev, account]);
      return { success: true, account };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Disconnect account
  const disconnect = useCallback((accountId) => {
    setConnectedAccounts(prev => prev.filter(a => a.id !== accountId));
    setEmails(prev => prev.filter(e => e.accountId !== accountId));
  }, []);

  // Sync emails from account
  const sync = useCallback(async (accountId, folder = 'inbox') => {
    const account = connectedAccounts.find(a => a.id === accountId);
    if (!account) return { success: false, error: 'Account not found' };

    setIsSyncing(true);

    try {
      await new Promise(r => setTimeout(r, 2000));

      // Generate mock emails
      const mockEmails = Array.from({ length: Math.floor(Math.random() * 20) + 10 }, (_, i) => ({
        id: `${accountId}-email-${Date.now()}-${i}`,
        accountId,
        folder,
        from: `sender${i}@example.com`,
        to: account.email,
        subject: `Email Subject ${i + 1}`,
        preview: 'This is a preview of the email content...',
        body: 'Full email body content here...',
        date: new Date(Date.now() - Math.random() * 7 * 86400000),
        read: Math.random() > 0.3,
        starred: Math.random() > 0.8,
        attachments: Math.random() > 0.7 ? [{ name: 'file.pdf', size: 1024 }] : [],
      }));

      setEmails(prev => {
        const filtered = prev.filter(e => e.accountId !== accountId || e.folder !== folder);
        return [...filtered, ...mockEmails].slice(-maxEmails);
      });

      setConnectedAccounts(prev =>
        prev.map(a =>
          a.id === accountId
            ? { ...a, lastSync: new Date(), emailCount: mockEmails.length }
            : a
        )
      );

      setLastSync(new Date());
      return { success: true, count: mockEmails.length };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsSyncing(false);
    }
  }, [connectedAccounts, maxEmails]);

  // Sync all accounts
  const syncAll = useCallback(async () => {
    const results = await Promise.all(
      connectedAccounts.map(a => sync(a.id))
    );
    return results;
  }, [connectedAccounts, sync]);

  // Mark email as read
  const markAsRead = useCallback((emailId) => {
    setEmails(prev =>
      prev.map(e => e.id === emailId ? { ...e, read: true } : e)
    );
  }, []);

  // Mark email as unread
  const markAsUnread = useCallback((emailId) => {
    setEmails(prev =>
      prev.map(e => e.id === emailId ? { ...e, read: false } : e)
    );
  }, []);

  // Toggle star
  const toggleStar = useCallback((emailId) => {
    setEmails(prev =>
      prev.map(e => e.id === emailId ? { ...e, starred: !e.starred } : e)
    );
  }, []);

  // Move to folder
  const moveToFolder = useCallback((emailId, folder) => {
    setEmails(prev =>
      prev.map(e => e.id === emailId ? { ...e, folder } : e)
    );
  }, []);

  // Delete email
  const deleteEmail = useCallback((emailId) => {
    setEmails(prev => prev.filter(e => e.id !== emailId));
  }, []);

  // Send email
  const sendEmail = useCallback(async (accountId, emailData) => {
    try {
      await new Promise(r => setTimeout(r, 1000));
      
      const sentEmail = {
        id: `${accountId}-sent-${Date.now()}`,
        accountId,
        folder: 'sent',
        ...emailData,
        date: new Date(),
        read: true,
      };

      setEmails(prev => [...prev, sentEmail]);
      return { success: true, email: sentEmail };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Get emails by folder
  const getEmailsByFolder = useCallback((folder) => {
    const emailsArray = Array.isArray(emails) ? emails : [];
    return emailsArray.filter(e => e.folder === folder);
  }, [emails]);

  // Search emails
  const searchEmails = useCallback((query) => {
    const emailsArray = Array.isArray(emails) ? emails : [];
    const lowerQuery = query.toLowerCase();
    return emailsArray.filter(e =>
      e.subject.toLowerCase().includes(lowerQuery) ||
      e.from.toLowerCase().includes(lowerQuery) ||
      e.preview.toLowerCase().includes(lowerQuery)
    );
  }, [emails]);

  return {
    connectedAccounts,
    emails,
    isSyncing,
    lastSync,
    unreadCount,
    connect,
    disconnect,
    sync,
    syncAll,
    markAsRead,
    markAsUnread,
    toggleStar,
    moveToFolder,
    deleteEmail,
    sendEmail,
    getEmailsByFolder,
    searchEmails,
  };
};

export default useEmailSync;

