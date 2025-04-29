// Templates for different meeting types
export interface TemplateSection {
  id: string;
  title: string;
  description?: string;
  required: boolean;
}

export interface MeetingTemplate {
  id: string;
  name: string;
  description: string;
  sections: TemplateSection[];
}

// Regular Team Meeting Template
export const regularMeetingTemplate: MeetingTemplate = {
  id: 'regular',
  name: 'Regular Team Meeting',
  description: 'Standard format for recurring team meetings',
  sections: [
    {
      id: 'meeting-info',
      title: 'Meeting Information',
      description: 'Date, time, location, and attendees',
      required: true
    },
    {
      id: 'agenda',
      title: 'Agenda',
      description: 'List of topics discussed',
      required: true
    },
    {
      id: 'previous-action-items',
      title: 'Previous Action Items',
      description: 'Status updates on action items from previous meetings',
      required: false
    },
    {
      id: 'discussion',
      title: 'Discussion',
      description: 'Summary of key points discussed',
      required: true
    },
    {
      id: 'decisions',
      title: 'Decisions',
      description: 'Key decisions made during the meeting',
      required: false
    },
    {
      id: 'action-items',
      title: 'Action Items',
      description: 'Tasks assigned during the meeting with owners and deadlines',
      required: true
    },
    {
      id: 'next-meeting',
      title: 'Next Meeting',
      description: 'Date and time of the next meeting',
      required: false
    }
  ]
};

// Project Status Meeting Template
export const projectStatusTemplate: MeetingTemplate = {
  id: 'project-status',
  name: 'Project Status Meeting',
  description: 'Format focused on project updates and milestones',
  sections: [
    {
      id: 'meeting-info',
      title: 'Meeting Information',
      description: 'Date, time, location, and attendees',
      required: true
    },
    {
      id: 'project-overview',
      title: 'Project Overview',
      description: 'Brief summary of the project and its goals',
      required: true
    },
    {
      id: 'milestone-updates',
      title: 'Milestone Updates',
      description: 'Status of project milestones and deliverables',
      required: true
    },
    {
      id: 'timeline-review',
      title: 'Timeline Review',
      description: 'Review of project timeline and any adjustments',
      required: true
    },
    {
      id: 'blockers',
      title: 'Blockers and Issues',
      description: 'Current challenges and blockers affecting the project',
      required: true
    },
    {
      id: 'resource-allocation',
      title: 'Resource Allocation',
      description: 'Updates on resource allocation and needs',
      required: false
    },
    {
      id: 'budget-status',
      title: 'Budget Status',
      description: 'Overview of budget utilization and forecasts',
      required: false
    },
    {
      id: 'risk-assessment',
      title: 'Risk Assessment',
      description: 'Identified risks and mitigation strategies',
      required: false
    },
    {
      id: 'action-items',
      title: 'Action Items',
      description: 'Tasks assigned during the meeting with owners and deadlines',
      required: true
    },
    {
      id: 'next-steps',
      title: 'Next Steps',
      description: 'Immediate next steps for the project',
      required: true
    }
  ]
};

// Training Session Template
export const trainingTemplate: MeetingTemplate = {
  id: 'training',
  name: 'Training Session',
  description: 'Format for documenting training content and takeaways',
  sections: [
    {
      id: 'session-info',
      title: 'Session Information',
      description: 'Date, time, location, trainer, and attendees',
      required: true
    },
    {
      id: 'training-objectives',
      title: 'Training Objectives',
      description: 'Goals and expected outcomes of the training',
      required: true
    },
    {
      id: 'topics-covered',
      title: 'Topics Covered',
      description: 'List of topics and content covered in the training',
      required: true
    },
    {
      id: 'key-concepts',
      title: 'Key Concepts',
      description: 'Important concepts and takeaways from the training',
      required: true
    },
    {
      id: 'demonstrations',
      title: 'Demonstrations and Examples',
      description: 'Practical demonstrations and examples presented',
      required: false
    },
    {
      id: 'qa-discussion',
      title: 'Q&A and Discussion',
      description: 'Questions asked and answers provided during the session',
      required: false
    },
    {
      id: 'resources',
      title: 'Resources and Materials',
      description: 'Links to training materials and additional resources',
      required: false
    },
    {
      id: 'action-items',
      title: 'Follow-up Actions',
      description: 'Tasks to complete after the training',
      required: true
    },
    {
      id: 'feedback',
      title: 'Feedback',
      description: 'Participant feedback on the training session',
      required: false
    }
  ]
};

// Agile Daily Stand-up Template
export const standupTemplate: MeetingTemplate = {
  id: 'standup',
  name: 'Agile Daily Stand-up',
  description: 'Format for daily scrum meetings (what was done, what will be done, blockers)',
  sections: [
    {
      id: 'meeting-info',
      title: 'Meeting Information',
      description: 'Date, time, and attendees',
      required: true
    },
    {
      id: 'sprint-status',
      title: 'Sprint Status',
      description: 'Current sprint number and days remaining',
      required: true
    },
    {
      id: 'team-updates',
      title: 'Team Updates',
      description: 'Individual updates from team members',
      required: true
    },
    {
      id: 'completed-yesterday',
      title: 'Completed Yesterday',
      description: 'Tasks completed since the last stand-up',
      required: true
    },
    {
      id: 'planned-today',
      title: 'Planned for Today',
      description: 'Tasks planned for the current day',
      required: true
    },
    {
      id: 'blockers',
      title: 'Blockers',
      description: 'Issues preventing progress on tasks',
      required: true
    },
    {
      id: 'action-items',
      title: 'Action Items',
      description: 'Immediate actions needed to address blockers',
      required: false
    }
  ]
};

// Agile Planning Meeting Template
export const planningTemplate: MeetingTemplate = {
  id: 'planning',
  name: 'Agile Planning Meeting',
  description: 'Format for sprint planning sessions with story points and assignments',
  sections: [
    {
      id: 'meeting-info',
      title: 'Meeting Information',
      description: 'Date, time, location, and attendees',
      required: true
    },
    {
      id: 'sprint-goal',
      title: 'Sprint Goal',
      description: 'Primary objective for the upcoming sprint',
      required: true
    },
    {
      id: 'sprint-capacity',
      title: 'Sprint Capacity',
      description: 'Team capacity for the sprint in story points or hours',
      required: true
    },
    {
      id: 'backlog-review',
      title: 'Backlog Review',
      description: 'Review of prioritized backlog items',
      required: true
    },
    {
      id: 'selected-stories',
      title: 'Selected User Stories',
      description: 'User stories selected for the sprint with story points',
      required: true
    },
    {
      id: 'task-breakdown',
      title: 'Task Breakdown',
      description: 'Breakdown of stories into tasks with estimates',
      required: true
    },
    {
      id: 'assignments',
      title: 'Assignments',
      description: 'Initial task assignments to team members',
      required: false
    },
    {
      id: 'dependencies',
      title: 'Dependencies',
      description: 'Identified dependencies between tasks or with external teams',
      required: false
    },
    {
      id: 'risks',
      title: 'Risks and Concerns',
      description: 'Potential risks that might affect the sprint',
      required: false
    },
    {
      id: 'action-items',
      title: 'Action Items',
      description: 'Tasks to be completed before sprint begins',
      required: false
    }
  ]
};

// Agile Retrospective Template
export const retroTemplate: MeetingTemplate = {
  id: 'retro',
  name: 'Agile Retrospective',
  description: 'Format for sprint retrospectives (what went well, what to improve)',
  sections: [
    {
      id: 'meeting-info',
      title: 'Meeting Information',
      description: 'Date, time, location, and attendees',
      required: true
    },
    {
      id: 'sprint-summary',
      title: 'Sprint Summary',
      description: 'Overview of the completed sprint and achievements',
      required: true
    },
    {
      id: 'metrics',
      title: 'Sprint Metrics',
      description: 'Key metrics from the sprint (velocity, completion rate, etc.)',
      required: false
    },
    {
      id: 'went-well',
      title: 'What Went Well',
      description: 'Positive aspects and successes from the sprint',
      required: true
    },
    {
      id: 'challenges',
      title: 'Challenges Faced',
      description: 'Difficulties and obstacles encountered during the sprint',
      required: true
    },
    {
      id: 'improvements',
      title: 'Areas for Improvement',
      description: 'Specific areas where the team can improve',
      required: true
    },
    {
      id: 'action-items',
      title: 'Action Items',
      description: 'Specific actions to implement improvements in the next sprint',
      required: true
    },
    {
      id: 'kudos',
      title: 'Kudos and Recognition',
      description: 'Recognition for team members who made significant contributions',
      required: false
    }
  ]
};

// Map of all templates
export const templates: Record<string, MeetingTemplate> = {
  'regular': regularMeetingTemplate,
  'project-status': projectStatusTemplate,
  'training': trainingTemplate,
  'standup': standupTemplate,
  'planning': planningTemplate,
  'retro': retroTemplate
};

// Function to get template by ID
export function getTemplateById(templateId: string): MeetingTemplate | undefined {
  return templates[templateId];
}

// Function to get all templates
export function getAllTemplates(): MeetingTemplate[] {
  return Object.values(templates);
}
