import React, { useState } from 'react';
import { FaSearch, FaPlus, FaUsers } from 'react-icons/fa';
import ContactCard from './ContactCard';
import EmptyState from '@components/ui/EmptyState';
import LoadingSpinner from '@components/ui/LoadingSpinner';

const ContactList = ({ contacts = [], loading = false, onEdit, onDelete, onAdd }) => {
  const [query, setQuery] = useState('');

  const list = Array.isArray(contacts) ? contacts : [];
  const filtered = list.filter((contact) => {
    const term = query.trim().toLowerCase();
    if (!term) return true;
    return (
      (contact.name || '').toLowerCase().includes(term) ||
      (contact.email || '').toLowerCase().includes(term) ||
      (contact.company || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-subtle" size={11} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email or company"
            className="input pl-9 text-xs"
            aria-label="Search contacts"
          />
        </div>
        <button type="button" onClick={onAdd} className="btn btn-primary btn-sm shrink-0">
          <FaPlus size={10} /> Add contact
        </button>
      </div>

      {loading && list.length === 0 && (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="md" text="Loading contacts…" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={<FaUsers />}
          title={query ? 'No contacts match' : 'No contacts yet'}
          description={
            query
              ? 'Try a different name, company or email.'
              : 'Add the people you work with to schedule meetings faster.'
          }
          action={
            onAdd && (
              <button type="button" onClick={onAdd} className="btn btn-primary btn-sm mt-1">
                <FaPlus size={10} /> Add your first contact
              </button>
            )
          }
        />
      )}

      {filtered.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((contact) => (
            <ContactCard
              key={contact._id}
              contact={contact}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactList;
