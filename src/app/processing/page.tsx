'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Speaker, TranscriptSegment } from '@/lib/transcript-processor'
import { ArrowRight, Loader2 } from 'lucide-react'

export default function ProcessingPage() {
  const router = useRouter()
  const [transcript, setTranscript] = useState<string>('')
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([])
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('speakers')

  useEffect(() => {
    // Get transcript from session storage
    const storedTranscript = sessionStorage.getItem('transcript')
    if (!storedTranscript) {
      setError('No transcript found. Please upload a transcript file first.')
      setLoading(false)
      return
    }

    try {
      // Parse the transcript
      const parsedTranscript = JSON.parse(storedTranscript)
      setTranscript(parsedTranscript.text || '')
      
      // Parse segments and ensure they're sorted chronologically
      const segments = parsedTranscript.segments || []
      const sortedSegments = [...segments].sort((a, b) => a.start - b.start)
      setTranscriptSegments(sortedSegments)
      
      console.log(`Loaded ${sortedSegments.length} transcript segments`)
      
      // Extract unique speakers
      const uniqueSpeakers = Array.from(
        new Set(segments.map((segment: TranscriptSegment) => segment.speaker))
      ).map((speaker) => ({
        id: speaker,
        name: speaker,
      }))
      
      setSpeakers(uniqueSpeakers)
      setLoading(false)
    } catch (err) {
      console.error('Error parsing transcript:', err)
      setError('Error parsing transcript. Please try again.')
      setLoading(false)
    }
  }, [])

  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    
    const { source, destination } = result
    
    // Skip if dropped in the same place
    if (source.droppableId === destination.droppableId && 
        source.index === destination.index) {
      return
    }
    
    // Get the speaker being dragged
    const draggedSpeaker = speakers[source.index]
    
    // If dropped on another speaker, merge them
    if (source.droppableId === 'speakers' && 
        destination.droppableId === 'speakers') {
      
      const targetSpeaker = speakers[destination.index]
      
      // Update transcript segments to use the target speaker name
      const updatedSegments = transcriptSegments.map(segment => {
        if (segment.speaker === draggedSpeaker.name) {
          return { ...segment, speaker: targetSpeaker.name }
        }
        return segment
      })
      
      // Remove the dragged speaker from the list
      const updatedSpeakers = speakers.filter((_, index) => index !== source.index)
      
      // Update state
      setTranscriptSegments(updatedSegments)
      setSpeakers(updatedSpeakers)
      
      // Update session storage
      const updatedTranscript = {
        text: transcript,
        segments: updatedSegments
      }
      sessionStorage.setItem('transcript', JSON.stringify(updatedTranscript))
      sessionStorage.setItem('speakers', JSON.stringify(updatedSpeakers))
    }
  }

  const handleContinue = () => {
    // Save speakers to session storage
    sessionStorage.setItem('speakers', JSON.stringify(speakers))
    
    // Navigate to result page
    router.push('/result')
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Processing transcript...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="text-xl font-semibold text-red-500">{error}</div>
        <Button 
          className="mt-4" 
          onClick={() => router.push('/')}
        >
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Process Transcript</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="speakers">Speakers</TabsTrigger>
          <TabsTrigger value="preview">Transcript Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="speakers">
          <div className="mb-4 rounded-lg border p-4">
            <h2 className="mb-2 text-xl font-semibold">Merge Speakers</h2>
            <p className="mb-4 text-gray-700">
              Drag and drop speakers to merge them. For example, if "John" and "John Doe" 
              are the same person, drag one onto the other to combine them.
            </p>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="speakers">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {speakers.map((speaker, index) => (
                      <Draggable
                        key={speaker.id}
                        draggableId={speaker.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`rounded-lg border bg-white p-3 shadow-sm ${
                              snapshot.isDragging ? 'opacity-70' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-gray-900 font-medium">{speaker.name}</div>
                              <div className="text-sm text-gray-500">
                                {transcriptSegments.filter(s => s.speaker === speaker.name).length} segments
                              </div>
                            </div>
                            
                            <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                              {transcriptSegments
                                .filter(s => s.speaker === speaker.name)
                                .slice(0, 1)
                                .map((segment, i) => (
                                  <div key={i} className="line-clamp-1">
                                    "{segment.text}"
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </TabsContent>
        
        <TabsContent value="preview">
          <div className="mb-4 rounded-lg border p-4">
            <h2 className="mb-2 text-xl font-semibold">Transcript Preview</h2>
            <p className="mb-4 text-gray-700">
              Review the transcript before generating meeting minutes.
            </p>
            
            <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-3">
              {transcriptSegments.map((segment, index) => (
                <div key={index || `segment-${index}`} className="border-b pb-2">
                  <div className="font-medium text-gray-900">{segment.speaker}:</div>
                  <div className="text-gray-900">{segment.text}</div>
                </div>
              ))}
              {transcriptSegments.length === 0 && (
                <div className="text-gray-500 italic">No transcript content available</div>
              )}
              <div className="text-sm text-gray-500 mt-2">
                Total segments: {transcriptSegments.length}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 flex justify-end">
        <Button onClick={handleContinue}>
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
