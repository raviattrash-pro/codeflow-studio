import React, { useState, useRef, useEffect } from 'react';
import {
  Layers, Search, Database, ShieldCheck, Bot, Package, Download, X,
  FolderTree, Menu, Import, LogOut, ChevronDown, Activity, Moon, Sun,
  Sparkles, Box, BarChart2, Flame, Zap, ArrowRight
} from 'lucide-react';
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

  const handleMobileToolClick = (toolFn: (() => void) | undefined) => {
    if (!currentProjectId && onLoadDemo) {
      onLoadDemo();
    }
    toolFn?.();
    setIsMobileMenuOpen(false);
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
        {/* Theme View Mode Selector (Desktop) */}
        <div className="relative hidden md:block" ref={themeRef} style={{ zIndex: 999999 }}>
          <button
            onClick={() => setIsThemeOpen(!isThemeOpen)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
              currentTheme === 'NEUMORPHIC' ? 'bg-[#e0e5ec] border-[#c0cbdc] text-[#2d3748] shadow-[3px_3px_6px_#bebebe,-3px_-3px_6px_#ffffff]' :
              currentTheme === 'GLASSMORPHISM' ? 'bg-white/60 border-white/80 text-slate-900 shadow-sm backdrop-blur-md' :
              currentTheme === 'NORMAL' ? 'bg-slate-100 border-slate-200 text-slate-900' :
              'bg-slate-900 border-slate-700/60 text-slate-300 hover:text-white'
            }`}
          >
            {getThemeIcon(currentTheme)}
            <span>{getThemeLabel(currentTheme)}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {isThemeOpen && (
            <div
              className="absolute right-0 mt-2 w-48 border rounded-xl shadow-2xl overflow-hidden py-1 dropdown-pop"
              style={{ backgroundColor: currentTheme === 'NEUMORPHIC' ? '#e0e5ec' : currentTheme === 'NORMAL' ? '#ffffff' : '#0f172a', zIndex: 999999 }}
            >
              <button onClick={() => { onThemeChange('NIGHT'); setIsThemeOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-500/10 flex items-center space-x-2.5 text-xs text-indigo-400 font-medium"><Moon className="w-4 h-4" /><span>Night View</span></button>
              <button onClick={() => { onThemeChange('NORMAL'); setIsThemeOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-500/10 flex items-center space-x-2.5 text-xs text-amber-500 font-medium"><Sun className="w-4 h-4" /><span>Normal View</span></button>
              <button onClick={() => { onThemeChange('NEUMORPHIC'); setIsThemeOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-500/10 flex items-center space-x-2.5 text-xs text-slate-600 font-medium"><Box className="w-4 h-4" /><span>Neumorphic View</span></button>
              <button onClick={() => { onThemeChange('GLASSMORPHISM'); setIsThemeOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-500/10 flex items-center space-x-2.5 text-xs text-cyan-500 font-medium"><Sparkles className="w-4 h-4" /><span>Glassmorphism View</span></button>
            </div>
          )}
        </div>

        {/* Tools Dropdown (Desktop) */}
        {currentProjectId && (
          <div className="relative hidden md:block" ref={toolsRef} style={{ zIndex: 999999 }}>
            <button
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                currentTheme === 'NEUMORPHIC' ? 'bg-[#e0e5ec] border-[#c0cbdc] text-[#2d3748] shadow-[3px_3px_6px_#bebebe,-3px_-3px_6px_#ffffff]' :
                currentTheme === 'GLASSMORPHISM' ? 'bg-white/60 border-white/80 text-slate-900 shadow-sm backdrop-blur-md' :
                currentTheme === 'NORMAL' ? 'bg-slate-100 border-slate-200 text-slate-900' :
                'bg-slate-900 border-slate-700/60 text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tools</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {isToolsOpen && (
              <div
                className="absolute right-0 mt-2 w-64 border rounded-xl shadow-2xl overflow-hidden py-1 dropdown-pop"
                style={{ backgroundColor: currentTheme === 'NEUMORPHIC' ? '#e0e5ec' : currentTheme === 'NORMAL' ? '#ffffff' : '#0f172a', zIndex: 999999 }}
              >
                <div className="px-4 py-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Architecture Tools</div>
                <button onClick={() => { onOpenRuntimeTracing?.(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-500/10 flex items-center space-x-2.5 text-xs text-cyan-400 font-bold"><Activity className="w-4 h-4" /><span>Runtime Tracing (v4.2)</span></button>
                <button onClick={() => { onOpenApiMetrics?.(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-500/10 flex items-center space-x-2.5 text-xs text-indigo-400 font-bold"><BarChart2 className="w-4 h-4" /><span>API Metrics Dashboard</span></button>
                <button onClick={() => { onOpenSequenceDiagram?.(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-500/10 flex items-center space-x-2.5 text-xs text-pink-400 font-bold"><Zap className="w-4 h-4" /><span>Sequence Diagram</span></button>
                <button onClick={() => { onOpenLatencyHeatmap?.(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-500/10 flex items-center space-x-2.5 text-xs text-amber-400 font-bold"><Flame className="w-4 h-4" /><span>Latency Heatmap (24h)</span></button>
                <button onClick={() => { onOpenErDiagram(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-500/10 flex items-center space-x-2.5 text-xs text-emerald-400 font-medium"><Database className="w-4 h-4" /><span>ER Diagram Explorer</span></button>
                <button onClick={() => { onOpenSecurityFlow(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-500/10 flex items-center space-x-2.5 text-xs text-purple-400 font-medium"><ShieldCheck className="w-4 h-4" /><span>Security Pipeline</span></button>
                <button onClick={() => { onOpenAiAssistant(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-500/10 flex items-center space-x-2.5 text-xs text-pink-400 font-medium"><Bot className="w-4 h-4" /><span>AI Code Assistant</span></button>
                <button onClick={() => { onOpenSqlExplorer(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-500/10 flex items-center space-x-2.5 text-xs text-blue-400 font-medium"><Database className="w-4 h-4" /><span>SQL Query Explorer</span></button>
                <button onClick={() => { onOpenDependencies(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-500/10 flex items-center space-x-2.5 text-xs text-indigo-300 font-medium"><Package className="w-4 h-4" /><span>Dependencies</span></button>
                <button onClick={() => { onOpenFileTree(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-500/10 flex items-center space-x-2.5 text-xs text-cyan-300 font-medium"><FolderTree className="w-4 h-4" /><span>File Tree</span></button>
                <div className="border-t border-slate-500/20 my-1"></div>
                <button onClick={() => { onExportMarkdown(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-500/10 flex items-center space-x-2.5 text-xs text-emerald-400 font-medium"><Download className="w-4 h-4" /><span>Export Markdown</span></button>
              </div>
            )}
          </div>
        )}

        {onLoadDemo && (
          <button
            onClick={onLoadDemo}
            className="hidden md:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-xs font-bold text-white shadow-md shadow-pink-600/30 badge-sheen"
          >
            <Sparkles className="w-3.5 h-3.5" /><span>Try Demo</span>
          </button>
        )}

        <button onClick={onOpenIngestModal} className="hidden md:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#0f172a] border border-slate-700 hover:border-indigo-500 text-xs font-semibold text-white shadow-md">
          <Import className="w-3.5 h-3.5 text-indigo-400" /><span>Import</span>
        </button>

        {currentProjectId && (
          <button onClick={onExitProject} className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-medium text-red-400">
            <X className="w-3.5 h-3.5" /><span>Exit</span>
          </button>
        )}

        {/* Mobile Action & Menu Toggle Button */}
        <div className="flex md:hidden items-center space-x-2">
          {onLoadDemo && !currentProjectId && (
            <button
              onClick={onLoadDemo}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 text-xs font-bold text-white shadow-md badge-sheen"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo</span>
            </button>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-200 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Drawer Menu with ALL 11 Tools */}
      {isMobileMenuOpen && (
        <div
          className="absolute top-16 left-0 right-0 border-b p-4 flex flex-col space-y-3 md:hidden shadow-2xl overflow-y-auto max-h-[85vh] custom-scrollbar"
          style={{ backgroundColor: currentTheme === 'NEUMORPHIC' ? '#e0e5ec' : currentTheme === 'NORMAL' ? '#ffffff' : '#0b0f1d', zIndex: 999999 }}
        >
          {/* Theme Mode Selector */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs font-bold text-slate-300">Theme Mode:</span>
            <div className="flex items-center space-x-1">
              <button onClick={() => onThemeChange('NIGHT')} className="p-1.5 rounded-lg bg-slate-800 text-indigo-400" title="Night View"><Moon className="w-4 h-4" /></button>
              <button onClick={() => onThemeChange('NORMAL')} className="p-1.5 rounded-lg bg-slate-200 text-amber-600" title="Normal View"><Sun className="w-4 h-4" /></button>
              <button onClick={() => onThemeChange('NEUMORPHIC')} className="p-1.5 rounded-lg bg-[#e0e5ec] text-slate-700" title="Neumorphic"><Box className="w-4 h-4" /></button>
              <button onClick={() => onThemeChange('GLASSMORPHISM')} className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400" title="Glassmorphism"><Sparkles className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {onLoadDemo && (
              <button
                onClick={() => { onLoadDemo(); setIsMobileMenuOpen(false); }}
                className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 text-white text-xs font-bold shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Demo</span>
              </button>
            )}
            <button
              onClick={() => { onOpenIngestModal(); setIsMobileMenuOpen(false); }}
              className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold"
            >
              <Import className="w-3.5 h-3.5 text-indigo-400" />
              <span>Import Repo</span>
            </button>
          </div>

          {/* ALL 11 ARCHITECTURE TOOLS LIST */}
          <div className="pt-2">
            <div className="px-2 pb-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>All 11 Architecture Tools</span>
              <span className="text-emerald-400">● 100% Offline</span>
            </div>
            <div className="space-y-1">
              <button onClick={() => handleMobileToolClick(onOpenRuntimeTracing)} className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-cyan-400 hover:bg-slate-800 text-xs font-bold">
                <div className="flex items-center space-x-2.5"><Activity className="w-4 h-4" /><span>1. Runtime Tracing Replay</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">v4.2</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenApiMetrics)} className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-indigo-400 hover:bg-slate-800 text-xs font-bold">
                <div className="flex items-center space-x-2.5"><BarChart2 className="w-4 h-4" /><span>2. API Metrics &amp; Telemetry</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300">P95</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenSequenceDiagram)} className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-pink-400 hover:bg-slate-800 text-xs font-bold">
                <div className="flex items-center space-x-2.5"><Zap className="w-4 h-4" /><span>3. 7-Swimlane Sequence Tracer</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-950 border border-pink-800 text-pink-300">7 Lanes</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenLatencyHeatmap)} className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-amber-400 hover:bg-slate-800 text-xs font-bold">
                <div className="flex items-center space-x-2.5"><Flame className="w-4 h-4" /><span>4. 24h Latency Heatmap</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300">24h Matrix</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenErDiagram)} className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-emerald-400 hover:bg-slate-800 text-xs font-bold">
                <div className="flex items-center space-x-2.5"><Database className="w-4 h-4" /><span>5. Database ERD Explorer</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">JPA PK/FK</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenSecurityFlow)} className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-purple-400 hover:bg-slate-800 text-xs font-bold">
                <div className="flex items-center space-x-2.5"><ShieldCheck className="w-4 h-4" /><span>6. Spring Security 6 Pipeline</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300">JWT Filter</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenAiAssistant)} className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-pink-300 hover:bg-slate-800 text-xs font-bold">
                <div className="flex items-center space-x-2.5"><Bot className="w-4 h-4" /><span>7. AI Architecture Assistant</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-950 border border-pink-800 text-pink-300">Audit</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenSqlExplorer)} className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-blue-400 hover:bg-slate-800 text-xs font-bold">
                <div className="flex items-center space-x-2.5"><Database className="w-4 h-4" /><span>8. Live SQL Explorer</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300">JPA Queries</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenDependencies)} className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-indigo-300 hover:bg-slate-800 text-xs font-bold">
                <div className="flex items-center space-x-2.5"><Package className="w-4 h-4" /><span>9. Maven Dependency Graph</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300">Starters</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenFileTree)} className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-cyan-300 hover:bg-slate-800 text-xs font-bold">
                <div className="flex items-center space-x-2.5"><FolderTree className="w-4 h-4" /><span>10. File Tree Visualizer</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">5 Views</span>
              </button>
            </div>
          </div>

          {currentProjectId && (
            <div className="pt-2 border-t border-slate-800 flex items-center space-x-2">
              <button onClick={() => { onExportMarkdown(); setIsMobileMenuOpen(false); }} className="flex-1 flex items-center justify-center space-x-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <Download className="w-4 h-4" />
                <span>Export MD</span>
              </button>
              <button onClick={() => { onExitProject(); setIsMobileMenuOpen(false); }} className="flex items-center justify-center space-x-1 p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                <LogOut className="w-4 h-4" />
                <span>Exit</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
