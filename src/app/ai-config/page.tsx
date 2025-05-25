'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AIProvider } from '@/lib/ai-providers/ai-provider'
import { getAvailableAIProviders, configureAIProvider } from '@/lib/ai-transcript-processor'

interface AIProviderConfigProps {
  providers: AIProvider[]
  selectedProviderId: string
  onSelectProvider: (providerId: string) => void
  onConfigureProvider: (providerId: string, config: any) => void
}

function AIProviderConfig({
  providers,
  selectedProviderId,
  onSelectProvider,
  onConfigureProvider
}: AIProviderConfigProps) {
  const [configValues, setConfigValues] = useState<Record<string, Record<string, any>>>({})

  const handleProviderSelect = (providerId: string) => {
    onSelectProvider(providerId)
  }

  const handleConfigChange = (providerId: string, fieldId: string, value: any) => {
    setConfigValues(prev => ({
      ...prev,
      [providerId]: {
        ...(prev[providerId] || {}),
        [fieldId]: value
      }
    }))
  }

  const handleSaveConfig = (providerId: string) => {
    const config = configValues[providerId] || {}
    onConfigureProvider(providerId, config)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">AI Provider Configuration</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Select AI Provider</label>
          <select
            value={selectedProviderId}
            onChange={(e) => handleProviderSelect(e.target.value)}
            className="w-full p-2 border rounded-md bg-background"
          >
            {providers.map(provider => (
              <option key={provider.id} value={provider.id}>
                {provider.name} {provider.isConfigured ? '(Configured)' : ''}
              </option>
            ))}
          </select>
        </div>

        {providers.map(provider => (
          <div
            key={provider.id}
            className={`border rounded-md p-4 ${selectedProviderId === provider.id ? 'border-primary' : ''}`}
            style={{ display: selectedProviderId === provider.id ? 'block' : 'none' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">{provider.name}</h3>
              <div className={`px-2 py-1 text-xs rounded-full ${provider.isConfigured ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {provider.isConfigured ? 'Configured' : 'Not Configured'}
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">{provider.description}</p>

            {provider.id !== 'none' && (
              <>
                <div className="space-y-4 mb-4">
                  {provider.getConfigFields().map(field => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium mb-1">
                        {field.name}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>

                      {field.type === 'select' ? (
                        <select
                          value={(configValues[provider.id]?.[field.id] || '')}
                          onChange={(e) => handleConfigChange(provider.id, field.id, e.target.value)}
                          className="w-full p-2 border rounded-md bg-background"
                        >
                          {field.options?.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={(configValues[provider.id]?.[field.id] || '')}
                          onChange={(e) => handleConfigChange(provider.id, field.id, e.target.value)}
                          placeholder={`Enter ${field.name.toLowerCase()}`}
                          className="w-full p-2 border rounded-md bg-background"
                        />
                      )}

                      {field.description && (
                        <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSaveConfig(provider.id)}
                  className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
                >
                  Save Configuration
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">AI Processing Options</h3>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="summarize" defaultChecked />
            <label htmlFor="summarize">Generate meeting summary</label>
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="actionItems" defaultChecked />
            <label htmlFor="actionItems">Extract action items</label>
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="meetingSpecific" defaultChecked />
            <label htmlFor="meetingSpecific">Process meeting-specific content</label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  const [providers, setProviders] = useState<AIProvider[]>([])
  const [selectedProviderId, setSelectedProviderId] = useState<string>('none')
  
  // Initialize providers on component mount
  useState(() => {
    const availableProviders = getAvailableAIProviders()
    setProviders(availableProviders)

    // Check if we have a stored provider selection
    const storedProviderId = localStorage.getItem('selected_ai_provider')
    if (storedProviderId) {
      setSelectedProviderId(storedProviderId)
    }
  })

  const handleSelectProvider = (providerId: string) => {
    setSelectedProviderId(providerId)
    localStorage.setItem('selected_ai_provider', providerId)
  }

  const handleConfigureProvider = (providerId: string, config: any) => {
    const success = configureAIProvider(providerId, config)

    if (success) {
      // Update providers list to reflect configuration status
      const updatedProviders = getAvailableAIProviders()
      setProviders(updatedProviders)

      alert(`${providerId} provider configured successfully!`)
    } else {
      alert(`Failed to configure ${providerId} provider. Please check your settings.`)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">AI Configuration</h1>

      <Card className="p-6">
        <AIProviderConfig
          providers={providers}
          selectedProviderId={selectedProviderId}
          onSelectProvider={handleSelectProvider}
          onConfigureProvider={handleConfigureProvider}
        />
      </Card>
    </div>
  )
}