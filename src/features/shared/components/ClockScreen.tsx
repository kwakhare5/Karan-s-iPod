import React, { useState, useEffect } from 'react';
import { StatusBar } from './StatusBar';
import { ClockSettings } from '@shared/types';

interface ClockScreenProps {
  settings: ClockSettings;
  onExit: () => void;
  isPlaying?: boolean;
  hasActiveTrack?: boolean;
}

export const ClockScreen: React.FC<ClockScreenProps> = ({
  settings,
  isPlaying = false,
  hasActiveTrack = false,
}) => {
  const [now, setNow] = useState(new Date());

  // Time Ticker
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateString = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="w-full h-full bg-white flex flex-col relative overflow-hidden">
      <StatusBar
        title="Clock"
        theme="light"
        isPlaying={isPlaying}
        hasActiveTrack={hasActiveTrack}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white animate-in fade-in duration-500">
        <div className="flex flex-col items-center">
          {/* Main Time Display */}
          <div className="flex items-baseline mb-2">
            <span className="text-[82px] font-bold tracking-[-0.05em] text-[#3a3a3c] leading-none font-sans">
              {settings.is24Hour
                ? now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
                : now
                    .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
                    .replace(/AM|PM/, '')
                    .trim()}
            </span>
            {!settings.is24Hour && (
              <span className="text-2xl font-semibold text-[#8e8e93] ml-2 uppercase tracking-wide font-sans">
                {now.getHours() >= 12 ? 'PM' : 'AM'}
              </span>
            )}
          </div>

          {/* Elegant Date Subtitle */}
          <div className="text-lg font-medium text-[#8e8e93] tracking-tight opacity-80 font-sans">
            {dateString}
          </div>
        </div>
      </div>
    </div>
  );
};
