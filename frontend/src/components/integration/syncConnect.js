/**
 * Shared connect gate for the integration sync panels
 * (Calendar / Email / CRM / Documents / Projects).
 *
 * Every one of those components used to "connect" by awaiting a two second
 * timeout and then adding the provider to local state. That is a promise the
 * app cannot keep: no OAuth flow ran, no account was linked, and nothing was
 * ever synced — the panel simply redrew itself as connected, and then showed
 * invented counts ("45 events synced", "234 emails") for an account that had
 * never been authorised.
 *
 * There is no OAuth flow or sync endpoint behind these panels yet, so the
 * honest answer is to say so. A parent that really does own the connection
 * lifecycle passes `onConnect` (which performs the real work) and this gate
 * defers to it. Without it, connecting is refused and the refusal is surfaced
 * to the user instead of being swallowed.
 *
 * Mirrored by scripts/test-sync-connect.mjs.
 */

export const NOT_CONFIGURED =
  'not configured on this deployment yet, so nothing was connected.';

/**
 * @param {string} providerName  label used in the refusal message
 * @param {Function|undefined} onConnect  real connect handler, if one exists
 * @returns {{ok: boolean, message: string}}
 */
export function connectProvider(providerName, onConnect) {
  if (typeof onConnect === 'function') {
    try {
      onConnect();
      return {
        ok: true,
        message: `Connecting ${providerName}…`,
      };
    } catch (error) {
      return {
        ok: false,
        message: `${providerName} could not be connected: ${error?.message || 'unknown error'}.`,
      };
    }
  }
  return {
    ok: false,
    message: `${providerName} is ${NOT_CONFIGURED}`,
  };
}

/**
 * Same contract for a manual sync of an already-linked provider. Without a
 * real `onSync` there is nothing to pull, so it reports that rather than
 * flipping a spinner and stamping a fresh "Last sync" time.
 */
export function syncProvider(providerName, onSync) {
  if (typeof onSync === 'function') {
    try {
      onSync();
      return { ok: true, message: `Syncing ${providerName}…` };
    } catch (error) {
      return {
        ok: false,
        message: `${providerName} could not be synced: ${error?.message || 'unknown error'}.`,
      };
    }
  }
  return {
    ok: false,
    message: `Syncing ${providerName} is ${NOT_CONFIGURED}`,
  };
}
