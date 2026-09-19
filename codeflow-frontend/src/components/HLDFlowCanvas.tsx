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

  const controllers = useMemo(() => nodes.filter((n) => n.data?.nodeType === 'SPRING_CONTROLLER' || (n.data?.label || '').includes('Controller')), [nodes]);
  const services = useMemo(() => nodes.filter((n) => n.data?.nodeType === 'SPRING_SERVICE' || (n.data?.label || '').includes('Service')), [nodes]);
  const repos = useMemo(() => nodes.filter((n) => n.data?.nodeType === 'SPRING_REPOSITORY' || (n.data?.label || '').includes('Repository')), [nodes]);
  const tables = useMemo(() => nodes.filter((n) => n.data?.layer === 'DATABASE' || (n.data?.label || '').includes('Entity') || (n.data?.label || '').includes('Table')), [nodes]);
  const feComps = useMemo(() => nodes.filter((n) => n.data?.layer === 'FRONTEND' || (n.data?.filePath || '').endsWith('.jsx') || (n.data?.filePath || '').endsWith('.tsx')), [nodes]);

  // Derived Project Signature Identifiers
  const isTrustLocker = useMemo(() => {
    const p = (projectName || '').toLowerCase();
    return p.includes('trustlocker') || p.includes('trust-locker') || p.includes('trust_locker') ||
      nodes.some(n => {
        const l = (n.data?.label || '').toLowerCase();
        const f = (n.data?.filePath || '').toLowerCase();
        return l.includes('trustlocker') || f.includes('trustlocker') ||
               l.includes('nominee') || f.includes('nominee') ||
               l.includes('aesutil') || f.includes('aesutil') ||
               l.includes('checkin') || f.includes('checkin') ||
               l.includes('toggle') || f.includes('toggle');
      });
  }, [projectName, nodes]);

  const isThinkSwipe = useMemo(() => {
    const p = (projectName || '').toLowerCase();
    return p.includes('thinkswipe') || p.includes('think-swipe') || p.includes('think_swipe') ||
      nodes.some(n => {
        const l = (n.data?.label || '').toLowerCase();
        const f = (n.data?.filePath || '').toLowerCase();
        return l.includes('thinkswipe') || f.includes('thinkswipe') ||
               f.includes('main.jsx') || l.includes('answerservice') ||
               l.includes('jdoodle') || l.includes('tidb');
      });
  }, [projectName, nodes]);

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
      if (isTrustLocker) {
        domainMap.set('Document Management', [{ id: 'tl_doc', data: { label: 'Document API' } }]);
        domainMap.set('Authentication & Security', [{ id: 'tl_auth', data: { label: 'Authentication API' } }]);
        domainMap.set('Nominee Access', [{ id: 'tl_nom', data: { label: 'Nominee API' } }]);
        domainMap.set('Feature Toggles', [{ id: 'tl_feat', data: { label: 'Feature Toggle API' } }]);
        domainMap.set('System Administration', [{ id: 'tl_adm', data: { label: 'Administration API' } }]);
      } else {
        domainMap.set('Authentication', [
          { id: 'auth_workflow', data: { label: 'Auth & Session Controller' } }
        ]);
        domainMap.set('Core Features', [
          { id: 'comm_workflow', data: { label: 'Core Application Controller' } }
        ]);
        domainMap.set('Data Operations', [
          { id: 'ops_workflow', data: { label: 'Operations & Workflow Controller' } }
        ]);
        domainMap.set('Reporting & Analytics', [
          { id: 'fin_workflow', data: { label: 'Reports & Export Controller' } }
        ]);
      }
    }

    return Array.from(domainMap.entries()).map(([name, ctrls]) => ({
      name,
      controllers: ctrls,
      count: ctrls.length
    }));
  }, [controllers, isTrustLocker]);

  // Filtered Domain Workflows if user selects a specific domain in Activity menu
  const activeDomains = useMemo(() => {
    if (selectedDomain === 'ALL') return domainWorkflows;
    return domainWorkflows.filter(d => d.name === selectedDomain);
  }, [domainWorkflows, selectedDomain]);

  // Derived dynamic labels for the active project
  const formattedProjectName = useMemo(() => {
    if (!projectName || projectName === 'Repository') return 'Spring Boot & React';
    if (projectName.toLowerCase() === 'vps') return 'School ERP';
    if (projectName.toLowerCase() === 'trustlocker') return 'TrustLocker';
    if (projectName.toLowerCase() === 'thinkswipe') return 'ThinkSwipe';
    return projectName.replace(/[-_]/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
  }, [projectName]);

  const actorLabel = useMemo(() => {
    if (isTrustLocker) return 'Vault Owners & Nominees';
    if (isThinkSwipe) return 'Visitors & Admins';
    if (projectName?.toLowerCase().includes('school') || projectName?.toLowerCase() === 'vps') return 'School Users';
    if (projectName?.toLowerCase().includes('petclinic')) return 'Pet Owners & Staff';
    return `${formattedProjectName} Users`;
  }, [isTrustLocker, isThinkSwipe, projectName, formattedProjectName]);

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
    let mermaid = `graph TD\\n`;
    if (isTrustLocker) {
      mermaid += `    Nominee([Nominee]) -->|opens portal| NomineePortal[Nominee Portal (NomineePortal.jsx)]
    VaultOwner([Vault Owner]) -->|manages vault| OwnerDash[Owner Dashboard (Dashboard.jsx)]
    VaultOwner -->|registers or logs in| LoginSignup[Login and Signup (LoginPage.jsx)]
    UserBrowser([User Browser]) -->|opens app| RouteApp[Route Application (App.jsx)]
    Admin([Administrator]) -->|monitors system| AdminDash[Admin Dashboard (AdminDashboard.jsx)]
    RouteApp --> NomineePortal
    RouteApp --> OwnerDash
    RouteApp --> LoginSignup
    RouteApp --> AdminDash
    NomineePortal -->|requests shared files| NomineeApi[Nominee API]
    OwnerDash -->|manages documents| DocApi[Document API]
    LoginSignup -->|submits credentials| AuthApi[Authentication API]
    AdminDash -->|reviews alerts| AdminApi[Administration API]
    DocApi -->|encrypts/decrypts| EncService[Encryption Service]
    EncService --> AesUtil[AES Utility (AESUtil.java)]
    NomineeApi --> DocStore[(Document Persistence)]
    DocApi --> DocStore
    AuthApi --> UserStore[(User Persistence)]
    AdminApi --> AlertStore[(Alert Store)]
    DocStore --> MySQL[(MySQL Database)]
    UserStore --> MySQL
    AlertStore --> MySQL
`;
    } else {
      mermaid += `    User([${actorLabel}]) -->|uses| ReactApp[React Application (App.jsx)]
    ReactApp -->|sends requests| SpringBoot[Spring Boot API]
    SpringBoot -->|enters security| SecConfig[Security Config]
    SecConfig -->|applies filter| JwtFilter[JWT Filter]
    JwtFilter -->|dispatches| DomainWorkflows[Domain Workflows]
    DomainWorkflows -->|persists| Database[(Database)]
`;
    }
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
                  ? 'bg-white border-2 border-black text-slate-900'
                  : 'bg-slate-900 border-2 border-slate-700 text-slate-100'
              }`}
            >
              <div className="px-3 py-1.5 text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">Filter Architecture Domains</div>
              <button
                onClick={() => { setSelectedDomain('ALL'); setIsActivityMenuOpen(false); }}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono font-bold transition text-left cursor-pointer ${
                  selectedDomain === 'ALL'
                    ? 'bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-200'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>🌟 All Project Domains</span>
                {selectedDomain === 'ALL' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
              </button>
              {domainWorkflows.map((d) => (
                <button
                  key={d.name}
                  onClick={() => { setSelectedDomain(d.name); setIsActivityMenuOpen(false); }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono font-bold transition text-left cursor-pointer ${
                    selectedDomain === d.name
                      ? 'bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-200'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{d.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono ml-2 shrink-0">
                    {d.count}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pill 3: Zoom Controls */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-slate-900 dark:bg-slate-900 dark:text-white dark:border-slate-700"
        >
          <button
            onClick={() => setIsZoomEnabled(!isZoomEnabled)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
              isZoomEnabled ? 'text-purple-700 dark:text-purple-400 font-black' : 'text-slate-500'
            }`}
          >
            <span className="text-xs">⛶</span>
            <span>Enable zoom</span>
          </button>
          {isZoomEnabled && (
            <div className="flex items-center gap-1 border-l pl-2 border-slate-300 dark:border-slate-700">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.4, prev - 0.1))}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition cursor-pointer text-slate-700 dark:text-slate-300"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-bold w-11 text-center text-slate-800 dark:text-slate-200">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(2.0, prev + 0.1))}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition cursor-pointer text-slate-700 dark:text-slate-300"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition cursor-pointer text-slate-700 dark:text-slate-300"
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
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {isExportMenuOpen && (
            <div
              className={`absolute right-0 top-full mt-2 w-56 rounded-2xl p-2 z-50 flex flex-col gap-1 shadow-2xl ${
                isLight
                  ? 'bg-white border-2 border-black text-slate-900'
                  : 'bg-slate-900 border-2 border-slate-700 text-slate-100'
              }`}
            >
              <button
                onClick={handleExportMermaid}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left cursor-pointer"
              >
                <span>Copy Mermaid DSL</span>
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              </button>
              <button
                onClick={() => {
                  onOpenTool?.('blueprint');
                  setIsExportMenuOpen(false);
                }}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left cursor-pointer"
              >
                <span>Download SVG / PDF</span>
                <Download className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          )}
        </div>

        {/* Pill 5: Regenerate */}
        <button
          onClick={() => {
            setZoomLevel(1);
            setSelectedDomain('ALL');
            setSelectedNode(null);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold bg-purple-600 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-purple-700 transition cursor-pointer"
          style={{ backgroundColor: '#9333ea', color: '#ffffff' }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Regenerate</span>
        </button>

        {/* Pill 6: Studio Tools Launcher */}
        <button
          onClick={() => { setIsAllToolsOpen(!isAllToolsOpen); setIsActivityMenuOpen(false); setIsExportMenuOpen(false); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold bg-white text-slate-900 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-purple-50 transition cursor-pointer dark:bg-slate-900 dark:text-white dark:border-slate-700"
        >
          <Wrench className="w-3.5 h-3.5 text-purple-600" />
          <span>Studio Tools (29)</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </button>
      </div>

      {/* ─── STUDIO TOOLS MODAL DRAWER ─── */}
      {isAllToolsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-4xl max-h-[85vh] rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden ${
              isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100 border-slate-700'
            }`}
          >
            <div className="p-4 border-b-2 border-black dark:border-slate-700 flex items-center justify-between bg-purple-50 dark:bg-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-600 text-white font-mono font-bold text-xs">29</span>
                <div>
                  <h2 className="font-mono font-bold text-sm text-slate-900 dark:text-white">CodeFlow Studio Architecture Tool Suite</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Select any analyzer, sandbox, generator or tracer for {projectName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAllToolsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
              <div>
                <h3 className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-3">AI & Interactive Exploration</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  <ToolCard icon="🤖" label="AI Assistant" desc="Deep architectural analysis & review" onClick={() => { onOpenTool?.('ai'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="🎙️" label="Voice Copilot" desc="Voice-guided interactive navigation" onClick={() => { onOpenTool?.('voice'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="⚡" label="Command Palette" desc="Global action search & navigation" onClick={() => { onOpenTool?.('cmd'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="📊" label="Architecture Scorecard" desc="Maintainability & security grades" onClick={() => { onOpenTool?.('scorecard'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="🔀" label="Architecture Drift" desc="Detect drift vs codebase spec" onClick={() => { onOpenTool?.('drift'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="📋" label="Architecture Blueprint" desc="Export professional architecture spec" onClick={() => { onOpenTool?.('blueprint'); setIsAllToolsOpen(false); }} />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-3">Database, Runtime & Infrastructure</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  <ToolCard icon="🗄️" label="ER Diagram" desc="Interactive visual database schema" onClick={() => { onOpenTool?.('erd'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="🔍" label="SQL Explorer" desc="Live query plans & JPA optimizations" onClick={() => { onOpenTool?.('sql'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="🛡️" label="Security Explorer" desc="JWT validation & RBAC permission audit" onClick={() => { onOpenTool?.('security'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="⏱️" label="Runtime Tracing" desc="Microsecond-accurate call stack traces" onClick={() => { onOpenTool?.('trace'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="📈" label="API Metrics" desc="Live throughput, p99 latency & SLAs" onClick={() => { onOpenTool?.('metrics'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="📦" label="Dependency Explorer" desc="Maven POM dependencies & licenses" onClick={() => { onOpenTool?.('deps'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="🌐" label="Cloud Infra Synthesizer" desc="Auto-generate Terraform & K8s" onClick={() => { onOpenTool?.('cloud'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="📡" label="Event Stream Visualizer" desc="Kafka & RabbitMQ reactive topology" onClick={() => { onOpenTool?.('events'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="🕸️" label="Service Mesh & Istio" desc="mTLS, circuit breaker & Envoy proxies" onClick={() => { onOpenTool?.('mesh'); setIsAllToolsOpen(false); }} />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-3">Code Generation & Integrations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  <ToolCard icon="🧪" label="API Sandbox" desc="Test Spring REST endpoints with real payloads" onClick={() => { onOpenTool?.('sandbox'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="📘" label="TypeScript Generator" desc="Generate strict DTO interfaces" onClick={() => { onOpenTool?.('tsgen'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="🔬" label="Test Suite Generator" desc="JUnit 5 & Mockito test scaffolds" onClick={() => { onOpenTool?.('tests'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="📁" label="File Tree Explorer" desc="Interactive project directory explorer" onClick={() => { onOpenTool?.('filetree'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="🧩" label="VS Code Extension" desc="Live architecture sidecar in VS Code" onClick={() => { onOpenTool?.('vscode'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="👥" label="Live Collaboration" desc="Real-time multi-user cursor" onClick={() => { onOpenTool?.('collab'); setIsAllToolsOpen(false); }} />
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
            {isTrustLocker ? (
              /* ═══════════════════════════════════════════════════════════════════
                 TRUSTLOCKER ARCHITECTURE CANVAS (EXACT MATCH TO GITDIAGRAM SCREENSHOTS)
                 ═══════════════════════════════════════════════════════════════════ */
              <svg
                viewBox="0 0 1140 1280"
                className="w-full h-auto drop-shadow-sm select-none"
                style={{ minWidth: '320px', maxWidth: '1140px' }}
              >
                <defs>
                  <marker id="tl-arrow-slate" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
                  </marker>
                  <marker id="tl-arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" />
                  </marker>
                  <marker id="tl-arrow-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#eab308" />
                  </marker>
                  <marker id="tl-arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#22c55e" />
                  </marker>
                  <marker id="tl-arrow-rose" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e" />
                  </marker>
                  <marker id="tl-arrow-indigo" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#6366f1" />
                  </marker>
                </defs>

                {/* ─── 1. TOP ACTORS (CIRCULAR) ─── */}
                {/* 1. Nominee */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_nominee_user', label: 'Nominee', sub: 'Designated beneficiary accessing unlocked digital legacy vaults', category: 'CLIENT', type: 'USER', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <circle cx="210" cy="45" r="26" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="210" y="49" textAnchor="middle" fill="#1e40af" fontSize="10.5" fontFamily="system-ui, sans-serif" fontWeight="bold">Nominee</text>
                </g>

                {/* 2. Vault Owner */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_vault_owner', label: 'Vault Owner', sub: 'Primary account holder managing documents, keys and check-ins', category: 'CLIENT', type: 'USER', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <circle cx="430" cy="45" r="28" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="430" y="49" textAnchor="middle" fill="#1e40af" fontSize="10.5" fontFamily="system-ui, sans-serif" fontWeight="bold">Vault Owner</text>
                </g>

                {/* 3. User Browser */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_user_browser', label: 'User Browser', sub: 'Client web browser loading single page application assets', category: 'CLIENT', type: 'USER', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <circle cx="700" cy="45" r="27" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="700" y="49" textAnchor="middle" fill="#1e40af" fontSize="10.5" fontFamily="system-ui, sans-serif" fontWeight="bold">User Browser</text>
                </g>

                {/* 4. Administrator */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_admin_user', label: 'Administrator', sub: 'System security admin monitoring platform health & alerts', category: 'CLIENT', type: 'USER', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <circle cx="920" cy="45" r="28" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="920" y="49" textAnchor="middle" fill="#1e40af" fontSize="10.5" fontFamily="system-ui, sans-serif" fontWeight="bold">Administrator</text>
                </g>

                {/* Actor Lines Down to Web Client */}
                <path d="M 210 71 L 210 235" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="175" y="85" width="70" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="210" y="93" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">opens portal</text>

                <path d="M 410 73 L 410 235" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="375" y="85" width="70" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="410" y="93" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">manages vault</text>

                <path d="M 450 73 L 450 185 L 675 185 L 675 235" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="475" y="85" width="85" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="517" y="93" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">registers or logs in</text>

                <path d="M 700 72 L 700 145" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="670" y="85" width="60" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="700" y="93" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">opens app</text>

                <path d="M 920 73 L 920 235" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="880" y="85" width="80" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="920" y="93" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">monitors system</text>

                {/* ─── 2. CONTAINER 1: WEB CLIENT ─── */}
                <rect x="80" y="110" width="980" height="195" rx="8" fill="#eff6ff" stroke="#bae6fd" strokeWidth="1.5" />
                <text x="570" y="130" textAnchor="middle" fill="#1e40af" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Web Client</text>

                {/* Route Application [App.jsx] */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_app_jsx', label: 'Route Application [App.jsx]', sub: 'Core React Router routing layer and page dispatch', category: 'CLIENT', type: 'REACT_APP', filePath: 'src/App.jsx', annotations: 'React Router v6, ErrorBoundary', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="635" y="145" width="130" height="42" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="700" y="161" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Route Application</text>
                  <text x="700" y="176" textAnchor="middle" fill="#1e40af" fontSize="8.5" fontFamily="ui-monospace, monospace" opacity="0.8">[App.jsx]</text>
                </g>

                {/* Sub-Views in Web Client */}
                {/* Nominee Portal */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_nominee_portal', label: 'Nominee Portal [NomineePortal.jsx]', sub: 'Secure portal for beneficiary verification & claim intake', category: 'CLIENT', type: 'FE_VIEW', filePath: 'src/components/NomineePortal.jsx', annotations: 'React Component, JWT Auth', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="120" y="235" width="150" height="46" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="195" y="253" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Nominee Portal</text>
                  <text x="195" y="268" textAnchor="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">[NomineePortal.jsx]</text>
                </g>

                {/* Owner Dashboard */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_owner_dashboard', label: 'Owner Dashboard [Dashboard.jsx]', sub: 'User dashboard for vault encryption, files & timers', category: 'CLIENT', type: 'FE_VIEW', filePath: 'src/components/Dashboard.jsx', annotations: 'React Component, WebCrypto API', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="360" y="235" width="150" height="46" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="435" y="253" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Owner Dashboard</text>
                  <text x="435" y="268" textAnchor="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">[Dashboard.jsx]</text>
                </g>

                {/* Login and Signup */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_login_page', label: 'Login and Signup [LoginPage.jsx]', sub: 'Authentication gateway supporting 2FA and sessions', category: 'CLIENT', type: 'FE_VIEW', filePath: 'src/components/LoginPage.jsx', annotations: 'React Component, Formik, Yup', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="600" y="235" width="150" height="46" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="675" y="253" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Login and Signup</text>
                  <text x="675" y="268" textAnchor="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">[LoginPage.jsx]</text>
                </g>

                {/* Admin Dashboard */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_admin_dashboard', label: 'Admin Dashboard [AdminDashboard.jsx]', sub: 'Administrative operations, security alerts & audit trail', category: 'CLIENT', type: 'FE_VIEW', filePath: 'src/components/AdminDashboard.jsx', annotations: 'React Component, Recharts', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="840" y="235" width="150" height="46" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="915" y="253" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Admin Dashboard</text>
                  <text x="915" y="268" textAnchor="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">[AdminDashboard.jsx]</text>
                </g>

                {/* Route App internal branches */}
                <path d="M 635 170 L 195 170 L 195 235" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#tl-arrow-blue)" />
                <rect x="230" y="163" width="70" height="13" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="265" y="171" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">routes nominee</text>

                <path d="M 635 175 L 435 175 L 435 235" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#tl-arrow-blue)" />
                <rect x="470" y="168" width="64" height="13" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="502" y="176" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">routes owner</text>

                <path d="M 675 187 L 675 235" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#tl-arrow-blue)" />
                <rect x="645" y="198" width="60" height="13" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="675" y="206" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">routes login</text>

                <path d="M 765 170 L 915 170 L 915 235" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#tl-arrow-blue)" />
                <rect x="800" y="163" width="64" height="13" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="832" y="171" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">routes admin</text>

                {/* ─── 3. LINES FROM WEB CLIENT TO API & SECURITY ─── */}
                <path d="M 155 281 L 155 410" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="110" y="325" width="90" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="155" y="333" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">requests shared files</text>

                <path d="M 385 281 L 385 350 L 305 350 L 305 410" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="305" y="325" width="88" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="349" y="333" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">updates preferences</text>

                <path d="M 435 281 L 435 350 L 460 350 L 460 410" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="420" y="325" width="84" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="462" y="333" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">manages documents</text>

                <path d="M 490 281 L 490 340 L 525 340 L 525 730 L 590 730" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="500" y="325" width="46" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="523" y="333" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">checks in</text>

                <path d="M 675 281 L 675 350 L 615 350 L 615 410" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="610" y="325" width="88" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="654" y="333" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">submits credentials</text>

                <path d="M 915 281 L 915 410" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="880" y="325" width="70" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="915" y="333" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">reviews alerts</text>

                {/* ─── 4. CONTAINER 2: API AND SECURITY ─── */}
                <rect x="80" y="370" width="980" height="180" rx="8" fill="#fffbeb" stroke="#fef08a" strokeWidth="1.5" />
                <text x="570" y="392" textAnchor="middle" fill="#854d0e" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">API and Security</text>

                {/* 6 API Nodes */}
                {/* 1. Nominee API */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_nominee_api', label: 'Nominee API', sub: 'REST endpoint for nominee verification & claim requests', category: 'API_ACCESS', type: 'DOMAIN_CONTROLLER', filePath: 'NomineeController.java', annotations: '@RestController, @RequestMapping("/api/nominee")', color: '#854d0e', bg: '#fef9c3', border: '#eab308' })}>
                  <rect x="100" y="410" width="115" height="34" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="157" y="431" textAnchor="middle" fill="#854d0e" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Nominee API</text>
                </g>

                {/* 2. Feature Toggle API */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_toggle_api', label: 'Feature Toggle API', sub: 'REST endpoint managing user features & security preferences', category: 'API_ACCESS', type: 'DOMAIN_CONTROLLER', filePath: 'FeatureToggleController.java', annotations: '@RestController, @RequestMapping("/api/toggles")', color: '#854d0e', bg: '#fef9c3', border: '#eab308' })}>
                  <rect x="240" y="410" width="135" height="34" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="307" y="431" textAnchor="middle" fill="#854d0e" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Feature Toggle API</text>
                </g>

                {/* 3. Document API */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_doc_api', label: 'Document API', sub: 'REST endpoint handling encrypted payload upload and retrieval', category: 'API_ACCESS', type: 'DOMAIN_CONTROLLER', filePath: 'DocumentController.java', annotations: '@RestController, @RequestMapping("/api/documents")', color: '#854d0e', bg: '#fef9c3', border: '#eab308' })}>
                  <rect x="400" y="410" width="120" height="34" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="460" y="431" textAnchor="middle" fill="#854d0e" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Document API</text>
                </g>

                {/* 4. Authentication API */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_auth_api', label: 'Authentication API', sub: 'Authentication controller handling registration, login and JWT issuance', category: 'API_ACCESS', type: 'DOMAIN_CONTROLLER', filePath: 'AuthController.java', annotations: '@RestController, @RequestMapping("/api/auth")', color: '#854d0e', bg: '#fef9c3', border: '#eab308' })}>
                  <rect x="545" y="410" width="140" height="34" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="615" y="431" textAnchor="middle" fill="#854d0e" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Authentication API</text>
                </g>

                {/* 5. JWT Security */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_jwt_sec', label: 'JWT Security', sub: 'Spring Security filter chain configuration & token parser', category: 'API_ACCESS', type: 'SECURITY_CONFIG', filePath: 'SecurityConfig.java', annotations: '@Configuration, @EnableWebSecurity', color: '#854d0e', bg: '#fef9c3', border: '#eab308' })}>
                  <rect x="710" y="410" width="115" height="34" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="767" y="431" textAnchor="middle" fill="#854d0e" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">JWT Security</text>
                </g>

                {/* 6. Administration API */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_admin_api', label: 'Administration API', sub: 'REST endpoint for admin audit history & alert management', category: 'API_ACCESS', type: 'DOMAIN_CONTROLLER', filePath: 'AdminController.java', annotations: '@RestController, @PreAuthorize', color: '#854d0e', bg: '#fef9c3', border: '#eab308' })}>
                  <rect x="850" y="410" width="145" height="34" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="922" y="431" textAnchor="middle" fill="#854d0e" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Administration API</text>
                </g>

                {/* JWT Request Filter */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_jwt_filter', label: 'JWT Request Filter', sub: 'OncePerRequestFilter intercepting HTTP requests to validate Bearer tokens', category: 'API_ACCESS', type: 'JWT_FILTER', filePath: 'JwtRequestFilter.java', annotations: '@Component, extends OncePerRequestFilter', color: '#854d0e', bg: '#fef9c3', border: '#eab308' })}>
                  <rect x="565" y="485" width="140" height="32" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="635" y="505" textAnchor="middle" fill="#854d0e" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">JWT Request Filter</text>
                </g>

                <path d="M 585 444 L 585 485" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="530" y="458" width="80" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="570" y="466" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">requires protection</text>

                <path d="M 645 444 L 645 485" fill="none" stroke="#eab308" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#tl-arrow-amber)" />
                <rect x="630" y="458" width="85" height="13" rx="2" fill="#ffffff" stroke="#fde047" strokeWidth="1" />
                <text x="672" y="466" textAnchor="middle" dominantBaseline="middle" fill="#854d0e" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">issues session token</text>

                <path d="M 745 444 L 745 470 L 685 470 L 685 485" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="715" y="458" width="56" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="743" y="466" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">installs filter</text>

                {/* ─── 5. CONTAINER 3: VAULT LIFECYCLE ─── */}
                <rect x="360" y="615" width="410" height="185" rx="8" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1.5" />
                <text x="565" y="637" textAnchor="middle" fill="#15803d" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Vault Lifecycle</text>

                {/* Left Column: Encryption Service & AES Utility */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_enc_srv', label: 'Encryption Service', sub: 'Symmetric envelope encryption and key lifecycle orchestrator', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'EncryptionService.java', annotations: '@Service', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="385" y="655" width="145" height="34" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="457" y="676" textAnchor="middle" fill="#15803d" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Encryption Service</text>
                </g>

                <path d="M 457 689 L 457 730" fill="none" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#tl-arrow-green)" />
                <rect x="415" y="702" width="84" height="13" rx="2" fill="#ffffff" stroke="#bbf7d0" strokeWidth="1" />
                <text x="457" y="710" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">performs AES-GCM</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_aes_util', label: 'AES Utility [AESUtil.java]', sub: 'Low-level cryptography helper implementing 256-bit AES-GCM encryption', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'AESUtil.java', annotations: 'javax.crypto.Cipher, SecretKeySpec', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="385" y="730" width="145" height="42" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="457" y="748" textAnchor="middle" fill="#15803d" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">AES Utility</text>
                  <text x="457" y="763" textAnchor="middle" fill="#15803d" fontSize="8.5" fontFamily="ui-monospace, monospace" opacity="0.8">[AESUtil.java]</text>
                </g>

                {/* Right Column: Switch Scheduler & Check-in Service */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_switch_sched', label: 'Switch Scheduler', sub: 'Cron-based scheduler monitoring dead man switch inactivity timeouts', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'SwitchScheduler.java', annotations: '@Component, @Scheduled(cron = "0 0 * * * *")', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="590" y="655" width="145" height="34" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="662" y="676" textAnchor="middle" fill="#15803d" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Switch Scheduler</text>
                </g>

                <path d="M 662 689 L 662 730" fill="none" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#tl-arrow-green)" />
                <rect x="610" y="702" width="104" height="13" rx="2" fill="#ffffff" stroke="#bbf7d0" strokeWidth="1" />
                <text x="662" y="710" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">runs inactivity workflow</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_checkin_srv', label: 'Check-in Service', sub: 'Heartbeat recorder calculating grace periods and unlocking vaults', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'CheckInService.java', annotations: '@Service, @Transactional', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="590" y="730" width="145" height="34" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="662" y="751" textAnchor="middle" fill="#15803d" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Check-in Service</text>
                </g>

                {/* ─── 6. INTER-TIER STEPPED LINES (APIs & SERVICES TO VAULT & STORES) ─── */}
                <path d="M 120 444 L 120 750 L 385 750" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="135" y="590" width="80" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="175" y="598" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">decrypts download</text>

                <path d="M 430 444 L 430 655" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="385" y="575" width="88" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="429" y="583" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">encrypts or decrypts</text>

                <path d="M 130 444 L 130 925" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="85" y="660" width="94" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="132" y="668" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">finds shared documents</text>

                <path d="M 170 444 L 170 650 L 590 650 L 590 925" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="180" y="660" width="56" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="208" y="668" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">loads owner</text>

                <path d="M 290 444 L 290 925" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="245" y="660" width="92" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="291" y="668" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">reads or saves toggles</text>

                <path d="M 450 444 L 450 630 L 180 630 L 180 925" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="330" y="660" width="102" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="381" y="668" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">reads or saves documents</text>

                <path d="M 470 444 L 470 640 L 610 640 L 610 925" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="425" y="660" width="56" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="453" y="668" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">loads owner</text>

                <path d="M 615 444 L 615 570 L 660 570 L 660 730" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="580" y="580" width="76" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="618" y="588" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">updates check-in</text>

                <path d="M 630 444 L 630 925" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="632" y="580" width="82" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="673" y="588" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">initializes accounts</text>

                <path d="M 457 772 L 457 850 L 480 850 L 480 925" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="450" y="830" width="62" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="481" y="838" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">reads or writes</text>

                <path d="M 610 764 L 610 860 L 330 860 L 330 925" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="520" y="830" width="70" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="555" y="838" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">initializes toggles</text>

                <path d="M 645 764 L 645 925" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="590" y="830" width="56" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="618" y="838" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">saves status</text>

                <path d="M 690 764 L 690 850 L 760 850 L 760 925" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="670" y="830" width="74" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="707" y="838" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">records check-in</text>

                {/* Admin API lines down */}
                <path d="M 870 444 L 870 650 L 780 650 L 780 925" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="660" y="660" width="58" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="689" y="668" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">records audit</text>

                <path d="M 890 444 L 890 640 L 660 640 L 660 925" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="715" y="660" width="86" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="758" y="668" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">reads or saves users</text>

                <path d="M 910 444 L 910 630 L 680 630 L 680 925" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="800" y="660" width="48" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="824" y="668" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">lists users</text>

                <path d="M 935 444 L 935 925" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="840" y="660" width="82" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="881" y="668" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">reads audit history</text>

                <path d="M 965 444 L 965 925" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="915" y="660" width="98" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="964" y="668" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">reads or resolves alerts</text>

                {/* ─── 7. CONTAINER 4: PERSISTENCE AND OPERATIONS ─── */}
                <rect x="80" y="880" width="980" height="235" rx="8" fill="#fff1f2" stroke="#fecdd3" strokeWidth="1.5" />
                <text x="570" y="902" textAnchor="middle" fill="#be123c" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Persistence and Operations</text>

                {/* 6 Store Nodes */}
                {/* 1. Document Persistence */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_doc_store', label: 'Document Persistence', sub: 'Spring Data JPA metadata store for encrypted records', category: 'PERSISTENCE', type: 'JPA_REPO', filePath: 'DocumentRepository.java', annotations: '@Repository', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="100" y="925" width="140" height="40" rx="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="170" y="942" textAnchor="middle" fill="#be123c" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Document Persistence</text>
                  <text x="170" y="955" textAnchor="middle" fill="#be123c" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">persists metadata</text>
                </g>

                {/* 2. Toggle Persistence */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_toggle_store', label: 'Toggle Persistence', sub: 'Feature flag and kill switch JPA state store', category: 'PERSISTENCE', type: 'JPA_REPO', filePath: 'ToggleRepository.java', annotations: '@Repository', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="260" y="925" width="135" height="40" rx="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="327" y="942" textAnchor="middle" fill="#be123c" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Toggle Persistence</text>
                  <text x="327" y="955" textAnchor="middle" fill="#be123c" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">persists toggles</text>
                </g>

                {/* 3. Encrypted File Store */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_file_store', label: 'Encrypted File Store', sub: 'Encrypted BLOB and cipher payload storage engine', category: 'PERSISTENCE', type: 'JPA_REPO', filePath: 'FilePayloadRepository.java', annotations: '@Repository', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="415" y="925" width="135" height="40" rx="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="482" y="948" textAnchor="middle" fill="#be123c" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Encrypted File Store</text>
                </g>

                {/* 4. User Persistence */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_user_store', label: 'User Persistence', sub: 'User credentials, public keys & nominee assignments', category: 'PERSISTENCE', type: 'JPA_REPO', filePath: 'UserRepository.java', annotations: '@Repository', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="570" y="925" width="135" height="40" rx="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="637" y="942" textAnchor="middle" fill="#be123c" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">User Persistence</text>
                  <text x="637" y="955" textAnchor="middle" fill="#be123c" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">persists users</text>
                </g>

                {/* 5. Access Audit Store */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_audit_store', label: 'Access Audit Store', sub: 'Immutable audit log tracking all vault operations and logins', category: 'PERSISTENCE', type: 'JPA_REPO', filePath: 'AuditLogRepository.java', annotations: '@Repository', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="725" y="925" width="145" height="40" rx="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="797" y="942" textAnchor="middle" fill="#be123c" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Access Audit Store</text>
                  <text x="797" y="955" textAnchor="middle" fill="#be123c" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">persists audit logs</text>
                </g>

                {/* 6. Alert Store */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_alert_store', label: 'Alert Store', sub: 'Security alerts and automated incident dispatch store', category: 'PERSISTENCE', type: 'JPA_REPO', filePath: 'AlertRepository.java', annotations: '@Repository', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="890" y="925" width="135" height="40" rx="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="957" y="942" textAnchor="middle" fill="#be123c" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Alert Store</text>
                  <text x="957" y="955" textAnchor="middle" fill="#be123c" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">persists alerts</text>
                </g>

                {/* Database Cylinder */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_mysql_db', label: 'MySQL Database', sub: 'Relational Database Management System storing relational schema', category: 'PERSISTENCE', type: 'DATABASE', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="510" y="1035" width="120" height="46" rx="8" fill="#fee2e2" stroke="#f87171" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="570" y="1062" textAnchor="middle" dominantBaseline="middle" fill="#be123c" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">MySQL Database</text>
                </g>

                {/* Arrows to Database */}
                <path d="M 170 965 L 170 1020 L 530 1020 L 530 1035" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="180" y="980" width="76" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="218" y="988" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">persists metadata</text>

                <path d="M 327 965 L 327 1010 L 545 1010 L 545 1035" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="340" y="980" width="72" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="376" y="988" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">persists toggles</text>

                <path d="M 637 965 L 637 1010 L 585 1010 L 585 1035" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="640" y="980" width="66" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="673" y="988" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">persists users</text>

                <path d="M 797 965 L 797 1020 L 600 1020 L 600 1035" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="800" y="980" width="84" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="842" y="988" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">persists audit logs</text>

                <path d="M 957 965 L 957 1030 L 615 1030 L 615 1035" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arrow-slate)" />
                <rect x="960" y="980" width="68" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="994" y="988" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">persists alerts</text>
              </svg>
            ) : isThinkSwipe ? (
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
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_visitor', label: 'Visitor', sub: 'End user accessing ThinkSwipe web application', category: 'CLIENT', type: 'USER', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <circle cx="340" cy="40" r="22" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="340" y="44" textAnchor="middle" fill="#1e40af" fontSize="10.5" fontFamily="system-ui, sans-serif" fontWeight="bold">Visitor</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_admin', label: 'Admin User', sub: 'ThinkSwipe system administrator', category: 'CLIENT', type: 'USER', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <circle cx="780" cy="40" r="27" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="780" y="44" textAnchor="middle" fill="#1e40af" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="bold">Admin User</text>
                </g>

                <path d="M 340 62 L 340 135" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="315" y="80" width="50" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="340" y="88" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">opens app</text>

                <path d="M 780 67 L 780 235" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="750" y="80" width="60" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="780" y="88" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">opens admin</text>

                {/* ─── 2. CONTAINER 1: CLIENT EXPERIENCE ─── */}
                <rect x="160" y="105" width="800" height="315" rx="8" fill="#eff6ff" stroke="#bae6fd" strokeWidth="1.5" />
                <text x="560" y="125" textAnchor="middle" fill="#1e40af" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Client Experience</text>

                {/* Top Row: React Bootstrap, Swipe Experience, PWA */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_bootstrap', label: 'React Bootstrap [main.jsx]', sub: 'Vite React 19 application root bootstrap mount', category: 'CLIENT', type: 'REACT_APP', filePath: 'main.jsx', annotations: 'React 19, StrictMode', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="280" y="135" width="120" height="42" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="340" y="152" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">React Bootstrap</text>
                  <text x="340" y="167" textAnchor="middle" fill="#1e40af" fontSize="8.5" fontFamily="ui-monospace, monospace" opacity="0.8">[main.jsx]</text>
                </g>

                <path d="M 400 156 L 470 156" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#ts-arrow-blue)" />
                <rect x="415" y="149" width="40" height="14" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="435" y="157" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">mounts</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_swipe_exp', label: 'Swipe Experience [App.jsx]', sub: 'Tinder-style swipe gestures and question interaction engine', category: 'CLIENT', type: 'REACT_APP', filePath: 'App.jsx', annotations: 'Framer Motion, React Hooks', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="470" y="135" width="120" height="42" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="530" y="152" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Swipe Experience</text>
                  <text x="530" y="167" textAnchor="middle" fill="#1e40af" fontSize="8.5" fontFamily="ui-monospace, monospace" opacity="0.8">[App.jsx]</text>
                </g>

                <path d="M 590 156 L 660 156" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#ts-arrow-blue)" />
                <rect x="605" y="149" width="40" height="14" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="625" y="157" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">registers</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_sw', label: 'PWA Service Worker [sw.js]', sub: 'Progressive Web App offline cache and background sync', category: 'CLIENT', type: 'REACT_APP', filePath: 'sw.js', annotations: 'ServiceWorker, Cache API', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="660" y="135" width="130" height="42" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="725" y="152" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">PWA Service Worker</text>
                  <text x="725" y="167" textAnchor="middle" fill="#1e40af" fontSize="8.5" fontFamily="ui-monospace, monospace" opacity="0.8">[sw.js]</text>
                </g>

                {/* Middle Row: 4 Feature Cards */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_q_search', label: 'Question Search [SearchBar.jsx]', sub: 'Real-time debounced question filtering & tag search', category: 'CLIENT', type: 'FE_VIEW', filePath: 'SearchBar.jsx', annotations: 'Debounce, Lucide Icons', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="180" y="235" width="130" height="42" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="245" y="252" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Question Search</text>
                  <text x="245" y="267" textAnchor="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">[SearchBar.jsx]</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_leaderboard', label: 'Leaderboard UI [Leaderboard.jsx]', sub: 'Rankings leaderboard with live score polling', category: 'CLIENT', type: 'FE_VIEW', filePath: 'Leaderboard.jsx', annotations: 'React Table, Score sorting', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="360" y="235" width="130" height="42" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="425" y="252" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Leaderboard UI</text>
                  <text x="425" y="267" textAnchor="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">[Leaderboard.jsx]</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_admin_panel', label: 'Admin Panel [AdminPanel.jsx]', sub: 'Question CRUD, push notifications & analytics', category: 'CLIENT', type: 'FE_VIEW', filePath: 'AdminPanel.jsx', annotations: 'Admin Auth, CRUD tables', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="715" y="235" width="130" height="42" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="780" y="252" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Admin Panel</text>
                  <text x="780" y="267" textAnchor="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">[AdminPanel.jsx]</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_submissions', label: 'User Submissions [UserSubmit.jsx]', sub: 'Community question proposal & test case editor', category: 'CLIENT', type: 'FE_VIEW', filePath: 'UserSubmit.jsx', annotations: 'CodeMirror Editor, Validation', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="830" y="235" width="120" height="42" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="890" y="252" textAnchor="middle" fill="#1e40af" fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="bold">User Submissions</text>
                  <text x="890" y="267" textAnchor="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">[UserSubmit.jsx]</text>
                </g>

                {/* API Client */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_api_client', label: 'API Client [api.js]', sub: 'Axios HTTP client with interceptors and retry handlers', category: 'CLIENT', type: 'REACT_APP', filePath: 'api.js', annotations: 'Axios, ErrorInterceptor', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="470" y="340" width="120" height="42" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="530" y="357" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">API Client</text>
                  <text x="530" y="372" textAnchor="middle" fill="#1e40af" fontSize="8.5" fontFamily="ui-monospace, monospace" opacity="0.8">[api.js]</text>
                </g>

                {/* Lines into API Client */}
                <path d="M 245 277 L 245 361 L 470 361" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#ts-arrow-blue)" />
                <rect x="270" y="354" width="45" height="14" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="292" y="362" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">searches</text>

                <path d="M 425 277 L 425 350 L 470 350" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#ts-arrow-blue)" />
                <rect x="390" y="310" width="70" height="14" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="425" y="318" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">loads rankings</text>

                <path d="M 780 277 L 780 350 L 590 350" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#ts-arrow-blue)" />
                <rect x="665" y="343" width="60" height="14" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="695" y="351" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">admin calls</text>

                <path d="M 890 277 L 890 361 L 590 361" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#ts-arrow-blue)" />
                <rect x="790" y="354" width="45" height="14" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="812" y="362" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">submits</text>

                {/* ─── 3. CONTAINER 2: EDGE DELIVERY ─── */}
                <rect x="450" y="470" width="160" height="100" rx="8" fill="#fffbeb" stroke="#fde047" strokeWidth="1.5" />
                <text x="530" y="490" textAnchor="middle" fill="#854d0e" fontSize="10.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Edge Delivery</text>

                <path d="M 530 382 L 530 505" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="508" y="420" width="44" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="530" y="428" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">proxies</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_edge_proxy', label: 'Edge Proxy [worker.js]', sub: 'Cloudflare Worker proxying API traffic & caching assets', category: 'API_ACCESS', type: 'PROXY', filePath: 'worker.js', annotations: 'Cloudflare Workers, Edge Cache', color: '#854d0e', bg: '#fef9c3', border: '#fde047' })}>
                  <rect x="470" y="505" width="120" height="42" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="530" y="522" textAnchor="middle" fill="#854d0e" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Edge Proxy</text>
                  <text x="530" y="537" textAnchor="middle" fill="#854d0e" fontSize="8.5" fontFamily="ui-monospace, monospace" opacity="0.8">[worker.js]</text>
                </g>

                {/* ─── 4. SPRING BOOT REST API ─── */}
                <path d="M 530 547 L 530 615" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="500" y="575" width="60" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="530" y="583" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">Spring API</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_spring_app', label: 'Spring Boot REST API', sub: 'Java 21 Spring Boot Backend Service Application', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'ThinkSwipeApplication.java', annotations: '@SpringBootApplication, @EnableScheduling', color: '#854d0e', bg: '#fef9c3', border: '#fde047' })}>
                  <rect x="460" y="615" width="140" height="38" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="530" y="638" textAnchor="middle" dominantBaseline="middle" fill="#854d0e" fontSize="10.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Spring Boot API</text>
                </g>

                {/* ─── 5. CONTAINER 3: PRACTICE DOMAIN ─── */}
                <rect x="140" y="715" width="550" height="185" rx="8" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1.5" />
                <text x="415" y="735" textAnchor="middle" fill="#15803d" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Practice Domain</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_q_ctrl', label: 'Question Controller', sub: 'REST endpoints for question retrieval and random cards', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'QuestionController.java', annotations: '@RestController, @RequestMapping("/api/questions")', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="160" y="755" width="120" height="36" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="220" y="777" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Question Controller</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_ans_ctrl', label: 'Answer Controller', sub: 'REST endpoint receiving user code submissions', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'AnswerController.java', annotations: '@RestController, @RequestMapping("/api/answers")', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="295" y="755" width="120" height="36" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="355" y="777" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Answer Controller</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_sub_ctrl', label: 'Submission Controller', sub: 'Community proposed questions queue and review', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'SubmissionController.java', annotations: '@RestController, @RequestMapping("/api/submissions")', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="430" y="755" width="120" height="36" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="490" y="777" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Submission Controller</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_lead_ctrl', label: 'Leaderboard Controller', sub: 'Rankings leaderboard endpoint with cached scores', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'LeaderboardController.java', annotations: '@RestController, @RequestMapping("/api/leaderboard")', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="565" y="755" width="120" height="36" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="625" y="777" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Leaderboard Controller</text>
                </g>

                <path d="M 220 791 L 220 835" fill="none" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#ts-arrow-green)" />
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_q_srv', label: 'Question Service', sub: 'Question catalog cache and difficulty selector', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'QuestionService.java', annotations: '@Service', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="165" y="835" width="110" height="36" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="220" y="857" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">Question Service</text>
                </g>

                <path d="M 355 791 L 355 835" fill="none" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#ts-arrow-green)" />
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_ans_srv', label: 'Answer Service [AnswerService.java]', sub: 'Core evaluation engine validating user submissions', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'AnswerService.java', annotations: '@Service, @Transactional', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="290" y="835" width="130" height="42" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="355" y="852" textAnchor="middle" fill="#15803d" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">Answer Service</text>
                  <text x="355" y="866" textAnchor="middle" fill="#15803d" fontSize="8.5" fontFamily="ui-monospace, monospace" opacity="0.8">[AnswerService.java]</text>
                </g>

                {/* ─── 6. CONTAINER 4: ADMIN OPERATIONS ─── */}
                <rect x="715" y="755" width="245" height="110" rx="8" fill="#fff1f2" stroke="#fecdd3" strokeWidth="1.5" />
                <text x="837" y="775" textAnchor="middle" fill="#be123c" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Admin Operations</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_admin_ctrl', label: 'Admin Controller', sub: 'Administrative management endpoints & user subscriptions', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'AdminController.java', annotations: '@RestController, @PreAuthorize', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="730" y="795" width="105" height="36" rx="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="782" y="817" textAnchor="middle" dominantBaseline="middle" fill="#be123c" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Admin Controller</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_push_ctrl', label: 'Push Controller', sub: 'Web push notification dispatcher & subscription store', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'PushController.java', annotations: '@RestController, @RequestMapping("/api/push")', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="845" y="795" width="105" height="36" rx="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="897" y="817" textAnchor="middle" dominantBaseline="middle" fill="#be123c" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Push Controller</text>
                </g>

                {/* ─── 7. EXTERNAL INTEGRATIONS ─── */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_jdoodle', label: 'JDoodle API', sub: 'External Compiler & Code Execution Engine API', category: 'EXTERNAL', type: 'EXTERNAL', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="155" y="965" width="90" height="36" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="200" y="987" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">JDoodle API</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_web_push', label: 'Web Push Service', sub: 'VAPID Web Push Protocol & Browser Notification Delivery', category: 'EXTERNAL', type: 'EXTERNAL', color: '#3730a3', bg: '#e0e7ff', border: '#6366f1' })}>
                  <rect x="840" y="965" width="115" height="36" rx="4" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" className="transition group-hover:stroke-indigo-600" />
                  <text x="897" y="987" textAnchor="middle" dominantBaseline="middle" fill="#3730a3" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">Web Push Service</text>
                </g>

                {/* ─── 8. CONTAINER 5: PERSISTENCE (TiDB Cluster) ─── */}
                <rect x="520" y="955" width="140" height="235" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="590" y="972" textAnchor="middle" fill="#64748b" fontSize="10.5" fontFamily="ui-monospace, monospace" fontWeight="600">Persistence</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_jpa', label: 'JPA Repositories', sub: 'Spring Data JPA Repository Interfaces & Entities', category: 'PERSISTENCE', type: 'JPA_REPO', color: '#1e40af', bg: '#dbeafe', border: '#60a5fa' })}>
                  <rect x="535" y="980" width="110" height="32" rx="4" fill="#dbeafe" stroke="#60a5fa" strokeWidth="1.5" className="transition group-hover:stroke-blue-600" />
                  <text x="590" y="1000" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">JPA Repositories</text>
                </g>

                <path d="M 590 1012 L 590 1045" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arrow-slate)" />
                <rect x="570" y="1022" width="40" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="590" y="1030" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">persists</text>

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
                 DYNAMIC GENERIC CODEBASE ARCHITECTURE CANVAS (FOR ANY INGESTED REPO)
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
                </defs>

                {/* 1. Dynamic Actor */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'dynamic_actor', label: actorLabel, sub: `End users interacting with ${formattedProjectName}`, category: 'CLIENT', type: 'USER', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="450" y="20" width="220" height="42" rx="21" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="560" y="45" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="11.5" fontFamily="system-ui, sans-serif" fontWeight="bold">{actorLabel}</text>
                </g>

                <path d="M 560 62 L 560 115" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
                <rect x="540" y="80" width="40" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="560" y="88" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">uses</text>

                {/* 2. Client Tier */}
                <rect x="160" y="115" width="800" height="150" rx="8" fill="#eff6ff" stroke="#bae6fd" strokeWidth="1.5" />
                <text x="560" y="135" textAnchor="middle" fill="#1e40af" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Client Experience</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'fe_root', label: `${formattedProjectName} App [App.jsx]`, sub: `Frontend UI application layer for ${formattedProjectName}`, category: 'CLIENT', type: 'REACT_APP', filePath: 'src/App.jsx', annotations: 'React 19, Vite', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="470" y="155" width="180" height="42" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="560" y="172" textAnchor="middle" fill="#1e40af" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">{formattedProjectName} UI</text>
                  <text x="560" y="187" textAnchor="middle" fill="#1e40af" fontSize="8.5" fontFamily="ui-monospace, monospace" opacity="0.8">[App.jsx]</text>
                </g>

                {/* 3. API & Gateway Tier */}
                <rect x="360" y="320" width="400" height="140" rx="8" fill="#fffbeb" stroke="#fde047" strokeWidth="1.5" />
                <text x="560" y="340" textAnchor="middle" fill="#854d0e" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">API & Security Gateway</text>

                <path d="M 560 265 L 560 355" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
                <rect x="525" y="295" width="70" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="560" y="303" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">sends requests</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'be_api', label: `${formattedProjectName} REST API`, sub: `Spring Boot application endpoints`, category: 'API_ACCESS', type: 'DOMAIN_CONTROLLER', filePath: 'Application.java', annotations: '@SpringBootApplication', color: '#854d0e', bg: '#fef9c3', border: '#fde047' })}>
                  <rect x="470" y="360" width="180" height="38" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="560" y="383" textAnchor="middle" dominantBaseline="middle" fill="#854d0e" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">{formattedProjectName} REST API</text>
                </g>

                {/* 4. Domain Workflows Container */}
                <rect x="80" y="520" width="960" height="180" rx="8" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1.5" />
                <text x="560" y="542" textAnchor="middle" fill="#15803d" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Domain Workflows ({domainWorkflows.length})</text>

                <path d="M 560 460 L 560 560" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
                <rect x="530" y="490" width="60" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="560" y="498" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">dispatches</text>

                {domainWorkflows.slice(0, 5).map((dw, i) => {
                  const x = 110 + i * 185;
                  return (
                    <g key={dw.name} className="cursor-pointer group" onClick={() => setSelectedNode({ id: `dw_${i}`, label: dw.name, sub: `Active domain workflow with ${dw.count} endpoints`, category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                      <rect x={x} y="570" width="165" height="42" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                      <text x={x + 82} y="591" textAnchor="middle" fill="#15803d" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">{dw.name.replace(' Workflows', '')}</text>
                      <text x={x + 82} y="604" textAnchor="middle" fill="#15803d" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">{dw.count} controllers</text>
                    </g>
                  );
                })}

                {/* 5. Persistence Container */}
                <rect x="260" y="760" width="600" height="180" rx="8" fill="#fff1f2" stroke="#fecdd3" strokeWidth="1.5" />
                <text x="560" y="782" textAnchor="middle" fill="#be123c" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Persistence & Data Layer</text>

                <path d="M 560 700 L 560 800" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
                <rect x="525" y="730" width="70" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="560" y="738" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">reads / writes</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'jpa_gen', label: 'JPA Repositories', sub: 'Spring Data JPA interfaces & entity persistence', category: 'PERSISTENCE', type: 'JPA_REPO', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="360" y="805" width="400" height="38" rx="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="560" y="828" textAnchor="middle" dominantBaseline="middle" fill="#be123c" fontSize="10.5" fontFamily="ui-monospace, monospace" fontWeight="bold">JPA Repositories & Data Access</text>
                </g>

                <path d="M 560 843 L 560 875" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'db_gen', label: 'Primary Database', sub: 'Relational database schema storing persistent state', category: 'PERSISTENCE', type: 'DATABASE', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="470" y="875" width="180" height="42" rx="10" fill="#fee2e2" stroke="#f87171" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="560" y="900" textAnchor="middle" dominantBaseline="middle" fill="#be123c" fontSize="10.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Primary Database</text>
                </g>
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
