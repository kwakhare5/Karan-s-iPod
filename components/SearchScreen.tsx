import React, { useEffect, useRef } from 'react';
import { StatusBar } from './StatusBar';
import { Search, Loader2 } from 'lucide-react';
import { Track } from '../src/types';

interface SearchScreenProps {
  selectedIndex: number;
  isPlaying: boolean;
  hasActiveTrack: boolean;
  onSelectResult: (track: Track, results: Track[]) => void;
  results: Track[];
  isLoading: boolean;
  onSearch: (query: string) => void;
  query: string; // Add query to props
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
export const SearchScreen: React.FC<SearchScreenProps> = ({
  selectedIndex,
  isPlaying,
  hasActiveTrack,
  onSelectResult,
  results,
  isLoading,
  onSearch,
  query,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isUserScrolling = useRef(false);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Ensure search is triggered if there's a query but no results (e.g., when navigating back)
  useEffect(() => {
    if (query.trim().length >= 2 && results.length === 0) {
      onSearch(query);
    }
  }, [query, results.length, onSearch]);

  // Handle direct user scroll on the container (touch/mouse scroll)
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      isUserScrolling.current = true;
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isUserScrolling.current = false;
      }, 200);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  // Sync scroll with selectedIndex - skip if user is actively scrolling
  useEffect(() => {
    const container = scrollRef.current;
    const selectedItem = itemRefs.current[selectedIndex];

    if (!container || !selectedItem) return;

    // Skip auto-scroll if user is actively scrolling
    if (isUserScrolling.current) return;

    const containerHeight = container.clientHeight;
    const itemTop = selectedItem.offsetTop;
    const itemHeight = selectedItem.offsetHeight;
    const scrollTop = container.scrollTop;

    // Only scroll if item is completely out of view with some margin
    const margin = 10;
    const isItemAboveView = itemTop < scrollTop - margin;
    const isItemBelowView = itemTop + itemHeight > scrollTop + containerHeight + margin;

    if (isItemAboveView) {
      container.scrollTop = Math.max(0, itemTop);
    } else if (isItemBelowView) {
      container.scrollTop = Math.min(
        container.scrollHeight - containerHeight,
        itemTop + itemHeight - containerHeight
      );
    }
  }, [selectedIndex, results.length]);

  return (
    <div className="w-full h-full bg-white flex flex-col">
      <StatusBar
        title="Search"
        isPlaying={isPlaying}
        hasActiveTrack={hasActiveTrack}
        theme="light"
      />

      <div className="flex-1 flex flex-col items-center px-4 pt-3 overflow-hidden">
        {/* Search Input - Compact Styled */}
        <div className="w-full max-w-[280px] relative mb-4 shrink-0">
          <div className="flex items-center bg-gray-100 rounded-xl border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all h-11">
            <Search size={18} className="text-gray-400 ml-3 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search songs..."
              className="w-full h-full px-3 bg-transparent text-base text-gray-800 placeholder-gray-400 focus:outline-none font-semibold"
            />
            {isLoading && (
              <Loader2 size={16} className="animate-spin text-blue-500 mr-2 shrink-0" />
            )}
            {query && !isLoading && (
              <button
                onClick={() => {
                  onSearch('');
                  inputRef.current?.focus();
                }}
                className="mr-3 w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center text-xs hover:bg-gray-400 shrink-0"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Results List */}
        <div ref={scrollRef} className="w-full flex-1 overflow-y-auto min-h-0 ipod-scrollbar pr-1">
          {results.length > 0 ? (
            <div className="w-full pb-4 divide-y divide-gray-50">
              {results.map((track, index) => {
                const active = selectedIndex === index;
                return (
                  <div
                    key={`${track.videoId}-${index}`}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    className={`flex items-center gap-3 p-2 cursor-pointer transition-colors rounded-lg ${active ? 'bg-blue-500 text-white' : 'hover:bg-blue-50'}`}
                    onClick={() => onSelectResult(track, results)}
                  >
                    <div className="w-10 h-10 rounded bg-gray-100 shrink-0 overflow-hidden shadow-sm">
                      <img
                        src={track.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== track.thumbnailUrlBackup && track.thumbnailUrlBackup) {
                            target.src = track.thumbnailUrlBackup;
                          } else if (target.parentElement) {
                            target.style.display = 'none';
                            const p = document.createElement('div');
                            p.className =
                              'w-full h-full flex items-center justify-center text-lg bg-gray-200';
                            p.innerText = '🎵';
                            target.parentElement.appendChild(p);
                          }
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div
                        className={`font-semibold text-sm truncate ${active ? 'text-white' : 'text-gray-900'}`}
                      >
                        {track.title}
                      </div>
                      <div
                        className={`text-xs truncate ${active ? 'text-white/80' : 'text-gray-500'}`}
                      >
                        {track.artist} {track.duration > 0 && `· ${formatDuration(track.duration)}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center mt-12 text-gray-400">
              {!isLoading && <span className="text-sm">Search for music...</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
