// AI Provider Interface
export interface AIProvider {
  id: string;
  name: string;
  description: string;
  isConfigured: boolean;
  isAvailable: boolean;
  
  // Core AI capabilities
  summarizeTranscript(transcript: string): Promise<string>;
  extractActionItems(transcript: string): Promise<string[]>;
  processMeetingSpecific(transcript: string, meetingType: string): Promise<any>;
  
  // Configuration
  configure(config: any): void;
  getConfigFields(): AIProviderConfigField[];
}

export interface AIProviderConfigField {
  id: string;
  name: string;
  type: 'text' | 'password' | 'select' | 'number';
  description: string;
  required: boolean;
  options?: { value: string; label: string }[];
}

// AI Provider Factory
export class AIProviderFactory {
  private static providers: Map<string, AIProvider> = new Map();
  
  static registerProvider(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }
  
  static getProvider(id: string): AIProvider | undefined {
    return this.providers.get(id);
  }
  
  static getAllProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }
  
  static getAvailableProviders(): AIProvider[] {
    return Array.from(this.providers.values()).filter(provider => provider.isAvailable);
  }
}

// No AI Provider (fallback option)
export class NoAIProvider implements AIProvider {
  id = 'none';
  name = 'No AI';
  description = 'Process without AI assistance';
  isConfigured = true;
  isAvailable = true;
  
  async summarizeTranscript(transcript: string): Promise<string> {
    return transcript;
  }
  
  async extractActionItems(transcript: string): Promise<string[]> {
    return [];
  }
  
  async processMeetingSpecific(transcript: string, meetingType: string): Promise<any> {
    return {};
  }
  
  configure(config: any): void {
    // No configuration needed
  }
  
  getConfigFields(): AIProviderConfigField[] {
    return [];
  }
}

// Register the No AI provider by default
AIProviderFactory.registerProvider(new NoAIProvider());
