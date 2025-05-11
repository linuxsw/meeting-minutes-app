
"use client";

import { MeetingTemplate, getTemplateById } from "./meeting-templates";

// Updated interface to match the data from audio_processor.py and review page
export interface TranscriptSegment {
  speaker: string; // This is the final speaker name (e.g., "Alice", "Speaker 1")
  start_time: number;
  end_time: number;
  text: string;
}

export interface MeetingData {
  title: string;
  date: string;
  attendees: string[]; // This could be derived from unique speaker names in segments or provided separately
  location?: string;
  startTime?: string;
  endTime?: string;
  previousActionItems?: string[];
}

export interface GeneratedDocument {
  title: string;
  content: string;
  format: "pdf" | "docx" | "html" | "txt";
}

// Helper to extract key points and action items (simplified)
// In a real AI-enhanced app, these would come from an AI service call
function extractKeyPointsFromSegments(segments: TranscriptSegment[]): string[] {
  // Simple extraction: take first few words of longer segments, or segments with keywords
  const points: string[] = [];
  segments.forEach(seg => {
    if (seg.text.length > 50 || seg.text.toLowerCase().includes("important") || seg.text.toLowerCase().includes("decision")) {
      points.push(`${seg.speaker}: ${seg.text.substring(0, 100)}${seg.text.length > 100 ? "..." : ""}`);
    }
  });
  return points.slice(0, 5); // Limit to 5 key points for brevity
}

function extractActionItemsFromSegments(segments: TranscriptSegment[]): string[] {
  const items: string[] = [];
  segments.forEach(seg => {
    if (seg.text.toLowerCase().includes("action item") || seg.text.toLowerCase().includes("to do") || seg.text.toLowerCase().match(/\b(will|should|needs to) (\w+\s){1,5}/i)) {
      items.push(`${seg.speaker} to: ${seg.text}`);
    }
  });
  return items;
}


// Function to generate meeting minutes content based on template and new transcript segment structure
export function generateMeetingMinutes(
  templateId: string,
  processedSegments: TranscriptSegment[], // Changed from ProcessedTranscript
  meetingData: MeetingData,
  format: "pdf" | "docx" | "html" | "txt" = "pdf"
): GeneratedDocument | null {
  const template = getTemplateById(templateId);
  if (!template) {
    console.error(`Template with ID ${templateId} not found`);
    return null;
  }

  // Extract key points and action items from the processed segments
  const keyPoints = extractKeyPointsFromSegments(processedSegments);
  const actionItems = extractActionItemsFromSegments(processedSegments);

  // Derive attendees from speaker names if not explicitly provided in meetingData
  if (!meetingData.attendees || meetingData.attendees.length === 0) {
    const uniqueSpeakers = Array.from(new Set(processedSegments.map(seg => seg.speaker)));
    meetingData.attendees = uniqueSpeakers.filter(name => name && name.trim() !== "");
  }

  switch (format) {
    case "html":
      return generateHtmlMinutes(template, processedSegments, meetingData, keyPoints, actionItems);
    case "txt":
      return generateTextMinutes(template, processedSegments, meetingData, keyPoints, actionItems);
    case "docx":
      // Placeholder: uses text format for DOCX generation
      return generateTextMinutes(template, processedSegments, meetingData, keyPoints, actionItems, "docx");
    case "pdf":
    default:
      // Placeholder: uses HTML format for PDF generation
      return generateHtmlMinutes(template, processedSegments, meetingData, keyPoints, actionItems, "pdf");
  }
}

function generateHtmlMinutes(
  template: MeetingTemplate,
  segments: TranscriptSegment[],
  meetingData: MeetingData,
  keyPoints: string[],
  actionItems: string[],
  format: "html" | "pdf" = "html"
): GeneratedDocument {
  let content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${meetingData.title || template.name}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
    h2 { color: #2980b9; margin-top: 20px; }
    .section { margin-bottom: 20px; }
    .attendees { display: flex; flex-wrap: wrap; gap: 10px; }
    .attendee { background-color: #f0f0f0; padding: 5px 10px; border-radius: 15px; font-size: 14px; }
    .action-item, .key-point { margin-bottom: 10px; padding-left: 20px; position: relative; }
    .action-item:before, .key-point:before { content: "•"; position: absolute; left: 0; }
    .transcript-segment { margin-bottom: 10px; padding: 8px; border-left: 3px solid #eee; }
    .transcript-segment strong { color: #555; }
    .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 10px; font-size: 12px; color: #777; }
  </style>
</head>
<body>
  <h1>${meetingData.title || template.name}</h1>
`;

  content += `
  <div class="section">
    <h2>Meeting Information</h2>
    <p><strong>Date:</strong> ${meetingData.date}</p>
    ${meetingData.startTime ? `<p><strong>Time:</strong> ${meetingData.startTime}${meetingData.endTime ? ` - ${meetingData.endTime}` : ""}</p>` : ""}
    ${meetingData.location ? `<p><strong>Location:</strong> ${meetingData.location}</p>` : ""}
    <p><strong>Attendees:</strong></p>
    <div class="attendees">
      ${(meetingData.attendees || []).map(attendee => `<span class="attendee">${attendee}</span>`).join("")}
    </div>
  </div>
`;

  for (const section of template.sections) {
    if (section.id === "meeting-info" || section.id === "session-info") continue;
    content += `
  <div class="section">
    <h2>${section.title}</h2>
`;
    switch (section.id) {
      case "previous-action-items":
        if (meetingData.previousActionItems && meetingData.previousActionItems.length > 0) {
          content += `    <div>
      ${meetingData.previousActionItems.map(item => `<div class="action-item">${item}</div>`).join("")}
    </div>`;
        } else {
          content += `    <p>No previous action items recorded.</p>`;
        }
        break;
      case "action-items":
        if (actionItems.length > 0) {
          content += `    <div>
      ${actionItems.map(item => `<div class="action-item">${item}</div>`).join("")}
    </div>`;
        } else {
          content += `    <p>No action items identified.</p>`;
        }
        break;
      case "discussion":
      case "key-concepts":
      case "summary": // Added summary section to use key points
        if (keyPoints.length > 0) {
          content += `    <div>
      ${keyPoints.map(point => `<div class="key-point">${point}</div>`).join("")}
    </div>`;
        } else {
          content += `    <p>No key points or summary generated.</p>`;
        }
        break;
      case "team-updates":
      case "completed-yesterday":
      case "planned-today":
      case "blockers":
        // Group segments by speaker for these sections
        const speakerUpdates = new Map<string, string[]>();
        segments.forEach(seg => {
          if (!speakerUpdates.has(seg.speaker)) {
            speakerUpdates.set(seg.speaker, []);
          }
          speakerUpdates.get(seg.speaker)?.push(seg.text);
        });
        if (speakerUpdates.size > 0) {
          content += `    <div>`;
          speakerUpdates.forEach((updates, speaker) => {
            content += `      <p><strong>${speaker}:</strong> ${updates.join(" ")}</p>`;
          });
          content += `    </div>`;
        } else {
          content += `    <p>No updates recorded.</p>`;
        }
        break;
      default:
        content += `    <p>[Content for ${section.title} based on transcript segments]</p>`;
        // Display relevant segments for other sections
        if (segments.length > 0) {
            content += segments.slice(0,3).map(seg => `<p class="transcript-segment"><strong>${seg.speaker}:</strong> ${seg.text.substring(0,150)}...</p>`).join("");
        } else {
            content += `<p>No transcript data available for this section.</p>`;
        }
    }
    content += `
  </div>
`;
  }

  content += `
  <div class="section">
    <h2>Full Transcript</h2>
    <div>
      ${segments.map(seg => `<div class="transcript-segment"><strong>${seg.speaker} (${seg.start_time.toFixed(1)}s-${seg.end_time.toFixed(1)}s):</strong> ${seg.text}</div>`).join("")}
    </div>
  </div>
  
  <div class="footer">
    <p>Generated on ${new Date().toLocaleString()} | AI Enhanced Meeting Minutes Generator</p>
  </div>
</body>
</html>`;

  return {
    title: meetingData.title || template.name,
    content,
    format: format === "pdf" ? "pdf" : "html",
  };
}

function generateTextMinutes(
  template: MeetingTemplate,
  segments: TranscriptSegment[],
  meetingData: MeetingData,
  keyPoints: string[],
  actionItems: string[],
  format: "txt" | "docx" = "txt"
): GeneratedDocument {
  let content = `${meetingData.title || template.name}\n`;
  content += `${"=".repeat((meetingData.title || template.name).length)}\n\n`;

  content += `MEETING INFORMATION\n-----------------\n`;
  content += `Date: ${meetingData.date}\n`;
  if (meetingData.startTime) {
    content += `Time: ${meetingData.startTime}${meetingData.endTime ? ` - ${meetingData.endTime}` : ""}\n`;
  }
  if (meetingData.location) {
    content += `Location: ${meetingData.location}\n`;
  }
  content += `Attendees: ${(meetingData.attendees || []).join(", ")}\n\n`;

  for (const section of template.sections) {
    if (section.id === "meeting-info" || section.id === "session-info") continue;
    content += `${section.title.toUpperCase()}\n${"-".repeat(section.title.length)}\n`;
    switch (section.id) {
      case "previous-action-items":
        if (meetingData.previousActionItems && meetingData.previousActionItems.length > 0) {
          meetingData.previousActionItems.forEach(item => { content += `- ${item}\n`; });
        } else {
          content += `No previous action items recorded.\n`;
        }
        break;
      case "action-items":
        if (actionItems.length > 0) {
          actionItems.forEach(item => { content += `- ${item}\n`; });
        } else {
          content += `No action items identified.\n`;
        }
        break;
      case "discussion":
      case "key-concepts":
      case "summary":
        if (keyPoints.length > 0) {
          keyPoints.forEach(point => { content += `${point}\n\n`; });
        } else {
          content += `No key points or summary generated.\n`;
        }
        break;
      case "team-updates":
      case "completed-yesterday":
      case "planned-today":
      case "blockers":
        const speakerUpdates = new Map<string, string[]>();
        segments.forEach(seg => {
          if (!speakerUpdates.has(seg.speaker)) {
            speakerUpdates.set(seg.speaker, []);
          }
          speakerUpdates.get(seg.speaker)?.push(seg.text);
        });
        if (speakerUpdates.size > 0) {
          speakerUpdates.forEach((updates, speaker) => {
            content += `${speaker}:\n${updates.join(" ")}\n\n`;
          });
        } else {
          content += `No updates recorded.\n`;
        }
        break;
      default:
        content += `[Content for ${section.title} based on transcript segments]\n`;
        if (segments.length > 0) {
             content += segments.slice(0,3).map(seg => `${seg.speaker}: ${seg.text.substring(0,150)}...\n`).join("\n");
        } else {
            content += `No transcript data available for this section.\n`;
        }
    }
    content += `\n`;
  }

  content += `FULL TRANSCRIPT\n---------------\n`;
  segments.forEach(seg => {
    content += `${seg.speaker} (${seg.start_time.toFixed(1)}s-${seg.end_time.toFixed(1)}s): ${seg.text}\n\n`;
  });

  content += `\nGenerated on ${new Date().toLocaleString()} | AI Enhanced Meeting Minutes Generator`;

  return {
    title: meetingData.title || template.name,
    content,
    format: format === "docx" ? "docx" : "txt",
  };
}

// This function is called by the download API route.
// It needs to fetch the necessary data (templateId, segments, meetingData, format) associated with a documentId.
// For now, it assumes these are passed directly, which is not how a real download API would work.
// This will need to be refactored when the download API is properly implemented with data persistence.
export async function generateDocumentContent(
  templateId: string,
  processedSegments: TranscriptSegment[],
  meetingData: MeetingData,
  format: "pdf" | "docx" | "html" | "txt"
): Promise<string> { // Returns string content for now
  const document = generateMeetingMinutes(templateId, processedSegments, meetingData, format);
  if (!document) {
    throw new Error("Failed to generate document content");
  }
  return document.content;
}

// The `generateDocument` function that returns a Blob is likely used on the client-side for direct download
// or needs to be adapted for server-side file generation if the download API serves actual files.
export async function generateDocumentBlob(
  templateId: string,
  processedSegments: TranscriptSegment[],
  meetingData: MeetingData,
  format: "pdf" | "docx" | "html" | "txt"
): Promise<Blob> {
  const documentContent = await generateDocumentContent(templateId, processedSegments, meetingData, format);
  
  let mimeType = "text/plain";
  switch (format) {
    case "pdf":
      mimeType = "application/pdf";
      // Actual PDF generation from HTML/text would happen here (e.g., using puppeteer or a library)
      // For now, if HTML was generated, we might return that as text/html for PDF placeholder
      if (generateMeetingMinutes(templateId, processedSegments, meetingData, "html")?.format === "html" && format === "pdf") {
        // This is still a placeholder. Real PDF generation is needed.
        // console.warn("PDF generation is a placeholder; returning HTML content as Blob.");
      }
      break;
    case "docx":
      mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      // Actual DOCX generation from text/HTML would happen here (e.g., using mammoth.js or docx library)
      break;
    case "html":
      mimeType = "text/html";
      break;
    case "txt":
    default:
      mimeType = "text/plain";
  }
  
  return new Blob([documentContent], { type: mimeType });
}

