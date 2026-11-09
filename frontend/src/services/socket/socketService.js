import { io } from 'socket.io-client';

/**
 * Thin, resilient wrapper around socket.io-client.
 *
 * - `on()` returns an unsubscribe function (contexts rely on this)
 * - connecting is lazy and never throws when the backend is unreachable
 * - the URL defaults to the same origin, which also makes the Vite dev proxy
 *   (`/socket.io`) work in previews and production without extra config
 */
class SocketService {
  constructor() {
    this.socket = null;
    this.enabled = true;
    this.listeners = new Map();
  }

  getUrl() {
    const configured = import.meta.env.VITE_SOCKET_URL;
    if (configured && configured !== 'undefined' && configured !== 'null') return configured;
    return typeof window !== 'undefined' ? window.location.origin : undefined;
  }

  connect() {
    if (!this.enabled) return null;
    if (this.socket?.connected || this.socket?.active) return this.socket;

    try {
      this.socket = io(this.getUrl(), {
        auth: { token: typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null },
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
        timeout: 5000,
      });

      this.socket.on('connect', () => {
        if (import.meta.env.DEV) console.info('[socket] connected');
        // Re-attach any listeners registered before the socket existed
        this.listeners.forEach((callbacks, event) => {
          callbacks.forEach((callback) => this.socket.on(event, callback));
        });
      });

      this.socket.on('connect_error', () => {
        // Real-time is a bonus feature, not a requirement.
        this.enabled = false;
        this.socket?.close();
      });
    } catch {
      this.enabled = false;
      this.socket = null;
    }

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (typeof callback !== 'function') return () => {};

    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(callback);

    const socket = this.connect();
    socket?.on(event, callback);

    return () => this.off(event, callback);
  }

  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks && callback) callbacks.delete(callback);
    if (this.socket) {
      if (callback) this.socket.off(event, callback);
      else this.socket.off(event);
    }
  }

  emit(event, data) {
    const socket = this.connect();
    if (socket?.connected) {
      socket.emit(event, data);
      return true;
    }
    return false;
  }
}

export const socketService = new SocketService();
export default socketService;
