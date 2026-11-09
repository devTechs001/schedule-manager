import client from './client';
import { asList } from './tasksAPI';

const contactsAPI = {
  getAll: async (params = {}) => asList(await client.get('/contacts', { params })),
  getById: (id) => client.get(`/contacts/${id}`),
  create: (data) => client.post('/contacts', data),
  update: (id, data) => client.put(`/contacts/${id}`, data),
  delete: (id) => client.delete(`/contacts/${id}`),
  search: async (query) => asList(await client.get('/contacts', { params: { search: query } })),
};

export default contactsAPI;
