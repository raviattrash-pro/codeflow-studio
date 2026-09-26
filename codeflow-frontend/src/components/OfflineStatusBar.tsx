import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Plane, RefreshCw } from 'lucide-react';
import { useDesktop } from '../providers/DesktopProvider';

const OfflineStatusBar: React.FC<{ isLight?: boolean }> = ({ isLight }) => {
  const { isDesktop, isOffline, backendStatus } = useDesktop();
  const [showDetails, setShowDetails] = useState(false);
  const [pulse, setPulse] = useState(false);

  // Pulse animation on state change
  useEffect(() => {
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 1500);
    return () => clearTimeout(t);
  }, [isOffline, backendStatus]);

  // Don't render in web mode when online and healthy
  if (!isDesktop && !isOffline) return null;

  const bgColor = isOffline
    ? 'bg-amber-500/10 border-amber-500/30'
    : backendStatus === 'running'
      ? 'bg-emerald-500/10 border-emerald-500/30'
      : 'bg-zinc-500/10 border-zinc-500/30';

  const textColor = isOffline
    ? (isLight ? 'text-amber-700' : 'text-amber-300')
    : (isLight ? 'text-emerald-700' : 'text-emerald-300');

  const StatusIcon = isOffline ? WifiOff : Wifi;

  return (
    <>
      {/* Floating pill */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`fixed bottom-4 left-4 z-[99999] flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-xl text-xs font-medium transition-all duration-300 ${bgColor} ${textColor} ${pulse ? 'scale-110' : 'scale-100'} hover:scale-105`}
      >
        {isOffline ? (
          <><Plane size={14} className="animate-pulse" /> Air-Gap Mode</>
        ) : isDesktop ? (
          <><StatusIcon size={14} /> Desktop<span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /></>
        ) : (
          <><StatusIcon size={14} /> Online</>
        )}
      </button>

      {/* Details panel */}
      {showDetails && (
        <div className={`fixed bottom-14 left-4 z-[99999] w-72 rounded-xl border backdrop-blur-xl p-4 shadow-2xl ${isLight ? 'bg-white/90 border-zinc-200' : 'bg-zinc-900/90 border-zinc-700'}`}>
          <h4 className={`text-sm font-semibold mb-3 ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>System Status</h4>

          <div className="space-y-2.5">
            {/* Network */}
            <div className="flex items-center justify-between">
              <span className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Network</span>
              <span className={`text-xs font-medium ${isOffline ? 'text-amber-400' : 'text-emerald-400'}`}>
                {isOffline ? '⚠ Disconnected' : '● Connected'}
              </span>
            </div>

            {/* Backend */}
            <div className="flex items-center justify-between">
              <span className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Analysis Engine</span>
              <span className={`text-xs font-medium ${
                backendStatus === 'running' ? 'text-emerald-400' :
                backendStatus === 'starting' ? 'text-amber-400' :
                backendStatus === 'error' ? 'text-red-400' : 'text-zinc-400'
              }`}>
                {backendStatus === 'running' ? '● Running' :
                 backendStatus === 'starting' ? '◐ Starting...' :
                 backendStatus === 'error' ? '✖ Error' :
                 backendStatus === 'external' ? '● External' : '○ Stopped'}
              </span>
            </div>

            {/* Runtime Mode */}
            <div className="flex items-center justify-between">
              <span className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Mode</span>
              <span className={`text-xs font-medium ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
                {isDesktop ? '🖥️ Desktop (Tauri)' : '🌐 Web Browser'}
              </span>
            </div>

            {/* AI Provider */}
            <div className="flex items-center justify-between">
              <span className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>AI Provider</span>
              <span className={`text-xs font-medium ${isOffline ? 'text-amber-400' : 'text-zinc-400'}`}>
                {isOffline ? '🦙 Ollama (Local)' : '☁️ Cloud / Ollama'}
              </span>
            </div>
          </div>

          <div className={`mt-3 pt-3 border-t ${isLight ? 'border-zinc-200' : 'border-zinc-700'}`}>
            <p className={`text-[10px] ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {isOffline
                ? 'All analysis runs locally. AI features require Ollama.'
                : 'Connected to remote services. All features available.'}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default OfflineStatusBar;
