import React, { useState } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import ContactCard from './ContactCard';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';

const ContactList = ({ contacts, onEdit, onDelete, onAdd }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contacts</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="primary" icon={<FaPlus />} onClick={onAdd}>
          Add Contact
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Search contacts..."
        icon={<FaSearch />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Contact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <ContactCard
            key={contact._id}
            contact={contact}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No contacts found</p>
        </div>
      )}
    </div>
  );
};

export default ContactList;