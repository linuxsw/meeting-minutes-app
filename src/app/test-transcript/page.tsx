'use client'

import { useState, useEffect } from 'react'
import { parseVTT } from '@/lib/transcript-processor'
import { ProcessedTranscript } from '@/lib/transcript-processor'

// Function to process the user-provided VTT file
export async function processVTTFile(file: File): Promise<ProcessedTranscript> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const transcript = parseVTT(content)
        resolve(transcript)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsText(file)
  })
}

export default function TestWithTranscriptPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState<ProcessedTranscript | null>(null)
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null
    setFile(selectedFile)
  }
  
  const handleProcessFile = async () => {
    if (!file) return
    
    setIsProcessing(true)
    
    try {
      const processedTranscript = await processVTTFile(file)
      setTranscript(processedTranscript)
      
      // Store the processed transcript for the next page
      sessionStorage.setItem('testTranscript', JSON.stringify(processedTranscript))
      sessionStorage.setItem('testTemplateId', 'training') // Default to training template
      sessionStorage.setItem('testOutputFormat', 'pdf')
      
      // Navigate to the processing page
      window.location.href = '/processing'
    } catch (error) {
      console.error('Error processing file:', error)
      alert('Failed to process the transcript file. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Test with User Transcript</h1>
      
      <div className="border rounded-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload VTT Transcript</h2>
        
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
          
          <button
            onClick={handleProcessFile}
            disabled={!file || isProcessing}
            className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Process Transcript'}
          </button>
        </div>
      </div>
      
      <div className="text-center mt-4">
        <a href="/" className="text-primary hover:underline">
          Return to Home
        </a>
      </div>
    </div>
  )
}
