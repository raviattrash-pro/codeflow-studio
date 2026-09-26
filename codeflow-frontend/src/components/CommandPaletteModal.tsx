import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, X, Sparkles, Terminal, Database, ShieldCheck, Monitor, Globe, Users, Network, FileCode,
  Zap, Code2, Layers, Flame, Activity, FolderTree,
  Cpu, ArrowRight, Play, Moon, Sun, Key, Bot, HelpCircle,
  Box, ExternalLink, RefreshCw, GitPullRequest, CheckSquare, Cloud, Radio, Mic, Sliders
} from 'lucide-react';
import { ThemeMode } from './Header';

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Tools' | 'Scenarios' | 'AI Actions' | 'Themes' | 'Quick Actions';
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  badge?: string;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
  onSelectTool: (toolId: string) => void;
  onSelectScenario: (scenarioKey: 'checkout' | 'auth' | 'cache' | 'burst') => void;
  onSelectTheme: (theme: ThemeMode) => void;
  onTriggerAi: (prompt: string, analysisType: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
  onSelectTool,
  onSelectScenario,
  onSelectTheme,
  onTriggerAi,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const inputRef = useRef<HTMLInputElement>(null);

  const isLight = currentTheme === 'NORMAL' || currentTheme === 'GLASSMORPHISM' || currentTheme === 'NEUMORPHIC';

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const allCommands: CommandItem[] = useMemo(() => [
    // Tools
    // v10.0 Suite
    {
      id: 'tool-arch-gate',
      title: 'CI/CD Architecture Gate Dashboard',
      subtitle: 'Static AST rules validator enforcing layer separation, acyclic graphs, JPA & security rules',
      category: 'Tools',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      shortcut: 'G',
      action: () => { onClose(); onSelectTool('arch-gate'); },
      badge: 'v10.0',
    },
    // v9.0 Suite
    {
      id: 'tool-vscode',
      title: 'VS Code IDE Sidecar & Extension Generator',
      subtitle: 'Bidirectional WebSocket LSP sidecar & extension manifest compiler',
      category: 'Tools',
      icon: <Monitor className="w-4 h-4 text-blue-400" />,
      shortcut: 'S',
      action: () => { onClose(); onSelectTool('vscode'); },
      badge: 'v9.0',
    },
    {
      id: 'tool-chrome-ext',
      title: 'Chrome Extension & GitHub DOM Injector',
      subtitle: 'Manifest V3 extension injecting interactive overlays into GitHub PRs & file trees',
      category: 'Tools',
      icon: <Globe className="w-4 h-4 text-pink-400" />,
      action: () => { onClose(); onSelectTool('chrome-ext'); },
      badge: 'v9.0',
    },
    {
      id: 'tool-live-collab',
      title: 'WebRTC Live Architecture Review & Collab Room',
      subtitle: 'P2P cursor broadcasting, shared canvas markup and architecture review rooms',
      category: 'Tools',
      icon: <Users className="w-4 h-4 text-emerald-400" />,
      shortcut: 'L',
      action: () => { onClose(); onSelectTool('live-collab'); },
      badge: 'v9.0',
    },
    {
      id: 'tool-compliance',
      title: 'Zero-Trust SOC2 / ISO 27001 / HIPAA Matrix',
      subtitle: 'Automated compliance rule validator against parsed Spring Boot & React architecture',
      category: 'Tools',
      icon: <ShieldCheck className="w-4 h-4 text-teal-400" />,
      action: () => { onClose(); onSelectTool('compliance'); },
      badge: 'v9.0',
    },
    {
      id: 'tool-graphql-grpc',
      title: 'GraphQL SDL & gRPC Protobuf v3 Synthesizer',
      subtitle: 'Synthesize Schema Definition Language & Proto3 schemas from Spring Boot REST controllers',
      category: 'Tools',
      icon: <FileCode className="w-4 h-4 text-purple-400" />,
      action: () => { onClose(); onSelectTool('graphql-grpc'); },
      badge: 'v9.0',
    },
    {
      id: 'tool-service-mesh',
      title: 'Multi-Repo Service Mesh & Istio Topology',
      subtitle: 'Multi-service traffic visualizer, Envoy proxy sidecars & Istio VirtualService generator',
      category: 'Tools',
      icon: <Network className="w-4 h-4 text-cyan-400" />,
      shortcut: 'M',
      action: () => { onClose(); onSelectTool('service-mesh'); },
      badge: 'v9.0',
    },

    {
      id: 'tool-drift',
      title: 'Git PR Architecture Drift Inspector',
      subtitle: 'Compare pull request branches against main to detect layer boundary breaches',
      category: 'Tools',
      icon: <GitPullRequest className="w-4 h-4 text-amber-400" />,
      shortcut: 'G',
      action: () => { onClose(); onSelectTool('drift'); },
      badge: 'v8.0',
    },
    {
      id: 'tool-test-gen',
      title: 'Automated E2E Test Suite Generator',
      subtitle: 'Generate RestAssured and Playwright API tests from discovered AST endpoints',
      category: 'Tools',
      icon: <CheckSquare className="w-4 h-4 text-emerald-400" />,
      shortcut: 'E',
      action: () => { onClose(); onSelectTool('test-gen'); },
      badge: 'v8.0',
    },
    {
      id: 'tool-cloud-infra',
      title: 'Cloud Infrastructure & Docker / Terraform',
      subtitle: 'Auto-synthesize Docker Compose, AWS Terraform modules & Kubernetes manifests',
      category: 'Tools',
      icon: <Cloud className="w-4 h-4 text-sky-400" />,
      shortcut: 'D',
      action: () => { onClose(); onSelectTool('cloud-infra'); },
      badge: 'v8.0',
    },
    {
      id: 'tool-event-stream',
      title: 'Event Streams & Kafka / WebSockets',
      subtitle: 'Visualizes Kafka topic consumer groups and live WebSocket / SSE channels',
      category: 'Tools',
      icon: <Radio className="w-4 h-4 text-purple-400" />,
      shortcut: 'K',
      action: () => { onClose(); onSelectTool('event-stream'); },
      badge: 'v8.0',
    },
    {
      id: 'tool-dist-tracing',
      title: 'OpenTelemetry (OTel) Distributed Tracing',
      subtitle: 'Multi-service span waterfall with automated critical-path bottleneck isolation',
      category: 'Tools',
      icon: <Activity className="w-4 h-4 text-cyan-400" />,
      shortcut: 'O',
      action: () => { onClose(); onSelectTool('dist-tracing'); },
      badge: 'v8.0',
    },
    {
      id: 'tool-voice',
      title: 'Voice Architecture Copilot',
      subtitle: 'Speak natural hands-free commands to audit DB, simulate chaos & trigger AI',
      category: 'Tools',
      icon: <Mic className="w-4 h-4 text-pink-400" />,
      shortcut: 'V',
      action: () => { onClose(); onSelectTool('voice'); },
      badge: 'v8.0',
    },
    {
      id: 'tool-ai',
      title: 'AI Architecture Assistant',
      subtitle: 'Ask AST-aware intelligence questions & run 8 architecture audits',
      category: 'Tools',
      icon: <Bot className="w-4 h-4 text-purple-400" />,
      shortcut: 'A',
      action: () => { onClose(); onSelectTool('ai'); },
      badge: 'v6.0 RAG',
    },
    {
      id: 'tool-scorecard',
      title: 'Architecture Health Scorecard',
      subtitle: 'Real-time security, SQL efficiency, dependency & React 19 audit dials',
      category: 'Tools',
      icon: <Activity className="w-4 h-4 text-emerald-400" />,
      shortcut: 'H',
      action: () => { onClose(); onSelectTool('scorecard'); },
      badge: 'NEW',
    },
    {
      id: 'tool-api-sandbox',
      title: 'REST API Sandbox & cURL Runner',
      subtitle: 'Test endpoints, inject JWT auth, and export to cURL / Fetch / Axios / Python',
      category: 'Tools',
      icon: <Terminal className="w-4 h-4 text-cyan-400" />,
      shortcut: 'P',
      action: () => { onClose(); onSelectTool('api-sandbox'); },
      badge: 'NEW',
    },
    {
      id: 'tool-ts-generator',
      title: 'Java DTO ➔ TypeScript Generator',
      subtitle: 'Convert Spring Boot JPA entities & DTO records into TypeScript interfaces',
      category: 'Tools',
      icon: <Code2 className="w-4 h-4 text-blue-400" />,
      shortcut: 'T',
      action: () => { onClose(); onSelectTool('ts-generator'); },
      badge: 'NEW',
    },
    {
      id: 'tool-chaos',
      title: 'Chaos & Resilience Simulator',
      subtitle: 'Simulate connection pool exhaustion, Stripe timeouts & Redis stampedes',
      category: 'Tools',
      icon: <Flame className="w-4 h-4 text-rose-400" />,
      shortcut: 'C',
      action: () => { onClose(); onSelectTool('chaos'); },
      badge: 'NEW',
    },
    {
      id: 'tool-blueprint',
      title: '4K Architecture Blueprint Exporter',
      subtitle: 'Export C4 Level 1/2/3 diagrams as high-res 4K posters and RFC dossiers',
      category: 'Tools',
      icon: <Layers className="w-4 h-4 text-indigo-400" />,
      shortcut: 'B',
      action: () => { onClose(); onSelectTool('blueprint'); },
      badge: 'NEW',
    },
    {
      id: 'tool-react-runtime',
      title: 'React 19 Runtime Explorer',
      subtitle: 'Inspect Virtual DOM Fiber reconciliation & Hook mutation timeline',
      category: 'Tools',
      icon: <Cpu className="w-4 h-4 text-sky-400" />,
      shortcut: 'R',
      action: () => { onClose(); onSelectTool('react-runtime'); },
    },
    {
      id: 'tool-tracing',
      title: 'Runtime Tracing Replay (VCR)',
      subtitle: 'Step-by-step playback from React UI down to PostgreSQL SQL queries',
      category: 'Tools',
      icon: <Play className="w-4 h-4 text-amber-400" />,
      action: () => { onClose(); onSelectTool('tracing'); },
    },
    {
      id: 'tool-sql',
      title: 'Live SQL Query Explorer',
      subtitle: 'Captured JPA statements with execution durations and 1-click AI optimize',
      category: 'Tools',
      icon: <Database className="w-4 h-4 text-emerald-400" />,
      action: () => { onClose(); onSelectTool('sql'); },
    },
    {
      id: 'tool-erd',
      title: 'Database ER Diagram (Pan/Zoom)',
      subtitle: 'Interactive schema visualizer with primary & foreign key mappings',
      category: 'Tools',
      icon: <Database className="w-4 h-4 text-amber-400" />,
      action: () => { onClose(); onSelectTool('erd'); },
    },
    {
      id: 'tool-security',
      title: 'Spring Security 6 Flow',
      subtitle: 'Inspect CorsFilter, JwtAuthenticationFilter, and Authorization chain',
      category: 'Tools',
      icon: <ShieldCheck className="w-4 h-4 text-red-400" />,
      action: () => { onClose(); onSelectTool('security'); },
    },
    {
      id: 'tool-deps',
      title: 'Maven Dependency Graph',
      subtitle: 'Analyze starters, auto-configuration mechanics & CVE scans',
      category: 'Tools',
      icon: <Box className="w-4 h-4 text-purple-400" />,
      action: () => { onClose(); onSelectTool('deps'); },
    },
    {
      id: 'tool-file-tree',
      title: '5-Mode File Tree Visualizer',
      subtitle: 'Interactive Tree, ASCII, Emoji, Mermaid AST, and Galaxy 2D Canvas',
      category: 'Tools',
      icon: <FolderTree className="w-4 h-4 text-teal-400" />,
      action: () => { onClose(); onSelectTool('file-tree'); },
    },
    {
      id: 'tool-metrics',
      title: 'API Metrics & Telemetry',
      subtitle: 'Live P50/P90/P99 latency, throughput RPS, SLA status and error rates',
      category: 'Tools',
      icon: <Activity className="w-4 h-4 text-blue-400" />,
      action: () => { onClose(); onSelectTool('metrics'); },
    },

    // Scenarios
    {
      id: 'sc-checkout',
      title: 'Checkout Flow Scenario',
      subtitle: 'POST /api/v1/orders/checkout • 201 Created • 18.4ms (9 Nodes)',
      category: 'Scenarios',
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
      action: () => { onClose(); onSelectScenario('checkout'); },
    },
    {
      id: 'sc-auth',
      title: 'JWT Auth & Login Scenario',
      subtitle: 'POST /api/v1/auth/login • 200 OK • 12.1ms (7 Nodes)',
      category: 'Scenarios',
      icon: <ShieldCheck className="w-4 h-4 text-indigo-400" />,
      action: () => { onClose(); onSelectScenario('auth'); },
    },
    {
      id: 'sc-cache',
      title: 'Redis Cache Hit Scenario',
      subtitle: 'GET /api/v1/products/catalog • 200 OK • 2.4ms (4 Nodes)',
      category: 'Scenarios',
      icon: <Flame className="w-4 h-4 text-rose-400" />,
      action: () => { onClose(); onSelectScenario('cache'); },
    },
    {
      id: 'sc-burst',
      title: 'Burst Load & Circuit Breaker',
      subtitle: 'POST /api/v1/payments/process • 429 / 503 • 350.2ms',
      category: 'Scenarios',
      icon: <Activity className="w-4 h-4 text-amber-400" />,
      action: () => { onClose(); onSelectScenario('burst'); },
    },

    // AI Actions
    {
      id: 'ai-sec-audit',
      title: 'Run AI Security Audit',
      subtitle: 'Audit JWT validation, CORS origin policy, and filter chains',
      category: 'AI Actions',
      icon: <ShieldCheck className="w-4 h-4 text-red-400" />,
      action: () => { onClose(); onTriggerAi('Perform a comprehensive security audit of Spring Security and JWT configuration.', 'SECURITY'); },
    },
    {
      id: 'ai-sql-opt',
      title: 'Run AI SQL Query Optimization',
      subtitle: 'Scan captured SQL logs for missing indexes and query plan rewrites',
      category: 'AI Actions',
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
      action: () => { onClose(); onTriggerAi('Analyze captured SQL queries and suggest indexing strategies and query optimizations.', 'SQL_OPTIMIZE'); },
    },
    {
      id: 'ai-interview',
      title: 'Generate Technical Interview Questions',
      subtitle: 'Create Spring Boot 3 + React 19 architecture Q&A based on this codebase',
      category: 'AI Actions',
      icon: <HelpCircle className="w-4 h-4 text-pink-400" />,
      action: () => { onClose(); onTriggerAi('Generate deep technical interview questions covering Spring Boot lifecycle, JPA internals, and React 19 hooks for this architecture.', 'INTERVIEW'); },
    },

    // Themes
    {
      id: 'theme-night',
      title: 'Switch to Night Theme (Default)',
      subtitle: 'High-contrast dark obsidian IDE palette with neon accents',
      category: 'Themes',
      icon: <Moon className="w-4 h-4 text-indigo-400" />,
      action: () => { onClose(); onSelectTheme('NIGHT'); },
    },
    {
      id: 'theme-normal',
      title: 'Switch to Light Theme',
      subtitle: 'Clean high-contrast corporate white aesthetic',
      category: 'Themes',
      icon: <Sun className="w-4 h-4 text-amber-400" />,
      action: () => { onClose(); onSelectTheme('NORMAL'); },
    },
    {
      id: 'theme-glass',
      title: 'Switch to Glassmorphism Theme',
      subtitle: 'Translucent frosted backdrop blur styling',
      category: 'Themes',
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      action: () => { onClose(); onSelectTheme('GLASSMORPHISM'); },
    },
    {
      id: 'theme-neumorphic',
      title: 'Switch to Neumorphic Theme',
      subtitle: 'Tactile soft UI bevel and embossed shadows',
      category: 'Themes',
      icon: <Layers className="w-4 h-4 text-purple-400" />,
      action: () => { onClose(); onSelectTheme('NEUMORPHIC'); },
    },
  ], [onClose, onSelectTool, onSelectScenario, onSelectTheme, onTriggerAi]);

  const filteredCommands = useMemo(() => {
    return allCommands.filter((cmd) => {
      const matchesCategory = activeCategory === 'ALL' || cmd.category === activeCategory;
      const matchesQuery =
        !query.trim() ||
        cmd.title.toLowerCase().includes(query.toLowerCase()) ||
        (cmd.subtitle && cmd.subtitle.toLowerCase().includes(query.toLowerCase())) ||
        cmd.category.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [allCommands, query, activeCategory]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  const categories = ['ALL', 'Tools', 'Scenarios', 'AI Actions', 'Themes'];

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999999 }}>
      <div
        className={`w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col border my-auto modal-pop-in ${
          isLight
            ? 'bg-white border-slate-300 text-slate-900 shadow-2xl'
            : 'bg-[#090d18] border-slate-700/80 text-white shadow-[0_25px_80px_rgba(0,0,0,0.95)]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className={`p-4 border-b flex items-center space-x-3 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#060913] border-slate-800'
        }`}>
          <Search className="w-5 h-5 text-indigo-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, tool name, scenario, or theme..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`flex-1 bg-transparent border-none outline-none text-sm font-mono placeholder-slate-400 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          />
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
            isLight ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            ESC
          </span>
          <button onClick={onClose} className={`p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className={`px-4 py-2 border-b flex items-center space-x-1.5 overflow-x-auto text-xs font-mono shrink-0 ${
          isLight ? 'bg-slate-100/60 border-slate-200' : 'bg-slate-950/60 border-slate-800/60'
        }`}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:bg-slate-200'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-slate-400">
              No matching commands or tools found for "{query}"
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center justify-between font-mono ${
                    isSelected
                      ? isLight
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 shadow-sm'
                        : 'bg-indigo-950/50 border border-indigo-500/40 text-white shadow-md'
                      : isLight
                      ? 'hover:bg-slate-50 text-slate-800 border border-transparent'
                      : 'hover:bg-slate-900/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-2">
                    <div className={`p-2 rounded-xl border shrink-0 ${
                      isSelected
                        ? 'bg-indigo-500/20 border-indigo-500/30'
                        : isLight
                        ? 'bg-slate-100 border-slate-200'
                        : 'bg-[#0f172a] border-slate-700'
                    }`}>
                      {cmd.icon}
                    </div>
                    <div className="min-w-0 truncate">
                      <div className="flex items-center space-x-2 truncate">
                        <span className="text-xs font-bold truncate">{cmd.title}</span>
                        {cmd.badge && (
                          <span className="px-1.5 py-0.2 text-[9px] rounded font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            {cmd.badge}
                          </span>
                        )}
                      </div>
                      {cmd.subtitle && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5 font-sans">
                          {cmd.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-900 text-slate-400'
                    }`}>
                      {cmd.category}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-600'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Legend */}
        <div className={`px-4 py-2.5 border-t flex items-center justify-between text-[11px] font-mono shrink-0 ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#060913] border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center space-x-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-indigo-400 font-bold">CodeFlow Command Spotlight</span>
        </div>
      </div>
    </div>
  );
};
