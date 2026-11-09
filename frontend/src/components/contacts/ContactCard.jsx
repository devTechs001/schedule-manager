import React from 'react';
import { FaEnvelope, FaPhone, FaBuilding, FaRegEdit, FaTrash, FaStar, FaStar as FaStarSolid } from 'react-icons/fa';

const initialsOf = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

const ContactCard = ({ contact, onEdit, onDelete }) => (
  <div className="group rounded-2xl border border-line bg-surface-raised p-4 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-gradient text-sm font-bold text-white">
          {initialsOf(contact.name)}
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-content">{contact.name || 'Unnamed contact'}</h3>
          {(contact.position || contact.company) && (
            <p className="truncate text-xs text-content-muted">
              {[contact.position, contact.company].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>
      {contact.isFavorite && <FaStarSolid className="shrink-0 text-amber-400" size={11} />}
    </div>

    <div className="mt-3.5 space-y-1.5">
      {contact.email && (
        <a
          href={`mailto:${contact.email}`}
          className="flex items-center gap-2 truncate text-xs text-content-muted hover:text-primary-600"
        >
          <FaEnvelope size={10} className="shrink-0 text-content-subtle" />
          <span className="truncate">{contact.email}</span>
        </a>
      )}
      {contact.phone && (
        <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-xs text-content-muted hover:text-primary-600">
          <FaPhone size={10} className="shrink-0 text-content-subtle" />
          {contact.phone}
        </a>
      )}
      {contact.company && (
        <p className="flex items-center gap-2 truncate text-xs text-content-muted">
          <FaBuilding size={10} className="shrink-0 text-content-subtle" />
          <span className="truncate">{contact.company}</span>
        </p>
      )}
    </div>

    {Array.isArray(contact.tags) && contact.tags.length > 0 && (
      <div className="mt-3 flex flex-wrap gap-1.5">
        {contact.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-surface-sunken px-1.5 py-0.5 text-[0.62rem] font-medium text-content-subtle"
          >
            {tag}
          </span>
        ))}
      </div>
    )}

    <div className="mt-3.5 flex items-center justify-end gap-1 border-t border-line pt-3">
      <button
        type="button"
        onClick={() => onEdit?.(contact)}
        className="btn btn-ghost btn-sm"
        aria-label={`Edit ${contact.name}`}
      >
        <FaRegEdit size={10} /> Edit
      </button>
      <button
        type="button"
        onClick={() => onDelete?.(contact._id)}
        className="btn btn-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
        aria-label={`Delete ${contact.name}`}
      >
        <FaTrash size={10} />
      </button>
    </div>
  </div>
);

export default ContactCard;
