import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import SpeakerManager from '@/components/speaker-manager';
import TranscriptReviewer from '@/components/transcript-reviewer';
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import { Input } from '@/components/ui/input'; // Assuming you have an Input component for file upload
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TranscriptSegment {
  speaker: string;
  start_time: number;
  end_time: number;
  text: string;
}

interface AudioProcessingResult {
  language: string;
  segments: TranscriptSegment[];
  full_transcript_debug?: string;
  error?: string;
  details?: string;
}

const ReviewTranscriptPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processingResult, setProcessingResult] = useState<AudioProcessingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speakerNameMap, setSpeakerNameMap] = useState<Record<string, string>>({});

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setProcessingResult(null); // Reset previous results
      setError(null);
      setSpeakerNameMap({});
    }
  };

  const handleProcessAudio = async () => {
    if (!file) {
      setError("Please select an audio file first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setProcessingResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/process-audio", {
        method: "POST",
        body: formData,
      });

      const data: AudioProcessingResult = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || data.details || "Failed to process audio");
      }
      
      setProcessingResult(data);
      // Initialize speakerNameMap with detected speakers
      if (data.segments) {
        const initialDetectedSpeakers = Array.from(new Set(data.segments.map(seg => seg.speaker)));
        const initialMap: Record<string, string> = {};
        initialDetectedSpeakers.forEach(spk => {
          initialMap[spk] = spk; // Initially, display original speaker ID
        });
        setSpeakerNameMap(initialMap);
      }

    } catch (err: any) {
      console.error("Processing error:", err);
      setError(err.message || "An unexpected error occurred during processing.");
      setProcessingResult({ language: '', segments: [], error: err.message }); // Set error in result for display
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakerNameChange = useCallback((speakerId: string, newName: string) => {
    setSpeakerNameMap(prevMap => ({
      ...prevMap,
      [speakerId]: newName,
    }));
  }, []);

  const detectedSpeakers = processingResult?.segments 
    ? Array.from(new Set(processingResult.segments.map(seg => seg.speaker)))
    : [];

  return (
    <>
      <Head>
        <title>Review Transcript - AI Meeting Minutes</title>
      </Head>
      <div className="container mx-auto p-4 md:p-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Process Audio and Review Transcript</CardTitle>
            <CardDescription>
              Upload an audio file to transcribe, identify speakers, and review the transcript.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="audioFile" className="block text-sm font-medium text-gray-700 mb-1">Audio File</label>
              <Input id="audioFile" type="file" accept="audio/*,video/*" onChange={handleFileChange} className="w-full" />
            </div>
            <Button onClick={handleProcessAudio} disabled={!file || isLoading}>
              {isLoading ? "Processing..." : "Process Audio"}
            </Button>
            {error && <p className="text-sm text-red-600">Error: {error}</p>}
          </CardContent>
        </Card>

        {processingResult && (
          <Card>
            <CardHeader>
                <CardTitle>Review and Edit</CardTitle>
                {processingResult.language && <CardDescription>Detected Language: {processingResult.language}</CardDescription>}
            </CardHeader>
            <CardContent>
              {processingResult.error && !processingResult.segments?.length && (
                <p className="text-red-500">Processing failed: {processingResult.error}</p>
              )}
              {processingResult.segments && processingResult.segments.length > 0 && (
                <>
                  <SpeakerManager
                    detectedSpeakers={detectedSpeakers}
                    speakerNameMap={speakerNameMap}
                    onSpeakerNameChange={handleSpeakerNameChange}
                  />
                  <TranscriptReviewer
                    segments={processingResult.segments}
                    speakerNameMap={speakerNameMap}
                  />
                </>
              )}
              {processingResult.full_transcript_debug && (
                <details className="mt-4">
                  <summary className="text-sm text-gray-500 cursor-pointer">View Full Raw Transcript (Debug)</summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">{processingResult.full_transcript_debug}</pre>
                </details>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default ReviewTranscriptPage;

