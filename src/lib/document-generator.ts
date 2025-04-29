'use client'

import { ProcessedTranscript, extractKeyPoints, extractActionItems } from './transcript-processor'
import { MeetingTemplate, getTemplateById } from './meeting-templates'

export interface MeetingData {
  title: string
  date: string
  attendees: string[]
  location?: string
  startTime?: string
  endTime?: string
  previousActionItems?: string[]
}

export interface GeneratedDocument {
  title: string
  content: string
  format: 'pdf' | 'docx' | 'html' | 'txt'
}

// Function to generate meeting minutes content based on template and transcript
export function generateMeetingMinutes(
  templateId: string,
  transcript: ProcessedTranscript,
  meetingData: MeetingData,
  format: 'pdf' | 'docx' | 'html' | 'txt' = 'pdf'
): GeneratedDocument | null {
  // Get the template
  const template = getTemplateById(templateId)
  if (!template) {
    console.error(`Template with ID ${templateId} not found`)
    return null
  }
  
  // Extract key points and action items from transcript
  const keyPoints = extractKeyPoints(transcript)
  const actionItems = extractActionItems(transcript)
  
  // Generate content based on format
  switch (format) {
    case 'html':
      return generateHtmlMinutes(template, transcript, meetingData, keyPoints, actionItems)
    case 'txt':
      return generateTextMinutes(template, transcript, meetingData, keyPoints, actionItems)
    case 'docx':
      // In a real application, this would generate a DOCX file
      // For now, we'll use the text format as a placeholder
      return generateTextMinutes(template, transcript, meetingData, keyPoints, actionItems, 'docx')
    case 'pdf':
    default:
      // In a real application, this would generate a PDF file
      // For now, we'll use the HTML format as a placeholder
      return generateHtmlMinutes(template, transcript, meetingData, keyPoints, actionItems, 'pdf')
  }
}

// Generate HTML meeting minutes
function generateHtmlMinutes(
  template: MeetingTemplate,
  transcript: ProcessedTranscript,
  meetingData: MeetingData,
  keyPoints: string[],
  actionItems: string[],
  format: 'html' | 'pdf' = 'html'
): GeneratedDocument {
  let content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${meetingData.title || template.name}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
    }
    h2 {
      color: #2980b9;
      margin-top: 20px;
    }
    .section {
      margin-bottom: 20px;
    }
    .attendees {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .attendee {
      background-color: #f0f0f0;
      padding: 5px 10px;
      border-radius: 15px;
      font-size: 14px;
    }
    .action-item {
      margin-bottom: 10px;
      padding-left: 20px;
      position: relative;
    }
    .action-item:before {
      content: "•";
      position: absolute;
      left: 0;
    }
    .footer {
      margin-top: 40px;
      border-top: 1px solid #ddd;
      padding-top: 10px;
      font-size: 12px;
      color: #777;
    }
  </style>
</head>
<body>
  <h1>${meetingData.title || template.name}</h1>
`

  // Meeting Information
  content += `
  <div class="section">
    <h2>Meeting Information</h2>
    <p><strong>Date:</strong> ${meetingData.date}</p>
    ${meetingData.startTime ? `<p><strong>Time:</strong> ${meetingData.startTime}${meetingData.endTime ? ` - ${meetingData.endTime}` : ''}</p>` : ''}
    ${meetingData.location ? `<p><strong>Location:</strong> ${meetingData.location}</p>` : ''}
    <p><strong>Attendees:</strong></p>
    <div class="attendees">
      ${meetingData.attendees.map(attendee => `<span class="attendee">${attendee}</span>`).join('')}
    </div>
  </div>
`

  // Add template-specific sections
  for (const section of template.sections) {
    // Skip meeting-info section as we've already added it
    if (section.id === 'meeting-info' || section.id === 'session-info') continue
    
    content += `
  <div class="section">
    <h2>${section.title}</h2>
`
    
    // Add section-specific content
    switch (section.id) {
      case 'previous-action-items':
        if (meetingData.previousActionItems && meetingData.previousActionItems.length > 0) {
          content += `    <div>
      ${meetingData.previousActionItems.map(item => `<div class="action-item">${item}</div>`).join('')}
    </div>`
        } else {
          content += `    <p>No previous action items recorded.</p>`
        }
        break
        
      case 'action-items':
        if (actionItems.length > 0) {
          content += `    <div>
      ${actionItems.map(item => `<div class="action-item">${item}</div>`).join('')}
    </div>`
        } else {
          content += `    <p>No action items identified.</p>`
        }
        break
        
      case 'discussion':
      case 'key-concepts':
        if (keyPoints.length > 0) {
          content += `    <div>
      ${keyPoints.map(point => `<p>${point}</p>`).join('')}
    </div>`
        } else {
          content += `    <p>No key points identified.</p>`
        }
        break
        
      case 'team-updates':
      case 'completed-yesterday':
      case 'planned-today':
        // For stand-up meetings, organize by speaker
        const speakerUpdates = new Map<string, string[]>()
        
        for (const segment of transcript.segments) {
          const speaker = transcript.speakers.find(s => s.id === segment.speakerId)
          if (speaker) {
            if (!speakerUpdates.has(speaker.name)) {
              speakerUpdates.set(speaker.name, [])
            }
            speakerUpdates.get(speaker.name)?.push(segment.text)
          }
        }
        
        if (speakerUpdates.size > 0) {
          content += `    <div>`
          for (const [speaker, updates] of speakerUpdates.entries()) {
            content += `      <p><strong>${speaker}:</strong></p>
      <p>${updates.join(' ')}</p>`
          }
          content += `    </div>`
        } else {
          content += `    <p>No updates recorded.</p>`
        }
        break
        
      default:
        // For other sections, add placeholder text
        content += `    <p>[Content for ${section.title} would be generated here based on the transcript and meeting data]</p>`
    }
    
    content += `
  </div>
`
  }
  
  // Add transcript summary
  content += `
  <div class="section">
    <h2>Transcript Summary</h2>
    <div>
      ${transcript.segments.map(segment => {
        const speaker = transcript.speakers.find(s => s.id === segment.speakerId)
        return `<p><strong>${speaker ? speaker.name : 'Unknown'}:</strong> ${segment.text}</p>`
      }).join('')}
    </div>
  </div>
  
  <div class="footer">
    <p>Generated on ${new Date().toLocaleString()} | Meeting Minutes Generator</p>
  </div>
</body>
</html>`

  return {
    title: meetingData.title || template.name,
    content,
    format: format === 'pdf' ? 'pdf' : 'html'
  }
}

// Generate plain text meeting minutes
function generateTextMinutes(
  template: MeetingTemplate,
  transcript: ProcessedTranscript,
  meetingData: MeetingData,
  keyPoints: string[],
  actionItems: string[],
  format: 'txt' | 'docx' = 'txt'
): GeneratedDocument {
  let content = `${meetingData.title || template.name}\n`
  content += `${'='.repeat((meetingData.title || template.name).length)}\n\n`
  
  // Meeting Information
  content += `MEETING INFORMATION\n`
  content += `-----------------\n`
  content += `Date: ${meetingData.date}\n`
  if (meetingData.startTime) {
    content += `Time: ${meetingData.startTime}${meetingData.endTime ? ` - ${meetingData.endTime}` : ''}\n`
  }
  if (meetingData.location) {
    content += `Location: ${meetingData.location}\n`
  }
  content += `Attendees: ${meetingData.attendees.join(', ')}\n\n`
  
  // Add template-specific sections
  for (const section of template.sections) {
    // Skip meeting-info section as we've already added it
    if (section.id === 'meeting-info' || section.id === 'session-info') continue
    
    content += `${section.title.toUpperCase()}\n`
    content += `${'-'.repeat(section.title.length)}\n`
    
    // Add section-specific content
    switch (section.id) {
      case 'previous-action-items':
        if (meetingData.previousActionItems && meetingData.previousActionItems.length > 0) {
          meetingData.previousActionItems.forEach(item => {
            content += `- ${item}\n`
          })
        } else {
          content += `No previous action items recorded.\n`
        }
        break
        
      case 'action-items':
        if (actionItems.length > 0) {
          actionItems.forEach(item => {
            content += `- ${item}\n`
          })
        } else {
          content += `No action items identified.\n`
        }
        break
        
      case 'discussion':
      case 'key-concepts':
        if (keyPoints.length > 0) {
          keyPoints.forEach(point => {
            content += `${point}\n\n`
          })
        } else {
          content += `No key points identified.\n`
        }
        break
        
      case 'team-updates':
      case 'completed-yesterday':
      case 'planned-today':
        // For stand-up meetings, organize by speaker
        const speakerUpdates = new Map<string, string[]>()
        
        for (const segment of transcript.segments) {
          const speaker = transcript.speakers.find(s => s.id === segment.speakerId)
          if (speaker) {
            if (!speakerUpdates.has(speaker.name)) {
              speakerUpdates.set(speaker.name, [])
            }
            speakerUpdates.get(speaker.name)?.push(segment.text)
          }
        }
        
        if (speakerUpdates.size > 0) {
          for (const [speaker, updates] of speakerUpdates.entries()) {
            content += `${speaker}:\n${updates.join(' ')}\n\n`
          }
        } else {
          content += `No updates recorded.\n`
        }
        break
        
      default:
        // For other sections, add placeholder text
        content += `[Content for ${section.title} would be generated here based on the transcript and meeting data]\n`
    }
    
    content += `\n`
  }
  
  // Add transcript summary
  content += `TRANSCRIPT SUMMARY\n`
  content += `-----------------\n`
  transcript.segments.forEach(segment => {
    const speaker = transcript.speakers.find(s => s.id === segment.speakerId)
    content += `${speaker ? speaker.name : 'Unknown'}: ${segment.text}\n\n`
  })
  
  content += `\nGenerated on ${new Date().toLocaleString()} | Meeting Minutes Generator`
  
  return {
    title: meetingData.title || template.name,
    content,
    format: format === 'docx' ? 'docx' : 'txt'
  }
}

// Function to generate a document based on template, transcript, and format
export async function generateDocument(
  templateId: string,
  transcript: ProcessedTranscript,
  meetingData: MeetingData,
  format: 'pdf' | 'docx' | 'html' | 'txt'
): Promise<Blob> {
  const document = generateMeetingMinutes(templateId, transcript, meetingData, format)
  
  if (!document) {
    throw new Error('Failed to generate document')
  }
  
  // In a real application, this would convert the content to the appropriate format
  // For now, we'll return the content as a Blob with the appropriate MIME type
  let mimeType = 'text/plain'
  
  switch (format) {
    case 'pdf':
      mimeType = 'application/pdf'
      break
    case 'docx':
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      break
    case 'html':
      mimeType = 'text/html'
      break
    case 'txt':
    default:
      mimeType = 'text/plain'
  }
  
  return new Blob([document.content], { type: mimeType })
}
