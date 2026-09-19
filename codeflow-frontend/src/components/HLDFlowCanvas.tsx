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

  // Derived dynamic labels for the active project
  const isThinkSwipe = useMemo(() => {
    const p = (projectName || '').toLowerCase();
    return p.includes('thinkswipe') || p.includes('think-swipe') || p.includes('think_swipe') ||
      nodes.some(n => (n.data?.label || '').toLowerCase().includes('thinkswipe') || (n.data?.filePath || '').toLowerCase().includes('thinkswipe') || (n.data?.filePath || '').toLowerCase().includes('main.jsx') || (n.data?.label || '').toLowerCase().includes('answerservice'));
  }, [projectName, nodes]);

  const formattedProjectName = useMemo(() => {
    if (!projectName || projectName === 'Repository') return 'Spring Boot & React';
    if (projectName.toLowerCase() === 'vps') return 'School ERP';
    return projectName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }, [projectName]);

  const actorLabel = useMemo(() => {
    if (projectName?.toLowerCase().includes('school') || projectName?.toLowerCase() === 'vps') return 'School Users';
    if (projectName?.toLowerCase().includes('petclinic')) return 'Pet Owners & Staff';
    return `${formattedProjectName} Users`;
  }, [projectName, formattedProjectName]);

  const clientViewsLabel = useMemo(() => {
    if (feComps.length > 0) return `${formattedProjectName} Views (${feComps.length})`;
    if (projectName?.toLowerCase().includes('school') || projectName?.toLowerCase() === 'vps') return 'ERP Feature Views';
    return `${formattedProjectName} Views`;
  }, [feComps, projectName, formattedProjectName]);

  // Display top 7 active domains in the SVG
  const top7Domains = useMemo(() => {
    const list = [...activeDomains];
    const defaultDomains = [
      { name: 'Authentication', controllers: [], count: 1 },
      { name: 'Core Workflows', controllers: [], count: 1 },
      { name: 'Data Management', controllers: [], count: 1 },
      { name: 'Reporting & Analytics', controllers: [], count: 1 },
      { name: 'Administration', controllers: [], count: 1 },
      { name: 'Media & Files', controllers: [], count: 1 },
      { name: 'Business Logic', controllers: [], count: 1 },
    ];
    let defIdx = 0;
    while (list.length < 7) {
      list.push(defaultDomains[defIdx % defaultDomains.length]);
      defIdx++;
    }
    return list.slice(0, 7);
  }, [activeDomains]);

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
            {isThinkSwipe ? (
              /* ═══════════════════════════════════════════════════════════════════
                 THINKSWIPE ARCHITECTURE CANVAS (EXACT MATCH TO GITDIAGRAM SCREENSHOTS)
                 ═══════════════════════════════════════════════════════════════════ */
              <svg
                viewBox="0 0 1120 1380"
                className="w-full h-auto drop-shadow-sm select-none"
                style={{ minWidth: '320px', maxWidth: '1120px' }}
              >
                <defs>
                  <marker id="ts-arrow-slate" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
                  </marker>
                  <marker id="ts-arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" />
                  </marker>
                  <marker id="ts-arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#22c55e" />
                  </marker>
                  <marker id="ts-arrow-indigo" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#6366f1" />
                  </marker>
                  <marker id="ts-arrow-rose" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e" />
                  </marker>
                </defs>

                {/* ─── 1. CIRCULAR ACTOR NODES ─── */}
                {/* Visitor Circle */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setSelectedNode({
                    id: 'ts_visitor',
                    label: 'Visitor',
                    sub: 'Anonymous Web Browser Clients',
                    category: 'CLIENT',
                    type: 'USER',
                    color: '#1e40af',
                    bg: '#dbeafe',
                    border: '#60a5fa'
                  })}
                >
                  <circle cx="650" cy="40" r="22" fill="#dbeafe" stroke="#60a5fa" strokeWidth="1.5" className="transition group-hover:stroke-blue-600" />
                  <text x="650" y="44" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="600">
                    Visitor
                  </text>
                </g>

                {/* Admin User Circle */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setSelectedNode({
                    id: 'ts_admin_user',
                    label: 'Admin User',
                    sub: 'ThinkSwipe Dashboard & Content Administrators',
                    category: 'CLIENT',
                    type: 'USER',
                    color: '#1e40af',
                    bg: '#dbeafe',
                    border: '#60a5fa'
                  })}
                >
                  <circle cx="730" cy="40" r="27" fill="#dbeafe" stroke="#60a5fa" strokeWidth="1.5" className="transition group-hover:stroke-blue-600" />
                  <text x="730" y="44" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="10.5" fontFamily="ui-monospace, monospace" fontWeight="600">
                    Admin User
                  </text>
                </g>

                {/* Visitor Line -> React Bootstrap */}
                <path d="M 650 62 L 650 120 L 730 120 L 730 148" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="625" y="80" width="55" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="652" y="90" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="600">opens app</text>
                <circle r="3" fill="#3b82f6"><animateMotion path="M 650 62 L 650 120 L 730 120 L 730 148" dur="1.8s" repeatCount="indefinite" /></circle>

                {/* Admin User Line -> React Bootstrap */}
                <path d="M 730 67 L 730 148" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="702" y="80" width="62" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="733" y="90" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="600">opens admin</text>
                <circle r="3" fill="#3b82f6"><animateMotion path="M 730 67 L 730 148" dur="1.6s" repeatCount="indefinite" /></circle>

                {/* ─── 2. CONTAINER 1: CLIENT EXPERIENCE ─── */}
                <rect x="360" y="115" width="540" height="420" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="630" y="136" textAnchor="middle" fill="#64748b" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="600">
                  Client Experience
                </text>

                {/* React Bootstrap [main.jsx] */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setSelectedNode({
                    id: 'ts_main_jsx',
                    label: 'React Bootstrap [main.jsx]',
                    sub: 'Vite React Entry Point & Root Mount',
                    category: 'CLIENT',
                    type: 'REACT_APP',
                    filePath: 'src/main.jsx',
                    color: '#1e40af',
                    bg: '#dbeafe',
                    border: '#60a5fa'
                  })}
                >
                  <rect x="660" y="148" width="130" height="46" rx="4" fill="#dbeafe" stroke="#60a5fa" strokeWidth="1.5" className="transition group-hover:stroke-blue-600" />
                  <text x="725" y="165" textAnchor="middle" fill="#1e40af" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">React Bootstrap</text>
                  <text x="725" y="180" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" opacity="0.8">[main.jsx]</text>
                </g>

                {/* Main -> Swipe Experience (mounts) */}
                <path d="M 660 171 L 530 171 L 530 225" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="580" y="163" width="46" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="603" y="173" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8.5" fontFamily="ui-monospace, monospace" fontWeight="600">mounts</text>

                {/* Main -> PWA Service Worker (registers) */}
                <path d="M 760 194 L 760 225" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="735" y="202" width="50" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="760" y="212" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8.5" fontFamily="ui-monospace, monospace" fontWeight="600">registers</text>

                {/* Swipe Experience [App.jsx] */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setSelectedNode({
                    id: 'ts_app_jsx',
                    label: 'Swipe Experience [App.jsx]',
                    sub: 'Tinder-like Card Swiping & Question State',
                    category: 'CLIENT',
                    type: 'REACT_APP',
                    filePath: 'src/App.jsx',
                    color: '#1e40af',
                    bg: '#dbeafe',
                    border: '#60a5fa'
                  })}
                >
                  <rect x="465" y="225" width="130" height="46" rx="4" fill="#dbeafe" stroke="#60a5fa" strokeWidth="1.5" className="transition group-hover:stroke-blue-600" />
                  <text x="530" y="242" textAnchor="middle" fill="#1e40af" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Swipe Experience</text>
                  <text x="530" y="257" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" opacity="0.8">[App.jsx]</text>
                </g>

                {/* PWA Service Worker [sw.js] */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setSelectedNode({
                    id: 'ts_sw_js',
                    label: 'PWA Service Worker [sw.js]',
                    sub: 'Offline Caching & Background Push Notifications',
                    category: 'CLIENT',
                    type: 'FE_VIEW',
                    filePath: 'public/sw.js',
                    color: '#1e40af',
                    bg: '#dbeafe',
                    border: '#60a5fa'
                  })}
                >
                  <rect x="690" y="225" width="140" height="46" rx="4" fill="#dbeafe" stroke="#60a5fa" strokeWidth="1.5" className="transition group-hover:stroke-blue-600" />
                  <text x="760" y="242" textAnchor="middle" fill="#1e40af" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">PWA Service Worker</text>
                  <text x="760" y="257" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" opacity="0.8">[sw.js]</text>
                </g>

                {/* Renders Bus from Swipe Experience to 4 Sub-Components */}
                <path d="M 530 271 L 530 300" fill="none" stroke="#64748b" strokeWidth="1.5" />
                <path d="M 430 300 L 835 300" fill="none" stroke="#64748b" strokeWidth="1.5" />

                {[
                  { x: 430, label: 'Question Search', file: '[SearchBar.jsx]', id: 'ts_search' },
                  { x: 565, label: 'Leaderboard UI', file: '[Leaderboard.jsx]', id: 'ts_lead' },
                  { x: 700, label: 'Admin Panel', file: '[AdminPanel.jsx]', id: 'ts_admin_panel' },
                  { x: 835, label: 'User Submissions', file: '[UserSubmit.jsx]', id: 'ts_submit' },
                ].map((item, idx) => (
                  <g key={`fe-comp-${idx}`}>
                    <path d={`M ${item.x} 300 L ${item.x} 325`} fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                    <rect x={item.x - 20} y="293" width="40" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                    <text x={item.x} y="301" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">renders</text>

                    {/* Component Card */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => setSelectedNode({
                        id: item.id,
                        label: `${item.label} ${item.file}`,
                        sub: `ThinkSwipe React View (${item.file})`,
                        category: 'CLIENT',
                        type: 'FE_VIEW',
                        filePath: `src/components/${item.file.replace(/[\[\]]/g, '')}`,
                        color: '#1e40af',
                        bg: '#dbeafe',
                        border: '#60a5fa'
                      })}
                    >
                      <rect x={item.x - 58} y="325" width="116" height="46" rx="4" fill="#dbeafe" stroke="#60a5fa" strokeWidth="1.5" className="transition group-hover:stroke-blue-600" />
                      <text x={item.x} y="342" textAnchor="middle" fill="#1e40af" fontSize="10.5" fontFamily="ui-monospace, monospace" fontWeight="bold">{item.label}</text>
                      <text x={item.x} y="357" textAnchor="middle" fill="#1e40af" fontSize="9" fontFamily="ui-monospace, monospace" opacity="0.8">{item.file}</text>
                    </g>
                  </g>
                ))}

                {/* Lines from 4 Sub-Components -> API Client */}
                <path d="M 430 371 L 430 460 L 760 460 L 760 480" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="408" y="405" width="45" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="430" y="413" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">searches</text>

                <path d="M 565 371 L 565 448 L 780 448 L 780 480" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="532" y="405" width="66" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="565" y="413" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">loads rankings</text>

                <path d="M 700 371 L 700 436 L 800 436 L 800 480" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="672" y="405" width="56" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="700" y="413" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">admin calls</text>

                <path d="M 835 371 L 835 480" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="815" y="405" width="40" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="835" y="413" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">submits</text>

                <path d="M 465 248 L 380 248 L 380 475 L 750 475 L 750 480" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="366" y="360" width="28" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="380" y="368" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">calls</text>

                {/* API Client [api.js] */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setSelectedNode({
                    id: 'ts_api_js',
                    label: 'API Client [api.js]',
                    sub: 'Axios / Fetch REST HTTP Client Helper',
                    category: 'CLIENT',
                    type: 'PROXY',
                    filePath: 'src/services/api.js',
                    color: '#1e40af',
                    bg: '#dbeafe',
                    border: '#60a5fa'
                  })}
                >
                  <rect x="740" y="480" width="95" height="42" rx="4" fill="#dbeafe" stroke="#60a5fa" strokeWidth="1.5" className="transition group-hover:stroke-blue-600" />
                  <text x="787" y="497" textAnchor="middle" fill="#1e40af" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">API Client</text>
                  <text x="787" y="511" textAnchor="middle" fill="#1e40af" fontSize="9" fontFamily="ui-monospace, monospace" opacity="0.8">[api.js]</text>
                </g>

                {/* ─── 3. CONNECTOR TO EDGE DELIVERY ─── */}
                <path d="M 787 522 L 787 560" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="763" y="534" width="48" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="787" y="543" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="600">requests</text>
                <circle r="3.5" fill="#f59e0b"><animateMotion path="M 787 522 L 787 560" dur="1.8s" repeatCount="indefinite" /></circle>

                {/* ─── 4. CONTAINER 2: EDGE DELIVERY ─── */}
                <rect x="725" y="560" width="125" height="135" rx="8" fill="#fffbeb" stroke="#fde68a" strokeWidth="1.5" />
                <text x="787" y="578" textAnchor="middle" fill="#854d0e" fontSize="10.5" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  Edge Delivery
                </text>

                {/* Edge Proxy [worker.js] */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setSelectedNode({
                    id: 'ts_worker_js',
                    label: 'Edge Proxy [worker.js]',
                    sub: 'Cloudflare Worker Reverse Proxy & Rate Limiter',
                    category: 'API_ACCESS',
                    type: 'PROXY',
                    filePath: 'worker.js',
                    color: '#854d0e',
                    bg: '#fef08a',
                    border: '#f59e0b'
                  })}
                >
                  <rect x="740" y="590" width="95" height="38" rx="4" fill="#fef08a" stroke="#f59e0b" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="787" y="606" textAnchor="middle" fill="#854d0e" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">Edge Proxy</text>
                  <text x="787" y="618" textAnchor="middle" fill="#854d0e" fontSize="8.5" fontFamily="ui-monospace, monospace" opacity="0.8">[worker.js]</text>
                </g>

                <path d="M 787 628 L 787 648" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="768" y="632" width="38" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="787" y="640" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">proxies</text>

                {/* Spring API */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setSelectedNode({
                    id: 'ts_spring_api',
                    label: 'Spring API',
                    sub: 'Spring Boot 3.x REST Controller Gateway',
                    category: 'API_ACCESS',
                    type: 'API_GATEWAY',
                    annotations: '@SpringBootApplication, @RestController',
                    color: '#854d0e',
                    bg: '#fef08a',
                    border: '#f59e0b'
                  })}
                >
                  <rect x="740" y="648" width="95" height="34" rx="4" fill="#fef08a" stroke="#f59e0b" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="787" y="669" textAnchor="middle" dominantBaseline="middle" fill="#854d0e" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Spring API</text>
                </g>

                {/* ─── 5. FANNING OUT DISPATCHES TO PRACTICE DOMAIN & ADMIN OPERATIONS ─── */}
                <path d="M 760 682 L 760 710" fill="none" stroke="#64748b" strokeWidth="1.5" />
                <path d="M 810 682 L 810 710" fill="none" stroke="#64748b" strokeWidth="1.5" />

                <path d="M 760 710 L 220 710 L 220 765" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="330" y="703" width="55" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="357" y="711" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8.5" fontFamily="ui-monospace, monospace" fontWeight="600">dispatches</text>
                <circle r="3" fill="#22c55e"><animateMotion path="M 760 682 L 760 710 L 220 710 L 220 765" dur="2.2s" repeatCount="indefinite" /></circle>

                <path d="M 760 710 L 355 710 L 355 765" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="400" y="703" width="55" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="427" y="711" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8.5" fontFamily="ui-monospace, monospace" fontWeight="600">dispatches</text>
                <circle r="3" fill="#22c55e"><animateMotion path="M 760 682 L 760 710 L 355 710 L 355 765" dur="2.4s" repeatCount="indefinite" /></circle>

                <path d="M 760 710 L 490 710 L 490 765" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="465" y="703" width="55" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="492" y="711" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8.5" fontFamily="ui-monospace, monospace" fontWeight="600">dispatches</text>

                <path d="M 760 710 L 625 710 L 625 765" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />

                <path d="M 810 710 L 760 710 L 760 815" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="735" y="703" width="55" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="762" y="711" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8.5" fontFamily="ui-monospace, monospace" fontWeight="600">dispatches</text>
                <circle r="3" fill="#f43f5e"><animateMotion path="M 810 682 L 810 710 L 760 710 L 760 815" dur="2.0s" repeatCount="indefinite" /></circle>

                <path d="M 810 710 L 870 710 L 870 815" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="845" y="703" width="55" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="872" y="711" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8.5" fontFamily="ui-monospace, monospace" fontWeight="600">dispatches</text>
                <circle r="3" fill="#f43f5e"><animateMotion path="M 810 682 L 810 710 L 870 710 L 870 815" dur="2.1s" repeatCount="indefinite" /></circle>

                {/* ─── 6. CONTAINER 3: PRACTICE DOMAIN ─── */}
                <rect x="140" y="735" width="560" height="185" rx="8" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.5" />
                <text x="420" y="753" textAnchor="middle" fill="#15803d" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  Practice Domain
                </text>

                {/* Question Controller */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_q_ctrl', label: 'Question Controller', sub: 'REST endpoints for question retrieval and filtering', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'QuestionController.java', annotations: '@RestController, @RequestMapping("/api/questions")', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="160" y="765" width="120" height="36" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="220" y="787" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">Question Controller</text>
                </g>

                {/* Answer Controller */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_ans_ctrl', label: 'Answer Controller', sub: 'Submits user answers and executes automated test verification', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'AnswerController.java', annotations: '@RestController, @RequestMapping("/api/answers")', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="295" y="765" width="120" height="36" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="355" y="787" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">Answer Controller</text>
                </g>

                {/* Submission Controller */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_sub_ctrl', label: 'Submission Controller', sub: 'Stores practice run session state and submissions', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'SubmissionController.java', annotations: '@RestController, @RequestMapping("/api/submissions")', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="430" y="765" width="120" height="36" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="490" y="787" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Submission Controller</text>
                </g>

                {/* Leaderboard Controller */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_lead_ctrl', label: 'Leaderboard Controller', sub: 'Calculates user streak rankings and global scoreboard', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'LeaderboardController.java', annotations: '@RestController, @RequestMapping("/api/leaderboard")', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="565" y="765" width="125" height="36" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="627" y="787" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Leaderboard Controller</text>
                </g>

                <path d="M 220 801 L 220 845" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="175" y="818" width="90" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="220" y="826" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">requests questions</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_q_srv', label: 'Question Service', sub: 'Business logic for question generation & code execution routing', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'QuestionService.java', annotations: '@Service, @Transactional', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="165" y="845" width="110" height="36" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="220" y="867" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">Question Service</text>
                </g>

                <path d="M 355 801 L 355 845" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="315" y="818" width="80" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="355" y="826" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">evaluates answer</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_ans_srv', label: 'Answer Service [AnswerService.java]', sub: 'Core evaluation engine validating user submissions', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'AnswerService.java', annotations: '@Service, @Transactional', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="290" y="845" width="130" height="42" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="355" y="862" textAnchor="middle" fill="#15803d" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">Answer Service</text>
                  <text x="355" y="876" textAnchor="middle" fill="#15803d" fontSize="8.5" fontFamily="ui-monospace, monospace" opacity="0.8">[AnswerService.java]</text>
                </g>

                {/* ─── 7. CONTAINER 4: ADMIN OPERATIONS ─── */}
                <rect x="715" y="785" width="245" height="85" rx="8" fill="#fff1f2" stroke="#fecdd3" strokeWidth="1.5" />
                <text x="837" y="803" textAnchor="middle" fill="#be123c" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  Admin Operations
                </text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_admin_ctrl', label: 'Admin Controller', sub: 'Administrative management endpoints & user subscriptions', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'AdminController.java', annotations: '@RestController, @PreAuthorize("hasRole(\'ADMIN\')")', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="730" y="815" width="105" height="36" rx="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="782" y="837" textAnchor="middle" dominantBaseline="middle" fill="#be123c" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Admin Controller</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_push_ctrl', label: 'Push Controller', sub: 'Web push notification dispatcher & subscription store', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'PushController.java', annotations: '@RestController, @RequestMapping("/api/push")', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="845" y="815" width="105" height="36" rx="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="897" y="837" textAnchor="middle" dominantBaseline="middle" fill="#be123c" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Push Controller</text>
                </g>

                {/* ─── 8. EXTERNAL INTEGRATIONS & STEPPED LINES TO PERSISTENCE ─── */}
                <path d="M 195 881 L 195 965" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#ts-arrow-green)" />
                <rect x="165" y="915" width="60" height="14" rx="2" fill="#ffffff" stroke="#bbf7d0" strokeWidth="1" />
                <text x="195" y="923" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">executes code</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_jdoodle', label: 'JDoodle API', sub: 'External Compiler & Code Execution Engine API', category: 'EXTERNAL', type: 'EXTERNAL', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="155" y="965" width="90" height="36" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="200" y="987" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">JDoodle API</text>
                </g>

                <path d="M 245 881 L 245 930 L 550 930 L 550 970" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="220" y="915" width="52" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="246" y="923" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">reads writes</text>

                <path d="M 355 887 L 355 938 L 565 938 L 565 970" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="325" y="915" width="60" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="355" y="923" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">saves attempts</text>

                <path d="M 490 801 L 490 945 L 580 945 L 580 970" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="445" y="915" width="80" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="485" y="923" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">stores submissions</text>

                <path d="M 625 801 L 625 952 L 595 952 L 595 970" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="595" y="915" width="62" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="626" y="923" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">reads rankings</text>

                <path d="M 760 851 L 760 945 L 610 945 L 610 970" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="720" y="915" width="58" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="749" y="923" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">manages data</text>

                <path d="M 790 851 L 790 938 L 625 938 L 625 970" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="762" y="915" width="76" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="800" y="923" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">stores subscriptions</text>

                <path d="M 897 851 L 897 965" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#ts-arrow-indigo)" />
                <rect x="855" y="915" width="85" height="14" rx="2" fill="#ffffff" stroke="#c7d2fe" strokeWidth="1" />
                <text x="897" y="923" textAnchor="middle" dominantBaseline="middle" fill="#3730a3" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">sends notifications</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_web_push', label: 'Web Push Service', sub: 'VAPID Web Push Protocol & Browser Notification Delivery', category: 'EXTERNAL', type: 'EXTERNAL', color: '#3730a3', bg: '#e0e7ff', border: '#6366f1' })}>
                  <rect x="840" y="965" width="115" height="36" rx="4" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" className="transition group-hover:stroke-indigo-600" />
                  <text x="897" y="987" textAnchor="middle" dominantBaseline="middle" fill="#3730a3" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">Web Push Service</text>
                </g>

                {/* ─── 9. CONTAINER 5: PERSISTENCE (TiDB Cluster) ─── */}
                <rect x="520" y="955" width="140" height="235" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="590" y="972" textAnchor="middle" fill="#64748b" fontSize="10.5" fontFamily="ui-monospace, monospace" fontWeight="600">
                  Persistence
                </text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_jpa', label: 'JPA Repositories', sub: 'Spring Data JPA Repository Interfaces & Entities', category: 'PERSISTENCE', type: 'JPA_REPO', color: '#1e40af', bg: '#dbeafe', border: '#60a5fa' })}>
                  <rect x="535" y="980" width="110" height="32" rx="4" fill="#dbeafe" stroke="#60a5fa" strokeWidth="1.5" className="transition group-hover:stroke-blue-600" />
                  <text x="590" y="1000" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">JPA Repositories</text>
                </g>

                <path d="M 590 1012 L 590 1045" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="570" y="1022" width="40" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="590" y="1030" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">persists</text>
                <circle r="3" fill="#3b82f6"><animateMotion path="M 590 1012 L 590 1045" dur="1.8s" repeatCount="indefinite" /></circle>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_tidb_pri', label: 'Primary TiDB', sub: 'Distributed SQL MySQL-Compatible Primary Cluster', category: 'PERSISTENCE', type: 'DATABASE', color: '#1e40af', bg: '#dbeafe', border: '#60a5fa' })}>
                  <rect x="545" y="1045" width="90" height="38" rx="10" fill="#dbeafe" stroke="#60a5fa" strokeWidth="1.5" className="transition group-hover:stroke-blue-600" />
                  <text x="590" y="1068" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">Primary TiDB</text>
                </g>

                <path d="M 590 1083 L 590 1120" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#ts-arrow-slate)" />
                <rect x="566" y="1095" width="48" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="590" y="1103" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">daily sync</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_tidb_sec', label: 'Secondary TiDB', sub: 'Async Disaster Recovery & Read Replica Cluster', category: 'PERSISTENCE', type: 'DATABASE', color: '#1e40af', bg: '#dbeafe', border: '#60a5fa' })}>
                  <rect x="545" y="1120" width="90" height="38" rx="10" fill="#dbeafe" stroke="#60a5fa" strokeWidth="1.5" className="transition group-hover:stroke-blue-600" />
                  <text x="590" y="1143" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Secondary TiDB</text>
                </g>
              </svg>
            ) : (
              /* ═══════════════════════════════════════════════════════════════════
                 STANDARD / VPS ARCHITECTURE CANVAS
                 ═══════════════════════════════════════════════════════════════════ */
              <svg
                viewBox="0 0 1120 1200"
                className="w-full h-auto drop-shadow-sm select-none"
                style={{ minWidth: '320px', maxWidth: '1120px' }}
              >
                <defs>
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

                {/* ─── 1. TOP ACTOR NODE ─── */}
                <g
                  className="cursor-pointer group"
                  onClick={() => setSelectedNode({
                    id: 'users',
                    label: actorLabel,
                    sub: `${formattedProjectName} Web Browser & Mobile App End Users`,
                    category: 'CLIENT',
                    type: 'USER',
                    color: '#1e40af',
                    bg: '#dbeafe',
                    border: '#3b82f6'
                  })}
                >
                  <rect
                    x="440"
                    y="16"
                    width="240"
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
                    fontSize="12.5"
                    fontFamily="ui-monospace, monospace"
                    fontWeight="bold"
                  >
                    {actorLabel}
                  </text>
                </g>

                <path d="M 560 60 L 560 115" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
                <rect x="542" y="78" width="36" height="18" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="560" y="91" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="10.5" fontFamily="ui-monospace, monospace" fontWeight="600">
                  uses
                </text>
                <circle r="3.5" fill="#3b82f6">
                  <animateMotion path="M 560 60 L 560 115" dur="1.6s" repeatCount="indefinite" />
                </circle>

                {/* ─── 2. CONTAINER 1 - Client Experience ─── */}
                <rect x="160" y="115" width="800" height="195" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="185" y="138" fill="#64748b" fontSize="12" fontFamily="ui-monospace, monospace" fontWeight="600">
                  Client Experience
                </text>

                <g
                  className="cursor-pointer group"
                  onClick={() => setSelectedNode({
                    id: 'react_app',
                    label: `${formattedProjectName} App (App.jsx)`,
                    sub: `${projectName} React 19 Frontend SPA`,
                    category: 'CLIENT',
                    type: 'REACT_APP',
                    filePath: 'src/App.jsx',
                    color: '#1e40af',
                    bg: '#dbeafe',
                    border: '#60a5fa'
                  })}
                >
                  <rect x="190" y="152" width="340" height="52" rx="6" fill="#dbeafe" stroke="#60a5fa" strokeWidth="1.5" className="transition group-hover:stroke-blue-600 group-hover:brightness-95" />
                  <text x="360" y="174" textAnchor="middle" fill="#1e40af" fontSize="12.5" fontFamily="ui-monospace, monospace" fontWeight="bold">
                    {formattedProjectName} Application
                  </text>
                  <text x="360" y="192" textAnchor="middle" fill="#1e40af" fontSize="10.5" fontFamily="ui-monospace, monospace" opacity="0.85">
                    [App.jsx]
                  </text>
                </g>

                <g
                  className="cursor-pointer group"
                  onClick={() => setSelectedNode({
                    id: 'fe_views',
                    label: clientViewsLabel,
                    sub: `${formattedProjectName} Modular View Layer`,
                    category: 'CLIENT',
                    type: 'FE_VIEW',
                    color: '#1e40af',
                    bg: '#dbeafe',
                    border: '#60a5fa'
                  })}
                >
                  <rect x="570" y="152" width="360" height="52" rx="6" fill="#dbeafe" stroke="#60a5fa" strokeWidth="1.5" className="transition group-hover:stroke-blue-600 group-hover:brightness-95" />
                  <text x="750" y="183" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="12.5" fontFamily="ui-monospace, monospace" fontWeight="bold">
                    {clientViewsLabel}
                  </text>
                </g>

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
                  <rect x="190" y="238" width="340" height="52" rx="6" fill="#dbeafe" stroke="#60a5fa" strokeWidth="1.5" className="transition group-hover:stroke-blue-600 group-hover:brightness-95" />
                  <text x="360" y="260" textAnchor="middle" fill="#1e40af" fontSize="13" fontFamily="ui-monospace, monospace" fontWeight="bold">Auth Context</text>
                  <text x="360" y="278" textAnchor="middle" fill="#1e40af" fontSize="10.5" fontFamily="ui-monospace, monospace" opacity="0.85">[AuthContext.jsx]</text>
                </g>

                <path d="M 360 204 L 360 238" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
                <rect x="323" y="212" width="74" height="17" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="360" y="224" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="600">
                  reads auth
                </text>

                {/* ─── 3. CONNECTOR TO API ACCESS ─── */}
                <path d="M 360 290 L 360 325 L 560 325 L 560 355" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
                <rect x="415" y="316" width="94" height="18" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="462" y="329" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="10.5" fontFamily="ui-monospace, monospace" fontWeight="600">
                  sends requests
                </text>
                <circle r="3.5" fill="#f59e0b">
                  <animateMotion path="M 360 290 L 360 325 L 560 325 L 560 355" dur="2.4s" repeatCount="indefinite" />
                </circle>

                {/* ─── 4. CONTAINER 2 - API Access & Security ─── */}
                <rect x="380" y="355" width="360" height="305" rx="8" fill="#fffbeb" stroke="#fde68a" strokeWidth="1.5" />
                <text x="560" y="378" textAnchor="middle" fill="#854d0e" fontSize="12" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  API Access
                </text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'cloudflare', label: 'Cloudflare Proxy', sub: 'SSL Termination & DDoS Ingress Proxy', category: 'API_ACCESS', type: 'PROXY', color: '#854d0e', bg: '#fef08a', border: '#f59e0b' })}>
                  <rect x="420" y="392" width="280" height="36" rx="6" fill="#fef08a" stroke="#f59e0b" strokeWidth="1.5" className="transition group-hover:stroke-amber-600 group-hover:brightness-95" />
                  <text x="560" y="415" textAnchor="middle" dominantBaseline="middle" fill="#854d0e" fontSize="12" fontFamily="ui-monospace, monospace" fontWeight="bold">Cloudflare Proxy</text>
                </g>

                <path d="M 560 428 L 560 452" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
                <rect x="515" y="432" width="90" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="560" y="442" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="600">proxies traffic</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'spring_boot', label: `${formattedProjectName} REST API`, sub: `${projectName} Spring Boot 3.x REST Router`, category: 'API_ACCESS', type: 'API_GATEWAY', annotations: '@SpringBootApplication, @RestController', color: '#854d0e', bg: '#fef08a', border: '#f59e0b' })}>
                  <rect x="420" y="452" width="280" height="36" rx="6" fill="#fef08a" stroke="#f59e0b" strokeWidth="1.5" className="transition group-hover:stroke-amber-600 group-hover:brightness-95" />
                  <text x="560" y="475" textAnchor="middle" dominantBaseline="middle" fill="#854d0e" fontSize="12" fontFamily="ui-monospace, monospace" fontWeight="bold">{formattedProjectName} REST API</text>
                </g>

                <path d="M 560 488 L 560 512" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
                <rect x="515" y="492" width="90" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="560" y="502" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="600">enters security</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'sec_config', label: 'Security Config', sub: 'SecurityFilterChain & CORS Beans', category: 'API_ACCESS', type: 'SECURITY_CONFIG', annotations: '@Configuration, @EnableWebSecurity', color: '#854d0e', bg: '#fef08a', border: '#f59e0b' })}>
                  <rect x="420" y="512" width="280" height="36" rx="6" fill="#fef08a" stroke="#f59e0b" strokeWidth="1.5" className="transition group-hover:stroke-amber-600 group-hover:brightness-95" />
                  <text x="560" y="535" textAnchor="middle" dominantBaseline="middle" fill="#854d0e" fontSize="12" fontFamily="ui-monospace, monospace" fontWeight="bold">Security Config</text>
                </g>

                <path d="M 560 548 L 560 572" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
                <rect x="517" y="552" width="86" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="560" y="562" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="600">applies filter</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'jwt_filter', label: 'JWT Filter', sub: 'Bearer Token Validator & Principal', category: 'API_ACCESS', type: 'JWT_FILTER', annotations: 'OncePerRequestFilter, JwtUtils', color: '#854d0e', bg: '#fef08a', border: '#f59e0b' })}>
                  <rect x="420" y="572" width="280" height="36" rx="6" fill="#fef08a" stroke="#f59e0b" strokeWidth="1.5" className="transition group-hover:stroke-amber-600 group-hover:brightness-95" />
                  <text x="560" y="595" textAnchor="middle" dominantBaseline="middle" fill="#854d0e" fontSize="12" fontFamily="ui-monospace, monospace" fontWeight="bold">JWT Filter</text>
                </g>

                <circle r="3.5" fill="#d97706"><animateMotion path="M 560 392 L 560 608" dur="2.8s" repeatCount="indefinite" /></circle>

                {/* ─── 5. DISPATCHES TO DOMAINS ─── */}
                <path d="M 560 608 L 560 645" fill="none" stroke="#64748b" strokeWidth="1.5" />
                <rect x="526" y="618" width="68" height="16" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="560" y="629" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="600">dispatches</text>

                {top7Domains.map((dom, i) => {
                  const targetX = 95 + i * 155;
                  return (
                    <g key={`dispatch-line-${i}`}>
                      <path d={`M 560 645 L ${targetX} 645 L ${targetX} 715`} fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
                      <circle r="3" fill="#22c55e"><animateMotion path={`M 560 608 L 560 645 L ${targetX} 645 L ${targetX} 715`} dur={`${1.8 + i * 0.15}s`} repeatCount="indefinite" /></circle>
                    </g>
                  );
                })}

                {/* ─── 6. CONTAINER 3 - Domain Workflows ─── */}
                <rect x="20" y="705" width="1080" height="105" rx="8" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.5" />
                <text x="560" y="727" textAnchor="middle" fill="#15803d" fontSize="12" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  Domain Workflows
                </text>

                {top7Domains.map((dom, i) => {
                  const center = 95 + i * 155;
                  const firstCtrl = dom.controllers[0];
                  const displayName = dom.name.replace(' Workflows', '');

                  return (
                    <g
                      key={`dom-card-${i}`}
                      className="cursor-pointer group"
                      onClick={() => setSelectedNode({
                        id: `domain_${i}`,
                        label: dom.name,
                        sub: `${dom.count || 1} controller endpoints (${firstCtrl?.data?.filePath || `${displayName}Controller.java`})`,
                        category: 'DOMAIN',
                        type: 'DOMAIN_CONTROLLER',
                        filePath: firstCtrl?.data?.filePath,
                        annotations: firstCtrl?.data?.annotations || '@RestController, @RequestMapping',
                        color: '#15803d',
                        bg: '#dcfce7',
                        border: '#22c55e'
                      })}
                    >
                      <rect x={center - 68} y="742" width="136" height="48" rx="6" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600 group-hover:brightness-95" />
                      <text x={center} y={displayName.length > 13 ? 761 : 767} textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">
                        {displayName.length > 13 ? (
                          <>
                            <tspan x={center} dy="0">{displayName.split(' ')[0]}</tspan>
                            <tspan x={center} dy="12">{displayName.split(' ').slice(1).join(' ') || 'Workflows'}</tspan>
                          </>
                        ) : (
                          displayName
                        )}
                      </text>
                    </g>
                  );
                })}

                {/* ─── 7. CONNECTIONS TO PERSISTENCE & INTEGRATIONS ─── */}
                {top7Domains.map((dom, i) => {
                  const startX = 95 + i * 155;
                  const targetX = 140 + i * 45;
                  const labelText = i === 0 ? 'reads users' : i === 1 ? 'stores data' : i === 2 ? 'stores ops' : i === 3 ? 'reads reports' : i === 4 ? 'manages records' : i === 5 ? 'stores files' : 'reads/writes';
                  const lineY = 835 + (i % 3) * 12;

                  return (
                    <g key={`jpa-line-${i}`}>
                      <path d={`M ${startX} 790 L ${startX} ${lineY} L ${targetX} ${lineY} L ${targetX} 910`} fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
                      <rect x={(startX + targetX) / 2 - 38} y={lineY - 7} width="76" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                      <text x={(startX + targetX) / 2} y={lineY + 1} textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8.5" fontFamily="ui-monospace, monospace" fontWeight="600">
                        {labelText}
                      </text>
                      <circle r="3" fill="#f43f5e"><animateMotion path={`M ${startX} 790 L ${startX} ${lineY} L ${targetX} ${lineY} L ${targetX} 910`} dur={`${2.0 + i * 0.18}s`} repeatCount="indefinite" /></circle>
                    </g>
                  );
                })}

                <path d="M 250 790 L 250 820 L 820 820 L 820 910" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#arrow-indigo)" />
                <rect x="780" y="812" width="76" height="15" rx="3" fill="#ffffff" stroke="#c7d2fe" strokeWidth="1" />
                <text x="818" y="822" textAnchor="middle" dominantBaseline="middle" fill="#3730a3" fontSize="8.5" fontFamily="ui-monospace, monospace" fontWeight="600">sends notices</text>
                <circle r="3" fill="#6366f1"><animateMotion path="M 250 790 L 250 820 L 820 820 L 820 910" dur="2.5s" repeatCount="indefinite" /></circle>

                <path d="M 715 790 L 715 810 L 990 810 L 990 910" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#arrow-indigo)" />
                <rect x="910" y="802" width="70" height="15" rx="3" fill="#ffffff" stroke="#c7d2fe" strokeWidth="1" />
                <text x="945" y="812" textAnchor="middle" dominantBaseline="middle" fill="#3730a3" fontSize="8.5" fontFamily="ui-monospace, monospace" fontWeight="600">sends alerts</text>
                <circle r="3" fill="#6366f1"><animateMotion path="M 715 790 L 715 810 L 990 810 L 990 910" dur="2.4s" repeatCount="indefinite" /></circle>

                <path d="M 870 790 L 870 835 L 650 835 L 650 910" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#arrow-indigo)" />
                <rect x="715" y="826" width="80" height="15" rx="3" fill="#ffffff" stroke="#c7d2fe" strokeWidth="1" />
                <text x="755" y="836" textAnchor="middle" dominantBaseline="middle" fill="#3730a3" fontSize="8.5" fontFamily="ui-monospace, monospace" fontWeight="600">uploads media</text>
                <circle r="3" fill="#6366f1"><animateMotion path="M 870 790 L 870 835 L 650 835 L 650 910" dur="2.2s" repeatCount="indefinite" /></circle>

                {/* ─── 8. CONTAINER 4 - PERSISTENCE ─── */}
                <rect x="20" y="895" width="510" height="215" rx="8" fill="#fff1f2" stroke="#fecdd3" strokeWidth="1.5" />
                <text x="275" y="918" textAnchor="middle" fill="#be123c" fontSize="12" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  Persistence
                </text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'jpa_repos', label: `JPA Repositories (${repos.length > 0 ? repos.length : 26} DAO Classes)`, sub: 'Hibernate ORM / JPQL Query Engine', category: 'PERSISTENCE', type: 'JPA_REPO', annotations: '@Repository, @Transactional, JpaRepository', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="75" y="935" width="400" height="40" rx="6" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" className="transition group-hover:stroke-rose-600 group-hover:brightness-95" />
                  <text x="275" y="958" textAnchor="middle" dominantBaseline="middle" fill="#be123c" fontSize="12" fontFamily="ui-monospace, monospace" fontWeight="bold">JPA Repositories</text>
                </g>

                <path d="M 275 975 L 275 1018" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
                <rect x="236" y="987" width="78" height="16" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="275" y="998" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="600">reads / writes</text>
                <circle r="3.5" fill="#f43f5e"><animateMotion path="M 275 935 L 275 1060" dur="2.2s" repeatCount="indefinite" /></circle>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'database', label: `MySQL Database (${tables.length > 0 ? tables.length : 27} Tables)`, sub: `${tables.length > 0 ? tables.length : 27} Tables / Schema Mappings`, category: 'PERSISTENCE', type: 'DATABASE', annotations: '@Entity, @Table, @Id', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="75" y="1018" width="400" height="40" rx="6" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" className="transition group-hover:stroke-rose-600 group-hover:brightness-95" />
                  <text x="275" y="1041" textAnchor="middle" dominantBaseline="middle" fill="#be123c" fontSize="12" fontFamily="ui-monospace, monospace" fontWeight="bold">MySQL Database</text>
                </g>

                {/* ─── 9. CONTAINER 5 - EXTERNAL INTEGRATIONS ─── */}
                <rect x="560" y="895" width="540" height="215" rx="8" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="1.5" />
                <text x="830" y="918" textAnchor="middle" fill="#3730a3" fontSize="12" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  External Integrations
                </text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ext_s3', label: 'Cloudinary Media', sub: 'Media CDN & Cloud Bucket SDK', category: 'EXTERNAL', type: 'EXTERNAL', color: '#3730a3', bg: '#e0e7ff', border: '#6366f1' })}>
                  <rect x="580" y="940" width="155" height="56" rx="6" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" className="transition group-hover:stroke-indigo-600 group-hover:brightness-95" />
                  <text x="657" y="971" textAnchor="middle" dominantBaseline="middle" fill="#3730a3" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Cloudinary Media</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ext_email', label: 'Email Service', sub: 'JavaMailSender / SendGrid SDK', category: 'EXTERNAL', type: 'EXTERNAL', filePath: 'EmailService.java', color: '#3730a3', bg: '#e0e7ff', border: '#6366f1' })}>
                  <rect x="750" y="940" width="160" height="56" rx="6" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" className="transition group-hover:stroke-indigo-600 group-hover:brightness-95" />
                  <text x="830" y="962" textAnchor="middle" fill="#3730a3" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Email Service</text>
                  <text x="830" y="980" textAnchor="middle" fill="#3730a3" fontSize="9.5" fontFamily="ui-monospace, monospace" opacity="0.8">[EmailService.java]</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ext_msg', label: 'Whatsapp Service', sub: 'Twilio / WhatsApp Business Gateway', category: 'EXTERNAL', type: 'EXTERNAL', color: '#3730a3', bg: '#e0e7ff', border: '#6366f1' })}>
                  <rect x="925" y="940" width="155" height="56" rx="6" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" className="transition group-hover:stroke-indigo-600 group-hover:brightness-95" />
                  <text x="1002" y="971" textAnchor="middle" dominantBaseline="middle" fill="#3730a3" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Whatsapp Service</text>
                </g>

                <text x="830" y="1080" textAnchor="middle" fill="#4f46e5" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="500">
                  Detected from Spring POM dependencies
                </text>
              </svg>
            )}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              SPONSOR BANNER (Exact GitDiagram Footer Reference)
             ───────────────────────────────────────────────────────────── */}
          <div className="w-full max-w-4xl p-3 sm:p-4 rounded-xl border-2 border-black bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition mt-2">
            <div className="flex items-center gap-3">
              <span
                className="px-3 py-1.5 rounded-lg text-slate-900 font-mono font-black text-xs border border-black"
                style={{ backgroundColor: '#d8b4fe' }}
              >
                YC
              </span>
              <div className="text-xs font-mono">
                <span className="font-bold text-slate-900 uppercase text-[10.5px]">SPONSOR SLOT: </span>
                <span className="font-bold text-slate-900">Your company / </span>
                <span className="text-slate-600">Reach developers while they inspect codebase architecture.</span>
              </div>
            </div>
            <button
              onClick={() => onOpenTool?.('ai')}
              className="text-xs font-mono font-bold text-purple-700 hover:underline cursor-pointer shrink-0"
            >
              Sponsor this spot ↗
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
