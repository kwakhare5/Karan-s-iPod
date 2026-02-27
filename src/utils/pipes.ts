// utils/pipes.ts

/**
 * A list of reliable public Piped API instances.
 * These act as proxies for YouTube to bypass IP-locking and data-center blocks.
 */
export const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://api.piped.victr.me',
  'https://pipedapi.lunar.icu',
  'https://piped-api.garudalinux.org',
  'https://api-piped.mha.fi',
];

/**
 * Gets a random Piped instance from the list.
 */
export const getRandomPipedInstance = () => {
  return PIPED_INSTANCES[Math.floor(Math.random() * PIPED_INSTANCES.length)];
};

/**
 * Constructs a Piped stream URL for a given video ID.
 */
export const getPipedStreamUrl = (videoId: string, instance?: string) => {
  const base = instance || getRandomPipedInstance();
  return `${base}/streams/${videoId}`;
};

/**
 * Fetches the actual audio stream URL from a Piped instance.
 */
export async function fetchPipedAudioUrl(videoId: string): Promise<string | null> {
  const instances = [...PIPED_INSTANCES].sort(() => Math.random() - 0.5);

  for (const instance of instances) {
    try {
      const response = await fetch(`${instance}/streams/${videoId}`);
      if (!response.ok) continue;

      const data = await response.json();
      if (data.audioStreams && data.audioStreams.length > 0) {
        const stream =
          data.audioStreams.find(
            (s: any) => s.format === 'M4A' || s.mimeType?.includes('audio/mp4')
          ) || data.audioStreams[0];
        return stream.url;
      }
    } catch (err) {
      console.warn(`Failed to fetch from Piped instance ${instance}:`, err);
    }
  }

  return null;
}
