import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MenuIDs, Track, Contact, Note, BacklightTimeout } from './types';
import { API_BASE_URL } from './constants';
import { CHASSIS_GRADIENTS } from './constants/theme';

// Core
import { BootScreen } from './features/core/BootScreen';
import { ClockScreen } from './features/core/ClockScreen';
import { ClickWheel } from './features/core/ClickWheel';
import { StatusBar } from './features/core/StatusBar';

// Music
import { NowPlayingScreen } from './features/music/NowPlayingScreen';
import { SearchScreen } from './features/music/SearchScreen';
import { useMusicPlayer } from './features/music/useMusicPlayer';
import { useLibrary } from './features/music/useLibrary';
import { useSearch } from './features/music/useSearch';

// Navigation
import { MenuScreen } from './features/navigation/MenuScreen';
import { useNavigation } from './features/navigation/useNavigation';
import { useAppMenus } from './features/navigation/useAppMenus';

// Contacts & Notes
import { useContacts } from './features/contacts/useContacts';
import { useNotes } from './features/notes/useNotes';

// Settings
import { useSettings } from './features/settings/useSettings';
import { useBacklight } from './features/settings/useBacklight';

const App = () => {
  const [scale, setScale] = useState(1);
  const [isBooting, setIsBooting] = useState(true);
  const [serverStatus, setServerStatus] = useState('Connecting to backend...');

  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const baseHeight = 750;
      const baseWidth = 400;
      const scaleV = vh / baseHeight;
      const scaleH = vw / baseWidth;
      setScale(Math.min(scaleV, scaleH, 1.1));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { scroll, selectIndex, navigateTo, goBack, navState } = useNavigation();
  const currentMenuId = navState.currentMenuId as MenuIDs;
  const selectedIndex = navState.selectedIndex;

  const {
    favorites,
    chassisColor,
    clockSettings,
    setChassisColor,
    setClockSettings,
    toggleFavorite,
  } = useSettings();
  const { isDimmed, timeout: backlightTimeout, setBacklightTimeout } = useBacklight();
  const { contacts, addContact, updateContact, deleteContact, getContact } = useContacts();
  const { notes, addNote, updateNote, deleteNote, getNote } = useNotes();
  const music = useMusicPlayer();
  const musicRef = useRef(music);
  useEffect(() => {
    musicRef.current = music;
  }, [music]);
  const library = useLibrary();
  const search = useSearch();

  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState<Partial<Contact>>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [noteForm, setNoteForm] = useState<Partial<Note>>({ title: '', content: '' });
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [locationInput, setLocationInput] = useState('');

  // Reset selection on search query change for "predictive" feel
  useEffect(() => {
    if (navState.currentMenuId === MenuIDs.PLAYLIST_SEARCH) {
      setTimeout(() => selectIndex(0), 0);
    }
  }, [search.playlistSearchQuery, navState.currentMenuId, selectIndex]);

  useEffect(() => {
    const bootTimer = setTimeout(() => {
      setIsBooting(false);
    }, 2000);

    const pingBackend = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/ping`);
        if (res.ok) {
          setServerStatus('');
        }
      } catch {
        // Backend ping failed, potentially offline or server down
      }
    };

    const interval = setInterval(pingBackend, 600000);
    pingBackend();
    return () => {
      clearInterval(interval);
      clearTimeout(bootTimer);
    };
  }, []);

  // -- Interaction Handlers --
  const playOrNavigate = useCallback(
    (track: Track, queue: Track[]) => {
      music.playSong(track, queue);
      navigateTo(MenuIDs.NOW_PLAYING);
    },
    [music, navigateTo],
  );

  const handleNext = useCallback(() => music.nextTrack(), [music]);
  const handlePrev = useCallback(() => music.prevTrack(), [music]);
  const handlePlayPause = useCallback(() => music.togglePlayPause(), [music]);

  const menuActions = useMemo(
    () => ({
      navigateTo,
      goBack,
      setChassisColor,
      setClockSettings,
      setBacklightTimeout: (timeout: BacklightTimeout) => setBacklightTimeout(timeout),
      playOrNavigate,
      handleSearchSelect: (track: Track, results: Track[]) => {
        playOrNavigate(track, results);
        search.setGlobalSearchResults([]);
      },
      handlePlaylistSearchSelect: async (track: Track) => {
        if (!library.addingToPlaylistId) return;
        await library.addToPlaylist(library.addingToPlaylistId, track.videoId);
      },
      setSelectedArtistId: library.setSelectedArtistId,
      setSelectedAlbumId: library.setSelectedAlbumId,
      setSelectedPlaylistId: library.setSelectedPlaylistId,
      setSelectedGenreId: library.setSelectedGenreId,
      setAddingToPlaylistId: library.setAddingToPlaylistId,
      setPlaylistSearchQuery: search.setPlaylistSearchQuery,
      fetchLibrary: library.fetchLibrary,
      renamePlaylist: library.renamePlaylist,
      deletePlaylist: library.deletePlaylist,
      setSelectedContact,
      setIsEditingContact,
      setContactForm,
      deleteContact,
      setSelectedNote,
      setIsEditingNote,
      setNoteForm,
      deleteNote,
      getContact: (id: string) => getContact(id) || undefined,
      getNote: (id: string) => getNote(id) || undefined,
    }),
    [
      navigateTo,
      goBack,
      setChassisColor,
      setClockSettings,
      setBacklightTimeout,
      playOrNavigate,
      library,
      search,
      setSelectedContact,
      setIsEditingContact,
      setContactForm,
      deleteContact,
      setSelectedNote,
      setIsEditingNote,
      setNoteForm,
      deleteNote,
      getContact,
      getNote,
    ],
  );

  const currentMenuItems = useAppMenus({
    navState: { currentMenuId },
    music,
    libraryArtists: library.libraryArtists,
    librarySongs: library.librarySongs,
    globalSearchResults: search.globalSearchResults,
    favorites,
    playlists: library.playlists,
    chassisColor,
    clockSettings,
    backlightTimeout,
    selectedArtistId: library.selectedArtistId,
    selectedAlbumId: library.selectedAlbumId,
    selectedPlaylistId: library.selectedPlaylistId,
    selectedGenreId: library.selectedGenreId,
    addingToPlaylistId: library.addingToPlaylistId,
    playlistSearchQuery: search.playlistSearchQuery,
    contacts,
    notes,
    selectedContact,
    selectedNote,
    actions: menuActions,
  });

  const handleMenuSelect = useCallback(() => {
    if (isBooting) return;
    const menuId = currentMenuId;
    if (menuId === MenuIDs.NOW_PLAYING) {
      handlePlayPause();
      return;
    }
    const selectedItem = currentMenuItems[selectedIndex];
    if (selectedItem) {
      if (selectedItem.id === 'play_pause') handlePlayPause();
      else if (selectedItem.action) selectedItem.action();
      else if (selectedItem.targetMenuId) navigateTo(selectedItem.targetMenuId as MenuIDs);
    }
  }, [isBooting, currentMenuId, selectedIndex, currentMenuItems, handlePlayPause, navigateTo]);

  const handleScroll = useCallback(
    (direction: 'cw' | 'ccw') => {
      if (isBooting) return;
      const m = musicRef.current;
      if (currentMenuId === MenuIDs.NOW_PLAYING && m.currentTrack) {
        const step = 0.05;
        const newVol = Math.round((m.volume + (direction === 'cw' ? step : -step)) * 20) / 20;
        m.setVolume(newVol);
      } else {
        scroll(direction, currentMenuItems.length);
      }
    },
    [isBooting, currentMenuId, scroll, currentMenuItems.length],
  );

  const handleBack = useCallback(() => goBack(), [goBack]);

  const handleGlobalSearch = useCallback(
    async (query: string) => {
      await search.handleGlobalSearch(query);
      setTimeout(() => selectIndex(0), 0);
    },
    [search, selectIndex],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tagName = (document.activeElement?.tagName || '').toLowerCase();
      if (
        (tagName === 'input' || tagName === 'textarea') &&
        !['ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)
      )
        return;
      if (
        [
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          ' ',
          'Enter',
          'Backspace',
          'Escape',
        ].includes(e.key)
      )
        e.preventDefault();
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          handleScroll('cw');
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          handleScroll('ccw');
          break;
        case 'Enter':
          handleMenuSelect();
          break;
        case 'Backspace':
        case 'Escape':
          handleBack();
          break;
        case ' ':
          handlePlayPause();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleScroll, handleMenuSelect, handleBack, handlePlayPause]);

  let ScreenComponent;
  const menuId = currentMenuId;

  if (menuId === MenuIDs.NOW_PLAYING && music.currentTrack) {
    ScreenComponent = (
      <NowPlayingScreen
        track={music.currentTrack}
        isPlaying={music.isPlaying}
        isLoading={music.isLoading}
        progress={music.progress}
        currentTime={music.currentTime}
        duration={music.duration}
        isShuffled={music.isShuffled}
        repeatMode={music.repeatMode}
        isLiked={favorites.some((f) => f.videoId === music.currentTrack!.videoId)}
        onTogglePlay={handlePlayPause}
        onToggleShuffle={music.toggleShuffle}
        onToggleRepeat={music.toggleRepeat}
        onToggleLike={() => music.currentTrack && toggleFavorite(music.currentTrack)}
        onSeek={music.seekTo}
        volume={music.volume}
        queueIndex={music.queueIndex}
        queueLength={music.queue.length}
      />
    );
  } else if (menuId === MenuIDs.SEARCH) {
    ScreenComponent = (
      <SearchScreen
        selectedIndex={selectedIndex}
        isPlaying={music.isPlaying}
        hasActiveTrack={!!music.currentTrack}
        onSelectResult={(track, results) => menuActions.handleSearchSelect(track, results)}
        results={search.globalSearchResults}
        isLoading={search.isGlobalSearchLoading}
        onSearch={handleGlobalSearch}
        query={search.globalSearchQuery}
      />
    );
  } else if (menuId === MenuIDs.CLOCK) {
    ScreenComponent = (
      <ClockScreen
        onExit={goBack}
        settings={clockSettings}
        isPlaying={music.isPlaying}
        hasActiveTrack={!!music.currentTrack}
      />
    );
  } else if (menuId === MenuIDs.CONTACT_EDIT) {
    ScreenComponent = (
      <div className="w-full h-full flex flex-col" style={{ background: 'var(--ipod-bg)' }}>
        <StatusBar
          title={isEditingContact ? 'Edit Contact' : 'New Contact'}
          isPlaying={music.isPlaying}
          hasActiveTrack={!!music.currentTrack}
          theme="light"
        />
        <div className="flex-1 flex flex-col gap-[var(--space-2)] p-[var(--space-4)]">
          <input
            className="border-[1px] border-[var(--apple-gray-separator)] p-[var(--space-2)] rounded-[var(--radius-sm)] text-[14px] text-[var(--ipod-text)] focus:border-[var(--apple-blue)] outline-none bg-[var(--ipod-bg)]"
            placeholder="First Name"
            value={contactForm.firstName}
            onChange={(e) => setContactForm((s: Partial<Contact>) => ({ ...s, firstName: e.target.value }))}
          />
          <input
            className="border-[1px] border-[var(--apple-gray-separator)] p-[var(--space-2)] rounded-[var(--radius-sm)] text-[14px] text-[var(--ipod-text)] focus:border-[var(--apple-blue)] outline-none bg-[var(--ipod-bg)]"
            placeholder="Last Name"
            value={contactForm.lastName}
            onChange={(e) => setContactForm((s: Partial<Contact>) => ({ ...s, lastName: e.target.value }))}
          />
          <input
            className="border-[1px] border-[var(--apple-gray-separator)] p-[var(--space-2)] rounded-[var(--radius-sm)] text-[14px] text-[var(--ipod-text)] focus:border-[var(--apple-blue)] outline-none bg-[var(--ipod-bg)]"
            placeholder="Phone"
            value={contactForm.phone}
            onChange={(e) => setContactForm((s: Partial<Contact>) => ({ ...s, phone: e.target.value }))}
          />
          <input
            className="border-[1px] border-[var(--apple-gray-separator)] p-[var(--space-2)] rounded-[var(--radius-sm)] text-[14px] text-[var(--ipod-text)] focus:border-[var(--apple-blue)] outline-none bg-[var(--ipod-bg)]"
            placeholder="Email"
            value={contactForm.email}
            onChange={(e) => setContactForm((s: Partial<Contact>) => ({ ...s, email: e.target.value }))}
          />
          <div className="flex gap-[var(--space-2)] mt-[var(--space-2)]">
            <button 
              className="bg-[var(--apple-gray-separator)] text-[var(--ipod-text)] p-[var(--space-2)] rounded-[var(--radius-sm)] flex-1 active:scale-[0.98] transition-transform font-[var(--font-weight-medium)]" 
              onClick={goBack}
            >
              Cancel
            </button>
            <button
              className="bg-[var(--apple-blue)] text-[var(--apple-white)] p-[var(--space-2)] rounded-[var(--radius-sm)] flex-1 active:scale-[0.98] transition-transform font-[var(--font-weight-semibold)] shadow-sm"
              onClick={() => {
                if (contactForm.firstName && contactForm.lastName) {
                  if (isEditingContact && selectedContact)
                    updateContact(selectedContact, contactForm);
                  else addContact(contactForm as Omit<Contact, 'id'>);
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
  } else if (menuId === MenuIDs.NOTE_EDIT) {
    ScreenComponent = (
      <div className="w-full h-full flex flex-col" style={{ background: 'var(--ipod-bg)' }}>
        <StatusBar
          title={isEditingNote ? 'Edit Note' : 'New Note'}
          isPlaying={music.isPlaying}
          hasActiveTrack={!!music.currentTrack}
          theme="light"
        />
        <div className="flex-1 flex flex-col gap-[var(--space-2)] p-[var(--space-4)]">
          <input
            className="border-[1px] border-[var(--apple-gray-separator)] p-[var(--space-2)] rounded-[var(--radius-sm)] text-[14px] text-[var(--ipod-text)] focus:border-[var(--apple-blue)] outline-none bg-[var(--ipod-bg)]"
            placeholder="Title"
            value={noteForm.title}
            onChange={(e) => setNoteForm((s: Partial<Note>) => ({ ...s, title: e.target.value }))}
          />
          <textarea
            className="border-[1px] border-[var(--apple-gray-separator)] p-[var(--space-2)] rounded-[var(--radius-sm)] text-[14px] text-[var(--ipod-text)] focus:border-[var(--apple-blue)] outline-none bg-[var(--ipod-bg)] flex-1 resize-none ipod-scrollbar"
            placeholder="Content"
            value={noteForm.content}
            onChange={(e) => setNoteForm((s: Partial<Note>) => ({ ...s, content: e.target.value }))}
          />
          <div className="flex gap-[var(--space-2)] mt-[var(--space-2)]">
            <button 
              className="bg-[var(--apple-gray-separator)] text-[var(--ipod-text)] p-[var(--space-2)] rounded-[var(--radius-sm)] flex-1 active:scale-[0.98] transition-transform font-[var(--font-weight-medium)]" 
              onClick={goBack}
            >
              Cancel
            </button>
            <button
              className="bg-[var(--apple-blue)] text-[var(--apple-white)] p-[var(--space-2)] rounded-[var(--radius-sm)] flex-1 active:scale-[0.98] transition-transform font-[var(--font-weight-semibold)] shadow-sm"
              onClick={() => {
                if (noteForm.title && noteForm.content) {
                  if (isEditingNote && selectedNote)
                    updateNote(selectedNote, { title: noteForm.title, content: noteForm.content });
                  else addNote(noteForm.title, noteForm.content);
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
  } else if (menuId === MenuIDs.LOCATION_INPUT) {
    ScreenComponent = (
      <div className="w-full h-full flex flex-col" style={{ background: 'var(--ipod-bg)' }}>
        <StatusBar
          title="Set Location"
          isPlaying={music.isPlaying}
          hasActiveTrack={!!music.currentTrack}
          theme="light"
        />
        <div className="flex-1 flex flex-col justify-center p-[var(--space-4)]">
          <input
            className="border-[1px] border-[var(--apple-gray-separator)] p-[var(--space-3)] rounded-[var(--radius-sm)] w-full text-[16px] text-[var(--ipod-text)] focus:border-[var(--apple-blue)] outline-none bg-[var(--ipod-bg)] mb-[var(--space-4)]"
            placeholder="City Name"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setClockSettings((s) => ({ ...s, location: locationInput }));
                goBack();
              }
            }}
            autoFocus
          />
          <div className="flex gap-[var(--space-2)]">
            <button onClick={goBack} className="bg-[var(--apple-gray-separator)] text-[var(--ipod-text)] p-[var(--space-3)] rounded-[var(--radius-sm)] flex-1 active:scale-[0.98] transition-transform">
              Cancel
            </button>
            <button
              onClick={() => {
                setClockSettings((s) => ({ ...s, location: locationInput }));
                goBack();
              }}
              className="bg-[var(--apple-blue)] text-[var(--apple-white)] p-[var(--space-3)] rounded-[var(--radius-sm)] flex-1 active:scale-[0.98] transition-transform shadow-sm"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  } else if (menuId === MenuIDs.PLAYLIST_SEARCH) {
    ScreenComponent = (
      <div className="w-full h-full bg-white flex flex-col">
        <StatusBar
          title="Search Playlist"
          isPlaying={music.isPlaying}
          hasActiveTrack={!!music.currentTrack}
          theme="light"
        />
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <div className="shrink-0 border-b border-gray-200 w-full">
            <input
              className="w-full px-4 py-4 text-lg font-semibold text-gray-900 placeholder-gray-400 border-none outline-none bg-white"
              placeholder="Search songs..."
              value={search.playlistSearchQuery}
              onChange={(e) => search.setPlaylistSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <MenuScreen
            title=""
            items={currentMenuItems}
            selectedIndex={selectedIndex}
            onItemClick={(idx) => {
              selectIndex(idx);
              const item = currentMenuItems[idx];
              if (item?.action) item.action();
            }}
            isPlaying={music.isPlaying}
            hasActiveTrack={!!music.currentTrack}
            hideTitle={true}
          />
        </div>
      </div>
    );
  } else {
    ScreenComponent = (
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
                    : (menuId as string)
                        .toLowerCase()
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (l) => l.toUpperCase())
        }
        items={currentMenuItems}
        selectedIndex={selectedIndex}
        onItemClick={(idx) => {
          selectIndex(idx);
          const item = currentMenuItems[idx];
          if (item?.action) item.action();
          else if (item?.targetMenuId) navigateTo(item.targetMenuId as MenuIDs);
        }}
        isPlaying={music.isPlaying}
        hasActiveTrack={!!music.currentTrack}
      />
    );
  }

  return (
    <div className="flex items-center justify-center min-h-dvh w-full p-4 overflow-hidden">
      <div style={{ width: 358 * scale, height: 700 * scale, position: 'relative', flexShrink: 0 }}>
        <div
          className="relative bg-[#e3e3e3] rounded-[30px] shadow-2xl overflow-hidden border-4 border-[#d1d1d1]"
          style={{
            width: '358px',
            height: '700px',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            transition: 'transform 0.1s ease-out',
            background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E"), radial-gradient(18.13% 7.45% at 51.16% 64.58%, rgba(0, 0, 0, 0.1) 1.28%, rgba(0, 0, 0, 0) 87%), ${CHASSIS_GRADIENTS[chassisColor] || CHASSIS_GRADIENTS['silver']}`,
            backgroundBlendMode: 'overlay, normal, normal',
            boxShadow:
              'inset 4px 4px 24px #FFFFFF, inset 0px 0px 32px rgba(233, 230, 224, 0.5), inset 8px -56px 100px rgba(46, 45, 45, 0.6)',
          }}
        >
          <div
            className="absolute overflow-hidden"
            style={{
              top: '24px',
              left: '16px',
              width: '310px',
              height: '340px',
              border: '8px solid var(--ipod-screen-border)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--apple-black)',
              boxSizing: 'content-box',
            }}
          >
            <div className="w-full h-full relative bg-white flex flex-col text-black">
              {isBooting ? <BootScreen status={serverStatus} /> : ScreenComponent}
              {!isBooting && (
                <div
                  className="absolute inset-0 pointer-events-none z-50"
                  style={{
                    background:
                      'conic-gradient(from 227.11deg at 67.66% 38.91%, #FFFFFF 0deg, rgba(255, 255, 255, 0) 360deg)',
                    backgroundBlendMode: 'lighten',
                    opacity: 0.1,
                    borderRadius: '4px',
                  }}
                />
              )}
              {isDimmed && (
                <div
                  className="absolute inset-0 z-60 pointer-events-none"
                  style={{
                    background: 'rgba(0,0,0,0.7)',
                    transition: 'opacity 0.5s ease',
                    borderRadius: '4px',
                  }}
                />
              )}
            </div>
          </div>
          <div
            className="absolute"
            style={{
              top: '407px',
              left: '54px', // Standardized whole number (358 - 250) / 2
              width: '250px',
              height: '250px',
            }}
          >
            <ClickWheel
              onScroll={handleScroll}
              onMenu={handleBack}
              onSelect={handleMenuSelect}
              onPlayPause={handlePlayPause}
              onNext={handleNext}
              onPrev={handlePrev}
              enabled={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
