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

// Sample transcript data for testing
export const sampleTranscript: ProcessedTranscript = {
  speakers: [
    { id: 'speaker_0', name: 'Sushma Gudimalla' },
    { id: 'speaker_1', name: 'pdx' }
  ],
  segments: [
    {
      id: '0',
      startTime: 338.102,
      endTime: 338.902,
      speakerId: 'speaker_0',
      text: 'Sing one.'
    },
    {
      id: '1',
      startTime: 342.682,
      endTime: 345.522,
      speakerId: 'speaker_0',
      text: 'Not able to hear anything, are you?'
    },
    {
      id: '2',
      startTime: 346.082,
      endTime: 347.762,
      speakerId: 'speaker_0',
      text: 'Did you start meeting or?'
    },
    {
      id: '3',
      startTime: 356.582,
      endTime: 357.742,
      speakerId: 'speaker_1',
      text: 'Restart again.'
    },
    {
      id: '4',
      startTime: 357.892,
      endTime: 358.852,
      speakerId: 'speaker_0',
      text: 'Yes, OK.'
    },
    {
      id: '5',
      startTime: 358.932,
      endTime: 359.532,
      speakerId: 'speaker_0',
      text: 'Thank you.'
    },
    {
      id: '6',
      startTime: 361.462,
      endTime: 368.582,
      speakerId: 'speaker_1',
      text: "Sorry, I'm actually automatically the PDX is muted, so maybe I can start over again."
    },
    {
      id: '7',
      startTime: 369.342,
      endTime: 369.822,
      speakerId: 'speaker_0',
      text: 'OK.'
    },
    {
      id: '8',
      startTime: 369.822,
      endTime: 370.942,
      speakerId: 'speaker_0',
      text: 'Thank you so much.'
    }
  ],
  duration: 370.942
};

// Function to simulate processing an uploaded file
export async function processUploadedFile(file: File): Promise<ProcessedTranscript> {
  // In a real application, we would process the file here
  // For now, we'll just return the sample transcript
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleTranscript);
    }, 1500);
  });
}
