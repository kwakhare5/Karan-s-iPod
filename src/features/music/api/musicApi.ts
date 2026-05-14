// utils/musicApi.ts
import { API_BASE_URL } from '@shared/constants';

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

// NOTE: All previous audio URL fetching logic (getAudioUrl, getPipedFallbackUrl, etc.)
// has been removed. The application now exclusively uses the official YouTube
// IFrame API via useMusicPlayer.ts for playback, eliminating the need for
// backend streaming or proxying.
