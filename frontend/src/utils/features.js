/**
 * Build-time feature flags.
 *
 * The demo sandbox exists so the product can be explored before a real account
 * exists. It is a development aid, not a product feature: in a production build
 * it must never appear, so no one mistakes seeded sandbox data for their own
 * workspace.
 *
 * IMPORTANT: these reads must stay as a bare `import.meta.env.DEV` member
 * expression. Vite statically replaces that exact shape at build time; writing
 * `import.meta.env?.DEV` defeats the replacement and leaves `import.meta`
 * behind, which throws in any non-ESM context (and in the module checker).
 */

/** True only in `vite dev`. Statically false in every production build. */
export const DEMO_ENABLED = import.meta.env.DEV;

/** Whether a realtime socket endpoint was configured at build time. */
export const REALTIME_ENABLED = Boolean(import.meta.env.VITE_WS_URL);

export default { DEMO_ENABLED, REALTIME_ENABLED };
