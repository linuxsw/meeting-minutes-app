'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { processVTTFile } from '@/app/test-transcript/page'
import { ProcessedTranscript } from '@/lib/transcript-processor'

export default function TestPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleTestWithSample = () => {
    try {
      // Use the sample transcript data
      const sampleTranscriptJson = JSON.stringify(require('@/lib/test-data').sampleTranscript)
      sessionStorage.setItem('testTranscript', sampleTranscriptJson)
      sessionStorage.setItem('testTemplateId', 'training')
      sessionStorage.setItem('testOutputFormat', 'pdf')
      
      router.push('/processing')
    } catch (err) {
      console.error('Error setting up test data:', err)
      setError('Failed to set up test data. Please try again.')
    }
  }

  const handleProcessFile = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Process the file based on its type
      if (file.name.endsWith('.vtt')) {
        const transcript = await processVTTFile(file)
        sessionStorage.setItem('testTranscript', JSON.stringify(transcript))
        sessionStorage.setItem('testTemplateId', 'training')
        sessionStorage.setItem('testOutputFormat', 'pdf')
        
        router.push('/processing')
      } else {
        setError('Unsupported file type. Please upload a VTT file.')
      }
    } catch (err) {
      console.error('Error processing file:', err)
      setError('Failed to process the file. Please try again with a valid VTT file.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Test Transcript Processing</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload Test File</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select VTT File</label>
            <input
              type="file"
              accept=".vtt"
              onChange={handleFileChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          {file && (
            <div className="p-4 bg-muted rounded-md">
              <p className="font-medium">Selected File:</p>
              <p>{file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-100 text-red-800 rounded-md">
              {error}
            </div>
          )}
          
          <div className="flex space-x-4">
            <button
              onClick={handleProcessFile}
              disabled={!file || isLoading}
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Process File'}
            </button>
            
            <button
              onClick={handleTestWithSample}
              className="px-4 py-2 border border-primary text-primary hover:bg-primary/10 rounded-md"
            >
              Test with Sample Data
            </button>
          </div>
        </div>
      </Card>
      
      <div className="text-center">
        <a href="/" className="text-primary hover:underline">
          Return to Home
        </a>
      </div>
    </div>
  )
}
