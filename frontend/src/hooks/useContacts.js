import { useState, useEffect, useCallback } from 'react';
import contactsAPI from '@services/api/contactsAPI';
import { asList } from '@services/api/tasksAPI';
import { readCollection, writeCollection, newLocalId } from '@services/storage/localFallback';
import toast from 'react-hot-toast';

export const useContacts = (options = {}) => {
  const { autoFetch = true } = options;
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [localOnly, setLocalOnly] = useState(false);

  const fetchContacts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const data = await contactsAPI.getAll(params);
      setContacts(asList(data));
      setLocalOnly(false);
      setError(null);
    } catch (err) {
      setContacts(readCollection('contacts'));
      setLocalOnly(true);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetchContacts();
  }, [autoFetch, fetchContacts]);

  const persistLocal = (next) => {
    writeCollection('contacts', next);
    setContacts(next);
  };

  const createContact = async (contactData) => {
    const optimistic = { ...contactData, _id: newLocalId(), createdAt: new Date().toISOString() };
    const next = [...asList(contacts), optimistic];
    setContacts(next);

    if (localOnly) {
      persistLocal(next);
      toast.success('Contact saved');
      return optimistic;
    }

    try {
      const newContact = await contactsAPI.create(contactData);
      setContacts((prev) => asList(prev).map((c) => (c._id === optimistic._id ? newContact : c)));
      toast.success('Contact saved');
      return newContact;
    } catch {
      persistLocal(next);
      setLocalOnly(true);
      toast.success('Contact saved locally');
      return optimistic;
    }
  };

  const updateContact = async (id, updates) => {
    const next = asList(contacts).map((contact) =>
      contact._id === id ? { ...contact, ...updates } : contact
    );
    persistLocal(next);
    toast.success('Contact updated');

    if (localOnly) return next.find((contact) => contact._id === id);

    try {
      const updated = await contactsAPI.update(id, updates);
      setContacts((prev) => asList(prev).map((c) => (c._id === id ? { ...c, ...updated } : c)));
      return updated;
    } catch {
      setLocalOnly(true);
      return next.find((contact) => contact._id === id);
    }
  };

  const deleteContact = async (id) => {
    const next = asList(contacts).filter((contact) => contact._id !== id);
    persistLocal(next);
    toast.success('Contact deleted');

    if (localOnly) return;

    try {
      await contactsAPI.delete(id);
    } catch {
      setLocalOnly(true);
    }
  };

  return {
    contacts: asList(contacts),
    loading,
    error,
    localOnly,
    createContact,
    updateContact,
    deleteContact,
    refreshContacts: fetchContacts,
  };
};

export default useContacts;
