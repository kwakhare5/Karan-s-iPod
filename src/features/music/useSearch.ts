import { useState, useCallback } from 'react';
import { Track } from '../../types';
import { searchSongs, Song } from './musicApi';

export const useSearch = () => {
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState<Track[]>([]);
  const [isGlobalSearchLoading, setIsGlobalSearchLoading] = useState(false);
  const [playlistSearchQuery, setPlaylistSearchQuery] = useState('');

  const handleGlobalSearch = useCallback(async (query: string) => {
    setGlobalSearchQuery(query);
    if (query.trim().length < 2) {
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
      setGlobalSearchResults(tracks);
    } catch (err) {
      console.error('Global search failed', err);
    } finally {
      setIsGlobalSearchLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setGlobalSearchResults([]);
    setGlobalSearchQuery('');
  }, []);

  return {
    globalSearchQuery,
    setGlobalSearchQuery,
    globalSearchResults,
    setGlobalSearchResults,
    isGlobalSearchLoading,
    playlistSearchQuery,
    setPlaylistSearchQuery,
    handleGlobalSearch,
    clearSearch,
  };
};
