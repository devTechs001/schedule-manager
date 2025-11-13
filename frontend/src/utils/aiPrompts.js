export const AI_PROMPTS = {
    taskSuggestion: (tasks) => `
      Based on these tasks: ${JSON.stringify(tasks)}, 
      suggest the best order to complete them considering priority, due dates, and dependencies.
      Provide a brief explanation for each suggestion.
    `,
  
    emailDraft: (context) => `
      Write a professional email with the following context:
      To: ${context.to}
      Subject: ${context.subject}
      Context: ${context.context}
      Tone: ${context.tone || 'professional'}
    `,
  
    scheduleSuggestion: (events, preferences) => `
      Given these scheduled events: ${JSON.stringify(events)}
      and user preferences: ${JSON.stringify(preferences)},
      suggest optimal time blocks for focused work.
    `,
  
    taskBreakdown: (task) => `
      Break down this task into smaller, manageable subtasks:
      "${task}"
      Provide 3-5 subtasks with estimated time for each.
    `,
  
    productivityInsight: (data) => `
      Analyze this productivity data: ${JSON.stringify(data)}
      Provide insights on:
      1. Peak productivity hours
      2. Task completion patterns
      3. Suggestions for improvement
    `,
  
    priorityAnalysis: (task) => `
      Analyze this task and suggest a priority level (low/medium/high):
      Title: ${task.title}
      Description: ${task.description}
      Due Date: ${task.dueDate}
      Consider urgency, importance, and impact.
    `,
  
    meetingSummary: (transcript) => `
      Summarize this meeting transcript:
      ${transcript}
      Include:
      1. Key points discussed
      2. Action items
      3. Decisions made
    `,
  
    smartReply: (email) => `
      Generate 3 smart reply options for this email:
      From: ${email.from}
      Subject: ${email.subject}
      Body: ${email.body}
      Keep replies brief and professional.
    `,
  };
  
  export const buildAIPrompt = (type, data) => {
    const promptBuilder = AI_PROMPTS[type];
    return promptBuilder ? promptBuilder(data) : '';
  };