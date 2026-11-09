import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaChevronDown, FaSignOutAlt, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { NAV_SECTIONS, SETTINGS_ITEM, FOOTER_LINKS } from './navConfig';
import Brand from '@components/public/Brand';
import { useAuth } from '@contexts/AuthContext';

const STORAGE_KEY = 'sidebar:collapsed';

const Sidebar = ({ isOpen, onClose, collapsed = false, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [openSections, setOpenSections] = useState({ team: false });

  useEffect(() => {
    // Auto-open the section that contains the active route
    if (location.pathname.startsWith('/collaboration') || location.pathname.startsWith('/leader')) {
      setOpenSections((sections) => ({ ...sections, team: true }));
    }
  }, [location.pathname]);

  const toggleSection = (id) =>
    setOpenSections((sections) => ({ ...sections, [id]: !sections[id] }));

  const handleNavigate = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) onClose?.();
  };

  const initials = (user?.name || 'You')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-neutral-950/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-[70] flex flex-col border-r border-line bg-surface transition-[width,transform] duration-300 ease-spring
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        style={{ width: collapsed ? '5.25rem' : 'var(--sidebar-w)' }}
        aria-label="Primary"
      >
        {/* Brand row */}
        <div className={`flex h-[var(--header-h)] shrink-0 items-center border-b border-line px-4 ${collapsed ? 'justify-center px-0' : 'justify-between'}`}>
          <Brand showText={!collapsed} subtitle={collapsed ? null : 'AI schedule manager'} />
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-icon lg:hidden"
            aria-label="Close menu"
          >
            <FaTimes size={15} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 scrollbar-none">
          {NAV_SECTIONS.map((section) => {
            const isCollapsedSection = section.collapsible && !openSections[section.id] && !collapsed;
            return (
              <div key={section.id} className="mb-1">
                {!collapsed && section.title && (
                  section.collapsible ? (
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className="nav-section-label flex w-full items-center justify-between hover:text-content"
                      aria-expanded={!isCollapsedSection}
                    >
                      {section.title}
                      <FaChevronDown
                        size={9}
                        className={`transition-transform ${isCollapsedSection ? '-rotate-90' : ''}`}
                      />
                    </button>
                  ) : (
                    <p className="nav-section-label">{section.title}</p>
                  )
                )}

                {section.items.length > 0 && !(isCollapsedSection && !collapsed) && (
                  <ul className="space-y-0.5">
                    {section.items.map((item) => (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          end={item.to !== '/collaboration' && item.to !== '/analytics'}
                          onClick={handleNavigate}
                          title={collapsed ? item.label : undefined}
                          className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'sidebar-link-active' : ''} ${
                              collapsed ? 'sidebar-link-collapsed' : ''
                            }`
                          }
                        >
                          <item.icon size={16} className="shrink-0" />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-line p-3">
          {/* Direct links to pages that are otherwise only reachable from
              Settings, so nothing is buried behind a URL you must remember. */}
          {!collapsed && (
            <div className="mb-2 space-y-0.5">
              {FOOTER_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={handleNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[0.7rem] font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-200'
                        : 'text-content-subtle hover:bg-gray-100 hover:text-content dark:hover:bg-white/5'
                    }`
                  }
                >
                  <link.icon size={10} className="shrink-0" />
                  <span className="truncate">{link.label}</span>
                </NavLink>
              ))}
            </div>
          )}

          <NavLink
            to={SETTINGS_ITEM.to}
            onClick={handleNavigate}
            title={collapsed ? SETTINGS_ITEM.label : undefined}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''} ${collapsed ? 'sidebar-link-collapsed' : ''}`
            }
          >
            <SETTINGS_ITEM.icon size={16} className="shrink-0" />
            {!collapsed && <span>Settings</span>}
          </NavLink>

          {/* User card */}
          <div className={`mt-2 flex items-center gap-2.5 rounded-xl bg-surface-sunken p-2 ${collapsed ? 'justify-center' : ''}`}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent-gradient text-[0.65rem] font-bold text-white">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </span>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-content">{user?.name || 'Guest'}</p>
                  <p className="truncate text-[0.65rem] text-content-subtle">{user?.email || 'Not signed in'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="rounded-lg p-1.5 text-content-subtle transition-colors hover:bg-white/60 hover:text-rose-500 dark:hover:bg-white/10"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <FaSignOutAlt size={12} />
                </button>
              </>
            )}
          </div>

          {/* Collapse toggle (desktop) */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`btn btn-ghost btn-sm mt-2 hidden w-full lg:inline-flex ${collapsed ? 'justify-center px-0' : 'justify-between'}`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <FaChevronRight size={11} />
            ) : (
              <>
                <span className="text-[0.7rem] font-medium">Collapse</span>
                <FaChevronLeft size={11} />
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export const useSidebarPreference = () => {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  return { collapsed, toggle: () => setCollapsed((value) => !value) };
};

export default Sidebar;
