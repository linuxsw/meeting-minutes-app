import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import os from 'os';

const execPromise = util.promisify(exec);

/**
 * Parse .doc and .docx files using python-docx
 * @param {string} filePath - Path to the .doc or .docx file
 * @returns {Promise<string>} - Extracted text content
 */
export async function parseDocxFile(filePath: string): Promise<string> {
  try {
    // Create a temporary Python script
    const tempScriptPath = path.join(os.tmpdir(), 'parse_docx.py');
    const pythonScript = `
import docx
import json
import sys

# Extract text from the DOCX file
doc = docx.Document('${filePath.replace(/\\/g, '\\\\')}')
text = []

for para in doc.paragraphs:
    if para.text.strip():
        text.append(para.text)

# Print as JSON for easy parsing
print(json.dumps(text))
`;

    fs.writeFileSync(tempScriptPath, pythonScript);

    // Execute the Python script
    const { stdout, stderr } = await execPromise(`python3 ${tempScriptPath}`);
    
    if (stderr) {
      console.error('Error parsing DOCX file:', stderr);
      throw new Error(`Failed to parse DOCX file: ${stderr}`);
    }

    // Parse the JSON output
    const textLines = JSON.parse(stdout);
    
    // Clean up the temporary script
    fs.unlinkSync(tempScriptPath);
    
    // Return the extracted text
    return textLines.join('\n');
  } catch (error) {
    console.error('Error in parseDocxFile:', error);
    throw error;
  }
}

/**
 * Convert extracted text to VTT format for transcript processing
 * @param {string} text - Extracted text from .doc or .docx file
 * @returns {string} - Text in VTT format
 */
export function convertToVtt(text: string): string {
  // Basic conversion to VTT format
  // This is a simplified version - real implementation would need more robust parsing
  const lines = text.split('\n');
  let vttContent = 'WEBVTT\n\n';
  
  let currentSpeaker = '';
  let currentTime = '';
  let currentContent = '';
  
  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) continue;
    
    // Check if line contains a timestamp (simple heuristic)
    const timeMatch = line.match(/(\d+):(\d+)/);
    
    if (timeMatch) {
      // If we have content from previous speaker, add it to VTT
      if (currentSpeaker && currentTime && currentContent) {
        vttContent += `${currentTime} --> ${currentTime.replace('00:', '00:01:')}\n`;
        vttContent += `<v ${currentSpeaker}>${currentContent}</v>\n\n`;
      }
      
      // Extract speaker and time information
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        currentSpeaker = parts[0];
        currentTime = `00:${timeMatch[0]}`;
        currentContent = line.substring(line.indexOf(timeMatch[0]) + timeMatch[0].length).trim();
      }
    } else if (currentSpeaker && currentTime) {
      // Continue with current speaker's content
      currentContent += ' ' + line.trim();
    }
  }
  
  // Add the last speaker's content
  if (currentSpeaker && currentTime && currentContent) {
    vttContent += `${currentTime} --> ${currentTime.replace('00:', '00:01:')}\n`;
    vttContent += `<v ${currentSpeaker}>${currentContent}</v>\n\n`;
  }
  
  return vttContent;
}
