// utils/musicApi.ts
import { API_BASE_URL } from '../constants';

// ───── Types ─────
export interface Song {
  id: string; // This is the YouTube Video ID
  title: string;
  artist: string;
  thumbnail: string;
  thumbnailBackup?: string;
  duration: number;
}

// ───── Search Songs (YTMusic - 100% accurate) ─────
export async function searchSongs(query: string): Promise<Song[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    const results = data.results || [];

    interface BackendSong {
      videoId: string;
      title: string;
      artist: string;
      thumbnailUrl: string;
      thumbnailUrlBackup?: string;
      duration: number;
    }

    return (results as BackendSong[]).map((item) => ({
      id: item.videoId,
      title: item.title,
      artist: item.artist,
      thumbnail: item.thumbnailUrl,
      thumbnailBackup: item.thumbnailUrlBackup,
      duration: item.duration,
    }));
  } catch (err: unknown) {
    console.error('Search failed:', err);
    return [];
  }
}

// NOTE: getAudioUrl, getPipedFallbackUrl, and fetchPipedAudioUrl
// are NO LONGER NEEDED. The v6 Bulletproof Architecture uses the
// official YouTube IFrame API embedded in useMusicPlayer.ts.
// No proxying or backend streaming is necessary!

export async function getAudioUrl(): Promise<string | null> {
  console.warn('Deprecated: getAudioUrl called but app uses IFrame API.');
  return null;
}

export async function getPipedFallbackUrl(): Promise<string | null> {
  console.warn('Deprecated: getPipedFallbackUrl called but app uses IFrame API.');
  return null;
}

export async function fetchPipedAudioUrl(): Promise<string | null> {
  console.warn('Deprecated: fetchPipedAudioUrl called but app uses IFrame API.');
  return null;
}
