import React from 'react';

interface BootScreenProps {
  status: string;
}

export const BootScreen: React.FC<BootScreenProps> = ({ status }) => (
  <div className="w-full h-full bg-[#1a1a1a] flex flex-col items-center justify-center gap-6">
    <img src="/apple_logo.png" alt="Apple Logo" className="w-24 h-24 object-contain" />
    {status && (
      <div className="text-white/40 text-xs font-mono tracking-widest animate-pulse uppercase">
        {status}
      </div>
    )}
  </div>
);
