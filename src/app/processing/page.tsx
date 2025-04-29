'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProcessedTranscript, Speaker } from '@/lib/transcript-processor'

interface SpeakerEditorProps {
  speakers: Speaker[]
  onUpdateSpeaker: (speakerId: string, name: string) => void
  onMergeSpeakers: (sourceId: string, targetId: string) => void
}

function SpeakerEditor({ speakers, onUpdateSpeaker, onMergeSpeakers }: SpeakerEditorProps) {
  const [editingSpeakerId, setEditingSpeakerId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [mergeSource, setMergeSource] = useState<string | null>(null)
  const [mergeTarget, setMergeTarget] = useState<string | null>(null)
  
  const handleEditClick = (speakerId: string, currentName: string) => {
    setEditingSpeakerId(speakerId)
    setNewName(currentName)
  }
  
  const handleSaveClick = () => {
    if (editingSpeakerId && newName.trim()) {
      onUpdateSpeaker(editingSpeakerId, newName.trim())
      setEditingSpeakerId(null)
      setNewName('')
    }
  }
  
  const handleMergeClick = () => {
    if (mergeSource && mergeTarget && mergeSource !== mergeTarget) {
      onMergeSpeakers(mergeSource, mergeTarget)
      setMergeSource(null)
      setMergeTarget(null)
    }
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Edit Speakers</h3>
      
      <div className="space-y-2">
        {speakers.map(speaker => (
          <div key={speaker.id} className="flex items-center justify-between p-2 border rounded-md">
            {editingSpeakerId === speaker.id ? (
              <div className="flex items-center space-x-2 w-full">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1 px-2 py-1 border rounded-md"
                />
                <button
                  onClick={handleSaveClick}
                  className="px-2 py-1 text-sm bg-primary text-primary-foreground rounded-md"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingSpeakerId(null)}
                  className="px-2 py-1 text-sm bg-muted text-muted-foreground rounded-md"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <span>{speaker.name}</span>
                <button
                  onClick={() => handleEditClick(speaker.id, speaker.name)}
                  className="px-2 py-1 text-sm bg-muted hover:bg-muted/80 rounded-md"
                >
                  Edit
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      
      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium mb-2">Merge Speakers</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Source Speaker (will be removed)</label>
            <select
              value={mergeSource || ''}
              onChange={(e) => setMergeSource(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="">Select source speaker</option>
              {speakers.map(speaker => (
                <option key={`source-${speaker.id}`} value={speaker.id}>
                  {speaker.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm mb-1">Target Speaker (will remain)</label>
            <select
              value={mergeTarget || ''}
              onChange={(e) => setMergeTarget(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
              disabled={!mergeSource}
            >
              <option value="">Select target speaker</option>
              {speakers
                .filter(speaker => speaker.id !== mergeSource)
                .map(speaker => (
                  <option key={`target-${speaker.id}`} value={speaker.id}>
                    {speaker.name}
                  </option>
                ))}
            </select>
          </div>
          
          <button
            onClick={handleMergeClick}
            disabled={!mergeSource || !mergeTarget}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
          >
            Merge Speakers
          </button>
        </div>
      </div>
    </div>
  )
}

interface TranscriptPreviewProps {
  transcript: ProcessedTranscript
}

function TranscriptPreview({ transcript }: TranscriptPreviewProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Transcript Preview</h3>
      
      <div className="border rounded-md p-4 max-h-96 overflow-y-auto">
        {transcript.segments.map(segment => {
          const speaker = transcript.speakers.find(s => s.id === segment.speakerId)
          return (
            <div key={segment.id} className="mb-4">
              <div className="font-medium">{speaker?.name || 'Unknown'}</div>
              <div className="text-sm text-muted-foreground">
                {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
              </div>
              <div className="mt-1">{segment.text}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Helper function to format time in MM:SS format
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default function ProcessingPage() {
  const [transcript, setTranscript] = useState<ProcessedTranscript | null>(null)
  const [templateId, setTemplateId] = useState<string>('training')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  
  useEffect(() => {
    // Get transcript data from sessionStorage
    try {
      const transcriptJson = sessionStorage.getItem('testTranscript')
      const template = sessionStorage.getItem('testTemplateId')
      
      if (!transcriptJson) {
        setError('No transcript data found. Please upload a file first.')
        setIsLoading(false)
        return
      }
      
      const parsedTranscript = JSON.parse(transcriptJson) as ProcessedTranscript
      setTranscript(parsedTranscript)
      
      if (template) {
        setTemplateId(template)
      }
    } catch (err) {
      console.error('Error loading transcript data:', err)
      setError('Failed to load transcript data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [router])
  
  const handleUpdateSpeaker = (speakerId: string, name: string) => {
    if (!transcript) return
    
    setTranscript(prev => {
      if (!prev) return prev
      return {
        ...prev,
        speakers: prev.speakers.map(speaker => 
          speaker.id === speakerId ? { ...speaker, name } : speaker
        )
      }
    })
  }
  
  const handleMergeSpeakers = (sourceId: string, targetId: string) => {
    if (!transcript) return
    
    const updatedSpeakers = transcript.speakers.filter(speaker => speaker.id !== sourceId)
    
    const updatedSegments = transcript.segments.map(segment => {
      if (segment.speakerId === sourceId) {
        return { ...segment, speakerId: targetId }
      }
      return segment
    })
    
    setTranscript({
      ...transcript,
      speakers: updatedSpeakers,
      segments: updatedSegments,
    })
  }
  
  const handleContinue = () => {
    if (!transcript) return
    
    // Store the processed transcript for the next page
    sessionStorage.setItem('processedTranscript', JSON.stringify(transcript))
    
    // Navigate to the result page
    router.push('/result')
  }
  
  if (isLoading) {
    return (
      <div className="container py-10 text-center">
        <h1 className="text-3xl font-bold mb-6">Processing Transcript</h1>
        <div className="p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading transcript data...</p>
        </div>
      </div>
    )
  }
  
  if (error || !transcript) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Error</h1>
        <Card className="p-6">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              {error || 'Failed to load transcript data'}
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
            >
              Return to Home
            </button>
          </div>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Process Transcript</h1>
      
      <Tabs defaultValue="speakers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="speakers">Edit Speakers</TabsTrigger>
          <TabsTrigger value="preview">Transcript Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="speakers" className="p-4 border rounded-md mt-4">
          <SpeakerEditor 
            speakers={transcript.speakers} 
            onUpdateSpeaker={handleUpdateSpeaker}
            onMergeSpeakers={handleMergeSpeakers}
          />
        </TabsContent>
        
        <TabsContent value="preview" className="p-4 border rounded-md mt-4">
          <TranscriptPreview transcript={transcript} />
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 flex justify-end">
        <button 
          className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
          onClick={handleContinue}
        >
          Continue to Generate Minutes
        </button>
      </div>
    </div>
  )
}
