import { useState, useEffect, useCallback } from 'react';
import emailsAPI from '@services/api/emailsAPI';
import { asList } from '@services/api/tasksAPI';
import { readCollection, writeCollection, newLocalId } from '@services/storage/localFallback';
import toast from 'react-hot-toast';

export const useEmails = (options = {}) => {
  const { autoFetch = true } = options;
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [localOnly, setLocalOnly] = useState(false);

  const fetchEmails = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const data = await emailsAPI.getAll(params);
      setEmails(asList(data));
      setLocalOnly(false);
      setError(null);
    } catch (err) {
      setEmails(readCollection('emails'));
      setLocalOnly(true);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetchEmails();
  }, [autoFetch, fetchEmails]);

  const persistLocal = (next) => {
    writeCollection('emails', next);
    setEmails(next);
  };

  const sendEmail = async (emailData) => {
    const optimistic = {
      ...emailData,
      _id: newLocalId(),
      from: 'you@schedai.app',
      to: Array.isArray(emailData.to) ? emailData.to : [emailData.to].filter(Boolean),
      type: 'sent',
      read: true,
      createdAt: new Date().toISOString(),
    };
    persistLocal([optimistic, ...asList(emails)]);
    toast.success('Email sent');

    if (localOnly) return optimistic;

    try {
      const sent = await emailsAPI.send(emailData);
      setEmails((prev) =>
        asList(prev).map((email) => (email._id === optimistic._id ? { ...optimistic, ...sent } : email))
      );
      return sent;
    } catch {
      setLocalOnly(true);
      return optimistic;
    }
  };

  const markAsRead = async (id, read = true) => {
    persistLocal(asList(emails).map((email) => (email._id === id ? { ...email, read } : email)));
    if (localOnly) return;
    try {
      await emailsAPI.markAsRead(id);
    } catch {
      setLocalOnly(true);
    }
  };

  const toggleStar = async (id) => {
    const target = asList(emails).find((email) => email._id === id);
    if (!target) return;
    persistLocal(
      asList(emails).map((email) =>
        email._id === id ? { ...email, starred: !email.starred } : email
      )
    );
    if (localOnly) return;
    try {
      await emailsAPI.toggleStar(id, !target.starred);
    } catch {
      setLocalOnly(true);
    }
  };

  const deleteEmail = async (id) => {
    const target = asList(emails).find((email) => email._id === id);
    // Soft delete locally so the Trash folder is meaningful
    persistLocal(
      asList(emails).map((email) => (email._id === id ? { ...email, trash: true } : email))
    );
    toast.success('Moved to trash');

    if (localOnly) return;
    try {
      // Backend hard-deletes; if it fails we have already hidden it locally
      await emailsAPI.delete(id).catch(() => {
        if (target) setLocalOnly(true);
      });
    } catch {
      setLocalOnly(true);
    }
  };

  return {
    emails: asList(emails),
    loading,
    error,
    localOnly,
    sendEmail,
    markAsRead,
    toggleStar,
    deleteEmail,
    refreshEmails: fetchEmails,
  };
};

export default useEmails;
