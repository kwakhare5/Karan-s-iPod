/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { MenuIDs, MenuItem, Track, MenuItemType } from '@shared/types';
import { ROOT_MENUS, API_BASE_URL } from '@shared/constants';
import { ClickWheel } from '@shared/components/ClickWheel';
import { useNavigation } from '@features/navigation/hooks/useNavigation';
import { useSettings } from '@features/settings/hooks/useSettings';
import { useBacklight, BACKLIGHT_OPTIONS } from '@features/settings/hooks/useBacklight';
import { useContacts } from '@features/extras/hooks/useContacts';
import { useNotes } from '@features/extras/hooks/useNotes';
import { useMusicPlayer } from '@features/music/hooks/useMusicPlayer';
import { ScreenRouter } from '@features/navigation/components/ScreenRouter';
import { useLibrary } from '@features/music/hooks/useLibrary';

const CHASSIS_GRADIENTS: Record<string, string> = {
  silver: 'linear-gradient(197.05deg, #E2E2E2 3.73%, #AEAEAE 94.77%)',
  blue: 'linear-gradient(197.05deg, #a1c4fd 3.73%, #5e99e8 94.77%)',
  yellow: 'linear-gradient(197.05deg, #ffeb3b 3.73%, #fbc02d 94.77%)',
  pink: 'linear-gradient(197.05deg, #ffcdd2 3.73%, #e57373 94.77%)',
  red: 'linear-gradient(197.05deg, #ff5252 3.73%, #d32f2f 94.77%)',
};

const App = () => {
  const calculateScale = () => {
    if (typeof window === 'undefined') return 0.75;
    const isMobile = window.innerWidth < 768;
    // We use a larger padding on desktop (48) vs mobile (16) to ensure the
    // iPod chassis has sufficient 'breathing room' on larger displays.
    const padding = isMobile ? 16 : 48;

    // Use visualViewport if available for more accurate mobile dimensions (accounts for keyboard/bars)
    const viewWidth = window.visualViewport?.width || window.innerWidth;
    const viewHeight = window.visualViewport?.height || window.innerHeight;

    const wRatio = (viewWidth - padding) / 358;
    const hRatio = (viewHeight - padding) / 700;

    const maxScale = isMobile ? 0.95 : 1.2;
    const minScale = 0.3; // Allow scaling down further if needed on very small devices
    return Math.max(minScale, Math.min(maxScale, wRatio, hRatio));
  };

  const [scale, setScale] = useState(calculateScale);
  const [isBooting, setIsBooting] = useState(true);
  const [serverStatus, setServerStatus] = useState<string>('');

  useEffect(() => {
    const handleResize = () => setScale(calculateScale());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Removed fixed timeout to sync booting with server wake state

  // -- State Hooks --
  const { navState, navigateTo, goBack, selectIndex, scroll } = useNavigation();
  const {
    chassisColor,
    setChassisColor,
    clockSettings,
    setClockSettings,
    favorites,
    toggleFavorite,
  } = useSettings();
  const { isDimmed, timeout: backlightTimeout, setBacklightTimeout } = useBacklight();
  const { contacts, addContact, updateContact, deleteContact, getContact } = useContacts();
  const { notes, addNote, updateNote, deleteNote, getNote } = useNotes();
  const music = useMusicPlayer();
  const musicRef = useRef(music);
  useEffect(() => {
    musicRef.current = music;
  });

  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [locationInput, setLocationInput] = useState('');

  // -- Library State (from Hook) --
  const {
    libraryArtists,
    playlists,
    librarySongs,
    sortedArtists,
    sortedSongs,
    fetchLibrary,
    renamePlaylist,
    deletePlaylist,
    addToPlaylist,
    globalSearchQuery,
    setGlobalSearchQuery,
    globalSearchResults,
    setGlobalSearchResults,
    isGlobalSearchLoading,
  } = useLibrary();

  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [addingToPlaylistId, setAddingToPlaylistId] = useState<string | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [selectedGenreId, setSelectedGenreId] = useState<string | null>(null);
  const [playlistSearchQuery, setPlaylistSearchQuery] = useState('');
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);

  // Reset selection on search query change for "predictive" feel
  useEffect(() => {
    if (navState.currentMenuId === MenuIDs.PLAYLIST_SEARCH) {
      setTimeout(() => selectIndex(0), 0);
    }
  }, [playlistSearchQuery, navState.currentMenuId, selectIndex]);

  // Reset global search selection (migrated from hook to component to use selectIndex)
  useEffect(() => {
    if (globalSearchResults.length > 0) {
      setTimeout(() => selectIndex(0), 0);
    }
  }, [globalSearchResults, selectIndex]);

  useEffect(() => {
    const bootTimer = setTimeout(() => {
      setIsBooting(false);
    }, 2000);

    const pingBackend = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/ping`);
        if (res.ok) {
          setServerStatus('');
          console.log('Server is awake');
        }
      } catch (err) {
        console.error('[iPod API Error]: Server ping failed', err);
      }
    };

    const interval = setInterval(pingBackend, 600000);
    pingBackend();
    return () => {
      clearInterval(interval);
      clearTimeout(bootTimer);
    };
  }, []);

  useEffect(() => {
    // Wrap in timeout to avoid synchronous state update warning
    const t = setTimeout(() => {
      fetchLibrary();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchLibrary]);

  // -- Menu Logic --
  const executeItemAction = useCallback(
    (item: MenuItem) => {
      if (item.action) {
        item.action();
        return;
      }
      if (item.type === 'navigation' && item.targetMenuId) {
        navigateTo(item.targetMenuId);
      } else if (item.id.startsWith('set_color_')) {
        const color = item.id.replace('set_color_', '');
        setChassisColor(color);
        localStorage.setItem('ipod_chassis_color', color);
      } else if (navState.currentMenuId === MenuIDs.SETTINGS_CLOCK) {
        if (item.id === 'time_format') setClockSettings((s) => ({ ...s, is24Hour: !s.is24Hour }));
        if (item.id === 'show_seconds')
          setClockSettings((s) => ({ ...s, showSeconds: !s.showSeconds }));
        if (item.id === 'date_format')
          setClockSettings((s) => ({ ...s, isLongDate: !s.isLongDate }));
      } else if (item.id === 'shuffle_songs') {
        const allSongs = [...librarySongs];
        if (allSongs.length > 0) {
          // Create a truly random shuffle
          for (let i = allSongs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allSongs[i], allSongs[j]] = [allSongs[j], allSongs[i]];
          }
          // Ensure shuffle state is active for UI consistency
          if (!music.isShuffled) music.toggleShuffle();
          music.playSong(allSongs[0], allSongs);
          navigateTo(MenuIDs.NOW_PLAYING);
        }
      }
    },
    [navigateTo, setChassisColor, setClockSettings, navState.currentMenuId, librarySongs, music],
  );

  // -- Playback Orchestration --
  /**
   * Transitions the UI to the Now Playing screen when a song is selected.
   * If the song is already active, we just navigate to avoid disrupting
   * the current playback state.
   */
  const playOrNavigate = useCallback(
    (track: Track, queue: Track[]) => {
      // If clicking the same song that's already playing, just go to Now Playing screen
      if (music.currentTrack && music.currentTrack.videoId === track.videoId) {
        navigateTo(MenuIDs.NOW_PLAYING);
        return;
      }

      // Make sure shuffle is off if it was on
      if (music.isShuffled) music.toggleShuffle();
      music.playSong(track, queue);
      navigateTo(MenuIDs.NOW_PLAYING);
    },
    [music, navigateTo],
  );

  const handleSearchSelect = useCallback(
    (track: Track, results: Track[]) => {
      playOrNavigate(track, results);
      setGlobalSearchResults([]); // Clear results on navigate
    },
    [playOrNavigate],
  );

  const handlePlaylistSearchSelect = useCallback(
    async (track: Track) => {
      if (!addingToPlaylistId) return;
      await addToPlaylist(addingToPlaylistId, track);
    },
    [addingToPlaylistId, addToPlaylist],
  );

  const handleGlobalSearch = useCallback(
    (query: string) => {
      setGlobalSearchQuery(query);
    },
    [setGlobalSearchQuery],
  );

  const handlePlayPause = useCallback(() => {
    if (music.currentTrack) music.togglePlayPause();
  }, [music]);

  const handleNext = useCallback(() => {
    music.nextTrack();
  }, [music]);
  const handlePrev = useCallback(() => {
    music.prevTrack();
  }, [music]);

  const handleToggleLike = useCallback(() => {
    if (music.currentTrack) {
      toggleFavorite({
        id: music.currentTrack.videoId,
        title: music.currentTrack.title,
        artist: music.currentTrack.artist,
        duration: music.currentTrack.duration,
        url: '',
        thumbnailUrl: music.currentTrack.thumbnailUrl || '',
        albumId: music.currentTrack.album,
      });
    }
  }, [music.currentTrack, toggleFavorite]);

  // -- Menu Items --
  const currentMenuItems = useMemo<MenuItem[]>(() => {
    const menuId = navState.currentMenuId;

    if (menuId === MenuIDs.HOME) {
      return ROOT_MENUS[MenuIDs.HOME].filter((item) => {
        if (item.id === 'now_playing') return !!music.currentTrack;
        return true;
      });
    }
    if (menuId === MenuIDs.MUSIC) return ROOT_MENUS[MenuIDs.MUSIC];
    if (menuId === MenuIDs.SETTINGS) return ROOT_MENUS[MenuIDs.SETTINGS];
    if (menuId === MenuIDs.EXTRAS) return ROOT_MENUS[MenuIDs.EXTRAS];

    if (menuId === MenuIDs.SETTINGS_COLOR) {
      return ROOT_MENUS[menuId].map((item) => ({
        ...item,
        label: item.id.replace('set_color_', '') === chassisColor ? `✓ ${item.label}` : item.label,
      }));
    }

    if (menuId === MenuIDs.SETTINGS_CLOCK) {
      return ROOT_MENUS[menuId].map((item) => {
        let label = item.label;
        if (item.id === 'time_format')
          label = `Time Format: ${clockSettings.is24Hour ? '24-hour' : '12-hour'}`;
        if (item.id === 'show_seconds')
          label = `Show Seconds: ${clockSettings.showSeconds ? 'On' : 'Off'}`;
        if (item.id === 'date_format')
          label = `Date Format: ${clockSettings.isLongDate ? 'Long' : 'Short'}`;
        return { ...item, label };
      });
    }

    if (menuId === MenuIDs.SEARCH) {
      return globalSearchResults.map(
        (track): MenuItem => ({
          id: track.videoId,
          label: `${track.title} - ${track.artist}`,
          type: 'action' as MenuItemType,
          action: () => handleSearchSelect(track, globalSearchResults),
        }),
      );
    }

    if (menuId === MenuIDs.FAVORITES) {
      if (favorites.length === 0)
        return [{ id: 'no_favs', label: 'No Favorites Yet', type: 'toggle' as MenuItemType }];
      return favorites.map(
        (fav): MenuItem => ({
          id: fav.id,
          label: `${fav.title} - ${fav.artist}`,
          type: 'action' as MenuItemType,
          action: () => {
            const track: Track = {
              videoId: fav.id,
              title: fav.title,
              artist: fav.artist,
              duration: fav.duration,
              url: '',
              thumbnailUrl: fav.thumbnailUrl,
              album: fav.albumId,
            };
            const favQueue = favorites.map((f) => ({
              videoId: f.id,
              title: f.title,
              artist: f.artist,
              duration: f.duration,
              thumbnailUrl: f.thumbnailUrl,
              album: f.albumId,
            }));
            playOrNavigate(track, favQueue);
          },
        }),
      );
    }

    if (menuId === MenuIDs.ARTISTS) {
      if (sortedArtists.length === 0)
        return [{ id: 'no_artists', label: 'No Artists Found', type: 'toggle' as MenuItemType }];
      return sortedArtists.map(
        (artist): MenuItem => ({
          id: artist.id,
          label: artist.name,
          type: 'navigation' as MenuItemType,
          targetMenuId: MenuIDs.ARTIST_DETAIL,
          hasChevron: true,
          action: () => {
            setSelectedArtistId(artist.id);
            navigateTo(MenuIDs.ARTIST_DETAIL);
          },
        }),
      );
    }

    if (menuId === MenuIDs.ARTIST_DETAIL && selectedArtistId) {
      const targetArtistName =
        libraryArtists.find((a) => a.id === selectedArtistId)?.name || selectedArtistId;
      const artistSongs = librarySongs
        .filter((s) => s.artistId === selectedArtistId || s.artist === targetArtistName)
        .sort((a, b) => a.title.localeCompare(b.title));

      if (artistSongs.length === 0)
        return [{ id: 'no_songs', label: 'No songs found', type: 'toggle' }];
      return artistSongs.map((song) => ({
        id: song.videoId,
        label: `${song.title} - ${song.artist}`,
        type: 'action',
        action: () => {
          playOrNavigate(song, artistSongs);
        },
      }));
    }

    if (menuId === MenuIDs.ALBUMS) {
      const albumMap = new Map<string, string>();
      librarySongs.forEach((s) => {
        if (s.album && !albumMap.has(s.album)) {
          albumMap.set(s.album, s.artist || 'Unknown Artist');
        }
      });
      const albumsArray = Array.from(albumMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
      return albumsArray.map(([album, artist]) => ({
        id: `alb_${album}`,
        label: `${album} - ${artist}`,
        type: 'navigation',
        targetMenuId: MenuIDs.ALBUM_DETAIL,
        hasChevron: true,
        action: () => {
          setSelectedAlbumId(album);
          navigateTo(MenuIDs.ALBUM_DETAIL);
        },
      }));
    }

    if (menuId === MenuIDs.ALBUM_DETAIL && selectedAlbumId) {
      const albumSongs = librarySongs
        .filter((s) => s.album === selectedAlbumId || s.albumId === selectedAlbumId)
        .sort((a, b) => a.title.localeCompare(b.title));
      if (albumSongs.length === 0)
        return [{ id: 'no_songs', label: 'No songs found', type: 'toggle' }];
      return albumSongs.map((song) => ({
        id: song.videoId,
        label: `${song.title} - ${song.artist}`,
        type: 'action',
        action: () => {
          playOrNavigate(song, albumSongs);
        },
      }));
    }

    if (menuId === MenuIDs.PLAYLISTS) {
      return [
        {
          id: 'create_playlist',
          label: 'Create New Playlist',
          type: 'action' as const,
          action: async () => {
            const name = prompt('Enter Playlist Name:');
            if (name) {
              const res = await fetch(`${API_BASE_URL}/api/playlists`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
              });
              if (res.ok) fetchLibrary();
            }
          },
        },
        ...playlists.map(
          (p): MenuItem => ({
            id: p.id,
            label: p.name,
            type: 'navigation' as const,
            targetMenuId: MenuIDs.PLAYLIST_DETAIL,
            hasChevron: true,
            action: () => {
              setSelectedPlaylistId(p.id);
              navigateTo(MenuIDs.PLAYLIST_DETAIL);
            },
          }),
        ),
      ] as MenuItem[];
    }

    if (menuId === MenuIDs.PLAYLIST_DETAIL) {
      if (!selectedPlaylistId) return [];
      const playlist = playlists.find((p) => p.id === selectedPlaylistId);
      if (!playlist) return [];
      const playlistSongs = (playlist.songIds || [])
        .map((sid) => librarySongs.find((s) => s.videoId === sid))
        .filter(Boolean) as Track[];
      return [
        {
          id: 'add_songs_search',
          label: '+ Add Songs',
          type: 'navigation' as const,
          targetMenuId: MenuIDs.PLAYLIST_SEARCH,
          action: () => {
            setAddingToPlaylistId(selectedPlaylistId);
            setPlaylistSearchQuery('');
            navigateTo(MenuIDs.PLAYLIST_SEARCH);
          },
        },
        ...playlistSongs.map(
          (track): MenuItem => ({
            id: track.videoId,
            label: track.title,
            type: 'action' as const,
            action: () => {
              playOrNavigate(track, playlistSongs);
            },
          }),
        ),
        {
          id: 'rename_playlist',
          label: 'Rename Playlist',
          type: 'action' as const,
          action: () => renamePlaylist(playlist.id, playlist.name),
        },
        {
          id: 'delete_playlist',
          label: 'Delete Playlist',
          type: 'action' as const,
          action: () => deletePlaylist(playlist.id, goBack),
        },
      ] as MenuItem[];
    }

    if (menuId === MenuIDs.PLAYLIST_SEARCH) {
      const results = librarySongs
        .filter(
          (s) =>
            s.title.toLowerCase().includes(playlistSearchQuery.toLowerCase()) ||
            s.artist.toLowerCase().includes(playlistSearchQuery.toLowerCase()),
        )
        .slice(0, 15);

      const playlist = playlists.find((p) => p.id === addingToPlaylistId);
      const songIds = playlist?.songIds || [];

      return results.map(
        (track): MenuItem => ({
          id: track.videoId,
          label: songIds.includes(track.videoId) ? `✓ ${track.title}` : track.title,
          type: 'action',
          action: () => handlePlaylistSearchSelect(track),
        }),
      );
    }

    if (menuId === MenuIDs.GENRES) {
      const availableGenres = Array.from(
        new Set(librarySongs.map((s) => s.genre).filter(Boolean)),
      ) as string[];
      if (availableGenres.length === 0)
        return [{ id: 'no_genres', label: 'No Genres Found', type: 'toggle' as MenuItemType }];
      return availableGenres.sort().map(
        (g): MenuItem => ({
          id: g,
          label: g,
          type: 'navigation' as MenuItemType,
          targetMenuId: MenuIDs.GENRE_DETAIL,
          hasChevron: true,
          action: () => {
            setSelectedGenreId(g);
            navigateTo(MenuIDs.GENRE_DETAIL);
          },
        }),
      );
    }

    if (menuId === MenuIDs.GENRE_DETAIL && selectedGenreId) {
      const genreSongs = librarySongs
        .filter((s) => s.genre === selectedGenreId)
        .sort((a, b) => a.title.localeCompare(b.title));
      if (genreSongs.length === 0)
        return [{ id: 'no_songs', label: 'No songs found', type: 'toggle' as MenuItemType }];
      return genreSongs.map(
        (song): MenuItem => ({
          id: song.videoId,
          label: song.title,
          type: 'action' as MenuItemType,
          action: () => {
            playOrNavigate(song, genreSongs);
          },
        }),
      );
    }

    if (menuId === MenuIDs.SONGS) {
      return sortedSongs.map((song) => ({
        id: song.videoId,
        label: `${song.title} - ${song.artist}`,
        type: 'action',
        action: () => {
          playOrNavigate(song, sortedSongs);
        },
      }));
    }

    if (menuId === MenuIDs.BACKLIGHT_SETTINGS) {
      return BACKLIGHT_OPTIONS.map((opt) => ({
        id: `bl_${opt.value}`,
        label: backlightTimeout === opt.value ? `✓ ${opt.label}` : opt.label,
        type: 'action' as const,
        action: () => setBacklightTimeout(opt.value),
      }));
    }

    if (menuId === MenuIDs.CONTACTS) {
      const items: MenuItem[] = [
        {
          id: 'add_contact',
          label: 'Add Contact',
          type: 'navigation',
          targetMenuId: MenuIDs.CONTACT_ADD,
          action: () => {
            setContactForm({ firstName: '', lastName: '', phone: '', email: '' });
            setIsEditingContact(false);
            setSelectedContact(null);
            navigateTo(MenuIDs.CONTACT_EDIT);
          },
        },
      ];
      contacts
        .sort((a, b) => (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName))
        .forEach((c) => {
          items.push({
            id: c.id,
            label: `${c.firstName} ${c.lastName}`,
            type: 'navigation',
            targetMenuId: MenuIDs.CONTACT_DETAIL,
            hasChevron: true,
            action: () => {
              setSelectedContact(c.id);
              navigateTo(MenuIDs.CONTACT_DETAIL);
            },
          });
        });
      return items;
    }

    if (menuId === MenuIDs.CONTACT_DETAIL && selectedContact) {
      const contact = getContact(selectedContact);
      if (!contact)
        return [{ id: 'not_found', label: 'Contact Not Found', type: 'toggle' as MenuItemType }];
      return [
        {
          id: 'c_name',
          label: `Name: ${contact.firstName} ${contact.lastName}`,
          type: 'toggle' as MenuItemType,
        },
        { id: 'c_phone', label: `Phone: ${contact.phone || ''}`, type: 'toggle' as MenuItemType },
        { id: 'c_email', label: `Email: ${contact.email || ''}`, type: 'toggle' as MenuItemType },
        {
          id: 'edit_contact',
          label: 'Edit Contact',
          type: 'action' as MenuItemType,
          action: () => {
            setContactForm({
              firstName: contact.firstName,
              lastName: contact.lastName,
              phone: contact.phone || '',
              email: contact.email || '',
            });
            setIsEditingContact(true);
            navigateTo(MenuIDs.CONTACT_EDIT);
          },
        },
        {
          id: 'delete_contact',
          label: 'Delete Contact',
          type: 'action' as MenuItemType,
          action: () => {
            deleteContact(selectedContact);
            goBack();
          },
        },
      ];
    }

    if (menuId === MenuIDs.NOTES_LIST) {
      const items: MenuItem[] = [
        {
          id: 'add_note',
          label: 'Add Note',
          type: 'navigation' as const,
          targetMenuId: MenuIDs.NOTE_ADD,
          action: () => {
            setNoteForm({ title: '', content: '' });
            setIsEditingNote(false);
            setSelectedNote(null);
            navigateTo(MenuIDs.NOTE_EDIT);
          },
        },
      ];
      notes.forEach((n) => {
        items.push({
          id: n.id,
          label: n.title,
          type: 'navigation' as const,
          targetMenuId: MenuIDs.NOTE_DETAIL,
          hasChevron: true,
          action: () => {
            setSelectedNote(n.id);
            navigateTo(MenuIDs.NOTE_DETAIL);
          },
        });
      });
      return items;
    }

    if (menuId === MenuIDs.NOTE_DETAIL && selectedNote) {
      const note = getNote(selectedNote);
      if (!note)
        return [
          { id: 'not_found', label: 'Note Not Found', type: 'toggle' as const },
        ] as MenuItem[];
      const lines = note.content.split('\n');
      return [
        { id: 'note_title', label: `📝 ${note.title}`, type: 'toggle' as const },
        ...lines.map(
          (line, i): MenuItem => ({ id: `line_${i}`, label: line || ' ', type: 'toggle' as const }),
        ),
        {
          id: 'edit_note',
          label: 'Edit Note',
          type: 'action' as const,
          action: () => {
            setNoteForm({ title: note.title, content: note.content });
            setIsEditingNote(true);
            navigateTo(MenuIDs.NOTE_EDIT);
          },
        },
        {
          id: 'delete_note',
          label: 'Delete Note',
          type: 'action' as const,
          action: () => {
            deleteNote(selectedNote);
            goBack();
          },
        },
      ] as MenuItem[];
    }

    if (ROOT_MENUS[navState.currentMenuId]) return ROOT_MENUS[navState.currentMenuId];

    return [];
  }, [
    navState.currentMenuId,
    playlists,
    selectedPlaylistId,
    sortedSongs,
    navigateTo,
    addingToPlaylistId,
    playlistSearchQuery,
    handlePlaylistSearchSelect,
    selectedGenreId,
    globalSearchResults,
    handleSearchSelect,
    favorites,
    sortedArtists,
    selectedArtistId,
    librarySongs,
    libraryArtists,
    notes,
    selectedNote,
    getNote,
    deleteNote,
    goBack,
    contacts,
    selectedContact,
    getContact,
    deleteContact,
    chassisColor,
    clockSettings,
    backlightTimeout,
    setBacklightTimeout,
    selectedAlbumId,
    fetchLibrary,
    renamePlaylist,
    deletePlaylist,
    playOrNavigate,
    music,
  ]);

  // -- Interaction Handlers --
  const handleMenuSelect = useCallback(() => {
    if (isBooting) return;
    const menuId = navState.currentMenuId;

    // Handle screens with non-list interactions
    if (menuId === MenuIDs.NOW_PLAYING) {
      handlePlayPause();
      return;
    }
    if (menuId === MenuIDs.CLOCK) {
      setClockSettings((s) => ({ ...s, is24Hour: !s.is24Hour }));
      return;
    }

    const selectedItem = currentMenuItems[navState.selectedIndex];
    if (!selectedItem) return;

    if (selectedItem.id === 'play_pause') {
      handlePlayPause();
      return;
    }
    executeItemAction(selectedItem);
  }, [
    isBooting,
    navState.currentMenuId,
    navState.selectedIndex,
    currentMenuItems,
    executeItemAction,
    handlePlayPause,
    setClockSettings,
  ]);

  const handleScroll = useCallback(
    (direction: 'cw' | 'ccw') => {
      if (isBooting) return;
      const m = musicRef.current;
      if (navState.currentMenuId === MenuIDs.NOW_PLAYING && m.currentTrack) {
        const step = 0.05;
        // Round to nearest 0.05 to prevent floating point drift
        const newVol = Math.round((m.volume + (direction === 'cw' ? step : -step)) * 20) / 20;
        m.setVolume(newVol);
      } else {
        scroll(direction, currentMenuItems.length);
      }
    },
    [isBooting, navState.currentMenuId, scroll, currentMenuItems.length],
  );

  const handleBack = useCallback(() => {
    goBack();
  }, [goBack]);

  // -- Keyboard Support --
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tagName = (document.activeElement?.tagName || '').toLowerCase();
      // Allow Arrows and Enter to navigate even when in search bar
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
      ) {
        e.preventDefault();
      }
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
        case 'm':
        case 'M':
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

  // -- Screen Rendering via Extracted Router --
  const ScreenComponent = (
    <ScreenRouter
      isBooting={isBooting}
      serverStatus={serverStatus}
      navState={navState}
      currentMenuItems={currentMenuItems}
      selectIndex={selectIndex}
      executeItemAction={executeItemAction}
      music={music}
      favorites={favorites}
      handlePlayPause={handlePlayPause}
      handleToggleLike={handleToggleLike}
      globalSearchResults={globalSearchResults}
      isGlobalSearchLoading={isGlobalSearchLoading}
      handleGlobalSearch={handleGlobalSearch}
      globalSearchQuery={globalSearchQuery}
      handleSearchSelect={handleSearchSelect}
      clockSettings={clockSettings}
      setClockSettings={setClockSettings}
      goBack={goBack}
      isEditingContact={isEditingContact}
      contactForm={contactForm}
      setContactForm={setContactForm}
      selectedContact={selectedContact}
      updateContact={updateContact}
      addContact={addContact}
      isEditingNote={isEditingNote}
      noteForm={noteForm}
      setNoteForm={setNoteForm}
      selectedNote={selectedNote}
      updateNote={updateNote}
      addNote={addNote}
      locationInput={locationInput}
      setLocationInput={setLocationInput}
      playlistSearchQuery={playlistSearchQuery}
      setPlaylistSearchQuery={setPlaylistSearchQuery}
      handlePlaylistSearchSelect={handlePlaylistSearchSelect}
    />
  );

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
              'inset 0px 4px 24px #FFFFFF, inset 0px 0px 32px rgba(233, 230, 224, 0.5), inset 0px -56px 100px rgba(46, 45, 45, 0.6)',
          }}
        >
          <div
            className="absolute overflow-hidden"
            style={{
              top: '24px',
              left: '12px',
              width: '310px',
              height: '340px',
              border: '8px solid #000000',
              borderRadius: '5px',
              background: '#000',
              boxSizing: 'content-box',
            }}
          >
            <div className="w-full h-full relative bg-white flex flex-col text-black">
              {ScreenComponent}
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
              top: '412px',
              left: '50px',
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
