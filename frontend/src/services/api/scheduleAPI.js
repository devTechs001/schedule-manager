import client from './client';
import { asList } from './tasksAPI';

const scheduleAPI = {
  getAll: async (params = {}) => asList(await client.get('/schedule', { params })),
  getById: (id) => client.get(`/schedule/${id}`),
  create: (data) => client.post('/schedule', data),
  update: (id, data) => client.put(`/schedule/${id}`, data),
  delete: (id) => client.delete(`/schedule/${id}`),
  getByDateRange: async (start, end) =>
    asList(await client.get('/schedule', { params: { start, end } })),
};

export default scheduleAPI;
