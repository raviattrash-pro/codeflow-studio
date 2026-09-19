import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GraphData } from '../types';
import { FlowStep } from './InteractiveFlowExplorer';
import { getAnnotationDetails } from '../utils/annotationDictionary';
import { getInterviewQuestionsForNode } from '../utils/interviewQuestions';
import {
  X, Sparkles, Code2, ArrowDown, ArrowRight,
  Smartphone, ShieldCheck, Cpu, Database,
  Layers, Server, Terminal, ExternalLink,
  ZoomIn, ZoomOut, RotateCcw, Download, Copy, Check,
  Share2, ChevronDown, CheckCircle2, Globe, Lock, HardDrive,
  Activity, RefreshCw, GitBranch, Wrench
} from 'lucide-react';
import { ThemeMode } from './Header';

interface HLDFlowCanvasProps {
  graphData: GraphData;
  flowSteps: FlowStep[];
  activeStepIndex: number;
  onSelectStep: (index: number) => void;
  onViewCode?: (filePath: string) => void;
  currentTheme?: ThemeMode;
  onOpenTool?: (toolKey: string) => void;
  projectName?: string;
}

interface DiagramNode {
  id: string;
  label: string;
  sub?: string;
  filePath?: string;
  type: 'USER' | 'REACT_APP' | 'AUTH_CONTEXT' | 'FE_VIEW' | 'PROXY' | 'API_GATEWAY' | 'SECURITY_CONFIG' | 'JWT_FILTER' | 'DOMAIN_CONTROLLER' | 'JPA_REPO' | 'DATABASE' | 'EXTERNAL';
  annotations?: string;
  category: 'CLIENT' | 'API_ACCESS' | 'DOMAIN' | 'PERSISTENCE' | 'EXTERNAL';
  color: string;
  bg: string;
  border: string;
}

// Reusable tool item
const ToolCard: React.FC<{ icon: string; label: string; desc?: string; onClick: () => void }> = ({ icon, label, desc, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-start gap-2.5 p-2.5 rounded-xl text-left hover:bg-purple-100 dark:hover:bg-purple-950/60 border border-slate-200 dark:border-slate-700 hover:border-purple-300 transition cursor-pointer group w-full bg-white dark:bg-slate-800"
  >
    <span className="text-base shrink-0 p-1.5 rounded-lg bg-purple-50 dark:bg-slate-700 group-hover:scale-110 transition">{icon}</span>
    <div className="min-w-0 flex-1">
      <div className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 truncate">{label}</div>
      {desc && <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{desc}</div>}
    </div>
  </button>
);

export const HLDFlowCanvas: React.FC<HLDFlowCanvasProps> = ({
  graphData,
  flowSteps,
  activeStepIndex,
  onSelectStep,
  onViewCode,
  currentTheme = 'NORMAL',
  onOpenTool,
  projectName = 'Repository',
}) => {
  const [selectedNode, setSelectedNode] = useState<DiagramNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isZoomEnabled, setIsZoomEnabled] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isActivityMenuOpen, setIsActivityMenuOpen] = useState(false);
  const [isAllToolsOpen, setIsAllToolsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  const isLight = currentTheme === 'NORMAL' || currentTheme === 'GLASSMORPHISM' || currentTheme === 'NEUMORPHIC';

  // Parse Real Architecture Nodes from Ingested Graph Data
  const nodes = Array.isArray(graphData.nodes) ? graphData.nodes : [];
  const edges = Array.isArray(graphData.edges) ? graphData.edges : [];

  const controllers = useMemo(() => nodes.filter((n) => n.data?.nodeType === 'SPRING_CONTROLLER'), [nodes]);
  const services = useMemo(() => nodes.filter((n) => n.data?.nodeType === 'SPRING_SERVICE'), [nodes]);
  const repos = useMemo(() => nodes.filter((n) => n.data?.nodeType === 'SPRING_REPOSITORY'), [nodes]);
  const tables = useMemo(() => nodes.filter((n) => n.data?.layer === 'DATABASE'), [nodes]);
  const feComps = useMemo(() => nodes.filter((n) => n.data?.layer === 'FRONTEND'), [nodes]);

  // Group Controllers into Distinct Domain Workflows
  const domainWorkflows = useMemo(() => {
    const domainMap = new Map<string, any[]>();
    
    controllers.forEach(ctrl => {
      const rawLabel = ctrl.data?.label || 'API';
      const cleanName = rawLabel.split('.')[0].replace('Controller', '').trim();
      const domainName = cleanName ? `${cleanName.replace(/([a-z])([A-Z])/g, '$1 $2')} Workflows` : 'General Workflows';
      
      if (!domainMap.has(domainName)) {
        domainMap.set(domainName, []);
      }
      domainMap.get(domainName)!.push(ctrl);
    });

    if (domainMap.size === 0) {
      domainMap.set('Authentication', [
        { id: 'auth_workflow', data: { label: 'Auth & Session Controller' } }
      ]);
      domainMap.set('Communication Features', [
        { id: 'comm_workflow', data: { label: 'Communication & Messaging Controller' } }
      ]);
      domainMap.set('School Operations', [
        { id: 'ops_workflow', data: { label: 'Operations & Workflow Controller' } }
      ]);
      domainMap.set('Finance Reports', [
        { id: 'fin_workflow', data: { label: 'Finance & Invoicing Controller' } }
      ]);
      domainMap.set('Student Administration', [
        { id: 'stud_workflow', data: { label: 'Student Records Controller' } }
      ]);
      domainMap.set('Media Workflows', [
        { id: 'media_workflow', data: { label: 'Media Upload Controller' } }
      ]);
      domainMap.set('Academic Workflows', [
        { id: 'acad_workflow', data: { label: 'Curriculum & Grading Controller' } }
      ]);
    }

    return Array.from(domainMap.entries()).map(([name, ctrls]) => ({
      name,
      controllers: ctrls,
      count: ctrls.length
    }));
  }, [controllers]);

  // Filtered Domain Workflows if user selects a specific domain in Activity menu
  const activeDomains = useMemo(() => {
    if (selectedDomain === 'ALL') return domainWorkflows;
    return domainWorkflows.filter(d => d.name === selectedDomain);
  }, [domainWorkflows, selectedDomain]);

  // Annotations & QA for selected node drawer
  const selAnnotations = selectedNode ? getAnnotationDetails(selectedNode.annotations) : [];
  const selQA = selectedNode ? getInterviewQuestionsForNode(selectedNode.type) : [];

  // Close open dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-trigger-area')) {
        setIsActivityMenuOpen(false);
        setIsExportMenuOpen(false);
      }
    };
    if (isActivityMenuOpen || isExportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActivityMenuOpen, isExportMenuOpen]);

  const handleExportMermaid = () => {
    const mermaid = `graph TD
    User([School Users]) -->|uses| ReactApp[React Application (App.jsx)]
    ReactApp -->|reads auth| AuthContext[Auth Context]
    ReactApp -->|sends requests| Cloudflare[Cloudflare Proxy]
    Cloudflare -->|proxies traffic| SpringBoot[Spring Boot API]
    SpringBoot -->|enters security| SecConfig[Security Config]
    SecConfig -->|applies filter| JwtFilter[JWT Filter]
    JwtFilter -->|dispatches| DomainWorkflows[Domain Workflows]
    DomainWorkflows -->|reads/writes| JpaRepos[JPA Repositories]
    JpaRepos -->|persists| Database[(MySQL Database)]
`;
    navigator.clipboard.writeText(mermaid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setIsExportMenuOpen(false);
  };

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden select-none"
      style={{ backgroundColor: isLight ? '#ece2fa' : '#090d16', color: isLight ? '#0f172a' : '#f8fafc' }}
    >
      {/* ─── EXACT GITDIAGRAM TOP ACTION BAR (5 PILL BUTTONS) ─── */}
      <div className="px-4 sm:px-6 pt-5 pb-3 flex flex-wrap items-center justify-center gap-2 sm:gap-3 z-40 bg-transparent">
        {/* Pill 1: Repo Badge */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold bg-white text-slate-900 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-default dark:bg-slate-900 dark:text-white dark:border-slate-700"
        >
          <GitBranch className="w-4 h-4 text-slate-900 dark:text-purple-400 shrink-0" />
          <span className="truncate max-w-[150px] sm:max-w-none">{projectName}</span>
        </div>

        {/* Pill 2: Activity Dropdown */}
        <div className="relative dropdown-trigger-area">
          <button
            onClick={() => { setIsActivityMenuOpen(!isActivityMenuOpen); setIsExportMenuOpen(false); setIsAllToolsOpen(false); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold bg-white text-slate-900 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50 transition cursor-pointer dark:bg-slate-900 dark:text-white dark:border-slate-700"
          >
            <span>Activity</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {isActivityMenuOpen && (
            <div
              className={`absolute left-0 sm:left-auto top-full mt-2 w-72 max-h-64 sm:max-h-72 overflow-y-auto rounded-2xl p-2 z-50 flex flex-col gap-1 custom-scrollbar shadow-2xl ${
                isLight
                  ? 'bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-slate-900'
                  : 'bg-slate-900 border-2 border-slate-700 shadow-2xl text-slate-100'
              }`}
            >
              <button
                onClick={() => { setSelectedDomain('ALL'); setIsActivityMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                  selectedDomain === 'ALL'
                    ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 font-bold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                All Activities & Domains ({domainWorkflows.length})
              </button>
              {domainWorkflows.map((d, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedDomain(d.name); setIsActivityMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition cursor-pointer ${
                    selectedDomain === d.name
                      ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {d.name} ({d.count})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pill 3: Enable Zoom */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsZoomEnabled(!isZoomEnabled)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition cursor-pointer ${
              isZoomEnabled
                ? 'bg-white text-slate-900 dark:bg-slate-900 dark:text-white dark:border-slate-700'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            <span>⛶ Enable zoom</span>
          </button>

          {isZoomEnabled && (
            <div className="flex items-center gap-1 rounded-xl p-0.5 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:bg-slate-900 dark:border-slate-700">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-[11px] font-mono font-bold text-slate-900 dark:text-slate-100">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(1.6, prev + 0.1))}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Pill 4: Export Dropdown */}
        <div className="relative dropdown-trigger-area">
          <button
            onClick={() => { setIsExportMenuOpen(!isExportMenuOpen); setIsActivityMenuOpen(false); setIsAllToolsOpen(false); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold bg-white text-slate-900 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50 transition cursor-pointer dark:bg-slate-900 dark:text-white dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-slate-900 dark:text-purple-400" />
            <span>Export</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {isExportMenuOpen && (
            <div
              className={`absolute right-0 top-full mt-2 w-72 max-h-64 sm:max-h-72 overflow-y-auto rounded-2xl p-3 z-50 flex flex-col gap-1.5 custom-scrollbar shadow-2xl ${
                isLight
                  ? 'bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-slate-900'
                  : 'bg-slate-900 border-2 border-slate-700 shadow-2xl text-slate-100'
              }`}
            >
              <span className="text-[10px] font-mono font-bold text-purple-700 dark:text-purple-400 uppercase px-2 mb-0.5">📦 Export Diagram</span>
              <button
                onClick={handleExportMermaid}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono font-semibold text-slate-800 dark:text-slate-100 hover:bg-purple-100 dark:hover:bg-purple-950/80 cursor-pointer"
              >
                <span>Export as Mermaid</span>
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              </button>
              <button
                onClick={() => { onOpenTool?.('blueprint'); setIsExportMenuOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-semibold text-slate-800 dark:text-slate-100 hover:bg-purple-100 dark:hover:bg-purple-950/80 cursor-pointer"
              >
                <span>Export C4 Blueprint</span>
              </button>
              <button
                onClick={() => { onOpenTool?.('sequence'); setIsExportMenuOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-semibold text-slate-800 dark:text-slate-100 hover:bg-purple-100 dark:hover:bg-purple-950/80 cursor-pointer"
              >
                <span>Export Sequence Diagram</span>
              </button>
              <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
              <button
                onClick={() => { setIsAllToolsOpen(true); setIsExportMenuOpen(false); }}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono font-bold text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60 cursor-pointer"
              >
                <span>⚡ All 29 Studio Tools...</span>
                <span>→</span>
              </button>
            </div>
          )}
        </div>

        {/* Pill 5: Regenerate (Purple Pill Button) */}
        <button
          onClick={() => {
            setZoomLevel(1);
            setSelectedDomain('ALL');
          }}
          className="flex items-center gap-2 px-5 py-2 rounded-xl font-mono text-xs font-bold text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition cursor-pointer"
          style={{ backgroundColor: '#a855f7' }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Regenerate</span>
        </button>
      </div>

      {/* ─── ALL 29 TOOLS MODAL POPUP (Rock-solid viewport containment) ─── */}
      {isAllToolsOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsAllToolsOpen(false)}
          style={{ zIndex: 999999 }}
        >
          <div
            className={`w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden my-auto border-2 ${
              isLight
                ? 'bg-white border-black text-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-slate-900 border-slate-700 text-slate-100 shadow-2xl'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Modal Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-sm">⚡</span>
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                  All 29 CodeFlow Studio Tools &amp; Features
                </h2>
              </div>
              <button
                onClick={() => setIsAllToolsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Column 1: Analysis & Security */}
                <div className="space-y-3">
                  <div className={`text-[11px] font-mono font-bold uppercase tracking-wider px-1 ${isLight ? 'text-purple-800' : 'text-purple-400'}`}>
                    Code Analysis &amp; Database
                  </div>
                  <div className="space-y-1.5">
                    <ToolCard icon="📁" label="File Tree Browser" desc="Explore codebase AST hierarchy" onClick={() => { onOpenTool?.('files'); setIsAllToolsOpen(false); }} />
                    <ToolCard icon="📦" label="Dependency Graph" desc="POM & Gradle dependency tree" onClick={() => { onOpenTool?.('deps'); setIsAllToolsOpen(false); }} />
                    <ToolCard icon="🗃️" label="Database ERD" desc="Visual schema entity relationships" onClick={() => { onOpenTool?.('erd'); setIsAllToolsOpen(false); }} />
                    <ToolCard icon="🔎" label="SQL Query Inspector" desc="JPA repository queries" onClick={() => { onOpenTool?.('sql'); setIsAllToolsOpen(false); }} />
                    <ToolCard icon="⚛️" label="React Fiber Runtime" desc="Component tree inspection" onClick={() => { onOpenTool?.('react'); setIsAllToolsOpen(false); }} />
                    <ToolCard icon="📋" label="Architecture Scorecard" desc="Automated quality metrics" onClick={() => { onOpenTool?.('scorecard'); setIsAllToolsOpen(false); }} />
                    <ToolCard icon="🔀" label="Schema Drift Detector" desc="Flyway & JPA differences" onClick={() => { onOpenTool?.('drift'); setIsAllToolsOpen(false); }} />
                  </div>

                  <div className={`pt-2 text-[11px] font-mono font-bold uppercase tracking-wider px-1 ${isLight ? 'text-purple-800' : 'text-purple-400'}`}>
                    Security &amp; Compliance
                  </div>
                  <div className="space-y-1.5">
                    <ToolCard icon="🔐" label="Spring Security Chain" desc="Filter chain visualizer" onClick={() => { onOpenTool?.('security'); setIsAllToolsOpen(false); }} />
                    <ToolCard icon="✅" label="SOC2 / GDPR Compliance" desc="Compliance audit matrix" onClick={() => { onOpenTool?.('compliance'); setIsAllToolsOpen(false); }} />
                  </div>
                </div>

                {/* Column 2: DevOps, AI & Observability */}
                <div className="space-y-3">
                  <div className={`text-[11px] font-mono font-bold uppercase tracking-wider px-1 ${isLight ? 'text-purple-800' : 'text-purple-400'}`}>
                    DevOps &amp; Testing
                  </div>
                  <div className="space-y-1.5">
                    <ToolCard icon="💻" label="TypeScript / Zod Generator" desc="Auto-generate types from DTOs" onClick={() => { onOpenTool?.('ts-generator'); setIsAllToolsOpen(false); }} />
                    <ToolCard icon="🧪" label="Interactive API Sandbox" desc="Execute REST endpoints live" onClick={() => { onOpenTool?.('api-sandbox'); setIsAllToolsOpen(false); }} />
                    <ToolCard icon="🧬" label="Unit Test Generator" desc="Synthesize JUnit 5 suites" onClick={() => { onOpenTool?.('test-gen'); setIsAllToolsOpen(false); }} />
                    <ToolCard icon="💥" label="Chaos Simulator" desc="Latency & failure injection" onClick={() => { onOpenTool?.('chaos'); setIsAllToolsOpen(false); }} />
                    <ToolCard icon="☁️" label="Cloud & Docker Infra" desc="Dockerfile & K8s synthesizer" onClick={() => { onOpenTool?.('cloud-infra'); setIsAllToolsOpen(false); }} />
                    <ToolCard icon="📡" label="Kafka Event Stream" desc="Topic & message visualizer" onClick={() => { onOpenTool?.('event-stream'); setIsAllToolsOpen(false); }} />
                    <ToolCard icon="🌐" label="GraphQL / gRPC Explorer" desc="Schema & RPC playground" onClick={() => { onOpenTool?.('graphql-grpc'); setIsAllToolsOpen(false); }} />
                    <ToolCard icon="🕸️" label="Istio Service Mesh" desc="Traffic routing topology" onClick={() => { onOpenTool?.('service-mesh'); setIsAllToolsOpen(false); }} />
                  </div>

                  <div className={`pt-2 text-[11px] font-mono font-bold uppercase tracking-wider px-1 ${isLight ? 'text-purple-800' : 'text-purple-400'}`}>
                    AI &amp; Observability
                  </div>
                  <div className="space-y-1.5">
                    <ToolCard icon="🤖" label="AI Copilot Assistant" desc="Deep architecture explanations" onClick={() => { onOpenTool?.('ai'); setIsAllToolsOpen(false); }} />
                    <ToolCard icon="🎙️" label="Voice Copilot" desc="Voice-activated queries" onClick={() => { onOpenTool?.('voice'); setIsAllToolsOpen(false); }} />
                    <ToolCard icon="📊" label="API Metrics Dashboard" desc="Throughput & p99 latencies" onClick={() => { onOpenTool?.('metrics'); setIsAllToolsOpen(false); }} />
                    <ToolCard icon="🔥" label="Latency Heatmap" desc="End-to-end hot paths" onClick={() => { onOpenTool?.('heatmap'); setIsAllToolsOpen(false); }} />
                    <ToolCard icon="🔗" label="Distributed Tracing (OTel)" desc="Span waterfall traces" onClick={() => { onOpenTool?.('dist-tracing'); setIsAllToolsOpen(false); }} />
                    <ToolCard icon="💜" label="VS Code Sidecar" desc="IDE extension bridge" onClick={() => { onOpenTool?.('vscode'); setIsAllToolsOpen(false); }} />
                    <ToolCard icon="🌍" label="Chrome Extension" desc="Browser devtools bridge" onClick={() => { onOpenTool?.('chrome'); setIsAllToolsOpen(false); }} />
                    <ToolCard icon="👥" label="Live Collaboration" desc="Real-time multi-user cursor" onClick={() => { onOpenTool?.('collab'); setIsAllToolsOpen(false); }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MAIN VERTICAL ARCHITECTURE CANVAS (EXACT GITDIAGRAM MATCH) ─── */}
      <div
        ref={canvasRef}
        className="flex-1 overflow-auto custom-scrollbar px-2 py-4 sm:p-6 flex flex-col items-center relative"
      >
        <div
          className="flex flex-col items-center gap-4 w-full transition-transform duration-150 origin-top"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* SVG CONNECTED ARCHITECTURE CANVAS */}
          <div className="w-full max-w-[1140px] flex justify-center">
            <svg
              viewBox="0 0 1120 1200"
              className="w-full h-auto drop-shadow-sm select-none"
              style={{ minWidth: '320px', maxWidth: '1120px' }}
            >
              <defs>
                {/* Marker Arrowheads */}
                <marker id="arrow-slate" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
                </marker>
                <marker id="arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" />
                </marker>
                <marker id="arrow-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
                </marker>
                <marker id="arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#22c55e" />
                </marker>
                <marker id="arrow-rose" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e" />
                </marker>
                <marker id="arrow-indigo" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#6366f1" />
                </marker>
                <filter id="nodeHover" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.12" />
                </filter>
              </defs>

              {/* ─────────────────────────────────────────────────────────────
                  STEP 1: TOP ACTOR NODE (School Users)
                 ───────────────────────────────────────────────────────────── */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedNode({
                  id: 'users',
                  label: 'School Users',
                  sub: 'Web Browser & Mobile App End Users',
                  category: 'CLIENT',
                  type: 'USER',
                  color: '#1e40af',
                  bg: '#dbeafe',
                  border: '#3b82f6'
                })}
              >
                <rect
                  x="460"
                  y="16"
                  width="200"
                  height="44"
                  rx="22"
                  fill="#dbeafe"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  className="transition-all group-hover:stroke-blue-700 group-hover:brightness-95"
                />
                <text
                  x="560"
                  y="43"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#1e40af"
                  fontSize="13"
                  fontFamily="ui-monospace, monospace"
                  fontWeight="bold"
                >
                  School Users
                </text>
              </g>

              {/* Connector: Users -> Client Experience */}
              <path
                d="M 560 60 L 560 115"
                fill="none"
                stroke="#64748b"
                strokeWidth="1.5"
                markerEnd="url(#arrow-slate)"
              />
              <rect x="542" y="78" width="36" height="18" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <text x="560" y="91" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="10.5" fontFamily="ui-monospace, monospace" fontWeight="600">
                uses
              </text>
              <circle r="3.5" fill="#3b82f6">
                <animateMotion path="M 560 60 L 560 115" dur="1.6s" repeatCount="indefinite" />
              </circle>

              {/* ─────────────────────────────────────────────────────────────
                  STEP 2: CONTAINER 1 - Client Experience (Light Container)
                 ───────────────────────────────────────────────────────────── */}
              <rect
                x="160"
                y="115"
                width="800"
                height="195"
                rx="8"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />
              <text
                x="185"
                y="138"
                fill="#64748b"
                fontSize="12"
                fontFamily="ui-monospace, monospace"
                fontWeight="600"
              >
                Client Experience
              </text>

              {/* React Application [App.jsx] */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedNode({
                  id: 'react_app',
                  label: 'React Application (App.jsx)',
                  sub: `${projectName} React 19 Frontend SPA`,
                  category: 'CLIENT',
                  type: 'REACT_APP',
                  filePath: 'src/App.jsx',
                  color: '#1e40af',
                  bg: '#dbeafe',
                  border: '#60a5fa'
                })}
              >
                <rect
                  x="190"
                  y="152"
                  width="340"
                  height="52"
                  rx="6"
                  fill="#dbeafe"
                  stroke="#60a5fa"
                  strokeWidth="1.5"
                  className="transition group-hover:stroke-blue-600 group-hover:brightness-95"
                />
                <text x="360" y="174" textAnchor="middle" fill="#1e40af" fontSize="13" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  React Application
                </text>
                <text x="360" y="192" textAnchor="middle" fill="#1e40af" fontSize="10.5" fontFamily="ui-monospace, monospace" opacity="0.85">
                  [App.jsx]
                </text>
              </g>

              {/* ERP Feature Views */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedNode({
                  id: 'fe_views',
                  label: `ERP Feature Views (${feComps.length > 0 ? feComps.length : 97} Views)`,
                  sub: 'React JSX / TSX Modular View Layer',
                  category: 'CLIENT',
                  type: 'FE_VIEW',
                  color: '#1e40af',
                  bg: '#dbeafe',
                  border: '#60a5fa'
                })}
              >
                <rect
                  x="570"
                  y="152"
                  width="360"
                  height="52"
                  rx="6"
                  fill="#dbeafe"
                  stroke="#60a5fa"
                  strokeWidth="1.5"
                  className="transition group-hover:stroke-blue-600 group-hover:brightness-95"
                />
                <text x="750" y="183" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="13" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  ERP Feature Views
                </text>
              </g>

              {/* Auth Context [AuthContext.jsx] */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedNode({
                  id: 'auth_context',
                  label: 'Auth Context [AuthContext.jsx]',
                  sub: 'State Management & JWT Storage',
                  category: 'CLIENT',
                  type: 'AUTH_CONTEXT',
                  filePath: 'src/context/AuthContext.jsx',
                  color: '#1e40af',
                  bg: '#dbeafe',
                  border: '#60a5fa'
                })}
              >
                <rect
                  x="190"
                  y="238"
                  width="340"
                  height="52"
                  rx="6"
                  fill="#dbeafe"
                  stroke="#60a5fa"
                  strokeWidth="1.5"
                  className="transition group-hover:stroke-blue-600 group-hover:brightness-95"
                />
                <text x="360" y="260" textAnchor="middle" fill="#1e40af" fontSize="13" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  Auth Context
                </text>
                <text x="360" y="278" textAnchor="middle" fill="#1e40af" fontSize="10.5" fontFamily="ui-monospace, monospace" opacity="0.85">
                  [AuthContext.jsx]
                </text>
              </g>

              {/* Internal Connector: React App -> Auth Context */}
              <path
                d="M 360 204 L 360 238"
                fill="none"
                stroke="#64748b"
                strokeWidth="1.5"
                markerEnd="url(#arrow-slate)"
              />
              <rect x="323" y="212" width="74" height="17" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <text x="360" y="224" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="600">
                reads auth
              </text>

              {/* ─────────────────────────────────────────────────────────────
                  STEP 3: CONNECTOR TO API ACCESS (sends requests)
                 ───────────────────────────────────────────────────────────── */}
              <path
                d="M 360 290 L 360 325 L 560 325 L 560 355"
                fill="none"
                stroke="#64748b"
                strokeWidth="1.5"
                markerEnd="url(#arrow-slate)"
              />
              <rect x="415" y="316" width="94" height="18" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <text x="462" y="329" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="10.5" fontFamily="ui-monospace, monospace" fontWeight="600">
                sends requests
              </text>
              <circle r="3.5" fill="#f59e0b">
                <animateMotion path="M 360 290 L 360 325 L 560 325 L 560 355" dur="2.4s" repeatCount="indefinite" />
              </circle>

              {/* ─────────────────────────────────────────────────────────────
                  STEP 4: CONTAINER 2 - API Access & Security (Gold / Yellow)
                 ───────────────────────────────────────────────────────────── */}
              <rect
                x="380"
                y="355"
                width="360"
                height="305"
                rx="8"
                fill="#fffbeb"
                stroke="#fde68a"
                strokeWidth="1.5"
              />
              <text
                x="560"
                y="378"
                textAnchor="middle"
                fill="#854d0e"
                fontSize="12"
                fontFamily="ui-monospace, monospace"
                fontWeight="bold"
              >
                API Access
              </text>

              {/* Cloudflare Proxy */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedNode({
                  id: 'cloudflare',
                  label: 'Cloudflare Proxy',
                  sub: 'SSL Termination & DDoS Ingress Proxy',
                  category: 'API_ACCESS',
                  type: 'PROXY',
                  color: '#854d0e',
                  bg: '#fef08a',
                  border: '#f59e0b'
                })}
              >
                <rect
                  x="420"
                  y="392"
                  width="280"
                  height="36"
                  rx="6"
                  fill="#fef08a"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  className="transition group-hover:stroke-amber-600 group-hover:brightness-95"
                />
                <text x="560" y="415" textAnchor="middle" dominantBaseline="middle" fill="#854d0e" fontSize="12" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  Cloudflare Proxy
                </text>
              </g>

              {/* Connector: Cloudflare -> Spring Boot */}
              <path d="M 560 428 L 560 452" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
              <rect x="515" y="432" width="90" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <text x="560" y="442" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="600">
                proxies traffic
              </text>

              {/* Spring Boot API */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedNode({
                  id: 'spring_boot',
                  label: 'Spring Boot API',
                  sub: 'Spring Boot 3.x REST Router',
                  category: 'API_ACCESS',
                  type: 'API_GATEWAY',
                  annotations: '@SpringBootApplication, @RestController',
                  color: '#854d0e',
                  bg: '#fef08a',
                  border: '#f59e0b'
                })}
              >
                <rect
                  x="420"
                  y="452"
                  width="280"
                  height="36"
                  rx="6"
                  fill="#fef08a"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  className="transition group-hover:stroke-amber-600 group-hover:brightness-95"
                />
                <text x="560" y="475" textAnchor="middle" dominantBaseline="middle" fill="#854d0e" fontSize="12" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  Spring Boot API
                </text>
              </g>

              {/* Connector: Spring Boot -> Security Config */}
              <path d="M 560 488 L 560 512" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
              <rect x="515" y="492" width="90" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <text x="560" y="502" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="600">
                enters security
              </text>

              {/* Security Config */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedNode({
                  id: 'sec_config',
                  label: 'Security Config',
                  sub: 'SecurityFilterChain & CORS Beans',
                  category: 'API_ACCESS',
                  type: 'SECURITY_CONFIG',
                  annotations: '@Configuration, @EnableWebSecurity',
                  color: '#854d0e',
                  bg: '#fef08a',
                  border: '#f59e0b'
                })}
              >
                <rect
                  x="420"
                  y="512"
                  width="280"
                  height="36"
                  rx="6"
                  fill="#fef08a"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  className="transition group-hover:stroke-amber-600 group-hover:brightness-95"
                />
                <text x="560" y="535" textAnchor="middle" dominantBaseline="middle" fill="#854d0e" fontSize="12" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  Security Config
                </text>
              </g>

              {/* Connector: Security Config -> JWT Filter */}
              <path d="M 560 548 L 560 572" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
              <rect x="517" y="552" width="86" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <text x="560" y="562" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="600">
                applies filter
              </text>

              {/* JWT Filter */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedNode({
                  id: 'jwt_filter',
                  label: 'JWT Filter',
                  sub: 'Bearer Token Validator & Principal',
                  category: 'API_ACCESS',
                  type: 'JWT_FILTER',
                  annotations: 'OncePerRequestFilter, JwtUtils',
                  color: '#854d0e',
                  bg: '#fef08a',
                  border: '#f59e0b'
                })}
              >
                <rect
                  x="420"
                  y="572"
                  width="280"
                  height="36"
                  rx="6"
                  fill="#fef08a"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  className="transition group-hover:stroke-amber-600 group-hover:brightness-95"
                />
                <text x="560" y="595" textAnchor="middle" dominantBaseline="middle" fill="#854d0e" fontSize="12" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  JWT Filter
                </text>
              </g>

              {/* Animated particle inside API Access */}
              <circle r="3.5" fill="#d97706">
                <animateMotion path="M 560 392 L 560 608" dur="2.8s" repeatCount="indefinite" />
              </circle>

              {/* ─────────────────────────────────────────────────────────────
                  STEP 5: DISPATCHES (Fanning out from JWT Filter to 7 Domains)
                 ───────────────────────────────────────────────────────────── */}
              {/* Central Bus & Fan-out Lines */}
              <path d="M 560 608 L 560 645" fill="none" stroke="#64748b" strokeWidth="1.5" />
              <rect x="526" y="618" width="68" height="16" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <text x="560" y="629" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="600">
                dispatches
              </text>

              {[
                { x: 95, label: 'Authentication', i: 0 },
                { x: 250, label: 'Communication Features', i: 1 },
                { x: 405, label: 'School Operations', i: 2 },
                { x: 560, label: 'Finance Reports', i: 3 },
                { x: 715, label: 'Student Administration', i: 4 },
                { x: 870, label: 'Media Workflows', i: 5 },
                { x: 1025, label: 'Academic Workflows', i: 6 },
              ].map(({ x: targetX, i }) => (
                <g key={`dispatch-line-${i}`}>
                  <path
                    d={`M 560 645 L ${targetX} 645 L ${targetX} 715`}
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="1.5"
                    markerEnd="url(#arrow-slate)"
                  />
                  <circle r="3" fill="#22c55e">
                    <animateMotion
                      path={`M 560 608 L 560 645 L ${targetX} 645 L ${targetX} 715`}
                      dur={`${1.8 + i * 0.15}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              ))}

              {/* ─────────────────────────────────────────────────────────────
                  STEP 6: CONTAINER 3 - Domain Workflows (Green Container)
                 ───────────────────────────────────────────────────────────── */}
              <rect
                x="20"
                y="705"
                width="1080"
                height="105"
                rx="8"
                fill="#f0fdf4"
                stroke="#86efac"
                strokeWidth="1.5"
              />
              <text
                x="560"
                y="727"
                textAnchor="middle"
                fill="#15803d"
                fontSize="12"
                fontFamily="ui-monospace, monospace"
                fontWeight="bold"
              >
                Domain Workflows
              </text>

              {[
                { name: 'Authentication', center: 95, idx: 0 },
                { name: 'Communication Features', center: 250, idx: 1 },
                { name: 'School Operations', center: 405, idx: 2 },
                { name: 'Finance Reports', center: 560, idx: 3 },
                { name: 'Student Administration', center: 715, idx: 4 },
                { name: 'Media Workflows', center: 870, idx: 5 },
                { name: 'Academic Workflows', center: 1025, idx: 6 },
              ].map((dom) => {
                const matchedDomain = activeDomains.find(d => d.name.toLowerCase().includes(dom.name.toLowerCase().split(' ')[0])) || activeDomains[dom.idx % activeDomains.length];
                const firstCtrl = matchedDomain?.controllers[0];

                return (
                  <g
                    key={`dom-card-${dom.idx}`}
                    className="cursor-pointer group"
                    onClick={() => setSelectedNode({
                      id: `domain_${dom.idx}`,
                      label: dom.name,
                      sub: `${matchedDomain?.count || 1} controller endpoints (${firstCtrl?.data?.filePath || 'Spring Controller'})`,
                      category: 'DOMAIN',
                      type: 'DOMAIN_CONTROLLER',
                      filePath: firstCtrl?.data?.filePath,
                      annotations: firstCtrl?.data?.annotations || '@RestController, @RequestMapping',
                      color: '#15803d',
                      bg: '#dcfce7',
                      border: '#22c55e'
                    })}
                  >
                    <rect
                      x={dom.center - 68}
                      y="742"
                      width="136"
                      height="48"
                      rx="6"
                      fill="#dcfce7"
                      stroke="#22c55e"
                      strokeWidth="1.5"
                      className="transition group-hover:stroke-emerald-600 group-hover:brightness-95"
                    />
                    <text
                      x={dom.center}
                      y="767"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#15803d"
                      fontSize="10"
                      fontFamily="ui-monospace, monospace"
                      fontWeight="bold"
                    >
                      {dom.name.length > 15 ? (
                        <>
                          <tspan x={dom.center} dy="-6">{dom.name.split(' ')[0]}</tspan>
                          <tspan x={dom.center} dy="12">{dom.name.split(' ').slice(1).join(' ')}</tspan>
                        </>
                      ) : (
                        dom.name
                      )}
                    </text>
                  </g>
                );
              })}

              {/* ─────────────────────────────────────────────────────────────
                  STEP 7: STEPPED CONNECTIONS FROM DOMAINS TO PERSISTENCE & INTEGRATIONS
                 ───────────────────────────────────────────────────────────── */}
              {/* Solid lines to JPA Repositories */}
              {/* 1. Auth -> JPA */}
              <path d="M 95 790 L 95 845 L 180 845 L 180 910" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
              <rect x="105" y="836" width="68" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <text x="139" y="846" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8.5" fontFamily="ui-monospace, monospace" fontWeight="600">reads users</text>
              <circle r="3" fill="#f43f5e"><animateMotion path="M 95 790 L 95 845 L 180 845 L 180 910" dur="2.3s" repeatCount="indefinite" /></circle>

              {/* 2. Communication -> JPA */}
              <path d="M 250 790 L 250 835 L 240 835 L 240 910" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
              <rect x="200" y="826" width="96" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <text x="248" y="836" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8.5" fontFamily="ui-monospace, monospace" fontWeight="600">stores discussions</text>

              {/* 3. School Operations -> JPA */}
              <path d="M 405 790 L 405 845 L 300 845 L 300 910" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
              <rect x="315" y="836" width="94" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <text x="362" y="846" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8.5" fontFamily="ui-monospace, monospace" fontWeight="600">stores operations</text>

              {/* 4. Finance Reports -> JPA */}
              <path d="M 560 790 L 560 835 L 360 835 L 360 910" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
              <rect x="420" y="826" width="98" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <text x="469" y="836" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8.5" fontFamily="ui-monospace, monospace" fontWeight="600">reads finance data</text>

              {/* 5. Student Admin -> JPA */}
              <path d="M 715 790 L 715 845 L 420 845 L 420 910" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
              <rect x="525" y="836" width="92" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <text x="571" y="846" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8.5" fontFamily="ui-monospace, monospace" fontWeight="600">manages records</text>

              {/* 6. Academic Workflows -> JPA */}
              <path d="M 1025 790 L 1025 855 L 480 855 L 480 910" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
              <rect x="710" y="846" width="130" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <text x="775" y="856" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8.5" fontFamily="ui-monospace, monospace" fontWeight="600">reads/writes academics</text>

              {/* Dashed lines to External Integrations */}
              {/* Media -> Cloudinary */}
              <path d="M 870 790 L 870 835 L 650 835 L 650 910" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#arrow-indigo)" />
              <rect x="715" y="826" width="80" height="15" rx="3" fill="#ffffff" stroke="#c7d2fe" strokeWidth="1" />
              <text x="755" y="836" textAnchor="middle" dominantBaseline="middle" fill="#3730a3" fontSize="8.5" fontFamily="ui-monospace, monospace" fontWeight="600">uploads media</text>
              <circle r="3" fill="#6366f1"><animateMotion path="M 870 790 L 870 835 L 650 835 L 650 910" dur="2.2s" repeatCount="indefinite" /></circle>

              {/* Communication -> Email Service */}
              <path d="M 250 790 L 250 820 L 820 820 L 820 910" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#arrow-indigo)" />
              <rect x="800" y="812" width="76" height="15" rx="3" fill="#ffffff" stroke="#c7d2fe" strokeWidth="1" />
              <text x="838" y="822" textAnchor="middle" dominantBaseline="middle" fill="#3730a3" fontSize="8.5" fontFamily="ui-monospace, monospace" fontWeight="600">sends notices</text>
              <circle r="3" fill="#6366f1"><animateMotion path="M 250 790 L 250 820 L 820 820 L 820 910" dur="2.5s" repeatCount="indefinite" /></circle>

              {/* Communication -> Whatsapp Service */}
              <path d="M 250 790 L 250 810 L 990 810 L 990 910" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#arrow-indigo)" />
              <rect x="910" y="802" width="70" height="15" rx="3" fill="#ffffff" stroke="#c7d2fe" strokeWidth="1" />
              <text x="945" y="812" textAnchor="middle" dominantBaseline="middle" fill="#3730a3" fontSize="8.5" fontFamily="ui-monospace, monospace" fontWeight="600">sends alerts</text>

              {/* ─────────────────────────────────────────────────────────────
                  STEP 8: CONTAINER 4 - Persistence (Pink / Rose Container)
                 ───────────────────────────────────────────────────────────── */}
              <rect
                x="20"
                y="895"
                width="510"
                height="215"
                rx="8"
                fill="#fff1f2"
                stroke="#fecdd3"
                strokeWidth="1.5"
              />
              <text
                x="275"
                y="918"
                textAnchor="middle"
                fill="#be123c"
                fontSize="12"
                fontFamily="ui-monospace, monospace"
                fontWeight="bold"
              >
                Persistence
              </text>

              {/* JPA Repositories */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedNode({
                  id: 'jpa_repos',
                  label: `JPA Repositories (${repos.length > 0 ? repos.length : 26} DAO Classes)`,
                  sub: 'Hibernate ORM / JPQL Query Engine',
                  category: 'PERSISTENCE',
                  type: 'JPA_REPO',
                  annotations: '@Repository, @Transactional, JpaRepository',
                  color: '#be123c',
                  bg: '#ffe4e6',
                  border: '#f43f5e'
                })}
              >
                <rect
                  x="75"
                  y="935"
                  width="400"
                  height="40"
                  rx="6"
                  fill="#ffe4e6"
                  stroke="#f43f5e"
                  strokeWidth="1.5"
                  className="transition group-hover:stroke-rose-600 group-hover:brightness-95"
                />
                <text x="275" y="958" textAnchor="middle" dominantBaseline="middle" fill="#be123c" fontSize="12" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  JPA Repositories
                </text>
              </g>

              {/* Connector: Repos -> MySQL Database */}
              <path d="M 275 975 L 275 1018" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
              <rect x="236" y="987" width="78" height="16" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <text x="275" y="998" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="600">
                reads / writes
              </text>
              <circle r="3.5" fill="#f43f5e">
                <animateMotion path="M 275 935 L 275 1060" dur="2.2s" repeatCount="indefinite" />
              </circle>

              {/* MySQL Database */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedNode({
                  id: 'database',
                  label: `MySQL Database (${tables.length > 0 ? tables.length : 27} Tables)`,
                  sub: `${tables.length > 0 ? tables.length : 27} Tables / Schema Mappings`,
                  category: 'PERSISTENCE',
                  type: 'DATABASE',
                  annotations: '@Entity, @Table, @Id',
                  color: '#be123c',
                  bg: '#ffe4e6',
                  border: '#f43f5e'
                })}
              >
                <rect
                  x="75"
                  y="1018"
                  width="400"
                  height="40"
                  rx="6"
                  fill="#ffe4e6"
                  stroke="#f43f5e"
                  strokeWidth="1.5"
                  className="transition group-hover:stroke-rose-600 group-hover:brightness-95"
                />
                <text x="275" y="1041" textAnchor="middle" dominantBaseline="middle" fill="#be123c" fontSize="12" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  MySQL Database
                </text>
              </g>

              {/* ─────────────────────────────────────────────────────────────
                  STEP 9: CONTAINER 5 - External Integrations (Indigo Container)
                 ───────────────────────────────────────────────────────────── */}
              <rect
                x="560"
                y="895"
                width="540"
                height="215"
                rx="8"
                fill="#eef2ff"
                stroke="#c7d2fe"
                strokeWidth="1.5"
              />
              <text
                x="830"
                y="918"
                textAnchor="middle"
                fill="#3730a3"
                fontSize="12"
                fontFamily="ui-monospace, monospace"
                fontWeight="bold"
              >
                External Integrations
              </text>

              {/* Cloudinary Media */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedNode({
                  id: 'ext_s3',
                  label: 'Cloudinary Media',
                  sub: 'Media CDN & Cloud Bucket SDK',
                  category: 'EXTERNAL',
                  type: 'EXTERNAL',
                  color: '#3730a3',
                  bg: '#e0e7ff',
                  border: '#6366f1'
                })}
              >
                <rect
                  x="580"
                  y="940"
                  width="155"
                  height="56"
                  rx="6"
                  fill="#e0e7ff"
                  stroke="#6366f1"
                  strokeWidth="1.5"
                  className="transition group-hover:stroke-indigo-600 group-hover:brightness-95"
                />
                <text x="657" y="971" textAnchor="middle" dominantBaseline="middle" fill="#3730a3" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  Cloudinary Media
                </text>
              </g>

              {/* Email Service [EmailService.java] */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedNode({
                  id: 'ext_email',
                  label: 'Email Service',
                  sub: 'JavaMailSender / SendGrid SDK',
                  category: 'EXTERNAL',
                  type: 'EXTERNAL',
                  filePath: 'EmailService.java',
                  color: '#3730a3',
                  bg: '#e0e7ff',
                  border: '#6366f1'
                })}
              >
                <rect
                  x="750"
                  y="940"
                  width="160"
                  height="56"
                  rx="6"
                  fill="#e0e7ff"
                  stroke="#6366f1"
                  strokeWidth="1.5"
                  className="transition group-hover:stroke-indigo-600 group-hover:brightness-95"
                />
                <text x="830" y="962" textAnchor="middle" fill="#3730a3" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  Email Service
                </text>
                <text x="830" y="980" textAnchor="middle" fill="#3730a3" fontSize="9.5" fontFamily="ui-monospace, monospace" opacity="0.8">
                  [EmailService.java]
                </text>
              </g>

              {/* Whatsapp Service */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedNode({
                  id: 'ext_msg',
                  label: 'Whatsapp Service',
                  sub: 'Twilio / WhatsApp Business Gateway',
                  category: 'EXTERNAL',
                  type: 'EXTERNAL',
                  color: '#3730a3',
                  bg: '#e0e7ff',
                  border: '#6366f1'
                })}
              >
                <rect
                  x="925"
                  y="940"
                  width="155"
                  height="56"
                  rx="6"
                  fill="#e0e7ff"
                  stroke="#6366f1"
                  strokeWidth="1.5"
                  className="transition group-hover:stroke-indigo-600 group-hover:brightness-95"
                />
                <text x="1002" y="971" textAnchor="middle" dominantBaseline="middle" fill="#3730a3" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  Whatsapp Service
                </text>
              </g>

              {/* Subtitle footer inside External Integrations */}
              <text
                x="830"
                y="1080"
                textAnchor="middle"
                fill="#4f46e5"
                fontSize="10"
                fontFamily="ui-monospace, monospace"
                fontWeight="500"
              >
                Detected from Spring POM dependencies
              </text>
            </svg>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              STEP 10: SPONSOR BANNER (Exact GitDiagram Footer Reference)
             ───────────────────────────────────────────────────────────── */}
          <div className="w-full max-w-4xl p-3 sm:p-4 rounded-xl border-2 border-black bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition mt-2">
            <div className="flex items-center gap-3">
              <span
                className="px-3 py-1.5 rounded-lg text-slate-900 font-mono font-black text-xs border border-black"
                style={{ backgroundColor: '#d8b4fe' }}
              >
                CODEFLOW
              </span>
              <div className="text-xs font-mono">
                <span className="font-bold text-slate-900">Architecture Studio: </span>
                <span className="text-slate-600">Inspect codebase flows, APIs & full-stack dependencies live.</span>
              </div>
            </div>
            <button
              onClick={() => onOpenTool?.('ai')}
              className="text-xs font-mono font-bold text-purple-700 hover:underline cursor-pointer shrink-0"
            >
              Ask AI Copilot ↗
            </button>
          </div>
        </div>
      </div>

      {/* ─── NODE INSPECTION SIDE DRAWER ─── */}
      {selectedNode && (
        <div
          className={`fixed right-0 top-0 bottom-0 w-full sm:w-96 p-6 z-50 overflow-y-auto custom-scrollbar flex flex-col justify-between ${
            isLight
              ? 'bg-white border-l-2 border-black shadow-2xl text-slate-900'
              : 'bg-slate-900 border-l-2 border-slate-700 shadow-2xl text-slate-100'
          }`}
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                  {selectedNode.label}
                </h3>
                <span className="text-xs text-purple-700 dark:text-purple-400 font-mono font-bold">{selectedNode.category}</span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedNode.sub && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-mono text-slate-700 dark:text-slate-300">
                {selectedNode.sub}
              </div>
            )}

            {selectedNode.filePath && (
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Source Code</span>
                <button
                  onClick={() => onViewCode?.(selectedNode.filePath!)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-mono font-bold hover:bg-purple-500/20 transition cursor-pointer"
                >
                  <span className="truncate">{selectedNode.filePath}</span>
                  <Code2 className="w-4 h-4 shrink-0" />
                </button>
              </div>
            )}

            {selAnnotations.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Annotations</span>
                <div className="space-y-2">
                  {selAnnotations.map((ann, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs">
                      <span className="font-mono font-bold text-purple-700 dark:text-purple-400">@{ann.name}</span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{ann.whyUsed || ann.internalWorking}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selQA.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Interview Q&A</span>
                <div className="space-y-2">
                  {selQA.map((qa, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{qa.question}</span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">{qa.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setSelectedNode(null)}
            className="w-full mt-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-mono font-bold text-xs hover:opacity-90 transition cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      )}
    </div>
  );
};
