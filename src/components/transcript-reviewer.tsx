import React from 'react';

interface TranscriptSegment {
  speaker: string; // Original speaker ID (e.g., "Speaker 1") or assigned name
  start_time: number;
  end_time: number;
  text: string;
}

interface TranscriptReviewerProps {
  segments: TranscriptSegment[];
  speakerNameMap: Record<string, string>; // To display assigned names
  onSegmentEdit?: (index: number, newText: string) => void; // Optional: for editing text
  onSpeakerReassign?: (index: number, newSpeakerId: string) => void; // Optional: for reassigning speaker
}

const TranscriptReviewer: React.FC<TranscriptReviewerProps> = ({ segments, speakerNameMap, onSegmentEdit, onSpeakerReassign }) => {
  if (!segments || segments.length === 0) {
    return <p className="text-sm text-gray-500">No transcript segments available for review.</p>;
  }

  return (
    <div className="my-4 p-4 border border-gray-200 rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">Review Transcript</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {segments.map((segment, index) => {
          const displayName = speakerNameMap[segment.speaker] || segment.speaker;
          return (
            <div key={index} className="p-3 border-b border-gray-100 hover:bg-gray-50 rounded-md">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full w-28 text-center inline-block truncate" title={displayName}>
                    {displayName}
                  </span>
                  <p className="text-xs text-gray-400 mt-1 text-center">
                    {segment.start_time.toFixed(2)}s - {segment.end_time.toFixed(2)}s
                  </p>
                </div>
                <div className="flex-grow">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{segment.text}</p>
                  {/* Placeholder for playback button */}
                  {/* <button className="mt-1 text-xs text-blue-500 hover:underline">Play Segment Audio</button> */}
                </div>
                {/* Optional: Add editing and reassigning controls here if needed */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TranscriptReviewer;

