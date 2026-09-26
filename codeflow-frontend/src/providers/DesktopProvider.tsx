import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { sidecarManager, type BackendStatus } from '../services/SidecarManager';

interface DesktopContextValue {
  /** Whether app is running in Tauri desktop shell */
  isDesktop: boolean;
  /** Current backend sidecar status */
  backendStatus: BackendStatus;
  /** Whether the app is offline (no internet) */
  isOffline: boolean;
  /** API base URL (empty string for web, http://localhost:18080 for desktop) */
  apiBaseUrl: string;
  /** Restart the backend sidecar */
  restartBackend: () => Promise<void>;
}

const DesktopContext = createContext<DesktopContextValue>({
  isDesktop: false,
  backendStatus: 'external',
  isOffline: false,
  apiBaseUrl: '',
  restartBackend: async () => {},
});

export const useDesktop = () => useContext(DesktopContext);

interface DesktopProviderProps {
  children: ReactNode;
}

export const DesktopProvider: React.FC<DesktopProviderProps> = ({ children }) => {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('stopped');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const isDesktop = sidecarManager.isDesktop;
  const apiBaseUrl = sidecarManager.apiBaseUrl;

  // Listen for backend status changes
  useEffect(() => {
    const unsubscribe = sidecarManager.onStatusChange(setBackendStatus);
    return unsubscribe;
  }, []);

  // Start backend on mount (desktop only)
  useEffect(() => {
    sidecarManager.startBackend();
    return () => {
      sidecarManager.stopBackend();
    };
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const restartBackend = useCallback(async () => {
    await sidecarManager.stopBackend();
    await sidecarManager.startBackend();
  }, []);

  return (
    <DesktopContext.Provider value={{ isDesktop, backendStatus, isOffline, apiBaseUrl, restartBackend }}>
      {/* Desktop loading splash */}
      {isDesktop && backendStatus === 'starting' && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/90 backdrop-blur-xl">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <h1 className="text-3xl font-bold text-white">CodeFlow Studio</h1>
            <p className="text-zinc-400 text-lg">Starting analysis engine...</p>
            <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              Initializing Spring Boot sidecar
            </div>
          </div>
        </div>
      )}

      {/* Desktop error state */}
      {isDesktop && backendStatus === 'error' && (
        <div className="fixed bottom-4 right-4 z-[999999] bg-red-950 border border-red-500/50 rounded-xl p-4 max-w-sm shadow-2xl">
          <p className="text-red-300 font-semibold">⚠️ Backend Disconnected</p>
          <p className="text-red-400/70 text-sm mt-1">The analysis engine stopped unexpectedly.</p>
          <button
            onClick={restartBackend}
            className="mt-3 px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm transition-colors"
          >
            Restart Engine
          </button>
        </div>
      )}

      {children}
    </DesktopContext.Provider>
  );
};
