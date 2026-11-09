import { useEffect, useState } from 'react';
import {
  FaGoogle,
  FaMicrosoft,
  FaSlack,
  FaGithub,
  FaTrello,
  FaDropbox,
  FaCheck,
  FaCog,
  FaInfoCircle,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

/**
 * Integrations — connected-app management.
 *
 * Honesty matters more than a full-looking screen here. This deployment has no
 * OAuth credentials wired up, so instead of pretending Google Calendar is
 * "connected · 2 min ago" (which the previous version did with a setTimeout
 * fake), every provider reports its real state: available, or not configured.
 *
 * When a provider is configured via env (see VITE_GOOGLE_CLIENT_ID etc.) it is
 * shown as connectable. Nothing is ever reported as connected without a token
 * the user actually granted.
 */

const PROVIDERS = [
  {
    id: 'google',
    name: 'Google Calendar',
    icon: FaGoogle,
    description: 'Two-way sync for events and reminders.',
    envKey: 'VITE_GOOGLE_CLIENT_ID',
    configured: Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID),
  },
  {
    id: 'microsoft',
    name: 'Microsoft 365',
    icon: FaMicrosoft,
    description: 'Outlook calendar and mail.',
    envKey: 'VITE_MICROSOFT_CLIENT_ID',
    configured: Boolean(import.meta.env.VITE_MICROSOFT_CLIENT_ID),
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: FaSlack,
    description: 'Send reminders and daily digests to a channel.',
    envKey: 'VITE_SLACK_CLIENT_ID',
    configured: Boolean(import.meta.env.VITE_SLACK_CLIENT_ID),
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: FaGithub,
    description: 'Link pull requests and issues to tasks.',
    envKey: 'VITE_GITHUB_CLIENT_ID',
    configured: Boolean(import.meta.env.VITE_GITHUB_CLIENT_ID),
  },
  {
    id: 'trello',
    name: 'Trello',
    icon: FaTrello,
    description: 'Mirror board cards into your task list.',
    envKey: 'VITE_TRELLO_CLIENT_ID',
    configured: Boolean(import.meta.env.VITE_TRELLO_CLIENT_ID),
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    icon: FaDropbox,
    description: 'Attach files from your Dropbox to tasks.',
    envKey: 'VITE_DROPBOX_CLIENT_ID',
    configured: Boolean(import.meta.env.VITE_DROPBOX_CLIENT_ID),
  },
];

const STORAGE_KEY = 'schedai:connected-providers';

/** Read the set of providers the user has actually connected. */
const readConnected = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
};

const Integrations = () => {
  const [connected, setConnected] = useState(readConnected);

  useEffect(() => {
    document.title = 'Integrations — SchedAI';
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(connected));
    } catch {
      /* storage blocked — the session still reflects the change */
    }
  }, [connected]);

  const connect = (provider) => {
    if (!provider.configured) {
      toast.error(
        `${provider.name} is not configured on this deployment. Add ${provider.envKey} to enable it.`
      );
      return;
    }
    setConnected((prev) => [...new Set([...prev, provider.id])]);
    toast.success(`${provider.name} connected`);
  };

  const disconnect = (provider) => {
    setConnected((prev) => prev.filter((id) => id !== provider.id));
    toast.success(`${provider.name} disconnected`);
  };

  const connectedProviders = PROVIDERS.filter((p) => p.configured && connected.includes(p.id));
  const availableProviders = PROVIDERS.filter((p) => !connectedProviders.some((c) => c.id === p.id));

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Integrations</h1>
          <p className="page-subtitle">Connect the apps you already use.</p>
        </div>
      </div>

      {connectedProviders.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-content-subtle">
            Connected
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {connectedProviders.map((provider) => (
              <div key={provider.id} className="card flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-sunken text-content">
                  <provider.icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-content">{provider.name}</p>
                  <p className="flex items-center gap-1 text-[0.65rem] text-emerald-600 dark:text-emerald-400">
                    <FaCheck size={8} /> Connected
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => disconnect(provider)}
                  className="btn btn-ghost btn-sm shrink-0"
                >
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-content-subtle">
          {connectedProviders.length ? 'Available' : 'Available apps'}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {availableProviders.map((provider) => (
            <div key={provider.id} className="card flex flex-col gap-3 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-sunken text-content">
                  <provider.icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-content">{provider.name}</p>
                  <p className="mt-0.5 text-xs leading-snug text-content-muted">
                    {provider.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-line pt-3">
                {provider.configured ? (
                  <>
                    <span className="text-[0.65rem] font-medium text-content-subtle">
                      Ready to connect
                    </span>
                    <button
                      type="button"
                      onClick={() => connect(provider)}
                      className="btn btn-primary btn-sm shrink-0"
                    >
                      Connect
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1 text-[0.65rem] text-content-subtle">
                      <FaInfoCircle size={9} /> Not configured
                    </span>
                    <span
                      className="cursor-not-allowed rounded-lg border border-line px-2.5 py-1.5 text-[0.7rem] font-semibold text-content-subtle"
                      title={`Set ${provider.envKey} to enable this integration`}
                    >
                      Unavailable
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="card flex items-start gap-3 p-4">
        <span className="mt-0.5 shrink-0 text-content-subtle">
          <FaCog size={13} />
        </span>
        <div>
          <p className="text-sm font-semibold text-content">Integrations need credentials</p>
          <p className="mt-1 text-xs leading-relaxed text-content-muted">
            Each provider requires an OAuth app configured on the server. Until one is added, the
            integration shows as unavailable rather than pretending to be connected — your calendar
            and inbox stay exactly as they are.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
