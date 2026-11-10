import React, { useMemo, useState } from 'react';
import { FaCar, FaClock, FaRoute, FaInfoCircle } from 'react-icons/fa';

/**
 * Departure planner.
 *
 * This used to invent a "traffic level" between low/moderate/heavy with
 * `Math.random()`, and a suggested departure derived from that random number.
 * It also referenced an undefined `allEvents` variable, so it threw on mount.
 *
 * There is no live traffic feed wired into this app (that needs a paid
 * provider), so instead of inventing congestion we do the part that is real:
 * take each event, subtract the travel time the *user* supplies plus an
 * optional buffer, and show the time they need to leave. No fabricated
 * congestion, no guessed travel durations.
 */
const TrafficAware = ({ events = [], defaultTravelMinutes = 30, onUpdateDeparture }) => {
  const [travelMinutes, setTravelMinutes] = useState(defaultTravelMinutes);
  const [bufferMinutes, setBufferMinutes] = useState(10);

  const upcoming = useMemo(() => {
    const list = Array.isArray(events) ? events : [];
    const now = Date.now();

    return list
      .filter((event) => {
        const start = new Date(event?.start).getTime();
        return Number.isFinite(start) && start > now;
      })
      .sort((a, b) => new Date(a.start) - new Date(b.start))
      .slice(0, 6)
      .map((event) => {
        const start = new Date(event.start);
        const leaveAt = new Date(start.getTime() - (travelMinutes + bufferMinutes) * 60 * 1000);
        const minutesUntilLeave = Math.round((leaveAt.getTime() - now) / 60000);

        return {
          id: event._id || event.id || event.start,
          title: event.title || 'Untitled event',
          location: event.location || '',
          start,
          leaveAt,
          minutesUntilLeave,
        };
      });
  }, [events, travelMinutes, bufferMinutes]);

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center gap-3">
        <FaCar className="text-lg text-primary-600" />
        <div>
          <h3 className="font-semibold text-content">When to leave</h3>
          <p className="text-xs text-content-muted">Based on the travel time you set — not live traffic.</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="label">Travel time (min)</span>
          <input
            type="number"
            min={0}
            max={600}
            value={travelMinutes}
            onChange={(event) => setTravelMinutes(Math.max(0, Number(event.target.value) || 0))}
            className="input"
          />
        </label>
        <label className="block">
          <span className="label">Buffer (min)</span>
          <input
            type="number"
            min={0}
            max={180}
            value={bufferMinutes}
            onChange={(event) => setBufferMinutes(Math.max(0, Number(event.target.value) || 0))}
            className="input"
          />
        </label>
      </div>

      {upcoming.length === 0 ? (
        <p className="rounded-lg bg-surface-sunken p-3 text-sm text-content-muted">
          Nothing scheduled ahead. Add an event and its leave-by time will appear here.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {upcoming.map((item) => {
            const urgent = item.minutesUntilLeave <= 15 && item.minutesUntilLeave >= 0;
            const missed = item.minutesUntilLeave < 0;

            return (
              <li key={item.id} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-content">{item.title}</p>
                  <p className="flex items-center gap-1 text-xs text-content-muted">
                    <FaClock size={9} />
                    {item.start.toLocaleString(undefined, {
                      weekday: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {item.location && (
                      <>
                        <span className="mx-1">·</span>
                        <FaRoute size={9} />
                        <span className="truncate">{item.location}</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={`text-sm font-semibold ${
                      missed ? 'text-rose-600' : urgent ? 'text-amber-600' : 'text-content'
                    }`}
                  >
                    {item.leaveAt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-[0.65rem] text-content-subtle">
                    {missed
                      ? 'leave time passed'
                      : item.minutesUntilLeave < 60
                        ? `in ${item.minutesUntilLeave} min`
                        : `in ${Math.round(item.minutesUntilLeave / 60)} h`}
                  </p>
                  {onUpdateDeparture && (
                    <button
                      type="button"
                      onClick={() => onUpdateDeparture(item.id, item.leaveAt)}
                      className="mt-1 text-[0.65rem] font-semibold text-primary-600 hover:underline"
                    >
                      add reminder
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 flex items-start gap-2 rounded-lg bg-surface-sunken p-3 text-xs text-content-subtle">
        <FaInfoCircle className="mt-0.5 shrink-0" />
        <span>
          Live traffic is not connected. These times are your travel estimate plus buffer, so add extra
          during rush hour.
        </span>
      </p>
    </div>
  );
};

export default TrafficAware;
