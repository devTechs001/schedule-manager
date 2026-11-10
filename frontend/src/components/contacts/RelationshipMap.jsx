import React, { useState } from 'react';
import { FaProjectDiagram, FaUser, FaLink, FaPlus, FaSearch } from 'react-icons/fa';
/**
 * RelationshipMap — who knows whom, for the contacts graph.
 *
 * Deliberately not mounted. It takes `relationships` as a prop, and there is
 * nowhere to persist them: the contacts API stores name, email, phone, company
 * and notes, with no relationship edges between contacts. `onAddRelationship`
 * has no sink, so every edge the user drew would be lost on navigation — the
 * UI would promise a saved connection and silently discard it.
 *
 * Needs a relationships collection (or a field on the contact document) before
 * it can hold real data.
 */

const RelationshipMap = ({ contacts = [], relationships = [], onAddRelationship }) => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const relationshipTypes = [
    { value: 'colleague', label: 'Colleague', color: 'blue' },
    { value: 'client', label: 'Client', color: 'green' },
    { value: 'vendor', label: 'Vendor', color: 'purple' },
    { value: 'friend', label: 'Friend', color: 'yellow' },
    { value: 'manager', label: 'Manager', color: 'red' },
    { value: 'report', label: 'Direct Report', color: 'orange' },
  ];

  const getRelationshipsFor = (contactId) => {
    return relationships.filter(r =>
      r.from === contactId || r.to === contactId
    );
  };

  const getContactById = (id) => contacts.find(c => c.id === id);

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-surface rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaProjectDiagram className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-content">Relationship Map</h3>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-content-subtle" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search contacts..."
          className="w-full pl-10 pr-4 py-2 border border-line rounded-lg bg-white bg-surface-sunken text-content"
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-6">
        {relationshipTypes.map((type) => (
          <span
            key={type.value}
            className={`px-2 py-1 text-xs rounded-full bg-surface-sunken text-content-muted text-content-muted`}
          >
            {type.label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Contacts List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredContacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                selectedContact?.id === contact.id
                  ? 'bg-primary-100 dark:bg-primary-900/30'
                  : 'hover:bg-surface-sunken'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                {contact.name?.[0] || 'C'}
              </div>
              <div className="text-left">
                <p className="font-medium text-content">{contact.name}</p>
                <p className="text-sm text-content-muted">{contact.company || contact.email}</p>
              </div>
              <span className="ml-auto text-xs text-content-subtle">
                {getRelationshipsFor(contact.id).length} connections
              </span>
            </button>
          ))}
        </div>

        {/* Relationship Details */}
        <div className="bg-surface-sunken rounded-lg p-4">
          {selectedContact ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white text-lg">
                  {selectedContact.name?.[0]}
                </div>
                <div>
                  <h4 className="font-medium text-content">{selectedContact.name}</h4>
                  <p className="text-sm text-content-muted">{selectedContact.email}</p>
                </div>
              </div>

              <h5 className="font-medium text-content mb-3">Connections</h5>
              <div className="space-y-2">
                {getRelationshipsFor(selectedContact.id).map((rel, i) => {
                  const otherId = rel.from === selectedContact.id ? rel.to : rel.from;
                  const other = getContactById(otherId);
                  if (!other) return null;
                  return (
                    <div key={i} className="flex items-center gap-3 p-2 bg-surface rounded">
                      <FaLink className={`text-content-muted`} />
                      <div className="flex-1">
                        <p className="text-sm text-content">{other.name}</p>
                        <span className={`text-xs text-content-muted capitalize`}>
                          {rel.type}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {getRelationshipsFor(selectedContact.id).length === 0 && (
                  <p className="text-sm text-content-muted text-center py-4">No connections yet</p>
                )}
              </div>

              <button
                onClick={() => onAddRelationship?.(selectedContact.id)}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-line rounded-lg text-content-muted hover:text-primary-600 hover:border-primary-500"
              >
                <FaPlus /> Add Connection
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-content-muted py-12">
              <FaUser className="text-4xl mb-2" />
              <p>Select a contact to view relationships</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RelationshipMap;

