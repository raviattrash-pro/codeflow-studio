import React, { useState, useRef, useEffect } from 'react';
import {
  Layers, Search, Database, ShieldCheck, Bot, Package, Download, X,
  FolderTree, Menu, Import, LogOut, ChevronDown, Activity, Moon, Sun,
  Sparkles, Box, BarChart2, Flame, Zap, ArrowRight, Terminal, Code2, Mic, GitPullRequest, CheckSquare, Cloud, Radio, Sliders
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
  onOpenCommandPalette?: () => void;
  onOpenScorecard?: () => void;
  onOpenApiSandbox?: () => void;
  onOpenTsGenerator?: () => void;
  onOpenChaos?: () => void;
  onOpenBlueprint?: () => void;
  onOpenVoiceCopilot?: () => void;
  onOpenDrift?: () => void;
  onOpenTestGen?: () => void;
  onOpenCloudInfra?: () => void;
  onOpenEventStream?: () => void;
  onOpenDistTracing?: () => void;
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
  onOpenCommandPalette,
  onOpenScorecard,
  onOpenApiSandbox,
  onOpenTsGenerator,
  onOpenChaos,
  onOpenBlueprint,
  onOpenVoiceCopilot,
  onOpenDrift,
  onOpenTestGen,
  onOpenCloudInfra,
  onOpenEventStream,
  onOpenDistTracing,
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
      return 'bg-[#e0e5ec] border-[#c0cbdc] text-[#2d3748] shadow-2xl';
    }
    if (currentTheme === 'GLASSMORPHISM' || currentTheme === 'NORMAL') {
      return 'bg-white border-slate-200 text-slate-900 shadow-2xl';
    }
    return 'bg-[#0f172a] border-slate-800 text-slate-100 shadow-2xl';
  };

  const getItemHoverClass = () => {
    if (isLight) return 'hover:bg-slate-100 text-slate-800';
    return 'hover:bg-slate-800/80 text-slate-200';
  };

  return (
    <header
      className={`h-16 border-b px-4 md:px-6 flex items-center justify-between sticky top-0 shrink-0 transition-colors duration-200 ${
        currentTheme === 'NEUMORPHIC' ? 'bg-[#e0e5ec] border-[#c0cbdc] text-[#2d3748]' :
        currentTheme === 'GLASSMORPHISM' ? 'bg-white/90 backdrop-blur-xl border-slate-200/80 text-slate-900 shadow-xs' :
        currentTheme === 'NORMAL' ? 'bg-white border-slate-200 text-slate-900 shadow-xs' :
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

      <div className="flex-1 max-w-lg mx-4 flex items-center gap-2 hidden md:flex">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Controllers, Services, Entities..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full border rounded-xl pl-9 pr-4 py-1.5 text-xs font-mono focus:outline-none transition-all ${
              currentTheme === 'NEUMORPHIC' ? 'bg-[#e0e5ec] border-[#babecc] text-[#2d3748] shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff]' :
              currentTheme === 'GLASSMORPHISM' ? 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-sky-500 focus:bg-white' :
              currentTheme === 'NORMAL' ? 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white' :
              'bg-[#0f172a] border-slate-800 text-slate-200 placeholder-slate-500 focus:border-sky-500'
            }`}
          />
        </div>

        {/* Global Command Palette & Voice Copilot */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-medium transition-all ${
              isLight
                ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600'
            }`}
            title="Open Command Palette (Ctrl+K or Cmd+K)"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-800/80 border border-slate-700 rounded text-slate-300 font-mono shadow-inner">
              Ctrl K
            </kbd>
          </button>
        )}

        {onOpenVoiceCopilot && (
          <button
            onClick={onOpenVoiceCopilot}
            className={`p-1.5 rounded-xl border transition-all ${
              isLight
                ? 'bg-slate-100 border-slate-200 text-purple-600 hover:bg-slate-200'
                : 'bg-purple-950/40 border-purple-800/50 text-purple-300 hover:bg-purple-900/60 hover:text-white'
            }`}
            title="Voice Architecture Copilot"
          >
            <Mic className="w-4 h-4" />
          </button>
        )}

        {searchResults && searchResults.length > 0 && currentProjectId && (
          <div
            className={`absolute top-full mt-2 w-full border rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto ${getDropdownStyle()}`}
            style={{
              backgroundColor: currentTheme === 'NEUMORPHIC' ? '#e0e5ec' : isLight ? '#ffffff' : '#0b0f19',
              zIndex: 999999,
            }}
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
              currentTheme === 'GLASSMORPHISM' ? 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200/80 shadow-xs' :
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
              style={{
                backgroundColor: currentTheme === 'NEUMORPHIC' ? '#e0e5ec' : isLight ? '#ffffff' : '#0b0f19',
                zIndex: 999999,
              }}
            >
              <button onClick={() => { onThemeChange('NIGHT'); setIsThemeOpen(false); }} className={`w-full text-left px-3.5 py-2 flex items-center space-x-2 text-xs font-mono font-medium ${getItemHoverClass()}`}>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>Night View (Dark)</span>
              </button>
              <button onClick={() => { onThemeChange('NORMAL'); setIsThemeOpen(false); }} className={`w-full text-left px-3.5 py-2 flex items-center space-x-2 text-xs font-mono font-medium ${getItemHoverClass()}`}>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>Normal View (Light)</span>
              </button>
              <button onClick={() => { onThemeChange('GLASSMORPHISM'); setIsThemeOpen(false); }} className={`w-full text-left px-3.5 py-2 flex items-center space-x-2 text-xs font-mono font-medium ${getItemHoverClass()}`}>
                <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>Glassmorphism View</span>
              </button>
              <button onClick={() => { onThemeChange('NEUMORPHIC'); setIsThemeOpen(false); }} className={`w-full text-left px-3.5 py-2 flex items-center space-x-2 text-xs font-mono font-medium ${getItemHoverClass()}`}>
                <Box className="w-3.5 h-3.5 text-slate-500" />
                <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>Neumorphic View</span>
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
                currentTheme === 'GLASSMORPHISM' ? 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200/80 shadow-xs' :
                currentTheme === 'NORMAL' ? 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200' :
                'bg-[#0f172a] border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
              <span>Tools</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {isToolsOpen && (
              <div
                className={`absolute right-0 mt-2 w-[620px] max-w-[92vw] border rounded-2xl shadow-2xl overflow-hidden flex flex-col ${getDropdownStyle()}`}
                style={{
                  backgroundColor: currentTheme === 'NEUMORPHIC' ? '#e0e5ec' : isLight ? '#ffffff' : '#0b0f19',
                  maxHeight: 'calc(100vh - 5rem)',
                  zIndex: 999999,
                }}
              >
                {/* Mega Menu Header */}
                <div className={`px-4 py-2.5 text-[11px] font-mono font-bold uppercase tracking-wider border-b flex items-center justify-between shrink-0 ${
                  isLight ? 'text-slate-700 border-slate-200 bg-slate-50' : 'text-slate-300 border-slate-800 bg-[#111827]'
                }`}>
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    <span>Architecture Intelligence Suite (v8.0)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    23 Active Tools
                  </span>
                </div>

                {/* 2-Column Scrollable Tools Grid */}
                <div className="overflow-y-auto custom-scrollbar p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1" style={{ minHeight: 0 }}>
                  {/* Column 1: Cloud, DevOps & Enterprise Suite */}
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider">
                      Cloud & DevOps (v8.0)
                    </div>

                    <button onClick={() => { onOpenDrift?.(); setIsToolsOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono font-medium transition cursor-pointer ${getItemHoverClass()}`}>
                      <div className="flex items-center space-x-2 truncate">
                        <GitPullRequest className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">Git PR Drift</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold bg-amber-500/10 border-amber-500/30 text-amber-400">v8.0</span>
                    </button>

                    <button onClick={() => { onOpenTestGen?.(); setIsToolsOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono font-medium transition cursor-pointer ${getItemHoverClass()}`}>
                      <div className="flex items-center space-x-2 truncate">
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">Test Generator</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold bg-emerald-500/10 border-emerald-500/30 text-emerald-400">v8.0</span>
                    </button>

                    <button onClick={() => { onOpenCloudInfra?.(); setIsToolsOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono font-medium transition cursor-pointer ${getItemHoverClass()}`}>
                      <div className="flex items-center space-x-2 truncate">
                        <Cloud className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="truncate">Cloud IaC / Docker</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold bg-sky-500/10 border-sky-500/30 text-sky-400">v8.0</span>
                    </button>

                    <button onClick={() => { onOpenEventStream?.(); setIsToolsOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono font-medium transition cursor-pointer ${getItemHoverClass()}`}>
                      <div className="flex items-center space-x-2 truncate">
                        <Radio className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="truncate">Kafka & WS Streams</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold bg-purple-500/10 border-purple-500/30 text-purple-400">v8.0</span>
                    </button>

                    <button onClick={() => { onOpenDistTracing?.(); setIsToolsOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono font-medium transition cursor-pointer ${getItemHoverClass()}`}>
                      <div className="flex items-center space-x-2 truncate">
                        <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">OTel Distributed Tracing</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold bg-cyan-500/10 border-cyan-500/30 text-cyan-400">v8.0</span>
                    </button>

                    <button onClick={() => { onOpenVoiceCopilot?.(); setIsToolsOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono font-medium transition cursor-pointer ${getItemHoverClass()}`}>
                      <div className="flex items-center space-x-2 truncate">
                        <Mic className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="truncate">Voice Copilot</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold bg-rose-500/10 border-rose-500/30 text-rose-400">v8.0</span>
                    </button>

                    <div className="pt-2 px-2 py-1 text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider border-t border-slate-800/40">
                      Enterprise Tools (v7.0)
                    </div>

                    <button onClick={() => { onOpenScorecard?.(); setIsToolsOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono font-medium transition cursor-pointer ${getItemHoverClass()}`}>
                      <div className="flex items-center space-x-2 truncate">
                        <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">Scorecard HUD</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold bg-emerald-500/10 border-emerald-500/30 text-emerald-400">v7.0</span>
                    </button>

                    <button onClick={() => { onOpenApiSandbox?.(); setIsToolsOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono font-medium transition cursor-pointer ${getItemHoverClass()}`}>
                      <div className="flex items-center space-x-2 truncate">
                        <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">API Sandbox & cURL</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold bg-cyan-500/10 border-cyan-500/30 text-cyan-400">v7.0</span>
                    </button>

                    <button onClick={() => { onOpenTsGenerator?.(); setIsToolsOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono font-medium transition cursor-pointer ${getItemHoverClass()}`}>
                      <div className="flex items-center space-x-2 truncate">
                        <Code2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="truncate">DTO ➔ TypeScript</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold bg-blue-500/10 border-blue-500/30 text-blue-400">v7.0</span>
                    </button>

                    <button onClick={() => { onOpenChaos?.(); setIsToolsOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono font-medium transition cursor-pointer ${getItemHoverClass()}`}>
                      <div className="flex items-center space-x-2 truncate">
                        <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="truncate">Chaos Simulator</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold bg-rose-500/10 border-rose-500/30 text-rose-400">v7.0</span>
                    </button>

                    <button onClick={() => { onOpenBlueprint?.(); setIsToolsOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono font-medium transition cursor-pointer ${getItemHoverClass()}`}>
                      <div className="flex items-center space-x-2 truncate">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">4K C4 Blueprint</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold bg-purple-500/10 border-purple-500/30 text-purple-400">v7.0</span>
                    </button>
                  </div>

                  {/* Column 2: Runtime, Flows & Core Analysis */}
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
                      Runtime & Flow Analysis
                    </div>

                    <button onClick={() => { onOpenReactRuntime?.(); setIsToolsOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono font-medium transition cursor-pointer ${getItemHoverClass()}`}>
                      <div className="flex items-center space-x-2 truncate">
                        <Activity className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span className="truncate">React 19 Runtime</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold bg-sky-500/10 border-sky-500/20 text-sky-400">Fiber</span>
                    </button>

                    <button onClick={() => { onOpenRuntimeTracing?.(); setIsToolsOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono font-medium transition cursor-pointer ${getItemHoverClass()}`}>
                      <div className="flex items-center space-x-2 truncate">
                        <Activity className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                        <span className="truncate">Runtime Tracing</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold bg-cyan-500/10 border-cyan-500/20 text-cyan-400">VCR</span>
                    </button>

                    <button onClick={() => { onOpenApiMetrics?.(); setIsToolsOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono font-medium transition cursor-pointer ${getItemHoverClass()}`}>
                      <div className="flex items-center space-x-2 truncate">
                        <BarChart2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">API Metrics Dashboard</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold bg-indigo-500/10 border-indigo-500/20 text-indigo-400">P95</span>
                    </button>

                    <button onClick={() => { onOpenSequenceDiagram?.(); setIsToolsOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono font-medium transition cursor-pointer ${getItemHoverClass()}`}>
                      <div className="flex items-center space-x-2 truncate">
                        <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">Sequence Diagram</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold bg-amber-500/10 border-amber-500/20 text-amber-400">7 Lanes</span>
                    </button>

                    <button onClick={() => { onOpenLatencyHeatmap?.(); setIsToolsOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono font-medium transition cursor-pointer ${getItemHoverClass()}`}>
                      <div className="flex items-center space-x-2 truncate">
                        <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span className="truncate">Latency Heatmap</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold bg-orange-500/10 border-orange-500/20 text-orange-400">24h</span>
                    </button>

                    <button onClick={() => { onOpenErDiagram(); setIsToolsOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono font-medium transition cursor-pointer ${getItemHoverClass()}`}>
                      <div className="flex items-center space-x-2 truncate">
                        <Database className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">ER Diagram Explorer</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold bg-emerald-500/10 border-emerald-500/20 text-emerald-400">Schema</span>
                    </button>

                    <button onClick={() => { onOpenSecurityFlow(); setIsToolsOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono font-medium transition cursor-pointer ${getItemHoverClass()}`}>
                      <div className="flex items-center space-x-2 truncate">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">Security Pipeline</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold bg-indigo-500/10 border-indigo-500/20 text-indigo-400">JWT</span>
                    </button>

                    <button onClick={() => { onOpenAiAssistant(); setIsToolsOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono font-medium transition cursor-pointer ${getItemHoverClass()}`}>
                      <div className="flex items-center space-x-2 truncate">
                        <Bot className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span className="truncate">AI Code Assistant</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold bg-sky-500/10 border-sky-500/20 text-sky-400">Audit</span>
                    </button>

                    <button onClick={() => { onOpenSqlExplorer(); setIsToolsOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono font-medium transition cursor-pointer ${getItemHoverClass()}`}>
                      <div className="flex items-center space-x-2 truncate">
                        <Database className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">SQL Query Explorer</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold bg-blue-500/10 border-blue-500/20 text-blue-400">JPA</span>
                    </button>

                    <button onClick={() => { onOpenDependencies(); setIsToolsOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono font-medium transition cursor-pointer ${getItemHoverClass()}`}>
                      <div className="flex items-center space-x-2 truncate">
                        <Package className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate">Maven Dependencies</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold bg-indigo-500/10 border-indigo-500/20 text-indigo-300">POM</span>
                    </button>

                    <button onClick={() => { onOpenFileTree(); setIsToolsOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono font-medium transition cursor-pointer ${getItemHoverClass()}`}>
                      <div className="flex items-center space-x-2 truncate">
                        <FolderTree className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                        <span className="truncate">File Tree Visualizer</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border font-bold bg-cyan-500/10 border-cyan-500/20 text-cyan-400">5 Views</span>
                    </button>
                  </div>
                </div>

                {/* Dropdown Footer Action */}
                <div className={`px-4 py-2 border-t flex items-center justify-between shrink-0 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-[#090d16] border-slate-800 text-slate-400'
                }`}>
                  <button
                    onClick={() => { onExportMarkdown(); setIsToolsOpen(false); }}
                    className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Markdown Spec</span>
                  </button>
                  <span className="text-[10px] font-mono opacity-60">Press Ctrl+K for Search</span>
                </div>
              </div>
            )}
          </div>
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
          style={{
            backgroundColor: currentTheme === 'NEUMORPHIC' ? '#e0e5ec' : isLight ? '#ffffff' : '#0b0f19',
            zIndex: 999999,
          }}
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

          {/* ALL 23 ARCHITECTURE TOOLS LIST */}
          <div className="pt-2">
            <div className="px-2 pb-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>All 23 Architecture Tools</span>
              <span className="text-emerald-400 font-extrabold">v8.0 Suite</span>
            </div>
            <div className="space-y-1.5">
              {/* v8.0 Tools */}
              <button onClick={() => handleMobileToolClick(onOpenDrift)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><GitPullRequest className="w-4 h-4 text-amber-400" /><span>1. Git PR Architecture Drift</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">v8.0</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenTestGen)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-emerald-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><CheckSquare className="w-4 h-4 text-emerald-400" /><span>2. Test Suite Generator</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">v8.0</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenCloudInfra)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-sky-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><Cloud className="w-4 h-4 text-sky-400" /><span>3. Cloud IaC & Docker</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400">v8.0</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenEventStream)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-purple-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><Radio className="w-4 h-4 text-purple-400" /><span>4. Kafka & WebSocket Streams</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400">v8.0</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenDistTracing)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-cyan-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><Activity className="w-4 h-4 text-cyan-400" /><span>5. OpenTelemetry Tracing</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">v8.0</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenVoiceCopilot)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-rose-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><Mic className="w-4 h-4 text-rose-400" /><span>6. Voice Copilot</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400">v8.0</span>
              </button>

              {/* v7.0 Tools */}
              <button onClick={() => handleMobileToolClick(onOpenScorecard)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-emerald-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><Activity className="w-4 h-4 text-emerald-400" /><span>7. Scorecard HUD</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">v7.0</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenApiSandbox)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-cyan-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><Terminal className="w-4 h-4 text-cyan-400" /><span>8. API Sandbox & cURL</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">v7.0</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenTsGenerator)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-blue-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><Code2 className="w-4 h-4 text-blue-400" /><span>9. DTO ➔ TypeScript</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">v7.0</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenChaos)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-rose-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><Flame className="w-4 h-4 text-rose-400" /><span>10. Chaos Simulator</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400">v7.0</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenBlueprint)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-cyan-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><Sparkles className="w-4 h-4 text-cyan-400" /><span>11. 4K C4 Blueprint</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400">v7.0</span>
              </button>

              {/* Core Tools */}
              <button onClick={() => handleMobileToolClick(onOpenReactRuntime)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-sky-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><Activity className="w-4 h-4 text-sky-400" /><span>12. React 19 Runtime</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400">Fiber</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenRuntimeTracing)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-cyan-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><Activity className="w-4 h-4 text-cyan-400" /><span>13. Runtime Tracing</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">VCR</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenApiMetrics)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-indigo-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><BarChart2 className="w-4 h-4 text-indigo-400" /><span>14. API Metrics</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">P95</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenSequenceDiagram)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><Zap className="w-4 h-4 text-amber-400" /><span>15. Sequence Diagram</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">7 Lanes</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenLatencyHeatmap)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-orange-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><Flame className="w-4 h-4 text-orange-400" /><span>16. Latency Heatmap</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400">24h</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenErDiagram)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-emerald-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><Database className="w-4 h-4 text-emerald-400" /><span>17. ERD Explorer</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Schema</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenSecurityFlow)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-indigo-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><ShieldCheck className="w-4 h-4 text-indigo-400" /><span>18. Security Pipeline</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">JWT</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenAiAssistant)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-sky-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><Bot className="w-4 h-4 text-sky-400" /><span>19. AI Assistant</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400">Audit</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenSqlExplorer)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-blue-400 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><Database className="w-4 h-4 text-blue-400" /><span>20. Live SQL Explorer</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">JPA</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenDependencies)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-indigo-300 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><Package className="w-4 h-4 text-indigo-300" /><span>21. Dependencies</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">Maven</span>
              </button>
              <button onClick={() => handleMobileToolClick(onOpenFileTree)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono font-semibold ${
                isLight ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-cyan-300 hover:bg-slate-800'
              }`}>
                <div className="flex items-center space-x-2.5"><FolderTree className="w-4 h-4 text-cyan-300" /><span>22. File Tree</span></div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">5 Views</span>
              </button>
            </div>
          </div>

          {currentProjectId && (
            <div className="pt-2 border-t border-slate-500/20 flex items-center space-x-2">
              <button onClick={() => { onExportMarkdown(); setIsMobileMenuOpen(false); }} className="flex-1 flex items-center justify-center space-x-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-mono font-bold">
                <Download className="w-4 h-4" />
                <span>Export MD</span>
              </button>
              <button onClick={() => { onExitProject(); setIsMobileMenuOpen(false); }} className="flex items-center justify-center space-x-1 p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono font-bold">
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
