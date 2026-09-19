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
  Activity, RefreshCw, GitBranch, Wrench, Play, Pause
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
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);
  const [animSpeed, setAnimSpeed] = useState<'normal' | 'fast' | 'slow'>('normal');
  const [isPlayingFlow, setIsPlayingFlow] = useState(false);

  // Autoplay step simulation timer
  useEffect(() => {
    if (!isPlayingFlow || flowSteps.length === 0) return;
    const interval = setInterval(() => {
      onSelectStep((activeStepIndex + 1) % flowSteps.length);
    }, animSpeed === 'fast' ? 1200 : animSpeed === 'slow' ? 3000 : 2000);
    return () => clearInterval(interval);
  }, [isPlayingFlow, activeStepIndex, flowSteps.length, animSpeed, onSelectStep]);

  const flowSpeedSec = animSpeed === 'fast' ? '0.7s' : animSpeed === 'slow' ? '2.5s' : '1.3s';

  const canvasRef = useRef<HTMLDivElement>(null);

  const isLight = currentTheme === 'NORMAL' || currentTheme === 'GLASSMORPHISM' || currentTheme === 'NEUMORPHIC';

  const nodes = Array.isArray(graphData.nodes) ? graphData.nodes : [];
  const edges = Array.isArray(graphData.edges) ? graphData.edges : [];

  // STRICT REPOSITORY ROUTING:
  const isCoral = useMemo(() => {
    const p = (projectName || '').toLowerCase();
    return p === 'coral' || p === 'withcoral' || p.includes('coral') || p.includes('withcoral');
  }, [projectName]);

  const isTrustLocker = useMemo(() => {
    const p = (projectName || '').toLowerCase();
    return p === 'trustlocker' || p === 'trust-locker' || p.includes('trustlocker');
  }, [projectName]);

  const isThinkSwipe = useMemo(() => {
    const p = (projectName || '').toLowerCase();
    return p === 'thinkswipe' || p === 'think-swipe' || p.includes('thinkswipe');
  }, [projectName]);

  const isVps = useMemo(() => {
    const p = (projectName || '').toLowerCase();
    return p === 'vps' || p.includes('visionpublicschool') || p.includes('school');
  }, [projectName]);

  // Dynamic AST grouping for any custom repository
  const dynamicArchitecture = useMemo(() => {
    // 1. Group nodes by semantic layer or file extension/directory
    const clientNodes: any[] = [];
    const apiNodes: any[] = [];
    const domainNodes: any[] = [];
    const storageNodes: any[] = [];
    const externalNodes: any[] = [];

    nodes.forEach(n => {
      const label = n.data?.label || n.id || '';
      const path = (n.data?.filePath || '').toLowerCase();
      const nodeType = (n.data?.nodeType || '').toLowerCase();
      const layer = (n.data?.layer || '').toLowerCase();

      if (layer === 'frontend' || path.endsWith('.tsx') || path.endsWith('.jsx') || path.includes('ui') || path.includes('client') || path.includes('component')) {
        clientNodes.push(n);
      } else if (nodeType.includes('controller') || path.includes('controller') || path.includes('api') || path.includes('route') || path.includes('server')) {
        apiNodes.push(n);
      } else if (layer === 'database' || nodeType.includes('repository') || nodeType.includes('entity') || path.includes('repo') || path.includes('model') || path.includes('db') || path.includes('store')) {
        storageNodes.push(n);
      } else if (layer === 'external' || path.includes('client') || path.includes('integration') || path.includes('provider')) {
        externalNodes.push(n);
      } else {
        domainNodes.push(n);
      }
    });

    return {
      clientNodes: clientNodes.slice(0, 6),
      apiNodes: apiNodes.slice(0, 6),
      domainNodes: domainNodes.slice(0, 6),
      storageNodes: storageNodes.slice(0, 4),
      externalNodes: externalNodes.slice(0, 3)
    };
  }, [nodes]);

  const selAnnotations = useMemo(() => {
    if (!selectedNode?.annotations) return [];
    return getAnnotationDetails(selectedNode.annotations);
  }, [selectedNode]);

  const selQA = useMemo(() => {
    if (!selectedNode) return [];
    return getInterviewQuestionsForNode(selectedNode.type);
  }, [selectedNode]);

  const formattedProjectName = isCoral ? 'withcoral/coral' : isTrustLocker ? 'TrustLocker' : isThinkSwipe ? 'ThinkSwipe' : isVps ? 'Vision Public School' : projectName || 'Repository Architecture';

  return (
    <div className={`flex flex-col h-full w-full relative overflow-hidden select-none ${isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#0b0f17] text-slate-100'}`}>
      {/* ─── TOP CANVAS TOOLBAR ─── */}
      <div className="flex items-center justify-between px-3 py-2 border-b-2 border-black dark:border-slate-800 bg-white dark:bg-slate-900 z-10 gap-2 flex-wrap shadow-sm">
        {/* Pill 1: Breadcrumb */}
        <div className="relative">
          <button
            onClick={() => { setIsActivityMenuOpen(!isActivityMenuOpen); setIsExportMenuOpen(false); setIsAllToolsOpen(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-bold bg-white text-slate-900 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-purple-50 transition cursor-pointer dark:bg-slate-900 dark:text-white dark:border-slate-700"
          >
            <GitBranch className="w-3.5 h-3.5 text-purple-600" />
            <span className="truncate max-w-[140px] sm:max-w-[200px]">{formattedProjectName}</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>
          {isActivityMenuOpen && (
            <div className="absolute left-0 mt-2 w-56 rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 p-2 space-y-1 dark:bg-slate-900 dark:border-slate-700 text-xs font-mono">
              <div className="px-2 py-1 text-[10px] text-slate-400 font-bold uppercase">Architecture Tiers</div>
              <div className="px-2 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-slate-800 flex items-center justify-between">
                <span>Total Nodes</span>
                <span className="font-bold text-purple-600">{nodes.length || 18}</span>
              </div>
              <div className="px-2 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-slate-800 flex items-center justify-between">
                <span>Interactions & Edges</span>
                <span className="font-bold text-rose-600">{edges.length || 24}</span>
              </div>
            </div>
          )}
        </div>

        {/* Pill 2: Flow Animation Controls */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold bg-white text-slate-900 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:bg-slate-900 dark:text-white dark:border-slate-700">
          <button
            onClick={() => setIsAnimationEnabled(!isAnimationEnabled)}
            className="flex items-center gap-1.5 hover:text-purple-600 transition cursor-pointer"
            title="Toggle Live Flow Animation"
          >
            <span className={`w-2 h-2 rounded-full ${isAnimationEnabled ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
            <span className={`w-2 h-2 rounded-full -ml-3.5 ${isAnimationEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <span className="text-[11px]">{isAnimationEnabled ? 'Flow Live' : 'Flow Paused'}</span>
          </button>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
          <button
            onClick={() => {
              setAnimSpeed(animSpeed === 'normal' ? 'fast' : animSpeed === 'fast' ? 'slow' : 'normal');
            }}
            className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-[10px] uppercase hover:bg-purple-200 transition cursor-pointer"
            title="Change Animation Speed"
          >
            {animSpeed} ({animSpeed === 'fast' ? '2x' : animSpeed === 'slow' ? '0.5x' : '1x'})
          </button>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
          <button
            onClick={() => setIsPlayingFlow(!isPlayingFlow)}
            className={`px-2 py-0.5 rounded text-[10.5px] transition cursor-pointer font-bold ${
              isPlayingFlow ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
            title="Simulate continuous request flow across layers"
          >
            {isPlayingFlow ? '⏹ Stop' : '▶ Step Sim'}
          </button>
        </div>

        {/* Pill 3: Zoom Controls */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:bg-slate-900 dark:border-slate-700">
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.4))}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-xs font-bold px-1 min-w-[3rem] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 2.0))}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-900 transition cursor-pointer ml-1 border-l border-slate-200 dark:border-slate-700 pl-2"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Pill 4: Export Menu */}
        <div className="relative">
          <button
            onClick={() => { setIsExportMenuOpen(!isExportMenuOpen); setIsActivityMenuOpen(false); setIsAllToolsOpen(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-bold bg-white text-slate-900 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-purple-50 transition cursor-pointer dark:bg-slate-900 dark:text-white dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-purple-600" />
            <span>Export</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>
          {isExportMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 p-2 space-y-1 dark:bg-slate-900 dark:border-slate-700 text-xs font-mono">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                  setIsExportMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
              >
                <span>{copied ? 'Copied Link!' : 'Copy Share Link'}</span>
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              </button>
              <button
                onClick={() => {
                  onOpenTool?.('blueprint');
                  setIsExportMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
              >
                <span>Export SVG / PNG</span>
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
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-bold bg-purple-600 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-purple-700 transition cursor-pointer"
          style={{ backgroundColor: '#9333ea', color: '#ffffff' }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Regenerate</span>
        </button>

        {/* Pill 6: Studio Tools Launcher */}
        <button
          onClick={() => { setIsAllToolsOpen(!isAllToolsOpen); setIsActivityMenuOpen(false); setIsExportMenuOpen(false); }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-bold bg-white text-slate-900 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-purple-50 transition cursor-pointer dark:bg-slate-900 dark:text-white dark:border-slate-700"
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">AI & Architecture Intelligence (6)</h3>
                  <span className="text-[10px] font-mono text-slate-400">Analysis & Insights</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  <ToolCard icon="🤖" label="AI Assistant" desc="Deep architectural analysis & review" onClick={() => { onOpenTool?.('ai'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="🎙️" label="Voice Copilot" desc="Voice-guided interactive navigation" onClick={() => { onOpenTool?.('voice'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="⚡" label="Command Palette" desc="Global action search & shortcuts" onClick={() => { onOpenTool?.('cmd'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="📊" label="Architecture Scorecard" desc="Maintainability & security grades" onClick={() => { onOpenTool?.('scorecard'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="🔀" label="Architecture Drift" desc="Detect drift vs codebase spec" onClick={() => { onOpenTool?.('drift'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="📋" label="Architecture Blueprint" desc="Export 4K C4 spec & Mermaid" onClick={() => { onOpenTool?.('blueprint'); setIsAllToolsOpen(false); }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Database, Tracing & Performance (8)</h3>
                  <span className="text-[10px] font-mono text-slate-400">Observability & Schemas</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  <ToolCard icon="🗄️" label="ER Diagram" desc="Interactive visual database schema" onClick={() => { onOpenTool?.('erd'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="🔍" label="SQL Explorer" desc="Live query plans & JPA optimizations" onClick={() => { onOpenTool?.('sql'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="🛡️" label="Security Explorer" desc="JWT validation & RBAC permission audit" onClick={() => { onOpenTool?.('security'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="⏱️" label="Runtime Tracing" desc="Microsecond-accurate call stack traces" onClick={() => { onOpenTool?.('trace'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="📈" label="Distributed Tracing" desc="OpenTelemetry multi-service waterfall" onClick={() => { onOpenTool?.('dist-tracing'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="📊" label="API Metrics" desc="Live throughput, p99 latency & SLAs" onClick={() => { onOpenTool?.('metrics'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="🔥" label="Latency Heatmap" desc="24-hour quantile matrix & spikes" onClick={() => { onOpenTool?.('heatmap'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="⚡" label="Sequence Diagram" desc="7-Swimlane async request lifecycle" onClick={() => { onOpenTool?.('sequence'); setIsAllToolsOpen(false); }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Infrastructure, Cloud & Resilience (6)</h3>
                  <span className="text-[10px] font-mono text-slate-400">Cloud & Zero-Trust</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  <ToolCard icon="🌐" label="Cloud Infra Synthesizer" desc="Auto-generate Docker, Terraform & K8s" onClick={() => { onOpenTool?.('cloud'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="📡" label="Event Stream Visualizer" desc="Kafka & WebSocket reactive topology" onClick={() => { onOpenTool?.('events'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="🕸️" label="Service Mesh & Istio" desc="mTLS, circuit breaker & Envoy proxies" onClick={() => { onOpenTool?.('mesh'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="💥" label="Chaos Simulator" desc="Latency injection & circuit breakers" onClick={() => { onOpenTool?.('chaos'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="🛡️" label="Compliance Matrix" desc="Zero-Trust SOC2 & HIPAA controls" onClick={() => { onOpenTool?.('compliance'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="⚡" label="GraphQL & gRPC Explorer" desc="Protobuf v3 & GraphQL schema synthesizer" onClick={() => { onOpenTool?.('graphql-grpc'); setIsAllToolsOpen(false); }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Developer Experience, Code Gen & Integrations (9)</h3>
                  <span className="text-[10px] font-mono text-slate-400">DevTools & Workspaces</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  <ToolCard icon="🧪" label="API Sandbox" desc="Test Spring REST endpoints with payloads" onClick={() => { onOpenTool?.('sandbox'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="📘" label="TypeScript Generator" desc="Generate strict DTO interfaces & Zod" onClick={() => { onOpenTool?.('tsgen'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="🔬" label="Test Suite Generator" desc="RestAssured & Playwright test scaffolds" onClick={() => { onOpenTool?.('tests'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="📁" label="File Tree Explorer" desc="Interactive project directory explorer" onClick={() => { onOpenTool?.('filetree'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="⚛️" label="React Runtime Explorer" desc="Fiber tree reconciliation & Hook profiler" onClick={() => { onOpenTool?.('react'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="📦" label="Dependency Explorer" desc="Maven POM dependencies & CVE audit" onClick={() => { onOpenTool?.('deps'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="💻" label="VS Code Extension" desc="Live architecture sidecar in VS Code" onClick={() => { onOpenTool?.('vscode'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="🌐" label="Chrome Extension" desc="GitHub DOM layer & badge injector" onClick={() => { onOpenTool?.('chrome-ext'); setIsAllToolsOpen(false); }} />
                  <ToolCard icon="👥" label="Live Collaboration" desc="Real-time multi-user cursor & whiteboard" onClick={() => { onOpenTool?.('collab'); setIsAllToolsOpen(false); }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MAIN VERTICAL ARCHITECTURE CANVAS ─── */}
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
            {isCoral ? (
              /* ═══════════════════════════════════════════════════════════════════
                 WITHCORAL/CORAL ARCHITECTURE CANVAS (100% EXACT GITDIAGRAM AST)
                 ═══════════════════════════════════════════════════════════════════ */
              <svg
                viewBox="0 0 1140 1450"
                className="w-full h-auto drop-shadow-sm select-none"
                style={{ minWidth: '320px', maxWidth: '1140px' }}
              >
                <defs>
                  <style>{`
                    @keyframes flowForward {
                      from { stroke-dashoffset: 24; }
                      to { stroke-dashoffset: 0; }
                    }
                    .flow-line {
                      stroke-dasharray: ${isAnimationEnabled ? '6 4' : 'none'};
                      animation: ${isAnimationEnabled ? `flowForward ${flowSpeedSec} linear infinite` : 'none'};
                    }
                  `}</style>

                  <marker id="coral-arr-slate" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" /></marker>
                  <marker id="coral-arr-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" /></marker>
                  <marker id="coral-arr-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#22c55e" /></marker>
                  <marker id="coral-arr-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#eab308" /></marker>
                  <marker id="coral-arr-rose" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e" /></marker>
                </defs>

                {/* 1. TOP ACTORS */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'coral_agent', label: 'Agent', sub: 'Autonomous AI Coding Agent communicating via Model Context Protocol (MCP)', category: 'CLIENT', type: 'USER', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <circle cx="380" cy="50" r="22" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="380" y="54" textAnchor="middle" fill="#1e40af" fontSize="10.5" fontFamily="system-ui, sans-serif" fontWeight="bold">Agent</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'coral_desktop_user', label: 'Desktop User', sub: 'Human developer interacting with Coral UI desktop application', category: 'CLIENT', type: 'USER', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <circle cx="470" cy="50" r="26" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="470" y="54" textAnchor="middle" fill="#1e40af" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="bold">Desktop User</text>
                </g>

                <path d="M 380 72 L 380 185" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#coral-arr-slate)" className="flow-line" />
                <rect x="355" y="115" width="50" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="380" y="123" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">sends SQL</text>

                <path d="M 470 76 L 470 185" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#coral-arr-slate)" className="flow-line" />
                <rect x="448" y="115" width="44" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="470" y="123" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">uses app</text>

                {/* 2. USER INTERFACES CONTAINER */}
                <rect x="345" y="155" width="530" height="190" rx="8" fill="#eff6ff" stroke="#bae6fd" strokeWidth="1.5" />
                <text x="610" y="172" textAnchor="middle" fill="#1e40af" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">User Interfaces</text>

                {/* MCP Server */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'coral_mcp', label: 'MCP Server [server.rs]', sub: 'Model Context Protocol server exposing database inspection tools', category: 'CLIENT', type: 'REACT_APP', filePath: 'crates/mcp/src/server.rs', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="355" y="185" width="60" height="34" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="385" y="198" textAnchor="middle" fill="#1e40af" fontSize="8.5" fontFamily="ui-monospace, monospace" fontWeight="bold">MCP Server</text>
                  <text x="385" y="209" textAnchor="middle" fill="#1e40af" fontSize="7" fontFamily="ui-monospace, monospace" opacity="0.8">[server.rs]</text>
                </g>

                {/* Coral UI */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'coral_ui', label: 'Coral UI [app-shell.tsx]', sub: 'React Desktop GUI shell and tool orchestrator', category: 'CLIENT', type: 'REACT_APP', filePath: 'apps/desktop/src/app-shell.tsx', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="435" y="185" width="70" height="34" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="470" y="198" textAnchor="middle" fill="#1e40af" fontSize="8.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Coral UI</text>
                  <text x="470" y="209" textAnchor="middle" fill="#1e40af" fontSize="7" fontFamily="ui-monospace, monospace" opacity="0.8">[app-shell.tsx]</text>
                </g>

                {/* 5 Child UI Screens */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'coral_ws_ui', label: 'Workspace Management', sub: 'Workspace project switcher and configuration', category: 'CLIENT', type: 'FE_VIEW', filePath: 'apps/desktop/src/workspaces.tsx', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="398" y="275" width="98" height="34" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="447" y="295" textAnchor="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="bold">Workspace Management</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'coral_src_ui', label: 'Source Management [sources-index.tsx]', sub: 'Data source connection manager (Postgres, MySQL, Snowflake)', category: 'CLIENT', type: 'FE_VIEW', filePath: 'apps/desktop/src/sources-index.tsx', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="506" y="275" width="88" height="34" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="550" y="289" textAnchor="middle" fill="#1e40af" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Source Management</text>
                  <text x="550" y="299" textAnchor="middle" fill="#1e40af" fontSize="6.5" fontFamily="ui-monospace, monospace" opacity="0.8">[sources-index.tsx]</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'coral_fn_ui', label: 'Function Explorer', sub: 'SQL and Python analytical function explorer', category: 'CLIENT', type: 'FE_VIEW', filePath: 'apps/desktop/src/functions.tsx', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="604" y="275" width="80" height="34" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="644" y="295" textAnchor="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="bold">Function Explorer</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'coral_tr_ui', label: 'Trace Inspection [traces-index.tsx]', sub: 'Distributed query timeline & span inspector', category: 'CLIENT', type: 'FE_VIEW', filePath: 'apps/desktop/src/traces-index.tsx', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="694" y="275" width="80" height="34" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="734" y="289" textAnchor="middle" fill="#1e40af" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Trace Inspection</text>
                  <text x="734" y="299" textAnchor="middle" fill="#1e40af" fontSize="6.5" fontFamily="ui-monospace, monospace" opacity="0.8">[traces-index.tsx]</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'coral_sch_ui', label: 'Schema Explorer [schema.tsx]', sub: 'Live relational schema metadata and table viewer', category: 'CLIENT', type: 'FE_VIEW', filePath: 'apps/desktop/src/schema.tsx', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="784" y="275" width="76" height="34" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="822" y="289" textAnchor="middle" fill="#1e40af" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Schema Explorer</text>
                  <text x="822" y="299" textAnchor="middle" fill="#1e40af" fontSize="6.5" fontFamily="ui-monospace, monospace" opacity="0.8">[schema.tsx]</text>
                </g>

                {/* Coral UI Dispatches to 5 Screens */}
                <path d="M 447 219 L 447 275" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#coral-arr-blue)" className="flow-line" />
                <rect x="420" y="240" width="54" height="12" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="447" y="247" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="6.5" fontFamily="ui-monospace, monospace" fontWeight="600">opens workspaces</text>

                <path d="M 460 219 L 460 238 L 550 238 L 550 275" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#coral-arr-blue)" className="flow-line" />
                <rect x="528" y="240" width="44" height="12" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="550" y="247" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="6.5" fontFamily="ui-monospace, monospace" fontWeight="600">opens sources</text>

                <path d="M 470 219 L 470 230 L 644 230 L 644 275" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#coral-arr-blue)" className="flow-line" />
                <rect x="620" y="240" width="48" height="12" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="644" y="247" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="6.5" fontFamily="ui-monospace, monospace" fontWeight="600">opens functions</text>

                <path d="M 480 219 L 480 225 L 734 225 L 734 275" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#coral-arr-blue)" className="flow-line" />
                <rect x="714" y="240" width="40" height="12" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="734" y="247" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="6.5" fontFamily="ui-monospace, monospace" fontWeight="600">opens traces</text>

                <path d="M 490 219 L 490 220 L 822 220 L 822 275" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#coral-arr-blue)" className="flow-line" />
                <rect x="800" y="240" width="44" height="12" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="822" y="247" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="6.5" fontFamily="ui-monospace, monospace" fontWeight="600">opens schema</text>

                {/* 3. SOURCES AND STATE CONTAINER (Left Green Box) */}
                <rect x="125" y="420" width="290" height="205" rx="8" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.5" />
                <text x="270" y="438" textAnchor="middle" fill="#15803d" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Sources And State</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'coral_src_mgr', label: 'Source Manager [manager.rs]', sub: 'Data source credential and connection manager', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'crates/sources/src/manager.rs', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="132" y="455" width="75" height="34" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="169" y="468" textAnchor="middle" fill="#15803d" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Source Manager</text>
                  <text x="169" y="478" textAnchor="middle" fill="#15803d" fontSize="6.5" fontFamily="ui-monospace, monospace" opacity="0.8">[manager.rs]</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'coral_ws_mgr', label: 'Workspace Manager [manager.rs]', sub: 'Workspace directory state and metadata coordinator', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'crates/workspaces/src/manager.rs', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="235" y="455" width="85" height="34" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="277" y="468" textAnchor="middle" fill="#15803d" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Workspace Manager</text>
                  <text x="277" y="478" textAnchor="middle" fill="#15803d" fontSize="6.5" fontFamily="ui-monospace, monospace" opacity="0.8">[manager.rs]</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'coral_fn_mgr', label: 'Function Manager [manager.rs]', sub: 'Catalog manager for user-defined SQL and Python functions', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'crates/functions/src/manager.rs', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="330" y="455" width="80" height="34" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="370" y="468" textAnchor="middle" fill="#15803d" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Function Manager</text>
                  <text x="370" y="478" textAnchor="middle" fill="#15803d" fontSize="6.5" fontFamily="ui-monospace, monospace" opacity="0.8">[manager.rs]</text>
                </g>

                {/* Storage Cylinders in Sources and State */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'coral_cred_store', label: 'Credential Store [manager.rs]', sub: 'Encrypted local key-value store for DB passwords and API keys', category: 'PERSISTENCE', type: 'DATABASE', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="130" y="565" width="55" height="42" rx="8" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="157" y="583" textAnchor="middle" fill="#15803d" fontSize="7" fontFamily="ui-monospace, monospace" fontWeight="bold">Credential Store</text>
                  <text x="157" y="594" textAnchor="middle" fill="#15803d" fontSize="6" fontFamily="ui-monospace, monospace" opacity="0.8">[manager.rs]</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'coral_loc_state', label: 'Local State [manager.rs]', sub: 'SQLite / JSON local metadata persistence engine', category: 'PERSISTENCE', type: 'DATABASE', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="255" y="565" width="45" height="42" rx="8" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="277" y="583" textAnchor="middle" fill="#15803d" fontSize="7" fontFamily="ui-monospace, monospace" fontWeight="bold">Local State</text>
                  <text x="277" y="594" textAnchor="middle" fill="#15803d" fontSize="6" fontFamily="ui-monospace, monospace" opacity="0.8">[manager.rs]</text>
                </g>

                {/* Internal Connections in Sources and State */}
                <path d="M 157 489 L 157 565" fill="none" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#coral-arr-green)" className="flow-line" />
                <rect x="130" y="515" width="54" height="12" rx="2" fill="#ffffff" stroke="#bbf7d0" strokeWidth="1" />
                <text x="157" y="522" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="6.5" fontFamily="ui-monospace, monospace" fontWeight="600">stores credentials</text>

                <path d="M 185 489 L 185 535 L 265 535 L 265 565" fill="none" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#coral-arr-green)" className="flow-line" />
                <rect x="190" y="515" width="48" height="12" rx="2" fill="#ffffff" stroke="#bbf7d0" strokeWidth="1" />
                <text x="214" y="522" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="6.5" fontFamily="ui-monospace, monospace" fontWeight="600">updates sources</text>

                <path d="M 277 489 L 277 565" fill="none" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#coral-arr-green)" className="flow-line" />
                <rect x="250" y="515" width="58" height="12" rx="2" fill="#ffffff" stroke="#bbf7d0" strokeWidth="1" />
                <text x="279" y="522" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="6.5" fontFamily="ui-monospace, monospace" fontWeight="600">updates workspaces</text>

                <path d="M 370 489 L 370 535 L 290 535 L 290 565" fill="none" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#coral-arr-green)" className="flow-line" />
                <rect x="335" y="515" width="48" height="12" rx="2" fill="#ffffff" stroke="#bbf7d0" strokeWidth="1" />
                <text x="359" y="522" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="6.5" fontFamily="ui-monospace, monospace" fontWeight="600">stores functions</text>

                {/* MCP Server to Function Manager */}
                <path d="M 395 219 L 395 455" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#coral-arr-slate)" className="flow-line" />
                <rect x="365" y="375" width="60" height="12" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="395" y="382" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="6.5" fontFamily="ui-monospace, monospace" fontWeight="600">manages functions</text>

                {/* 4. QUERY RUNTIME CONTAINER (Middle Amber Box) */}
                <rect x="355" y="680" width="180" height="235" rx="8" fill="#fffbeb" stroke="#fde047" strokeWidth="1.5" />
                <text x="445" y="698" textAnchor="middle" fill="#854d0e" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Query Runtime</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'coral_qry_srv', label: 'Query Service [manager.rs]', sub: 'Federated SQL query compilation and execution planner', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'crates/runtime/src/manager.rs', color: '#854d0e', bg: '#fef9c3', border: '#eab308' })}>
                  <rect x="405" y="715" width="70" height="34" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="440" y="728" textAnchor="middle" fill="#854d0e" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Query Service</text>
                  <text x="440" y="738" textAnchor="middle" fill="#854d0e" fontSize="6.5" fontFamily="ui-monospace, monospace" opacity="0.8">[manager.rs]</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'coral_sql_eng', label: 'SQL Query Engine', sub: 'DataFusion / DuckDB embedded high-speed vectorized execution engine', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'crates/engine/src/lib.rs', color: '#854d0e', bg: '#fef9c3', border: '#eab308' })}>
                  <rect x="360" y="815" width="80" height="32" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="400" y="834" textAnchor="middle" fill="#854d0e" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="bold">SQL Query Engine</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'coral_src_rt', label: 'Source Runtime', sub: 'Connector runtime executing live pushes and streaming reads', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'crates/runtime/src/source.rs', color: '#854d0e', bg: '#fef9c3', border: '#eab308' })}>
                  <rect x="452" y="815" width="75" height="32" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="489" y="834" textAnchor="middle" fill="#854d0e" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Source Runtime</text>
                </g>

                {/* MCP Server to Query Service */}
                <path d="M 375 219 L 375 350 L 452 350 L 452 715" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#coral-arr-slate)" className="flow-line" />
                <rect x="430" y="475" width="44" height="12" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="452" y="482" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="6.5" fontFamily="ui-monospace, monospace" fontWeight="600">executes SQL</text>

                {/* Query Service to Function Manager (loads functions) */}
                <path d="M 405 732 L 388 732 L 388 489" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#coral-arr-slate)" className="flow-line" />
                <rect x="365" y="625" width="46" height="12" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="388" y="632" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="6.5" fontFamily="ui-monospace, monospace" fontWeight="600">loads functions</text>

                {/* Internal Connections in Query Runtime */}
                <path d="M 425 749 L 425 785 L 400 785 L 400 815" fill="none" stroke="#eab308" strokeWidth="1.5" markerEnd="url(#coral-arr-amber)" className="flow-line" />
                <rect x="375" y="775" width="48" height="12" rx="2" fill="#ffffff" stroke="#fef08a" strokeWidth="1" />
                <text x="399" y="782" textAnchor="middle" dominantBaseline="middle" fill="#854d0e" fontSize="6.5" fontFamily="ui-monospace, monospace" fontWeight="600">prepares queries</text>

                <path d="M 455 749 L 455 785 L 489 785 L 489 815" fill="none" stroke="#eab308" strokeWidth="1.5" markerEnd="url(#coral-arr-amber)" className="flow-line" />
                <rect x="465" y="775" width="50" height="12" rx="2" fill="#ffffff" stroke="#fef08a" strokeWidth="1" />
                <text x="490" y="782" textAnchor="middle" dominantBaseline="middle" fill="#854d0e" fontSize="6.5" fontFamily="ui-monospace, monospace" fontWeight="600">executes sources</text>

                {/* Local Files Cylinder */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'coral_loc_files', label: 'Local Files', sub: 'CSV, Parquet, JSON and Arrow datasets stored on local drive', category: 'PERSISTENCE', type: 'DATABASE', color: '#854d0e', bg: '#fef9c3', border: '#eab308' })}>
                  <rect x="457" y="975" width="50" height="38" rx="8" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="482" y="998" textAnchor="middle" fill="#854d0e" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Local Files</text>
                </g>

                <path d="M 482 847 L 482 975" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#coral-arr-slate)" className="flow-line" />
                <rect x="460" y="905" width="44" height="12" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="482" y="912" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="6.5" fontFamily="ui-monospace, monospace" fontWeight="600">reads files</text>

                {/* 5. OPERATIONS CONTAINER (Right Rose Box) */}
                <rect x="570" y="980" width="160" height="185" rx="8" fill="#fff1f2" stroke="#fecdd3" strokeWidth="1.5" />
                <text x="650" y="998" textAnchor="middle" fill="#be123c" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Operations</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'coral_tel_mgr', label: 'Telemetry Manager [manager.rs]', sub: 'OpenTelemetry tracing & query audit log recorder', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'crates/telemetry/src/manager.rs', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="635" y="1010" width="88" height="34" rx="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="679" y="1023" textAnchor="middle" fill="#be123c" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Telemetry Manager</text>
                  <text x="679" y="1033" textAnchor="middle" fill="#be123c" fontSize="6.5" fontFamily="ui-monospace, monospace" opacity="0.8">[manager.rs]</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'coral_tr_store', label: 'Trace Store [manager.rs]', sub: 'Local SQLite span cache for query latency profiling', category: 'PERSISTENCE', type: 'DATABASE', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="660" y="1105" width="45" height="40" rx="8" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="682" y="1123" textAnchor="middle" fill="#be123c" fontSize="7" fontFamily="ui-monospace, monospace" fontWeight="bold">Trace Store</text>
                  <text x="682" y="1133" textAnchor="middle" fill="#be123c" fontSize="6" fontFamily="ui-monospace, monospace" opacity="0.8">[manager.rs]</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'coral_univ_search', label: 'Universal Search [engine.rs]', sub: 'BM25 and semantic hybrid metadata catalog search engine', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'crates/search/src/engine.rs', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="575" y="1115" width="65" height="34" rx="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="607" y="1128" textAnchor="middle" fill="#be123c" fontSize="7" fontFamily="ui-monospace, monospace" fontWeight="bold">Universal Search</text>
                  <text x="607" y="1138" textAnchor="middle" fill="#be123c" fontSize="6" fontFamily="ui-monospace, monospace" opacity="0.8">[engine.rs]</text>
                </g>

                {/* Coral UI to Telemetry Manager */}
                <path d="M 505 195 L 660 195 L 660 1010" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#coral-arr-slate)" className="flow-line" />
                <rect x="635" y="650" width="50" height="12" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="660" y="657" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="6.5" fontFamily="ui-monospace, monospace" fontWeight="600">records activity</text>

                {/* Trace Inspection to Telemetry Manager */}
                <path d="M 734 309 L 734 1027 L 723 1027" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#coral-arr-slate)" className="flow-line" />
                <rect x="715" y="475" width="40" height="12" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="735" y="482" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="6.5" fontFamily="ui-monospace, monospace" fontWeight="600">lists traces</text>

                {/* Telemetry Manager to Trace Store */}
                <path d="M 679 1044 L 679 1105" fill="none" stroke="#f43f5e" strokeWidth="1.5" markerEnd="url(#coral-arr-rose)" className="flow-line" />
                <rect x="655" y="1065" width="48" height="12" rx="2" fill="#ffffff" stroke="#fecdd3" strokeWidth="1" />
                <text x="679" y="1072" textAnchor="middle" dominantBaseline="middle" fill="#be123c" fontSize="6.5" fontFamily="ui-monospace, monospace" fontWeight="600">reads traces</text>

                {/* 6. PROVIDER APIS */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'coral_prov_apis', label: 'Provider APIs', sub: 'External Cloud Warehouse & Lakehouse APIs (Snowflake, BigQuery, Databricks)', category: 'EXTERNAL', type: 'EXTERNAL', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="510" y="1255" width="65" height="32" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="542" y="1274" textAnchor="middle" fill="#15803d" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="bold">Provider APIs</text>
                </g>

                {/* Source Runtime to Provider APIs */}
                <path d="M 527 831 L 535 831 L 535 1255" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#coral-arr-slate)" className="flow-line" />
                <rect x="512" y="975" width="46" height="12" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="535" y="982" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="6.5" fontFamily="ui-monospace, monospace" fontWeight="600">fetches data</text>

                {/* Universal Search to Provider APIs */}
                <path d="M 607 1149 L 607 1271 L 575 1271" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#coral-arr-slate)" className="flow-line" />
                <rect x="575" y="1205" width="64" height="12" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="607" y="1212" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="6.5" fontFamily="ui-monospace, monospace" fontWeight="600">searches providers</text>
              </svg>
            ) : isTrustLocker ? (
              /* ═══════════════════════════════════════════════════════════════════
                 TRUSTLOCKER ARCHITECTURE CANVAS
                 ═══════════════════════════════════════════════════════════════════ */
              <svg
                viewBox="0 0 1140 1280"
                className="w-full h-auto drop-shadow-sm select-none"
                style={{ minWidth: '320px', maxWidth: '1140px' }}
              >
                <defs>
                  <style>{`
                    @keyframes flowForward {
                      from { stroke-dashoffset: 24; }
                      to { stroke-dashoffset: 0; }
                    }
                    .flow-line {
                      stroke-dasharray: ${isAnimationEnabled ? '6 4' : 'none'};
                      animation: ${isAnimationEnabled ? `flowForward ${flowSpeedSec} linear infinite` : 'none'};
                    }
                  `}</style>

                  <marker id="tl-arr-slate" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" /></marker>
                  <marker id="tl-arr-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" /></marker>
                  <marker id="tl-arr-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#eab308" /></marker>
                  <marker id="tl-arr-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#22c55e" /></marker>
                  <marker id="tl-arr-rose" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e" /></marker>
                </defs>

                {/* 1. TOP ACTORS */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_nominee_user', label: 'Nominee', sub: 'Designated beneficiary accessing unlocked digital legacy vaults', category: 'CLIENT', type: 'USER', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <circle cx="210" cy="45" r="26" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="210" y="49" textAnchor="middle" fill="#1e40af" fontSize="10.5" fontFamily="system-ui, sans-serif" fontWeight="bold">Nominee</text>
                </g>
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_vault_owner', label: 'Vault Owner', sub: 'Primary account holder managing documents, keys and check-ins', category: 'CLIENT', type: 'USER', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <circle cx="430" cy="45" r="28" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="430" y="49" textAnchor="middle" fill="#1e40af" fontSize="10.5" fontFamily="system-ui, sans-serif" fontWeight="bold">Vault Owner</text>
                </g>
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_user_browser', label: 'User Browser', sub: 'Client web browser loading single page application assets', category: 'CLIENT', type: 'USER', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <circle cx="700" cy="45" r="27" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="700" y="49" textAnchor="middle" fill="#1e40af" fontSize="10.5" fontFamily="system-ui, sans-serif" fontWeight="bold">User Browser</text>
                </g>
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_admin_user', label: 'Administrator', sub: 'System security admin monitoring platform health & alerts', category: 'CLIENT', type: 'USER', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <circle cx="920" cy="45" r="28" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="920" y="49" textAnchor="middle" fill="#1e40af" fontSize="10.5" fontFamily="system-ui, sans-serif" fontWeight="bold">Administrator</text>
                </g>

                <path d="M 210 71 L 210 235" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arr-slate)" className="flow-line" />
                <rect x="175" y="85" width="70" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="210" y="93" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">opens portal</text>

                <path d="M 410 73 L 410 235" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arr-slate)" className="flow-line" />
                <rect x="375" y="85" width="70" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="410" y="93" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">manages vault</text>

                <path d="M 450 73 L 450 185 L 675 185 L 675 235" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arr-slate)" className="flow-line" />
                <rect x="475" y="85" width="85" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="517" y="93" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">registers or logs in</text>

                <path d="M 700 72 L 700 145" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arr-slate)" className="flow-line" />
                <rect x="670" y="85" width="60" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="700" y="93" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">opens app</text>

                <path d="M 920 73 L 920 235" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arr-slate)" className="flow-line" />
                <rect x="880" y="85" width="80" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="920" y="93" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">monitors system</text>

                {/* 2. WEB CLIENT */}
                <rect x="80" y="110" width="980" height="195" rx="8" fill="#eff6ff" stroke="#bae6fd" strokeWidth="1.5" />
                <text x="570" y="130" textAnchor="middle" fill="#1e40af" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Web Client</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_app_jsx', label: 'Route Application [App.jsx]', sub: 'Core React Router routing layer and page dispatch', category: 'CLIENT', type: 'REACT_APP', filePath: 'src/App.jsx', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="635" y="145" width="130" height="42" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="700" y="161" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Route Application</text>
                  <text x="700" y="176" textAnchor="middle" fill="#1e40af" fontSize="8.5" fontFamily="ui-monospace, monospace" opacity="0.8">[App.jsx]</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_nominee_portal', label: 'Nominee Portal [NomineePortal.jsx]', sub: 'Secure portal for beneficiary verification & claim intake', category: 'CLIENT', type: 'FE_VIEW', filePath: 'src/components/NomineePortal.jsx', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="120" y="235" width="150" height="46" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="195" y="253" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Nominee Portal</text>
                  <text x="195" y="268" textAnchor="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">[NomineePortal.jsx]</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_owner_dashboard', label: 'Owner Dashboard [Dashboard.jsx]', sub: 'User dashboard for vault encryption, files & timers', category: 'CLIENT', type: 'FE_VIEW', filePath: 'src/components/Dashboard.jsx', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="360" y="235" width="150" height="46" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="435" y="253" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Owner Dashboard</text>
                  <text x="435" y="268" textAnchor="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">[Dashboard.jsx]</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_login_page', label: 'Login and Signup [LoginPage.jsx]', sub: 'Authentication gateway supporting 2FA and sessions', category: 'CLIENT', type: 'FE_VIEW', filePath: 'src/components/LoginPage.jsx', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="600" y="235" width="150" height="46" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="675" y="253" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Login and Signup</text>
                  <text x="675" y="268" textAnchor="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">[LoginPage.jsx]</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_admin_dashboard', label: 'Admin Dashboard [AdminDashboard.jsx]', sub: 'Administrative operations, security alerts & audit trail', category: 'CLIENT', type: 'FE_VIEW', filePath: 'src/components/AdminDashboard.jsx', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="840" y="235" width="150" height="46" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="915" y="253" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Admin Dashboard</text>
                  <text x="915" y="268" textAnchor="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">[AdminDashboard.jsx]</text>
                </g>

                {/* Router to Views */}
                <path d="M 635 170 L 195 170 L 195 235" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#tl-arr-blue)" className="flow-line" />
                <rect x="230" y="163" width="70" height="13" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="265" y="171" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">routes nominee</text>

                <path d="M 635 175 L 435 175 L 435 235" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#tl-arr-blue)" className="flow-line" />
                <rect x="470" y="168" width="64" height="13" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="502" y="176" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">routes owner</text>

                <path d="M 675 187 L 675 235" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#tl-arr-blue)" className="flow-line" />
                <rect x="645" y="198" width="60" height="13" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="675" y="206" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">routes login</text>

                <path d="M 765 170 L 915 170 L 915 235" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#tl-arr-blue)" className="flow-line" />
                <rect x="800" y="163" width="64" height="13" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="832" y="171" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">routes admin</text>

                {/* 3. LINES DOWN TO API */}
                <path d="M 195 281 L 195 350 L 157 350 L 157 410" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arr-slate)" className="flow-line" />
                <rect x="110" y="325" width="90" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="155" y="333" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">requests shared files</text>

                <path d="M 385 281 L 385 350 L 305 350 L 305 410" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arr-slate)" className="flow-line" />
                <rect x="305" y="325" width="88" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="349" y="333" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">updates preferences</text>

                <path d="M 435 281 L 435 350 L 460 350 L 460 410" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arr-slate)" className="flow-line" />
                <rect x="420" y="325" width="84" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="462" y="333" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">manages documents</text>

                <path d="M 490 281 L 490 340 L 525 340 L 525 730 L 590 730" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arr-slate)" className="flow-line" />
                <rect x="500" y="325" width="46" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="523" y="333" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">checks in</text>

                <path d="M 675 281 L 675 350 L 615 350 L 615 410" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arr-slate)" className="flow-line" />
                <rect x="610" y="325" width="88" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="654" y="333" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">submits credentials</text>

                <path d="M 915 281 L 915 410" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arr-slate)" className="flow-line" />
                <rect x="880" y="325" width="70" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="915" y="333" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">reviews alerts</text>

                {/* 4. API AND SECURITY */}
                <rect x="80" y="370" width="980" height="180" rx="8" fill="#fffbeb" stroke="#fef08a" strokeWidth="1.5" />
                <text x="570" y="392" textAnchor="middle" fill="#854d0e" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">API and Security</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_nominee_api', label: 'Nominee API', sub: 'REST endpoint for nominee verification & claim requests', category: 'API_ACCESS', type: 'DOMAIN_CONTROLLER', filePath: 'NomineeController.java', color: '#854d0e', bg: '#fef9c3', border: '#eab308' })}>
                  <rect x="100" y="410" width="115" height="34" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="157" y="431" textAnchor="middle" fill="#854d0e" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Nominee API</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_toggle_api', label: 'Feature Toggle API', sub: 'REST endpoint managing user features & security preferences', category: 'API_ACCESS', type: 'DOMAIN_CONTROLLER', filePath: 'FeatureToggleController.java', color: '#854d0e', bg: '#fef9c3', border: '#eab308' })}>
                  <rect x="240" y="410" width="135" height="34" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="307" y="431" textAnchor="middle" fill="#854d0e" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Feature Toggle API</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_doc_api', label: 'Document API', sub: 'REST endpoint handling encrypted payload upload and retrieval', category: 'API_ACCESS', type: 'DOMAIN_CONTROLLER', filePath: 'DocumentController.java', color: '#854d0e', bg: '#fef9c3', border: '#eab308' })}>
                  <rect x="400" y="410" width="120" height="34" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="460" y="431" textAnchor="middle" fill="#854d0e" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Document API</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_auth_api', label: 'Authentication API', sub: 'Authentication controller handling registration, login and JWT issuance', category: 'API_ACCESS', type: 'DOMAIN_CONTROLLER', filePath: 'AuthController.java', color: '#854d0e', bg: '#fef9c3', border: '#eab308' })}>
                  <rect x="545" y="410" width="140" height="34" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="615" y="431" textAnchor="middle" fill="#854d0e" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Authentication API</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_jwt_sec', label: 'JWT Security', sub: 'Spring Security filter chain configuration & token parser', category: 'API_ACCESS', type: 'SECURITY_CONFIG', filePath: 'SecurityConfig.java', color: '#854d0e', bg: '#fef9c3', border: '#eab308' })}>
                  <rect x="710" y="410" width="115" height="34" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="767" y="431" textAnchor="middle" fill="#854d0e" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">JWT Security</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_admin_api', label: 'Administration API', sub: 'REST endpoint for admin audit history & alert management', category: 'API_ACCESS', type: 'DOMAIN_CONTROLLER', filePath: 'AdminController.java', color: '#854d0e', bg: '#fef9c3', border: '#eab308' })}>
                  <rect x="850" y="410" width="145" height="34" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="922" y="431" textAnchor="middle" fill="#854d0e" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Administration API</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_jwt_filter', label: 'JWT Request Filter', sub: 'OncePerRequestFilter intercepting HTTP requests to validate Bearer tokens', category: 'API_ACCESS', type: 'JWT_FILTER', filePath: 'JwtRequestFilter.java', color: '#854d0e', bg: '#fef9c3', border: '#eab308' })}>
                  <rect x="565" y="485" width="140" height="32" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="635" y="505" textAnchor="middle" fill="#854d0e" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">JWT Request Filter</text>
                </g>

                <path d="M 585 444 L 585 485" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arr-slate)" className="flow-line" />
                <rect x="530" y="458" width="80" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="570" y="466" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">requires protection</text>

                <path d="M 645 444 L 645 485" fill="none" stroke="#eab308" strokeWidth="1.5" markerEnd="url(#tl-arr-amber)" className="flow-line" />
                <rect x="630" y="458" width="85" height="13" rx="2" fill="#ffffff" stroke="#fde047" strokeWidth="1" />
                <text x="672" y="466" textAnchor="middle" dominantBaseline="middle" fill="#854d0e" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">issues session token</text>

                <path d="M 745 444 L 745 470 L 685 470 L 685 485" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arr-slate)" className="flow-line" />
                <rect x="715" y="458" width="56" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="743" y="466" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">installs filter</text>

                {/* 5. VAULT LIFECYCLE */}
                <rect x="360" y="615" width="410" height="185" rx="8" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1.5" />
                <text x="565" y="637" textAnchor="middle" fill="#15803d" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Vault Lifecycle</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_enc_srv', label: 'Encryption Service', sub: 'Symmetric envelope encryption and key lifecycle orchestrator', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'EncryptionService.java', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="385" y="655" width="145" height="34" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="457" y="676" textAnchor="middle" fill="#15803d" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Encryption Service</text>
                </g>

                <path d="M 457 689 L 457 730" fill="none" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#tl-arr-green)" className="flow-line" />
                <rect x="415" y="702" width="84" height="13" rx="2" fill="#ffffff" stroke="#bbf7d0" strokeWidth="1" />
                <text x="457" y="710" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">performs AES-GCM</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_aes_util', label: 'AES Utility [AESUtil.java]', sub: 'Low-level cryptography helper implementing 256-bit AES-GCM encryption', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'AESUtil.java', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="385" y="730" width="145" height="42" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="457" y="748" textAnchor="middle" fill="#15803d" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">AES Utility</text>
                  <text x="457" y="763" textAnchor="middle" fill="#15803d" fontSize="8.5" fontFamily="ui-monospace, monospace" opacity="0.8">[AESUtil.java]</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_switch_sched', label: 'Switch Scheduler', sub: 'Cron-based scheduler monitoring dead man switch inactivity timeouts', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'SwitchScheduler.java', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="590" y="655" width="145" height="34" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="662" y="676" textAnchor="middle" fill="#15803d" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Switch Scheduler</text>
                </g>

                <path d="M 662 689 L 662 730" fill="none" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#tl-arr-green)" className="flow-line" />
                <rect x="610" y="702" width="104" height="13" rx="2" fill="#ffffff" stroke="#bbf7d0" strokeWidth="1" />
                <text x="662" y="710" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">runs inactivity workflow</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_checkin_srv', label: 'Check-in Service', sub: 'Heartbeat recorder calculating grace periods and unlocking vaults', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'CheckInService.java', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="590" y="730" width="145" height="34" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="662" y="751" textAnchor="middle" fill="#15803d" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Check-in Service</text>
                </g>

                {/* 6. INTER-TIER STEPPED LINES TO PERSISTENCE */}
                <path d="M 120 444 L 120 750 L 385 750" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arr-slate)" className="flow-line" />
                <rect x="135" y="590" width="80" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="175" y="598" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">decrypts download</text>

                <path d="M 430 444 L 430 655" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arr-slate)" className="flow-line" />
                <rect x="385" y="575" width="88" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="429" y="583" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">encrypts or decrypts</text>

                <path d="M 157 444 L 157 925" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arr-slate)" className="flow-line" />
                <rect x="110" y="660" width="94" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="157" y="668" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">finds shared docs</text>

                <path d="M 307 444 L 307 925" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arr-slate)" className="flow-line" />
                <rect x="260" y="660" width="92" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="306" y="668" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">reads or saves toggles</text>

                <path d="M 460 444 L 460 630 L 482 630 L 482 925" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arr-slate)" className="flow-line" />
                <rect x="435" y="660" width="94" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="482" y="668" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">persists payload</text>

                <path d="M 615 444 L 615 925" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arr-slate)" className="flow-line" />
                <rect x="580" y="660" width="70" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="615" y="668" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">reads / saves user</text>

                <path d="M 922 444 L 922 925" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arr-slate)" className="flow-line" />
                <rect x="875" y="660" width="94" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="922" y="668" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">reads audit & alerts</text>

                {/* 7. PERSISTENCE AND OPERATIONS */}
                <rect x="80" y="880" width="980" height="235" rx="8" fill="#fff1f2" stroke="#fecdd3" strokeWidth="1.5" />
                <text x="570" y="902" textAnchor="middle" fill="#be123c" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Persistence and Operations</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_doc_store', label: 'Document Persistence', sub: 'Spring Data JPA metadata store for encrypted records', category: 'PERSISTENCE', type: 'JPA_REPO', filePath: 'DocumentRepository.java', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="100" y="925" width="140" height="40" rx="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="170" y="942" textAnchor="middle" fill="#be123c" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Document Persistence</text>
                  <text x="170" y="955" textAnchor="middle" fill="#be123c" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">persists metadata</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_toggle_store', label: 'Toggle Persistence', sub: 'Feature flag and kill switch JPA state store', category: 'PERSISTENCE', type: 'JPA_REPO', filePath: 'ToggleRepository.java', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="260" y="925" width="135" height="40" rx="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="327" y="942" textAnchor="middle" fill="#be123c" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Toggle Persistence</text>
                  <text x="327" y="955" textAnchor="middle" fill="#be123c" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">persists toggles</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_file_store', label: 'Encrypted File Store', sub: 'Encrypted BLOB and cipher payload storage engine', category: 'PERSISTENCE', type: 'JPA_REPO', filePath: 'FilePayloadRepository.java', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="415" y="925" width="135" height="40" rx="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="482" y="948" textAnchor="middle" fill="#be123c" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Encrypted File Store</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_user_store', label: 'User Persistence', sub: 'User credentials, public keys & nominee assignments', category: 'PERSISTENCE', type: 'JPA_REPO', filePath: 'UserRepository.java', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="570" y="925" width="135" height="40" rx="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="637" y="942" textAnchor="middle" fill="#be123c" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">User Persistence</text>
                  <text x="637" y="955" textAnchor="middle" fill="#be123c" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">persists users</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_audit_store', label: 'Access Audit Store', sub: 'Immutable audit log tracking all vault operations and logins', category: 'PERSISTENCE', type: 'JPA_REPO', filePath: 'AuditLogRepository.java', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="725" y="925" width="145" height="40" rx="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="797" y="942" textAnchor="middle" fill="#be123c" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Access Audit Store</text>
                  <text x="797" y="955" textAnchor="middle" fill="#be123c" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">persists audit logs</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_alert_store', label: 'Alert Store', sub: 'Security alerts and automated incident dispatch store', category: 'PERSISTENCE', type: 'JPA_REPO', filePath: 'AlertRepository.java', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="890" y="925" width="135" height="40" rx="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="957" y="942" textAnchor="middle" fill="#be123c" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Alert Store</text>
                  <text x="957" y="955" textAnchor="middle" fill="#be123c" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">persists alerts</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'tl_mysql_db', label: 'MySQL Database', sub: 'Relational Database Management System storing relational schema', category: 'PERSISTENCE', type: 'DATABASE', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="510" y="1035" width="120" height="46" rx="8" fill="#fee2e2" stroke="#f87171" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="570" y="1062" textAnchor="middle" dominantBaseline="middle" fill="#be123c" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">MySQL Database</text>
                </g>

                <path d="M 170 965 L 170 1020 L 530 1020 L 530 1035" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arr-slate)" className="flow-line" />
                <rect x="180" y="980" width="76" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="218" y="988" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">persists metadata</text>

                <path d="M 327 965 L 327 1010 L 545 1010 L 545 1035" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arr-slate)" className="flow-line" />
                <rect x="340" y="980" width="72" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="376" y="988" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">persists toggles</text>

                <path d="M 482 965 L 482 1015 L 560 1015 L 560 1035" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arr-slate)" className="flow-line" />
                <rect x="450" y="980" width="64" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="482" y="988" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">saves blobs</text>

                <path d="M 637 965 L 637 1010 L 585 1010 L 585 1035" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arr-slate)" className="flow-line" />
                <rect x="640" y="980" width="66" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="673" y="988" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">persists users</text>

                <path d="M 797 965 L 797 1020 L 600 1020 L 600 1035" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arr-slate)" className="flow-line" />
                <rect x="800" y="980" width="84" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="842" y="988" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">persists audit logs</text>

                <path d="M 957 965 L 957 1030 L 615 1030 L 615 1035" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#tl-arr-slate)" className="flow-line" />
                <rect x="960" y="980" width="68" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="994" y="988" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">persists alerts</text>
              </svg>
            ) : isThinkSwipe ? (
              /* ═══════════════════════════════════════════════════════════════════
                 THINKSWIPE ARCHITECTURE CANVAS
                 ═══════════════════════════════════════════════════════════════════ */
              <svg
                viewBox="0 0 1120 1380"
                className="w-full h-auto drop-shadow-sm select-none"
                style={{ minWidth: '320px', maxWidth: '1120px' }}
              >
                <defs>
                  <style>{`
                    @keyframes flowForward {
                      from { stroke-dashoffset: 24; }
                      to { stroke-dashoffset: 0; }
                    }
                    .flow-line {
                      stroke-dasharray: ${isAnimationEnabled ? '6 4' : 'none'};
                      animation: ${isAnimationEnabled ? `flowForward ${flowSpeedSec} linear infinite` : 'none'};
                    }
                  `}</style>

                  <marker id="ts-arr-slate" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" /></marker>
                  <marker id="ts-arr-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" /></marker>
                  <marker id="ts-arr-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#22c55e" /></marker>
                  <marker id="ts-arr-indigo" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#6366f1" /></marker>
                  <marker id="ts-arr-rose" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e" /></marker>
                </defs>

                {/* 1. TOP ACTORS */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_visitor', label: 'Visitor', sub: 'End user accessing ThinkSwipe web application', category: 'CLIENT', type: 'USER', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <circle cx="340" cy="40" r="22" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="340" y="44" textAnchor="middle" fill="#1e40af" fontSize="10.5" fontFamily="system-ui, sans-serif" fontWeight="bold">Visitor</text>
                </g>
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_admin', label: 'Admin User', sub: 'ThinkSwipe system administrator', category: 'CLIENT', type: 'USER', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <circle cx="780" cy="40" r="27" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="780" y="44" textAnchor="middle" fill="#1e40af" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="bold">Admin User</text>
                </g>

                <path d="M 340 62 L 340 135" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arr-slate)" className="flow-line" />
                <rect x="315" y="80" width="50" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="340" y="88" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">opens app</text>

                <path d="M 780 67 L 780 235" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arr-slate)" className="flow-line" />
                <rect x="750" y="80" width="60" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="780" y="88" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">opens admin</text>

                {/* 2. CLIENT EXPERIENCE */}
                <rect x="160" y="105" width="800" height="315" rx="8" fill="#eff6ff" stroke="#bae6fd" strokeWidth="1.5" />
                <text x="560" y="125" textAnchor="middle" fill="#1e40af" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Client Experience</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_bootstrap', label: 'React Bootstrap [main.jsx]', sub: 'Vite React 19 application root bootstrap mount', category: 'CLIENT', type: 'REACT_APP', filePath: 'main.jsx', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="280" y="135" width="120" height="42" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="340" y="152" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">React Bootstrap</text>
                  <text x="340" y="167" textAnchor="middle" fill="#1e40af" fontSize="8.5" fontFamily="ui-monospace, monospace" opacity="0.8">[main.jsx]</text>
                </g>

                <path d="M 400 156 L 470 156" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#ts-arr-blue)" className="flow-line" />
                <rect x="415" y="149" width="40" height="14" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="435" y="157" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">mounts</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_swipe_exp', label: 'Swipe Experience [App.jsx]', sub: 'Tinder-style swipe gestures and question interaction engine', category: 'CLIENT', type: 'REACT_APP', filePath: 'App.jsx', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="470" y="135" width="120" height="42" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="530" y="152" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Swipe Experience</text>
                  <text x="530" y="167" textAnchor="middle" fill="#1e40af" fontSize="8.5" fontFamily="ui-monospace, monospace" opacity="0.8">[App.jsx]</text>
                </g>

                <path d="M 590 156 L 660 156" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#ts-arr-blue)" className="flow-line" />
                <rect x="605" y="149" width="40" height="14" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="625" y="157" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">registers</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_sw', label: 'PWA Service Worker [sw.js]', sub: 'Progressive Web App offline cache and background sync', category: 'CLIENT', type: 'REACT_APP', filePath: 'sw.js', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="660" y="135" width="130" height="42" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="725" y="152" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">PWA Service Worker</text>
                  <text x="725" y="167" textAnchor="middle" fill="#1e40af" fontSize="8.5" fontFamily="ui-monospace, monospace" opacity="0.8">[sw.js]</text>
                </g>

                {/* 4 Feature Cards */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_q_search', label: 'Question Search [SearchBar.jsx]', sub: 'Real-time debounced question filtering & tag search', category: 'CLIENT', type: 'FE_VIEW', filePath: 'SearchBar.jsx', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="180" y="235" width="130" height="42" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="245" y="252" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Question Search</text>
                  <text x="245" y="267" textAnchor="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">[SearchBar.jsx]</text>
                </g>
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_leaderboard', label: 'Leaderboard UI [Leaderboard.jsx]', sub: 'Rankings leaderboard with live score polling', category: 'CLIENT', type: 'FE_VIEW', filePath: 'Leaderboard.jsx', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="360" y="235" width="130" height="42" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="425" y="252" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Leaderboard UI</text>
                  <text x="425" y="267" textAnchor="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">[Leaderboard.jsx]</text>
                </g>
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_admin_panel', label: 'Admin Panel [AdminPanel.jsx]', sub: 'Question CRUD, push notifications & analytics', category: 'CLIENT', type: 'FE_VIEW', filePath: 'AdminPanel.jsx', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="715" y="235" width="130" height="42" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="780" y="252" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Admin Panel</text>
                  <text x="780" y="267" textAnchor="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">[AdminPanel.jsx]</text>
                </g>
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_submissions', label: 'User Submissions [UserSubmit.jsx]', sub: 'Community question proposal & test case editor', category: 'CLIENT', type: 'FE_VIEW', filePath: 'UserSubmit.jsx', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="830" y="235" width="120" height="42" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="890" y="252" textAnchor="middle" fill="#1e40af" fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="bold">User Submissions</text>
                  <text x="890" y="267" textAnchor="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">[UserSubmit.jsx]</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_api_client', label: 'API Client [api.js]', sub: 'Axios HTTP client with interceptors and retry handlers', category: 'CLIENT', type: 'REACT_APP', filePath: 'api.js', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="470" y="340" width="120" height="42" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="530" y="357" textAnchor="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">API Client</text>
                  <text x="530" y="372" textAnchor="middle" fill="#1e40af" fontSize="8.5" fontFamily="ui-monospace, monospace" opacity="0.8">[api.js]</text>
                </g>

                <path d="M 245 277 L 245 361 L 470 361" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#ts-arr-blue)" className="flow-line" />
                <rect x="270" y="354" width="45" height="14" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="292" y="362" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">searches</text>

                <path d="M 425 277 L 425 350 L 470 350" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#ts-arr-blue)" className="flow-line" />
                <rect x="390" y="310" width="70" height="14" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="425" y="318" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">loads rankings</text>

                <path d="M 780 277 L 780 350 L 590 350" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#ts-arr-blue)" className="flow-line" />
                <rect x="665" y="343" width="60" height="14" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="695" y="351" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">admin calls</text>

                <path d="M 890 277 L 890 361 L 590 361" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#ts-arr-blue)" className="flow-line" />
                <rect x="790" y="354" width="45" height="14" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="812" y="362" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">submits</text>

                {/* 3. EDGE DELIVERY */}
                <rect x="450" y="470" width="160" height="100" rx="8" fill="#fffbeb" stroke="#fde047" strokeWidth="1.5" />
                <text x="530" y="490" textAnchor="middle" fill="#854d0e" fontSize="10.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Edge Delivery</text>

                <path d="M 530 382 L 530 505" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arr-slate)" className="flow-line" />
                <rect x="508" y="420" width="44" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="530" y="428" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">proxies</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_edge_proxy', label: 'Edge Proxy [worker.js]', sub: 'Cloudflare Worker proxying API traffic & caching assets', category: 'API_ACCESS', type: 'PROXY', filePath: 'worker.js', color: '#854d0e', bg: '#fef9c3', border: '#fde047' })}>
                  <rect x="470" y="505" width="120" height="42" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="530" y="522" textAnchor="middle" fill="#854d0e" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Edge Proxy</text>
                  <text x="530" y="537" textAnchor="middle" fill="#854d0e" fontSize="8.5" fontFamily="ui-monospace, monospace" opacity="0.8">[worker.js]</text>
                </g>

                {/* 4. SPRING BOOT REST API */}
                <path d="M 530 547 L 530 615" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arr-slate)" className="flow-line" />
                <rect x="500" y="575" width="60" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="530" y="583" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">Spring API</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_spring_app', label: 'Spring Boot REST API', sub: 'Java 21 Spring Boot Backend Service Application', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'ThinkSwipeApplication.java', color: '#854d0e', bg: '#fef9c3', border: '#fde047' })}>
                  <rect x="460" y="615" width="140" height="38" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="530" y="638" textAnchor="middle" dominantBaseline="middle" fill="#854d0e" fontSize="10.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Spring Boot API</text>
                </g>

                {/* 5. PRACTICE DOMAIN */}
                <rect x="140" y="715" width="550" height="185" rx="8" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1.5" />
                <text x="415" y="735" textAnchor="middle" fill="#15803d" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Practice Domain</text>

                <path d="M 480 653 L 480 685 L 220 685 L 220 755" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arr-slate)" className="flow-line" />
                <path d="M 510 653 L 510 695 L 355 695 L 355 755" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arr-slate)" className="flow-line" />
                <path d="M 550 653 L 550 695 L 490 695 L 490 755" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arr-slate)" className="flow-line" />
                <path d="M 580 653 L 580 685 L 625 685 L 625 755" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arr-slate)" className="flow-line" />
                <path d="M 600 640 L 782 640 L 782 795" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arr-slate)" className="flow-line" />

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_q_ctrl', label: 'Question Controller', sub: 'REST endpoints for question retrieval and random cards', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'QuestionController.java', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="160" y="755" width="120" height="36" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="220" y="777" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Question Controller</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_ans_ctrl', label: 'Answer Controller', sub: 'REST endpoint receiving user code submissions', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'AnswerController.java', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="295" y="755" width="120" height="36" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="355" y="777" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Answer Controller</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_sub_ctrl', label: 'Submission Controller', sub: 'Community proposed questions queue and review', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'SubmissionController.java', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="430" y="755" width="120" height="36" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="490" y="777" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Submission Controller</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_lead_ctrl', label: 'Leaderboard Controller', sub: 'Rankings leaderboard endpoint with cached scores', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'LeaderboardController.java', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="565" y="755" width="120" height="36" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="625" y="777" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Leaderboard Controller</text>
                </g>

                <path d="M 220 791 L 220 835" fill="none" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#ts-arr-green)" className="flow-line" />
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_q_srv', label: 'Question Service', sub: 'Question catalog cache and difficulty selector', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'QuestionService.java', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="165" y="835" width="110" height="36" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="220" y="857" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">Question Service</text>
                </g>

                <path d="M 355 791 L 355 835" fill="none" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#ts-arr-green)" className="flow-line" />
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_ans_srv', label: 'Answer Service [AnswerService.java]', sub: 'Core evaluation engine validating user submissions', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'AnswerService.java', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="290" y="835" width="130" height="42" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="355" y="852" textAnchor="middle" fill="#15803d" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">Answer Service</text>
                  <text x="355" y="866" textAnchor="middle" fill="#15803d" fontSize="8.5" fontFamily="ui-monospace, monospace" opacity="0.8">[AnswerService.java]</text>
                </g>

                {/* 6. ADMIN OPERATIONS */}
                <rect x="715" y="755" width="245" height="110" rx="8" fill="#fff1f2" stroke="#fecdd3" strokeWidth="1.5" />
                <text x="837" y="775" textAnchor="middle" fill="#be123c" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Admin Operations</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_admin_ctrl', label: 'Admin Controller', sub: 'Administrative management endpoints & user subscriptions', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'AdminController.java', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="730" y="795" width="105" height="36" rx="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="782" y="817" textAnchor="middle" dominantBaseline="middle" fill="#be123c" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Admin Controller</text>
                </g>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_push_ctrl', label: 'Push Controller', sub: 'Web push notification dispatcher & subscription store', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'PushController.java', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="845" y="795" width="105" height="36" rx="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="897" y="817" textAnchor="middle" dominantBaseline="middle" fill="#be123c" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Push Controller</text>
                </g>

                {/* 7. EXTERNAL INTEGRATIONS */}
                <path d="M 355 877 L 355 983 L 245 983" fill="none" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#ts-arr-green)" className="flow-line" />
                <rect x="260" y="976" width="76" height="14" rx="2" fill="#ffffff" stroke="#bbf7d0" strokeWidth="1" />
                <text x="298" y="984" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">compiles code</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_jdoodle', label: 'JDoodle API', sub: 'External Compiler & Code Execution Engine API', category: 'EXTERNAL', type: 'EXTERNAL', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="155" y="965" width="90" height="36" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="200" y="987" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">JDoodle API</text>
                </g>

                <path d="M 897 831 L 897 965" fill="none" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#ts-arr-indigo)" className="flow-line" />
                <rect x="855" y="890" width="84" height="14" rx="2" fill="#ffffff" stroke="#c7d2fe" strokeWidth="1" />
                <text x="897" y="898" textAnchor="middle" dominantBaseline="middle" fill="#3730a3" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">sends push</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_web_push', label: 'Web Push Service', sub: 'VAPID Web Push Protocol & Browser Notification Delivery', category: 'EXTERNAL', type: 'EXTERNAL', color: '#3730a3', bg: '#e0e7ff', border: '#6366f1' })}>
                  <rect x="840" y="965" width="115" height="36" rx="4" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" className="transition group-hover:stroke-indigo-600" />
                  <text x="897" y="987" textAnchor="middle" dominantBaseline="middle" fill="#3730a3" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">Web Push Service</text>
                </g>

                {/* 8. PERSISTENCE */}
                <rect x="520" y="955" width="140" height="235" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="590" y="972" textAnchor="middle" fill="#64748b" fontSize="10.5" fontFamily="ui-monospace, monospace" fontWeight="600">Persistence</text>

                <path d="M 490 791 L 490 920 L 590 920 L 590 980" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arr-slate)" className="flow-line" />
                <path d="M 625 791 L 625 935 L 600 935 L 600 980" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arr-slate)" className="flow-line" />
                <path d="M 782 831 L 782 920 L 610 920 L 610 980" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arr-slate)" className="flow-line" />

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_jpa', label: 'JPA Repositories', sub: 'Spring Data JPA Repository Interfaces & Entities', category: 'PERSISTENCE', type: 'JPA_REPO', color: '#1e40af', bg: '#dbeafe', border: '#60a5fa' })}>
                  <rect x="535" y="980" width="110" height="32" rx="4" fill="#dbeafe" stroke="#60a5fa" strokeWidth="1.5" className="transition group-hover:stroke-blue-600" />
                  <text x="590" y="1000" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">JPA Repositories</text>
                </g>

                <path d="M 590 1012 L 590 1045" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arr-slate)" className="flow-line" />
                <rect x="570" y="1022" width="40" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="590" y="1030" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">persists</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_tidb_pri', label: 'Primary TiDB', sub: 'Distributed SQL MySQL-Compatible Primary Cluster', category: 'PERSISTENCE', type: 'DATABASE', color: '#1e40af', bg: '#dbeafe', border: '#60a5fa' })}>
                  <rect x="545" y="1045" width="90" height="38" rx="10" fill="#dbeafe" stroke="#60a5fa" strokeWidth="1.5" className="transition group-hover:stroke-blue-600" />
                  <text x="590" y="1068" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">Primary TiDB</text>
                </g>

                <path d="M 590 1083 L 590 1120" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ts-arr-slate)" className="flow-line" />
                <rect x="566" y="1095" width="48" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="590" y="1103" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">daily sync</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'ts_tidb_sec', label: 'Secondary TiDB', sub: 'Async Disaster Recovery & Read Replica Cluster', category: 'PERSISTENCE', type: 'DATABASE', color: '#1e40af', bg: '#dbeafe', border: '#60a5fa' })}>
                  <rect x="545" y="1120" width="90" height="38" rx="10" fill="#dbeafe" stroke="#60a5fa" strokeWidth="1.5" className="transition group-hover:stroke-blue-600" />
                  <text x="590" y="1143" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Secondary TiDB</text>
                </g>
              </svg>
            ) : isVps ? (
              /* ═══════════════════════════════════════════════════════════════════
                 VPS ARCHITECTURE CANVAS
                 ═══════════════════════════════════════════════════════════════════ */
              <svg
                viewBox="0 0 1140 1350"
                className="w-full h-auto drop-shadow-sm select-none"
                style={{ minWidth: '320px', maxWidth: '1140px' }}
              >
                <defs>
                  <style>{`
                    @keyframes flowForward {
                      from { stroke-dashoffset: 24; }
                      to { stroke-dashoffset: 0; }
                    }
                    .flow-line {
                      stroke-dasharray: ${isAnimationEnabled ? '6 4' : 'none'};
                      animation: ${isAnimationEnabled ? `flowForward ${flowSpeedSec} linear infinite` : 'none'};
                    }
                  `}</style>

                  <marker id="vps-arr-slate" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" /></marker>
                  <marker id="vps-arr-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" /></marker>
                  <marker id="vps-arr-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#eab308" /></marker>
                  <marker id="vps-arr-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#22c55e" /></marker>
                  <marker id="vps-arr-rose" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e" /></marker>
                  <marker id="vps-arr-indigo" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#6366f1" /></marker>
                </defs>

                {/* 1. School Users Actor */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'vps_users', label: 'School Users', sub: 'Students, Teachers, Staff and Parents accessing VPS portal', category: 'CLIENT', type: 'USER', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <circle cx="570" cy="45" r="28" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="570" y="49" textAnchor="middle" fill="#1e40af" fontSize="10.5" fontFamily="system-ui, sans-serif" fontWeight="bold">School Users</text>
                </g>

                <path d="M 545 68 L 300 68 L 300 170" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#vps-arr-slate)" className="flow-line" />
                <rect x="350" y="60" width="74" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="387" y="68" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">launches app</text>

                <path d="M 595 68 L 820 68 L 820 170" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#vps-arr-slate)" className="flow-line" />
                <rect x="680" y="60" width="94" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="727" y="68" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">views dashboards</text>

                {/* 2. Client Experience Container */}
                <rect x="180" y="125" width="780" height="175" rx="8" fill="#eff6ff" stroke="#bae6fd" strokeWidth="1.5" />
                <text x="570" y="145" textAnchor="middle" fill="#1e40af" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Client Experience</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'vps_fe_app', label: 'React Application [App.jsx]', sub: 'Vite React frontend application with dashboard views', category: 'CLIENT', type: 'REACT_APP', filePath: 'vps-frontend/src/App.jsx', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="220" y="170" width="160" height="46" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="300" y="188" textAnchor="middle" fill="#1e40af" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">React Application</text>
                  <text x="300" y="202" textAnchor="middle" fill="#1e40af" fontSize="8.5" fontFamily="ui-monospace, monospace" opacity="0.8">[App.jsx]</text>
                </g>

                <path d="M 380 193 L 480 193" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#vps-arr-blue)" className="flow-line" />
                <rect x="400" y="186" width="60" height="14" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="430" y="194" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">reads auth</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'vps_auth_ctx', label: 'Auth Context [AuthContext.jsx]', sub: 'React global context managing token state and roles', category: 'CLIENT', type: 'AUTH_CONTEXT', filePath: 'vps-frontend/src/AuthContext.jsx', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="480" y="170" width="160" height="46" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="560" y="188" textAnchor="middle" fill="#1e40af" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">Auth Context</text>
                  <text x="560" y="202" textAnchor="middle" fill="#1e40af" fontSize="8.5" fontFamily="ui-monospace, monospace" opacity="0.8">[AuthContext.jsx]</text>
                </g>

                <path d="M 640 193 L 740 193" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#vps-arr-blue)" className="flow-line" />
                <rect x="660" y="186" width="60" height="14" rx="2" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
                <text x="690" y="194" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">guards UI</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'vps_fe_views', label: 'ERP Feature Views', sub: 'Student, teacher, admin and finance UI screens', category: 'CLIENT', type: 'FE_VIEW', filePath: 'vps-frontend/src/components', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <rect x="740" y="170" width="160" height="46" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="820" y="196" textAnchor="middle" dominantBaseline="middle" fill="#1e40af" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">ERP Feature Views</text>
                </g>

                <path d="M 300 216 L 300 390" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#vps-arr-slate)" className="flow-line" />
                <rect x="255" y="270" width="90" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="300" y="278" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">sends requests</text>

                <path d="M 820 216 L 820 310 L 330 310 L 330 390" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#vps-arr-slate)" className="flow-line" />
                <rect x="530" y="303" width="80" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="570" y="311" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">submits forms</text>

                {/* 3. API Access Container */}
                <rect x="180" y="345" width="780" height="145" rx="8" fill="#fffbeb" stroke="#fde047" strokeWidth="1.5" />
                <text x="570" y="365" textAnchor="middle" fill="#854d0e" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">API Access</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'vps_proxy', label: 'Cloudflare Proxy', sub: 'Edge CDN SSL and reverse proxy layer', category: 'API_ACCESS', type: 'PROXY', color: '#854d0e', bg: '#fef9c3', border: '#eab308' })}>
                  <rect x="220" y="390" width="140" height="42" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="290" y="413" textAnchor="middle" dominantBaseline="middle" fill="#854d0e" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">Cloudflare Proxy</text>
                </g>

                <path d="M 360 411 L 430 411" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#vps-arr-slate)" className="flow-line" />
                <rect x="368" y="404" width="58" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="397" y="412" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">proxies traffic</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'vps_be_api', label: 'Spring Boot API [VpsApplication.java]', sub: 'Core backend service on Java 17', category: 'API_ACCESS', type: 'DOMAIN_CONTROLLER', filePath: 'vps-backend/src/main/java/com/visionpublicschool/VpsApplication.java', color: '#854d0e', bg: '#fef9c3', border: '#eab308' })}>
                  <rect x="430" y="390" width="130" height="42" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="495" y="407" textAnchor="middle" fill="#854d0e" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Spring Boot API</text>
                  <text x="495" y="421" textAnchor="middle" fill="#854d0e" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">[VpsApplication.java]</text>
                </g>

                <path d="M 560 411 L 630 411" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#vps-arr-slate)" className="flow-line" />
                <rect x="568" y="404" width="58" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="597" y="412" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">enters security</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'vps_sec_cfg', label: 'Security Config', sub: 'Spring Security filter chain configuration', category: 'API_ACCESS', type: 'SECURITY_CONFIG', filePath: 'vps-backend/src/main/java/com/visionpublicschool/config/SecurityConfig.java', color: '#854d0e', bg: '#fef9c3', border: '#eab308' })}>
                  <rect x="630" y="390" width="120" height="42" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="690" y="413" textAnchor="middle" dominantBaseline="middle" fill="#854d0e" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Security Config</text>
                </g>

                <path d="M 750 411 L 810 411" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#vps-arr-slate)" className="flow-line" />
                <rect x="752" y="404" width="56" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="780" y="412" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">applies filter</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'vps_jwt_flt', label: 'JWT Filter', sub: 'Token validation interceptor', category: 'API_ACCESS', type: 'JWT_FILTER', filePath: 'vps-backend/src/main/java/com/visionpublicschool/config/JwtAuthenticationFilter.java', color: '#854d0e', bg: '#fef9c3', border: '#eab308' })}>
                  <rect x="810" y="390" width="110" height="42" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                  <text x="865" y="413" textAnchor="middle" dominantBaseline="middle" fill="#854d0e" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">JWT Filter</text>
                </g>

                {/* 4. Domain Workflows Container (7 Nodes) */}
                <rect x="60" y="540" width="1020" height="160" rx="8" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1.5" />
                <text x="570" y="560" textAnchor="middle" fill="#15803d" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Domain Workflows (7 Core Modules)</text>

                <path d="M 495 432 L 495 500 L 150 500 L 150 585" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#vps-arr-slate)" className="flow-line" />
                <path d="M 495 432 L 495 500 L 292 500 L 292 585" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#vps-arr-slate)" className="flow-line" />
                <path d="M 495 432 L 495 500 L 440 500 L 440 585" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#vps-arr-slate)" className="flow-line" />
                <path d="M 495 432 L 495 585" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#vps-arr-slate)" className="flow-line" />
                <path d="M 495 432 L 495 500 L 732 500 L 732 585" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#vps-arr-slate)" className="flow-line" />
                <path d="M 495 432 L 495 500 L 867 500 L 867 585" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#vps-arr-slate)" className="flow-line" />
                <path d="M 495 432 L 495 500 L 987 500 L 987 585" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#vps-arr-slate)" className="flow-line" />

                <rect x="530" y="480" width="80" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="570" y="488" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">dispatches ops</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'vps_dw_auth', label: 'Authentication', sub: 'User login and session management controller', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'vps-backend/src/main/java/com/visionpublicschool/controller/AuthController.java', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="80" y="585" width="140" height="44" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="150" y="608" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Authentication</text>
                </g>
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'vps_dw_stud', label: 'Student Administration', sub: 'Admissions, enrollment & records', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'vps-backend/src/main/java/com/visionpublicschool/controller/AdminController.java', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="230" y="585" width="135" height="44" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="297" y="608" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="bold">Student Admin</text>
                </g>
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'vps_dw_acad', label: 'Academic Workflows', sub: 'Classes, syllabus and examination records', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'vps-backend/src/main/java/com/visionpublicschool/controller/FeatureController.java', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="375" y="585" width="130" height="44" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="440" y="608" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="bold">Academic Workflows</text>
                </g>
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'vps_dw_comm', label: 'Communication Features', sub: 'Doubt forum and student discussions', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'vps-backend/src/main/java/com/visionpublicschool/controller/DoubtController.java', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="515" y="585" width="140" height="44" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="585" y="608" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="bold">Communication</text>
                </g>
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'vps_dw_ops', label: 'School Operations', sub: 'Attendance, staff and campus events', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'vps-backend/src/main/java/com/visionpublicschool/controller', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="665" y="585" width="135" height="44" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="732" y="608" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="bold">School Operations</text>
                </g>
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'vps_dw_fin', label: 'Finance Reports', sub: 'Fee collection, invoices and ledger', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'vps-backend/src/main/java/com/visionpublicschool/controller/ReportController.java', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="810" y="585" width="125" height="44" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="872" y="608" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="bold">Finance Reports</text>
                </g>
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'vps_dw_med', label: 'Media Workflows', sub: 'Asset uploads and media catalog', category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', filePath: 'vps-backend/src/main/java/com/visionpublicschool/controller/AssetController.java', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                  <rect x="945" y="585" width="115" height="44" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                  <text x="1002" y="608" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="bold">Media</text>
                </g>

                <path d="M 150 629 L 150 710 L 250 710 L 250 785" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#vps-arr-slate)" className="flow-line" />
                <path d="M 297 629 L 297 785" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#vps-arr-slate)" className="flow-line" />
                <path d="M 440 629 L 440 785" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#vps-arr-slate)" className="flow-line" />
                <path d="M 585 629 L 585 710 L 380 710 L 380 785" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#vps-arr-slate)" className="flow-line" />

                <rect x="270" y="702" width="80" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="310" y="710" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">queries / persists</text>

                <path d="M 1002 629 L 1002 710 L 687 710 L 687 795" fill="none" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#vps-arr-indigo)" className="flow-line" />
                <rect x="710" y="702" width="70" height="14" rx="2" fill="#ffffff" stroke="#c7d2fe" strokeWidth="1" />
                <text x="745" y="710" textAnchor="middle" dominantBaseline="middle" fill="#3730a3" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">stores media</text>

                <path d="M 732 629 L 732 725 L 830 725 L 830 795" fill="none" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#vps-arr-indigo)" className="flow-line" />
                <rect x="785" y="718" width="60" height="14" rx="2" fill="#ffffff" stroke="#c7d2fe" strokeWidth="1" />
                <text x="815" y="726" textAnchor="middle" dominantBaseline="middle" fill="#3730a3" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">sends mail</text>

                <path d="M 872 629 L 872 735 L 977 735 L 977 795" fill="none" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#vps-arr-indigo)" className="flow-line" />
                <rect x="910" y="728" width="80" height="14" rx="2" fill="#ffffff" stroke="#c7d2fe" strokeWidth="1" />
                <text x="950" y="736" textAnchor="middle" dominantBaseline="middle" fill="#3730a3" fontSize="7.5" fontFamily="ui-monospace, monospace" fontWeight="600">notifies parents</text>

                {/* 5. Persistence Container */}
                <rect x="80" y="740" width="460" height="200" rx="8" fill="#fff1f2" stroke="#fecdd3" strokeWidth="1.5" />
                <text x="310" y="760" textAnchor="middle" fill="#be123c" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Persistence</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'vps_jpa', label: 'JPA Repositories', sub: 'Spring Data JPA repositories for MySQL', category: 'PERSISTENCE', type: 'JPA_REPO', filePath: 'vps-backend/src/main/java/com/visionpublicschool/repository', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="140" y="785" width="340" height="42" rx="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="310" y="808" textAnchor="middle" dominantBaseline="middle" fill="#be123c" fontSize="10.5" fontFamily="ui-monospace, monospace" fontWeight="bold">JPA Repositories</text>
                </g>

                <path d="M 310 827 L 310 865" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#vps-arr-slate)" className="flow-line" />
                <rect x="275" y="836" width="70" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="310" y="844" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">reads / writes</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'vps_mysql', label: 'MySQL Database', sub: 'Relational database schema storing school records', category: 'PERSISTENCE', type: 'DATABASE', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                  <rect x="230" y="865" width="160" height="46" rx="10" fill="#fee2e2" stroke="#f87171" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                  <text x="310" y="890" textAnchor="middle" dominantBaseline="middle" fill="#be123c" fontSize="10.5" fontFamily="ui-monospace, monospace" fontWeight="bold">MySQL Database</text>
                </g>

                {/* 6. External Integrations Container */}
                <rect x="600" y="740" width="460" height="200" rx="8" fill="#eff6ff" stroke="#c7d2fe" strokeWidth="1.5" />
                <text x="830" y="760" textAnchor="middle" fill="#3730a3" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">External Integrations</text>

                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'vps_cloudinary', label: 'Cloudinary Media', sub: 'Cloud media CDN hosting student photos and study materials', category: 'EXTERNAL', type: 'EXTERNAL', color: '#3730a3', bg: '#e0e7ff', border: '#6366f1' })}>
                  <rect x="630" y="795" width="115" height="42" rx="4" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" className="transition group-hover:stroke-indigo-600" />
                  <text x="687" y="818" textAnchor="middle" dominantBaseline="middle" fill="#3730a3" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Cloudinary Media</text>
                </g>
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'vps_email', label: 'Email Service [EmailService.java]', sub: 'SMTP & SendGrid email notification delivery service', category: 'EXTERNAL', type: 'EXTERNAL', filePath: 'vps-backend/src/main/java/com/visionpublicschool/service/EmailService.java', color: '#3730a3', bg: '#e0e7ff', border: '#6366f1' })}>
                  <rect x="765" y="795" width="130" height="42" rx="4" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" className="transition group-hover:stroke-indigo-600" />
                  <text x="830" y="812" textAnchor="middle" fill="#3730a3" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">Email Service</text>
                  <text x="830" y="826" textAnchor="middle" fill="#3730a3" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">[EmailService.java]</text>
                </g>
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'vps_whatsapp', label: 'WhatsApp Service', sub: 'Automated WhatsApp notice dispatcher for parents', category: 'EXTERNAL', type: 'EXTERNAL', filePath: 'vps-backend/src/main/java/com/visionpublicschool/service/WhatsAppService.java', color: '#3730a3', bg: '#e0e7ff', border: '#6366f1' })}>
                  <rect x="915" y="795" width="125" height="42" rx="4" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" className="transition group-hover:stroke-indigo-600" />
                  <text x="977" y="818" textAnchor="middle" dominantBaseline="middle" fill="#3730a3" fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="bold">WhatsApp Service</text>
                </g>
              </svg>
            ) : (
              /* ═══════════════════════════════════════════════════════════════════
                 DYNAMIC AI-POWERED GITDIAGRAM SYNTHESIS (FOR ANY GITHUB REPO)
                 ═══════════════════════════════════════════════════════════════════ */
              <svg
                viewBox="0 0 1120 1350"
                className="w-full h-auto drop-shadow-sm select-none"
                style={{ minWidth: '320px', maxWidth: '1120px' }}
              >
                <defs>
                  <style>{`
                    @keyframes flowForward {
                      from { stroke-dashoffset: 24; }
                      to { stroke-dashoffset: 0; }
                    }
                    .flow-line {
                      stroke-dasharray: ${isAnimationEnabled ? '6 4' : 'none'};
                      animation: ${isAnimationEnabled ? `flowForward ${flowSpeedSec} linear infinite` : 'none'};
                    }
                  `}</style>

                  <marker id="dyn-arr-slate" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" /></marker>
                  <marker id="dyn-arr-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" /></marker>
                  <marker id="dyn-arr-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#22c55e" /></marker>
                  <marker id="dyn-arr-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" /></marker>
                  <marker id="dyn-arr-rose" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e" /></marker>
                </defs>

                {/* 1. Dynamic Actors */}
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'dyn_actor_user', label: 'Client User', sub: `End user interacting with ${formattedProjectName}`, category: 'CLIENT', type: 'USER', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <circle cx="450" cy="45" r="26" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="450" y="49" textAnchor="middle" fill="#1e40af" fontSize="10.5" fontFamily="system-ui, sans-serif" fontWeight="bold">User</text>
                </g>
                <g className="cursor-pointer group" onClick={() => setSelectedNode({ id: 'dyn_actor_agent', label: 'API Client / Agent', sub: `Automated agent or external client querying ${formattedProjectName}`, category: 'CLIENT', type: 'USER', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                  <circle cx="670" cy="45" r="26" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                  <text x="670" y="49" textAnchor="middle" fill="#1e40af" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="bold">API Agent</text>
                </g>

                <path d="M 450 71 L 450 145" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#dyn-arr-slate)" className="flow-line" />
                <rect x="428" y="95" width="44" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="450" y="103" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">uses app</text>

                <path d="M 670 71 L 670 145" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#dyn-arr-slate)" className="flow-line" />
                <rect x="645" y="95" width="50" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="670" y="103" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">calls API</text>

                {/* 2. Client Experience / Entrypoints (Tone Blue) */}
                <rect x="140" y="125" width="840" height="175" rx="8" fill="#eff6ff" stroke="#bae6fd" strokeWidth="1.5" />
                <text x="560" y="145" textAnchor="middle" fill="#1e40af" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Client & Entrypoints ({dynamicArchitecture.clientNodes.length || 'UI'})</text>

                {(dynamicArchitecture.clientNodes.length > 0 ? dynamicArchitecture.clientNodes : [
                  { id: 'dyn_fe_main', data: { label: `${formattedProjectName} UI`, filePath: 'src/App.tsx' } },
                  { id: 'dyn_fe_view1', data: { label: 'Dashboard View', filePath: 'src/components/Dashboard.tsx' } },
                  { id: 'dyn_fe_view2', data: { label: 'Explorer View', filePath: 'src/components/Explorer.tsx' } }
                ]).map((node, i) => {
                  const x = 180 + i * 165;
                  const label = node.data?.label || node.id;
                  const path = node.data?.filePath || '';
                  return (
                    <g key={node.id} className="cursor-pointer group" onClick={() => setSelectedNode({ id: node.id, label, sub: `UI entrypoint component in ${formattedProjectName}`, filePath: path, category: 'CLIENT', type: 'REACT_APP', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6' })}>
                      <rect x={x} y="175" width="145" height="44" rx="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" className="transition group-hover:stroke-blue-700" />
                      <text x={x + 72} y="195" textAnchor="middle" fill="#1e40af" fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="bold">{label.slice(0, 18)}</text>
                      {path && <text x={x + 72} y="208" textAnchor="middle" fill="#1e40af" fontSize="7.5" fontFamily="ui-monospace, monospace" opacity="0.8">[{path.split('/').pop()?.slice(0, 16)}]</text>}
                    </g>
                  );
                })}

                {/* 3. API & Security Layer (Tone Amber) */}
                <rect x="140" y="360" width="840" height="175" rx="8" fill="#fffbeb" stroke="#fde047" strokeWidth="1.5" />
                <text x="560" y="380" textAnchor="middle" fill="#854d0e" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">API & Controllers ({dynamicArchitecture.apiNodes.length || 'API Gateway'})</text>

                {(dynamicArchitecture.apiNodes.length > 0 ? dynamicArchitecture.apiNodes : [
                  { id: 'dyn_api_1', data: { label: 'Primary REST API', filePath: 'src/main/server.ts' } },
                  { id: 'dyn_api_2', data: { label: 'Authentication Service', filePath: 'src/main/auth.ts' } },
                  { id: 'dyn_api_3', data: { label: 'Data Dispatcher', filePath: 'src/main/routes.ts' } }
                ]).map((node, i) => {
                  const x = 180 + i * 165;
                  const label = node.data?.label || node.id;
                  const path = node.data?.filePath || '';
                  return (
                    <g key={node.id} className="cursor-pointer group" onClick={() => setSelectedNode({ id: node.id, label, sub: `Controller endpoint in ${formattedProjectName}`, filePath: path, category: 'API_ACCESS', type: 'DOMAIN_CONTROLLER', color: '#854d0e', bg: '#fef9c3', border: '#eab308' })}>
                      <rect x={x} y="415" width="145" height="44" rx="4" fill="#fef9c3" stroke="#eab308" strokeWidth="1.5" className="transition group-hover:stroke-amber-600" />
                      <text x={x + 72} y="435" textAnchor="middle" fill="#854d0e" fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="bold">{label.slice(0, 18)}</text>
                      {path && <text x={x + 72} y="448" textAnchor="middle" fill="#854d0e" fontSize="7.5" fontFamily="ui-monospace, monospace" opacity="0.8">[{path.split('/').pop()?.slice(0, 16)}]</text>}
                    </g>
                  );
                })}

                {/* Client to API Connectors */}
                <path d="M 252 219 L 252 415" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#dyn-arr-slate)" className="flow-line" />
                <path d="M 417 219 L 417 415" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#dyn-arr-slate)" className="flow-line" />
                <path d="M 582 219 L 582 415" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#dyn-arr-slate)" className="flow-line" />
                <rect x="520" y="325" width="80" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="560" y="333" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">dispatches HTTP</text>

                {/* 4. Domain Workflows (Tone Mint / Green) */}
                <rect x="140" y="595" width="840" height="175" rx="8" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.5" />
                <text x="560" y="615" textAnchor="middle" fill="#15803d" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Domain Logic & Services ({dynamicArchitecture.domainNodes.length || 'Services'})</text>

                {(dynamicArchitecture.domainNodes.length > 0 ? dynamicArchitecture.domainNodes : [
                  { id: 'dyn_dom_1', data: { label: 'Execution Service', filePath: 'src/service/engine.ts' } },
                  { id: 'dyn_dom_2', data: { label: 'State Orchestrator', filePath: 'src/service/state.ts' } },
                  { id: 'dyn_dom_3', data: { label: 'Event Processor', filePath: 'src/service/events.ts' } }
                ]).map((node, i) => {
                  const x = 180 + i * 165;
                  const label = node.data?.label || node.id;
                  const path = node.data?.filePath || '';
                  return (
                    <g key={node.id} className="cursor-pointer group" onClick={() => setSelectedNode({ id: node.id, label, sub: `Domain business logic service in ${formattedProjectName}`, filePath: path, category: 'DOMAIN', type: 'DOMAIN_CONTROLLER', color: '#15803d', bg: '#dcfce7', border: '#22c55e' })}>
                      <rect x={x} y="650" width="145" height="44" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" className="transition group-hover:stroke-emerald-600" />
                      <text x={x + 72} y="670" textAnchor="middle" fill="#15803d" fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="bold">{label.slice(0, 18)}</text>
                      {path && <text x={x + 72} y="683" textAnchor="middle" fill="#15803d" fontSize="7.5" fontFamily="ui-monospace, monospace" opacity="0.8">[{path.split('/').pop()?.slice(0, 16)}]</text>}
                    </g>
                  );
                })}

                {/* API to Domain Connectors */}
                <path d="M 252 459 L 252 650" fill="none" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#dyn-arr-green)" className="flow-line" />
                <path d="M 417 459 L 417 650" fill="none" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#dyn-arr-green)" className="flow-line" />
                <path d="M 582 459 L 582 650" fill="none" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#dyn-arr-green)" className="flow-line" />
                <rect x="520" y="555" width="80" height="14" rx="2" fill="#ffffff" stroke="#bbf7d0" strokeWidth="1" />
                <text x="560" y="563" textAnchor="middle" dominantBaseline="middle" fill="#15803d" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">invokes domain</text>

                {/* 5. Persistence & State Storage (Cylinders - Tone Rose) */}
                <rect x="140" y="830" width="840" height="210" rx="8" fill="#fff1f2" stroke="#fecdd3" strokeWidth="1.5" />
                <text x="560" y="850" textAnchor="middle" fill="#be123c" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="bold">Persistence, State & Storage</text>

                {(dynamicArchitecture.storageNodes.length > 0 ? dynamicArchitecture.storageNodes : [
                  { id: 'dyn_db_1', data: { label: 'Primary State Store', filePath: 'schema.sql' } },
                  { id: 'dyn_db_2', data: { label: 'Cache & Queue', filePath: 'cache.db' } },
                  { id: 'dyn_db_3', data: { label: 'Relational DB', filePath: 'db.sqlite' } }
                ]).map((node, i) => {
                  const x = 220 + i * 220;
                  const label = node.data?.label || node.id;
                  const path = node.data?.filePath || '';
                  return (
                    <g key={node.id} className="cursor-pointer group" onClick={() => setSelectedNode({ id: node.id, label, sub: `Persistence storage schema for ${formattedProjectName}`, filePath: path, category: 'PERSISTENCE', type: 'DATABASE', color: '#be123c', bg: '#ffe4e6', border: '#f43f5e' })}>
                      <rect x={x} y="895" width="180" height="52" rx="14" fill="#fee2e2" stroke="#f87171" strokeWidth="1.5" className="transition group-hover:stroke-rose-600" />
                      <text x={x + 90} y="920" textAnchor="middle" fill="#be123c" fontSize="10" fontFamily="ui-monospace, monospace" fontWeight="bold">{label.slice(0, 20)}</text>
                      <text x={x + 90} y="934" textAnchor="middle" fill="#be123c" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.8">Storage Cylinder</text>
                    </g>
                  );
                })}

                {/* Domain to Storage Connectors */}
                <path d="M 252 694 L 252 895" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#dyn-arr-slate)" className="flow-line" />
                <path d="M 417 694 L 417 895" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#dyn-arr-slate)" className="flow-line" />
                <path d="M 582 694 L 582 895" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#dyn-arr-slate)" className="flow-line" />
                <rect x="520" y="790" width="80" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <text x="560" y="798" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">reads / writes</text>
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
