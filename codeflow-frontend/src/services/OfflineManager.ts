/**
 * OfflineManager — Detects network connectivity and manages offline state.
 */

type ConnectivityState = 'online' | 'offline' | 'checking';
type ConnectivityListener = (state: ConnectivityState) => void;

class OfflineManager {
  private state: ConnectivityState = navigator.onLine ? 'online' : 'offline';
  private listeners: Set<ConnectivityListener> = new Set();
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Browser online/offline events
    window.addEventListener('online', () => this.setState('online'));
    window.addEventListener('offline', () => this.setState('offline'));
  }

  /** Get current connectivity state */
  getState(): ConnectivityState {
    return this.state;
  }

  /** Whether the app is currently offline */
  get isOffline(): boolean {
    return this.state === 'offline';
  }

  /** Subscribe to connectivity changes */
  onStateChange(listener: ConnectivityListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setState(newState: ConnectivityState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.listeners.forEach(fn => fn(newState));
    }
  }

  /** Start periodic connectivity checks */
  startMonitoring(intervalMs: number = 30000): void {
    if (this.checkInterval) return;
    this.checkInterval = setInterval(async () => {
      try {
        this.setState('checking');
        const res = await fetch('/api/v1/health', { method: 'HEAD', cache: 'no-store' });
        this.setState(res.ok ? 'online' : 'offline');
      } catch {
        this.setState('offline');
      }
    }, intervalMs);
  }

  /** Stop periodic monitoring */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /** Cache project data to localStorage for offline access */
  cacheProjectData(projectId: string, data: unknown): void {
    try {
      const key = `codeflow_cache_${projectId}`;
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
        version: '10.0.0'
      }));
    } catch (e) {
      console.warn('[OfflineManager] Cache write failed:', e);
    }
  }

  /** Retrieve cached project data */
  getCachedProjectData(projectId: string): unknown | null {
    try {
      const key = `codeflow_cache_${projectId}`;
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Cache expires after 7 days
      if (Date.now() - parsed.timestamp > 7 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed.data;
    } catch {
      return null;
    }
  }
}

export const offlineManager = new OfflineManager();
export type { ConnectivityState };
