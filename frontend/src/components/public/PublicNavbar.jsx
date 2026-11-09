import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaBars, FaTimes } from 'react-icons/fa';
import Brand from './Brand';
import ThemeMenu from '@components/layout/ThemeMenu';
import { useAuth } from '@contexts/AuthContext';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/features', label: 'Features' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const PublicNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-line bg-surface/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="section flex h-[4.5rem] items-center justify-between gap-4">
        <Brand />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-200'
                    : 'text-content-muted hover:bg-gray-100 hover:text-content dark:hover:bg-white/5'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeMenu compact />

          {user ? (
            <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-primary btn-sm ml-1">
              Open app <FaArrowRight size={11} />
            </button>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm ml-1 hidden sm:inline-flex">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm ml-1 hidden sm:inline-flex">
                Get started
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="btn btn-ghost btn-icon md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="border-t border-line bg-surface md:hidden">
          <div className="section flex flex-col gap-1 py-3">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                    isActive ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-200' : 'text-content-muted'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-line pt-3">
              <Link to={user ? '/dashboard' : '/login'} className="btn btn-outline btn-sm">
                {user ? 'Dashboard' : 'Sign in'}
              </Link>
              <Link to={user ? '/dashboard' : '/register'} className="btn btn-primary btn-sm">
                {user ? 'Open app' : 'Get started'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
