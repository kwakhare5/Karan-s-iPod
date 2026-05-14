/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { MenuIDs, MenuItem, Track, ClockSettings } from '@shared/types';
import { MenuScreen } from '@features/navigation/components/MenuScreen';
import { ClockScreen } from '@shared/components/ClockScreen';
import { NowPlayingScreen } from '@features/music/components/NowPlayingScreen';
import { SearchScreen } from '@features/music/components/SearchScreen';
import { StatusBar } from '@shared/components/StatusBar';
import { BootScreen } from '@shared/components/BootScreen';
import { NoteEditor } from '@features/extras/components/NoteEditor';
import { LocationPicker } from '@features/settings/components/LocationPicker';
import { Search } from 'lucide-react';

interface ScreenRouterProps {
  isBooting: boolean;
  serverStatus: string;
  navState: any;
  currentMenuItems: MenuItem[];
  selectIndex: (idx: number) => void;
  executeItemAction: (item: MenuItem) => void;
  music: any;
  favorites: any[];
  handlePlayPause: () => void;
  handleToggleLike: () => void;
  globalSearchResults: Track[];
  isGlobalSearchLoading: boolean;
  handleGlobalSearch: (query: string) => void;
  globalSearchQuery: string;
  handleSearchSelect: (track: Track, results: Track[]) => void;
  clockSettings: ClockSettings;
  setClockSettings: React.Dispatch<React.SetStateAction<ClockSettings>>;
  goBack: () => void;
  isEditingContact: boolean;
  contactForm: any;
  setContactForm: any;
  selectedContact: string | null;
  updateContact: any;
  addContact: any;
  isEditingNote: boolean;
  noteForm: any;
  setNoteForm: any;
  selectedNote: string | null;
  updateNote: any;
  addNote: any;
  locationInput: string;
  setLocationInput: (val: string) => void;
  playlistSearchQuery: string;
  setPlaylistSearchQuery: (val: string) => void;
  handlePlaylistSearchSelect: (track: Track) => void;
}

export const ScreenRouter: React.FC<ScreenRouterProps> = ({
  isBooting,
  serverStatus,
  navState,
  currentMenuItems,
  selectIndex,
  executeItemAction,
  music,
  favorites,
  handlePlayPause,
  handleToggleLike,
  globalSearchResults,
  isGlobalSearchLoading,
  handleGlobalSearch,
  globalSearchQuery,
  handleSearchSelect,
  clockSettings,
  setClockSettings,
  goBack,
  isEditingContact,
  contactForm,
  setContactForm,
  selectedContact,
  updateContact,
  addContact,
  isEditingNote,
  noteForm,
  setNoteForm,
  selectedNote,
  updateNote,
  addNote,
  locationInput,
  setLocationInput,
  playlistSearchQuery,
  setPlaylistSearchQuery,
}) => {
  const menuId = navState.currentMenuId;

  if (isBooting) {
    return <BootScreen status={serverStatus} />;
  }

  if (menuId === MenuIDs.NOW_PLAYING && music.currentTrack) {
    return (
      <NowPlayingScreen
        track={music.currentTrack}
        isPlaying={music.isPlaying}
        isLoading={music.isLoading}
        progress={music.progress}
        currentTime={music.currentTime}
        duration={music.duration}
        isShuffled={music.isShuffled}
        repeatMode={music.repeatMode}
        isLiked={favorites.some((f) => f.id === music.currentTrack!.videoId)}
        onTogglePlay={handlePlayPause}
        onToggleShuffle={music.toggleShuffle}
        onToggleRepeat={music.toggleRepeat}
        onToggleLike={handleToggleLike}
        onSeek={music.seekTo}
        volume={music.volume}
        queueIndex={music.queueIndex}
        queueLength={music.queue.length}
      />
    );
  }

  if (menuId === MenuIDs.NOW_PLAYING && !music.currentTrack) {
    return (
      <div className="w-full h-full bg-white flex flex-col">
        <StatusBar title="Now Playing" isPlaying={false} hasActiveTrack={false} theme="light" />
        <div className="flex-1 flex flex-col items-center justify-center bg-[#1c1c1e] text-white/50">
          <div className="text-5xl mb-4">🎵</div>
          <div className="text-sm">No track playing</div>
          <div className="text-xs mt-1">Search for music to start</div>
        </div>
      </div>
    );
  }

  if (menuId === MenuIDs.SEARCH) {
    return (
      <SearchScreen
        selectedIndex={navState.selectedIndex}
        isPlaying={music.isPlaying}
        hasActiveTrack={!!music.currentTrack}
        onSelectResult={handleSearchSelect}
        results={globalSearchResults}
        isLoading={isGlobalSearchLoading}
        onSearch={handleGlobalSearch}
        query={globalSearchQuery}
      />
    );
  }

  if (menuId === MenuIDs.CLOCK) {
    return (
      <ClockScreen
        onExit={goBack}
        settings={clockSettings}
        isPlaying={music.isPlaying}
        hasActiveTrack={!!music.currentTrack}
      />
    );
  }

  if (menuId === MenuIDs.CONTACT_EDIT) {
    return (
      <div className="w-full h-full bg-white flex flex-col">
        <StatusBar
          title={isEditingContact ? 'Edit Contact' : 'New Contact'}
          isPlaying={music.isPlaying}
          hasActiveTrack={!!music.currentTrack}
          theme="light"
        />
        <div className="flex-1 flex flex-col bg-white">
          <div className="flex flex-col border-b border-[#E5E5E5]">
            <div className="flex items-center px-4 py-2 border-b border-[#F2F2F7]">
              <span className="w-20 text-xs font-bold text-[#8e8e93] uppercase">First</span>
              <input
                className="flex-1 bg-transparent py-1 text-[16px] text-black focus:outline-none font-semibold"
                placeholder="Required"
                value={contactForm.firstName}
                onChange={(e) => setContactForm((s: any) => ({ ...s, firstName: e.target.value }))}
              />
            </div>
            <div className="flex items-center px-4 py-2 border-b border-[#F2F2F7]">
              <span className="w-20 text-xs font-bold text-[#8e8e93] uppercase">Last</span>
              <input
                className="flex-1 bg-transparent py-1 text-[16px] text-black focus:outline-none font-semibold"
                placeholder="Optional"
                value={contactForm.lastName}
                onChange={(e) => setContactForm((s: any) => ({ ...s, lastName: e.target.value }))}
              />
            </div>
            <div className="flex items-center px-4 py-2 border-b border-[#F2F2F7]">
              <span className="w-20 text-xs font-bold text-[#8e8e93] uppercase">Phone</span>
              <input
                className="flex-1 bg-transparent py-1 text-[16px] text-black focus:outline-none font-semibold"
                placeholder="Add Phone"
                value={contactForm.phone}
                onChange={(e) => setContactForm((s: any) => ({ ...s, phone: e.target.value }))}
              />
            </div>
            <div className="flex items-center px-4 py-2">
              <span className="w-20 text-xs font-bold text-[#8e8e93] uppercase">Email</span>
              <input
                className="flex-1 bg-transparent py-1 text-[16px] text-black focus:outline-none font-semibold"
                placeholder="Add Email"
                value={contactForm.email}
                onChange={(e) => setContactForm((s: any) => ({ ...s, email: e.target.value }))}
              />
            </div>
          </div>
          <div className="p-4 flex gap-3 mt-auto mb-4">
            <button
              className="flex-1 h-10 rounded-lg bg-gray-100 text-gray-900 font-semibold active:bg-gray-200 transition-colors"
              onClick={goBack}
            >
              Cancel
            </button>
            <button
              className={`flex-1 h-10 rounded-lg font-semibold transition-colors ${
                contactForm.firstName
                  ? 'bg-[#007AFF] text-white active:bg-blue-600'
                  : 'bg-blue-200 text-white cursor-not-allowed'
              }`}
              onClick={() => {
                if (contactForm.firstName) {
                  if (isEditingContact && selectedContact)
                    updateContact(selectedContact, contactForm);
                  else addContact(contactForm);
                  goBack();
                }
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (menuId === MenuIDs.NOTE_EDIT) {
    return (
      <NoteEditor
        isEditing={isEditingNote}
        title={noteForm.title}
        content={noteForm.content}
        onTitleChange={(title) => setNoteForm((s: any) => ({ ...s, title }))}
        onContentChange={(content) => setNoteForm((s: any) => ({ ...s, content }))}
        onSave={() => {
          if (noteForm.title) {
            if (isEditingNote && selectedNote)
              updateNote(selectedNote, { title: noteForm.title, content: noteForm.content });
            else addNote(noteForm.title, noteForm.content);
            goBack();
          }
        }}
        onCancel={goBack}
        isPlaying={music.isPlaying}
        hasActiveTrack={!!music.currentTrack}
      />
    );
  }

  if (menuId === MenuIDs.LOCATION_INPUT) {
    return (
      <LocationPicker
        value={locationInput}
        onChange={setLocationInput}
        onSave={() => {
          setClockSettings((s: any) => ({ ...s, location: locationInput }));
          goBack();
        }}
        onCancel={goBack}
        isPlaying={music.isPlaying}
        hasActiveTrack={!!music.currentTrack}
      />
    );
  }

  if (menuId === MenuIDs.PLAYLIST_SEARCH) {
    return (
      <div className="w-full h-full bg-white flex flex-col">
        <StatusBar
          title="Search Playlist"
          isPlaying={music.isPlaying}
          hasActiveTrack={!!music.currentTrack}
          theme="light"
        />
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <div className="w-full bg-[#FFFFFF] border-b border-[#E5E5E5] px-4 py-2.5 shrink-0 relative z-10">
            <div className="flex items-center bg-[#F2F2F7] rounded-lg h-9">
              <Search size={18} strokeWidth={2.5} className="text-[#8e8e93] ml-3 shrink-0" />
              <input
                className="w-full h-full px-3 bg-transparent text-[16px] text-black placeholder-[#aeaeb2] focus:outline-none font-semibold"
                placeholder="Search playlist..."
                value={playlistSearchQuery}
                onChange={(e) => setPlaylistSearchQuery(e.target.value)}
                autoFocus
              />
              {playlistSearchQuery && (
                <button
                  onClick={() => setPlaylistSearchQuery('')}
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
          <MenuScreen
            title=""
            items={currentMenuItems}
            selectedIndex={navState.selectedIndex}
            onItemClick={(idx) => {
              selectIndex(idx);
              const item = currentMenuItems[idx];
              if (item) executeItemAction(item);
            }}
            isPlaying={music.isPlaying}
            hasActiveTrack={!!music.currentTrack}
            hideTitle={true}
          />
        </div>
      </div>
    );
  }

  return (
    <MenuScreen
      title={
        menuId === MenuIDs.HOME
          ? "Karan's iPod"
          : menuId === MenuIDs.SETTINGS
            ? 'Settings'
            : menuId === MenuIDs.EXTRAS
              ? 'Extras'
              : menuId === MenuIDs.MUSIC
                ? 'Music'
                : menuId === MenuIDs.BACKLIGHT_SETTINGS
                  ? 'Backlight Timer'
                  : menuId
                      .toLowerCase()
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (l: string) => l.toUpperCase())
      }
      items={currentMenuItems}
      selectedIndex={navState.selectedIndex}
      onItemClick={(idx) => {
        selectIndex(idx);
        const item = currentMenuItems[idx];
        if (item) executeItemAction(item);
      }}
      isPlaying={music.isPlaying}
      hasActiveTrack={!!music.currentTrack}
    />
  );
};
