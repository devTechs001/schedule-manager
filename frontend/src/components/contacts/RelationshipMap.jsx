import React, { useState } from 'react';
import { FaProjectDiagram, FaUser, FaLink, FaPlus, FaSearch } from 'react-icons/fa';

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

  const getRelationshipColor = (type) => {
    const rel = relationshipTypes.find(r => r.value === type);
    return rel?.color || 'gray';
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaProjectDiagram className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Relationship Map</h3>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search contacts..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-6">
        {relationshipTypes.map((type) => (
          <span
            key={type.value}
            className={`px-2 py-1 text-xs rounded-full bg-${type.color}-100 dark:bg-${type.color}-900/30 text-${type.color}-700 dark:text-${type.color}-300`}
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
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                {contact.name?.[0] || 'C'}
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">{contact.name}</p>
                <p className="text-sm text-gray-500">{contact.company || contact.email}</p>
              </div>
              <span className="ml-auto text-xs text-gray-400">
                {getRelationshipsFor(contact.id).length} connections
              </span>
            </button>
          ))}
        </div>

        {/* Relationship Details */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          {selectedContact ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white text-lg">
                  {selectedContact.name?.[0]}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{selectedContact.name}</h4>
                  <p className="text-sm text-gray-500">{selectedContact.email}</p>
                </div>
              </div>

              <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Connections</h5>
              <div className="space-y-2">
                {getRelationshipsFor(selectedContact.id).map((rel, i) => {
                  const otherId = rel.from === selectedContact.id ? rel.to : rel.from;
                  const other = getContactById(otherId);
                  if (!other) return null;
                  return (
                    <div key={i} className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded">
                      <FaLink className={`text-${getRelationshipColor(rel.type)}-500`} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">{other.name}</p>
                        <span className={`text-xs text-${getRelationshipColor(rel.type)}-600 capitalize`}>
                          {rel.type}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {getRelationshipsFor(selectedContact.id).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No connections yet</p>
                )}
              </div>

              <button
                onClick={() => onAddRelationship?.(selectedContact.id)}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-primary-600 hover:border-primary-500"
              >
                <FaPlus /> Add Connection
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 py-12">
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

