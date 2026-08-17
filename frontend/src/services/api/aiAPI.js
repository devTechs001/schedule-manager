import client from './client';
import axios from 'axios';
import config from '../../config/app';

const aiAPI = {
  chat: (message) => client.post('/ai/chat', { message }),
  getSuggestions: (context) => client.post('/ai/suggestions', { context }),
  calculatePriority: (taskId) => client.post('/ai/priority', { taskId }),
  getInsights: () => {
    // Use public endpoint if no token, otherwise use protected endpoint
    const token = localStorage.getItem('token');
    if (token) {
      return client.get('/ai/insights');
    } else {
      return axios.get(`${config.apiUrl}/ai/insights/public`);
    }
  },
  analyzeTasks: (tasks) => client.post('/ai/analyze', { tasks }),
};

export default aiAPI;