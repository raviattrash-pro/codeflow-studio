import React, { useState, useRef, useEffect } from 'react';
import {
  Layers, Search, Database, ShieldCheck, Bot, Package, Download, X,
  FolderTree, Menu, Import, ChevronDown, Activity, Moon, Sun,
  Sparkles, Box, BarChart2, Flame, Zap, Terminal, Code2, Mic,
  GitPullRequest, CheckSquare, Cloud, Radio, Compass, Monitor, Globe, Users, Network, FileCode
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
  onOpenVsCode?: () => void;
  onOpenChromeExt?: () => void;
  onOpenLiveCollab?: () => void;
  onOpenCompliance?: () => void;
  onOpenGraphqlGrpc?: () => void;
  onOpenServiceMesh?: () => void;
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
  onOpenVsCode,
  onOpenChromeExt,
  onOpenLiveCollab,
  onOpenCompliance,
  onOpenGraphqlGrpc,
  onOpenServiceMesh,
  onExportMarkdown,
  onExitProject,
  searchQuery,
  onSearchChange,
  searchResults,
  onSelectSearchResult,
  currentTheme,
  onThemeChange,
}) => {
  // 4 Category Dropdown States
  const [openDropdown, setOpenDropdown] = useState<'devops' | 'arch' | 'runtime' | 'apidata' | 'theme' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);

  const isLight = currentTheme === 'NORMAL' || currentTheme === 'GLASSMORPHISM' || currentTheme === 'NEUMORPHIC';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (name: 'devops' | 'arch' | 'runtime' | 'apidata' | 'theme') => {
    setOpenDropdown(prev => prev === name ? null : name);
  };

  const closeDropdowns = () => {
    setOpenDropdown(null);
  };

  const handleMobileToolClick = (toolFn: (() => void) | undefined) => {
    if (!currentProjectId && onLoadDemo) {
      onLoadDemo();
    }
    toolFn?.();
    setIsMobileMenuOpen(false);
  };

  const getDropdownCardStyle = () => {
    if (currentTheme === 'NEUMORPHIC') {
      return 'bg-[#e0e5ec] border-[#c0cbdc] text-[#2d3748] shadow-2xl';
    }
    if (isLight) {
      return 'bg-white border-slate-200 text-slate-900 shadow-2xl';
    }
    return 'bg-[#0f172a] border-slate-700/80 text-slate-100 shadow-2xl';
  };

  const getItemHoverClass = () => {
    if (isLight) return 'hover:bg-slate-100 text-slate-800';
    return 'hover:bg-slate-800/90 text-slate-200';
  };

  return (
    <header
      className={'h-16 border-b px-3 md:px-5 flex items-center justify-between sticky top-0 shrink-0 transition-colors duration-200 ' + (
        currentTheme === 'NEUMORPHIC' ? 'bg-[#e0e5ec] border-[#c0cbdc] text-[#2d3748]' :
        currentTheme === 'GLASSMORPHISM' ? 'bg-white/90 backdrop-blur-xl border-slate-200/80 text-slate-900 shadow-xs' :
        currentTheme === 'NORMAL' ? 'bg-white border-slate-200 text-slate-900 shadow-xs' :
        'bg-[#090d16] border-slate-800/80 text-slate-100'
      )}
      style={{ zIndex: 99999 }}
      ref={navRef}
    >
      {/* Brand Logo & Title */}
      <div className="flex items-center space-x-2.5 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
          <Layers className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <h1 className={'font-bold text-sm md:text-base tracking-tight ' + (
              isLight ? 'text-slate-900' : 'text-slate-100'
            )}>
              CodeFlow Studio
            </h1>
            <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-sky-500/20 to-purple-500/20 border border-sky-500/30 text-[10px] font-mono font-extrabold text-sky-400">
              v9.0
            </span>
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-xs lg:max-w-sm mx-3 hidden md:flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search 29 Tools, Classes, Endpoints..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={'w-full border rounded-xl pl-8 pr-3 py-1 text-xs font-mono focus:outline-none transition-all ' + (
              currentTheme === 'NEUMORPHIC' ? 'bg-[#e0e5ec] border-[#babecc] text-[#2d3748]' :
              isLight ? 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white' :
              'bg-[#0f172a] border-slate-800 text-slate-200 placeholder-slate-500 focus:border-sky-500'
            )}
          />
        </div>

        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className={'flex items-center gap-1 px-2 py-1 rounded-xl border text-[11px] font-mono font-medium transition cursor-pointer ' + (
              isLight
                ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:text-white'
            )}
            title="Global Command Palette (Ctrl+K)"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="font-bold">Ctrl K</span>
          </button>
        )}

        {onOpenVoiceCopilot && (
          <button
            onClick={onOpenVoiceCopilot}
            className={'p-1.5 rounded-xl border transition cursor-pointer ' + (
              isLight
                ? 'bg-slate-100 border-slate-200 text-rose-600 hover:bg-slate-200'
                : 'bg-rose-950/40 border-rose-800/50 text-rose-300 hover:bg-rose-900/60 hover:text-white'
            )}
            title="Voice Architecture Copilot"
          >
            <Mic className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 4 Dedicated Domain Feature Category Menus (Desktop) */}
      <div className="hidden lg:flex items-center space-x-1.5">
        {/* 1. DevOps & Cloud */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('devops')}
            className={'flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ' + (
              openDropdown === 'devops'
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-400'
                : isLight
                ? 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
                : 'bg-[#0f172a] border-slate-800 text-slate-300 hover:text-white'
            )}
          >
            <Cloud className="w-3.5 h-3.5 text-sky-400" />
            <span>DevOps & Cloud</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {openDropdown === 'devops' && (
            <div
              className={'absolute left-0 mt-2 w-80 border rounded-xl shadow-2xl overflow-hidden py-1.5 ' + getDropdownCardStyle()}
              style={{ zIndex: 999999, backgroundColor: isLight ? '#ffffff' : '#0f172a' }}
            >
              <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider border-b border-slate-700/50 text-sky-400 flex items-center justify-between">
                <span>DevOps, Cloud & Mesh</span>
                <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-extrabold text-[9px]">v9.0</span>
              </div>
              <button onClick={() => { onOpenServiceMesh?.(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <Network className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-semibold flex-1">Multi-Repo Service Mesh & Istio</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold">NEW</span>
              </button>
              <button onClick={() => { onOpenCloudInfra?.(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <Cloud className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="font-semibold flex-1">Cloud IaC & Docker Compose</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400 font-bold">IaC</span>
              </button>
              <button onClick={() => { onOpenEventStream?.(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <Radio className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="font-semibold flex-1">Kafka & WebSocket Streams</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold">Event</span>
              </button>
              <button onClick={() => { onOpenDistTracing?.(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold flex-1">OTel Distributed Tracing</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">Trace</span>
              </button>
              <button onClick={() => { onOpenDrift?.(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <GitPullRequest className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-semibold flex-1">Git PR Architecture Drift</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">Delta</span>
              </button>
              <button onClick={() => { onOpenTestGen?.(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <CheckSquare className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="font-semibold flex-1">Automated Test Generator</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-teal-500/10 border border-teal-500/30 text-teal-400 font-bold">E2E</span>
              </button>
              <button onClick={() => { onOpenVoiceCopilot?.(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <Mic className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="font-semibold flex-1">Voice Architecture Copilot</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold">Voice</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Architecture & Health */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('arch')}
            className={'flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ' + (
              openDropdown === 'arch'
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                : isLight
                ? 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
                : 'bg-[#0f172a] border-slate-800 text-slate-300 hover:text-white'
            )}
          >
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            <span>Architecture</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {openDropdown === 'arch' && (
            <div
              className={'absolute left-0 mt-2 w-80 border rounded-xl shadow-2xl overflow-hidden py-1.5 ' + getDropdownCardStyle()}
              style={{ zIndex: 999999, backgroundColor: isLight ? '#ffffff' : '#0f172a' }}
            >
              <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider border-b border-slate-700/50 text-purple-400 flex items-center justify-between">
                <span>Architecture & Governance</span>
                <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-extrabold text-[9px]">v9.0</span>
              </div>
              <button onClick={() => { onOpenCompliance?.(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold flex-1">Zero-Trust Compliance Matrix</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">NEW</span>
              </button>
              <button onClick={() => { onOpenLiveCollab?.(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <Users className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span className="font-semibold flex-1">WebRTC Live Collab & Whiteboard</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-pink-500/10 border border-pink-500/30 text-pink-400 font-bold">NEW</span>
              </button>
              <button onClick={() => { onOpenScorecard?.(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <Activity className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="font-semibold flex-1">Architecture Health Scorecard</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold">HUD</span>
              </button>
              <button onClick={() => { onOpenBlueprint?.(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-semibold flex-1">4K C4 Blueprint Exporter</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold">SVG</span>
              </button>
              <button onClick={() => { onOpenChaos?.(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="font-semibold flex-1">Chaos & Resilience Simulator</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold">Faults</span>
              </button>
              <button onClick={() => { onOpenAiAssistant(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <Bot className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="font-semibold flex-1">AI Architecture Assistant</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400 font-bold">RAG</span>
              </button>
              <button onClick={() => { onOpenDependencies(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <Package className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="font-semibold flex-1">Maven Dependency Graph</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold">POM</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. Runtime & Flow */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('runtime')}
            className={'flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ' + (
              openDropdown === 'runtime'
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                : isLight
                ? 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
                : 'bg-[#0f172a] border-slate-800 text-slate-300 hover:text-white'
            )}
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Runtime & Flow</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {openDropdown === 'runtime' && (
            <div
              className={'absolute left-0 mt-2 w-80 border rounded-xl shadow-2xl overflow-hidden py-1.5 ' + getDropdownCardStyle()}
              style={{ zIndex: 999999, backgroundColor: isLight ? '#ffffff' : '#0f172a' }}
            >
              <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider border-b border-slate-700/50 text-amber-400 flex items-center justify-between">
                <span>Runtime Execution Flow</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-extrabold text-[9px]">v9.0</span>
              </div>
              <button onClick={() => { onOpenVsCode?.(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <Monitor className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="font-semibold flex-1">VS Code IDE Sidecar & Extension</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold">NEW</span>
              </button>
              <button onClick={() => { onOpenChromeExt?.(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <Globe className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="font-semibold flex-1">Chrome Extension & GitHub DOM</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold">NEW</span>
              </button>
              <button onClick={() => { onOpenReactRuntime?.(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <Activity className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="font-semibold flex-1">React 19 Runtime Explorer</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400 font-bold">Fiber</span>
              </button>
              <button onClick={() => { onOpenRuntimeTracing?.(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-semibold flex-1">Runtime Tracing Replay</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold">VCR</span>
              </button>
              <button onClick={() => { onOpenSequenceDiagram?.(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-semibold flex-1">7-Swimlane Sequence Tracer</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">7 Lanes</span>
              </button>
              <button onClick={() => { onOpenLatencyHeatmap?.(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span className="font-semibold flex-1">24h Latency Heatmap</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold">Quantile</span>
              </button>
              <button onClick={() => { onOpenApiMetrics?.(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <BarChart2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="font-semibold flex-1">API Metrics Dashboard</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold">P95/P99</span>
              </button>
            </div>
          )}
        </div>

        {/* 4. APIs & Database */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('apidata')}
            className={'flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ' + (
              openDropdown === 'apidata'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                : isLight
                ? 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
                : 'bg-[#0f172a] border-slate-800 text-slate-300 hover:text-white'
            )}
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>APIs & Data</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {openDropdown === 'apidata' && (
            <div
              className={'absolute right-0 mt-2 w-80 border rounded-xl shadow-2xl overflow-hidden py-1.5 ' + getDropdownCardStyle()}
              style={{ zIndex: 999999, backgroundColor: isLight ? '#ffffff' : '#0f172a' }}
            >
              <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider border-b border-slate-700/50 text-emerald-400 flex items-center justify-between">
                <span>APIs, Schemas & Database</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-extrabold text-[9px]">v9.0</span>
              </div>
              <button onClick={() => { onOpenGraphqlGrpc?.(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <FileCode className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span className="font-semibold flex-1">GraphQL SDL & gRPC Proto3</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-pink-500/10 border border-pink-500/30 text-pink-400 font-bold">NEW</span>
              </button>
              <button onClick={() => { onOpenTsGenerator?.(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <Code2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="font-semibold flex-1">Java DTO ➔ TypeScript</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold">Gen</span>
              </button>
              <button onClick={() => { onOpenApiSandbox?.(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-semibold flex-1">REST API Sandbox & cURL</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold">cURL</span>
              </button>
              <button onClick={() => { onOpenErDiagram(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold flex-1">Database ERD & Schema</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">JPA</span>
              </button>
              <button onClick={() => { onOpenSqlExplorer(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <Database className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="font-semibold flex-1">Live SQL Query Logs</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold">SQL</span>
              </button>
              <button onClick={() => { onOpenSecurityFlow(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="font-semibold flex-1">Spring Security 6 Pipeline</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold">JWT</span>
              </button>
              <button onClick={() => { onOpenFileTree(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono cursor-pointer ' + getItemHoverClass()}>
                <FolderTree className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-semibold flex-1">5-Mode File Tree Explorer</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold">AST</span>
              </button>
              <button onClick={() => { onExportMarkdown(); closeDropdowns(); }} className={'w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs font-mono text-emerald-400 cursor-pointer ' + getItemHoverClass()}>
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span className="font-semibold flex-1">Export Markdown RFC</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">RFC</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Theme Toggle & Actions */}
      <div className="flex items-center space-x-2">
        {/* Theme Selector */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => toggleDropdown('theme')}
            className={'flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ' + (
              openDropdown === 'theme'
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                : isLight
                ? 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
                : 'bg-[#0f172a] border-slate-800 text-slate-300 hover:text-white'
            )}
          >
            {currentTheme === 'NIGHT' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> :
             currentTheme === 'NORMAL' ? <Sun className="w-3.5 h-3.5 text-amber-500" /> :
             currentTheme === 'GLASSMORPHISM' ? <Sparkles className="w-3.5 h-3.5 text-sky-500" /> :
             <Box className="w-3.5 h-3.5 text-slate-500" />}
            <span className="capitalize">{currentTheme.toLowerCase()}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {openDropdown === 'theme' && (
            <div
              className={'absolute right-0 mt-2 w-44 border rounded-xl shadow-2xl overflow-hidden py-1 ' + getDropdownCardStyle()}
              style={{ zIndex: 999999, backgroundColor: isLight ? '#ffffff' : '#0f172a' }}
            >
              {[
                { id: 'NIGHT', label: 'Obsidian Night', icon: <Moon className="w-3.5 h-3.5 text-indigo-400" /> },
                { id: 'NORMAL', label: 'Light Clean', icon: <Sun className="w-3.5 h-3.5 text-amber-500" /> },
                { id: 'GLASSMORPHISM', label: 'Glassmorphism', icon: <Sparkles className="w-3.5 h-3.5 text-sky-400" /> },
                { id: 'NEUMORPHIC', label: 'Neumorphic Soft', icon: <Box className="w-3.5 h-3.5 text-slate-400" /> },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => { onThemeChange(t.id as ThemeMode); closeDropdowns(); }}
                  className={'w-full text-left px-3 py-2 flex items-center space-x-2 text-xs font-mono transition cursor-pointer ' + (
                    currentTheme === t.id ? 'bg-indigo-600/20 text-indigo-300 font-bold' : getItemHoverClass()
                  )}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Demo Button */}
        {onLoadDemo && !currentProjectId && (
          <button
            onClick={onLoadDemo}
            className="hidden md:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-xs font-mono font-bold text-white shadow-md shadow-sky-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Try Demo</span>
          </button>
        )}

        {/* Import Repo Button */}
        <button
          onClick={onOpenIngestModal}
          className={'hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ' + (
            isLight
              ? 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
              : 'bg-[#0f172a] border-slate-800 text-slate-200 hover:border-slate-700 hover:text-white'
          )}
        >
          <Import className="w-3.5 h-3.5 text-sky-400" />
          <span>Import</span>
        </button>

        {currentProjectId && (
          <button
            onClick={onExitProject}
            className="hidden md:flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-mono font-medium text-red-500 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        )}

        {/* Mobile Drawer Hamburger */}
        <div className="flex lg:hidden items-center space-x-1.5">
          {onLoadDemo && !currentProjectId && (
            <button
              onClick={onLoadDemo}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-xs font-mono font-bold text-white shadow-md"
            >
              <Sparkles className="w-3 h-3" />
              <span>Demo</span>
            </button>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={'p-2 rounded-xl border transition-colors cursor-pointer ' + (
              isLight
                ? 'bg-slate-100 border-slate-200 text-slate-800'
                : 'bg-slate-900 border-slate-800 text-slate-200'
            )}
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Drawer */}
      {isMobileMenuOpen && (
        <div
          className={'absolute top-16 left-0 right-0 border-b p-4 flex flex-col space-y-4 lg:hidden shadow-2xl overflow-y-auto max-h-[85vh] custom-scrollbar ' + getDropdownCardStyle()}
          style={{
            backgroundColor: currentTheme === 'NEUMORPHIC' ? '#e0e5ec' : isLight ? '#ffffff' : '#090d16',
            zIndex: 999999,
          }}
        >
          {/* Theme Mode Selector */}
          <div className={'flex items-center justify-between p-2.5 rounded-xl border ' + (
            isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
          )}>
            <span className="text-xs font-mono font-bold">Theme Mode:</span>
            <div className="flex items-center space-x-1">
              <button onClick={() => onThemeChange('NIGHT')} className={'p-1.5 rounded-lg ' + (currentTheme === 'NIGHT' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400')}><Moon className="w-4 h-4" /></button>
              <button onClick={() => onThemeChange('NORMAL')} className={'p-1.5 rounded-lg ' + (currentTheme === 'NORMAL' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-amber-600')}><Sun className="w-4 h-4" /></button>
              <button onClick={() => onThemeChange('GLASSMORPHISM')} className={'p-1.5 rounded-lg ' + (currentTheme === 'GLASSMORPHISM' ? 'bg-sky-500 text-white' : 'bg-sky-500/20 text-sky-400')}><Sparkles className="w-4 h-4" /></button>
              <button onClick={() => onThemeChange('NEUMORPHIC')} className={'p-1.5 rounded-lg ' + (currentTheme === 'NEUMORPHIC' ? 'bg-slate-600 text-white' : 'bg-[#e0e5ec] text-slate-700')}><Box className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            {onLoadDemo && (
              <button
                onClick={() => { onLoadDemo(); setIsMobileMenuOpen(false); }}
                className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-xs font-mono font-bold shadow-md cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Demo</span>
              </button>
            )}
            <button
              onClick={() => { onOpenIngestModal(); setIsMobileMenuOpen(false); }}
              className={'flex items-center justify-center space-x-1.5 p-2.5 rounded-xl border text-xs font-mono font-bold cursor-pointer ' + (
                isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
              )}
            >
              <Import className="w-3.5 h-3.5 text-sky-400" />
              <span>Import Repo</span>
            </button>
          </div>

          {/* 1. Cloud & DevOps */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider block px-1">
              DevOps, Cloud & Mesh (v9.0)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <button onClick={() => handleMobileToolClick(onOpenServiceMesh)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><Network className="w-3.5 h-3.5 text-cyan-400" /><span>Service Mesh & Istio</span></button>
              <button onClick={() => handleMobileToolClick(onOpenCloudInfra)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><Cloud className="w-3.5 h-3.5 text-sky-400" /><span>Cloud IaC / Docker</span></button>
              <button onClick={() => handleMobileToolClick(onOpenEventStream)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><Radio className="w-3.5 h-3.5 text-purple-400" /><span>Kafka Streams</span></button>
              <button onClick={() => handleMobileToolClick(onOpenDistTracing)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><Activity className="w-3.5 h-3.5 text-emerald-400" /><span>OTel Tracing</span></button>
              <button onClick={() => handleMobileToolClick(onOpenDrift)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><GitPullRequest className="w-3.5 h-3.5 text-amber-400" /><span>Git PR Drift</span></button>
              <button onClick={() => handleMobileToolClick(onOpenTestGen)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><CheckSquare className="w-3.5 h-3.5 text-teal-400" /><span>Test Generator</span></button>
              <button onClick={() => handleMobileToolClick(onOpenVoiceCopilot)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><Mic className="w-3.5 h-3.5 text-rose-400" /><span>Voice Copilot</span></button>
            </div>
          </div>

          {/* 2. Architecture & Design */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider block px-1">
              Architecture & Governance (v9.0)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <button onClick={() => handleMobileToolClick(onOpenCompliance)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /><span>Compliance Matrix</span></button>
              <button onClick={() => handleMobileToolClick(onOpenLiveCollab)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><Users className="w-3.5 h-3.5 text-pink-400" /><span>Live Collab Room</span></button>
              <button onClick={() => handleMobileToolClick(onOpenScorecard)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><Activity className="w-3.5 h-3.5 text-indigo-400" /><span>Scorecard HUD</span></button>
              <button onClick={() => handleMobileToolClick(onOpenBlueprint)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><Sparkles className="w-3.5 h-3.5 text-cyan-400" /><span>4K Blueprint</span></button>
              <button onClick={() => handleMobileToolClick(onOpenChaos)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><Flame className="w-3.5 h-3.5 text-rose-400" /><span>Chaos Simulator</span></button>
              <button onClick={() => handleMobileToolClick(onOpenAiAssistant)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><Bot className="w-3.5 h-3.5 text-sky-400" /><span>AI Assistant</span></button>
              <button onClick={() => handleMobileToolClick(onOpenDependencies)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><Package className="w-3.5 h-3.5 text-purple-400" /><span>Dependencies</span></button>
            </div>
          </div>

          {/* 3. Runtime & Flow */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block px-1">
              Runtime & IDE Flow (v9.0)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <button onClick={() => handleMobileToolClick(onOpenVsCode)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><Monitor className="w-3.5 h-3.5 text-blue-400" /><span>VS Code Sidecar</span></button>
              <button onClick={() => handleMobileToolClick(onOpenChromeExt)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><Globe className="w-3.5 h-3.5 text-rose-400" /><span>Chrome Extension</span></button>
              <button onClick={() => handleMobileToolClick(onOpenReactRuntime)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><Activity className="w-3.5 h-3.5 text-sky-400" /><span>React 19 Runtime</span></button>
              <button onClick={() => handleMobileToolClick(onOpenRuntimeTracing)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><Activity className="w-3.5 h-3.5 text-cyan-400" /><span>Runtime Tracing</span></button>
              <button onClick={() => handleMobileToolClick(onOpenSequenceDiagram)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><Zap className="w-3.5 h-3.5 text-amber-400" /><span>Sequence Tracer</span></button>
              <button onClick={() => handleMobileToolClick(onOpenLatencyHeatmap)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><Flame className="w-3.5 h-3.5 text-orange-400" /><span>Latency Heatmap</span></button>
              <button onClick={() => handleMobileToolClick(onOpenApiMetrics)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><BarChart2 className="w-3.5 h-3.5 text-indigo-400" /><span>API Metrics</span></button>
            </div>
          </div>

          {/* 4. APIs & Database */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block px-1">
              APIs, Schemas & Data (v9.0)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <button onClick={() => handleMobileToolClick(onOpenGraphqlGrpc)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><FileCode className="w-3.5 h-3.5 text-pink-400" /><span>GraphQL & gRPC</span></button>
              <button onClick={() => handleMobileToolClick(onOpenTsGenerator)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><Code2 className="w-3.5 h-3.5 text-blue-400" /><span>DTO ➔ TS</span></button>
              <button onClick={() => handleMobileToolClick(onOpenApiSandbox)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><Terminal className="w-3.5 h-3.5 text-cyan-400" /><span>REST Sandbox</span></button>
              <button onClick={() => handleMobileToolClick(onOpenErDiagram)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><Database className="w-3.5 h-3.5 text-emerald-400" /><span>ERD Explorer</span></button>
              <button onClick={() => handleMobileToolClick(onOpenSqlExplorer)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><Database className="w-3.5 h-3.5 text-blue-400" /><span>SQL Explorer</span></button>
              <button onClick={() => handleMobileToolClick(onOpenSecurityFlow)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /><span>Security Flow</span></button>
              <button onClick={() => handleMobileToolClick(onOpenFileTree)} className="text-left p-2 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center space-x-2 text-xs font-mono text-slate-200"><FolderTree className="w-3.5 h-3.5 text-cyan-400" /><span>File Tree</span></button>
              <button onClick={() => { onExportMarkdown(); setIsMobileMenuOpen(false); }} className="text-left p-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center space-x-2 text-xs font-mono text-emerald-400"><Download className="w-3.5 h-3.5" /><span>Export RFC Spec</span></button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
