import React, { useEffect, useMemo, useState } from 'react';
import { FaBuilding, FaSyncAlt, FaUserPlus, FaUsers } from 'react-icons/fa';
import { useContacts } from '@hooks/useContacts';
import ContactList from '@components/contacts/ContactList';
import ContactForm from '@components/contacts/ContactForm';
import Modal from '@components/ui/Modal';

const Contacts = () => {
  const { contacts, loading, createContact, updateContact, deleteContact, refreshContacts } = useContacts();
  const [showModal, setShowModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    document.title = 'Contacts — SchedAI';
  }, []);

  const stats = useMemo(() => {
    const list = Array.isArray(contacts) ? contacts : [];
    const companies = new Set(list.map((contact) => contact.company).filter(Boolean));
    return {
      total: list.length,
      companies: companies.size,
      withPhone: list.filter((contact) => contact.phone).length,
    };
  }, [contacts]);

  const openCreate = () => {
    setSelectedContact(null);
    setShowModal(true);
  };

  const openEdit = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
  };

  const handleSubmit = async (data) => {
    if (selectedContact?._id) {
      await updateContact(selectedContact._id, data);
    } else {
      await createContact(data);
    }
    setShowModal(false);
    setSelectedContact(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this contact?')) {
      await deleteContact(id);
    }
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contacts</h1>
          <p className="page-subtitle">The people you plan your week with.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => refreshContacts()} className="btn btn-outline btn-sm" aria-label="Refresh contacts">
            <FaSyncAlt size={9} className={loading ? 'animate-spin' : ''} />
          </button>
          <button type="button" onClick={openCreate} className="btn btn-primary btn-sm">
            <FaUserPlus size={9} /> Add contact
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: FaUsers, label: 'Total contacts', value: stats.total },
          { icon: FaBuilding, label: 'Companies', value: stats.companies },
          { icon: FaUserPlus, label: 'With phone', value: stats.withPhone },
        ].map((stat) => (
          <div key={stat.label} className="card flex items-center gap-3 p-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
              <stat.icon size={12} />
            </span>
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-content-subtle">
                {stat.label}
              </p>
              <p className="font-display text-lg font-bold leading-tight text-content">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <ContactList
        contacts={contacts}
        loading={loading}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedContact(null);
        }}
        title={selectedContact?._id ? 'Edit contact' : 'New contact'}
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
