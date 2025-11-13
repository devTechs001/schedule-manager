import client from './client';

const scheduleAPI = {
  getAll: () => client.get('/schedule'),
  getById: (id) => client.get(`/schedule/${id}`),
  create: (data) => client.post('/schedule', data),
  update: (id, data) => client.put(`/schedule/${id}`, data),
  delete: (id) => client.delete(`/schedule/${id}`),
  getByDateRange: (start, end) => client.get(`/schedule/range?start=${start}&end=${end}`),
};

export default scheduleAPI;