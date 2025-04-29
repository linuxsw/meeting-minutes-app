'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProcessedTranscript } from '@/lib/transcript-processor'

// This component handles the connection between processing page and result page
export default function ResultPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Check if we have processed transcript data in sessionStorage
    const processedTranscriptJson = sessionStorage.getItem('processedTranscript')
    
    if (!processedTranscriptJson) {
      // If no processed data, redirect to home
      router.push('/')
      return
    }
    
    // Parse the processed transcript
    const transcript = JSON.parse(processedTranscriptJson) as ProcessedTranscript
    const templateId = sessionStorage.getItem('testTemplateId') || 'regular'
    const outputFormat = sessionStorage.getItem('testOutputFormat') || 'pdf'
    
    // In a real application, we would render the actual result component with the data
    // For now, we'll just use the data directly in this component
    
  }, [router])
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Generate Meeting Minutes</h1>
      
      <div className="border rounded-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Meeting Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Meeting Title</label>
            <input
              type="text"
              defaultValue="Weekly Team Meeting"
              className="w-full p-2 border rounded-md bg-background"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-1">Date</label>
            <input
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border rounded-md bg-background"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Start Time</label>
              <input
                type="time"
                defaultValue="09:00"
                className="w-full p-2 border rounded-md bg-background"
              />
            </div>
            
            <div>
              <label className="block text-sm mb-1">End Time</label>
              <input
                type="time"
                defaultValue="10:00"
                className="w-full p-2 border rounded-md bg-background"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm mb-1">Location</label>
            <input
              type="text"
              defaultValue="Virtual Meeting (Microsoft Teams)"
              className="w-full p-2 border rounded-md bg-background"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-1">Attendees</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  defaultValue="John Smith"
                  className="flex-1 p-2 border rounded-md bg-background"
                  readOnly
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  defaultValue="Jane Doe"
                  className="flex-1 p-2 border rounded-md bg-background"
                  readOnly
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  defaultValue="Bob Johnson"
                  className="flex-1 p-2 border rounded-md bg-background"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md"
        >
          Back
        </button>
        
        <button
          onClick={() => alert('Document generated! In a real application, this would download the document.')}
          className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
        >
          Generate and Download
        </button>
      </div>
    </div>
  )
}
