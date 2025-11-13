import { useState, useEffect, useCallback } from 'react';
import contactsAPI from '@services/api/contactsAPI';
import toast from 'react-hot-toast';

export const useContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await contactsAPI.getAll();
      setContacts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const createContact = async (contactData) => {
    try {
      const newContact = await contactsAPI.create(contactData);
      setContacts(prev => [...prev, newContact]);
      toast.success('Contact created successfully');
      return newContact;
    } catch (err) {
      toast.error('Failed to create contact');
      throw err;
    }
  };

  const updateContact = async (id, updates) => {
    try {
      const updatedContact = await contactsAPI.update(id, updates);
      setContacts(prev => prev.map(contact => 
        contact._id === id ? updatedContact : contact
      ));
      toast.success('Contact updated successfully');
      return updatedContact;
    } catch (err) {
      toast.error('Failed to update contact');
      throw err;
    }
  };

  const deleteContact = async (id) => {
    try {
      await contactsAPI.delete(id);
      setContacts(prev => prev.filter(contact => contact._id !== id));
      toast.success('Contact deleted successfully');
    } catch (err) {
      toast.error('Failed to delete contact');
      throw err;
    }
  };

  return {
    contacts,
    loading,
    error,
    createContact,
    updateContact,
    deleteContact,
    refreshContacts: fetchContacts,
  };
};