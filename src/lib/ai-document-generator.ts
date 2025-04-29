'use client'

import { useState, useEffect } from 'react'
import { MeetingTemplate } from './meeting-templates'
import { ProcessedTranscript } from './transcript-processor'
import { MeetingData, GeneratedDocument } from './document-generator'
import { 
  getAvailableAIProviders, 
  processTranscriptWithAI, 
  AIProcessingOptions, 
  AIProcessingResult 
} from './ai-transcript-processor'

export interface AIEnhancedDocumentOptions {
  useAI: boolean;
  providerId: string;
  summarize: boolean;
  extractActionItems: boolean;
  processMeetingSpecific: boolean;
}

// Enhanced document generator with AI capabilities
export async function generateAIEnhancedDocument(
  templateId: string,
  transcript: ProcessedTranscript,
  meetingData: MeetingData,
  format: 'pdf' | 'docx' | 'html' | 'txt',
  aiOptions: AIEnhancedDocumentOptions
): Promise<GeneratedDocument | null> {
  // Import the original document generator
  const { generateMeetingMinutes } = await import('./document-generator');
  
  // If AI is not enabled, use the original document generator
  if (!aiOptions.useAI) {
    return generateMeetingMinutes(templateId, transcript, meetingData, format);
  }
  
  try {
    // Process transcript with AI
    const aiProcessingOptions: AIProcessingOptions = {
      providerId: aiOptions.providerId,
      summarize: aiOptions.summarize,
      extractActionItems: aiOptions.extractActionItems,
      processMeetingSpecific: aiOptions.processMeetingSpecific,
      meetingType: templateId
    };
    
    const aiResult = await processTranscriptWithAI(transcript, aiProcessingOptions);
    
    // Enhance meeting data with AI results
    const enhancedMeetingData: MeetingData = {
      ...meetingData
    };
    
    // Add AI-generated summary if available
    if (aiOptions.summarize && aiResult.summary) {
      enhancedMeetingData.aiSummary = aiResult.summary;
    }
    
    // Add AI-extracted action items if available
    if (aiOptions.extractActionItems && aiResult.actionItems.length > 0) {
      enhancedMeetingData.aiActionItems = aiResult.actionItems;
    }
    
    // Add meeting-specific content if available
    if (aiOptions.processMeetingSpecific && aiResult.meetingSpecificContent) {
      enhancedMeetingData.aiMeetingSpecificContent = aiResult.meetingSpecificContent;
    }
    
    // Generate document with enhanced meeting data
    return generateMeetingMinutes(templateId, transcript, enhancedMeetingData, format);
  } catch (error) {
    console.error('Error generating AI-enhanced document:', error);
    
    // Fallback to original document generator
    return generateMeetingMinutes(templateId, transcript, meetingData, format);
  }
}

// Hook for managing AI provider selection
export function useAIProviderSelection() {
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('none');
  const [aiOptions, setAIOptions] = useState<AIEnhancedDocumentOptions>({
    useAI: false,
    providerId: 'none',
    summarize: true,
    extractActionItems: true,
    processMeetingSpecific: true
  });
  
  useEffect(() => {
    // Get available providers
    const availableProviders = getAvailableAIProviders();
    setProviders(availableProviders);
    
    // Check if we have a stored provider selection
    const storedProviderId = localStorage.getItem('selected_ai_provider');
    if (storedProviderId) {
      setSelectedProviderId(storedProviderId);
      setAIOptions(prev => ({
        ...prev,
        providerId: storedProviderId,
        useAI: storedProviderId !== 'none'
      }));
    }
  }, []);
  
  const selectProvider = (providerId: string) => {
    setSelectedProviderId(providerId);
    setAIOptions(prev => ({
      ...prev,
      providerId,
      useAI: providerId !== 'none'
    }));
    
    // Store selection
    localStorage.setItem('selected_ai_provider', providerId);
  };
  
  const updateAIOptions = (options: Partial<AIEnhancedDocumentOptions>) => {
    setAIOptions(prev => ({
      ...prev,
      ...options
    }));
  };
  
  return {
    providers,
    selectedProviderId,
    aiOptions,
    selectProvider,
    updateAIOptions
  };
}
