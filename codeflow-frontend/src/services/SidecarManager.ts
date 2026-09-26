/**
 * SidecarManager — Manages the Spring Boot backend sidecar process in Tauri Desktop mode.
 * In web mode, this is a no-op that reports the backend as externally managed.
 */

type BackendStatus = 'stopped' | 'starting' | 'running' | 'error' | 'external';
type StatusListener = (status: BackendStatus) => void;

class SidecarManager {
  private status: BackendStatus = 'stopped';
  private listeners: Set<StatusListener> = new Set();
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;
  private childPid: number | null = null;

  /** Check if running inside Tauri desktop shell */
  get isDesktop(): boolean {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  }

  /** Get the API base URL depending on runtime mode */
  get apiBaseUrl(): string {
    if (this.isDesktop) {
      return 'http://localhost:18080';
    }
    return ''; // Web mode uses relative URLs with Vite proxy
  }

  /** Get current backend status */
  getStatus(): BackendStatus {
    return this.status;
  }

  /** Subscribe to status changes */
  onStatusChange(listener: StatusListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setStatus(newStatus: BackendStatus): void {
    this.status = newStatus;
    this.listeners.forEach(fn => fn(newStatus));
  }

  /** Start the backend sidecar (only in Tauri desktop mode) */
  async startBackend(): Promise<void> {
    if (!this.isDesktop) {
      this.setStatus('external');
      console.log('[SidecarManager] Web mode — backend managed externally');
      return;
    }

    try {
      this.setStatus('starting');
      console.log('[SidecarManager] Starting backend sidecar...');

      // Dynamic import to avoid errors in web mode
      const pluginName = '@tauri-apps/plugin-shell';
      const { Command } = await import(/* @vite-ignore */ pluginName);

      const command = Command.sidecar('binaries/codeflow-backend', [
        '--spring.profiles.active=desktop',
        '--server.port=18080'
      ]);

      command.stdout.on('data', (line: string) => {
        console.log(`[Backend]: ${line}`);
        // Detect Spring Boot startup completion
        if (line.includes('Started') && line.includes('Application')) {
          this.setStatus('running');
        }
      });

      command.stderr.on('data', (line: string) => {
        console.warn(`[Backend ERR]: ${line}`);
      });

      command.on('close', (data: { code?: number }) => {
        console.log(`[SidecarManager] Backend exited with code ${data.code}`);
        this.childPid = null;
        if (this.status !== 'stopped') {
          this.setStatus('error');
        }
      });

      command.on('error', (error: unknown) => {
        console.error(`[SidecarManager] Backend error: ${error}`);
        this.setStatus('error');
      });

      const child = await command.spawn();
      this.childPid = child.pid;
      console.log(`[SidecarManager] Backend spawned with PID: ${child.pid}`);

      // Wait for backend to become healthy
      await this.waitForReady(60000);
    } catch (err) {
      console.error('[SidecarManager] Failed to start backend:', err);
      this.setStatus('error');
    }
  }

  /** Wait for backend health check to pass */
  private async waitForReady(timeoutMs: number): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const res = await fetch('http://localhost:18080/actuator/health');
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'UP') {
            this.setStatus('running');
            this.startHealthMonitor();
            return;
          }
        }
      } catch {
        // Backend not ready yet
      }
      await new Promise(r => setTimeout(r, 2000));
    }
    throw new Error('Backend health check timed out');
  }

  /** Periodic health monitoring */
  private startHealthMonitor(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const res = await fetch(`${this.apiBaseUrl}/actuator/health`);
        if (!res.ok) this.setStatus('error');
      } catch {
        this.setStatus('error');
      }
    }, 30000);
  }

  /** Stop the backend sidecar */
  async stopBackend(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    if (this.isDesktop && this.childPid) {
      try {
        const pluginName = '@tauri-apps/plugin-shell';
        const { Command } = await import(/* @vite-ignore */ pluginName);
        // Kill via taskkill on Windows
        await Command.create('taskkill', ['/F', '/PID', String(this.childPid)]).execute();
      } catch (err) {
        console.warn('[SidecarManager] Error stopping backend:', err);
      }
    }

    this.childPid = null;
    this.setStatus('stopped');
  }
}

/** Singleton instance */
export const sidecarManager = new SidecarManager();
export type { BackendStatus };
