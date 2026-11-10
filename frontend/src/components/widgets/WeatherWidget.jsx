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
} from 'react-icons/fa';
import { useWeather, describeWeatherError, CONDITION_LABELS, CONDITION_TONE } from '@hooks/useWeather';

/**
 * Compact weather widget.
 *
 * Previously slept 800ms then picked a condition at random from a four-item
 * array and displayed it as fact. It now shows the real forecast for the
 * browser's location, and says so when it cannot get one.
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

const WeatherWidget = ({ unit = 'c', compact = false }) => {
  const { weather, place, loading, error, reload } = useWeather(unit);
  const unitLabel = unit === 'f' ? '°F' : '°C';

  if (loading) {
    return (
      <div className="card p-4">
        <p className="text-sm text-content-muted">Checking the weather…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <FaCloud className="mt-0.5 shrink-0 text-content-subtle" />
            <p className="text-xs text-content-muted">{describeWeatherError(error)}</p>
          </div>
          <button type="button" onClick={reload} className="shrink-0 text-content-subtle hover:text-content" aria-label="Retry weather">
            <FaRedo size={10} />
          </button>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const meta = {
    icon: CONDITION_ICON[weather.current.condition] || FaCloud,
    label: CONDITION_LABELS[weather.current.condition] || 'Cloudy',
    tone: CONDITION_TONE[weather.current.condition] || CONDITION_TONE.cloudy,
  };
  const Icon = meta.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <Icon className={`text-2xl ${meta.tone}`} />
        <div>
          <p className="text-lg font-bold text-content">
            {weather.current.temp}
            <span className="text-xs font-medium text-content-muted">{unitLabel}</span>
          </p>
          <p className="text-[0.65rem] text-content-muted">{meta.label}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-content-subtle">Weather</p>
          {place && (
            <p className="flex items-center gap-1 text-[0.68rem] text-content-muted">
              <FaMapMarkerAlt size={8} /> {place}
            </p>
          )}
        </div>
        <button type="button" onClick={reload} className="text-content-subtle hover:text-content" aria-label="Refresh weather">
          <FaRedo size={9} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <Icon className={`text-3xl ${meta.tone}`} />
        <div>
          <p className="text-2xl font-bold text-content">
            {weather.current.temp}
            <span className="text-sm font-medium text-content-muted">{unitLabel}</span>
          </p>
          <p className="text-xs text-content-muted">
            {meta.label} · {weather.current.humidity}% · <FaWind size={8} className="inline" /> {weather.current.wind} km/h
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-5 gap-1">
        {weather.forecast.slice(0, 5).map((day) => {
          const DayIcon = CONDITION_ICON[day.condition] || FaCloud;
          return (
            <div key={day.date.toISOString()} className="rounded-lg bg-surface-sunken/60 py-1.5 text-center">
              <p className="text-[0.55rem] font-medium text-content-subtle">
                {day.date.toLocaleDateString(undefined, { weekday: 'narrow' })}
              </p>
              <DayIcon className={`mx-auto my-0.5 ${CONDITION_TONE[day.condition]}`} size={10} />
              <p className="text-[0.6rem] font-semibold text-content">{day.high}°</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeatherWidget;
