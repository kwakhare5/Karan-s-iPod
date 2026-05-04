import { useState, useEffect } from 'react';
import { ClockSettings, FavoriteTrack, Track } from '../../types';

export interface WeatherData {
  temp: number;
  condition: string;
}

// Helper to map WMO codes to text/icons (defined before use)
const getWeatherCondition = (code: number): string => {
  if (code === 0) return 'Clear';
  if (code >= 1 && code <= 3) return 'Partly Cloudy';
  if (code >= 45 && code <= 48) return 'Fog';
  if (code >= 51 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 95) return 'Thunderstorm';
  return 'Cloudy';
};

export const useSettings = () => {
  const [chassisColor, setChassisColor] = useState(() => {
    try {
      return localStorage.getItem('chassis_color') || 'silver';
    } catch {
      return 'silver';
    }
  });
  const [clockSettings, setClockSettings] = useState<ClockSettings>({
    is24Hour: false,
    showSeconds: false,
    isLongDate: true,
    showWeather: true,
    isCelsius: true,
    location: 'Mumbai, India',
  });

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  // Favorites Logic - Store full track data
  const [favorites, setFavorites] = useState<FavoriteTrack[]>(() => {
    try {
      const saved = localStorage.getItem('ipod_favorites_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (track: Track) => {
    setFavorites((prev) => {
      const isFavorited = prev.some((fav) => fav.videoId === track.videoId);

      if (isFavorited) {
        const newFavs = prev.filter((fav) => fav.videoId !== track.videoId);
        localStorage.setItem('ipod_favorites_v2', JSON.stringify(newFavs));
        return newFavs;
      } else {
        const newFavs = [...prev, track];
        localStorage.setItem('ipod_favorites_v2', JSON.stringify(newFavs));
        return newFavs;
      }
    });
  };

  useEffect(() => {
    // Weather Fetching
    const fetchWeather = async () => {
      if (!clockSettings.showWeather) return;

      try {
        let lat = 19.076;
        let lon = 72.8777;

        const loc = clockSettings.location.toLowerCase();
        if (loc.includes('london')) {
          lat = 51.5074;
          lon = -0.1278;
        } else if (loc.includes('new york')) {
          lat = 40.7128;
          lon = -74.006;
        } else if (loc.includes('tokyo')) {
          lat = 35.6762;
          lon = 139.6503;
        } else if (loc.includes('san francisco')) {
          lat = 37.7749;
          lon = -122.4194;
        } else if (loc.includes('paris')) {
          lat = 48.8566;
          lon = 2.3522;
        }

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
        );
        const data = await response.json();

        if (data.current_weather) {
          setWeatherData({
            temp: data.current_weather.temperature,
            condition: getWeatherCondition(data.current_weather.weathercode),
          });
        }
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // Update every 10 mins

    return () => clearInterval(interval);
  }, [clockSettings.location, clockSettings.showWeather]);

  return {
    chassisColor,
    setChassisColor,
    clockSettings,
    setClockSettings,
    weatherData,
    favorites,
    toggleFavorite,
  };
};
