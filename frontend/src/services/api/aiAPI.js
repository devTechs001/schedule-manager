import client from './client';

const aiAPI = {
  chat: (message) => client.post('/ai/chat', { message }),
  getSuggestions: (context) => client.post('/ai/suggestions', { context }),
  calculatePriority: (taskId) => client.post('/ai/priority', { taskId }),
  getInsights: () => client.get('/ai/insights'),
  analyzeTasks: (tasks) => client.post('/ai/analyze', { tasks }),
};

export default aiAPI;