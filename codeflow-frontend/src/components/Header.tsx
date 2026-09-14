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
  onOpenReactRuntime?: () => void;
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
  onOpenReactRuntime,
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

  const isLight = currentTheme === 'NORMAL' || currentTheme === 'GLASSMORPHISM' || currentTheme === 'NEUMORPHIC';

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
      case 'NORMAL': return <Sun className="w-3.5 h-3.5 text-amber-500" />;
      case 'NEUMORPHIC': return <Box className="w-3.5 h-3.5 text-slate-500" />;
      case 'GLASSMORPHISM': return <Sparkles className="w-3.5 h-3.5 text-sky-500" />;
    }
  };

  const handleMobileToolClick = (toolFn: (() => void) | undefined) => {
    if (!currentProjectId && onLoadDemo) {
      onLoadDemo();
    }
    toolFn?.();
    setIsMobileMenuOpen(false);
  };

  const getDropdownStyle = () => {
    if (currentTheme === 'NEUMORPHIC') {
      return 'bg-[#e0e5ec] border-[#c0cbdc] text-[#2d3748] shadow-xl';
    }
    if (currentTheme === 'GLASSMORPHISM') {
      return 'bg-white/95 backdrop-blur-2xl border-slate-200 text-slate-800 shadow-2xl';
    }
    if (currentTheme === 'NORMAL') {
      return 'bg-white border-slate-200 text-slate-800 shadow-xl';
    }
    return 'bg-[#0f172a] border-slate-800 text-slate-200 shadow-2xl';
  };

  const getItemHoverClass = () => {
    if (isLight) return 'hover:bg-slate-100 text-slate-800';
    return 'hover:bg-slate-800/80 text-slate-200';
  };

  return (
    <header
      className={`h-16 border-b px-4 md:px-6 flex items-center justify-between sticky top-0 shrink-0 transition-colors duration-200 ${
        currentTheme === 'NEUMORPHIC' ? 'bg-[#e0e5ec] border-[#c0cbdc] text-[#2d3748]' :
        currentTheme === 'GLASSMORPHISM' ? 'bg-white/80 backdrop-blur-xl border-slate-200/80 text-slate-900 shadow-sm' :
        currentTheme === 'NORMAL' ? 'bg-white border-slate-200 text-slate-900 shadow-sm' :
        'bg-[#090d16] border-slate-800/80 text-slate-100'
      }`}
      style={{ zIndex: 99999 }}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
          <Layers className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className={`font-bold text-sm md:text-base tracking-tight ${
            isLight ? 'text-slate-900' : 'text-slate-100'
          }`}>
            CodeFlow Studio
          </h1>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-4 relative hidden md:block">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Controllers, Services, Entities..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full border rounded-xl pl-9 pr-4 py-1.5 text-xs font-mono focus:outline-none transition-all ${
              currentTheme === 'NEUMORPHIC' ? 'bg-[#e0e5ec] border-[#babecc] text-[#2d3748] shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff]' :
              currentTheme === 'GLASSMORPHISM' ? 'bg-slate-100/80 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-sky-500 focus:bg-white' :
              currentTheme === 'NORMAL' ? 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white' :
              'bg-[#0f172a] border-slate-800 text-slate-200 placeholder-slate-500 focus:border-sky-500'
            }`}
          />
        </div>
        {searchResults && searchResults.length > 0 && currentProjectId && (
          <div
            className={`absolute top-full mt-2 w-full border rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto ${getDropdownStyle()}`}
            style={{ zIndex: 999999 }}
          >
            {searchResults.map((node) => (
              <button
                key={node.id}
                onClick={() => onSelectSearchResult?.(node.id)}
                className={`w-full text-left px-4 py-2.5 border-b border-slate-500/10 flex flex-col ${getItemHoverClass()}`}
              >
                <span className="text-xs font-mono font-semibold">{node.label}</span>
                <span className="text-[10px] font-mono opacity-70 mt-0.5">{node.nodeType}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2.5">
        {/* Theme View Mode Selector (Desktop) */}
        <div className="relative hidden md:block" ref={themeRef} style={{ zIndex: 999999 }}>
          <button
            onClick={() => setIsThemeOpen(!isThemeOpen)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all ${
              currentTheme === 'NEUMORPHIC' ? 'bg-[#e0e5ec] border-[#c0cbdc] text-[#2d3748] shadow-[3px_3px_6px_#bebebe,-3px_-3px_6px_#ffffff]' :
              currentTheme === 'GLASSMORPHISM' ? 'bg-slate-100/90 border-slate-200 text-slate-800 hover:bg-slate-200/80 shadow-sm' :
              currentTheme === 'NORMAL' ? 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200' :
              'bg-[#0f172a] border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            {getThemeIcon(currentTheme)}
            <span>{getThemeLabel(currentTheme)}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {isThemeOpen && (
            <div
              className={`absolute right-0 mt-2 w-48 border rounded-xl shadow-2xl overflow-hidden py-1.5 ${getDropdownStyle()}`}
              style={{ zIndex: 999999 }}
            >
              <button onClick={() => { onThemeChange('NIGHT'); setIsThemeOpen(false); }} className={`w-full text-left px-3.5 py-2 flex items-center space-x-2 text-xs font-mono font-medium ${getItemHoverClass()}`}>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Night View (Dark)</span>
              </button>
              <button onClick={() => { onThemeChange('NORMAL'); setIsThemeOpen(false); }} className={`w-full text-left px-3.5 py-2 flex items-center space-x-2 text-xs font-mono font-medium ${getItemHoverClass()}`}>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Normal View (Light)</span>
              </button>
              <button onClick={() => { onThemeChange('GLASSMORPHISM'); setIsThemeOpen(false); }} className={`w-full text-left px-3.5 py-2 flex items-center space-x-2 text-xs font-mono font-medium ${getItemHoverClass()}`}>
                <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                <span>Glassmorphism View</span>
              </button>
              <button onClick={() => { onThemeChange('NEUMORPHIC'); setIsThemeOpen(false); }} className={`w-full text-left px-3.5 py-2 flex items-center space-x-2 text-xs font-mono font-medium ${getItemHoverClass()}`}>
                <Box className="w-3.5 h-3.5 text-slate-500" />
                <span>Neumorphic View</span>
              </button>
            </div>
          )}
        </div>

        {/* Tools Dropdown (Desktop) */}
        {currentProjectId && (
          <div className="relative hidden md:block" ref={toolsRef} style={{ zIndex: 999999 }}>
            <button
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all ${
                currentTheme === 'NEUMORPHIC' ? 'bg-[#e0e5ec] border-[#c0cbdc] text-[#2d3748] shadow-[3px_3px_6px_#bebebe,-3px_-3px_6px_#ffffff]' :
                currentTheme === 'GLASSMORPHISM' ? 'bg-slate-100/90 border-slate-200 text-slate-800 hover:bg-slate-200/80 shadow-sm' :
                currentTheme === 'NORMAL' ? 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200' :
                'bg-[#0f172a] border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>Tools</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {isToolsOpen && (
              <div
                className={`absolute right-0 mt-2 w-64 border rounded-xl shadow-2xl overflow-hidden py-1.5 ${getDropdownStyle()}`}
                style={{ zIndex: 999999 }}
              >
                <div className="px-3.5 py-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-500/10">Architecture Tools</div>
                <button onClick={() => { onOpenReactRuntime?.(); setIsToolsOpen(false); }} className={`w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono font-medium ${getItemHoverClass()}`}><Activity className="w-3.5 h-3.5 text-sky-400" /><span>React 19 Runtime Explorer</span><span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400">v5.0</span></button>
                <button onClick={() => { onOpenRuntimeTracing?.(); setIsToolsOpen(false); }} className={`w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono font-medium ${getItemHoverClass()}`}><Activity className="w-3.5 h-3.5 text-cyan-400" /><span>Runtime Tracing (v4.2)</span></button>
                <button onClick={() => { onOpenApiMetrics?.(); setIsToolsOpen(false); }} className={`w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono font-medium ${getItemHoverClass()}`}><BarChart2 className="w-3.5 h-3.5 text-indigo-400" /><span>API Metrics Dashboard</span></button>
                <button onClick={() => { onOpenSequenceDiagram?.(); setIsToolsOpen(false); }} className={`w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono font-medium ${getItemHoverClass()}`}><Zap className="w-3.5 h-3.5 text-amber-400" /><span>Sequence Diagram</span></button>
                <button onClick={() => { onOpenLatencyHeatmap?.(); setIsToolsOpen(false); }} className={`w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono font-medium ${getItemHoverClass()}`}><Flame className="w-3.5 h-3.5 text-orange-400" /><span>Latency Heatmap (24h)</span></button>
                <button onClick={() => { onOpenErDiagram(); setIsToolsOpen(false); }} className={`w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono font-medium ${getItemHoverClass()}`}><Database className="w-3.5 h-3.5 text-emerald-400" /><span>ER Diagram Explorer</span></button>
                <button onClick={() => { onOpenSecurityFlow(); setIsToolsOpen(false); }} className={`w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono font-medium ${getItemHoverClass()}`}><ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /><span>Security Pipeline</span></button>
                <button onClick={() => { onOpenAiAssistant(); setIsToolsOpen(false); }} className={`w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono font-medium ${getItemHoverClass()}`}><Bot className="w-3.5 h-3.5 text-sky-400" /><span>AI Code Assistant</span></button>
                <button onClick={() => { onOpenSqlExplorer(); setIsToolsOpen(false); }} className={`w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono font-medium ${getItemHoverClass()}`}><Database className="w-3.5 h-3.5 text-blue-400" /><span>SQL Query Explorer</span></button>
                <button onClick={() => { onOpenDependencies(); setIsToolsOpen(false); }} className={`w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono font-medium ${getItemHoverClass()}`}><Package className="w-3.5 h-3.5 text-indigo-300" /><span>Dependencies</span></button>
                <button onClick={() => { onOpenFileTree(); setIsToolsOpen(false); }} className={`w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono font-medium ${getItemHoverClass()}`}><FolderTree className="w-3.5 h-3.5 text-cyan-300" /><span>File Tree</span></button>
                <div className="border-t border-slate-500/20 my-1"></div>
                <button onClick={() => { onExportMarkdown(); setIsToolsOpen(false); }} className={`w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono font-medium text-emerald-500 ${getItemHoverClass()}`}><Download className="w-3.5 h-3.5" /><span>Export Markdown</span></button>
              </div>
            )}
          </div>
        )}

        {onLoadDemo && !currentProjectId && (
          <button
            onClick={onLoadDemo}
            className="hidden md:flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-xs font-mono font-bold text-white shadow-md shadow-sky-600/20 transition-all transform hover:scale-[1.02] active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5" /><span>Try Demo</span>
          </button>
        )}

        <button onClick={onOpenIngestModal} className={`hidden md:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all ${
          isLight
            ? 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
            : 'bg-[#0f172a] border-slate-800 text-slate-200 hover:border-slate-700 hover:text-white'
        }`}>
          <Import className="w-3.5 h-3.5 text-sky-400" /><span>Import</span>
        </button>

        {currentProjectId && (
          <button onClick={onExitProject} className="hidden md:flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-mono font-medium text-red-400">
            <X className="w-3.5 h-3.5" /><span>Exit</span>
          </button>
        )}

        {/* Mobile Action & Menu Toggle Button */}
        <div className="flex md:hidden items-center space-x-2">
          {onLoadDemo && !currentProjectId && (
            <button
              onClick={onLoadDemo}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-xs font-mono font-bold text-white shadow-md"
            >
              <Sparkles className="w-3 h-3" />
              <span>Demo</span>
            </button>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 rounded-xl border transition-colors ${
              isLight
                ? 'bg-slate-100 border-slate-200 text-slate-800'
                : 'bg-slate-900 border-slate-800 text-slate-200'
            }`}
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Drawer Menu */}
      {isMobileMenuOpen && (
        <div
          className={`absolute top-16 left-0 right-0 border-b p-4 flex flex-col space-y-3 md:hidden shadow-2xl overflow-y-auto max-h-[85vh] custom-scrollbar ${getDropdownStyle()}`}
          style={{ zIndex: 999999 }}
        >
          {/* Theme Mode Selector */}
          <div className={`flex items-center justify-between p-2.5 rounded-xl border ${
            isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}>
            <span className="text-xs font-mono font-bold">Theme Mode:</span>
            <div className="flex items-center space-x-1">
              <button onClick={() => onThemeChange('NIGHT')} className={`p-1.5 rounded-lg ${currentTheme === 'NIGHT' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400'}`} title="Night View"><Moon className="w-4 h-4" /></button>
              <button onClick={() => onThemeChange('NORMAL')} className={`p-1.5 rounded-lg ${currentTheme === 'NORMAL' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-amber-600'}`} title="Normal View"><Sun className="w-4 h-4" /></button>
              <button onClick={() => onThemeChange('GLASSMORPHISM')} className={`p-1.5 rounded-lg ${currentTheme === 'GLASSMORPHISM' ? 'bg-sky-500 text-white' : 'bg-sky-500/20 text-sky-400'}`} title="Glassmorphism"><Sparkles className="w-4 h-4" /></button>
              <button onClick={() => onThemeChange('NEUMORPHIC')} className={`p-1.5 rounded-lg ${currentTheme === 'NEUMORPHIC' ? 'bg-slate-600 text-white' : 'bg-[#e0e5ec] text-slate-700'}`} title="Neumorphic"><Box className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {onLoadDemo && (
              <button
                onClick={() => { onLoadDemo(); setIsMobileMenuOpen(false); }}
                className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-xs font-mono font-bold shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Demo</span>
              </button>
            )}
            <button
              onClick={() => { onOpenIngestModal(); setIsMobileMenuOpen(false); }}
              className={`flex items-center justify-center space-x-1.5 p-2.5 rounded-xl border text-xs font-mono font-bold ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
              }`}
            >
              <Import className="w-3.5 h-3.5 text-sky-400" />
              <span>Import Repo</span>
            </button>
          </div>

          {/* ALL 12 ARCHITECTURE TOOLS LIST */}
          <div className="pt-2">
            <div className="px-2 pb-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>All 12 Architecture Tools</span>
              <span className="text-emerald-500">● 100% Offline</span>
            </div>
            <div className="space-y-1">
              <button onClick={() => handleMobileToolClick(onOpenReactRuntime)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900/60 border-slate-800 text-sky-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><Activity className="w-4 h-4 text-sky-400" /><span>1. React 19 Runtime Explorer</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400">v5.0</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenRuntimeTracing)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900/60 border-slate-800 text-cyan-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><Activity className="w-4 h-4 text-cyan-400" /><span>2. Runtime Tracing Replay</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">v4.2</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenApiMetrics)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900/60 border-slate-800 text-indigo-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><BarChart2 className="w-4 h-4 text-indigo-400" /><span>3. API Metrics Dashboard</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">P95</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenSequenceDiagram)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900/60 border-slate-800 text-amber-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><Zap className="w-4 h-4 text-amber-400" /><span>4. Sequence Diagram</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">7 Lanes</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenLatencyHeatmap)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900/60 border-slate-800 text-orange-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><Flame className="w-4 h-4 text-orange-400" /><span>5. 24h Latency Heatmap</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400">Matrix</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenErDiagram)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900/60 border-slate-800 text-emerald-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><Database className="w-4 h-4 text-emerald-400" /><span>6. Database ERD Explorer</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Schema</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenSecurityFlow)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900/60 border-slate-800 text-indigo-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><ShieldCheck className="w-4 h-4 text-indigo-400" /><span>7. Security Pipeline</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">JWT</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenAiAssistant)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900/60 border-slate-800 text-sky-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><Bot className="w-4 h-4 text-sky-400" /><span>8. AI Architecture Assistant</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400">Audit</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenSqlExplorer)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900/60 border-slate-800 text-blue-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><Database className="w-4 h-4 text-blue-400" /><span>9. Live SQL Explorer</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">JPA</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenDependencies)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900/60 border-slate-800 text-indigo-300 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><Package className="w-4 h-4 text-indigo-300" /><span>10. Dependencies</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">Maven</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenFileTree)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900/60 border-slate-800 text-cyan-300 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><FolderTree className="w-4 h-4 text-cyan-300" /><span>11. File Tree Visualizer</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">5 Views</span>
              </button>
            </div>
          </div>

          {currentProjectId && (
            <div className="pt-2 border-t border-slate-500/20 flex items-center space-x-2">
              <button onClick={() => { onExportMarkdown(); setIsMobileMenuOpen(false); }} className="flex-1 flex items-center justify-center space-x-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                <Download className="w-4 h-4" />
                <span>Export MD</span>
              </button>
              <button onClick={() => { onExitProject(); setIsMobileMenuOpen(false); }} className="flex items-center justify-center space-x-1 p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-bold">
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
