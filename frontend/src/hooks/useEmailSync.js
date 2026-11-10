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

      /*
       * No fabricated mail. This previously invented 10-30 emails from
       * "sender3@example.com" with random read/starred flags and wrote them
       * into the inbox — indistinguishable from a real sync, and impossible to
       * clear without deleting them one by one.
       *
       * No mail provider is implemented yet, so a sync reports zero messages.
       * Real fetched mail belongs here once the integration exists.
       */
      setConnectedAccounts((prev) =>
        prev.map((a) => (a.id === accountId ? { ...a, lastSync: new Date(), emailCount: 0 } : a))
      );

      setLastSync(new Date());
      return { success: true, count: 0, notImplemented: true };
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

