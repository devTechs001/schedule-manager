import React from 'react';
import { FaTrophy, FaMedal, FaCrown, FaUserFriends } from 'react-icons/fa';

/**
 * Leaderboard — real standings only.
 *
 * This component used to ship a `defaultUsers` array of seven people who do not
 * exist (Alex Johnson, Sarah Williams, Mike Chen …) with invented scores, deltas
 * and task counts, and rendered it whenever no real users were passed in. Since
 * the page passed none, every visitor to /leaderboard saw a table of strangers
 * ranked above them.
 *
 * There is no scores table on the server. What does exist is the signed-in
 * user's own score, derived from tasks they actually completed (see usePoints).
 * So the leaderboard is built from an explicit `entries` list — rows that carry
 * real numbers — and shows an honest empty state when nobody has a score yet.
 *
 * Dropped along with the fake users:
 *   - the daily/weekly/monthly/all-time tabs, which changed nothing: the score
 *     is cumulative over all completed tasks, so a "daily" tab would have shown
 *     the same number.
 *   - the up/down "change" column, which implied a comparison to a previous
 *     period that was never recorded.
 */
const Leaderboard = ({ entries = [], subtitle = 'Derived from tasks you have actually completed.' }) => {
  const rows = (Array.isArray(entries) ? entries : []).filter(
    (entry) => entry && Number.isFinite(entry.points)
  );

  const getRankIcon = (rank) => {
    if (rank === 1) return <FaCrown className="text-yellow-500" />;
    if (rank === 2) return <FaMedal className="text-gray-400" />;
    if (rank === 3) return <FaMedal className="text-amber-600" />;
    return <span className="text-gray-500 font-medium">{rank}</span>;
  };

  const getRankBgColor = (rank, isCurrentUser) => {
    if (isCurrentUser) return 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500';
    if (rank === 1) return 'bg-yellow-50 dark:bg-yellow-900/20';
    if (rank === 2) return 'bg-gray-50 dark:bg-gray-700/50';
    if (rank === 3) return 'bg-amber-50 dark:bg-amber-900/20';
    return '';
  };

  if (rows.length === 0) {
    return (
      <div className="card p-8 text-center">
        <FaTrophy className="mx-auto mb-3 text-2xl text-content-subtle" />
        <p className="font-semibold text-content">No scores yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-content-muted">
          Complete a task and your score appears here. Scores are worked out from
          your own completed tasks — the app does not record scores for anyone
          else, so there is nobody to rank you against.
        </p>
      </div>
    );
  }

  const podium = rows.slice(0, 3);

  return (
    <div className="card p-6">
      <div className="mb-1 flex items-center gap-3">
        <FaTrophy className="text-xl text-yellow-500" />
        <h3 className="text-lg font-semibold text-content">Standings</h3>
      </div>
      <p className="mb-6 text-sm text-content-muted">{subtitle}</p>

      {podium.length > 0 && (
        <div className="mb-8 flex items-end justify-center gap-4">
          {podium.map((entry, index) => (
            <div key={entry.id ?? entry.name} className="text-center">
              <div
                className={`mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white ${
                  index === 0
                    ? 'bg-yellow-500 ring-4 ring-yellow-300'
                    : index === 1
                      ? 'bg-gray-400'
                      : 'bg-amber-600'
                }`}
              >
                {entry.avatar || (entry.name || '?').charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-medium text-content">{entry.name}</p>
              <p className="text-xs text-content-muted">{entry.points.toLocaleString()} pts</p>
              <div
                className={`mt-2 flex w-20 items-center justify-center rounded-t-lg font-bold text-white ${
                  index === 0 ? 'h-32 bg-yellow-400' : index === 1 ? 'h-24 bg-gray-300' : 'h-20 bg-amber-500'
                }`}
              >
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {rows.map((entry, index) => (
          <div
            key={entry.id ?? entry.name}
            className={`flex items-center gap-4 rounded-lg p-3 ${getRankBgColor(index + 1, entry.isCurrentUser)}`}
          >
            <div className="flex w-8 justify-center">{getRankIcon(index + 1)}</div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 font-medium text-white">
              {entry.avatar || (entry.name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`font-medium ${entry.isCurrentUser ? 'text-primary-600' : 'text-content'}`}>
                  {entry.name}
                </span>
                {entry.isCurrentUser && (
                  <span className="rounded-full bg-primary-600 px-2 py-0.5 text-xs text-white">You</span>
                )}
              </div>
              <span className="text-sm text-content-muted">
                {entry.tasksCompleted ?? 0} tasks completed
              </span>
            </div>
            <p className="font-bold text-content">{entry.points.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 flex items-start gap-2 text-xs text-content-muted">
        <FaUserFriends className="mt-0.5 shrink-0" />
        Team scores need a server that records them; until then this shows only
        scores that really exist.
      </p>
    </div>
  );
};

export default Leaderboard;
