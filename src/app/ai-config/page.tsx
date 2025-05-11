import React, { useState, useEffect } from 'react';

// Assuming this is the structure based on typical Next.js app router pages

const AiConfigPage = () => {
  // Placeholder for actual AI provider selection logic
  // For this task, we'll just add a static warning message.
  // In a real scenario, this would be dynamic based on user selection.

  const [selectedProvider, setSelectedProvider] = useState(''); // Example state

  return (
    <div>
      <h1>AI Provider Configuration</h1>
      <p>Select your preferred AI provider for enhanced meeting minute features.</p>

      {/* Placeholder for actual selection UI elements */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="ai-provider-select">Choose an AI Provider:</label>
        <select 
          id="ai-provider-select"
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
          style={{ marginLeft: '10px', padding: '5px' }}
        >
          <option value="">--Select Provider--</option>
          <option value="ollama">Ollama (Local)</option>
          <option value="openai">OpenAI (Cloud)</option>
          <option value="togetherai">Together AI (Cloud)</option>
          <option value="none">No AI (Disable Enhancements)</option>
        </select>
      </div>

      {(selectedProvider === 'openai' || selectedProvider === 'togetherai') && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', backgroundColor: '#f8f8f8' }}>
          <h3 style={{ color: 'orange' }}>Privacy & IP Notice</h3>
          <p>
            <strong>Warning:</strong> You have selected a cloud-based AI provider ({selectedProvider === 'openai' ? 'OpenAI' : 'Together AI'}). 
            Please be aware that when using this service for enhancements like summarization or action item extraction, 
            your transcript data will be sent to and processed by this third-party service.
          </p>
          <p>
            We recommend reviewing their specific privacy policies and terms of service before proceeding if you have concerns 
            about data confidentiality or intellectual property. For processing that remains entirely within your local environment, 
            consider using locally hosted AI options (if available and configured for such tasks) or the "No AI" option for generating minutes without these enhancements.
          </p>
          <p>
            For more general information, please refer to our application's IP and Privacy guide (typically found in the README or a dedicated privacy section).
          </p>
        </div>
      )}

      {(selectedProvider === 'ollama') && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', backgroundColor: '#f0fff0' }}>
          <h3 style={{ color: 'green' }}>Privacy Information</h3>
          <p>
            You have selected Ollama. If this instance is self-hosted, your data remains within your local infrastructure during processing for enhancements.
          </p>
        </div>
      )}

      {/* Add other configuration options here */}
    </div>
  );
};

export default AiConfigPage;

