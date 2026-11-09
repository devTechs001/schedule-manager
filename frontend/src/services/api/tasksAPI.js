import client from './client';

/**
 * Guard against malformed / exploded responses.
 * The old hooks assumed `data` was always an array which produced
 * "tasks.filter is not a function" crashes when the API returned an object.
 */
export const asList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload) return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.tasks)) return payload.tasks;
  if (Array.isArray(payload.events)) return payload.events;
  if (Array.isArray(payload.emails)) return payload.emails;
  if (Array.isArray(payload.contacts)) return payload.contacts;
  return [];
};

const tasksAPI = {
  getAll: async (params = {}) => asList(await client.get('/tasks', { params })),
  getById: (id) => client.get(`/tasks/${id}`),
  create: (data) => client.post('/tasks', data),
  update: (id, data) => client.put(`/tasks/${id}`, data),
  delete: (id) => client.delete(`/tasks/${id}`),
  getStats: () => client.get('/tasks/stats'),
  getByStatus: async (status) => asList(await client.get('/tasks', { params: { status } })),
  getByPriority: async (priority) => asList(await client.get('/tasks', { params: { priority } })),
};

export default tasksAPI;
