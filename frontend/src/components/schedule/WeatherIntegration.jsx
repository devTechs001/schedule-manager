import React from 'react';
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
import {
  useWeather,
  describeWeatherError,
  DISRUPTIVE_CONDITIONS,
  CONDITION_LABELS,
  CONDITION_TONE,
} from '@hooks/useWeather';

/**
 * Weather for the user's location, with a note on which events it affects.
 *
 * The previous implementation slept for a second and then invented a 7-day
 * forecast out of Math.random(), including for "New York" — a location the
 * user never chose. Forecast data now comes from Open-Meteo via useWeather,
 * and a refused location is reported rather than guessed at.
 */
const CONDITION_ICON = {
  sunny: FaSun,
  'partly-cloudy': FaCloud,
  cloudy: FaCloud,
  fog: FaCloud,
  drizzle: FaCloudRain,
  rainy: FaCloudRain,
  snowy: FaSnowflake,
  stormy: FaExclamationTriangle,
};

const WeatherIntegration = ({ events = [], onSuggestReschedule, unit = 'c' }) => {
  const { weather, place, loading, error, reload } = useWeather(unit);
  const unitLabel = unit === 'f' ? '°F' : '°C';

  // Which upcoming events fall on a day the forecast calls disruptive.
  const affected = (() => {
    if (!weather || !Array.isArray(events)) return [];
    const badDays = new Set(
      weather.forecast
        .filter((day) => DISRUPTIVE_CONDITIONS.has(day.condition))
        .map((day) => new Date(day.date).toDateString())
    );
    return events.filter((event) => {
      if (!event?.start) return false;
      return badDays.has(new Date(event.start).toDateString());
    });
  })();

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
          <span>{describeWeatherError(error)}</span>
        </p>
        <button type="button" onClick={reload} className="btn btn-outline btn-sm mt-3">
          <FaRedo size={9} /> Try again
        </button>
      </div>
    );
  }

  if (!weather) return null;

  const CurrentIcon = CONDITION_ICON[weather.current.condition] || FaCloud;

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
        <button type="button" onClick={reload} className="btn btn-ghost btn-sm" aria-label="Refresh weather">
          <FaRedo size={9} />
        </button>
      </div>

      <div className="mb-5 flex items-center gap-4">
        <CurrentIcon className={`text-4xl ${CONDITION_TONE[weather.current.condition]}`} />
        <div>
          <p className="text-3xl font-bold text-content">
            {weather.current.temp}
            <span className="text-lg font-medium text-content-muted">{unitLabel}</span>
          </p>
          <p className="text-sm text-content-muted">{CONDITION_LABELS[weather.current.condition]}</p>
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
          const Icon = CONDITION_ICON[day.condition] || FaCloud;
          return (
            <div key={day.date.toISOString()} className="rounded-lg bg-surface-sunken/60 p-2 text-center">
              <p className="text-[0.6rem] font-medium text-content-subtle">
                {day.date.toLocaleDateString(undefined, { weekday: 'short' })}
              </p>
              <Icon className={`mx-auto my-1 ${CONDITION_TONE[day.condition]}`} size={12} />
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
