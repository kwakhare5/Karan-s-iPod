import React from 'react';
import { useClickWheel } from '../../hooks/useClickWheel';
import { SkipBack, SkipForward, Play, Pause } from 'lucide-react';

interface ClickWheelProps {
  onScroll: (direction: 'cw' | 'ccw') => void;
  onMenu: () => void;
  onSelect: () => void;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  enabled?: boolean;
}

export const ClickWheel = React.memo<ClickWheelProps>(
  ({ onScroll, onMenu, onSelect, onPlayPause, onNext, onPrev, enabled = true }) => {
    const { wheelRef, handleMouseDown, handleTouchStart } = useClickWheel({
      onScroll,
      onSelect,
      onBack: onMenu,
      onForward: onNext,
      enabled,
    });

    // Colors from spec
    // Wheel dimensions - rounded to whole numbers for stability
    const WHEEL_SIZE = 250;
    const CENTER_SIZE = 92;

    // Common button styles
    const buttonStyle =
      'absolute z-10 flex items-center justify-center transition-all duration-75 outline-none touch-manipulation cursor-pointer active:scale-95';

    return (
      <div
        ref={wheelRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="relative select-none rounded-full"
        style={{
          width: `${WHEEL_SIZE}px`,
          height: `${WHEEL_SIZE}px`,
          pointerEvents: 'auto',
          touchAction: 'none',
        }}
      >
        {/* The Wheel Surface (Background) */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden transition-all"
          style={{
            background: '#F6FAFB',
            boxShadow:
              '0px 1px 2px rgba(0,0,0,0.1), 0px 4px 8px rgba(0,0,0,0.08), 0px 8px 16px rgba(0,0,0,0.06)',
          }}
        ></div>

        {/* MENU (Top) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMenu();
          }}
          className={`${buttonStyle} left-1/2 -translate-x-1/2`}
          style={{
            top: '20px',
            width: '64px',
            height: '40px',
            color: 'var(--apple-gray)',
          }}
        >
          <span
            style={{
              fontSize: '15px',
              fontWeight: 'var(--font-weight-bold)',
              letterSpacing: '0.05em',
            }}
          >
            MENU
          </span>
        </button>

        {/* PREV (Left) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className={`${buttonStyle} top-1/2 -translate-y-1/2`}
          style={{
            left: '18px',
            width: '48px',
            height: '48px',
            color: 'var(--apple-gray)',
          }}
        >
          <SkipBack
            size={22}
            fill="currentColor"
          />
        </button>

        {/* NEXT (Right) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className={`${buttonStyle} top-1/2 -translate-y-1/2`}
          style={{
            right: '18px',
            width: '48px',
            height: '48px',
            color: 'var(--apple-gray)',
          }}
        >
          <SkipForward
            size={22}
            fill="currentColor"
          />
        </button>

        {/* PLAY/PAUSE (Bottom) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlayPause();
          }}
          className={`${buttonStyle} left-1/2 -translate-x-1/2 items-center gap-1`}
          style={{
            bottom: '20px',
            width: '64px',
            height: '32px',
            color: 'var(--apple-gray)',
          }}
        >
          <Play size={14} fill="currentColor" />
          <Pause size={14} fill="currentColor" />
        </button>

        {/* CENTER BUTTON (Select) - Inner Circle */}
        <button
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full z-30 transition-all duration-75 active:scale-90 active:brightness-90 outline-none cursor-pointer"
          style={{
            width: `${CENTER_SIZE}px`,
            height: `${CENTER_SIZE}px`,
            background: 'linear-gradient(135deg, #E8E8E8 0%, #D1D1D1 100%)',
            boxShadow: 'inset 0px 1px 2px rgba(255,255,255,0.8), 0px 1px 3px rgba(0,0,0,0.1)',
            border: 'none',
          }}
          aria-label="Select"
        />
      </div>
    );
  },
);
