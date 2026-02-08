// CRM Integration Service

class CRMIntegrationService {
  constructor() {
    this.providers = {
      salesforce: { name: 'Salesforce', connected: false },
      hubspot: { name: 'HubSpot', connected: false },
      pipedrive: { name: 'Pipedrive', connected: false },
      zoho: { name: 'Zoho CRM', connected: false },
    };
    this.contacts = [];
    this.deals = [];
  }

  // Connect to CRM
  async connect(provider, credentials = {}) {
    if (!this.providers[provider]) {
      throw new Error(`Unknown CRM provider: ${provider}`);
    }

    await new Promise(r => setTimeout(r, 2000));

    this.providers[provider] = {
      ...this.providers[provider],
      connected: true,
      connectedAt: new Date(),
      token: `crm-token-${Date.now()}`,
      ...credentials,
    };

    return { success: true, provider: this.providers[provider] };
  }

  // Disconnect from CRM
  disconnect(provider) {
    if (this.providers[provider]) {
      this.providers[provider].connected = false;
      this.providers[provider].token = null;
    }
  }

  // Sync contacts
  async syncContacts(provider) {
    if (!this.providers[provider]?.connected) {
      throw new Error(`CRM ${provider} not connected`);
    }

    await new Promise(r => setTimeout(r, 2000));

    const mockContacts = Array.from({ length: 20 }, (_, i) => ({
      id: `${provider}-contact-${i}`,
      provider,
      name: `Contact ${i + 1}`,
      email: `contact${i}@company.com`,
      company: `Company ${Math.floor(i / 3) + 1}`,
      phone: `+1-555-${String(i).padStart(4, '0')}`,
      status: ['lead', 'prospect', 'customer'][i % 3],
      lastActivity: new Date(Date.now() - Math.random() * 30 * 86400000),
    }));

    this.contacts = [...this.contacts.filter(c => c.provider !== provider), ...mockContacts];
    return mockContacts;
  }

  // Sync deals/opportunities
  async syncDeals(provider) {
    if (!this.providers[provider]?.connected) {
      throw new Error(`CRM ${provider} not connected`);
    }

    await new Promise(r => setTimeout(r, 1500));

    const mockDeals = Array.from({ length: 10 }, (_, i) => ({
      id: `${provider}-deal-${i}`,
      provider,
      name: `Deal ${i + 1}`,
      value: Math.floor(Math.random() * 100000) + 5000,
      stage: ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed'][i % 5],
      probability: [20, 40, 60, 80, 100][i % 5],
      expectedClose: new Date(Date.now() + Math.random() * 90 * 86400000),
      contactId: `${provider}-contact-${i % 20}`,
    }));

    this.deals = [...this.deals.filter(d => d.provider !== provider), ...mockDeals];
    return mockDeals;
  }

  // Get contacts
  getContacts(filter = {}) {
    let result = [...this.contacts];

    if (filter.provider) {
      result = result.filter(c => c.provider === filter.provider);
    }
    if (filter.status) {
      result = result.filter(c => c.status === filter.status);
    }
    if (filter.search) {
      const search = filter.search.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.company.toLowerCase().includes(search)
      );
    }

    return result;
  }

  // Get deals
  getDeals(filter = {}) {
    let result = [...this.deals];

    if (filter.provider) {
      result = result.filter(d => d.provider === filter.provider);
    }
    if (filter.stage) {
      result = result.filter(d => d.stage === filter.stage);
    }

    return result;
  }

  // Create contact
  async createContact(provider, contactData) {
    if (!this.providers[provider]?.connected) {
      throw new Error(`CRM ${provider} not connected`);
    }

    await new Promise(r => setTimeout(r, 1000));

    const newContact = {
      id: `${provider}-contact-${Date.now()}`,
      provider,
      ...contactData,
      createdAt: new Date(),
    };

    this.contacts.push(newContact);
    return newContact;
  }

  // Update contact
  async updateContact(contactId, updates) {
    await new Promise(r => setTimeout(r, 500));

    const index = this.contacts.findIndex(c => c.id === contactId);
    if (index === -1) throw new Error('Contact not found');

    this.contacts[index] = { ...this.contacts[index], ...updates, updatedAt: new Date() };
    return this.contacts[index];
  }

  // Get pipeline summary
  getPipelineSummary() {
    const stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed'];
    
    return stages.map(stage => {
      const stageDeals = this.deals.filter(d => d.stage === stage);
      return {
        stage,
        count: stageDeals.length,
        value: stageDeals.reduce((sum, d) => sum + d.value, 0),
      };
    });
  }
}

export const crmIntegration = new CRMIntegrationService();
export default crmIntegration;

