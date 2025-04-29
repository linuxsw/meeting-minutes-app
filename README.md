# Meeting Minutes Generator

A web application for generating meeting minutes from Microsoft Teams recordings and transcripts.

## Features

- Upload Microsoft Teams recordings (MP4) and/or transcript files
- Support for multiple input scenarios:
  - MP4 video with transcript
  - MP4 video only (with manual speaker identification)
  - Transcript only
- Multiple meeting minute templates:
  - Regular team meetings
  - Project status meetings
  - Training sessions
  - Agile scrum meetings (daily stand-up)
  - Agile planning meetings
  - Agile retrospect meetings
- Multiple output formats:
  - PDF
  - Word (DOCX)
  - HTML
  - Plain text
- Speaker identification and management
- Guest mode for testing
- Designed for future integration with Active Directory or SSO

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or pnpm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
cd meeting-minutes-app
npm install
# or
pnpm install
```

3. Start the development server:

```bash
npm run dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Select a meeting template
2. Upload your Microsoft Teams recording and/or transcript
3. Process the files and identify speakers
4. Review and edit the meeting information
5. Generate and download the meeting minutes in your preferred format

## Testing

The application includes a test mode that allows you to try the functionality without uploading actual files:

1. Navigate to `/test` in your browser
2. Select the test mode (Video + Transcript, Video Only, or Transcript Only)
3. Click "Start Test" to proceed through the application flow with sample data

## Deployment

### Development Deployment

For development and testing purposes, you can use the built-in Next.js development server:

```bash
npm run dev
# or
pnpm dev
```

### Production Deployment

To deploy the application to production:

1. Build the application:

```bash
npm run build
# or
pnpm build
```

2. Start the production server:

```bash
npm start
# or
pnpm start
```

### Cloudflare Deployment

This application is configured for deployment to Cloudflare Pages:

```bash
npm run deploy
# or
pnpm deploy
```

## Authentication

The application currently supports guest mode for testing. For production use, it is designed to be integrated with:

- Active Directory
- Single Sign-On (SSO)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
