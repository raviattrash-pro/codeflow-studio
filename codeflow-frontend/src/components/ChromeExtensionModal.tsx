import React, { useState } from 'react';
import {
  X, Globe, Copy, Check, Download, Layers, Sparkles,
  GitBranch, CheckCircle2, Shield, Eye
} from 'lucide-react';
import { ThemeMode } from './Header';

interface ChromeExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
}

export const ChromeExtensionModal: React.FC<ChromeExtensionModalProps> = ({
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
}) => {
  const [activeTab, setActiveTab] = useState<'MANIFEST' | 'CONTENT_SCRIPT' | 'POPUP_HTML'>('CONTENT_SCRIPT');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;
  const isLight = currentTheme === 'NORMAL';

  const contentScriptCode = `// CodeFlow Studio Chrome Extension (Manifest V3) - GitHub Overlay Injector
(function() {
  console.log('CodeFlow GitHub Architecture Overlay initialized.');

  // Detect if current page is a GitHub repository or Pull Request
  const isRepo = /github\\.com\\/[^\\/]+\\/[^\\/]+/.test(window.location.href);
  if (!isRepo) return;

  // Create floating CodeFlow HUD button on GitHub
  const floatingBtn = document.createElement('div');
  floatingBtn.id = 'codeflow-github-overlay-btn';
  floatingBtn.innerHTML = \`
    <div style="position:fixed;bottom:24px;right:24px;z-index:999999;background:#0f172a;border:1px solid #38bdf8;border-radius:12px;padding:10px 16px;box-shadow:0 10px 25px rgba(0,0,0,0.5);cursor:pointer;display:flex;align-items:center;gap:8px;font-family:monospace;color:#38bdf8;font-weight:bold;font-size:12px;">
      <span>⚡ Open CodeFlow Flow Map</span>
    </div>
  \`;

  document.body.appendChild(floatingBtn);

  floatingBtn.addEventListener('click', () => {
    // Inject interactive iframe overlay modal
    const overlay = document.createElement('div');
    overlay.id = 'codeflow-github-frame-modal';
    overlay.innerHTML = \`
      <div style="position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);z-index:9999999;display:flex;align-items:center;justify-content:center;padding:24px;">
        <div style="width:92vw;height:88vh;background:#0f172a;border:1px solid #334155;border-radius:16px;overflow:hidden;position:relative;">
          <button id="close-codeflow-overlay" style="position:absolute;top:12px;right:16px;background:#1e293b;border:1px solid #475569;color:#fff;border-radius:8px;padding:6px 12px;cursor:pointer;font-weight:bold;z-index:10;">✕ Close</button>
          <iframe src="https://codeflow-studio-app.vercel.app" style="width:100%;height:100%;border:none;"></iframe>
        </div>
      </div>
    \`;
    document.body.appendChild(overlay);

    document.getElementById('close-codeflow-overlay')?.addEventListener('click', () => {
      overlay.remove();
    });
  });
})();`;

  const manifestV3Code = `{
  "manifest_version": 3,
  "name": "CodeFlow Studio: GitHub Architecture Overlay",
  "version": "9.0.0",
  "description": "View interactive visual architecture maps, database ERD, and execution flow directly on GitHub.",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": "icons/icon48.png"
  },
  "content_scripts": [
    {
      "matches": ["https://github.com/*/*"],
      "js": ["content.js"],
      "run_at": "document_end"
    }
  ],
  "permissions": ["activeTab", "storage"]
}`;

  const popupHtmlCode = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { width: 320px; font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 16px; margin: 0; }
    h3 { margin-top: 0; color: #38bdf8; font-size: 14px; }
    .btn { display: block; width: 100%; padding: 8px 12px; background: #0284c7; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; text-align: center; margin-top: 8px; }
  </style>
</head>
<body>
  <h3>⚡ CodeFlow Studio Overlay</h3>
  <p style="font-size: 11px; color: #94a3b8;">1-click analyze current GitHub repository architecture.</p>
  <button class="btn" id="launch">Launch Flow Map</button>
</body>
</html>`;

  const getCode = () => {
    if (activeTab === 'MANIFEST') return manifestV3Code;
    if (activeTab === 'POPUP_HTML') return popupHtmlCode;
    return contentScriptCode;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="studio-modal-overlay">
      <div
        className="studio-modal-card w-full max-w-5xl flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: isLight ? '#ffffff' : '#0f172a' }}
      >
        {/* Header */}
        <div
          className="studio-modal-header flex items-center justify-between px-6 py-4"
          style={{ backgroundColor: isLight ? '#f1f5f9' : '#1e293b' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Chrome & GitHub Repository Overlay Extension</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  Manifest V3
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Overlay interactive architecture diagrams and AST flow maps directly inside github.com repositories
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Extension Bundle'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left GitHub Simulator */}
          <div
            className="studio-modal-sidebar md:col-span-4 p-4 space-y-4 overflow-y-auto"
            style={{ backgroundColor: isLight ? '#f8fafc' : '#090d16' }}
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                GitHub DOM Simulator
              </span>
              <div className="p-3.5 rounded-xl border border-slate-700/50 bg-[#141e33] space-y-2.5 font-mono text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold">github.com/org/repo</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#050811] border border-slate-800 space-y-1">
                  <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> CodeFlow DOM HUD Injected
                  </div>
                  <div className="text-[10px] text-slate-400">Floating Architecture Button on PR #142</div>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Supported Features on GitHub
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>1-Click Flow Map on GitHub PRs</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>Database ERD schema in sidebar</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>Zero local setup needed</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Code Display */}
          <div
            className="studio-modal-content md:col-span-8 flex flex-col p-5 space-y-3"
            style={{ backgroundColor: isLight ? '#ffffff' : '#070a12', minHeight: 0 }}
          >
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                {[
                  { id: 'CONTENT_SCRIPT', name: 'content.js (DOM Injector)' },
                  { id: 'MANIFEST', name: 'manifest.json (V3)' },
                  { id: 'POPUP_HTML', name: 'popup.html' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer"
                    style={{
                      backgroundColor: activeTab === t.id ? '#06b6d4' : (isLight ? '#f1f5f9' : '#1e293b'),
                      color: activeTab === t.id ? '#000000' : (isLight ? '#334155' : '#94a3b8')
                    }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="border border-slate-700/50 rounded-xl overflow-hidden flex-1 flex flex-col shadow-inner"
              style={{ backgroundColor: '#050811', minHeight: 0 }}
            >
              <pre className="p-4 text-xs font-mono text-cyan-300/90 leading-relaxed overflow-auto flex-1">
                {getCode()}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
