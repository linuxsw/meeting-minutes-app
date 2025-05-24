# AI Provider Configuration Guide

## Overview
This document provides detailed instructions for configuring the various AI providers in the Meeting Minutes App. The application supports multiple AI providers for generating meeting minutes, including OpenAI, Together AI, Anthropic Claude, and Ollama.

## Table of Contents
1. [General Configuration Approach](#general-configuration-approach)
2. [OpenAI Configuration](#openai-configuration)
3. [Together AI Configuration](#together-ai-configuration)
4. [Anthropic Claude Configuration](#anthropic-claude-configuration)
5. [Ollama Configuration](#ollama-configuration)
6. [Security Best Practices](#security-best-practices)
7. [Troubleshooting](#troubleshooting)

## General Configuration Approach

The Meeting Minutes App provides two ways to configure AI providers:

### 1. Configuration UI
- The recommended approach for most users
- Access via the "AI Providers" section in the application
- Credentials are stored in browser localStorage
- Settings persist between sessions on the same device

### 2. Direct Code Configuration
- For development or deployment scenarios
- Modify the provider files in `src/lib/ai-providers/`
- Requires rebuilding the application

## OpenAI Configuration

### UI Configuration
1. Navigate to the AI Providers section
2. Select "OpenAI" from the provider list
3. Enter your OpenAI API key
4. Select the desired model (GPT-3.5 Turbo, GPT-4, etc.)
5. Click "Save Configuration"

### Code Configuration
File: `src/lib/ai-providers/openai-provider.ts`

```typescript
// Find this section
private apiKey: string = ''; // User's provided API key - removed for security
private model: string = 'gpt-3.5-turbo';

// Replace with your API key (for development only)
private apiKey: string = process.env.OPENAI_API_KEY || ''; // Use environment variable
private model: string = 'gpt-3.5-turbo';
```

### Required Permissions
- OpenAI API key with access to the desired models
- Billing enabled on your OpenAI account

## Together AI Configuration

### UI Configuration
1. Navigate to the AI Providers section
2. Select "Together AI" from the provider list
3. Enter your Together AI API key
4. Select the desired model
5. Click "Save Configuration"

### Code Configuration
File: `src/lib/ai-providers/together-ai-provider.ts`

```typescript
// Find this section
private apiKey: string = '';
private model: string = 'togethercomputer/llama-2-70b-chat';

// Replace with your API key (for development only)
private apiKey: string = process.env.TOGETHER_AI_KEY || '';
private model: string = 'togethercomputer/llama-2-70b-chat';
```

### Required Permissions
- Together AI API key with access to the desired models

## Anthropic Claude Configuration

### UI Configuration
1. Navigate to the AI Providers section
2. Select "Anthropic Claude" from the provider list
3. Enter your Anthropic API key
4. Select the desired model (Claude 2, Claude Instant, etc.)
5. Click "Save Configuration"

### Code Configuration
File: `src/lib/ai-providers/anthropic-provider.ts`

```typescript
// Find this section
private apiKey: string = '';
private model: string = 'claude-2';

// Replace with your API key (for development only)
private apiKey: string = process.env.ANTHROPIC_API_KEY || '';
private model: string = 'claude-2';
```

### Required Permissions
- Anthropic API key with access to the desired models

## Ollama Configuration

### UI Configuration
1. Navigate to the AI Providers section
2. Select "Ollama" from the provider list
3. Enter your Ollama endpoint URL (typically http://localhost:11434 for local installations)
4. Select the desired model
5. Click "Save Configuration"

### Code Configuration
File: `src/lib/ai-providers/ollama-provider.ts`

```typescript
// Find this section
private endpoint: string = 'http://localhost:11434';
private model: string = 'llama2';

// Replace with your endpoint (for development only)
private endpoint: string = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
private model: string = process.env.OLLAMA_MODEL || 'llama2';
```

### Required Setup
- Ollama installed and running on your local machine or server
- Desired models pulled and available to Ollama

## Security Best Practices

1. **Never commit API keys to version control**
   - Use environment variables or a secure configuration system
   - Add API key files to .gitignore

2. **Use environment variables**
   - Create a `.env` file for local development
   - Add `.env` to your `.gitignore` file
   - Provide a `.env.example` file with placeholders

3. **Implement proper access controls**
   - Restrict API keys to only the necessary permissions
   - Rotate API keys regularly
   - Use separate API keys for development and production

4. **Environment Variable Setup**
   Create a `.env` file in the project root:
   ```
   OPENAI_API_KEY=your_openai_key_here
   TOGETHER_AI_KEY=your_together_ai_key_here
   ANTHROPIC_API_KEY=your_anthropic_key_here
   OLLAMA_ENDPOINT=http://your_ollama_endpoint
   ```

5. **Next.js Environment Variables**
   Update `next.config.js` to include:
   ```javascript
   module.exports = {
     env: {
       OPENAI_API_KEY: process.env.OPENAI_API_KEY,
       TOGETHER_AI_KEY: process.env.TOGETHER_AI_KEY,
       ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
       OLLAMA_ENDPOINT: process.env.OLLAMA_ENDPOINT,
     },
   }
   ```

## Troubleshooting

### API Key Issues
- Verify the API key is correct and has not expired
- Check that billing is enabled for the service
- Ensure the API key has the necessary permissions

### Model Availability
- Confirm the selected model is available in your subscription tier
- Check if the model requires special access or permissions

### Rate Limiting
- If you encounter rate limit errors, implement retry logic with exponential backoff
- Consider upgrading your API tier for higher rate limits

### Connection Issues
- For Ollama, ensure the service is running and accessible
- Check network connectivity and firewall settings

### Testing API Keys
You can test your API keys using the built-in test functionality:
1. Navigate to the AI Providers section
2. Enter your API key
3. Click "Test Connection"
4. The system will verify the key and report any issues
