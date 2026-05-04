import React from 'react';
import { StatusBar } from '@shared/components/StatusBar';

interface LocationPickerProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isPlaying: boolean;
  hasActiveTrack: boolean;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  onSave,
  onCancel,
  isPlaying,
  hasActiveTrack,
}) => {
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <StatusBar
        title="Set Location"
        isPlaying={isPlaying}
        hasActiveTrack={hasActiveTrack}
        theme="light"
      />
      <div className="flex-1 flex flex-col justify-center p-4">
        <input
          className="border p-2 rounded w-full text-black mb-4"
          placeholder="City Name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSave();
          }}
          autoFocus
        />
        <div className="flex gap-2">
          <button onClick={onCancel} className="bg-gray-300 text-black p-2 rounded flex-1">
            Cancel
          </button>
          <button
            onClick={onSave}
            className="bg-blue-500 text-white p-2 rounded flex-1"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
