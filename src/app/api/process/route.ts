import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// In a real application, this would interact with a database or a more sophisticated backend.
// For now, we simulate processing and document generation.

interface TranscriptSegment {
  speaker: string; // This should be the *final* speaker name after user mapping
  start_time: number;
  end_time: number;
  text: string;
}

interface ProcessRequestPayload {
  templateId: string;
  outputFormat: string;
  // Instead of file IDs, we now expect the processed transcript data directly
  // from the review page, or potentially raw file IDs if skipping review.
  transcriptFileId?: string; // Kept for scenarios where transcript is pre-existing and not reviewed
  videoFileId?: string; // Kept for scenarios involving video
  segments?: TranscriptSegment[]; // The reviewed and speaker-assigned transcript segments
  speakerNameMap?: Record<string, string>; // The map of original speaker IDs to final names
  // We might also receive the raw audio processing result if the user skips detailed review
  // and just wants to use the auto-detected speakers/language.
  audioProcessingResult?: {
    language: string;
    segments: TranscriptSegment[]; // Segments from initial audio processing
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload: ProcessRequestPayload = await request.json();
    const { templateId, outputFormat, segments, speakerNameMap, audioProcessingResult, transcriptFileId, videoFileId } = payload;

    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    // Determine the source of transcript segments
    let finalSegments: TranscriptSegment[] | undefined = segments;
    if (!finalSegments && audioProcessingResult?.segments) {
        finalSegments = audioProcessingResult.segments;
        // If using audioProcessingResult, ensure speaker names are mapped if a map is provided
        // (though typically speakerNameMap would be applied on the frontend before this step)
        if (speakerNameMap) {
            finalSegments = finalSegments.map(seg => ({
                ...seg,
                speaker: speakerNameMap[seg.speaker] || seg.speaker
            }));
        }
    }

    if (!finalSegments && !transcriptFileId && !videoFileId) {
      return NextResponse.json(
        { error: "Transcript data or file ID is required for processing." },
        { status: 400 }
      );
    }
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const documentId = uuidv4();

    // In a real application, this is where you would:
    // 1. If `transcriptFileId` is provided and `finalSegments` is not, load and parse the transcript file.
    // 2. If `videoFileId` is provided, potentially extract audio/transcript if not already done.
    // 3. Use `finalSegments` (which now contain correct speaker names) and `templateId` 
    //    to generate the meeting minutes content using a document generation library/logic.
    //    The `speakerNameMap` might be useful for a summary of attendees if not already in segments.
    // 4. Convert the generated content to the `outputFormat` (PDF, DOCX, HTML, TXT).
    // 5. Store the generated document and associate it with `documentId`.

    console.log("Processing request for document generation:", {
        documentId,
        templateId,
        outputFormat,
        hasSegments: !!finalSegments,
        numSegments: finalSegments?.length,
        // speakerNameMap, // Be mindful of logging potentially large objects
    });

    // For now, we return a simulated successful response
    // The downloadUrl will point to an API that can retrieve/generate the actual document based on documentId
    return NextResponse.json({
      success: true,
      documentId,
      message: "Document processing initiated. Your download will be available shortly.",
      templateId,
      outputFormat,
      downloadUrl: `/api/download/${documentId}?format=${outputFormat}`,
      // Optionally, you could return some processed data for immediate display if needed
      // For example, a preview or a summary.
    });

  } catch (error: any) {
    console.error("Error in /api/process:", error);
    return NextResponse.json(
      { error: "Failed to process request for document generation.", details: error.message },
      { status: 500 }
    );
  }
}

