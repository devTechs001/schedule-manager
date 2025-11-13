import client from './client';

const emailsAPI = {
  getAll: () => client.get('/emails'),
  getById: (id) => client.get(`/emails/${id}`),
  send: (data) => client.post('/emails/send', data),
  markAsRead: (id) => client.patch(`/emails/${id}/read`),
  toggleStar: (id, starred) => client.patch(`/emails/${id}/star`, { starred }),
  delete: (id) => client.delete(`/emails/${id}`),
  search: (query) => client.get(`/emails/search?q=${query}`),
};

export default emailsAPI;