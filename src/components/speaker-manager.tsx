import React, { useState, useEffect } from 'react';

interface SpeakerManagerProps {
  detectedSpeakers: string[]; // e.g., ["Speaker 1", "Speaker 2"]
  speakerNameMap: Record<string, string>; // e.g., { "Speaker 1": "Alice", "Speaker 2": "Bob" }
  onSpeakerNameChange: (speakerId: string, newName: string) => void;
}

const SpeakerManager: React.FC<SpeakerManagerProps> = ({ detectedSpeakers, speakerNameMap, onSpeakerNameChange }) => {
  const [localSpeakerNames, setLocalSpeakerNames] = useState<Record<string, string>>(speakerNameMap);

  useEffect(() => {
    setLocalSpeakerNames(speakerNameMap);
  }, [speakerNameMap]);

  const handleNameChange = (speakerId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    setLocalSpeakerNames(prev => ({ ...prev, [speakerId]: newName }));
    onSpeakerNameChange(speakerId, newName);
  };

  if (!detectedSpeakers || detectedSpeakers.length === 0) {
    return <p className="text-sm text-gray-500">No speakers detected or transcript not yet processed.</p>;
  }

  return (
    <div className="my-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">Manage Speaker Names</h3>
      <div className="space-y-3">
        {detectedSpeakers.map((speakerId) => (
          <div key={speakerId} className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-600 w-28 truncate" title={speakerId}>{speakerId}:</span>
            <input
              type="text"
              value={localSpeakerNames[speakerId] || ''}
              onChange={(e) => handleNameChange(speakerId, e)}
              placeholder={`Enter name for ${speakerId}`}
              className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {/* Placeholder for audio snippet playback button */}
            {/* <button className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs">Play Snippet</button> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpeakerManager;

