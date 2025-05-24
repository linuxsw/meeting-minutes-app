'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface FileUploaderProps {
  accept: string
  onFileUpload: (file: File | null) => void
  label: string
  initialFile?: File | null
}

export function FileUploader({ accept, onFileUpload, label, initialFile = null }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(initialFile)
  
  // If initialFile changes, update the state
  React.useEffect(() => {
    if (initialFile) {
      setFile(initialFile);
    }
  }, [initialFile]);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0]
      console.log('File selected:', selectedFile.name, selectedFile.type);
      setFile(selectedFile)
      onFileUpload(selectedFile)
    }
  }, [onFileUpload])
  
  // Convert accept string to object format required by react-dropzone v14+
  // Use proper MIME types for transcript files
  const acceptObject: Record<string, string[]> = {}
  
  if (accept.includes('.vtt')) {
    acceptObject['text/vtt'] = ['.vtt']
    // Add additional MIME types that browsers might use for VTT files
    acceptObject['text/plain'] = ['.vtt']
  }
  
  if (accept.includes('.srt')) {
    acceptObject['application/x-subrip'] = ['.srt']
    acceptObject['text/plain'] = ['.srt']
  }
  
  if (accept.includes('.txt')) {
    acceptObject['text/plain'] = ['.txt']
  }
  
  if (accept.includes('.mp4')) {
    acceptObject['video/mp4'] = ['.mp4']
  }
  
  // If no specific types were added, fall back to the original approach
  if (Object.keys(acceptObject).length === 0) {
    accept.split(',').forEach(type => {
      acceptObject[type.trim()] = []
    })
  }
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptObject,
    maxFiles: 1,
    // Make sure we accept any file if there's an issue with MIME types
    noClick: false,
    noKeyboard: false,
    preventDropOnDocument: true,
  })
  
  const removeFile = () => {
    setFile(null)
    onFileUpload(null)
  }
  
  return (
    <div className="w-full">
      {!file ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/20 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      ) : (
        <div className="border rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
