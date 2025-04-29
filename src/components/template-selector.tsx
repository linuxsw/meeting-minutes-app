'use client'

import React, { useState } from 'react'

interface TemplateSelectorProps {
  onSelect: (template: string) => void
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  
  const templates = [
    {
      id: 'regular',
      name: 'Regular Team Meeting',
      description: 'Standard format for recurring team meetings'
    },
    {
      id: 'project-status',
      name: 'Project Status Meeting',
      description: 'Format focused on project updates and milestones'
    },
    {
      id: 'training',
      name: 'Training Session',
      description: 'Format for documenting training content and takeaways'
    },
    {
      id: 'standup',
      name: 'Agile Daily Stand-up',
      description: 'Format for daily scrum meetings (what was done, what will be done, blockers)'
    },
    {
      id: 'planning',
      name: 'Agile Planning Meeting',
      description: 'Format for sprint planning sessions with story points and assignments'
    },
    {
      id: 'retro',
      name: 'Agile Retrospective',
      description: 'Format for sprint retrospectives (what went well, what to improve)'
    }
  ]
  
  const handleSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    onSelect(templateId)
  }
  
  return (
    <div className="space-y-3">
      {templates.map((template) => (
        <div 
          key={template.id}
          className={`border rounded-md p-3 cursor-pointer transition-colors ${
            selectedTemplate === template.id 
              ? 'border-primary bg-primary/10' 
              : 'hover:border-primary/50'
          }`}
          onClick={() => handleSelect(template.id)}
        >
          <h3 className="font-medium">{template.name}</h3>
          <p className="text-sm text-muted-foreground">{template.description}</p>
        </div>
      ))}
    </div>
  )
}
