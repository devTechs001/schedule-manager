import client from './client';
import axios from 'axios';
import config from '../../config/app';

const aiAPI = {
  chat: (message) => client.post('/ai/chat', { message }),
  getSuggestions: (context) => client.post('/ai/suggestions', { context }),
  calculatePriority: (taskId) => client.post('/ai/priority', { taskId }),
  /**
   * Insights for the signed-in user, or the public (anonymous) set when there
   * is no token.
   *
   * The public branch cannot use `client`: `client` attaches the auth header
   * and, more importantly, unwraps the backend's `{ success, data }` envelope.
   * Raw axios does neither, so this branch used to hand callers the whole
   * envelope — `{ success, data: [], reason }` — while the protected branch
   * handed them an array. AIContext stored whichever it got, so the shape of
   * `insights` depended on whether the visitor was signed in. Both branches
   * return an array now.
   */
  getInsights: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      return client.get('/ai/insights');
    }
    const response = await axios.get(`${config.apiUrl}/ai/insights/public`);
    const body = response?.data;
    if (Array.isArray(body)) return body;
    return Array.isArray(body?.data) ? body.data : [];
  },
  analyzeDocument: (text, fileName) => client.post('/ai/document', { text, fileName }),
  draftReplies: (message, tone, count) => client.post('/ai/replies', { message, tone, count }),
  summariseMeeting: (transcript) => client.post('/ai/meeting', { transcript }),
};

export default aiAPI;