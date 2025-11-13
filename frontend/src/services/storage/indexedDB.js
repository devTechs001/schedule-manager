import Dexie from 'dexie';

class AppDatabase extends Dexie {
  constructor() {
    super('AIScheduleManagerDB');
    
    this.version(1).stores({
      tasks: '++id, _id, status, priority, dueDate',
      emails: '++id, _id, read, starred, date',
      contacts: '++id, _id, name, email',
      events: '++id, _id, start, end, type',
      syncQueue: '++id, action, timestamp',
    });
  }
}

const db = new AppDatabase();

export const indexedDBService = {
  // Tasks
  saveTasks: async (tasks) => {
    await db.tasks.clear();
    await db.tasks.bulkAdd(tasks);
  },
  
  getTasks: async () => {
    return await db.tasks.toArray();
  },

  // Emails
  saveEmails: async (emails) => {
    await db.emails.clear();
    await db.emails.bulkAdd(emails);
  },
  
  getEmails: async () => {
    return await db.emails.toArray();
  },

  // Contacts
  saveContacts: async (contacts) => {
    await db.contacts.clear();
    await db.contacts.bulkAdd(contacts);
  },
  
  getContacts: async () => {
    return await db.contacts.toArray();
  },

  // Events
  saveEvents: async (events) => {
    await db.events.clear();
    await db.events.bulkAdd(events);
  },
  
  getEvents: async () => {
    return await db.events.toArray();
  },

  // Sync Queue
  addToSyncQueue: async (action) => {
    await db.syncQueue.add(action);
  },
  
  getSyncQueue: async () => {
    return await db.syncQueue.toArray();
  },
  
  clearSyncQueue: async () => {
    await db.syncQueue.clear();
  },
};

export default db;