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
      <div className="flex-1 flex flex-col bg-white">
        <div className="flex flex-col border-b border-[#E5E5E5]">
          <div className="flex items-center px-4 py-2 border-b border-[#F2F2F7]">
            <span className="w-20 text-xs font-bold text-[#8e8e93] uppercase">City</span>
            <input
              className="flex-1 bg-transparent py-1 text-[16px] text-black focus:outline-none font-semibold"
              placeholder="e.g. Mumbai, India"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && value) onSave();
              }}
              autoFocus
            />
          </div>
        </div>
        <div className="p-4 flex gap-3 mt-auto mb-4">
          <button
            onClick={onCancel}
            className="flex-1 h-10 rounded-lg bg-gray-100 text-gray-900 font-semibold active:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (value) onSave();
            }}
            className={`flex-1 h-10 rounded-lg font-semibold transition-colors ${
              value
                ? 'bg-[#007AFF] text-white active:bg-blue-600'
                : 'bg-blue-200 text-white cursor-not-allowed'
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
