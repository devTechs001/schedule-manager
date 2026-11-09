import client from './client';
import { asList } from './tasksAPI';

const emailsAPI = {
  getAll: async (params = {}) => asList(await client.get('/emails', { params })),
  getById: (id) => client.get(`/emails/${id}`),
  send: (data) => client.post('/emails/send', data),
  markAsRead: (id) => client.patch(`/emails/${id}/read`),
  toggleStar: (id, starred) => client.patch(`/emails/${id}/star`, { starred }),
  delete: (id) => client.delete(`/emails/${id}`),
  search: async (query) => asList(await client.get('/emails', { params: { search: query } })),
};

export default emailsAPI;
