/**
 * Deploy-path helpers.
 *
 * The app can be served from the domain root (Netlify/Render) or from a
 * sub-path such as `/scheduler/` (GitHub Pages). Vite exposes the configured
 * `base` as `import.meta.env.BASE_URL`, which always ends in a slash:
 *
 *   base '/'          -> BASE_PATH ''            appUrl('/tasks') -> '/tasks'
 *   base '/scheduler/'-> BASE_PATH '/scheduler'  appUrl('/tasks') -> '/scheduler/tasks'
 *
 * Use BASE_PATH as <BrowserRouter basename> and appUrl() for the handful of
 * hard navigations (window.location) that bypass the router.
 */

const rawBase = (import.meta.env && import.meta.env.BASE_URL) || '/';

/** Router basename: no trailing slash, empty string at the domain root. */
export const BASE_PATH = rawBase === '/' ? '' : rawBase.replace(/\/+$/, '');

/** Absolute URL path respecting the deploy base. */
export const appUrl = (path = '/') => {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${clean}` || '/';
};

export default BASE_PATH;
