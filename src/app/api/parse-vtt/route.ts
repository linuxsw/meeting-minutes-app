import { NextRequest, NextResponse } from 'next/server';
import { parseTeamsVTT } from '@/lib/transcript-processor';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Check if the file is a .vtt file
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.vtt')) {
      return NextResponse.json(
        { error: 'File must be a .vtt file' },
        { status: 400 }
      );
    }
    
    // Convert the file to a string
    const fileContent = await file.text();
    
    // Parse the VTT content
    const processedTranscript = parseTeamsVTT(fileContent);
    
    // Return the parsed content
    return NextResponse.json({
      success: true,
      transcript: processedTranscript
    });
  } catch (error) {
    console.error('Error parsing .vtt file:', error);
    return NextResponse.json(
      { error: 'Failed to parse .vtt file', details: (error as Error).message },
      { status: 500 }
    );
  }
}
