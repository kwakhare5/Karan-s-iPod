import React, { useRef, useEffect } from 'react';
import { MenuItem } from '../../types';
import { StatusBar } from '../core/StatusBar';
import { ChevronRight } from 'lucide-react';

interface MenuScreenProps {
  title: string;
  items: MenuItem[];
  selectedIndex: number;
  isPlaying: boolean;
  hasActiveTrack?: boolean;
  onItemClick?: (index: number) => void;
  footer?: React.ReactNode;
  hideTitle?: boolean;
}

export const MenuScreen: React.FC<MenuScreenProps> = React.memo(
  ({
    title,
    items,
    selectedIndex,
    isPlaying,
    hasActiveTrack = false,
    onItemClick,
    footer,
    hideTitle = false,
  }) => {
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const prevSelectedIndex = useRef<number>(selectedIndex);
    const isUserScrolling = useRef(false);

    // Handle direct user scroll on the container (touch/mouse scroll)
    useEffect(() => {
      const container = scrollContainerRef.current;
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

    // Auto-scroll only when selectedIndex changes from non-user-scroll AND item is out of view
    useEffect(() => {
      const container = scrollContainerRef.current;
      const selectedItem = itemRefs.current[selectedIndex];

      if (!container || !selectedItem) return;

      // Skip auto-scroll if user is actively scrolling
      if (isUserScrolling.current) {
        prevSelectedIndex.current = selectedIndex;
        return;
      }

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

      prevSelectedIndex.current = selectedIndex;
    }, [selectedIndex]);

    return (
      <div className="w-full h-full bg-white flex flex-col">
        {!hideTitle && (
          <StatusBar
            title={title}
            isPlaying={isPlaying}
            hasActiveTrack={hasActiveTrack}
            theme="light"
          />
        )}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto ipod-scrollbar py-0">
            {items.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  onClick={() => onItemClick && onItemClick(index)}
                  className={`flex items-center justify-between px-[var(--space-4)] py-[var(--space-2)] min-h-[48px] border-b border-[var(--apple-gray-separator)] cursor-pointer overflow-hidden transition-colors ${
                    isSelected
                      ? 'bg-[var(--state-selected)] text-[var(--apple-white)]'
                      : 'bg-[var(--ipod-bg)] text-[var(--ipod-text)] hover:bg-[var(--state-hover)]'
                  }`}
                >
                  <div
                    className="flex-1 overflow-hidden flex items-center"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <span className="text-[17px] font-[var(--font-weight-semibold)] tracking-[-0.015em] truncate flex-1">
                      {item.label}
                    </span>
                  </div>
                  {item.hasChevron && (
                    <ChevronRight
                      size={20}
                      className={`shrink-0 ml-[var(--space-2)] ${isSelected ? 'text-[var(--apple-white)]' : 'text-[var(--apple-gray-light)]'}`}
                    />
                  )}
                </div>
              );
            })}
            <div className="h-[var(--space-4)] w-full"></div>
          </div>
          {footer && <div className="shrink-0">{footer}</div>}
        </div>
      </div>
    );
  },
);
