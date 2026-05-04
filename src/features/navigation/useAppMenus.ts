import { useMemo } from 'react';
import {
  MenuIDs,
  MenuItem,
  Track,
  MenuItemType,
  Playlist,
  Artist,
  MusicPlayer,
  ClockSettings,
  Contact,
  Note,
  BacklightTimeout,
} from '../../types';
import { ROOT_MENUS, API_BASE_URL } from '../../constants';
interface UseAppMenusProps {
  navState: { currentMenuId: MenuIDs };
  music: MusicPlayer;
  libraryArtists: Artist[];
  librarySongs: Track[];
  globalSearchResults: Track[];
  favorites: Track[];
  playlists: Playlist[];
  chassisColor: string;
  clockSettings: ClockSettings;
  backlightTimeout: number;
  selectedArtistId: string | null;
  selectedAlbumId: string | null;
  selectedPlaylistId: string | null;
  selectedGenreId: string | null;
  addingToPlaylistId: string | null;
  playlistSearchQuery: string;
  contacts: Contact[];
  notes: Note[];
  selectedContact: string | null;
  selectedNote: string | null;
  actions: {
    navigateTo: (id: MenuIDs) => void;
    goBack: () => void;
    setChassisColor: (color: string) => void;
    setClockSettings: (updater: (prev: ClockSettings) => ClockSettings) => void;
    setBacklightTimeout: (timeout: BacklightTimeout) => void;
    playOrNavigate: (track: Track, queue: Track[]) => void;
    handleSearchSelect: (track: Track, results: Track[]) => void;
    handlePlaylistSearchSelect: (track: Track) => void;
    setSelectedArtistId: (id: string | null) => void;
    setSelectedAlbumId: (id: string | null) => void;
    setSelectedPlaylistId: (id: string | null) => void;
    setSelectedGenreId: (id: string | null) => void;
    setAddingToPlaylistId: (id: string | null) => void;
    setPlaylistSearchQuery: (q: string) => void;
    fetchLibrary: () => void;
    renamePlaylist: (id: string, name: string) => void;
    deletePlaylist: (id: string) => void;
    setSelectedContact: (id: string | null) => void;
    setIsEditingContact: (editing: boolean) => void;
    setContactForm: (form: Partial<Contact>) => void;
    deleteContact: (id: string) => void;
    setSelectedNote: (id: string | null) => void;
    setIsEditingNote: (editing: boolean) => void;
    setNoteForm: (form: Partial<Note>) => void;
    deleteNote: (id: string) => void;
    getContact: (id: string) => Contact | undefined;
    getNote: (id: string) => Note | undefined;
  };
}

export const useAppMenus = ({
  navState,
  music,
  libraryArtists,
  librarySongs,
  globalSearchResults,
  favorites,
  playlists,
  chassisColor,
  clockSettings,
  backlightTimeout,
  selectedArtistId,
  selectedAlbumId,
  selectedPlaylistId,
  selectedGenreId,
  addingToPlaylistId,
  playlistSearchQuery,
  contacts,
  notes,
  selectedContact,
  selectedNote,
  actions,
}: UseAppMenusProps) => {
  return useMemo<MenuItem[]>(() => {
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
          action: () => actions.handleSearchSelect(track, globalSearchResults),
        }),
      );
    }

    if (menuId === MenuIDs.FAVORITES) {
      if (favorites.length === 0)
        return [{ id: 'no_favs', label: 'No Favorites Yet', type: 'toggle' as MenuItemType }];
      return favorites.map(
        (fav): MenuItem => ({
          id: fav.videoId,
          label: `${fav.title} - ${fav.artist}`,
          type: 'action' as MenuItemType,
          action: () => {
            actions.playOrNavigate(fav, favorites);
          },
        }),
      );
    }

    if (menuId === MenuIDs.ARTISTS) {
      if (libraryArtists.length === 0)
        return [{ id: 'no_artists', label: 'No Artists Found', type: 'toggle' as MenuItemType }];
      return [...libraryArtists]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(
          (artist): MenuItem => ({
            id: artist.id,
            label: artist.name,
            type: 'navigation' as MenuItemType,
            targetMenuId: MenuIDs.ARTIST_DETAIL,
            hasChevron: true,
            action: () => {
              actions.setSelectedArtistId(artist.id);
              actions.navigateTo(MenuIDs.ARTIST_DETAIL);
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
          actions.playOrNavigate(song, artistSongs);
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
          actions.setSelectedAlbumId(album);
          actions.navigateTo(MenuIDs.ALBUM_DETAIL);
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
          actions.playOrNavigate(song, albumSongs);
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
              if (res.ok) actions.fetchLibrary();
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
              actions.setSelectedPlaylistId(p.id);
              actions.navigateTo(MenuIDs.PLAYLIST_DETAIL);
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
            actions.setAddingToPlaylistId(selectedPlaylistId);
            actions.setPlaylistSearchQuery('');
            actions.navigateTo(MenuIDs.PLAYLIST_SEARCH);
          },
        },
        ...playlistSongs.map(
          (track): MenuItem => ({
            id: track.videoId,
            label: track.title,
            type: 'action' as const,
            action: () => {
              actions.playOrNavigate(track, playlistSongs);
            },
          }),
        ),
        {
          id: 'rename_playlist',
          label: 'Rename Playlist',
          type: 'action' as const,
          action: () => actions.renamePlaylist(playlist.id, playlist.name),
        },
        {
          id: 'delete_playlist',
          label: 'Delete Playlist',
          type: 'action' as const,
          action: () => actions.deletePlaylist(playlist.id),
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
          action: () => actions.handlePlaylistSearchSelect(track),
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
            actions.setSelectedGenreId(g);
            actions.navigateTo(MenuIDs.GENRE_DETAIL);
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
            actions.playOrNavigate(song, genreSongs);
          },
        }),
      );
    }

    if (menuId === MenuIDs.SONGS) {
      return [...librarySongs]
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((song) => ({
          id: song.videoId,
          label: `${song.title} - ${song.artist}`,
          type: 'action',
          action: () => {
            actions.playOrNavigate(song, librarySongs);
          },
        }));
    }

    if (menuId === MenuIDs.BACKLIGHT_SETTINGS) {
      const BACKLIGHT_OPTIONS: { label: string; value: BacklightTimeout }[] = [
        { label: 'Off', value: 0 },
        { label: '2 Seconds', value: 2 },
        { label: '5 Seconds', value: 5 },
        { label: '10 Seconds', value: 10 },
        { label: '30 Seconds', value: 30 },
        { label: 'Always On', value: -1 },
      ];
      return BACKLIGHT_OPTIONS.map((opt) => ({
        id: `bl_${opt.value}`,
        label: backlightTimeout === opt.value ? `✓ ${opt.label}` : opt.label,
        type: 'action' as const,
        action: () => actions.setBacklightTimeout(opt.value),
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
            actions.setContactForm({ firstName: '', lastName: '', phone: '', email: '' });
            actions.setIsEditingContact(false);
            actions.setSelectedContact(null);
            actions.navigateTo(MenuIDs.CONTACT_EDIT);
          },
        },
      ];
      [...contacts]
        .sort((a, b) => (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName))
        .forEach((c) => {
          items.push({
            id: c.id,
            label: `${c.firstName} ${c.lastName}`,
            type: 'navigation',
            targetMenuId: MenuIDs.CONTACT_DETAIL,
            hasChevron: true,
            action: () => {
              actions.setSelectedContact(c.id);
              actions.navigateTo(MenuIDs.CONTACT_DETAIL);
            },
          });
        });
      return items;
    }

    if (menuId === MenuIDs.CONTACT_DETAIL && selectedContact) {
      const contact = contacts.find((c) => c.id === selectedContact);
      if (!contact) return [];
      return [
        { id: 'name', label: `Name: ${contact.firstName} ${contact.lastName}`, type: 'toggle' },
        { id: 'phone', label: `Phone: ${contact.phone}`, type: 'toggle' },
        { id: 'email', label: `Email: ${contact.email}`, type: 'toggle' },
        {
          id: 'edit_contact',
          label: 'Edit Contact',
          type: 'navigation',
          action: () => {
            actions.setContactForm({ ...contact });
            actions.setIsEditingContact(true);
            actions.navigateTo(MenuIDs.CONTACT_EDIT);
          },
        },
        {
          id: 'delete_contact',
          label: 'Delete Contact',
          type: 'action',
          action: () => {
            actions.deleteContact(contact.id);
            actions.goBack();
          },
        },
      ];
    }

    if (menuId === MenuIDs.NOTES_LIST) {
      const items: MenuItem[] = [
        {
          id: 'add_note',
          label: 'Add Note',
          type: 'navigation',
          targetMenuId: MenuIDs.NOTE_ADD,
          action: () => {
            actions.setNoteForm({ title: '', content: '' });
            actions.setIsEditingNote(false);
            actions.setSelectedNote(null);
            actions.navigateTo(MenuIDs.NOTE_EDIT);
          },
        },
      ];
      [...notes]
        .sort((a, b) => a.title.localeCompare(b.title))
        .forEach((n) => {
          items.push({
            id: n.id,
            label: n.title,
            type: 'navigation',
            targetMenuId: MenuIDs.NOTE_DETAIL,
            hasChevron: true,
            action: () => {
              actions.setSelectedNote(n.id);
              actions.navigateTo(MenuIDs.NOTE_DETAIL);
            },
          });
        });
      return items;
    }

    if (menuId === MenuIDs.NOTE_DETAIL && selectedNote) {
      const note = notes.find((n) => n.id === selectedNote);
      if (!note) return [];
      return [
        { id: 'title', label: `Title: ${note.title}`, type: 'toggle' },
        {
          id: 'content',
          label: `Content: ${note.content.substring(0, 20)}${note.content.length > 20 ? '...' : ''}`,
          type: 'toggle',
        },
        {
          id: 'edit_note',
          label: 'Edit Note',
          type: 'navigation',
          action: () => {
            actions.setNoteForm({ title: note.title, content: note.content });
            actions.setIsEditingNote(true);
            actions.navigateTo(MenuIDs.NOTE_EDIT);
          },
        },
        {
          id: 'delete_note',
          label: 'Delete Note',
          type: 'action',
          action: () => {
            actions.deleteNote(note.id);
            actions.goBack();
          },
        },
      ];
    }

    return [];
  }, [
    navState.currentMenuId,
    music,
    libraryArtists,
    librarySongs,
    globalSearchResults,
    favorites,
    playlists,
    chassisColor,
    clockSettings,
    backlightTimeout,
    selectedArtistId,
    selectedAlbumId,
    selectedPlaylistId,
    selectedGenreId,
    addingToPlaylistId,
    playlistSearchQuery,
    contacts,
    notes,
    selectedContact,
    selectedNote,
    actions,
  ]);
};
