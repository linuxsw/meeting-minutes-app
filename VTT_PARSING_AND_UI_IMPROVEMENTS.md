# Meeting Minutes App - VTT Parsing and UI Improvements

## Overview
This document provides a comprehensive guide to the improvements made to the Meeting Minutes App, focusing on VTT parsing, transcript preview, and attendee section functionality.

## 1. VTT Parsing Improvements

### Key Changes
- Enhanced Microsoft Teams VTT format support with `<v Speaker>Text</v>` tag parsing
- Implemented multiple fallback parsing methods for different VTT variations
- Added robust error handling and logging for better debugging
- Removed problematic .docx parsing to focus on reliable VTT support

### Implementation Details
The transcript processor has been completely rewritten to handle various VTT formats, with special attention to Microsoft Teams VTT format. The parser now:

- Detects and properly handles the `<v Speaker>Text</v>` tag format
- Extracts speaker names and text content accurately
- Handles timestamp conversion and segment organization
- Provides fallback parsing for non-standard formats
- Includes extensive logging for troubleshooting

## 2. Attendee Section Improvements

### Key Changes
- Fixed merged speakers not showing in the attendee section
- Added the "Add Participants" button with full functionality
- Ensured the Generate Minutes function properly consumes participant information
- Improved UI for better visibility and usability

### Implementation Details
The result page component has been updated to:

- Properly display merged speakers in the attendee list
- Include an "Add Participants" button that allows adding new attendees
- Preserve attendee information when generating minutes
- Provide clear visual feedback for all user interactions

## 3. Setup Requirements

### Environment Requirements
- Node.js: v22.13.0
- npm: v10.9.2
- Browser: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+

### Installation Steps
1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Access the application at http://localhost:3000

## 4. Testing Instructions

### VTT Parsing and Transcript Preview
1. Start the application
2. Click on "Transcript Only" button
3. Upload a VTT file (preferably Microsoft Teams format)
4. Verify that the transcript is parsed and displayed correctly in the preview section
5. Check that speaker names are correctly extracted

### Attendee Section and Merged Speakers
1. After uploading a transcript, proceed to the processing page
2. Merge speakers by dragging one speaker onto another
3. Click "Continue to Generate Minutes"
4. Verify that merged speakers appear correctly in the attendee section
5. Test the "Add Participants" button by adding a new attendee
6. Confirm that all attendees are included when generating minutes

## 5. Troubleshooting

### Common Issues
- If transcript preview doesn't show content, check the VTT file format
- If speakers aren't merged correctly, ensure you're dragging and dropping properly
- If the "Add Participants" button doesn't appear, check that you've completed the processing step

### Logs
The application includes extensive console logging. Open your browser's developer tools to view logs for debugging.

## 6. Future Improvements
- Add support for more transcript formats
- Enhance speaker detection algorithms
- Improve UI/UX for mobile devices
- Add automated testing for VTT parsing
