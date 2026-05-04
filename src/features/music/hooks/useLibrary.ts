import { useState, useCallback, useMemo, useEffect } from 'react';
import { Artist, Playlist, Track } from '@shared/types';
import { API_BASE_URL } from '@shared/constants';
import { searchSongs, Song } from '@features/music/api/musicApi';

export const useLibrary = () => {
  const [libraryArtists, setLibraryArtists] = useState<Artist[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [librarySongs, setLibrarySongs] = useState<Track[]>([]);

  const [globalSearchResults, setGlobalSearchResults] = useState<Track[]>([]);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isGlobalSearchLoading, setIsGlobalSearchLoading] = useState(false);

  const sortedArtists = useMemo(() => {
    return [...libraryArtists].sort((a, b) => a.name.localeCompare(b.name));
  }, [libraryArtists]);

  const sortedSongs = useMemo(() => {
    return [...librarySongs].sort((a, b) => a.title.localeCompare(b.title));
  }, [librarySongs]);

  const fetchLibrary = useCallback(async () => {
    try {
      const cachedSongs = localStorage.getItem('ipod_library_songs');
      const initialSongs = cachedSongs ? JSON.parse(cachedSongs) : [];

      const cachedArtists = localStorage.getItem('ipod_library_artists');
      const initialArtists = cachedArtists ? JSON.parse(cachedArtists) : [];

      if (Array.isArray(initialArtists) && initialArtists.length > 0) {
        setLibraryArtists(initialArtists);
      } else {
        fetch('/top_artists.json')
          .then((r) => r.json())
          .then((d) => {
            if (Array.isArray(d)) setLibraryArtists(d);
          })
          .catch((err) => console.warn('Silent catch fallback:', err));
      }

      if (Array.isArray(initialSongs) && initialSongs.length > 0) {
        setLibrarySongs(initialSongs);
      } else {
        fetch('/top_songs.json')
          .then((r) => r.json())
          .then((d) => {
            if (Array.isArray(d)) setLibrarySongs(d);
          })
          .catch((err) => console.warn('Silent catch fallback:', err));
      }

      fetch(`${API_BASE_URL}/api/library/artists`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setLibraryArtists(data);
            localStorage.setItem('ipod_library_artists', JSON.stringify(data));
          }
        })
        .catch((err) => console.warn('Silent catch fallback:', err));

      fetch(`${API_BASE_URL}/api/playlists`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setPlaylists(data);
        })
        .catch((err) => console.warn('Silent catch fallback:', err));

      fetch(`${API_BASE_URL}/api/library/songs`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setLibrarySongs(data);
            localStorage.setItem('ipod_library_songs', JSON.stringify(data));
          }
        })
        .catch((err) => console.warn('Silent catch fallback:', err));
    } catch (e) {
      console.error('[iPod Library Error]: Failed to fetch library', e);
    }
  }, []);

  const renamePlaylist = useCallback(
    async (id: string, oldName: string) => {
      const name = prompt('Rename Playlist:', oldName);
      if (name && name !== oldName) {
        await fetch(`${API_BASE_URL}/api/playlists/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        fetchLibrary();
      }
    },
    [fetchLibrary],
  );

  const deletePlaylist = useCallback(
    async (id: string, onSuccess?: () => void) => {
      if (confirm('Are you sure you want to delete this playlist?')) {
        await fetch(`${API_BASE_URL}/api/playlists/${id}`, { method: 'DELETE' });
        fetchLibrary();
        if (onSuccess) onSuccess();
      }
    },
    [fetchLibrary],
  );

  const addToPlaylist = useCallback(
    async (playlistId: string, track: Track) => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/playlists/${playlistId}/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ songId: track.videoId }),
        });
        if (res.ok) {
          await fetchLibrary();
        }
      } catch (err) {
        console.error('Add to playlist failed', err);
      }
    },
    [fetchLibrary],
  );

  // Debounced global search effect (needs to NOT reset `navState`, which should be handled by the caller)
  useEffect(() => {
    const timer = setTimeout(async () => {
      const query = globalSearchQuery.trim();
      if (query.length < 2) {
        setGlobalSearchResults([]);
        return;
      }

      setIsGlobalSearchLoading(true);
      try {
        const results = await searchSongs(query);
        const tracks: Track[] = results.map((item: Song) => ({
          videoId: item.id,
          title: item.title,
          artist: item.artist,
          duration: item.duration,
          thumbnailUrl: item.thumbnail,
          thumbnailUrlBackup: item.thumbnailBackup,
          album: 'Unknown',
        }));

        const uniqueTracks = Array.from(new Map(tracks.map((t) => [t.videoId, t])).values());
        setGlobalSearchResults(uniqueTracks);
      } catch (err) {
        console.error('Global search failed', err);
      } finally {
        setIsGlobalSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [globalSearchQuery]);

  return {
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
  };
};
