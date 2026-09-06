import React, { useState, useRef, useEffect } from 'react';
import { Layers, Search, Database, ShieldCheck, Bot, Package, Download, X, FolderTree, Menu, Import, LogOut, ChevronDown, Activity, Moon, Sun, Sparkles, Box, BarChart2, Flame, Zap } from 'lucide-react';
import { ProjectNode } from '../types';

export type ThemeMode = 'NIGHT' | 'NORMAL' | 'NEUMORPHIC' | 'GLASSMORPHISM';

interface HeaderProps {
  currentProjectName?: string;
  currentProjectId?: string | null;
  onLoadDemo?: () => void;
  onOpenIngestModal: () => void;
  onOpenDependencies: () => void;
  onOpenSqlExplorer: () => void;
  onOpenAiAssistant: () => void;
  onOpenErDiagram: () => void;
  onOpenSecurityFlow: () => void;
  onOpenFileTree: () => void;
  onOpenRuntimeTracing?: () => void;
  onOpenApiMetrics?: () => void;
  onOpenSequenceDiagram?: () => void;
  onOpenLatencyHeatmap?: () => void;
  onExportMarkdown: () => void;
  onExitProject: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchResults?: ProjectNode[];
  onSelectSearchResult?: (nodeId: string) => void;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProjectName,
  currentProjectId,
  onLoadDemo,
  onOpenIngestModal,
  onOpenDependencies,
  onOpenSqlExplorer,
  onOpenAiAssistant,
  onOpenErDiagram,
  onOpenSecurityFlow,
  onOpenFileTree,
  onOpenRuntimeTracing,
  onOpenApiMetrics,
  onOpenSequenceDiagram,
  onOpenLatencyHeatmap,
  onExportMarkdown,
  onExitProject,
  searchQuery,
  onSearchChange,
  searchResults,
  onSelectSearchResult,
  currentTheme,
  onThemeChange,
}) => {
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toolsRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setIsToolsOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setIsThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getThemeLabel = (t: ThemeMode) => {
    switch (t) {
      case 'NIGHT': return 'Night View';
      case 'NORMAL': return 'Normal View';
      case 'NEUMORPHIC': return 'Neumorphic View';
      case 'GLASSMORPHISM': return 'Glassmorphism View';
    }
  };

  const getThemeIcon = (t: ThemeMode) => {
    switch (t) {
      case 'NIGHT': return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
      case 'NORMAL': return <Sun className="w-3.5 h-3.5 text-amber-400" />;
      case 'NEUMORPHIC': return <Box className="w-3.5 h-3.5 text-slate-400" />;
      case 'GLASSMORPHISM': return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <header
      className={`h-16 border-b px-4 md:px-6 flex items-center justify-between sticky top-0 shrink-0 ${
        currentTheme === 'NEUMORPHIC' ? 'bg-[#e0e5ec] border-[#c0cbdc] text-[#2d3748]' :
        currentTheme === 'GLASSMORPHISM' ? 'bg-white/70 backdrop-blur-md border-white/80 text-slate-900' :
        currentTheme === 'NORMAL' ? 'bg-white border-slate-200 text-slate-900' :
        'bg-[#090d16] border-slate-800 text-slate-100'
      }`}
      style={{ zIndex: 99999 }}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className={`font-bold text-sm md:text-lg ${
            currentTheme === 'NEUMORPHIC' ? 'text-[#2d3748]' :
            currentTheme === 'NORMAL' ? 'text-slate-900' :
            currentTheme === 'GLASSMORPHISM' ? 'text-slate-900' :
            'bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400'
          }`}>
            CodeFlow Studio
          </h1>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-4 relative hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Controllers, Services..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full border rounded-xl pl-9 pr-4 py-1.5 text-xs focus:outline-none ${
              currentTheme === 'NEUMORPHIC' ? 'bg-[#e0e5ec] border-[#babecc] text-[#2d3748] shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff]' :
              currentTheme === 'GLASSMORPHISM' ? 'bg-white/60 border-white/80 text-slate-900 backdrop-blur-md shadow-sm' :
              currentTheme === 'NORMAL' ? 'bg-slate-100 border-slate-300 text-slate-900' :
              'bg-slate-900 border-slate-700/60 text-slate-200 placeholder-slate-500 focus:border-indigo-500'
            }`}
          />
        </div>
        {searchResults && searchResults.length > 0 && currentProjectId && (
          <div
            className="absolute top-full mt-2 w-full border rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto"
            style={{ backgroundColor: currentTheme === 'NEUMORPHIC' ? '#e0e5ec' : currentTheme === 'NORMAL' ? '#ffffff' : '#0f172a', zIndex: 999999 }}
          >
            {searchResults.map((node) => (
              <button
                key={node.id}
                onClick={() => onSelectSearchResult?.(node.id)}
                className="w-full text-left px-4 py-3 border-b hover:bg-slate-500/10 flex flex-col"
              >
                <span className="text-sm font-semibold">{node.label}</span>
                <span className="text-xs opacity-70 mt-1">{node.nodeType}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Theme View Mode Selector */}
        <div className="relative hidden md:block" ref={themeRef} style={{ zIndex: 999999 }}>
          <button
            onClick={() => setIsThemeOpen(!isThemeOpen)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-md ${
              currentTheme === 'NEUMORPHIC' ? 'neu-button' :
              currentTheme === 'GLASSMORPHISM' ? 'glass-gel-pill' :
              currentTheme === 'NORMAL' ? 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200' :
              'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
            }`}
          >
            {getThemeIcon(currentTheme)}
            <span>{getThemeLabel(currentTheme)}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isThemeOpen ? 'rotate-180' : ''}`} />
          </button>

          {isThemeOpen && (
            <div
              className={`absolute right-0 top-full mt-2 w-56 rounded-2xl border shadow-2xl overflow-hidden py-1 ${
                currentTheme === 'NEUMORPHIC' ? 'bg-[#e0e5ec] border-[#babecc] text-[#2d3748]' :
                currentTheme === 'GLASSMORPHISM' ? 'bg-white border-slate-200 text-slate-900 shadow-2xl' :
                currentTheme === 'NORMAL' ? 'bg-white border-slate-200 text-slate-900 shadow-2xl' :
                'bg-[#0b0f19] border-slate-700 text-slate-100 shadow-2xl'
              }`}
              style={{
                backgroundColor: currentTheme === 'NEUMORPHIC' ? '#e0e5ec' : currentTheme === 'NIGHT' ? '#0b0f19' : '#ffffff',
                opacity: 1,
                zIndex: 999999,
              }}
            >
              <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider opacity-60">Design Theme Options</div>
              
              <button
                onClick={() => { onThemeChange('NIGHT'); setIsThemeOpen(false); }}
                className="w-full text-left px-4 py-2 hover:bg-indigo-500/10 flex items-center space-x-2 text-xs font-bold transition-colors"
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>1. Night View (Midnight Dark)</span>
              </button>

              <button
                onClick={() => { onThemeChange('NORMAL'); setIsThemeOpen(false); }}
                className="w-full text-left px-4 py-2 hover:bg-amber-500/10 flex items-center space-x-2 text-xs font-bold transition-colors"
              >
                <Sun className="w-4 h-4 text-amber-400" />
                <span>2. Normal View (Clean Slate)</span>
              </button>

              <button
                onClick={() => { onThemeChange('NEUMORPHIC'); setIsThemeOpen(false); }}
                className="w-full text-left px-4 py-2 hover:bg-slate-500/10 flex items-center space-x-2 text-xs font-bold transition-colors"
              >
                <Box className="w-4 h-4 text-slate-400" />
                <span>3. Neumorphic Soft View (Image 1)</span>
              </button>

              <button
                onClick={() => { onThemeChange('GLASSMORPHISM'); setIsThemeOpen(false); }}
                className="w-full text-left px-4 py-2 hover:bg-blue-500/10 flex items-center space-x-2 text-xs font-bold transition-colors"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>4. Glassmorphism Gel View (Image 2)</span>
              </button>
            </div>
          )}
        </div>

        {currentProjectName && (
          <div className="hidden md:flex items-center px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <span className="font-mono text-slate-200 truncate max-w-[100px]">{currentProjectName}</span>
          </div>
        )}

        {currentProjectId && (
          <div className="relative hidden md:block" ref={toolsRef} style={{ zIndex: 999999 }}>
            <button
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all shadow-md ${
                currentTheme === 'NEUMORPHIC' ? 'neu-button' :
                currentTheme === 'GLASSMORPHISM' ? 'bg-white/80 text-slate-900 border-white shadow-sm' :
                currentTheme === 'NORMAL' ? 'bg-slate-100 text-slate-800 border-slate-300' :
                'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              <span>Tools</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isToolsOpen ? 'rotate-180 text-indigo-400' : ''}`} />
            </button>
            
            {/* 100% SOLID OPAQUE Dropdown Menu */}
            {isToolsOpen && (
              <div
                className={`absolute right-0 top-full mt-2 w-56 rounded-2xl border shadow-2xl overflow-hidden py-1 ${
                  currentTheme === 'NEUMORPHIC' ? 'bg-[#e0e5ec] border-[#babecc] text-[#2d3748]' :
                  currentTheme === 'GLASSMORPHISM' ? 'bg-white border-slate-200 text-slate-900 shadow-2xl' :
                  currentTheme === 'NORMAL' ? 'bg-white border-slate-200 text-slate-900 shadow-2xl' :
                  'bg-[#0b0f19] border-slate-700 text-slate-100 shadow-2xl'
                }`}
                style={{
                  backgroundColor: currentTheme === 'NEUMORPHIC' ? '#e0e5ec' : currentTheme === 'NIGHT' ? '#0b0f19' : '#ffffff',
                  opacity: 1,
                  zIndex: 999999,
                }}
              >
                <button onClick={() => { onOpenRuntimeTracing?.(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-500/10 flex items-center space-x-2.5 text-xs text-cyan-400 font-bold transition-colors"><Activity className="w-4 h-4 animate-pulse" /><span>Runtime Tracing (v3.0)</span></button>
                <div className="border-t border-slate-500/20 my-1"></div>
                <button onClick={() => { onOpenApiMetrics?.(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-500/10 flex items-center space-x-2.5 text-xs text-indigo-400 font-bold transition-colors"><BarChart2 className="w-4 h-4" /><span>API Metrics Dashboard</span></button>
                <button onClick={() => { onOpenSequenceDiagram?.(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-500/10 flex items-center space-x-2.5 text-xs text-pink-400 font-bold transition-colors"><Zap className="w-4 h-4" /><span>Sequence Diagram</span></button>
                <button onClick={() => { onOpenLatencyHeatmap?.(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-500/10 flex items-center space-x-2.5 text-xs text-amber-400 font-bold transition-colors"><Flame className="w-4 h-4" /><span>Latency Heatmap</span></button>
                <div className="border-t border-slate-500/20 my-1"></div>
                <button onClick={() => { onOpenErDiagram(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-500/10 flex items-center space-x-2.5 text-xs text-amber-500 font-medium transition-colors"><Database className="w-4 h-4" /><span>ER Diagram</span></button>
                <button onClick={() => { onOpenSecurityFlow(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-500/10 flex items-center space-x-2.5 text-xs text-purple-500 font-medium transition-colors"><ShieldCheck className="w-4 h-4" /><span>Security</span></button>
                <button onClick={() => { onOpenAiAssistant(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-500/10 flex items-center space-x-2.5 text-xs text-pink-500 font-medium transition-colors"><Bot className="w-4 h-4" /><span>AI Assistant</span></button>
                <button onClick={() => { onOpenSqlExplorer(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-500/10 flex items-center space-x-2.5 text-xs text-blue-500 font-medium transition-colors"><Database className="w-4 h-4" /><span>SQL Explorer</span></button>
                <button onClick={() => { onOpenDependencies(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-500/10 flex items-center space-x-2.5 text-xs text-indigo-500 font-medium transition-colors"><Package className="w-4 h-4" /><span>Dependencies</span></button>
                <button onClick={() => { onOpenFileTree(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-500/10 flex items-center space-x-2.5 text-xs text-cyan-500 font-medium transition-colors"><FolderTree className="w-4 h-4" /><span>File Tree</span></button>
                <div className="border-t border-slate-500/20 my-1"></div>
                <button onClick={() => { onExportMarkdown(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-500/10 flex items-center space-x-2.5 text-xs text-emerald-500 font-medium transition-colors"><Download className="w-4 h-4" /><span>Export Markdown</span></button>
              </div>
            )}
          </div>
        )}

        {onLoadDemo && (
          <button
            onClick={onLoadDemo}
            className="hidden md:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-xs font-bold text-white shadow-md shadow-pink-600/30"
          >
            <Sparkles className="w-3.5 h-3.5" /><span>Try Demo</span>
          </button>
        )}

        <button onClick={onOpenIngestModal} className="hidden md:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30">
          <Import className="w-3.5 h-3.5" /><span>Import</span>
        </button>

        {currentProjectId && (
          <button onClick={onExitProject} className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-medium text-red-400">
            <X className="w-3.5 h-3.5" /><span>Exit</span>
          </button>
        )}
      </div>

      {isMobileMenuOpen && (
        <div
          className="absolute top-16 left-0 right-0 border-b p-4 flex flex-col space-y-3 md:hidden shadow-2xl"
          style={{ backgroundColor: currentTheme === 'NEUMORPHIC' ? '#e0e5ec' : currentTheme === 'NORMAL' ? '#ffffff' : '#0f172a', zIndex: 999999 }}
        >
          <div className="flex items-center justify-between p-2 border-b">
            <span className="text-xs font-bold">Theme View:</span>
            <div className="flex items-center space-x-1">
              <button onClick={() => onThemeChange('NIGHT')} className="p-1 rounded bg-slate-800 text-indigo-400"><Moon className="w-4 h-4" /></button>
              <button onClick={() => onThemeChange('NORMAL')} className="p-1 rounded bg-slate-200 text-amber-500"><Sun className="w-4 h-4" /></button>
              <button onClick={() => onThemeChange('NEUMORPHIC')} className="p-1 rounded bg-[#e0e5ec] text-slate-700"><Box className="w-4 h-4" /></button>
              <button onClick={() => onThemeChange('GLASSMORPHISM')} className="p-1 rounded bg-cyan-500/20 text-cyan-500"><Sparkles className="w-4 h-4" /></button>
            </div>
          </div>

          <button onClick={() => { onOpenIngestModal(); setIsMobileMenuOpen(false); }} className="flex items-center space-x-2 p-2 font-medium"><Import className="w-4 h-4" /><span>Import Project</span></button>
          {currentProjectId && (
            <>
              <button onClick={() => { onOpenRuntimeTracing?.(); setIsMobileMenuOpen(false); }} className="flex items-center space-x-2 text-cyan-400 p-2 font-bold"><Activity className="w-4 h-4" /><span>Runtime Tracing (v3.0)</span></button>
              <button onClick={() => { onOpenApiMetrics?.(); setIsMobileMenuOpen(false); }} className="flex items-center space-x-2 text-indigo-400 p-2 font-bold"><BarChart2 className="w-4 h-4" /><span>API Metrics Dashboard</span></button>
              <button onClick={() => { onOpenSequenceDiagram?.(); setIsMobileMenuOpen(false); }} className="flex items-center space-x-2 text-pink-400 p-2 font-bold"><Zap className="w-4 h-4" /><span>Sequence Diagram</span></button>
              <button onClick={() => { onOpenLatencyHeatmap?.(); setIsMobileMenuOpen(false); }} className="flex items-center space-x-2 text-amber-400 p-2 font-bold"><Flame className="w-4 h-4" /><span>Latency Heatmap</span></button>
              <button onClick={() => { onOpenErDiagram(); setIsMobileMenuOpen(false); }} className="flex items-center space-x-2 text-amber-500 p-2 font-medium"><Database className="w-4 h-4" /><span>ER Diagram</span></button>
              <button onClick={() => { onOpenSecurityFlow(); setIsMobileMenuOpen(false); }} className="flex items-center space-x-2 text-purple-500 p-2 font-medium"><ShieldCheck className="w-4 h-4" /><span>Security</span></button>
              <button onClick={() => { onOpenAiAssistant(); setIsMobileMenuOpen(false); }} className="flex items-center space-x-2 text-pink-500 p-2 font-medium"><Bot className="w-4 h-4" /><span>AI Assistant</span></button>
              <button onClick={() => { onOpenSqlExplorer(); setIsMobileMenuOpen(false); }} className="flex items-center space-x-2 text-blue-500 p-2 font-medium"><Database className="w-4 h-4" /><span>SQL Explorer</span></button>
              <button onClick={() => { onOpenDependencies(); setIsMobileMenuOpen(false); }} className="flex items-center space-x-2 text-indigo-500 p-2 font-medium"><Package className="w-4 h-4" /><span>Dependencies</span></button>
              <button onClick={() => { onOpenFileTree(); setIsMobileMenuOpen(false); }} className="flex items-center space-x-2 text-cyan-500 p-2 font-medium"><FolderTree className="w-4 h-4" /><span>File Tree</span></button>
              <button onClick={() => { onExportMarkdown(); setIsMobileMenuOpen(false); }} className="flex items-center space-x-2 text-emerald-500 p-2 font-medium"><Download className="w-4 h-4" /><span>Export Markdown</span></button>
              <button onClick={() => { onExitProject(); setIsMobileMenuOpen(false); }} className="flex items-center space-x-2 text-red-500 p-2 font-medium"><LogOut className="w-4 h-4" /><span>Exit Project</span></button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
