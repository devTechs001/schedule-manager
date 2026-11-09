import React, { useEffect } from 'react';
import { appUrl } from '@utils/basePath';
import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import PublicNavbar from '@components/public/PublicNavbar';
import PublicFooter from '@components/public/PublicFooter';

/**
 * Marketing shell (Home / Features / About / Contact).
 * Visiting any of these pages with ?demo=1 provisions a local demo session so
 * links shared with reviewers just work.
 */
const PublicLayout = () => {
  const { pathname, hash } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Deep-linkable demo: /?demo=1, /features?demo=1, ...
  useEffect(() => {
    if (searchParams.get('demo') !== '1') return;
    try {
      localStorage.setItem('demoSession', 'true');
    } catch {
      /* ignore */
    }
    toast.success('Demo mode enabled — opening your dashboard');
    const next = new URLSearchParams(searchParams);
    next.delete('demo');
    setSearchParams(next, { replace: true });
    window.location.assign(appUrl('/dashboard'));
  }, [searchParams, setSearchParams]);

  // Scroll to top on route change, or to an anchor when one is present
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.replace('#', ''));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
