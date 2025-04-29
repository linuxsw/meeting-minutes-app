import { AIProvider, AIProviderConfigField } from './ai-provider';

export class TogetherAIProvider implements AIProvider {
  id = 'together';
  name = 'Together AI';
  description = 'Together AI platform with various open models';
  isConfigured = false;
  isAvailable = false;
  
  private apiKey: string = '';
  private model: string = 'mistralai/Mixtral-8x7B-Instruct-v0.1';
  
  constructor() {
    // Check if we have stored configuration
    const storedConfig = typeof localStorage !== 'undefined' 
      ? localStorage.getItem('together_config') 
      : null;
      
    if (storedConfig) {
      const config = JSON.parse(storedConfig);
      this.configure(config);
    }
  }
  
  async summarizeTranscript(transcript: string): Promise<string> {
    if (!this.isConfigured || !this.isAvailable) {
      throw new Error('Together AI is not configured or available');
    }
    
    const prompt = `
    Please summarize the following meeting transcript concisely, focusing on the main topics discussed, 
    key decisions made, and the overall purpose of the meeting:
    
    ${transcript}
    
    Summary:
    `;
    
    return this.generateCompletion(prompt);
  }
  
  async extractActionItems(transcript: string): Promise<string[]> {
    if (!this.isConfigured || !this.isAvailable) {
      throw new Error('Together AI is not configured or available');
    }
    
    const prompt = `
    Please extract all action items, tasks, and assignments from the following meeting transcript.
    Format each action item on a new line, including who is responsible and any deadlines mentioned:
    
    ${transcript}
    
    Action Items:
    `;
    
    const response = await this.generateCompletion(prompt);
    
    // Split the response into individual action items
    return response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }
  
  async processMeetingSpecific(transcript: string, meetingType: string): Promise<any> {
    if (!this.isConfigured || !this.isAvailable) {
      throw new Error('Together AI is not configured or available');
    }
    
    let prompt = '';
    
    switch (meetingType) {
      case 'standup':
        prompt = `
        Please analyze this daily stand-up meeting transcript and organize the content into three categories:
        1. What was completed yesterday
        2. What is planned for today
        3. Any blockers or issues
        
        For each category, include who said what.
        
        Transcript:
        ${transcript}
        `;
        break;
        
      case 'planning':
        prompt = `
        Please analyze this sprint planning meeting transcript and extract:
        1. Sprint goals
        2. User stories or tasks being planned
        3. Estimates or story points assigned
        4. Team capacity and commitments
        
        Transcript:
        ${transcript}
        `;
        break;
        
      case 'retro':
        prompt = `
        Please analyze this retrospective meeting transcript and organize the content into:
        1. What went well
        2. What didn't go well
        3. Action items for improvement
        
        Transcript:
        ${transcript}
        `;
        break;
        
      case 'training':
        prompt = `
        Please analyze this training session transcript and extract:
        1. Main topics covered
        2. Key learning points
        3. Questions asked and answers provided
        4. Follow-up actions or resources mentioned
        
        Transcript:
        ${transcript}
        `;
        break;
        
      default:
        prompt = `
        Please analyze this meeting transcript and extract:
        1. Main topics discussed
        2. Key decisions made
        3. Action items assigned
        4. Follow-up meetings planned
        
        Transcript:
        ${transcript}
        `;
    }
    
    const response = await this.generateCompletion(prompt);
    
    // Return the structured response
    // In a real implementation, we would parse this into a structured object
    return { content: response };
  }
  
  configure(config: any): void {
    if (config.apiKey) {
      this.apiKey = config.apiKey;
    }
    
    if (config.model) {
      this.model = config.model;
    }
    
    this.isConfigured = !!this.apiKey;
    this.isAvailable = this.isConfigured;
    
    // Store configuration
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('together_config', JSON.stringify({
        apiKey: this.apiKey,
        model: this.model
      }));
    }
  }
  
  getConfigFields(): AIProviderConfigField[] {
    return [
      {
        id: 'apiKey',
        name: 'API Key',
        type: 'password',
        description: 'Your Together AI API key',
        required: true
      },
      {
        id: 'model',
        name: 'Model',
        type: 'select',
        description: 'AI model to use',
        required: true,
        options: [
          { value: 'mistralai/Mixtral-8x7B-Instruct-v0.1', label: 'Mixtral 8x7B' },
          { value: 'meta-llama/Llama-2-70b-chat-hf', label: 'Llama 2 70B' },
          { value: 'togethercomputer/llama-2-7b-chat', label: 'Llama 2 7B' },
          { value: 'togethercomputer/falcon-40b-instruct', label: 'Falcon 40B' }
        ]
      }
    ];
  }
  
  private async generateCompletion(prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.together.xyz/v1/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          max_tokens: 1000,
          temperature: 0.3,
          top_p: 0.7,
          stop: ["<|endoftext|>"]
        })
      });
      
      if (!response.ok) {
        throw new Error(`Together AI API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.choices[0].text;
    } catch (error) {
      console.error('Error generating completion with Together AI:', error);
      throw error;
    }
  }
}
