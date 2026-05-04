import { useState, useEffect, useCallback } from 'react';
import { Artist, Playlist, Track } from '../../types';
import { API_BASE_URL } from '../../constants';

export const useLibrary = () => {
  const [libraryArtists, setLibraryArtists] = useState<Artist[]>(() => {
    const cached = localStorage.getItem('ipod_library_artists');
    return cached ? JSON.parse(cached) : [];
  });
  const [librarySongs, setLibrarySongs] = useState<Track[]>(() => {
    const cached = localStorage.getItem('ipod_library_songs');
    return cached ? JSON.parse(cached) : [];
  });
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [selectedGenreId, setSelectedGenreId] = useState<string | null>(null);
  const [addingToPlaylistId, setAddingToPlaylistId] = useState<string | null>(null);

  const fetchLibrary = useCallback(async () => {
    try {
      // If we don't have artists/songs yet, try to load from defaults
      if (libraryArtists.length === 0) {
        try {
          const res = await fetch('/top_artists.json');
          const data = await res.json();
          if (Array.isArray(data)) setLibraryArtists(data);
        } catch {
          // Fallback handled
        }
      }

      if (librarySongs.length === 0) {
        try {
          const res = await fetch('/top_songs.json');
          const data = await res.json();
          if (Array.isArray(data)) setLibrarySongs(data);
        } catch {
          // Fallback handled
        }
      }

      // Background refresh from API
      try {
        const [artistsRes, playlistsRes, songsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/library/artists`),
          fetch(`${API_BASE_URL}/api/playlists`),
          fetch(`${API_BASE_URL}/api/library/songs`),
        ]);

        if (artistsRes.ok) {
          const artists = await artistsRes.json();
          if (Array.isArray(artists) && artists.length > 0) {
            setLibraryArtists(artists);
            localStorage.setItem('ipod_library_artists', JSON.stringify(artists));
          }
        }

        if (playlistsRes.ok) {
          const playlistsData = await playlistsRes.json();
          if (Array.isArray(playlistsData)) setPlaylists(playlistsData);
        }

        if (songsRes.ok) {
          const songs = await songsRes.json();
          if (Array.isArray(songs) && songs.length > 0) {
            setLibrarySongs(songs);
            localStorage.setItem('ipod_library_songs', JSON.stringify(songs));
          }
        }
      } catch (err) {
        console.warn('Background library sync failed:', err);
      }
    } catch (e) {
      console.error('Failed to process library data:', e);
    }
  }, [libraryArtists.length, librarySongs.length]);

  const renamePlaylist = useCallback(
    async (id: string, oldName: string) => {
      const name = prompt('Rename Playlist:', oldName);
      if (name && name !== oldName) {
        await fetch(`${API_BASE_URL}/api/playlists/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        await fetchLibrary();
      }
    },
    [fetchLibrary],
  );

  const deletePlaylist = useCallback(
    async (id: string) => {
      if (confirm('Are you sure you want to delete this playlist?')) {
        await fetch(`${API_BASE_URL}/api/playlists/${id}`, { method: 'DELETE' });
        await fetchLibrary();
      }
    },
    [fetchLibrary],
  );

  const addToPlaylist = useCallback(
    async (playlistId: string, videoId: string) => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/playlists/${playlistId}/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ songId: videoId }),
        });
        if (res.ok) {
          await fetchLibrary();
          return true;
        }
      } catch (err) {
        console.error('Add to playlist failed', err);
      }
      return false;
    },
    [fetchLibrary],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLibrary();
  }, [fetchLibrary]);

  return {
    libraryArtists,
    librarySongs,
    playlists,
    selectedArtistId,
    setSelectedArtistId,
    selectedAlbumId,
    setSelectedAlbumId,
    selectedPlaylistId,
    setSelectedPlaylistId,
    selectedGenreId,
    setSelectedGenreId,
    addingToPlaylistId,
    setAddingToPlaylistId,
    fetchLibrary,
    renamePlaylist,
    deletePlaylist,
    addToPlaylist,
  };
};
