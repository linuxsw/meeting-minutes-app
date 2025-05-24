import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

// Function to extract text from .docx file using a more robust approach
async function extractTextFromDocx(filePath: string): Promise<string> {
  try {
    // Create a temporary Python script to extract text from .docx
    const scriptPath = '/tmp/extract_docx.py';
    const scriptContent = `
import sys
import re
import zipfile
from xml.etree import ElementTree

def extract_text_from_docx(docx_path):
    try:
        # Open the .docx file as a zip file
        with zipfile.ZipFile(docx_path, 'r') as zip_ref:
            # Check if document.xml exists in the zip file
            if 'word/document.xml' not in zip_ref.namelist():
                return "Error: This doesn't appear to be a valid .docx file"
            
            # Extract the document.xml file
            xml_content = zip_ref.read('word/document.xml')
            
            # Parse the XML
            root = ElementTree.fromstring(xml_content)
            
            # Define the namespace
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            # Extract all text elements
            paragraphs = []
            for paragraph in root.findall('.//w:p', ns):
                texts = []
                for text_elem in paragraph.findall('.//w:t', ns):
                    if text_elem.text:
                        texts.append(text_elem.text)
                if texts:
                    paragraphs.append(' '.join(texts))
            
            # Join paragraphs with newlines
            return '\\n'.join(paragraphs)
    except zipfile.BadZipFile:
        return "Error: The file is not a valid zip file or is corrupted"
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python extract_docx.py <path_to_docx_file>")
        sys.exit(1)
    
    docx_path = sys.argv[1]
    text = extract_text_from_docx(docx_path)
    print(text)
`;

    fs.writeFileSync(scriptPath, scriptContent);

    // Execute the Python script
    const { stdout, stderr } = await execPromise(`python3 ${scriptPath} "${filePath}"`);
    
    if (stderr && !stdout) {
      console.error('Error extracting text from .docx:', stderr);
      throw new Error(stderr);
    }
    
    return stdout;
  } catch (error) {
    console.error('Error in extractTextFromDocx:', error);
    throw error;
  }
}

// Function to convert extracted text to VTT format
function convertToVtt(text: string): string {
  // Split the text into lines
  const lines = text.split('\n').filter(line => line.trim());
  
  // Initialize VTT content
  let vttContent = 'WEBVTT\n\n';
  
  // Process each line
  let segmentIndex = 1;
  let currentTime = 0;
  
  for (const line of lines) {
    // Try to extract speaker and text
    const speakerMatch = line.match(/^([^:]+):\s*(.*)$/);
    
    if (speakerMatch) {
      const speaker = speakerMatch[1].trim();
      const text = speakerMatch[2].trim();
      
      // Calculate timestamps (5 seconds per segment)
      const startTime = formatTimestamp(currentTime);
      currentTime += 5;
      const endTime = formatTimestamp(currentTime);
      
      // Add segment to VTT
      vttContent += `${segmentIndex}\n`;
      vttContent += `${startTime} --> ${endTime}\n`;
      vttContent += `<v ${speaker}>${text}</v>\n\n`;
      
      segmentIndex++;
    } else if (line.trim()) {
      // If no speaker detected, use "Unknown"
      const startTime = formatTimestamp(currentTime);
      currentTime += 5;
      const endTime = formatTimestamp(currentTime);
      
      vttContent += `${segmentIndex}\n`;
      vttContent += `${startTime} --> ${endTime}\n`;
      vttContent += `<v Unknown>${line.trim()}</v>\n\n`;
      
      segmentIndex++;
    }
  }
  
  return vttContent;
}

// Helper function to format timestamp
function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

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
    
    // Check if the file is a .doc or .docx file
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.doc') && !fileName.endsWith('.docx')) {
      return NextResponse.json(
        { error: 'File must be a .doc or .docx file' },
        { status: 400 }
      );
    }
    
    // Create a temporary directory to store the file
    const tempDir = path.join(os.tmpdir(), 'meeting-minutes-app');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Generate a unique filename
    const uniqueFileName = `${uuidv4()}${path.extname(fileName)}`;
    const filePath = path.join(tempDir, uniqueFileName);
    
    // Convert the file to a Buffer and write it to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    
    try {
      // Extract text from the .docx file
      const textContent = await extractTextFromDocx(filePath);
      
      // Check if there was an error in extraction
      if (textContent.startsWith('Error:')) {
        throw new Error(textContent);
      }
      
      // Convert the text content to VTT format
      const vttContent = convertToVtt(textContent);
      
      // Clean up the temporary file
      fs.unlinkSync(filePath);
      
      // Return the parsed content
      return NextResponse.json({
        success: true,
        textContent,
        vttContent
      });
    } catch (error) {
      console.error('Error processing .docx file:', error);
      
      // If we can't parse the file, return a more user-friendly error
      return NextResponse.json({
        success: false,
        error: 'The file appears to be corrupted or in an unsupported format. Please try uploading a different file.',
        details: (error as Error).message
      });
    }
  } catch (error) {
    console.error('Error parsing .docx file:', error);
    return NextResponse.json(
      { error: 'Failed to parse .docx file', details: (error as Error).message },
      { status: 500 }
    );
  }
}
