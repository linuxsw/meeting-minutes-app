import { AIProvider, AIProviderConfigField } from './ai-provider';

export class OpenAIProvider implements AIProvider {
  id = 'openai';
  name = 'OpenAI';
  description = 'OpenAI API (GPT models)';
  isConfigured = false;
  isAvailable = false;
  
  private apiKey: string = '';
  private model: string = 'gpt-3.5-turbo';
  
  constructor() {
    // Check if we have stored configuration
    const storedConfig = typeof localStorage !== 'undefined' 
      ? localStorage.getItem('openai_config') 
      : null;
      
    if (storedConfig) {
      const config = JSON.parse(storedConfig);
      this.configure(config);
    }
  }
  
  async summarizeTranscript(transcript: string): Promise<string> {
    if (!this.isConfigured || !this.isAvailable) {
      throw new Error('OpenAI is not configured or available');
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
      throw new Error('OpenAI is not configured or available');
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
      throw new Error('OpenAI is not configured or available');
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
      localStorage.setItem('openai_config', JSON.stringify({
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
        description: 'Your OpenAI API key',
        required: true
      },
      {
        id: 'model',
        name: 'Model',
        type: 'select',
        description: 'AI model to use',
        required: true,
        options: [
          { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
          { value: 'gpt-4', label: 'GPT-4' },
          { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' }
        ]
      }
    ];
  }
  
  private async generateCompletion(prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant that helps analyze meeting transcripts and generate meeting minutes.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating completion with OpenAI:', error);
      throw error;
    }
  }
}
