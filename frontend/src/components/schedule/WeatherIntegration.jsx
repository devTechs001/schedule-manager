import React, { useCallback, useEffect, useState } from 'react';
import {
  FaSun,
  FaCloud,
  FaCloudRain,
  FaSnowflake,
  FaWind,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaRedo,
  FaThermometerHalf,
} from 'react-icons/fa';

/**
 * Weather for the user's location, with a note on which events it affects.
 *
 * The previous implementation slept for a second and then invented a 7-day
 * forecast out of `Math.random()` — including for "New York", a location the
 * user never chose. It now reads the browser's real coordinates and asks
 * Open-Meteo (free, no API key) for the actual forecast. If the browser
 * refuses geolocation we say so instead of guessing a city.
 */

// WMO weather interpretation codes → condition buckets.
// https://open-meteo.com/en/docs (weather_code)
const conditionFromCode = (code) => {
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

const CONDITION_META = {
  sunny: { icon: FaSun, label: 'Clear', tone: 'text-amber-500' },
  'partly-cloudy': { icon: FaCloud, label: 'Partly cloudy', tone: 'text-sky-400' },
  cloudy: { icon: FaCloud, label: 'Cloudy', tone: 'text-slate-400' },
  fog: { icon: FaCloud, label: 'Fog', tone: 'text-slate-400' },
  drizzle: { icon: FaCloudRain, label: 'Drizzle', tone: 'text-sky-500' },
  rainy: { icon: FaCloudRain, label: 'Rain', tone: 'text-sky-600' },
  snowy: { icon: FaSnowflake, label: 'Snow', tone: 'text-sky-300' },
  stormy: { icon: FaExclamationTriangle, label: 'Storms', tone: 'text-rose-500' },
};

const DISRUPTIVE = new Set(['rainy', 'snowy', 'stormy']);

const WeatherIntegration = ({ events = [], onSuggestReschedule, unit = 'c' }) => {
  const [weather, setWeather] = useState(null);
  const [place, setPlace] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('This browser does not share its location, so weather cannot be shown.');
      setLoading(false);
      return;
    }

    const position = await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        () => resolve(null),
        { timeout: 8000, maximumAge: 10 * 60 * 1000 }
      );
    });

    if (!position) {
      setError('Location permission was declined — weather needs it to know which forecast applies to you.');
      setLoading(false);
      return;
    }

    const { latitude, longitude } = position.coords;
    const tempUnit = unit === 'f' ? 'fahrenheit' : 'celsius';

    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
        `&forecast_days=7&timezone=auto&temperature_unit=${tempUnit}`;

      const response = await fetch(url);
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

      // Reverse geocoding is a second service; if it fails we simply omit the
      // place name rather than inventing one.
      try {
        const geo = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        if (geo.ok) {
          const g = await geo.json();
          setPlace([g.city || g.locality, g.countryName].filter(Boolean).join(', '));
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

  // Which upcoming events fall on a day the forecast calls disruptive.
  const affected = (() => {
    if (!weather || !Array.isArray(events)) return [];
    const badDays = new Set(
      weather.forecast
        .filter((day) => DISRUPTIVE.has(day.condition))
        .map((day) => new Date(day.date).toDateString())
    );
    return events.filter((event) => {
      if (!event?.start) return false;
      return badDays.has(new Date(event.start).toDateString());
    });
  })();

  const unitLabel = unit === 'f' ? '°F' : '°C';

  if (loading) {
    return (
      <div className="card p-6">
        <p className="text-sm text-content-muted">Loading the forecast for your location…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <div className="mb-3 flex items-center gap-3">
          <FaCloud className="text-lg text-content-subtle" />
          <h3 className="font-semibold text-content">Weather</h3>
        </div>
        <p className="flex items-start gap-2 rounded-lg bg-surface-sunken p-3 text-sm text-content-muted">
          <FaExclamationTriangle className="mt-0.5 shrink-0 text-amber-500" />
          <span>{error}</span>
        </p>
        <button type="button" onClick={load} className="btn btn-outline btn-sm mt-3">
          <FaRedo size={9} /> Try again
        </button>
      </div>
    );
  }

  if (!weather) return null;

  const CurrentIcon = CONDITION_META[weather.current.condition]?.icon || FaCloud;

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-content">Weather</h3>
          {place && (
            <p className="flex items-center gap-1 text-xs text-content-muted">
              <FaMapMarkerAlt size={9} /> {place}
            </p>
          )}
        </div>
        <button type="button" onClick={load} className="btn btn-ghost btn-sm" aria-label="Refresh weather">
          <FaRedo size={9} />
        </button>
      </div>

      <div className="mb-5 flex items-center gap-4">
        <CurrentIcon className={`text-4xl ${CONDITION_META[weather.current.condition]?.tone}`} />
        <div>
          <p className="text-3xl font-bold text-content">
            {weather.current.temp}
            <span className="text-lg font-medium text-content-muted">{unitLabel}</span>
          </p>
          <p className="text-sm text-content-muted">
            {CONDITION_META[weather.current.condition]?.label}
          </p>
        </div>
        <dl className="ml-auto space-y-1 text-xs text-content-muted">
          <div className="flex items-center gap-1.5">
            <FaThermometerHalf size={9} /> {weather.current.humidity}% humidity
          </div>
          <div className="flex items-center gap-1.5">
            <FaWind size={9} /> {weather.current.wind} km/h
          </div>
        </dl>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weather.forecast.map((day) => {
          const Icon = CONDITION_META[day.condition]?.icon || FaCloud;
          return (
            <div key={day.date.toISOString()} className="rounded-lg bg-surface-sunken/60 p-2 text-center">
              <p className="text-[0.6rem] font-medium text-content-subtle">
                {day.date.toLocaleDateString(undefined, { weekday: 'short' })}
              </p>
              <Icon className={`mx-auto my-1 ${CONDITION_META[day.condition]?.tone}`} size={12} />
              <p className="text-[0.65rem] font-semibold text-content">{day.high}°</p>
              <p className="text-[0.6rem] text-content-subtle">{day.low}°</p>
            </div>
          );
        })}
      </div>

      {affected.length > 0 && (
        <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm dark:bg-amber-900/20">
          <p className="flex items-center gap-2 font-medium text-amber-800 dark:text-amber-300">
            <FaExclamationTriangle size={11} /> {affected.length} event{affected.length === 1 ? '' : 's'} on stormy days
          </p>
          <ul className="mt-1 space-y-0.5 pl-5 text-xs text-amber-700 dark:text-amber-400">
            {affected.slice(0, 3).map((event) => (
              <li key={event._id || event.id || event.start} className="list-disc">
                {event.title || 'Untitled event'}
              </li>
            ))}
          </ul>
          {onSuggestReschedule && (
            <button
              type="button"
              onClick={() => onSuggestReschedule(affected)}
              className="mt-2 text-xs font-semibold text-amber-800 underline dark:text-amber-300"
            >
              Suggest moving these
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherIntegration;
