// AI Meeting Assistant Service

class MeetingAssistantService {
  constructor() {
    this.currentMeeting = null;
    this.notes = [];
    this.actionItems = [];
  }

  // Start meeting session
  startMeeting(meetingData) {
    this.currentMeeting = {
      id: `meeting-${Date.now()}`,
      title: meetingData.title,
      participants: meetingData.participants || [],
      startTime: new Date(),
      endTime: null,
      transcript: [],
      notes: [],
      actionItems: [],
      decisions: [],
    };
    return this.currentMeeting;
  }

  // End meeting session
  endMeeting() {
    if (this.currentMeeting) {
      this.currentMeeting.endTime = new Date();
      const summary = this.generateSummary();
      return { meeting: this.currentMeeting, summary };
    }
    return null;
  }

  // Add transcript entry
  addTranscript(speaker, text, timestamp = new Date()) {
    if (!this.currentMeeting) return;
    
    this.currentMeeting.transcript.push({
      id: Date.now(),
      speaker,
      text,
      timestamp,
    });
  }

  // Add note
  addNote(text, category = 'general') {
    const note = {
      id: Date.now(),
      text,
      category,
      timestamp: new Date(),
    };
    
    if (this.currentMeeting) {
      this.currentMeeting.notes.push(note);
    }
    this.notes.push(note);
    return note;
  }

  // Add action item
  addActionItem(item) {
    const actionItem = {
      id: Date.now(),
      title: item.title,
      assignee: item.assignee,
      dueDate: item.dueDate,
      priority: item.priority || 'medium',
      status: 'pending',
      meetingId: this.currentMeeting?.id,
      createdAt: new Date(),
    };
    
    if (this.currentMeeting) {
      this.currentMeeting.actionItems.push(actionItem);
    }
    this.actionItems.push(actionItem);
    return actionItem;
  }

  // Add decision
  addDecision(decision) {
    if (!this.currentMeeting) return;
    
    this.currentMeeting.decisions.push({
      id: Date.now(),
      text: decision,
      timestamp: new Date(),
    });
  }

  // Generate meeting summary
  generateSummary() {
    if (!this.currentMeeting) return null;

    const duration = this.currentMeeting.endTime
      ? Math.round((this.currentMeeting.endTime - this.currentMeeting.startTime) / 60000)
      : 0;

    return {
      title: this.currentMeeting.title,
      duration: `${duration} minutes`,
      participants: this.currentMeeting.participants.length,
      keyPoints: this.extractKeyPoints(),
      actionItems: this.currentMeeting.actionItems.map(a => ({
        title: a.title,
        assignee: a.assignee,
        dueDate: a.dueDate,
      })),
      decisions: this.currentMeeting.decisions.map(d => d.text),
      nextSteps: this.suggestNextSteps(),
    };
  }

  // Extract key points from transcript
  extractKeyPoints() {
    if (!this.currentMeeting?.transcript) return [];
    
    // Simple extraction based on keywords
    const keywords = ['important', 'key', 'main', 'critical', 'must', 'need to', 'should'];
    
    return this.currentMeeting.transcript
      .filter(entry => keywords.some(kw => entry.text.toLowerCase().includes(kw)))
      .slice(0, 5)
      .map(entry => entry.text);
  }

  // Suggest next steps
  suggestNextSteps() {
    const steps = [];
    
    if (this.currentMeeting?.actionItems.length > 0) {
      steps.push('Follow up on assigned action items');
    }
    if (this.currentMeeting?.decisions.length > 0) {
      steps.push('Document and communicate decisions to stakeholders');
    }
    steps.push('Schedule follow-up meeting if needed');
    steps.push('Share meeting notes with participants');
    
    return steps;
  }

  // Get meeting agenda suggestions
  suggestAgenda(topic, duration = 60) {
    const agendaTemplates = {
      standup: [
        { title: 'Yesterday updates', duration: 10 },
        { title: 'Today plans', duration: 10 },
        { title: 'Blockers', duration: 10 },
      ],
      planning: [
        { title: 'Review objectives', duration: 15 },
        { title: 'Task breakdown', duration: 20 },
        { title: 'Assignments', duration: 15 },
        { title: 'Timeline review', duration: 10 },
      ],
      review: [
        { title: 'Progress update', duration: 15 },
        { title: 'Demo', duration: 20 },
        { title: 'Feedback', duration: 15 },
        { title: 'Next steps', duration: 10 },
      ],
    };

    return agendaTemplates[topic] || [
      { title: 'Introduction', duration: Math.round(duration * 0.1) },
      { title: 'Main discussion', duration: Math.round(duration * 0.6) },
      { title: 'Action items', duration: Math.round(duration * 0.2) },
      { title: 'Wrap-up', duration: Math.round(duration * 0.1) },
    ];
  }

  // Get all action items
  getAllActionItems() {
    return this.actionItems;
  }

  // Get pending action items
  getPendingActionItems() {
    return this.actionItems.filter(a => a.status === 'pending');
  }
}

export const meetingAssistant = new MeetingAssistantService();
export default meetingAssistant;

