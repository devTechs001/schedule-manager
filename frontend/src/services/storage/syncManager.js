import { indexedDBService } from './indexedDB';
import tasksAPI from '@services/api/tasksAPI';
import emailsAPI from '@services/api/emailsAPI';
import contactsAPI from '@services/api/contactsAPI';
import scheduleAPI from '@services/api/scheduleAPI';

const syncManager = {
  queueAction: async (action) => {
    await indexedDBService.addToSyncQueue(action);
  },

  syncPendingActions: async () => {
    const queue = await indexedDBService.getSyncQueue();
    
    for (const item of queue) {
      try {
        await syncManager.executeAction(item);
      } catch (error) {
        console.error('Failed to sync action:', item, error);
      }
    }
    
    await indexedDBService.clearSyncQueue();
  },

  executeAction: async (item) => {
    const { action, data } = item;
    
    switch (action) {
      case 'createTask':
        await tasksAPI.create(data);
        break;
      case 'updateTask':
        await tasksAPI.update(data.id, data.updates);
        break;
      case 'deleteTask':
        await tasksAPI.delete(data);
        break;
      case 'sendEmail':
        await emailsAPI.send(data);
        break;
      case 'createContact':
        await contactsAPI.create(data);
        break;
      case 'updateContact':
        await contactsAPI.update(data.id, data.updates);
        break;
      case 'createEvent':
        await scheduleAPI.create(data);
        break;
      case 'updateEvent':
        await scheduleAPI.update(data.id, data.updates);
        break;
      default:
        console.warn('Unknown action:', action);
    }
  },

  syncAllData: async () => {
    try {
      const [tasks, emails, contacts, events] = await Promise.all([
        tasksAPI.getAll(),
        emailsAPI.getAll(),
        contactsAPI.getAll(),
        scheduleAPI.getAll(),
      ]);

      await Promise.all([
        indexedDBService.saveTasks(tasks),
        indexedDBService.saveEmails(emails),
        indexedDBService.saveContacts(contacts),
        indexedDBService.saveEvents(events),
      ]);
    } catch (error) {
      console.error('Failed to sync data:', error);
    }
  },
};

export default syncManager;