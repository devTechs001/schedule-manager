import { useEffect, useMemo, useState } from 'react';
import {
  FaUsers,
  FaPlus,
  FaUserPlus,
  FaTrash,
  FaSync,
  FaExclamationTriangle,
  FaInfoCircle,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import EmptyState from '@components/ui/EmptyState';
import Skeleton from '@components/ui/Skeleton';
import { useWorkspaces } from '@hooks/useWorkspaces';
import { useAuth } from '@contexts/AuthContext';

/**
 * Team workspace.
 *
 * Shows the workspaces the signed-in user actually belongs to, with the real
 * member list from the API. The previous version rendered a hardcoded
 * "Product Team" containing John Doe / Jane Smith / Bob Johnson — fabricated
 * colleagues shown to every visitor.
 *
 * When the team API is unreachable (no database, offline) this says so. It never
 * substitutes invented people.
 */

const ROLE_TONE = {
  owner: 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-200',
  admin: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200',
  member: 'bg-surface-sunken text-content-muted',
  viewer: 'bg-surface-sunken text-content-subtle',
};

const initialsOf = (name) =>
  (name || '?')
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const MemberRow = ({ member, canRemove, onRemove }) => {
  const person = member.user || {};
  const name = person.name || 'Unknown member';

  return (
    <li className="flex items-center gap-3 rounded-xl border border-line bg-surface-raised px-3 py-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent-gradient text-[0.65rem] font-bold text-white">
        {person.avatar ? (
          <img src={person.avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          initialsOf(name)
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-content">{name}</p>
        <p className="truncate text-[0.65rem] text-content-subtle">{person.email || 'no email'}</p>
      </div>
      <span
        className={`shrink-0 rounded-md px-1.5 py-0.5 text-[0.6rem] font-semibold capitalize ${
          ROLE_TONE[member.role] || ROLE_TONE.member
        }`}
      >
        {member.role || 'member'}
      </span>
      {canRemove && member.role !== 'owner' && (
        <button
          type="button"
          onClick={() => onRemove(member)}
          className="shrink-0 rounded-lg p-1.5 text-content-subtle transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
          aria-label={`Remove ${name}`}
        >
          <FaTrash size={9} />
        </button>
      )}
    </li>
  );
};

const TeamWorkspace = () => {
  const { user } = useAuth();
  const { workspaces, loading, error, reload, createWorkspace, removeMember } = useWorkspaces();
  const [activeId, setActiveId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'Team — SchedAI';
  }, []);

  useEffect(() => {
    if (!activeId && workspaces.length) setActiveId(workspaces[0]._id);
  }, [workspaces, activeId]);

  const active = useMemo(
    () => workspaces.find((w) => w._id === activeId) || workspaces[0] || null,
    [workspaces, activeId]
  );

  const isOwner = active ? (active.owner?._id || active.owner) === user?._id : false;

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setBusy(true);
    try {
      const created = await createWorkspace({ name });
      setNewName('');
      setCreating(false);
      if (created?._id) setActiveId(created._id);
      toast.success('Workspace created');
    } catch (err) {
      toast.error(err.message || 'Could not create the workspace');
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (member) => {
    const person = member.user || {};
    if (!window.confirm(`Remove ${person.name || 'this member'} from ${active.name}?`)) return;
    try {
      await removeMember(active._id, person._id);
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.message || 'Could not remove that member');
    }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="page-header">
          <div>
            <h1 className="page-title">Team</h1>
            <p className="page-subtitle">Loading your workspaces…</p>
          </div>
        </div>
        <div className="card space-y-3 p-5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rectangular" height={48} className="rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5">
        <div className="page-header">
          <div>
            <h1 className="page-title">Team</h1>
            <p className="page-subtitle">Workspaces you share with other people.</p>
          </div>
        </div>
        <div className="card flex flex-col items-center gap-3 px-4 py-12 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300">
            <FaExclamationTriangle size={16} />
          </span>
          <p className="text-sm font-semibold text-content">Team data is unavailable</p>
          <p className="max-w-md text-xs leading-relaxed text-content-muted">{error}</p>
          <button type="button" onClick={reload} className="btn btn-outline btn-sm mt-1">
            <FaSync size={9} /> Try again
          </button>
        </div>
      </div>
    );
  }

  if (!workspaces.length) {
    return (
      <div className="space-y-5">
        <div className="page-header">
          <div>
            <h1 className="page-title">Team</h1>
            <p className="page-subtitle">Workspaces you share with other people.</p>
          </div>
        </div>

        {creating ? (
          <div className="card space-y-3 p-5">
            <label htmlFor="workspace-name" className="label">
              Workspace name
            </label>
            <input
              id="workspace-name"
              type="text"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleCreate()}
              placeholder="e.g. Product"
              maxLength={120}
              autoFocus
              className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-content outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCreate}
                disabled={busy || !newName.trim()}
                className="btn btn-primary btn-sm"
              >
                {busy ? 'Creating…' : 'Create workspace'}
              </button>
              <button type="button" onClick={() => setCreating(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<FaUsers size={20} />}
            title="No workspaces yet"
            description="Create a workspace to plan alongside other people. You will be its owner."
            action={
              <button type="button" onClick={() => setCreating(true)} className="btn btn-primary">
                <FaPlus size={10} /> Create a workspace
              </button>
            }
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team</h1>
          <p className="page-subtitle">
            {workspaces.length} workspace{workspaces.length === 1 ? '' : 's'} you belong to.
          </p>
        </div>
        <button type="button" onClick={() => setCreating(true)} className="btn btn-outline btn-sm self-start">
          <FaPlus size={9} /> New workspace
        </button>
      </div>

      {creating && (
        <div className="card space-y-3 p-4">
          <input
            type="text"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleCreate()}
            placeholder="Workspace name"
            maxLength={120}
            autoFocus
            className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-content outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
          />
          <div className="flex gap-2">
            <button type="button" onClick={handleCreate} disabled={busy} className="btn btn-primary btn-sm">
              {busy ? 'Creating…' : 'Create'}
            </button>
            <button type="button" onClick={() => setCreating(false)} className="btn btn-ghost btn-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Workspace switcher */}
      {workspaces.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {workspaces.map((workspace) => (
            <button
              key={workspace._id}
              type="button"
              onClick={() => setActiveId(workspace._id)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                active?._id === workspace._id
                  ? 'border-primary-400 bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-200'
                  : 'border-line text-content-muted hover:border-primary-300'
              }`}
            >
              {workspace.name}
            </button>
          ))}
        </div>
      )}

      {active && (
        <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
          <div className="card">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-content">{active.name}</h2>
                {active.description && (
                  <p className="mt-0.5 truncate text-xs text-content-muted">{active.description}</p>
                )}
              </div>
              <span className="shrink-0 text-xs text-content-subtle">
                {(active.members || []).length} member
                {(active.members || []).length === 1 ? '' : 's'}
              </span>
            </div>

            {(active.members || []).length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm font-medium text-content">No members yet</p>
                <p className="mt-1 text-xs text-content-muted">
                  Invite people to start planning together.
                </p>
              </div>
            ) : (
              <ul className="space-y-2 p-4">
                {(active.members || []).map((member) => (
                  <MemberRow
                    key={member.user?._id || member.user}
                    member={member}
                    canRemove={isOwner}
                    onRemove={handleRemove}
                  />
                ))}
              </ul>
            )}
          </div>

          <aside className="space-y-4">
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-content">Invite someone</h3>
              <p className="mt-1 text-xs leading-relaxed text-content-muted">
                Adding members needs their user id and an invite permission. Member invitations by
                email are not wired up on this deployment yet.
              </p>
              <button
                type="button"
                disabled
                className="btn btn-outline btn-sm mt-3 w-full cursor-not-allowed justify-center opacity-60"
                title="Requires an email invitation service"
              >
                <FaUserPlus size={9} /> Invite by email
              </button>
            </div>

            <div className="card flex items-start gap-2.5 p-4">
              <span className="mt-0.5 shrink-0 text-content-subtle">
                <FaInfoCircle size={12} />
              </span>
              <p className="text-[0.68rem] leading-relaxed text-content-muted">
                Membership is stored server-side. Nothing on this page is sample data — if a person
                appears here, they are really in this workspace.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default TeamWorkspace;
