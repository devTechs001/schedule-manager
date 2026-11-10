import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaEllipsisH, FaTimes } from 'react-icons/fa';
import { MOBILE_PRIMARY, MOBILE_SECONDARY } from './navConfig';

/**
 * The "More" sheet closes whenever the route changes.
 *
 * This used to be an effect that called setMoreOpen(false) on every pathname
 * change — a setState inside an effect, which React flags because it forces a
 * second render pass on every navigation. Tracking which route the sheet was
 * opened on is equivalent and needs no effect: if the path no longer matches,
 * the sheet is closed.
 */
const BottomNavigation = () => {
  const location = useLocation();
  const [openedOn, setOpenedOn] = useState(null);
  const moreOpen = openedOn === location.pathname;

  const setMoreOpen = (open) => setOpenedOn(open ? location.pathname : null);

  const secondaryActive = MOBILE_SECONDARY.some((item) => location.pathname.startsWith(item.to));

  return (
    <>
      {/* More sheet */}
      {moreOpen && (
        <div className="fixed inset-0 z-[75] lg:hidden">
          <div className="absolute inset-0 bg-neutral-950/50 backdrop-blur-sm" onClick={() => setMoreOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 safe-bottom rounded-t-3xl border-t border-line bg-surface-raised p-4 shadow-lift animate-fade-up">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-content">More</p>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="btn btn-ghost btn-icon"
                aria-label="Close"
              >
                <FaTimes size={14} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MOBILE_SECONDARY.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-[0.68rem] font-medium transition-colors ${
                      isActive
                        ? 'border-primary-300 bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-200'
                        : 'border-line text-content-muted hover:border-primary-200'
                    }`
                  }
                >
                  <item.icon size={16} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-[70] border-t border-line bg-surface/95 backdrop-blur-xl safe-bottom lg:hidden"
        aria-label="Mobile"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-1.5 py-1.5">
          {MOBILE_PRIMARY.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to !== '/analytics'}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[0.6rem] font-medium transition-colors ${
                  isActive ? 'text-primary-600 dark:text-primary-300' : 'text-content-subtle'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-7 w-11 items-center justify-center rounded-lg transition-colors ${
                      isActive ? 'bg-primary-50 dark:bg-primary-500/15' : ''
                    }`}
                  >
                    <item.icon size={15} />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[0.6rem] font-medium transition-colors ${
              secondaryActive || moreOpen ? 'text-primary-600 dark:text-primary-300' : 'text-content-subtle'
            }`}
            aria-expanded={moreOpen}
          >
            <span
              className={`flex h-7 w-11 items-center justify-center rounded-lg transition-colors ${
                secondaryActive || moreOpen ? 'bg-primary-50 dark:bg-primary-500/15' : ''
              }`}
            >
              <FaEllipsisH size={15} />
            </span>
            More
          </button>
        </div>
      </nav>
    </>
  );
};

export default BottomNavigation;
