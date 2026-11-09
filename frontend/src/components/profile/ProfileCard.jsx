import React, { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FaCamera,
  FaCheck,
  FaTimes,
  FaTrash,
  FaMapMarkerAlt,
  FaBriefcase,
  FaBuilding,
  FaGlobe,
  FaLinkedin,
  FaGithub,
  FaPlus,
  FaSpinner,
  FaPencilAlt,
} from 'react-icons/fa';
import { useAuth } from '@contexts/AuthContext';

/**
 * ProfileCard — the identity block on Settings → Profile.
 *
 * Design notes:
 *  - A real photo, not just initials. Upload goes straight to GridFS via
 *    AuthContext.uploadAvatar, so it survives redeploys.
 *  - Everything is inline-editable: no "edit mode" page, no per-field dialogs.
 *    Editing happens where the value lives.
 *  - Mobile first: the cover/avatar stack collapses to a single column and the
 *    action buttons become full-width targets at the smallest breakpoint.
 *  - Never renders placeholder/fake detail. Empty fields show an invitation to
 *    add them ("Add your role"), not invented content.
 */

const initialsOf = (name) =>
  (name || 'You')
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'Y';

/** Inline text field that saves on blur/Enter and reverts on Escape. */
const InlineField = ({ value, placeholder, onSave, as: Tag = 'input', multiline, maxLength, type = 'text' }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!editing) setDraft(value || '');
  }, [value, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = async () => {
    const next = draft.trim();
    if (next === (value || '').trim()) {
      setEditing(false);
      return;
    }
    setBusy(true);
    try {
      await onSave(next);
      setEditing(false);
    } catch (error) {
      toast.error(error.message || 'Could not save');
    } finally {
      setBusy(false);
    }
  };

  const cancel = () => {
    setDraft(value || '');
    setEditing(false);
  };

  if (editing) {
    return (
      <span className="flex w-full items-start gap-1.5">
        <Tag
          ref={inputRef}
          type={Tag === 'input' ? type : undefined}
          value={draft}
          rows={multiline ? 3 : undefined}
          maxLength={maxLength}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') cancel();
            if (event.key === 'Enter' && !multiline) {
              event.preventDefault();
              commit();
            }
          }}
          className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-2 py-1 text-sm text-content outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
          aria-label={placeholder}
        />
        <button
          type="button"
          onClick={commit}
          disabled={busy}
          className="rounded-lg p-1.5 text-emerald-600 transition-colors hover:bg-emerald-50 disabled:opacity-50 dark:hover:bg-emerald-500/10"
          aria-label="Save"
        >
          {busy ? <FaSpinner size={11} className="animate-spin" /> : <FaCheck size={11} />}
        </button>
        <button
          type="button"
          onClick={cancel}
          className="rounded-lg p-1.5 text-content-subtle transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
          aria-label="Cancel"
        >
          <FaTimes size={11} />
        </button>
      </span>
    );
  }

  const isEmpty = !value || !String(value).trim();

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="group flex w-full items-center gap-1.5 rounded-lg text-left transition-colors hover:text-content"
    >
      <span className={isEmpty ? 'text-sm italic text-content-subtle' : 'text-sm text-content'}>
        {isEmpty ? placeholder : value}
      </span>
      <FaPencilAlt
        size={9}
        className="shrink-0 text-content-subtle opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      />
    </button>
  );
};

const ProfileCard = () => {
  const { user, updateProfile, uploadAvatar, removeAvatar } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: '', role: '' });
  const [addingOrg, setAddingOrg] = useState(false);
  const fileRef = useRef(null);

  const save = useCallback(
    async (patch) => {
      await updateProfile(patch);
    },
    [updateProfile]
  );

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      setUploading(true);
      try {
        await uploadAvatar(file);
        toast.success('Photo updated');
      } catch (error) {
        toast.error(error.message || 'Upload failed');
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = '';
      }
    },
    [uploadAvatar]
  );

  const onDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    handleFile(event.dataTransfer?.files?.[0]);
  };

  const handleRemovePhoto = async () => {
    setUploading(true);
    try {
      await removeAvatar();
      toast.success('Photo removed');
    } catch (error) {
      toast.error(error.message || 'Could not remove photo');
    } finally {
      setUploading(false);
    }
  };

  const organisations = Array.isArray(user?.organisations) ? user.organisations : [];

  const addOrganisation = async () => {
    const name = newOrg.name.trim();
    if (!name) return;
    try {
      await save({
        organisations: [...organisations, { name, role: newOrg.role.trim() || 'Member' }],
      });
      setNewOrg({ name: '', role: '' });
      setAddingOrg(false);
      toast.success('Organisation added');
    } catch (error) {
      toast.error(error.message || 'Could not add organisation');
    }
  };

  const removeOrganisation = async (index) => {
    try {
      await save({ organisations: organisations.filter((_, i) => i !== index) });
      toast.success('Organisation removed');
    } catch (error) {
      toast.error(error.message || 'Could not remove organisation');
    }
  };

  const displayName = user?.name || 'Your name';
  const meta = [user?.jobTitle, user?.company].filter(Boolean).join(' · ');

  return (
    <div className="card overflow-hidden">
      {/* Cover — gradient, no stock photo pretending to be the user's workspace */}
      <div className="relative h-24 bg-accent-gradient sm:h-28" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.28),transparent_55%)]" />
      </div>

      <div className="px-4 pb-5 sm:px-6">
        {/* Avatar block: stacks on mobile, overlaps the cover on desktop */}
        <div className="-mt-10 flex flex-col items-start gap-3 sm:-mt-12 sm:flex-row sm:items-end sm:gap-4">
          <div className="relative shrink-0">
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              className={`group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-surface bg-accent-gradient text-xl font-bold text-white shadow-lift transition-all sm:h-24 sm:w-24 ${
                dragActive ? 'scale-105 ring-4 ring-primary-400/50' : ''
              }`}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span aria-hidden="true">{initialsOf(user?.name)}</span>
              )}

              {uploading && (
                <span className="absolute inset-0 flex items-center justify-center bg-neutral-950/60">
                  <FaSpinner size={18} className="animate-spin text-white" />
                </span>
              )}

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 flex items-end justify-center bg-neutral-950/0 pb-1.5 opacity-0 transition-all group-hover:bg-neutral-950/45 group-hover:opacity-100 focus-visible:bg-neutral-950/45 focus-visible:opacity-100"
                aria-label={user?.avatar ? 'Change photo' : 'Upload a photo'}
              >
                <span className="flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[0.6rem] font-semibold text-neutral-900">
                  <FaCamera size={8} /> Photo
                </span>
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
          </div>

          <div className="min-w-0 flex-1 pb-1">
            <h2 className="truncate text-lg font-bold tracking-tight text-content">{displayName}</h2>
            <p className="truncate text-xs text-content-subtle">{user?.email || 'Not signed in'}</p>
            {user?.role && (
              <span className="badge badge-accent mt-1.5 capitalize">{user.role}</span>
            )}
          </div>

          {/* Photo actions: full-width on mobile so they're thumb-reachable */}
          <div className="flex w-full gap-2 sm:w-auto sm:pb-1">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="btn btn-outline btn-sm flex-1 sm:flex-none"
            >
              <FaCamera size={10} /> {user?.avatar ? 'Change' : 'Upload'}
            </button>
            {user?.avatar && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={uploading}
                className="btn btn-ghost btn-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                aria-label="Remove photo"
              >
                <FaTrash size={10} />
              </button>
            )}
          </div>
        </div>

        <p className="mt-2 text-[0.65rem] text-content-subtle">
          Drag an image onto the avatar, or tap Upload. JPEG, PNG, WebP or GIF up to 4 MB.
        </p>

        {/* Details */}
        <dl className="mt-5 grid gap-3 border-t border-line pt-5 sm:grid-cols-2">
          <div className="flex items-start gap-2.5">
            <FaBriefcase size={11} className="mt-1 shrink-0 text-content-subtle" />
            <div className="min-w-0 flex-1">
              <dt className="text-[0.65rem] font-semibold uppercase tracking-wider text-content-subtle">
                Job title
              </dt>
              <dd className="mt-0.5">
                <InlineField
                  value={user?.jobTitle}
                  placeholder="Add your role"
                  maxLength={120}
                  onSave={(jobTitle) => save({ jobTitle })}
                />
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <FaBuilding size={11} className="mt-1 shrink-0 text-content-subtle" />
            <div className="min-w-0 flex-1">
              <dt className="text-[0.65rem] font-semibold uppercase tracking-wider text-content-subtle">
                Company
              </dt>
              <dd className="mt-0.5">
                <InlineField
                  value={user?.company}
                  placeholder="Add your company"
                  maxLength={120}
                  onSave={(company) => save({ company })}
                />
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <FaMapMarkerAlt size={11} className="mt-1 shrink-0 text-content-subtle" />
            <div className="min-w-0 flex-1">
              <dt className="text-[0.65rem] font-semibold uppercase tracking-wider text-content-subtle">
                Location
              </dt>
              <dd className="mt-0.5">
                <InlineField
                  value={user?.location}
                  placeholder="Add your location"
                  maxLength={120}
                  onSave={(location) => save({ location })}
                />
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <FaGlobe size={11} className="mt-1 shrink-0 text-content-subtle" />
            <div className="min-w-0 flex-1">
              <dt className="text-[0.65rem] font-semibold uppercase tracking-wider text-content-subtle">
                Website
              </dt>
              <dd className="mt-0.5">
                <InlineField
                  value={user?.website}
                  placeholder="Add a link"
                  maxLength={200}
                  onSave={(website) => save({ website })}
                />
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2.5 sm:col-span-2">
            <FaLinkedin size={11} className="mt-1 shrink-0 text-content-subtle" />
            <div className="min-w-0 flex-1">
              <dt className="text-[0.65rem] font-semibold uppercase tracking-wider text-content-subtle">
                LinkedIn
              </dt>
              <dd className="mt-0.5">
                <InlineField
                  value={user?.socials?.linkedin}
                  placeholder="Add your LinkedIn"
                  maxLength={200}
                  onSave={(linkedin) => save({ socials: { ...(user?.socials || {}), linkedin } })}
                />
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2.5 sm:col-span-2">
            <FaGithub size={11} className="mt-1 shrink-0 text-content-subtle" />
            <div className="min-w-0 flex-1">
              <dt className="text-[0.65rem] font-semibold uppercase tracking-wider text-content-subtle">
                GitHub
              </dt>
              <dd className="mt-0.5">
                <InlineField
                  value={user?.socials?.github}
                  placeholder="Add your GitHub"
                  maxLength={200}
                  onSave={(github) => save({ socials: { ...(user?.socials || {}), github } })}
                />
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2.5 sm:col-span-2">
            <span className="mt-1 shrink-0 text-content-subtle" aria-hidden="true">
              ¶
            </span>
            <div className="min-w-0 flex-1">
              <dt className="text-[0.65rem] font-semibold uppercase tracking-wider text-content-subtle">
                About
              </dt>
              <dd className="mt-0.5">
                <InlineField
                  as="textarea"
                  multiline
                  value={user?.bio}
                  placeholder="Write a short intro"
                  maxLength={600}
                  onSave={(bio) => save({ bio })}
                />
              </dd>
            </div>
          </div>
        </dl>

        {/* Organisations */}
        <div className="mt-5 border-t border-line pt-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-content">Organisations</h3>
            {!addingOrg && (
              <button
                type="button"
                onClick={() => setAddingOrg(true)}
                className="btn btn-ghost btn-sm"
              >
                <FaPlus size={9} /> Add
              </button>
            )}
          </div>

          {organisations.length === 0 && !addingOrg ? (
            <p className="mt-2 text-xs text-content-subtle">
              You have not added an organisation yet. Add one to show where you work.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {organisations.map((org, index) => (
                <li
                  key={`${org.name}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-sunken px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-content">{org.name}</p>
                    {org.role && <p className="truncate text-[0.65rem] text-content-subtle">{org.role}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOrganisation(index)}
                    className="shrink-0 rounded-lg p-1.5 text-content-subtle transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                    aria-label={`Remove ${org.name}`}
                  >
                    <FaTimes size={10} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {addingOrg && (
            <div className="mt-3 space-y-2 rounded-xl border border-line p-3">
              <input
                type="text"
                value={newOrg.name}
                onChange={(event) => setNewOrg((prev) => ({ ...prev, name: event.target.value }))}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addOrganisation();
                  }
                }}
                placeholder="Organisation name"
                maxLength={120}
                className="w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-content outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                autoFocus
              />
              <input
                type="text"
                value={newOrg.role}
                onChange={(event) => setNewOrg((prev) => ({ ...prev, role: event.target.value }))}
                placeholder="Your role (optional)"
                maxLength={60}
                className="w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-content outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
              />
              <div className="flex gap-2">
                <button type="button" onClick={addOrganisation} className="btn btn-primary btn-sm flex-1">
                  <FaCheck size={9} /> Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddingOrg(false);
                    setNewOrg({ name: '', role: '' });
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {meta && <p className="mt-4 truncate text-[0.65rem] text-content-subtle">{meta}</p>}
      </div>
    </div>
  );
};

export default ProfileCard;
