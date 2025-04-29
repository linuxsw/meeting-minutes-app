'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// API route handler for file uploads
export async function uploadFile(file: File, type: 'video' | 'transcript') {
  if (!file) return null
  
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error uploading file:', error)
    return null
  }
}

// API route handler for processing files
export async function processFiles(
  videoFileId: string | null, 
  transcriptFileId: string | null, 
  templateId: string,
  outputFormat: string
) {
  try {
    const response = await fetch('/api/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoFileId,
        transcriptFileId,
        templateId,
        outputFormat,
      }),
    })
    
    if (!response.ok) {
      throw new Error(`Processing failed: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error processing files:', error)
    return null
  }
}

// Hook for handling file uploads
export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<{
    video: { id: string; name: string } | null;
    transcript: { id: string; name: string } | null;
  }>({
    video: null,
    transcript: null,
  })
  
  const handleUpload = async (file: File, type: 'video' | 'transcript') => {
    if (!file) return
    
    setIsUploading(true)
    setUploadProgress(0)
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.random() * 10
        return newProgress > 90 ? 90 : newProgress
      })
    }, 300)
    
    try {
      const result = await uploadFile(file, type)
      
      if (result) {
        setUploadedFiles(prev => ({
          ...prev,
          [type]: { id: result.fileId, name: file.name }
        }))
        setUploadProgress(100)
      }
    } catch (error) {
      console.error(`Error uploading ${type} file:`, error)
    } finally {
      clearInterval(progressInterval)
      setIsUploading(false)
    }
  }
  
  return {
    isUploading,
    uploadProgress,
    uploadedFiles,
    handleUpload,
  }
}

// Hook for handling file processing
export function useFileProcessing() {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  
  const processFiles = async (
    videoFileId: string | null, 
    transcriptFileId: string | null, 
    templateId: string,
    outputFormat: string
  ) => {
    if (!templateId || (!videoFileId && !transcriptFileId)) {
      return null
    }
    
    setIsProcessing(true)
    setProcessingProgress(0)
    
    // Simulate processing progress
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        const newProgress = prev + Math.random() * 5
        return newProgress > 95 ? 95 : newProgress
      })
    }, 500)
    
    try {
      // This would be a real API call in production
      // For now, we'll simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const result = {
        documentId: `doc-${Date.now()}`,
        templateId,
        outputFormat,
      }
      
      setProcessingProgress(100)
      
      // Navigate to the result page
      router.push(`/result/${result.documentId}`)
      
      return result
    } catch (error) {
      console.error('Error processing files:', error)
      return null
    } finally {
      clearInterval(progressInterval)
      setIsProcessing(false)
    }
  }
  
  return {
    isProcessing,
    processingProgress,
    processFiles,
  }
}
