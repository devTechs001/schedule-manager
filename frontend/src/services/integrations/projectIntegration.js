// Project Management Integration Service

class ProjectIntegrationService {
  constructor() {
    this.providers = {
      asana: { name: 'Asana', connected: false },
      jira: { name: 'Jira', connected: false },
      trello: { name: 'Trello', connected: false },
      monday: { name: 'Monday.com', connected: false },
      clickup: { name: 'ClickUp', connected: false },
    };
    this.projects = [];
    this.tasks = [];
  }

  // Connect to provider
  async connect(provider, credentials = {}) {
    if (!this.providers[provider]) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    await new Promise(r => setTimeout(r, 1500));

    this.providers[provider] = {
      ...this.providers[provider],
      connected: true,
      connectedAt: new Date(),
      workspace: credentials.workspace || 'Default Workspace',
    };

    return { success: true, provider: this.providers[provider] };
  }

  // Disconnect
  disconnect(provider) {
    if (this.providers[provider]) {
      this.providers[provider].connected = false;
    }
  }

  // Sync projects
  async syncProjects(provider) {
    if (!this.providers[provider]?.connected) {
      throw new Error(`Provider ${provider} not connected`);
    }

    await new Promise(r => setTimeout(r, 2000));

    const mockProjects = Array.from({ length: 5 }, (_, i) => ({
      id: `${provider}-project-${i}`,
      provider,
      name: `Project ${i + 1}`,
      description: `Description for project ${i + 1}`,
      status: ['active', 'on-hold', 'completed'][i % 3],
      taskCount: Math.floor(Math.random() * 50) + 10,
      completedTasks: Math.floor(Math.random() * 30),
      dueDate: new Date(Date.now() + Math.random() * 90 * 86400000),
      members: Math.floor(Math.random() * 8) + 2,
    }));

    this.projects = [...this.projects.filter(p => p.provider !== provider), ...mockProjects];
    return mockProjects;
  }

  // Sync tasks from project
  async syncTasks(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');

    await new Promise(r => setTimeout(r, 1500));

    const mockTasks = Array.from({ length: project.taskCount }, (_, i) => ({
      id: `${projectId}-task-${i}`,
      projectId,
      provider: project.provider,
      title: `Task ${i + 1}`,
      description: `Task description ${i + 1}`,
      status: ['todo', 'in-progress', 'review', 'done'][i % 4],
      priority: ['low', 'medium', 'high'][i % 3],
      assignee: `User ${(i % 5) + 1}`,
      dueDate: new Date(Date.now() + Math.random() * 30 * 86400000),
    }));

    this.tasks = [...this.tasks.filter(t => t.projectId !== projectId), ...mockTasks];
    return mockTasks;
  }

  // Get projects
  getProjects(filter = {}) {
    let result = [...this.projects];

    if (filter.provider) {
      result = result.filter(p => p.provider === filter.provider);
    }
    if (filter.status) {
      result = result.filter(p => p.status === filter.status);
    }

    return result;
  }

  // Get tasks
  getTasks(filter = {}) {
    let result = [...this.tasks];

    if (filter.projectId) {
      result = result.filter(t => t.projectId === filter.projectId);
    }
    if (filter.status) {
      result = result.filter(t => t.status === filter.status);
    }
    if (filter.assignee) {
      result = result.filter(t => t.assignee === filter.assignee);
    }

    return result;
  }

  // Create task
  async createTask(projectId, taskData) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');

    await new Promise(r => setTimeout(r, 1000));

    const newTask = {
      id: `${projectId}-task-${Date.now()}`,
      projectId,
      provider: project.provider,
      ...taskData,
      status: taskData.status || 'todo',
      createdAt: new Date(),
    };

    this.tasks.push(newTask);
    return newTask;
  }

  // Update task
  async updateTask(taskId, updates) {
    await new Promise(r => setTimeout(r, 500));

    const index = this.tasks.findIndex(t => t.id === taskId);
    if (index === -1) throw new Error('Task not found');

    this.tasks[index] = { ...this.tasks[index], ...updates, updatedAt: new Date() };
    return this.tasks[index];
  }

  // Import task to local
  async importTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    return {
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      externalId: task.id,
      externalProvider: task.provider,
    };
  }

  // Get connected providers
  getConnectedProviders() {
    return Object.entries(this.providers)
      .filter(([, p]) => p.connected)
      .map(([key, p]) => ({ id: key, ...p }));
  }
}

export const projectIntegration = new ProjectIntegrationService();
export default projectIntegration;

