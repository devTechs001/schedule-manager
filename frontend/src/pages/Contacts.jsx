import React, { useState } from 'react';
import { useContacts } from '@hooks/useContacts';
import ContactList from '@components/contacts/ContactList';
import ContactForm from '@components/contacts/ContactForm';
import ContactGroups from '@components/contacts/ContactGroups';
import Modal from '@components/ui/Modal';

const Contacts = () => {
  const { contacts, loading, createContact, updateContact, deleteContact } = useContacts();
  const [showModal, setShowModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [groups, setGroups] = useState([
    { _id: '1', name: 'Work', contactCount: 5 },
    { _id: '2', name: 'Personal', contactCount: 3 },
  ]);

  const handleAddContact = () => {
    setSelectedContact(null);
    setShowModal(true);
  };

  const handleEditContact = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
  };

  const handleSubmit = async (contactData) => {
    try {
      if (selectedContact) {
        await updateContact(selectedContact._id, contactData);
      } else {
        await createContact(contactData);
      }
      setShowModal(false);
      setSelectedContact(null);
    } catch (error) {
      console.error('Failed to save contact:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      await deleteContact(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contacts</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your contact list
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Contact Groups */}
        <div className="lg:col-span-1">
          <ContactGroups
            groups={groups}
            onAddGroup={(group) => setGroups([...groups, group])}
            onEditGroup={(group) => console.log('Edit group:', group)}
            onDeleteGroup={(id) => setGroups(groups.filter(g => g._id !== id))}
          />
        </div>

        {/* Contact List */}
        <div className="lg:col-span-3">
          <ContactList
            contacts={contacts}
            onAdd={handleAddContact}
            onEdit={handleEditContact}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Contact Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedContact(null);
        }}
        title={selectedContact ? 'Edit Contact' : 'Create New Contact'}
        size="lg"
      >
        <ContactForm
          contact={selectedContact}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setSelectedContact(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Contacts;