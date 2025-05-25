'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileUploader } from '@/components/file-uploader'
import { TemplateSelector } from '@/components/template-selector'
import { getAvailableAIProviders } from '@/lib/ai-transcript-processor'
import { parseTranscript } from '@/lib/transcript-processor'

export default function Home() {
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedTranscript, setUploadedTranscript] = useState<File | null>(null)
  const [isGuest, setIsGuest] = useState(true)
  const [outputFormat, setOutputFormat] = useState('pdf')
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiProviders, setAiProviders] = useState<any[]>([])
  const [selectedAiProvider, setSelectedAiProvider] = useState('none')
  const [activeTab, setActiveTab] = useState('video')
  const router = useRouter()

  useEffect(() => {
    // Get available AI providers
    const providers = getAvailableAIProviders();
    setAiProviders(providers);
    
    // Check if we have a stored provider selection
    const storedProviderId = localStorage.getItem('selected_ai_provider');
    if (storedProviderId) {
      setSelectedAiProvider(storedProviderId);
    }
    
    // Check if we're returning from processing page and have stored data
    const storedTemplate = sessionStorage.getItem('testTemplateId');
    const storedOutputFormat = sessionStorage.getItem('testOutputFormat');
    const storedActiveTab = sessionStorage.getItem('activeTab');
    const storedTranscriptFile = sessionStorage.getItem('uploadedTranscriptFile');
    const storedTranscriptFileName = sessionStorage.getItem('uploadedTranscriptFileName');
    const storedTranscriptFileType = sessionStorage.getItem('uploadedTranscriptFileType');
    const storedTranscriptFileSize = sessionStorage.getItem('uploadedTranscriptFileSize');
    
    // Restore template selection if available
    if (storedTemplate) {
      setSelectedTemplate(storedTemplate);
    }
    
    // Restore output format if available
    if (storedOutputFormat) {
      setOutputFormat(storedOutputFormat);
    }
    
    // Restore active tab if available
    if (storedActiveTab) {
      setActiveTab(storedActiveTab);
    }
    
    // Restore transcript file if available
    if (storedTranscriptFile && storedTranscriptFileName && storedTranscriptFileType && storedTranscriptFileSize) {
      try {
        // Create a new File object from the stored data
        const fileSize = parseInt(storedTranscriptFileSize, 10);
        const fileContent = new Blob([storedTranscriptFile], { type: storedTranscriptFileType });
        const file = new File([fileContent], storedTranscriptFileName, { 
          type: storedTranscriptFileType,
          lastModified: new Date().getTime()
        });
        
        setUploadedTranscript(file);
      } catch (error) {
        console.error('Error restoring transcript file:', error);
      }
    }
  }, []);

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template)
  }

  const handleFileUpload = (file: File | null) => {
    setUploadedFile(file)
  }

  const handleTranscriptUpload = (file: File | null) => {
    setUploadedTranscript(file)
    
    // Store the uploaded transcript file in sessionStorage for persistence
    if (file) {
      // Read the file content and store it
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          const content = e.target.result as string;
          console.log('Storing transcript file in sessionStorage:', file.name);
          sessionStorage.setItem('uploadedTranscriptFile', content);
          sessionStorage.setItem('uploadedTranscriptFileName', file.name);
          sessionStorage.setItem('uploadedTranscriptFileType', file.type);
          sessionStorage.setItem('uploadedTranscriptFileSize', file.size.toString());
          
          // Pre-parse the transcript to ensure it's valid
          try {
            parseTranscript(content, file.name)
              .then(parsedTranscript => {
                console.log('Pre-parsed transcript successfully');
                // Store the parsed transcript directly to avoid parsing issues later
                sessionStorage.setItem('testTranscript', JSON.stringify(parsedTranscript));
              })
              .catch(err => {
                console.error('Error pre-parsing transcript:', err);
              });
          } catch (err) {
            console.error('Error during pre-parse attempt:', err);
          }
        }
      };
      reader.readAsText(file);
    } else {
      // Clear stored file if removed
      sessionStorage.removeItem('uploadedTranscriptFile');
      sessionStorage.removeItem('uploadedTranscriptFileName');
      sessionStorage.removeItem('uploadedTranscriptFileType');
      sessionStorage.removeItem('uploadedTranscriptFileSize');
      sessionStorage.removeItem('testTranscript');
    }
  }

  const handleGenerateClick = async () => {
    if (!selectedTemplate || (!uploadedFile && !uploadedTranscript)) {
      alert('Please select a template and upload at least one file');
      return;
    }

    setIsProcessing(true);

    try {
      // Process the actual uploaded transcript file
      if (uploadedTranscript) {
        const transcriptContent = await uploadedTranscript.text();
        
        // Parse the transcript content based on file type and name
        const processedTranscript = await parseTranscript(transcriptContent, uploadedTranscript.name);
        
        // Store the processed transcript in sessionStorage
        console.log('Storing processed transcript in sessionStorage');
        sessionStorage.setItem('testTranscript', JSON.stringify(processedTranscript));
      }
      
      // Store template and output format
      sessionStorage.setItem('testTemplateId', selectedTemplate);
      sessionStorage.setItem('testOutputFormat', outputFormat);
      sessionStorage.setItem('selectedAiProvider', selectedAiProvider);
      sessionStorage.setItem('activeTab', activeTab);
      
      // Navigate to the processing page
      router.push('/processing');
    } catch (error) {
      console.error('Error processing files:', error);
      alert('An error occurred while processing the files. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Generate Meeting Minutes</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Select Template</h2>
            <TemplateSelector onSelect={handleTemplateSelect} selectedTemplate={selectedTemplate} />
          </Card>
          
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">AI Processing</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select AI Provider</label>
                <select
                  value={selectedAiProvider}
                  onChange={(e) => setSelectedAiProvider(e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  {aiProviders.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name} {provider.isConfigured ? '(Configured)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="summarize" 
                    defaultChecked 
                  />
                  <label htmlFor="summarize">Generate meeting summary</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="actionItems" 
                    defaultChecked 
                  />
                  <label htmlFor="actionItems">Extract action items</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="meetingSpecific" 
                    defaultChecked 
                  />
                  <label htmlFor="meetingSpecific">Process meeting-specific content</label>
                </div>
              </div>
              
              <div className="mt-2">
                <a 
                  href="/ai-config" 
                  className="text-sm text-primary hover:underline"
                >
                  Configure AI Providers
                </a>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="video">Video + Transcript</TabsTrigger>
                <TabsTrigger value="video-only">Video Only</TabsTrigger>
                <TabsTrigger value="transcript-only">Transcript Only</TabsTrigger>
              </TabsList>
              
              <TabsContent value="video" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-md font-medium mb-2">Upload Video (MP4)</h3>
                    <FileUploader 
                      accept=".mp4" 
                      onFileUpload={handleFileUpload} 
                      label="Drag & drop your MP4 file or click to browse" 
                    />
                  </div>
                  <div>
                    <h3 className="text-md font-medium mb-2">Upload Transcript (Optional)</h3>
                    <FileUploader 
                      accept=".txt,.vtt,.srt,.doc,.docx" 
                      onFileUpload={handleTranscriptUpload} 
                      label="Drag & drop your transcript file or click to browse" 
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="video-only" className="space-y-4">
                <div>
                  <h3 className="text-md font-medium mb-2">Upload Video (MP4)</h3>
                  <FileUploader 
                    accept=".mp4" 
                    onFileUpload={handleFileUpload} 
                    label="Drag & drop your MP4 file or click to browse" 
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    You'll be prompted to identify speakers during processing.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="transcript-only" className="space-y-4">
                <div>
                  <h3 className="text-md font-medium mb-2">Upload Transcript</h3>
                  <FileUploader 
                    accept=".txt,.vtt,.srt,.doc,.docx" 
                    onFileUpload={handleTranscriptUpload} 
                    label="Drag & drop your transcript file or click to browse"
                    initialFile={uploadedTranscript}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </Card>
          
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Output Format</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  id="pdf" 
                  name="format" 
                  value="pdf" 
                  checked={outputFormat === 'pdf'}
                  onChange={() => setOutputFormat('pdf')}
                />
                <label htmlFor="pdf">PDF</label>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  id="word" 
                  name="format" 
                  value="docx"
                  checked={outputFormat === 'docx'}
                  onChange={() => setOutputFormat('docx')}
                />
                <label htmlFor="word">Word</label>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  id="html" 
                  name="format" 
                  value="html"
                  checked={outputFormat === 'html'}
                  onChange={() => setOutputFormat('html')}
                />
                <label htmlFor="html">HTML</label>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  id="text" 
                  name="format" 
                  value="txt"
                  checked={outputFormat === 'txt'}
                  onChange={() => setOutputFormat('txt')}
                />
                <label htmlFor="text">Plain Text</label>
              </div>
            </div>
          </Card>
          
          <div className="mt-6 flex justify-end">
            <button 
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md disabled:opacity-50"
              disabled={!selectedTemplate || (!uploadedFile && !uploadedTranscript) || isProcessing}
              onClick={handleGenerateClick}
            >
              {isProcessing ? 'Processing...' : 'Generate Minutes'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">1. Select Template</h3>
            <p>Choose from various meeting templates including regular meetings, agile ceremonies, and training sessions.</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">2. Upload Files</h3>
            <p>Upload your Microsoft Teams recording (MP4) and/or transcript files. The system will process them automatically.</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">3. Generate & Download</h3>
            <p>Review the generated minutes, make any necessary edits, and download in your preferred format.</p>
          </Card>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Currently in {isGuest ? "Guest Mode" : "Authenticated Mode"} • 
          <button className="text-primary hover:underline ml-1" onClick={() => setIsGuest(!isGuest)}>
            {isGuest ? "Login" : "Switch to Guest Mode"}
          </button>
        </p>
      </div>
    </div>
  )
}
