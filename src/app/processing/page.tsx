'use client'

import { useState, useEffect } from 'react'
import { parseTranscript, ProcessedTranscript } from '@/lib/transcript-processor'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { PlusCircle, Trash2, ArrowRight, ArrowDown } from 'lucide-react'

interface SpeakerWithSegments {
  id: string
  name: string
  segments: {
    id: string
    text: string
    startTime: number
    endTime: number
  }[]
}

export default function ProcessingPage() {
  const router = useRouter()
  const [transcript, setTranscript] = useState<ProcessedTranscript | null>(null)
  const [speakersWithSegments, setSpeakersWithSegments] = useState<SpeakerWithSegments[]>([])
  const [meetingTitle, setMeetingTitle] = useState('')
  const [meetingDate, setMeetingDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    // Try to load transcript from session storage
    const savedTranscript = sessionStorage.getItem('uploadedTranscript')
    const savedFileName = sessionStorage.getItem('uploadedFileName')
    
    if (savedTranscript) {
      try {
        setLoading(true)
        
        // Parse the transcript
        parseTranscript(savedTranscript, savedFileName || undefined)
          .then((result) => {
            setTranscript(result)
            
            // Set meeting metadata if available
            if (result.metadata) {
              setMeetingTitle(result.metadata.title || '')
              setMeetingDate(result.metadata.date || '')
            } else {
              // Default to today's date
              setMeetingDate(new Date().toISOString().split('T')[0])
            }
            
            // Group segments by speaker
            const speakersMap = new Map<string, SpeakerWithSegments>()
            
            result.speakers.forEach((speaker) => {
              speakersMap.set(speaker.id, {
                id: speaker.id,
                name: speaker.name,
                segments: []
              })
            })
            
            result.segments.forEach((segment) => {
              const speaker = speakersMap.get(segment.speakerId)
              if (speaker) {
                speaker.segments.push({
                  id: segment.id,
                  text: segment.text,
                  startTime: segment.startTime,
                  endTime: segment.endTime
                })
              }
            })
            
            // Sort segments by start time for each speaker
            speakersMap.forEach((speaker) => {
              speaker.segments.sort((a, b) => a.startTime - b.startTime)
            })
            
            setSpeakersWithSegments(Array.from(speakersMap.values()))
            setLoading(false)
          })
          .catch((err) => {
            console.error('Error parsing transcript:', err)
            setError('Failed to parse transcript. Please try again.')
            setLoading(false)
          })
      } catch (err) {
        console.error('Error loading transcript:', err)
        setError('Failed to load transcript. Please try again.')
        setLoading(false)
      }
    } else {
      setError('No transcript found. Please upload a transcript file first.')
      setLoading(false)
    }
  }, [])
  
  const handleSpeakerNameChange = (speakerId: string, newName: string) => {
    if (!transcript) return
    
    // Update speaker name in transcript
    const updatedSpeakers = transcript.speakers.map((speaker) => {
      if (speaker.id === speakerId) {
        return { ...speaker, name: newName }
      }
      return speaker
    })
    
    setTranscript({
      ...transcript,
      speakers: updatedSpeakers
    })
    
    // Update speaker name in speakersWithSegments
    const updatedSpeakersWithSegments = speakersWithSegments.map((speaker) => {
      if (speaker.id === speakerId) {
        return { ...speaker, name: newName }
      }
      return speaker
    })
    
    setSpeakersWithSegments(updatedSpeakersWithSegments)
  }
  
  const handleMergeSpeakers = (sourceId: string, targetId: string) => {
    if (!transcript) return
    
    // Get source and target speakers
    const sourceSpeaker = transcript.speakers.find((s) => s.id === sourceId)
    const targetSpeaker = transcript.speakers.find((s) => s.id === targetId)
    
    if (!sourceSpeaker || !targetSpeaker) return
    
    // Update segments to use target speaker ID
    const updatedSegments = transcript.segments.map((segment) => {
      if (segment.speakerId === sourceId) {
        return { ...segment, speakerId: targetId }
      }
      return segment
    })
    
    // Remove source speaker from speakers list
    const updatedSpeakers = transcript.speakers.filter((speaker) => speaker.id !== sourceId)
    
    // Update transcript
    const updatedTranscript = {
      ...transcript,
      speakers: updatedSpeakers,
      segments: updatedSegments
    }
    
    setTranscript(updatedTranscript)
    
    // Store the updated transcript to preserve merged speakers
    sessionStorage.setItem('processedTranscript', JSON.stringify(updatedTranscript))
    
    // Update speakersWithSegments
    const sourceSpeakerWithSegments = speakersWithSegments.find((s) => s.id === sourceId)
    const targetSpeakerWithSegments = speakersWithSegments.find((s) => s.id === targetId)
    
    if (!sourceSpeakerWithSegments || !targetSpeakerWithSegments) return
    
    // Merge segments from source to target
    const mergedSegments = [
      ...targetSpeakerWithSegments.segments,
      ...sourceSpeakerWithSegments.segments
    ].sort((a, b) => a.startTime - b.startTime)
    
    const updatedSpeakersWithSegments = speakersWithSegments
      .filter((speaker) => speaker.id !== sourceId)
      .map((speaker) => {
        if (speaker.id === targetId) {
          return { ...speaker, segments: mergedSegments }
        }
        return speaker
      })
    
    setSpeakersWithSegments(updatedSpeakersWithSegments)
  }
  
  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    
    const { source, destination } = result
    
    // If dropped on the same speaker, do nothing
    if (source.droppableId === destination.droppableId) return
    
    // Get source and target speaker IDs
    const sourceId = source.droppableId
    const targetId = destination.droppableId
    
    // Merge speakers
    handleMergeSpeakers(sourceId, targetId)
  }
  
  const handleContinue = () => {
    if (!transcript) return
    
    // Save processed transcript and metadata to session storage
    const processedTranscript = {
      ...transcript,
      metadata: {
        title: meetingTitle,
        date: meetingDate
      }
    }
    
    sessionStorage.setItem('processedTranscript', JSON.stringify(processedTranscript))
    
    // Save speakers list for attendees
    const attendees = transcript.speakers.map((speaker) => speaker.name)
    sessionStorage.setItem('attendees', JSON.stringify(attendees))
    
    // Navigate to result page
    router.push('/result')
  }
  
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Processing Transcript</h1>
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
      <h1 className="text-2xl font-bold mb-4">Process Transcript</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label htmlFor="meetingTitle">Meeting Title</Label>
          <Input
            id="meetingTitle"
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
            placeholder="Enter meeting title"
            className="mb-2"
          />
        </div>
        <div>
          <Label htmlFor="meetingDate">Meeting Date</Label>
          <Input
            id="meetingDate"
            type="date"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
            className="mb-2"
          />
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Transcript Preview</h2>
        <Card className="p-4 max-h-96 overflow-y-auto">
          {transcript && transcript.segments.length > 0 ? (
            transcript.segments.map((segment) => {
              const speaker = transcript.speakers.find((s) => s.id === segment.speakerId)
              return (
                <div key={segment.id} className="mb-2">
                  <span className="font-semibold">{speaker?.name || 'Unknown'}:</span>{' '}
                  {segment.text}
                </div>
              )
            })
          ) : (
            <div className="text-gray-500">No transcript content available.</div>
          )}
        </Card>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Speakers</h2>
        <p className="text-sm text-gray-500 mb-4">
          Edit speaker names or drag and drop to merge speakers.
        </p>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {speakersWithSegments.map((speaker) => (
              <Droppable key={speaker.id} droppableId={speaker.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="border rounded-md p-4 bg-white"
                  >
                    <Draggable draggableId={speaker.id} index={0}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="mb-2"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor={`speaker-${speaker.id}`}>Speaker Name</Label>
                            <div className="text-xs text-gray-500">
                              {speaker.segments.length} segments
                            </div>
                          </div>
                          <Input
                            id={`speaker-${speaker.id}`}
                            value={speaker.name}
                            onChange={(e) => handleSpeakerNameChange(speaker.id, e.target.value)}
                            className="mb-2"
                          />
                          <div className="text-xs text-gray-500 mb-2">
                            Drag to another speaker to merge
                          </div>
                          <div className="max-h-32 overflow-y-auto text-sm text-gray-700">
                            {speaker.segments.slice(0, 3).map((segment) => (
                              <div key={segment.id} className="mb-1 truncate">
                                "{segment.text}"
                              </div>
                            ))}
                            {speaker.segments.length > 3 && (
                              <div className="text-gray-500">
                                +{speaker.segments.length - 3} more segments
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleContinue} className="flex items-center">
          Continue to Generate Minutes
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
