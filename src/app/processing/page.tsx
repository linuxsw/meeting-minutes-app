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
  // Dedicated state variable for transcript segments to prevent mutation issues
  const [transcriptSegments, setTranscriptSegments] = useState<any[]>([])
  
  useEffect(() => {
    // Try to load transcript from session storage - check both keys for compatibility
    const savedTranscriptFile = sessionStorage.getItem('uploadedTranscriptFile')
    const savedTranscript = sessionStorage.getItem('testTranscript')
    const savedFileName = sessionStorage.getItem('uploadedTranscriptFileName')
    
    console.log('[TRANSCRIPT_DEBUG] Checking for transcript in session storage...');
    console.log('[TRANSCRIPT_DEBUG] uploadedTranscriptFile exists:', !!savedTranscriptFile);
    console.log('[TRANSCRIPT_DEBUG] testTranscript exists:', !!savedTranscript);
    
    if (savedTranscript) {
      try {
        setLoading(true)
        console.log('[TRANSCRIPT_DEBUG] Found parsed transcript in session storage');
        
        // If we have a parsed transcript in JSON format
        const parsedTranscript = JSON.parse(savedTranscript)
        console.log('[TRANSCRIPT_DEBUG] Parsed transcript segments count:', parsedTranscript.segments?.length || 0);
        
        if (parsedTranscript.segments && parsedTranscript.segments.length > 0) {
          console.log('[TRANSCRIPT_DEBUG] First segment:', JSON.stringify(parsedTranscript.segments[0]));
          console.log('[TRANSCRIPT_DEBUG] Last segment:', JSON.stringify(parsedTranscript.segments[parsedTranscript.segments.length - 1]));
          
          // Deep clone each segment to prevent mutation
          const clonedSegments = parsedTranscript.segments.map((segment: any) => ({...segment}));
          console.log('[TRANSCRIPT_DEBUG] Setting transcript segments to:', clonedSegments.length, 'items');
          console.log('[TRANSCRIPT_DEBUG] Cloned segments array:', JSON.stringify(clonedSegments.slice(0, 2)) + '...');
          
          setTranscriptSegments(clonedSegments);
        }
        
        setTranscript(parsedTranscript)
        
        // Set meeting metadata if available
        if (parsedTranscript.metadata) {
          setMeetingTitle(parsedTranscript.metadata.title || '')
          setMeetingDate(parsedTranscript.metadata.date || '')
        } else {
          // Default to today's date
          setMeetingDate(new Date().toISOString().split('T')[0])
        }
        
        // Group segments by speaker
        const speakersMap = new Map<string, SpeakerWithSegments>()
        
        parsedTranscript.speakers.forEach((speaker) => {
          speakersMap.set(speaker.id, {
            id: speaker.id,
            name: speaker.name,
            segments: []
          })
        })
        
        parsedTranscript.segments.forEach((segment) => {
          const speaker = speakersMap.get(segment.speakerId)
          if (speaker) {
            // Clone segment to prevent mutation
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
          // Create a new array before sorting to prevent mutation
          speaker.segments = [...speaker.segments].sort((a, b) => a.startTime - b.startTime)
        })
        
        setSpeakersWithSegments(Array.from(speakersMap.values()))
        setLoading(false)
      } catch (err) {
        console.error('[TRANSCRIPT_DEBUG] Error loading parsed transcript:', err)
        // Fall back to raw transcript file if available
        handleRawTranscriptFile(savedTranscriptFile, savedFileName)
      }
    } else if (savedTranscriptFile) {
      // If we only have the raw transcript file
      console.log('[TRANSCRIPT_DEBUG] No parsed transcript found, using raw transcript file');
      handleRawTranscriptFile(savedTranscriptFile, savedFileName)
    } else {
      console.error('[TRANSCRIPT_DEBUG] No transcript found in session storage');
      setError('No transcript found. Please upload a transcript file first.')
      setLoading(false)
    }
  }, [])
  
  const handleRawTranscriptFile = (transcriptContent: string | null, fileName: string | null) => {
    if (!transcriptContent) {
      setError('No transcript content found. Please upload a transcript file first.')
      setLoading(false)
      return
    }
    
    try {
      console.log('[TRANSCRIPT_DEBUG] Parsing raw transcript content with filename:', fileName);
      console.log('[TRANSCRIPT_DEBUG] Raw transcript content (first 200 chars):', transcriptContent.substring(0, 200));
      
      // Parse the transcript
      parseTranscript(transcriptContent, fileName || undefined)
        .then((result) => {
          console.log('[TRANSCRIPT_DEBUG] Successfully parsed transcript');
          console.log('[TRANSCRIPT_DEBUG] Parsed transcript segments count:', result.segments?.length || 0);
          
          if (result.segments && result.segments.length > 0) {
            console.log('[TRANSCRIPT_DEBUG] First segment:', JSON.stringify(result.segments[0]));
            console.log('[TRANSCRIPT_DEBUG] Last segment:', JSON.stringify(result.segments[result.segments.length - 1]));
            
            // Deep clone each segment to prevent mutation
            const clonedSegments = result.segments.map(segment => ({...segment}));
            console.log('[TRANSCRIPT_DEBUG] Setting transcript segments to:', clonedSegments.length, 'items');
            console.log('[TRANSCRIPT_DEBUG] Cloned segments array:', JSON.stringify(clonedSegments.slice(0, 2)) + '...');
            
            setTranscriptSegments(clonedSegments);
          }
          
          setTranscript(result)
          
          // Store the parsed transcript for future use
          sessionStorage.setItem('testTranscript', JSON.stringify(result))
          
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
              // Clone segment to prevent mutation
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
            // Create a new array before sorting to prevent mutation
            speaker.segments = [...speaker.segments].sort((a, b) => a.startTime - b.startTime)
          })
          
          setSpeakersWithSegments(Array.from(speakersMap.values()))
          setLoading(false)
        })
        .catch((err) => {
          console.error('[TRANSCRIPT_DEBUG] Error parsing transcript:', err)
          setError('Failed to parse transcript. Please try again.')
          setLoading(false)
        })
    } catch (err) {
      console.error('[TRANSCRIPT_DEBUG] Error loading transcript:', err)
      setError('Failed to load transcript. Please try again.')
      setLoading(false)
    }
  }
  
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
    
    console.log('[TRANSCRIPT_DEBUG] Merging speakers:', sourceId, 'into', targetId);
    
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
    
    // Update transcriptSegments state to reflect the speaker merge
    console.log('[TRANSCRIPT_DEBUG] Updating transcriptSegments for speaker merge');
    console.log('[TRANSCRIPT_DEBUG] Before merge - transcriptSegments count:', transcriptSegments.length);
    
    const updatedTranscriptSegments = transcriptSegments.map(segment => {
      if (segment.speakerId === sourceId) {
        return { ...segment, speakerId: targetId }
      }
      return segment
    });
    
    console.log('[TRANSCRIPT_DEBUG] After merge - updatedTranscriptSegments count:', updatedTranscriptSegments.length);
    
    // Update the dedicated state variable
    setTranscriptSegments(updatedTranscriptSegments);
    
    // Store the updated transcript to preserve merged speakers
    sessionStorage.setItem('processedTranscript', JSON.stringify(updatedTranscript))
    sessionStorage.setItem('testTranscript', JSON.stringify(updatedTranscript))
    
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
    sessionStorage.setItem('testTranscript', JSON.stringify(processedTranscript))
    
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
  
  // Use the separate transcriptSegments state to ensure we have all segments
  const displaySegments = transcriptSegments.length > 0 ? transcriptSegments : 
                         (transcript && transcript.segments ? transcript.segments : []);
  
  console.log('[TRANSCRIPT_DEBUG] Rendering transcript preview with', displaySegments.length, 'segments');
  console.log('[TRANSCRIPT_DEBUG] displaySegments before rendering:', 
    displaySegments.length > 0 
      ? `First: ${JSON.stringify(displaySegments[0])}, Last: ${JSON.stringify(displaySegments[displaySegments.length-1])}`
      : 'No segments');
  
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
        <Card className="p-4 h-96 overflow-y-auto border-2 border-gray-200 bg-white">
          {displaySegments && displaySegments.length > 0 ? (
            <div className="space-y-3">
              {/* Create a new array copy before sorting to prevent mutation of the original array */}
              {(() => {
                console.log('[TRANSCRIPT_DEBUG] Creating new array copy for rendering');
                const segmentsCopy = [...displaySegments];
                console.log('[TRANSCRIPT_DEBUG] Segments copy length:', segmentsCopy.length);
                
                const sortedSegments = segmentsCopy.sort((a, b) => a.startTime - b.startTime);
                console.log('[TRANSCRIPT_DEBUG] Sorted segments length:', sortedSegments.length);
                console.log('[TRANSCRIPT_DEBUG] First sorted segment:', 
                  sortedSegments.length > 0 ? JSON.stringify(sortedSegments[0]) : 'None');
                
                return sortedSegments.map((segment, index) => {
                  const speaker = transcript?.speakers.find((s) => s.id === segment.speakerId);
                  console.log('[TRANSCRIPT_DEBUG] Rendering segment', index, 'with text:', segment.text.substring(0, 30) + '...');
                  
                  return (
                    <div key={`segment-${index}`} className="pb-2 border-b border-gray-100 last:border-0">
                      <span className="font-semibold text-black">{speaker?.name || 'Unknown'}:</span>{' '}
                      <span className="text-black">{segment.text}</span>
                    </div>
                  );
                });
              })()}
            </div>
          ) : (
            <div className="text-gray-500 h-full flex items-center justify-center">
              No transcript content available.
            </div>
          )}
        </Card>
        <div className="mt-2 text-xs text-gray-500">
          {displaySegments?.length || 0} segments in transcript
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Speakers</h2>
        <p className="text-sm text-gray-700 mb-4">
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
                    className="border rounded-md p-4 bg-white shadow-sm"
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
                            <Label htmlFor={`speaker-${speaker.id}`} className="text-black font-medium">Speaker Name</Label>
                            <div className="text-xs text-gray-700">
                              {speaker.segments.length} segments
                            </div>
                          </div>
                          <Input
                            id={`speaker-${speaker.id}`}
                            value={speaker.name}
                            onChange={(e) => handleSpeakerNameChange(speaker.id, e.target.value)}
                            className="mb-2"
                          />
                          <div className="text-xs text-gray-700 mb-2">
                            Drag to another speaker to merge
                          </div>
                          <div className="max-h-32 overflow-y-auto text-sm text-gray-700 border border-gray-200 rounded p-2">
                            {speaker.segments.length > 0 ? (
                              speaker.segments.map((segment, index) => (
                                <div key={segment.id} className="mb-1 last:mb-0">
                                  &ldquo;{segment.text}&rdquo;
                                </div>
                              ))
                            ) : (
                              <div className="text-gray-500">No segments</div>
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
        <Button onClick={handleContinue} className="bg-white text-black hover:bg-gray-100 border border-gray-300">
          Continue to Generate Report
        </Button>
      </div>
    </div>
  )
}
