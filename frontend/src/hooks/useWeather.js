import { useCallback, useEffect, useState } from 'react';

/**
 * Live weather for the browser's location via Open-Meteo (no API key).
 *
 * Both the compact widget and the full schedule panel need this, and both
 * used to fabricate a forecast locally. One hook keeps them consistent and
 * makes the failure states explicit:
 *
 *   error = null              → loaded, see `weather`
 *   error = 'location-denied' → the user (or browser) declined geolocation
 *   error = 'unsupported'     → no geolocation API on this platform
 *   error = <string>          → the weather service could not be reached
 */

// WMO weather codes → condition buckets (https://open-meteo.com/en/docs).
export const conditionFromCode = (code) => {
  if (code === 0) return 'sunny';
  if ([1, 2].includes(code)) return 'partly-cloudy';
  if (code === 3) return 'cloudy';
  if ([45, 48].includes(code)) return 'fog';
  if ([51, 53, 55, 56, 57].includes(code)) return 'drizzle';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rainy';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snowy';
  if ([95, 96, 99].includes(code)) return 'stormy';
  return 'cloudy';
};

export const DISRUPTIVE_CONDITIONS = new Set(['rainy', 'snowy', 'stormy']);

/**
 * Display metadata for each condition. Shared so the compact widget and the
 * schedule panel cannot drift apart (they previously carried separate copies
 * of the same icon/label table).
 */
export const CONDITION_LABELS = {
  sunny: 'Clear',
  'partly-cloudy': 'Partly cloudy',
  cloudy: 'Cloudy',
  fog: 'Fog',
  drizzle: 'Drizzle',
  rainy: 'Rain',
  snowy: 'Snow',
  stormy: 'Storms',
};

export const CONDITION_TONE = {
  sunny: 'text-amber-500',
  'partly-cloudy': 'text-sky-400',
  cloudy: 'text-slate-400',
  fog: 'text-slate-400',
  drizzle: 'text-sky-500',
  rainy: 'text-sky-600',
  snowy: 'text-sky-300',
  stormy: 'text-rose-500',
};

const getPosition = () =>
  new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve({ error: 'unsupported' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ position }),
      () => resolve({ error: 'location-denied' }),
      { timeout: 8000, maximumAge: 10 * 60 * 1000 }
    );
  });

export const useWeather = (unit = 'c') => {
  const [weather, setWeather] = useState(null);
  const [place, setPlace] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { position, error: geoError } = await getPosition();
    if (geoError) {
      setError(geoError);
      setLoading(false);
      return;
    }

    const { latitude, longitude } = position.coords;
    const temperatureUnit = unit === 'f' ? 'fahrenheit' : 'celsius';

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
          `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
          `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
          `&forecast_days=7&timezone=auto&temperature_unit=${temperatureUnit}`
      );
      if (!response.ok) throw new Error(`Weather service returned ${response.status}`);

      const data = await response.json();
      const current = data?.current;
      const daily = data?.daily;
      if (!current || !daily?.time) throw new Error('Weather service returned no data');

      setWeather({
        current: {
          temp: Math.round(current.temperature_2m),
          humidity: current.relative_humidity_2m,
          wind: Math.round(current.wind_speed_10m),
          condition: conditionFromCode(current.weather_code),
        },
        forecast: daily.time.map((iso, index) => ({
          date: new Date(iso),
          condition: conditionFromCode(daily.weather_code?.[index]),
          high: Math.round(daily.temperature_2m_max?.[index]),
          low: Math.round(daily.temperature_2m_min?.[index]),
          precipitation: daily.precipitation_probability_max?.[index] ?? null,
        })),
      });

      // Place name is a nicety; if this second call fails we just omit it.
      try {
        const geo = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        if (geo.ok) {
          const detail = await geo.json();
          setPlace([detail.city || detail.locality, detail.countryName].filter(Boolean).join(', '));
        }
      } catch {
        setPlace('');
      }
    } catch (err) {
      setError(err.message || 'Could not reach the weather service.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }, [unit]);

  useEffect(() => {
    load();
  }, [load]);

  return { weather, place, loading, error, reload: load };
};

export const describeWeatherError = (error) => {
  if (error === 'location-denied') {
    return 'Location permission was declined — weather needs it to know which forecast applies to you.';
  }
  if (error === 'unsupported') {
    return 'This browser does not share its location, so weather cannot be shown.';
  }
  return error || 'Could not load weather.';
};

export default useWeather;
