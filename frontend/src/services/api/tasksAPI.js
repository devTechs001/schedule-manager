import client from './client';

const tasksAPI = {
  getAll: () => client.get('/tasks'),
  getById: (id) => client.get(`/tasks/${id}`),
  create: (data) => client.post('/tasks', data),
  update: (id, data) => client.put(`/tasks/${id}`, data),
  delete: (id) => client.delete(`/tasks/${id}`),
  getByStatus: (status) => client.get(`/tasks/status/${status}`),
  getByPriority: (priority) => client.get(`/tasks/priority/${priority}`),
};

export default tasksAPI;