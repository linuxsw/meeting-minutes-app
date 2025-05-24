'use client'

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

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
  metadata?: {
    title?: string
    date?: string
  }
}

// Function to parse Microsoft Teams VTT file content
export function parseTeamsVTT(vttContent: string): ProcessedTranscript {
  console.log('Parsing Microsoft Teams VTT format');
  const lines = vttContent.split('\n')
  const segments: TranscriptSegment[] = []
  const speakerMap = new Map<string, Speaker>()
  
  let currentSegment: Partial<TranscriptSegment> | null = null
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Skip empty lines and WEBVTT header
    if (!line || line === 'WEBVTT') continue
    
    // Skip metadata lines that contain identifiers like 1c97f8d8-4a68-4dd0-ad98-73bd2466207f/16-0
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/\d+-\d+$/.test(line)) {
      continue
    }
    
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
      // Check for Microsoft Teams speaker format: <v Speaker Name>Text</v>
      const teamsMatch = line.match(/<v\s+([^>]+)>(.*?)(?:<\/v>)?$/)
      
      if (teamsMatch) {
        const speakerName = teamsMatch[1].trim()
        const text = teamsMatch[2].trim()
        
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
      } 
      // Check if line starts with a standard speaker name (e.g., "John: Hello everyone")
      else {
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
      }
      
      // If next line is empty, a timestamp, or a new segment identifier, add the current segment
      if (i === lines.length - 1 || !lines[i + 1] || 
          lines[i + 1].includes('-->') || 
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/\d+-\d+$/.test(lines[i + 1])) {
        if (currentSegment.speakerId && currentSegment.text) {
          segments.push(currentSegment as TranscriptSegment)
        } else if (currentSegment.text) {
          // If we have text but no speaker, assign to "Unknown"
          const speakerId = 'unknown'
          if (!speakerMap.has(speakerId)) {
            speakerMap.set(speakerId, { id: speakerId, name: 'Unknown' })
          }
          currentSegment.speakerId = speakerId
          segments.push(currentSegment as TranscriptSegment)
        }
        currentSegment = null
      }
    }
  }
  
  // If we have no segments but there's content, try a simpler approach
  if (segments.length === 0 && vttContent.trim().length > 0) {
    console.log('No segments found with standard parsing, trying fallback method');
    return parseVTTFallback(vttContent);
  }
  
  return {
    speakers: Array.from(speakerMap.values()),
    segments
  }
}

// Fallback parser for VTT files that don't match expected format
function parseVTTFallback(vttContent: string): ProcessedTranscript {
  console.log('Using VTT fallback parser');
  const lines = vttContent.split('\n').filter(line => line.trim());
  const segments: TranscriptSegment[] = [];
  const speakerMap = new Map<string, Speaker>();
  
  let currentTime = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip WEBVTT header and empty lines
    if (!line || line === 'WEBVTT') continue;
    
    // Skip timestamp lines and metadata
    if (line.includes('-->') || /^\d+$/.test(line) || 
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(line)) {
      continue;
    }
    
    // Try to extract speaker information
    let speakerName = 'Unknown';
    let text = line;
    
    // Check for <v Speaker>Text</v> format
    const teamsMatch = line.match(/<v\s+([^>]+)>(.*?)(?:<\/v>)?$/);
    if (teamsMatch) {
      speakerName = teamsMatch[1].trim();
      text = teamsMatch[2].trim();
    } 
    // Check for "Speaker: Text" format
    else {
      const speakerMatch = line.match(/^([^:]+):\s*(.*)$/);
      if (speakerMatch) {
        speakerName = speakerMatch[1].trim();
        text = speakerMatch[2].trim();
      }
    }
    
    // Create or get speaker ID
    let speakerId = '';
    for (const [id, speaker] of speakerMap.entries()) {
      if (speaker.name === speakerName) {
        speakerId = id;
        break;
      }
    }
    
    if (!speakerId) {
      speakerId = `speaker-${speakerMap.size + 1}`;
      speakerMap.set(speakerId, { id: speakerId, name: speakerName });
    }
    
    // Create segment with approximate timing
    const startTime = currentTime;
    currentTime += 5; // 5 seconds per segment
    
    segments.push({
      id: `segment-${segments.length + 1}`,
      speakerId,
      startTime,
      endTime: currentTime,
      text
    });
  }
  
  return {
    speakers: Array.from(speakerMap.values()),
    segments
  };
}

// Function to parse standard VTT file content
export function parseVTT(vttContent: string): ProcessedTranscript {
  // First check if this is a Microsoft Teams VTT format
  if (vttContent.includes('<v ') && vttContent.includes('</v>')) {
    console.log('Detected Microsoft Teams VTT format, using specialized parser');
    return parseTeamsVTT(vttContent);
  }
  
  console.log('Using standard VTT parser');
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
      if (i === lines.length - 1 || !lines[i + 1] || lines[i + 1].includes('-->')) {
        if (currentSegment.speakerId && currentSegment.text) {
          segments.push(currentSegment as TranscriptSegment)
        } else if (currentSegment.text) {
          // If we have text but no speaker, assign to "Unknown"
          const speakerId = 'unknown'
          if (!speakerMap.has(speakerId)) {
            speakerMap.set(speakerId, { id: speakerId, name: 'Unknown' })
          }
          currentSegment.speakerId = speakerId
          segments.push(currentSegment as TranscriptSegment)
        }
        currentSegment = null
      }
    }
  }
  
  // If we have no segments but there's content, try the fallback method
  if (segments.length === 0 && vttContent.trim().length > 0) {
    console.log('No segments found with standard parsing, trying fallback method');
    return parseVTTFallback(vttContent);
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

// Main function to detect transcript format and parse accordingly
export async function parseTranscript(content: string, fileName?: string): Promise<ProcessedTranscript> {
  console.log('Parsing transcript with filename:', fileName);
  
  // For browser environment, use direct parsing
  if (typeof window !== 'undefined') {
    // For .vtt files, check for Microsoft Teams format first
    if (fileName && fileName.toLowerCase().endsWith('.vtt')) {
      console.log('Processing .vtt file:', fileName);
      
      // Check for Microsoft Teams VTT format
      if (content.includes('<v ')) {
        console.log('Detected Microsoft Teams VTT format');
        return parseTeamsVTT(content);
      }
      
      // Standard VTT format
      return parseVTT(content);
    }
    
    // For other file types, use the existing logic
    if (content.trim().startsWith('WEBVTT')) {
      // Check for Microsoft Teams VTT format
      if (content.includes('<v ')) {
        console.log('Detected Microsoft Teams VTT format');
        return parseTeamsVTT(content);
      }
      return parseVTT(content);
    } else if (content.includes('-->') && /^\d+\s*\n\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}/m.test(content)) {
      return parseSRT(content);
    } else {
      // Try to parse as plain text with speaker detection
      return parsePlainText(content);
    }
  }
  
  // For server environment, use API routes for specific file types
  try {
    // For .vtt files
    if (fileName && fileName.toLowerCase().endsWith('.vtt')) {
      console.log('Processing .vtt file on server:', fileName);
      
      // Check for Microsoft Teams VTT format
      if (content.includes('<v ')) {
        console.log('Detected Microsoft Teams VTT format on server');
        return parseTeamsVTT(content);
      }
      
      // Standard VTT format
      return parseVTT(content);
    }
    
    // For other file types, use the existing logic
    if (content.trim().startsWith('WEBVTT')) {
      // Check for Microsoft Teams VTT format
      if (content.includes('<v ')) {
        console.log('Detected Microsoft Teams VTT format on server');
        return parseTeamsVTT(content);
      }
      return parseVTT(content);
    } else if (content.includes('-->') && /^\d+\s*\n\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}/m.test(content)) {
      return parseSRT(content);
    } else {
      // Try to parse as plain text with speaker detection
      return parsePlainText(content);
    }
  } catch (error) {
    console.error('Error parsing transcript:', error);
    // Fallback to plain text parsing
    return parsePlainText(content);
  }
}

// Function to create a simple test transcript for development
export function createTestTranscript(): ProcessedTranscript {
  return {
    speakers: [
      { id: 'speaker-1', name: 'John Doe' },
      { id: 'speaker-2', name: 'Jane Smith' },
      { id: 'speaker-3', name: 'Bob Johnson' }
    ],
    segments: [
      { id: 'segment-1', speakerId: 'speaker-1', startTime: 0, endTime: 10, text: 'Hello everyone, welcome to the meeting.' },
      { id: 'segment-2', speakerId: 'speaker-2', startTime: 11, endTime: 20, text: 'Thanks John. Let\'s start with the project updates.' },
      { id: 'segment-3', speakerId: 'speaker-3', startTime: 21, endTime: 30, text: 'I\'ve completed the first phase of the development.' },
      { id: 'segment-4', speakerId: 'speaker-1', startTime: 31, endTime: 40, text: 'Great job, Bob! What about the testing?' },
      { id: 'segment-5', speakerId: 'speaker-2', startTime: 41, endTime: 50, text: 'I\'ll handle the testing this week.' },
      { id: 'segment-6', speakerId: 'speaker-3', startTime: 51, endTime: 60, text: 'Perfect. I\'ll continue with the second phase then.' },
      { id: 'segment-7', speakerId: 'speaker-1', startTime: 61, endTime: 70, text: 'Let\'s schedule a follow-up meeting next week.' },
      { id: 'segment-8', speakerId: 'speaker-2', startTime: 71, endTime: 80, text: 'Sounds good. I\'ll send out the calendar invites.' },
      { id: 'segment-9', speakerId: 'speaker-3', startTime: 81, endTime: 90, text: 'Thanks everyone. See you next week.' }
    ],
    metadata: {
      title: 'Project Status Meeting',
      date: new Date().toISOString().split('T')[0]
    }
  }
}
