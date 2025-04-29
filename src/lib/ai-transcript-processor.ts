import { AIProvider, AIProviderFactory } from './ai-providers/ai-provider';
import { OllamaProvider } from './ai-providers/ollama-provider';
import { OpenAIProvider } from './ai-providers/openai-provider';
import { TogetherAIProvider } from './ai-providers/together-provider';
import { ProcessedTranscript, Speaker, TranscriptSegment } from './transcript-processor';

// Register all providers
export function registerAIProviders() {
  // Register providers if not already registered
  if (AIProviderFactory.getAllProviders().length <= 1) { // Only NoAI provider is registered by default
    AIProviderFactory.registerProvider(new OllamaProvider());
    AIProviderFactory.registerProvider(new OpenAIProvider());
    AIProviderFactory.registerProvider(new TogetherAIProvider());
  }
}

// Initialize providers with API keys
export function initializeProviders(openaiKey?: string, togetherKey?: string) {
  registerAIProviders();
  
  // Configure OpenAI if key is provided
  if (openaiKey) {
    const openaiProvider = AIProviderFactory.getProvider('openai');
    if (openaiProvider) {
      openaiProvider.configure({ apiKey: openaiKey });
    }
  }
  
  // Configure Together AI if key is provided
  if (togetherKey) {
    const togetherProvider = AIProviderFactory.getProvider('together');
    if (togetherProvider) {
      togetherProvider.configure({ apiKey: togetherKey });
    }
  }
}

// Enhanced transcript processing with AI
export interface AIProcessingOptions {
  providerId: string;
  summarize: boolean;
  extractActionItems: boolean;
  processMeetingSpecific: boolean;
  meetingType: string;
}

export interface AIProcessingResult {
  summary: string;
  actionItems: string[];
  meetingSpecificContent: any;
}

export async function processTranscriptWithAI(
  transcript: ProcessedTranscript,
  options: AIProcessingOptions
): Promise<AIProcessingResult> {
  // Get the selected provider
  const provider = AIProviderFactory.getProvider(options.providerId);
  
  if (!provider) {
    throw new Error(`AI provider ${options.providerId} not found`);
  }
  
  if (!provider.isConfigured || !provider.isAvailable) {
    throw new Error(`AI provider ${provider.name} is not configured or available`);
  }
  
  // Convert transcript to plain text for AI processing
  const plainText = convertTranscriptToPlainText(transcript);
  
  // Process with AI in parallel
  const [summary, actionItems, meetingSpecificContent] = await Promise.all([
    options.summarize ? provider.summarizeTranscript(plainText) : Promise.resolve(''),
    options.extractActionItems ? provider.extractActionItems(plainText) : Promise.resolve([]),
    options.processMeetingSpecific ? provider.processMeetingSpecific(plainText, options.meetingType) : Promise.resolve({})
  ]);
  
  return {
    summary,
    actionItems,
    meetingSpecificContent
  };
}

// Helper function to convert transcript to plain text
function convertTranscriptToPlainText(transcript: ProcessedTranscript): string {
  let plainText = '';
  
  for (const segment of transcript.segments) {
    const speaker = transcript.speakers.find(s => s.id === segment.speakerId);
    plainText += `${speaker?.name || 'Unknown'}: ${segment.text}\n\n`;
  }
  
  return plainText;
}

// Get available AI providers
export function getAvailableAIProviders(): AIProvider[] {
  registerAIProviders();
  return AIProviderFactory.getAllProviders();
}

// Configure an AI provider
export function configureAIProvider(providerId: string, config: any): boolean {
  const provider = AIProviderFactory.getProvider(providerId);
  
  if (!provider) {
    return false;
  }
  
  try {
    provider.configure(config);
    return provider.isConfigured;
  } catch (error) {
    console.error(`Error configuring provider ${providerId}:`, error);
    return false;
  }
}
