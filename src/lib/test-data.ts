import { ProcessedTranscript, Speaker, TranscriptSegment } from './transcript-processor';

// Function to parse VTT format transcript
export function parseVTT(vttContent: string): ProcessedTranscript {
  const lines = vttContent.split('\n');
  const segments: TranscriptSegment[] = [];
  const speakerMap = new Map<string, Speaker>();
  
  let currentSegment: Partial<TranscriptSegment> | null = null;
  let speakerId = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and WEBVTT header
    if (!line || line === 'WEBVTT') {
      continue;
    }
    
    // Check if line contains timestamp (-->) which indicates a new segment
    if (line.includes(' --> ')) {
      currentSegment = {
        id: segments.length.toString(),
        startTime: parseTimestamp(line.split(' --> ')[0]),
        endTime: parseTimestamp(line.split(' --> ')[1]),
        text: ''
      };
      continue;
    }
    
    // Check if line contains speaker information (<v Speaker>Text</v>)
    if (line.startsWith('<v ') && line.includes('>') && currentSegment) {
      const speakerMatch = line.match(/<v ([^>]+)>(.*)<\/v>/);
      
      if (speakerMatch) {
        const speakerName = speakerMatch[1].trim();
        const text = speakerMatch[2].trim();
        
        // Check if we've seen this speaker before
        if (!speakerMap.has(speakerName)) {
          speakerMap.set(speakerName, {
            id: `speaker_${speakerId++}`,
            name: speakerName
          });
        }
        
        const speaker = speakerMap.get(speakerName)!;
        currentSegment.speakerId = speaker.id;
        currentSegment.text = text;
        
        // Add the completed segment
        segments.push(currentSegment as TranscriptSegment);
        currentSegment = null;
      }
      continue;
    }
    
    // If we have a current segment but no speaker info yet, this might be text content
    if (currentSegment && !currentSegment.text) {
      currentSegment.text = line;
      
      // Since we don't have speaker info, assign to "Unknown"
      if (!speakerMap.has('Unknown')) {
        speakerMap.set('Unknown', {
          id: `speaker_${speakerId++}`,
          name: 'Unknown'
        });
      }
      
      currentSegment.speakerId = speakerMap.get('Unknown')!.id;
      
      // Add the completed segment
      segments.push(currentSegment as TranscriptSegment);
      currentSegment = null;
    }
  }
  
  return {
    speakers: Array.from(speakerMap.values()),
    segments: segments,
    duration: segments.length > 0 ? segments[segments.length - 1].endTime : 0
  };
}

// Helper function to convert timestamp string to seconds
function parseTimestamp(timestamp: string): number {
  const parts = timestamp.split(':');
  let seconds = 0;
  
  if (parts.length === 3) {
    // Format: HH:MM:SS.mmm
    const [hours, minutes, secondsPart] = parts;
    seconds = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseFloat(secondsPart);
  } else if (parts.length === 2) {
    // Format: MM:SS.mmm
    const [minutes, secondsPart] = parts;
    seconds = parseInt(minutes) * 60 + parseFloat(secondsPart);
  }
  
  return seconds;
}

// Function to simulate processing an uploaded file
export async function processUploadedFile(file: File): Promise<ProcessedTranscript> {
  // Read the actual file content instead of returning sample data
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        // Parse the actual file content
        const transcript = parseVTT(content);
        resolve(transcript);
      } catch (error) {
        console.error('Error parsing transcript:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      reject(error);
    };
    
    reader.readAsText(file);
  });
}
