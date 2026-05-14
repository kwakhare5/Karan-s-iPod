import React, { useEffect, useRef } from 'react';
import { StatusBar } from '@shared/components/StatusBar';
import { Search, Loader2 } from 'lucide-react';
import { Track } from '@shared/types';

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
        itemTop + itemHeight - containerHeight,
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

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Search Input - Clean iPod Style */}
        <div className="w-full bg-[#FFFFFF] border-b border-[#E5E5E5] px-4 py-2.5 shrink-0 relative z-10">
          <div className="flex items-center bg-[#F2F2F7] rounded-lg h-9">
            <Search size={18} strokeWidth={2.5} className="text-[#8e8e93] ml-3 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search songs..."
              className="w-full h-full px-3 bg-transparent text-[16px] text-black placeholder-[#aeaeb2] focus:outline-none font-semibold"
            />
            {isLoading && (
              <Loader2 size={16} className="animate-spin text-[#007AFF] mr-2.5 shrink-0" />
            )}
            {query && !isLoading && (
              <button
                onClick={() => {
                  onSearch('');
                  inputRef.current?.focus();
                }}
                className="mr-2.5 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Results List */}
        <div
          ref={scrollRef}
          className="w-full flex-1 overflow-y-auto min-h-0 ipod-scrollbar relative z-0 pt-1"
        >
          {results.length > 0 ? (
            <div className="w-full pb-8 divide-y divide-[#E5E5E5]">
              {results.map((track, index) => {
                const active = selectedIndex === index;
                return (
                  <div
                    key={`${track.videoId}-${index}`}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    className={`flex items-center gap-3 px-4 py-2 min-h-[50px] cursor-pointer transition-colors ${active ? 'bg-[#007AFF] text-white' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
                    onClick={() => onSelectResult(track, results)}
                  >
                    <div className="w-10 h-10 rounded bg-gray-200 shrink-0 overflow-hidden shadow-sm border border-black/5">
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
                            p.innerText = '??';
                            target.parentElement.appendChild(p);
                          }
                        }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <div
                        className={`font-semibold text-[16px] tracking-tight truncate leading-tight ${active ? 'text-white' : 'text-black'}`}
                      >
                        {track.title || 'Unknown Song'}
                      </div>
                      <div
                        className={`text-[14px] truncate mt-0.5 ${active ? 'text-white/90' : 'text-[#8e8e93]'}`}
                      >
                        {track.artist || 'Unknown Artist'}{' '}
                        {track.duration > 0 && `• ${formatDuration(track.duration)}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 px-6 text-center h-full pb-20">
              <Search size={48} strokeWidth={1.5} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">Search for songs, artists, or albums</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
