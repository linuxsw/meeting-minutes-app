# Meeting Minutes Generator - Setup and User Guide

## Overview

The Meeting Minutes Generator is a web application that helps you create professional meeting minutes from Microsoft Teams recordings and transcripts. This enhanced version includes AI capabilities to automatically summarize transcripts, extract action items, and process meeting-specific content.

## Setup Guide

### Option 1: Running with Docker (Recommended)

This method includes Ollama for local AI processing without requiring external API keys.

#### Prerequisites
- Docker and Docker Compose installed on your Mac
- At least 8GB of RAM available for Docker

#### Steps

1. Clone the repository to your local machine
2. Navigate to the project directory
3. Start the application with Docker Compose:

```bash
docker-compose up -d
```

4. The application will be available at http://localhost:3000
5. Ollama will be available at http://localhost:11434

#### Downloading Models for Ollama

The first time you use Ollama, you'll need to download the models:

```bash
# Connect to the Ollama container
docker exec -it meeting-minutes-app_ollama_1 bash

# Download a model (e.g., Llama 2)
ollama pull llama2
```

### Option 2: Running Directly on Your Machine

#### Prerequisites
- Node.js 20.x or higher
- npm or pnpm package manager

#### Steps

1. Clone the repository to your local machine
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
# or
pnpm install
```

4. Build the application:

```bash
npm run build
# or
pnpm build
```

5. Start the application:

```bash
npm start
# or
pnpm start
```

6. The application will be available at http://localhost:3000

## User Guide

### Generating Meeting Minutes

1. **Select a Template**: Choose from various meeting templates including regular meetings, project status, training sessions, and agile ceremonies.

2. **Upload Files**: Upload your Microsoft Teams recording (MP4) and/or transcript files. The application supports:
   - MP4 video with transcript
   - MP4 video only (with manual speaker identification)
   - Transcript only

3. **Process Transcript**: If needed, edit speaker names and review the transcript.

4. **Configure AI Processing** (Optional):
   - Navigate to the AI Configuration page
   - Select and configure your preferred AI provider
   - Options include:
     - No AI (manual processing)
     - Ollama (local, free)
     - OpenAI (requires API key)
     - Together AI (requires API key)

5. **Generate Minutes**: Fill in meeting details and generate minutes in your preferred format (PDF, Word, HTML, or plain text).

### AI Provider Configuration

#### Ollama (Local AI)

1. Navigate to the AI Configuration page
2. Select "Ollama" as your provider
3. Configure:
   - Server URL: http://localhost:11434 (or http://ollama:11434 if using Docker)
   - Model: Select from available models (Llama 2, Mistral, etc.)
4. Click "Save Configuration"

#### OpenAI

1. Navigate to the AI Configuration page
2. Select "OpenAI" as your provider
3. Configure:
   - API Key: Enter your OpenAI API key
   - Model: Select from available models (GPT-3.5 Turbo, GPT-4, etc.)
4. Click "Save Configuration"

#### Together AI

1. Navigate to the AI Configuration page
2. Select "Together AI" as your provider
3. Configure:
   - API Key: Enter your Together AI API key
   - Model: Select from available models (Mixtral, Llama 2, etc.)
4. Click "Save Configuration"

### AI Features

When enabled, AI processing can:

1. **Summarize Transcripts**: Generate concise summaries of meeting discussions
2. **Extract Action Items**: Automatically identify tasks, assignments, and deadlines
3. **Process Meeting-Specific Content**: Generate specialized content based on meeting type:
   - For stand-ups: Organize updates into completed work, planned work, and blockers
   - For retrospectives: Categorize feedback into what went well and areas for improvement
   - For training: Extract key learning points and follow-up actions

## Troubleshooting

### Docker Issues

- **Ollama not available**: Ensure the Ollama container is running with `docker ps`. If not, restart with `docker-compose up -d ollama`.
- **Application not starting**: Check logs with `docker-compose logs app`.

### AI Processing Issues

- **Ollama connection error**: Ensure Ollama is running and the server URL is correct.
- **API key errors**: Verify your API keys are entered correctly.
- **Processing timeout**: For large transcripts, try using a smaller model or processing only part of the transcript.

## Adding More AI Providers

The application is designed to be extensible. To add more AI providers:

1. Create a new provider class that implements the AIProvider interface
2. Register the provider in the AI provider factory
3. Update the UI to include the new provider option

## Security Notes

- API keys are stored in the browser's localStorage and are not sent to any server except the respective AI provider
- For production use, consider implementing server-side API key storage with proper encryption
- When using Docker, ensure your ports are not exposed to the public internet

## Support and Feedback

For issues, questions, or feedback, please open an issue in the GitHub repository or contact the development team.
