// Natural Language Processing Service
class NLPProcessor {
  constructor() {
    this.taskPatterns = {
      create: [
        /create\s+(?:a\s+)?task\s+(?:to\s+)?(.+)/i,
        /add\s+(?:a\s+)?task\s+(?:to\s+)?(.+)/i,
        /new\s+task\s+(?:to\s+)?(.+)/i,
        /task\s+(?:to\s+)?(.+)/i,
        /i\s+need\s+to\s+(.+)/i,
        /remind\s+me\s+to\s+(.+)/i,
      ],
      complete: [
        /complete(?:d)?\s+task\s+(.+)/i,
        /finish(?:ed)?\s+task\s+(.+)/i,
        /done\s+task\s+(.+)/i,
        /mark\s+(?:as\s+)?complete(?:d)?\s+(.+)/i,
      ],
      delete: [
        /delete\s+task\s+(.+)/i,
        /remove\s+task\s+(.+)/i,
        /cancel\s+task\s+(.+)/i,
      ],
    };

    this.schedulePatterns = {
      meeting: [
        /schedule\s+(?:a\s+)?meeting\s+(?:with\s+)?(.+?)\s+(?:at|on)\s+(.+)/i,
        /meeting\s+(?:with\s+)?(.+?)\s+(?:at|on)\s+(.+)/i,
        /set\s+up\s+(?:a\s+)?meeting\s+(?:with\s+)?(.+?)\s+(?:at|on)\s+(.+)/i,
      ],
      event: [
        /schedule\s+(?:a\s+)?(?:event|appointment)\s+(?:for\s+)?(.+?)\s+(?:at|on)\s+(.+)/i,
        /(?:event|appointment)\s+(?:for\s+)?(.+?)\s+(?:at|on)\s+(.+)/i,
      ],
      reminder: [
        /remind\s+me\s+(?:to\s+)?(.+?)\s+(?:at|on)\s+(.+)/i,
        /set\s+(?:a\s+)?reminder\s+(?:for\s+)?(.+?)\s+(?:at|on)\s+(.+)/i,
      ],
    };

    this.priorityKeywords = {
      high: ['urgent', 'important', 'critical', 'asap', 'high priority', 'immediately'],
      medium: ['medium', 'moderate', 'soon', 'this week'],
      low: ['low', 'later', 'sometime', 'when possible', 'no rush'],
    };

    this.timePatterns = {
      today: /\b(today)\b/i,
      tomorrow: /\b(tomorrow)\b/i,
      week: /\b(next\s+week|this\s+week)\b/i,
      month: /\b(next\s+month|this\s+month)\b/i,
      specificTime: /(\d{1,2}:\d{2}\s*(?:am|pm)?)/i,
      relativeTime: /(\d+\s+(?:minutes?|hours?|days?|weeks?)\s+(?:from\s+now|later))/i,
    };
  }

  processInput(input) {
    const input_lower = input.toLowerCase().trim();
    
    // Determine intent
    const intent = this.detectIntent(input_lower);
    
    // Extract entities
    const entities = this.extractEntities(input);
    
    // Determine priority
    const priority = this.extractPriority(input_lower);
    
    // Extract dates/times
    const datetime = this.extractDateTime(input);
    
    return {
      intent,
      entities,
      priority,
      datetime,
      originalInput: input,
      confidence: this.calculateConfidence(intent, entities),
    };
  }

  detectIntent(input) {
    // Check for task-related intents
    for (const [intent, patterns] of Object.entries(this.taskPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(input)) {
          return { type: 'task', action: intent, pattern: pattern.source };
        }
      }
    }

    // Check for schedule-related intents
    for (const [intent, patterns] of Object.entries(this.schedulePatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(input)) {
          return { type: 'schedule', action: intent, pattern: pattern.source };
        }
      }
    }

    // Check for email-related intents
    if (input.includes('email') || input.includes('mail') || input.includes('send')) {
      return { type: 'email', action: 'compose', pattern: 'email_keyword' };
    }

    // Check for contact-related intents
    if (input.includes('contact') || input.includes('add') && input.includes('person')) {
      return { type: 'contact', action: 'create', pattern: 'contact_keyword' };
    }

    return { type: 'unknown', action: 'unknown', pattern: null };
  }

  extractEntities(input) {
    const entities = {};

    // Extract people (mentions of names)
    const people = this.extractPeople(input);
    if (people.length > 0) {
      entities.people = people;
    }

    // Extract locations
    const locations = this.extractLocations(input);
    if (locations.length > 0) {
      entities.locations = locations;
    }

    // Extract topics/subjects
    const topics = this.extractTopics(input);
    if (topics.length > 0) {
      entities.topics = topics;
    }

    return entities;
  }

  extractPeople(input) {
    const people = [];
    
    // Common name patterns
    const namePatterns = [
      /\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b/g, // First Last
      /\b([A-Z][a-z]+)\b/g, // Single capitalized word
    ];

    namePatterns.forEach(pattern => {
      const matches = input.match(pattern);
      if (matches) {
        people.push(...matches);
      }
    });

    return [...new Set(people)]; // Remove duplicates
  }

  extractLocations(input) {
    const locations = [];
    
    // Common location indicators
    const locationKeywords = ['at', 'in', 'on', 'room', 'office', 'building', 'floor'];
    const words = input.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      if (locationKeywords.includes(words[i].toLowerCase())) {
        // Get the next word(s) as location
        const nextWords = words.slice(i + 1, i + 3).join(' ');
        if (nextWords.length > 2) {
          locations.push(nextWords);
        }
      }
    }

    return locations;
  }

  extractTopics(input) {
    const topics = [];
    
    // Look for task descriptions after action words
    const actionWords = ['to', 'for', 'about', 'regarding'];
    const words = input.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      if (actionWords.includes(words[i].toLowerCase())) {
        // Get the rest of the sentence as topic
        const topic = words.slice(i + 1).join(' ');
        if (topic.length > 2) {
          topics.push(topic);
        }
      }
    }

    return topics;
  }

  extractPriority(input) {
    for (const [level, keywords] of Object.entries(this.priorityKeywords)) {
      for (const keyword of keywords) {
        if (input.includes(keyword)) {
          return level;
        }
      }
    }
    return 'medium'; // Default priority
  }

  extractDateTime(input) {
    const datetime = {};

    // Check for specific time patterns
    for (const [type, pattern] of Object.entries(this.timePatterns)) {
      const match = input.match(pattern);
      if (match) {
        datetime[type] = match[0];
        datetime.raw = match[0];
        break;
      }
    }

    // Convert to actual date objects
    if (datetime.today) {
      datetime.date = new Date();
      datetime.date.setHours(9, 0, 0, 0); // Default to 9 AM
    } else if (datetime.tomorrow) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      datetime.date = tomorrow;
      datetime.date.setHours(9, 0, 0, 0);
    } else if (datetime.specificTime) {
      const today = new Date();
      const [time, period] = datetime.specificTime.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      
      datetime.date = new Date();
      datetime.date.setHours(
        period === 'pm' && hours < 12 ? hours + 12 : hours,
        minutes || 0,
        0,
        0
      );
    }

    return datetime;
  }

  calculateConfidence(intent, entities) {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on intent detection
    if (intent.type !== 'unknown') {
      confidence += 0.3;
    }

    // Increase confidence based on extracted entities
    const entityCount = Object.keys(entities).length;
    confidence += Math.min(entityCount * 0.1, 0.2);

    return Math.min(confidence, 1.0);
  }

  // Generate structured task from natural language
  generateTask(input) {
    const processed = this.processInput(input);
    
    if (processed.intent.type !== 'task' || processed.intent.action !== 'create') {
      return null;
    }

    const task = {
      title: this.extractTaskTitle(input),
      description: input,
      priority: processed.priority || 'medium',
      dueDate: processed.datetime?.date || null,
      tags: this.extractTags(input),
      status: 'pending',
      createdAt: new Date(),
    };

    // Add people as assignees if found
    if (processed.entities.people) {
      task.assignees = processed.entities.people;
    }

    return task;
  }

  extractTaskTitle(input) {
    // Extract the core task description
    const patterns = [
      /(?:task|create|add|new)\s+(?:a\s+)?(?:task\s+)?(?:to\s+)?(.+)/i,
      /i\s+need\s+to\s+(.+)/i,
      /remind\s+me\s+to\s+(.+)/i,
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return input.trim();
  }

  extractTags(input) {
    const tags = [];
    
    // Common tag indicators
    const tagPatterns = [
      /#(\w+)/g, // #hashtag style
      /\[(\w+)\]/g, // [bracket] style
    ];

    tagPatterns.forEach(pattern => {
      const matches = input.match(pattern);
      if (matches) {
        tags.push(...matches.map(m => m.replace(/[#\[\]]/g, '')));
      }
    });

    return tags;
  }

  // Generate structured event from natural language
  generateEvent(input) {
    const processed = this.processInput(input);
    
    if (processed.intent.type !== 'schedule') {
      return null;
    }

    const event = {
      title: this.extractEventTitle(input),
      description: input,
      type: processed.intent.action,
      start: processed.datetime?.date || new Date(),
      attendees: processed.entities.people || [],
      location: processed.entities.locations?.[0] || null,
      createdAt: new Date(),
    };

    return event;
  }

  extractEventTitle(input) {
    const patterns = [
      /(?:meeting|event|appointment)\s+(?:with\s+)?(.+?)\s+(?:at|on)/i,
      /schedule\s+(?:a\s+)?(?:meeting|event|appointment)\s+(?:with\s+)?(.+?)\s+(?:at|on)/i,
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return input.trim();
  }
}

export const nlpProcessor = new NLPProcessor();
export default nlpProcessor;