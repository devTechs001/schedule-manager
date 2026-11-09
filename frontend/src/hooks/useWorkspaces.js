import { useCallback, useEffect, useState } from 'react';
import client from '@services/api/client';

/**
 * useWorkspaces — real team/workspace data.
 *
 * Backed by GET /api/workspace, which returns the workspaces the signed-in user
 * belongs to, with owner and member users populated. When the API or its
 * database is unavailable we surface that as an explicit error instead of
 * substituting invented people — a team screen showing "John Doe" that does not
 * exist is worse than an honest empty state.
 */
export const useWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await client.get('/workspace');
      const list = Array.isArray(data) ? data : Array.isArray(data?.workspaces) ? data.workspaces : [];
      setWorkspaces(list);
      setError(null);
    } catch (err) {
      setWorkspaces([]);
      // 503 means "no database" rather than "no workspaces" — say so plainly.
      setError(
        err.status === 503
          ? 'Team features need a database connection. Your workspace data is safe and will appear here once it is reachable.'
          : err.message || 'Could not load your workspaces.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Create a workspace. */
  const createWorkspace = useCallback(async (payload) => {
    const data = await client.post('/workspace', payload);
    const created = data?.workspace || data;
    if (created?._id) setWorkspaces((prev) => [created, ...prev]);
    return created;
  }, []);

  /** Add a member by user id (the API resolves the user). */
  const addMember = useCallback(async (workspaceId, userId, role = 'member') => {
    const data = await client.post(`/workspace/${workspaceId}/members`, { userId, role });
    const updated = data?.workspace || data;
    if (updated?._id) {
      setWorkspaces((prev) => prev.map((w) => (w._id === updated._id ? updated : w)));
    }
    return updated;
  }, []);

  const removeMember = useCallback(async (workspaceId, userId) => {
    await client.delete(`/workspace/${workspaceId}/members/${userId}`);
    setWorkspaces((prev) =>
      prev.map((w) =>
        w._id === workspaceId
          ? { ...w, members: (w.members || []).filter((m) => (m.user?._id || m.user) !== userId) }
          : w
      )
    );
  }, []);

  return { workspaces, loading, error, reload: load, createWorkspace, addMember, removeMember };
};

export default useWorkspaces;
