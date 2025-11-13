import { useState, useEffect, useCallback } from 'react';
import emailsAPI from '@services/api/emailsAPI';
import toast from 'react-hot-toast';

export const useEmails = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await emailsAPI.getAll();
      setEmails(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const sendEmail = async (emailData) => {
    try {
      const sentEmail = await emailsAPI.send(emailData);
      setEmails(prev => [sentEmail, ...prev]);
      toast.success('Email sent successfully');
      return sentEmail;
    } catch (err) {
      toast.error('Failed to send email');
      throw err;
    }
  };

  const markAsRead = async (id) => {
    try {
      await emailsAPI.markAsRead(id);
      setEmails(prev => prev.map(email => 
        email._id === id ? { ...email, read: true } : email
      ));
    } catch (err) {
      toast.error('Failed to mark email as read');
    }
  };

  const toggleStar = async (id) => {
    try {
      const email = emails.find(e => e._id === id);
      await emailsAPI.toggleStar(id, !email.starred);
      setEmails(prev => prev.map(email => 
        email._id === id ? { ...email, starred: !email.starred } : email
      ));
    } catch (err) {
      toast.error('Failed to toggle star');
    }
  };

  const deleteEmail = async (id) => {
    try {
      await emailsAPI.delete(id);
      setEmails(prev => prev.filter(email => email._id !== id));
      toast.success('Email deleted successfully');
    } catch (err) {
      toast.error('Failed to delete email');
    }
  };

  return {
    emails,
    loading,
    error,
    sendEmail,
    markAsRead,
    toggleStar,
    deleteEmail,
    refreshEmails: fetchEmails,
  };
};