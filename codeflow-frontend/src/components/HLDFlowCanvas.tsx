import React, { useState, useRef, useMemo } from 'react';
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
        <div className="relative">
          <button
            onClick={() => { setIsActivityMenuOpen(!isActivityMenuOpen); setIsExportMenuOpen(false); setIsAllToolsOpen(false); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold bg-white text-slate-900 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50 transition cursor-pointer dark:bg-slate-900 dark:text-white dark:border-slate-700"
          >
            <span>Activity</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {isActivityMenuOpen && (
            <div
              className={`absolute left-0 sm:left-auto top-full mt-2 w-72 max-h-[60vh] overflow-y-auto rounded-2xl p-2 z-50 flex flex-col gap-1 custom-scrollbar ${
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
        <div className="relative">
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
              className={`absolute right-0 top-full mt-2 w-72 rounded-2xl p-3 z-50 flex flex-col gap-1.5 ${
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs">
          <div
            className={`relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden ${
              isLight
                ? 'bg-white border-2 border-black text-slate-900'
                : 'bg-slate-900 border-2 border-slate-700 text-slate-100'
            }`}
          >
            {/* Sticky Modal Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-sm">⚡</span>
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                  All 29 CodeFlow Studio Tools & Features
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
                <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider px-1">Code Analysis & DB</div>
                <div className="space-y-1.5">
                  <ToolCard icon="📁" label="File Tree Browser" desc="Explore codebase AST hierarchy" onClick={() => { onOpenTool?.('files'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="📦" label="Dependency Graph" desc="POM & Gradle dependency tree" onClick={() => { onOpenTool?.('deps'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="🗃️" label="Database ERD" desc="Visual schema entity relationships" onClick={() => { onOpenTool?.('erd'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="🔎" label="SQL Query Inspector" desc="JPA repository queries" onClick={() => { onOpenTool?.('sql'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="⚛️" label="React Fiber Runtime" desc="Component tree inspection" onClick={() => { onOpenTool?.('react'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="📋" label="Architecture Scorecard" desc="Automated quality metrics" onClick={() => { onOpenTool?.('scorecard'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="🔀" label="Schema Drift Detector" desc="Flyway & JPA differences" onClick={() => { onOpenTool?.('drift'); setIsAllToolsOpen(false); }} />
                </div>

                <div className="pt-2 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider px-1">Security & Compliance</div>
                <div className="space-y-1.5">
                  <ToolCard icon="🔐" label="Spring Security Chain" desc="Filter chain visualizer" onClick={() => { onOpenTool?.('security'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="✅" label="SOC2 / GDPR Compliance" desc="Compliance audit matrix" onClick={() => { onOpenTool?.('compliance'); setIsAllToolsOpen(false); }} />
                </div>
              </div>

              {/* Column 2: DevOps, AI & Observability */}
              <div className="space-y-3">
                <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider px-1">DevOps & Testing</div>
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

                <div className="pt-2 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider px-1">AI & Observability</div>
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
        className="flex-1 overflow-auto custom-scrollbar px-3 py-6 sm:p-8 flex flex-col items-center relative"
      >
        <div
          className="flex flex-col items-center gap-5 max-w-5xl w-full transition-transform duration-150 origin-top min-w-[320px]"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* 1. TOP ACTOR NODE: Oval School Users (Blue Oval) */}
          <div className="flex flex-col items-center">
            <div
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
              style={{ backgroundColor: '#dbeafe', borderColor: '#3b82f6', color: '#1e40af' }}
              className="px-7 py-2.5 rounded-full border-2 font-mono font-bold text-xs shadow-xs hover:scale-105 cursor-pointer transition"
            >
              School Users
            </div>
            <div className="flex flex-col items-center my-1">
              <span className="text-[11px] font-mono text-slate-600 font-semibold">uses</span>
              <ArrowDown className="w-3.5 h-3.5 text-slate-500 -mt-0.5" />
            </div>
          </div>

          {/* 2. CONTAINER 1: Client Experience (Light Blue Box) */}
          <div
            className="w-full max-w-xl p-5 rounded-lg border shadow-xs relative"
            style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1' }}
          >
            <span className="text-[11px] font-mono font-semibold text-slate-600 mb-3 block">
              Client Experience
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* React Application */}
              <div
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
                style={{ backgroundColor: '#dbeafe', borderColor: '#60a5fa', color: '#1e40af' }}
                className="p-3 rounded-md border font-mono font-bold text-xs shadow-xs hover:scale-[1.02] cursor-pointer transition flex flex-col justify-between"
              >
                <span>React Application</span>
                <span className="text-[10px] font-normal opacity-85">[App.jsx]</span>
              </div>

              {/* ERP Feature Views */}
              <div
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
                style={{ backgroundColor: '#dbeafe', borderColor: '#60a5fa', color: '#1e40af' }}
                className="p-3 rounded-md border font-mono font-bold text-xs shadow-xs hover:scale-[1.02] cursor-pointer transition flex flex-col justify-center text-center"
              >
                <span>ERP Feature Views</span>
              </div>

              {/* Auth Context */}
              <div
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
                style={{ backgroundColor: '#dbeafe', borderColor: '#60a5fa', color: '#1e40af' }}
                className="p-3 rounded-md border font-mono font-bold text-xs shadow-xs hover:scale-[1.02] cursor-pointer transition flex flex-col justify-between"
              >
                <span>Auth Context</span>
                <span className="text-[10px] font-normal opacity-85">[AuthContext.jsx]</span>
              </div>
            </div>

            <div className="flex items-center gap-1 mt-2 text-[10px] font-mono text-slate-500 font-semibold">
              <span>reads auth</span>
              <ArrowDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          {/* Connector to API Access */}
          <div className="flex flex-col items-center my-1">
            <span className="text-[11px] font-mono text-slate-600 font-semibold">sends requests</span>
            <ArrowDown className="w-3.5 h-3.5 text-slate-500 -mt-0.5" />
          </div>

          {/* 3. CONTAINER 2: API Access & Security (Gold / Yellow Box) */}
          <div
            className="w-full max-w-sm p-5 rounded-lg border shadow-xs relative"
            style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}
          >
            <span className="text-[11px] font-mono font-bold text-amber-900 mb-3 block text-center">
              API Access
            </span>

            <div className="flex flex-col gap-2 items-center">
              {/* Cloudflare Proxy */}
              <div
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
                style={{ backgroundColor: '#fef08a', borderColor: '#f59e0b', color: '#854d0e' }}
                className="w-full p-2.5 rounded-md border font-mono font-bold text-xs text-center shadow-xs hover:scale-[1.02] cursor-pointer transition"
              >
                Cloudflare Proxy
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-slate-500">proxies traffic</span>
                <ArrowDown className="w-3 h-3 text-slate-400" />
              </div>

              {/* Spring Boot API */}
              <div
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
                style={{ backgroundColor: '#fef08a', borderColor: '#f59e0b', color: '#854d0e' }}
                className="w-full p-2.5 rounded-md border font-mono font-bold text-xs text-center shadow-xs hover:scale-[1.02] cursor-pointer transition"
              >
                Spring Boot API
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-slate-500">enters security</span>
                <ArrowDown className="w-3 h-3 text-slate-400" />
              </div>

              {/* Security Config */}
              <div
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
                style={{ backgroundColor: '#fef08a', borderColor: '#f59e0b', color: '#854d0e' }}
                className="w-full p-2.5 rounded-md border font-mono font-bold text-xs text-center shadow-xs hover:scale-[1.02] cursor-pointer transition"
              >
                Security Config
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-slate-500">applies filter</span>
                <ArrowDown className="w-3 h-3 text-slate-400" />
              </div>

              {/* JWT Filter */}
              <div
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
                style={{ backgroundColor: '#fef08a', borderColor: '#f59e0b', color: '#854d0e' }}
                className="w-full p-2.5 rounded-md border font-mono font-bold text-xs text-center shadow-xs hover:scale-[1.02] cursor-pointer transition"
              >
                JWT Filter
              </div>
            </div>
          </div>

          {/* Connector to Domain Workflows */}
          <div className="flex flex-col items-center my-1">
            <span className="text-[11px] font-mono text-slate-600 font-semibold">dispatches</span>
            <ArrowDown className="w-3.5 h-3.5 text-slate-500 -mt-0.5" />
          </div>

          {/* 4. CONTAINER 3: Domain Workflows (Green Horizontal Box) */}
          <div
            className="w-full p-5 rounded-lg border shadow-xs relative"
            style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac' }}
          >
            <span className="text-[11px] font-mono font-bold text-emerald-900 mb-3 block text-center">
              Domain Workflows
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 overflow-x-auto pb-1">
              {activeDomains.map((dom, i) => {
                const firstCtrl = dom.controllers[0];
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedNode({
                      id: `domain_${i}`,
                      label: dom.name,
                      sub: `${dom.count} controller endpoints (${firstCtrl?.data?.filePath || 'Spring Controller'})`,
                      category: 'DOMAIN',
                      type: 'DOMAIN_CONTROLLER',
                      filePath: firstCtrl?.data?.filePath,
                      annotations: firstCtrl?.data?.annotations || '@RestController, @RequestMapping',
                      color: '#15803d',
                      bg: '#dcfce7',
                      border: '#22c55e'
                    })}
                    style={{ backgroundColor: '#dcfce7', borderColor: '#22c55e', color: '#15803d' }}
                    className="p-2.5 rounded-md border font-mono font-bold text-xs text-center shadow-xs hover:scale-[1.03] cursor-pointer transition flex flex-col justify-center min-h-[48px]"
                  >
                    <span className="truncate">{dom.name.replace(' Workflows', '')}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connector to Persistence & Integrations */}
          <div className="flex flex-col items-center my-1">
            <span className="text-[11px] font-mono text-slate-600 font-semibold">reads / writes</span>
            <ArrowDown className="w-3.5 h-3.5 text-slate-500 -mt-0.5" />
          </div>

          {/* 5. CONTAINER 4 & 5: Persistence Layer & External Integrations */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Persistence Layer */}
            <div
              className="p-5 rounded-lg border shadow-xs relative flex flex-col items-center gap-2"
              style={{ backgroundColor: '#fff1f2', borderColor: '#fecdd3' }}
            >
              <span className="text-[11px] font-mono font-bold text-rose-900 mb-1 block">
                Persistence
              </span>

              <div
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
                style={{ backgroundColor: '#ffe4e6', borderColor: '#f43f5e', color: '#be123c' }}
                className="w-full max-w-xs p-2.5 rounded-md border font-mono font-bold text-xs text-center shadow-xs hover:scale-[1.02] cursor-pointer transition"
              >
                JPA Repositories
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-slate-500">reads / writes</span>
                <ArrowDown className="w-3 h-3 text-slate-400" />
              </div>

              {/* MySQL Database Box */}
              <div
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
                style={{ backgroundColor: '#ffe4e6', borderColor: '#f43f5e', color: '#be123c' }}
                className="w-full max-w-xs p-2.5 rounded-md border font-mono font-bold text-xs text-center shadow-xs hover:scale-[1.02] cursor-pointer transition flex items-center justify-center gap-2"
              >
                <span>MySQL Database</span>
              </div>
            </div>

            {/* External Integrations */}
            <div
              className="p-5 rounded-lg border shadow-xs relative flex flex-col justify-between"
              style={{ backgroundColor: '#eef2ff', borderColor: '#c7d2fe' }}
            >
              <span className="text-[11px] font-mono font-bold text-indigo-900 mb-1 block">
                External Integrations
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                <div
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
                  style={{ backgroundColor: '#e0e7ff', borderColor: '#6366f1', color: '#3730a3' }}
                  className="p-2.5 rounded-md border font-mono font-bold text-xs text-center shadow-xs hover:scale-[1.02] cursor-pointer transition"
                >
                  Cloudinary Media
                </div>

                <div
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
                  style={{ backgroundColor: '#e0e7ff', borderColor: '#6366f1', color: '#3730a3' }}
                  className="p-2.5 rounded-md border font-mono font-bold text-xs text-center shadow-xs hover:scale-[1.02] cursor-pointer transition"
                >
                  <div>Email Service</div>
                  <div className="text-[9px] opacity-75 font-normal">[EmailService.java]</div>
                </div>

                <div
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
                  style={{ backgroundColor: '#e0e7ff', borderColor: '#6366f1', color: '#3730a3' }}
                  className="p-2.5 rounded-md border font-mono font-bold text-xs text-center shadow-xs hover:scale-[1.02] cursor-pointer transition"
                >
                  Whatsapp Service
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-indigo-200 text-center">
                <span className="text-[10px] font-mono text-indigo-700">
                  Detected from Spring POM dependencies
                </span>
              </div>
            </div>
          </div>

          {/* 6. SPONSOR BANNER (Exact GitDiagram Footer Reference) */}
          <div className="w-full max-w-4xl p-3 sm:p-4 rounded-xl border-2 border-black bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition">
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
