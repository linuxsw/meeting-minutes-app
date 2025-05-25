'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PlusCircle, Trash2, ArrowRight, ArrowDown, Edit, Save } from 'lucide-react'

export default function ResultPage() {
  const router = useRouter()
  const [transcript, setTranscript] = useState<any>(null)
  const [attendees, setAttendees] = useState<string[]>([])
  const [actionItems, setActionItems] = useState<string[]>([''])
  const [decisions, setDecisions] = useState<string[]>([''])
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddAttendee, setShowAddAttendee] = useState(false)
  const [newAttendeeName, setNewAttendeeName] = useState('')
  const [editingAttendeeIndex, setEditingAttendeeIndex] = useState<number | null>(null)
  const [editingAttendeeName, setEditingAttendeeName] = useState('')
  
  useEffect(() => {
    // Try to load processed transcript from session storage
    const savedTranscript = sessionStorage.getItem('processedTranscript') || sessionStorage.getItem('testTranscript')
    const savedAttendees = sessionStorage.getItem('attendees')
    
    if (savedTranscript) {
      try {
        console.log('Loading transcript from session storage');
        const parsedTranscript = JSON.parse(savedTranscript)
        setTranscript(parsedTranscript)
        
        // Set attendees from session storage or from transcript speakers
        if (savedAttendees) {
          console.log('Loading attendees from session storage');
          const parsedAttendees = JSON.parse(savedAttendees);
          // Filter out any empty or duplicate attendees
          const uniqueAttendees = [...new Set(parsedAttendees.filter((a: string) => a.trim()))];
          setAttendees(uniqueAttendees);
        } else if (parsedTranscript.speakers) {
          console.log('Generating attendees from transcript speakers');
          // Filter out any empty or duplicate speaker names
          const speakerNames = parsedTranscript.speakers.map((speaker: any) => speaker.name);
          const uniqueSpeakers = [...new Set(speakerNames.filter((name: string) => name.trim() && name.toLowerCase() !== 'unknown'))];
          setAttendees(uniqueSpeakers);
          
          // Store the attendees in session storage for persistence
          sessionStorage.setItem('attendees', JSON.stringify(uniqueSpeakers));
        }
        
        // Generate a simple summary
        const summaryText = generateSummary(parsedTranscript)
        setSummary(summaryText)
        
        setLoading(false)
      } catch (err) {
        console.error('Error loading processed transcript:', err)
        setError('Failed to load processed transcript. Please try again.')
        setLoading(false)
      }
    } else {
      setError('No processed transcript found. Please process a transcript first.')
      setLoading(false)
    }
  }, [])
  
  const generateSummary = (transcript: any): string => {
    // Simple summary generation
    const speakerCount = transcript.speakers.length
    const segmentCount = transcript.segments.length
    
    return `This meeting included ${speakerCount} participants and contained ${segmentCount} conversation segments. The transcript has been processed and is ready for review.`
  }
  
  const handleAddActionItem = () => {
    setActionItems([...actionItems, ''])
  }
  
  const handleUpdateActionItem = (index: number, value: string) => {
    const updatedItems = [...actionItems]
    updatedItems[index] = value
    setActionItems(updatedItems)
  }
  
  const handleRemoveActionItem = (index: number) => {
    const updatedItems = [...actionItems]
    updatedItems.splice(index, 1)
    setActionItems(updatedItems)
  }
  
  const handleAddDecision = () => {
    setDecisions([...decisions, ''])
  }
  
  const handleUpdateDecision = (index: number, value: string) => {
    const updatedDecisions = [...decisions]
    updatedDecisions[index] = value
    setDecisions(updatedDecisions)
  }
  
  const handleRemoveDecision = (index: number) => {
    const updatedDecisions = [...decisions]
    updatedDecisions.splice(index, 1)
    setDecisions(updatedDecisions)
  }
  
  const handleAddAttendee = () => {
    if (newAttendeeName.trim()) {
      const updatedAttendees = [...attendees, newAttendeeName.trim()];
      setAttendees(updatedAttendees);
      setNewAttendeeName('');
      setShowAddAttendee(false);
      
      // Update session storage
      sessionStorage.setItem('attendees', JSON.stringify(updatedAttendees));
    }
  }
  
  const handleStartEditAttendee = (index: number) => {
    setEditingAttendeeIndex(index);
    setEditingAttendeeName(attendees[index]);
  }
  
  const handleSaveEditAttendee = () => {
    if (editingAttendeeIndex !== null && editingAttendeeName.trim()) {
      const updatedAttendees = [...attendees];
      updatedAttendees[editingAttendeeIndex] = editingAttendeeName.trim();
      setAttendees(updatedAttendees);
      
      // Update session storage
      sessionStorage.setItem('attendees', JSON.stringify(updatedAttendees));
      
      // Reset editing state
      setEditingAttendeeIndex(null);
      setEditingAttendeeName('');
    }
  }
  
  const handleCancelEditAttendee = () => {
    setEditingAttendeeIndex(null);
    setEditingAttendeeName('');
  }
  
  const handleRemoveAttendee = (index: number) => {
    const updatedAttendees = [...attendees];
    updatedAttendees.splice(index, 1);
    setAttendees(updatedAttendees);
    
    // Update session storage
    sessionStorage.setItem('attendees', JSON.stringify(updatedAttendees));
  }
  
  const handleGenerateMinutes = () => {
    // Prepare meeting minutes data
    const meetingMinutes = {
      title: transcript?.metadata?.title || 'Meeting Minutes',
      date: transcript?.metadata?.date || new Date().toISOString().split('T')[0],
      attendees,
      summary,
      actionItems: actionItems.filter(item => item.trim()),
      decisions: decisions.filter(decision => decision.trim()),
      transcript
    }
    
    // Save to session storage
    sessionStorage.setItem('meetingMinutes', JSON.stringify(meetingMinutes))
    
    // Navigate to minutes page
    router.push('/minutes')
  }
  
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Generating Meeting Minutes</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Button onClick={() => router.push('/')}>Go Back</Button>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Meeting Minutes</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label htmlFor="meetingTitle">Meeting Title</Label>
          <Input
            id="meetingTitle"
            value={transcript?.metadata?.title || ''}
            readOnly
            className="mb-2"
          />
        </div>
        <div>
          <Label htmlFor="meetingDate">Meeting Date</Label>
          <Input
            id="meetingDate"
            value={transcript?.metadata?.date || ''}
            readOnly
            className="mb-2"
          />
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Attendees</h2>
          <Button
            onClick={() => setShowAddAttendee(true)}
            variant="outline"
            size="sm"
            className="flex items-center text-primary"
          >
            <PlusCircle className="w-4 h-4 mr-1" />
            Add Participant
          </Button>
        </div>
        
        {showAddAttendee && (
          <div className="flex items-center space-x-2 mb-2 p-3 border rounded-md bg-gray-50">
            <Input
              value={newAttendeeName}
              onChange={(e) => setNewAttendeeName(e.target.value)}
              placeholder="Enter attendee name"
              className="flex-1"
              autoFocus
            />
            <Button onClick={handleAddAttendee} size="sm" className="bg-green-600 hover:bg-green-700">
              Add
            </Button>
            <Button onClick={() => setShowAddAttendee(false)} variant="outline" size="sm">
              Cancel
            </Button>
          </div>
        )}
        
        {attendees.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
            {attendees.map((attendee, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded-md bg-white">
                {editingAttendeeIndex === index ? (
                  <div className="flex items-center w-full space-x-1">
                    <Input
                      value={editingAttendeeName}
                      onChange={(e) => setEditingAttendeeName(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button 
                      onClick={handleSaveEditAttendee} 
                      size="icon" 
                      variant="ghost"
                      className="text-green-600 hover:text-green-800 hover:bg-green-50"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={handleCancelEditAttendee} 
                      size="icon" 
                      variant="ghost"
                      className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium text-gray-800">{attendee}</span>
                    <div className="flex items-center space-x-1">
                      <Button
                        onClick={() => handleStartEditAttendee(index)}
                        size="icon"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleRemoveAttendee(index)}
                        size="icon"
                        variant="ghost"
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 border rounded-md text-gray-500 mb-4 bg-gray-50">
            No attendees added yet. Add participants using the button above.
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <Label htmlFor="summary" className="text-xl font-semibold block mb-2">
          Summary
        </Label>
        <Textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="min-h-32"
        />
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Action Items</h2>
          <Button
            onClick={handleAddActionItem}
            variant="outline"
            size="sm"
            className="flex items-center text-primary"
          >
            <PlusCircle className="w-4 h-4 mr-1" />
            Add Action Item
          </Button>
        </div>
        
        {actionItems.length > 0 ? (
          actionItems.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <Input
                value={item}
                onChange={(e) => handleUpdateActionItem(index, e.target.value)}
                placeholder={`Action item ${index + 1}`}
                className="flex-1"
              />
              <Button
                onClick={() => handleRemoveActionItem(index)}
                variant="outline"
                size="icon"
                className="text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center p-4 border rounded-md text-gray-500 mb-4 bg-gray-50">
            No action items added yet. Add action items using the button above.
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Decisions</h2>
          <Button
            onClick={handleAddDecision}
            variant="outline"
            size="sm"
            className="flex items-center text-primary"
          >
            <PlusCircle className="w-4 h-4 mr-1" />
            Add Decision
          </Button>
        </div>
        
        {decisions.length > 0 ? (
          decisions.map((decision, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <Input
                value={decision}
                onChange={(e) => handleUpdateDecision(index, e.target.value)}
                placeholder={`Decision ${index + 1}`}
                className="flex-1"
              />
              <Button
                onClick={() => handleRemoveDecision(index)}
                variant="outline"
                size="icon"
                className="text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center p-4 border rounded-md text-gray-500 mb-4 bg-gray-50">
            No decisions added yet. Add decisions using the button above.
          </div>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleGenerateMinutes} className="flex items-center">
          Generate Minutes
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
