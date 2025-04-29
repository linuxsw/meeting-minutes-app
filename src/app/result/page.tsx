'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { ProcessedTranscript } from '@/lib/transcript-processor'
import { MeetingTemplate, getTemplateById } from '@/lib/meeting-templates'
import { MeetingData, generateDocument } from '@/lib/document-generator'

interface ResultPageProps {
  transcript: ProcessedTranscript
  templateId: string
  outputFormat: 'pdf' | 'docx' | 'html' | 'txt'
}

export default function ResultPage({
  transcript,
  templateId,
  outputFormat
}: ResultPageProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [meetingData, setMeetingData] = useState<MeetingData>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    attendees: transcript.speakers.map(speaker => speaker.name),
    previousActionItems: []
  })
  const template = getTemplateById(templateId)
  
  const handleInputChange = (field: keyof MeetingData, value: any) => {
    setMeetingData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const handleAttendeesChange = (index: number, value: string) => {
    const newAttendees = [...meetingData.attendees]
    newAttendees[index] = value
    handleInputChange('attendees', newAttendees)
  }
  
  const addAttendee = () => {
    handleInputChange('attendees', [...meetingData.attendees, ''])
  }
  
  const removeAttendee = (index: number) => {
    const newAttendees = meetingData.attendees.filter((_, i) => i !== index)
    handleInputChange('attendees', newAttendees)
  }
  
  const handlePreviousActionItemChange = (index: number, value: string) => {
    const newItems = [...(meetingData.previousActionItems || [])]
    newItems[index] = value
    handleInputChange('previousActionItems', newItems)
  }
  
  const addPreviousActionItem = () => {
    handleInputChange('previousActionItems', [...(meetingData.previousActionItems || []), ''])
  }
  
  const removePreviousActionItem = (index: number) => {
    const newItems = (meetingData.previousActionItems || []).filter((_, i) => i !== index)
    handleInputChange('previousActionItems', newItems)
  }
  
  const handleGenerateDocument = async () => {
    setIsGenerating(true)
    
    try {
      const blob = await generateDocument(templateId, transcript, meetingData, outputFormat)
      
      // Create a download link
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${meetingData.title || 'meeting-minutes'}.${getFileExtension(outputFormat)}`
      document.body.appendChild(a)
      a.click()
      
      // Clean up
      URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error generating document:', error)
      alert('Failed to generate document. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }
  
  // Helper function to get file extension based on format
  const getFileExtension = (format: string): string => {
    switch (format) {
      case 'pdf': return 'pdf'
      case 'docx': return 'docx'
      case 'html': return 'html'
      case 'txt': return 'txt'
      default: return 'pdf'
    }
  }
  
  if (!template) {
    return <div className="container py-10">Template not found</div>
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Generate Meeting Minutes</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Meeting Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Meeting Title</label>
            <input
              type="text"
              value={meetingData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder={template.name}
              className="w-full p-2 border rounded-md bg-background"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-1">Date</label>
            <input
              type="date"
              value={meetingData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Start Time (Optional)</label>
              <input
                type="time"
                value={meetingData.startTime || ''}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              />
            </div>
            
            <div>
              <label className="block text-sm mb-1">End Time (Optional)</label>
              <input
                type="time"
                value={meetingData.endTime || ''}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm mb-1">Location (Optional)</label>
            <input
              type="text"
              value={meetingData.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Virtual / Conference Room / etc."
              className="w-full p-2 border rounded-md bg-background"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm">Attendees</label>
              <button
                onClick={addAttendee}
                className="text-sm text-primary hover:underline"
              >
                + Add Attendee
              </button>
            </div>
            
            {meetingData.attendees.map((attendee, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={attendee}
                  onChange={(e) => handleAttendeesChange(index, e.target.value)}
                  className="flex-1 p-2 border rounded-md bg-background"
                />
                <button
                  onClick={() => removeAttendee(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          
          {template.sections.some(section => section.id === 'previous-action-items') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm">Previous Action Items</label>
                <button
                  onClick={addPreviousActionItem}
                  className="text-sm text-primary hover:underline"
                >
                  + Add Item
                </button>
              </div>
              
              {(meetingData.previousActionItems || []).map((item, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handlePreviousActionItemChange(index, e.target.value)}
                    className="flex-1 p-2 border rounded-md bg-background"
                  />
                  <button
                    onClick={() => removePreviousActionItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Template: {template.name}</h2>
        <p className="text-muted-foreground mb-4">{template.description}</p>
        
        <div className="space-y-2">
          <h3 className="font-medium">Sections:</h3>
          <ul className="list-disc pl-5 space-y-1">
            {template.sections.map(section => (
              <li key={section.id} className="text-sm">
                {section.title}
                {section.required && <span className="text-red-500 ml-1">*</span>}
              </li>
            ))}
          </ul>
        </div>
      </Card>
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Output Format</h2>
        <div className="flex items-center space-x-2">
          <div className="px-3 py-1 bg-primary text-primary-foreground rounded-md uppercase text-sm">
            {outputFormat}
          </div>
        </div>
      </Card>
      
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md"
        >
          Back
        </button>
        
        <button
          onClick={handleGenerateDocument}
          disabled={isGenerating}
          className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate and Download'}
        </button>
      </div>
    </div>
  )
}
