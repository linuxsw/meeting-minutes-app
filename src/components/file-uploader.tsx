'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'next-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FileUploaderProps {
  accept: string
  onFileUpload: (file: File | null, audioLanguage?: string) => void
  label: string
}

// Supported languages for audio processing
const audioLanguages = [
  { code: 'auto', name: 'Auto-detect' },
  { code: 'en', name: 'English' },
  { code: 'ko', name: 'Korean (한국어)' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'zh', name: 'Chinese (中文)' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'de', name: 'German (Deutsch)' },
]

export function FileUploader({ accept, onFileUpload, label }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [audioLanguage, setAudioLanguage] = useState<string>('auto')
  const { t } = useTranslation('common')
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0]
      setFile(selectedFile)
      onFileUpload(selectedFile, audioLanguage)
    }
  }, [onFileUpload, audioLanguage])
  
  // Convert accept string to object format required by react-dropzone v14+
  const acceptObject: Record<string, string[]> = {}
  accept.split(',').forEach(type => {
    acceptObject[type.trim()] = []
  })
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptObject,
    maxFiles: 1
  })
  
  const removeFile = () => {
    setFile(null)
    onFileUpload(null)
  }

  const handleLanguageChange = (value: string) => {
    setAudioLanguage(value)
    if (file) {
      onFileUpload(file, value)
    }
  }
  
  // Check if the file is audio or video
  const isAudioOrVideo = file && 
    (file.type.startsWith('audio/') || file.type.startsWith('video/'));
  
  return (
    <div className="w-full space-y-4">
      {!file ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/20 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-sm text-muted-foreground">{t(label)}</p>
          <p className="text-xs text-muted-foreground mt-2">{t('upload.formats')}</p>
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
              onClick={removeFile}
              className="text-sm text-red-500 hover:text-red-700"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Audio language selection - only show for audio/video files */}
      {(isAudioOrVideo || !file) && (
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('upload.audioLanguage')}</label>
          <Select value={audioLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('upload.selectLanguage')} />
            </SelectTrigger>
            <SelectContent>
              {audioLanguages.map((language) => (
                <SelectItem key={language.code} value={language.code}>
                  {language.code === 'auto' ? t('upload.autoDetect') : language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {audioLanguage === 'auto' && (
            <p className="text-xs text-muted-foreground">
              {t('upload.autoDetectHint', 'The system will attempt to automatically detect the spoken language.')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
