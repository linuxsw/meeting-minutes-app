'use client'

import { useState, useEffect } from 'react'

// Types for transcript data
export interface Speaker {
  id: string
  name: string
}

export interface TranscriptSegment {
  id: string
  speakerId: string
  startTime: number
  endTime: number
  text: string
}

export interface ProcessedTranscript {
  speakers: Speaker[]
  segments: TranscriptSegment[]
}

// Function to parse VTT file content
export function parseVTT(vttContent: string): ProcessedTranscript {
  const lines = vttContent.split('\n')
  const segments: TranscriptSegment[] = []
  const speakerMap = new Map<string, Speaker>()
  
  let currentSegment: Partial<TranscriptSegment> | null = null
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Skip empty lines and WEBVTT header
    if (!line || line === 'WEBVTT') continue
    
    // Parse timestamp line (e.g., "00:00:10.500 --> 00:00:15.000")
    if (line.includes('-->')) {
      const times = line.split('-->').map(t => t.trim())
      const startTime = convertTimestampToSeconds(times[0])
      const endTime = convertTimestampToSeconds(times[1])
      
      currentSegment = {
        id: `segment-${segments.length + 1}`,
        startTime,
        endTime,
        speakerId: '',
        text: ''
      }
      continue
    }
    
    // If we have a current segment and this line contains text
    if (currentSegment && line && !line.includes('-->')) {
      // Check if line starts with a speaker name (e.g., "John: Hello everyone")
      const speakerMatch = line.match(/^([^:]+):\s*(.*)$/)
      
      if (speakerMatch) {
        const speakerName = speakerMatch[1].trim()
        const text = speakerMatch[2].trim()
        
        // Create or get speaker ID
        let speakerId = ''
        for (const [id, speaker] of speakerMap.entries()) {
          if (speaker.name === speakerName) {
            speakerId = id
            break
          }
        }
        
        if (!speakerId) {
          speakerId = `speaker-${speakerMap.size + 1}`
          speakerMap.set(speakerId, { id: speakerId, name: speakerName })
        }
        
        currentSegment.speakerId = speakerId
        currentSegment.text = text
      } else {
        // If no speaker detected, append to current text
        currentSegment.text = (currentSegment.text || '') + ' ' + line
      }
      
      // If next line is empty or a timestamp, add the current segment
      if (!lines[i + 1] || lines[i + 1].includes('-->')) {
        if (currentSegment.speakerId && currentSegment.text) {
          segments.push(currentSegment as TranscriptSegment)
        }
        currentSegment = null
      }
    }
  }
  
  return {
    speakers: Array.from(speakerMap.values()),
    segments
  }
}

// Function to parse SRT file content
export function parseSRT(srtContent: string): ProcessedTranscript {
  const blocks = srtContent.split('\n\n').filter(block => block.trim())
  const segments: TranscriptSegment[] = []
  const speakerMap = new Map<string, Speaker>()
  
  for (const block of blocks) {
    const lines = block.split('\n').filter(line => line.trim())
    
    // Need at least 2 lines (index and timestamp)
    if (lines.length < 2) continue
    
    // Parse timestamp line (e.g., "00:00:10,500 --> 00:00:15,000")
    const timestampLine = lines[1]
    if (!timestampLine.includes('-->')) continue
    
    const times = timestampLine.split('-->').map(t => t.trim())
    const startTime = convertTimestampToSeconds(times[0].replace(',', '.'))
    const endTime = convertTimestampToSeconds(times[1].replace(',', '.'))
    
    // Combine remaining lines as text
    const textContent = lines.slice(2).join(' ')
    
    // Check if text starts with a speaker name
    const speakerMatch = textContent.match(/^([^:]+):\s*(.*)$/)
    
    let speakerId = ''
    let text = textContent
    
    if (speakerMatch) {
      const speakerName = speakerMatch[1].trim()
      text = speakerMatch[2].trim()
      
      // Create or get speaker ID
      for (const [id, speaker] of speakerMap.entries()) {
        if (speaker.name === speakerName) {
          speakerId = id
          break
        }
      }
      
      if (!speakerId) {
        speakerId = `speaker-${speakerMap.size + 1}`
        speakerMap.set(speakerId, { id: speakerId, name: speakerName })
      }
    } else {
      // If no speaker detected, use "Unknown"
      speakerId = 'unknown'
      if (!speakerMap.has(speakerId)) {
        speakerMap.set(speakerId, { id: speakerId, name: 'Unknown' })
      }
    }
    
    segments.push({
      id: `segment-${segments.length + 1}`,
      speakerId,
      startTime,
      endTime,
      text
    })
  }
  
  return {
    speakers: Array.from(speakerMap.values()),
    segments
  }
}

// Function to parse plain text transcript
export function parsePlainText(textContent: string): ProcessedTranscript {
  const lines = textContent.split('\n').filter(line => line.trim())
  const segments: TranscriptSegment[] = []
  const speakerMap = new Map<string, Speaker>()
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    // Check if line starts with a speaker name
    const speakerMatch = line.match(/^([^:]+):\s*(.*)$/)
    
    let speakerId = ''
    let text = line
    
    if (speakerMatch) {
      const speakerName = speakerMatch[1].trim()
      text = speakerMatch[2].trim()
      
      // Create or get speaker ID
      for (const [id, speaker] of speakerMap.entries()) {
        if (speaker.name === speakerName) {
          speakerId = id
          break
        }
      }
      
      if (!speakerId) {
        speakerId = `speaker-${speakerMap.size + 1}`
        speakerMap.set(speakerId, { id: speakerId, name: speakerName })
      }
    } else {
      // If no speaker detected, use "Unknown"
      speakerId = 'unknown'
      if (!speakerMap.has(speakerId)) {
        speakerMap.set(speakerId, { id: speakerId, name: 'Unknown' })
      }
    }
    
    segments.push({
      id: `segment-${segments.length + 1}`,
      speakerId,
      startTime: segments.length * 5, // Approximate timing (5 seconds per segment)
      endTime: (segments.length + 1) * 5,
      text
    })
  }
  
  return {
    speakers: Array.from(speakerMap.values()),
    segments
  }
}

// Helper function to convert timestamp to seconds
function convertTimestampToSeconds(timestamp: string): number {
  // Handle different timestamp formats (00:00:00.000 or 00:00:00,000)
  const cleanTimestamp = timestamp.replace(',', '.')
  
  // Split by : and .
  const parts = cleanTimestamp.split(':')
  let seconds = 0
  
  if (parts.length === 3) {
    // Hours:Minutes:Seconds.Milliseconds
    const [hours, minutes, secondsPart] = parts
    const [secs, ms] = secondsPart.split('.')
    
    seconds = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(secs)
    if (ms) {
      seconds += parseInt(ms) / 1000
    }
  } else if (parts.length === 2) {
    // Minutes:Seconds.Milliseconds
    const [minutes, secondsPart] = parts
    const [secs, ms] = secondsPart.split('.')
    
    seconds = parseInt(minutes) * 60 + parseInt(secs)
    if (ms) {
      seconds += parseInt(ms) / 1000
    }
  }
  
  return seconds
}

// Function to detect transcript format and parse accordingly
export function parseTranscript(content: string): ProcessedTranscript {
  if (content.trim().startsWith('WEBVTT')) {
    return parseVTT(content)
  } else if (content.includes('-->') && /^\d+\s*\n\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}/m.test(content)) {
    return parseSRT(content)
  } else {
    return parsePlainText(content)
  }
}

// Hook for managing speakers
export function useSpeakerManagement(initialSpeakers: Speaker[] = []) {
  const [speakers, setSpeakers] = useState<Speaker[]>(initialSpeakers)
  
  const updateSpeakerName = (speakerId: string, newName: string) => {
    setSpeakers(prev => 
      prev.map(speaker => 
        speaker.id === speakerId 
          ? { ...speaker, name: newName } 
          : speaker
      )
    )
  }
  
  const mergeSpeakers = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return
    
    // Get the target speaker
    const targetSpeaker = speakers.find(s => s.id === targetId)
    if (!targetSpeaker) return
    
    // Remove the source speaker
    setSpeakers(prev => prev.filter(s => s.id !== sourceId))
    
    // Update all segments with the source speaker ID to use the target ID
    // This would be done in a real application by updating the transcript segments
  }
  
  return {
    speakers,
    setSpeakers,
    updateSpeakerName,
    mergeSpeakers
  }
}

// Function to extract key points from transcript
export function extractKeyPoints(transcript: ProcessedTranscript): string[] {
  // In a real application, this would use NLP to identify important points
  // For now, we'll simulate by extracting sentences with key phrases
  
  const keyPhrases = [
    'important', 'priority', 'deadline', 'decision', 'action item',
    'next steps', 'follow up', 'agreed', 'consensus', 'conclusion'
  ]
  
  const keyPoints: string[] = []
  
  for (const segment of transcript.segments) {
    const sentences = segment.text.split(/[.!?]+/).filter(s => s.trim())
    
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase()
      
      if (keyPhrases.some(phrase => lowerSentence.includes(phrase))) {
        const speaker = transcript.speakers.find(s => s.id === segment.speakerId)
        const speakerName = speaker ? speaker.name : 'Unknown'
        
        keyPoints.push(`${speakerName}: ${sentence.trim()}`)
      }
    }
  }
  
  return keyPoints
}

// Function to extract action items from transcript
export function extractActionItems(transcript: ProcessedTranscript): string[] {
  // In a real application, this would use NLP to identify action items
  // For now, we'll simulate by looking for specific patterns
  
  const actionItemPatterns = [
    /\b([A-Z][a-z]+) (?:will|should|needs to|has to|is going to) ([^.!?]+)/g,
    /\baction item\b[^.!?]*?:\s*([^.!?]+)/gi,
    /\btask\b[^.!?]*?:\s*([^.!?]+)/gi,
    /\b(assigned to|responsible)[^.!?]*?:\s*([^.!?]+)/gi
  ]
  
  const actionItems: string[] = []
  
  for (const segment of transcript.segments) {
    for (const pattern of actionItemPatterns) {
      const matches = segment.text.matchAll(pattern)
      
      for (const match of matches) {
        actionItems.push(match[0].trim())
      }
    }
  }
  
  return actionItems
}

// Function to summarize transcript
export function summarizeTranscript(transcript: ProcessedTranscript): string {
  // In a real application, this would use NLP to generate a summary
  // For now, we'll simulate by combining the first sentence from each speaker
  
  const speakerFirstStatements = new Map<string, string>()
  
  for (const segment of transcript.segments) {
    if (!speakerFirstStatements.has(segment.speakerId)) {
      speakerFirstStatements.set(segment.speakerId, segment.text)
    }
  }
  
  let summary = 'Meeting Summary:\n\n'
  
  for (const [speakerId, statement] of speakerFirstStatements.entries()) {
    const speaker = transcript.speakers.find(s => s.id === speakerId)
    const speakerName = speaker ? speaker.name : 'Unknown'
    
    summary += `${speakerName}: ${statement}\n\n`
  }
  
  return summary
}
