import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Layers, Sparkles, Play, Activity, BarChart2, Zap, Flame, Database,
  ShieldCheck, Bot, Package, FolderTree, Code2, ArrowRight, CheckCircle2,
  Cpu, Moon, Sun, Box, Workflow, ChevronRight
} from 'lucide-react';
import { Header, ThemeMode } from './components/Header';
import { IngestionModal } from './components/IngestionModal';
import { ProjectDashboard } from './components/ProjectDashboard';
import { InteractiveFlowExplorer } from './components/InteractiveFlowExplorer';
import { NodeInspectorSidebar } from './components/NodeInspectorSidebar';
import { MonacoViewerModal } from './components/MonacoViewerModal';
import { DependencyExplorerModal } from './components/DependencyExplorerModal';
import { SqlExplorerModal } from './components/SqlExplorerModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { ErDiagramModal } from './components/ErDiagramModal';
import { SecurityExplorerModal } from './components/SecurityExplorerModal';
import { FileTreeModal } from './components/FileTreeModal';
import { RuntimeTracingModal } from './components/RuntimeTracingModal';
import { ApiMetricsDashboardModal } from './components/ApiMetricsDashboardModal';
import { SequenceDiagramModal } from './components/SequenceDiagramModal';
import { LatencyHeatmapModal } from './components/LatencyHeatmapModal';
import { Project, GraphData, NodeDetail, ProjectNode } from './types';
import { DEMO_PROJECT_DATA, DEMO_GRAPH_DATA } from './utils/demoData';

export default function App() {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined);
  const [selectedNodeDetail, setSelectedNodeDetail] = useState<NodeDetail | null>(null);

  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isDependencyModalOpen, setIsDependencyModalOpen] = useState(false);
  const [isSqlExplorerOpen, setIsSqlExplorerOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isErDiagramOpen, setIsErDiagramOpen] = useState(false);
  const [isSecurityFlowOpen, setIsSecurityFlowOpen] = useState(false);
  const [isFileTreeOpen, setIsFileTreeOpen] = useState(false);
  const [isRuntimeTracingOpen, setIsRuntimeTracingOpen] = useState(false);
  const [isApiMetricsOpen, setIsApiMetricsOpen] = useState(false);
  const [isSequenceDiagramOpen, setIsSequenceDiagramOpen] = useState(false);
  const [isLatencyHeatmapOpen, setIsLatencyHeatmapOpen] = useState(false);
  const [viewingFilePath, setViewingFilePath] = useState<string | null>(null);

  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('NIGHT');
  const [simulatedStep, setSimulatedStep] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  // Live simulation ticker for hero preview
  useEffect(() => {
    if (currentProjectId) return;
    const interval = setInterval(() => {
      setSimulatedStep((prev) => (prev + 1) % 5);
    }, 1800);
    return () => clearInterval(interval);
  }, [currentProjectId]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProjectNode[]>([]);

  const handleLoadDemoProject = () => {
    setCurrentProjectId(DEMO_PROJECT_DATA.id);
    setProject(DEMO_PROJECT_DATA);
    setGraphData(DEMO_GRAPH_DATA);
    setSelectedNodeId(undefined);
    setSelectedNodeDetail(null);
  };

  const handleOpenToolDirectly = (toolKey: string) => {
    handleLoadDemoProject();
    if (toolKey === 'tracing') setIsRuntimeTracingOpen(true);
    if (toolKey === 'metrics') setIsApiMetricsOpen(true);
    if (toolKey === 'sequence') setIsSequenceDiagramOpen(true);
    if (toolKey === 'heatmap') setIsLatencyHeatmapOpen(true);
    if (toolKey === 'erd') setIsErDiagramOpen(true);
    if (toolKey === 'security') setIsSecurityFlowOpen(true);
    if (toolKey === 'sql') setIsSqlExplorerOpen(true);
    if (toolKey === 'deps') setIsDependencyModalOpen(true);
    if (toolKey === 'ai') setIsAiAssistantOpen(true);
    if (toolKey === 'files') setIsFileTreeOpen(true);
  };

  useEffect(() => {
    if (!currentProjectId || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      axios
        .get<ProjectNode[]>(`/api/v1/projects/${currentProjectId}/search?q=${searchQuery}`)
        .then((res) => setSearchResults(Array.isArray(res.data) ? res.data : []))
        .catch(() => setSearchResults([]));
    }, 300);

    return () => clearTimeout(timer);
  }, [currentProjectId, searchQuery]);

  const handleSelectSearchResult = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleExitProject = () => {
    setCurrentProjectId(null);
    setProject(null);
    setGraphData({ nodes: [], edges: [] });
    setSelectedNodeId(undefined);
    setSelectedNodeDetail(null);
  };

  useEffect(() => {
    if (!currentProjectId) return;

    if (currentProjectId === DEMO_PROJECT_DATA.id) {
      setProject(DEMO_PROJECT_DATA);
      setGraphData(DEMO_GRAPH_DATA);
      return;
    }

    axios
      .get<Project>(`/api/v1/projects/${currentProjectId}`)
      .then((res) => setProject(res.data))
      .catch((err) => console.error('Failed to fetch project:', err));

    axios
      .get<GraphData>(`/api/v1/projects/${currentProjectId}/graph`)
      .then((res) => setGraphData({ nodes: Array.isArray(res.data?.nodes) ? res.data.nodes : [], edges: Array.isArray(res.data?.edges) ? res.data.edges : [] }))
      .catch((err) => console.error('Failed to fetch graph data:', err));
  }, [currentProjectId]);

  useEffect(() => {
    if (!currentProjectId || !selectedNodeId) {
      setSelectedNodeDetail(null);
      return;
    }

    axios
      .get<NodeDetail>(`/api/v1/projects/${currentProjectId}/nodes/${selectedNodeId}`)
      .then((res) => setSelectedNodeDetail(res.data))
      .catch((err) => console.error('Failed to fetch node detail:', err));
  }, [currentProjectId, selectedNodeId]);

  const handleExportMarkdown = () => {
    if (!currentProjectId || !project) return;
    const markdownContent = `# Architectural Documentation: ${project.name}
Generated by CodeFlow Studio v4.1.0

## Project Overview
- **Name**: ${project.name}
- **Status**: ${project.status}
- **Progress**: ${project.progressPercentage}%
- **Total Controllers**: ${project.controllerCount}
- **Total Services**: ${project.serviceCount}
- **Total Repositories**: ${project.repositoryCount}

## Architectural Nodes (${graphData.nodes?.length || 0})
${(Array.isArray(graphData.nodes) ? graphData.nodes : []).map((n) => `- **${n.data?.label || n.id}** (${n.data?.nodeType || 'Node'}) - ${n.data?.filePath || 'Internal'}`).join('\n')}
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}-architecture.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const SIMULATION_NODES = [
    { label: 'React 19 SPA', sub: 'Browser Client', icon: '📱', col: 'text-cyan-400', border: 'border-cyan-500/50', bg: 'bg-cyan-950/40' },
    { label: 'API Gateway', sub: 'Spring Security + JWT', icon: '🛡️', col: 'text-indigo-400', border: 'border-indigo-500/50', bg: 'bg-indigo-950/40' },
    { label: 'OrderController', sub: '@RestController', icon: '⚡', col: 'text-blue-400', border: 'border-blue-500/50', bg: 'bg-blue-950/40' },
    { label: 'OrderService', sub: '@Transactional', icon: '🛠️', col: 'text-purple-400', border: 'border-purple-500/50', bg: 'bg-purple-950/40' },
    { label: 'PostgreSQL 16', sub: 'ACID Storage', icon: '🗄️', col: 'text-amber-400', border: 'border-amber-500/50', bg: 'bg-amber-950/40' },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-950 text-slate-100">
      <Header
        currentProjectName={project?.name}
        currentProjectId={currentProjectId}
        onLoadDemo={handleLoadDemoProject}
        onOpenIngestModal={() => setIsIngestModalOpen(true)}
        onOpenDependencies={() => setIsDependencyModalOpen(true)}
        onOpenSqlExplorer={() => setIsSqlExplorerOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenErDiagram={() => setIsErDiagramOpen(true)}
        onOpenSecurityFlow={() => setIsSecurityFlowOpen(true)}
        onOpenFileTree={() => setIsFileTreeOpen(true)}
        onOpenRuntimeTracing={() => setIsRuntimeTracingOpen(true)}
        onOpenApiMetrics={() => setIsApiMetricsOpen(true)}
        onOpenSequenceDiagram={() => setIsSequenceDiagramOpen(true)}
        onOpenLatencyHeatmap={() => setIsLatencyHeatmapOpen(true)}
        onExportMarkdown={handleExportMarkdown}
        onExitProject={handleExitProject}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={searchResults}
        onSelectSearchResult={handleSelectSearchResult}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {!currentProjectId ? (
          /* Emil Kowalski + Impeccable + Taste Skill Landing Experience */
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-10 flex flex-col items-center bg-gradient-to-b from-[#080c18] via-[#0d1426] to-[#080c18] relative">
            {/* Background Ambient Glow & Grid */}
            <div className="absolute top-0 inset-x-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(236,72,153,0.15),rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />

            {/* Top Pill Release Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 mb-6 badge-sheen shadow-lg shadow-indigo-500/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>v4.1 RELEASE • Visual Code Intelligence Engine</span>
            </div>

            {/* Hero Headline & Subtitle */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-center max-w-4xl tracking-tight leading-tight mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                Interactive Execution Flow &amp; Architecture for{' '}
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
                Spring Boot &amp; React
              </span>
            </h1>

            <p className="text-sm md:text-base text-slate-400 max-w-2xl text-center leading-relaxed mb-8">
              Step-by-step visual execution flow tracing with live replay, 7-swimlane sequence hop tracer, 24-hour latency heatmaps, database ERD, security filters, and AI assistance.
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 z-10">
              <button
                onClick={handleLoadDemoProject}
                className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-sm font-bold text-white shadow-xl shadow-pink-600/30 transition-all transform hover:scale-105 active:scale-95 badge-sheen"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>🎮 Launch Interactive Demo Flow</span>
              </button>

              <button
                onClick={() => setIsIngestModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-[#131b2e] border border-slate-700/80 hover:border-indigo-500 text-sm font-bold text-slate-200 shadow-lg hover:shadow-indigo-500/20 transition-all transform hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Import GitHub Repo / ZIP</span>
              </button>
            </div>

            {/* Emil Kowalski Live Simulated Flow Visualizer Canvas */}
            <div className="w-full max-w-5xl rounded-3xl border border-slate-800/80 bg-[#0b101e]/90 p-5 md:p-7 shadow-2xl backdrop-blur-xl mb-12 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-2 mb-6">
                <div className="flex items-center space-x-2.5">
                  <div className="w-3 h-3 rounded-full bg-pink-500 animate-ping" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Live Pipeline Simulation</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    Step {simulatedStep + 1} of 5
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                  <span className="text-emerald-400 font-bold">● 200 OK</span>
                  <span>•</span>
                  <span>Payload: OrderDTO (42ms)</span>
                </div>
              </div>

              {/* 5-Node Flow Simulation Chain */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4 relative">
                {SIMULATION_NODES.map((node, idx) => {
                  const isActive = idx === simulatedStep;
                  return (
                    <div
                      key={idx}
                      onClick={handleLoadDemoProject}
                      className={`relative cursor-pointer p-4 rounded-2xl border transition-all duration-300 text-center flex flex-col items-center justify-center ${
                        isActive
                          ? 'bg-slate-900 border-pink-500 shadow-[0_0_25px_rgba(236,72,153,0.5)] scale-105 ring-2 ring-pink-500/40'
                          : `${node.bg} ${node.border} opacity-75 hover:opacity-100 hover:scale-102`
                      }`}
                    >
                      <div className="text-3xl mb-2 drop-shadow-md">{node.icon}</div>
                      <span className={`text-xs font-mono font-bold truncate max-w-full ${isActive ? 'text-pink-300' : node.col}`}>
                        {node.label}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 truncate max-w-full mt-0.5">
                        {node.sub}
                      </span>

                      {/* Active Indicator Pulse Ring */}
                      {isActive && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-pink-500 text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-lg shadow-pink-500/50">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick-Start Preset Scenarios */}
            <div className="w-full max-w-5xl mb-12">
              <div className="text-center mb-4">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
                  ⚡ Instant Quickstart Pre-built Feature Flows
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { title: 'Checkout Pipeline', sub: '5 Steps • Spring Boot + JPA', icon: '🛒', key: 'tracing' },
                  { title: 'JWT Security Chain', sub: '4 Steps • Filter Chain Auth', icon: '🔐', key: 'security' },
                  { title: 'Inventory Cache Sync', sub: '5 Steps • DB Transactional', icon: '📦', key: 'erd' },
                  { title: 'API Telemetry Stream', sub: '24h Matrix • P95 Quantiles', icon: '📊', key: 'metrics' },
                ].map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => handleOpenToolDirectly(preset.key)}
                    className="p-4 rounded-2xl bg-[#0f172a]/80 border border-slate-800 hover:border-pink-500/50 hover:bg-[#15203b] text-left transition-all duration-200 group shadow-md"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-2xl">{preset.icon}</span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="text-xs font-mono font-bold text-white group-hover:text-pink-300 transition-colors">
                      {preset.title}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      {preset.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Feature Spotlight Interactive Grid */}
            <div className="w-full max-w-5xl mb-10">
              <div className="text-center mb-6">
                <h3 className="text-lg md:text-xl font-bold font-mono text-white">
                  Explore All 11 Visual Architecture Tools
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Click any card to launch interactive demo mode directly into that tool
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: 'Runtime Tracing Replay', desc: 'VCR player playback from Controller down to Hibernate and SQL.', icon: Activity, col: 'text-cyan-400', key: 'tracing', badge: 'v3.0 Engine' },
                  { title: 'API Metrics & Telemetry', desc: 'Real-time P95 latency distribution, throughput RPS, and critical bottlenecks.', icon: BarChart2, col: 'text-indigo-400', key: 'metrics', badge: 'Telemetry' },
                  { title: 'Sequence Hop Tracer', desc: '7-swimlane asynchronous request and response lifecycle flow.', icon: Zap, col: 'text-pink-400', key: 'sequence', badge: '7 Swimlanes' },
                  { title: '24-Hour Latency Heatmap', desc: 'Hourly quantile matrix diagnosing burst traffic and query spikes.', icon: Flame, col: 'text-amber-400', key: 'heatmap', badge: '24h Matrix' },
                  { title: 'Database ERD Explorer', desc: 'Entity-relationship diagrams, foreign key links, and SQL logs.', icon: Database, col: 'text-emerald-400', key: 'erd', badge: '@Entity Mappings' },
                  { title: 'AI Code Assistant', desc: 'Instant architectural explanations, security auditing, and query reviews.', icon: Bot, col: 'text-purple-400', key: 'ai', badge: 'AI Explainer' },
                ].map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div
                      key={i}
                      onClick={() => handleOpenToolDirectly(f.key)}
                      className="cursor-pointer p-5 rounded-2xl bg-[#0f172a]/70 border border-slate-800/80 hover:border-indigo-500/60 hover:bg-[#131d38] transition-all duration-200 flex flex-col justify-between shadow-lg group hover:-translate-y-1"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 ${f.col} group-hover:scale-110 transition-transform`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {f.badge}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold font-mono text-white group-hover:text-indigo-300 transition-colors">
                          {f.title}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono mt-1.5 leading-relaxed">
                          {f.desc}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono text-indigo-400 font-bold group-hover:text-pink-400 transition-colors">
                        <span>Launch Tool</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Tech Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-6 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
              <span>Java 21</span>
              <span>•</span>
              <span>Spring Boot 3.2</span>
              <span>•</span>
              <span>React 19</span>
              <span>•</span>
              <span>TypeScript 7</span>
              <span>•</span>
              <span>PostgreSQL 16</span>
              <span>•</span>
              <span>Vite 8</span>
            </div>
          </div>
        ) : (
          /* Active Project Canvas & Inspector */
          <div className="flex-1 flex flex-col overflow-hidden">
            {project && <ProjectDashboard project={project} currentTheme={currentTheme} />}

            <div className="flex-1 flex overflow-hidden">
              <InteractiveFlowExplorer
                graphData={graphData}
                onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
                selectedNodeId={selectedNodeId}
                onViewCode={(path) => setViewingFilePath(path)}
                currentTheme={currentTheme}
              />

              {selectedNodeDetail && (
                <NodeInspectorSidebar
                  nodeDetail={selectedNodeDetail}
                  onClose={() => setSelectedNodeId(undefined)}
                  onViewCode={(path) => setViewingFilePath(path)}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <IngestionModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onProjectIngested={(projectId) => {
          setCurrentProjectId(projectId);
          setSelectedNodeId(undefined);
        }}
      />

      <MonacoViewerModal
        projectId={currentProjectId!}
        filePath={viewingFilePath}
        onClose={() => setViewingFilePath(null)}
      />

      <DependencyExplorerModal
        projectId={currentProjectId}
        isOpen={isDependencyModalOpen}
        onClose={() => setIsDependencyModalOpen(false)}
      />

      <SqlExplorerModal
        projectId={currentProjectId}
        isOpen={isSqlExplorerOpen}
        onClose={() => setIsSqlExplorerOpen(false)}
      />

      <AiAssistantModal
        projectId={currentProjectId}
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
      />

      <ErDiagramModal
        projectId={currentProjectId}
        isOpen={isErDiagramOpen}
        onClose={() => setIsErDiagramOpen(false)}
      />

      <SecurityExplorerModal
        projectId={currentProjectId}
        isOpen={isSecurityFlowOpen}
        onClose={() => setIsSecurityFlowOpen(false)}
      />

      <FileTreeModal
        projectId={currentProjectId}
        isOpen={isFileTreeOpen}
        onClose={() => setIsFileTreeOpen(false)}
        onViewCode={(path) => {
          setIsFileTreeOpen(false);
          setViewingFilePath(path);
        }}
      />

      <RuntimeTracingModal
        projectId={currentProjectId}
        isOpen={isRuntimeTracingOpen}
        onClose={() => setIsRuntimeTracingOpen(false)}
        currentTheme={currentTheme}
      />

      <ApiMetricsDashboardModal
        isOpen={isApiMetricsOpen}
        onClose={() => setIsApiMetricsOpen(false)}
        currentTheme={currentTheme}
      />

      <SequenceDiagramModal
        isOpen={isSequenceDiagramOpen}
        onClose={() => setIsSequenceDiagramOpen(false)}
        currentTheme={currentTheme}
      />

      <LatencyHeatmapModal
        isOpen={isLatencyHeatmapOpen}
        onClose={() => setIsLatencyHeatmapOpen(false)}
        currentTheme={currentTheme}
      />
    </div>
  );
}
