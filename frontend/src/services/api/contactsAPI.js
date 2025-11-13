import client from './client';

const contactsAPI = {
  getAll: () => client.get('/contacts'),
  getById: (id) => client.get(`/contacts/${id}`),
  create: (data) => client.post('/contacts', data),
  update: (id, data) => client.put(`/contacts/${id}`, data),
  delete: (id) => client.delete(`/contacts/${id}`),
  search: (query) => client.get(`/contacts/search?q=${query}`),
};

export default contactsAPI;