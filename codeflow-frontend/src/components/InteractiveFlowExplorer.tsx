import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GraphData } from '../types';
import { HLDFlowCanvas } from './HLDFlowCanvas';
import { getAnnotationDetails } from '../utils/annotationDictionary';
import { getInterviewQuestionsForNode } from '../utils/interviewQuestions';
import {
  Play, Pause, SkipBack, SkipForward,
  User, Server, Database, CheckCircle2,
  Sparkles, Layers, FileCode, Workflow, ArrowRight,
  BookOpen, Code2, ArrowDown, Clock, Zap, ShieldCheck,
  Tag, ChevronRight, Package, Box, Search, ChevronDown, Filter, X
} from 'lucide-react';

import { ThemeMode } from './Header';

interface InteractiveFlowExplorerProps {
  graphData: GraphData;
  onSelectNode: (nodeId: string) => void;
  selectedNodeId?: string;
  onViewCode?: (filePath: string) => void;
  currentTheme?: ThemeMode;
}

export interface FlowStep {
  id: string;
  stepNumber: number;
  nodeId: string;
  nodeType: string;
  layer: 'FRONTEND' | 'BACKEND' | 'DATABASE';
  title: string;
  subtitle: string;
  filePath?: string;
  methodName?: string;
  httpMethod?: string;
  endpointPath?: string;
  annotationsCsv?: string;
  description: string;
  dataPayload?: string;
}

export interface FeatureScenario {
  id: string;
  name: string;
  icon: string;
  endpoint: string;
  httpMethod: string;
  description: string;
  color: string;
  steps: FlowStep[];
  subGraphData: GraphData;
}

// Clean noisy endpoint parameters like value = /users and fix double slashes //
const cleanEndpointPath = (path: string): string => {
  if (!path) return '/api/v1';
  let clean = path;
  clean = clean.replace(/value\s*=\s*/g, '');
  clean = clean.replace(/path\s*=\s*/g, '');
  clean = clean.replace(/["']/g, '');
  clean = clean.replace(/[{}]/g, '');
  clean = clean.split(',')[0].trim();
  clean = clean.replace(/\/+/g, '/'); // fix double slashes //
  if (!clean.startsWith('/')) clean = '/' + clean;
  return clean;
};

// Clean method/controller labels into human readable names
const cleanFeatureName = (name: string): string => {
  if (!name) return 'Feature Flow';
  let clean = name.replace('Flow', '').replace('Controller', '').replace('.java', '').trim();
  clean = clean.replace(/\(\)/g, '');
  clean = clean.replace(/([A-Z])/g, ' $1').trim();
  return `${clean} Flow`;
};

export const InteractiveFlowExplorer: React.FC<InteractiveFlowExplorerProps> = ({
  graphData,
  onSelectNode,
  selectedNodeId,
  onViewCode,
  currentTheme = 'NIGHT',
}) => {
  const [viewMode, setViewMode] = useState<'HLD_DIAGRAM' | 'STEP_TIMELINE'>('HLD_DIAGRAM');
  const [activeFeatureId, setActiveFeatureId] = useState<string>('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(2500);

  // Searchable feature dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [featureSearch, setFeatureSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeCardRef = useRef<HTMLDivElement>(null);

  // Close feature dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamically extract Feature Scenarios directly from parsed codebase graph
  const featureScenarios: FeatureScenario[] = useMemo(() => {
    const nodes = Array.isArray(graphData.nodes) ? graphData.nodes : [];
    const edges = Array.isArray(graphData.edges) ? graphData.edges : [];

    const controllers = nodes.filter((n) => n.data.nodeType === 'SPRING_CONTROLLER');
    const services = nodes.filter((n) => n.data.nodeType === 'SPRING_SERVICE');
    const repos = nodes.filter((n) => n.data.nodeType === 'SPRING_REPOSITORY');
    const dbTables = nodes.filter((n) => n.data.layer === 'DATABASE');
    const feComponents = nodes.filter((n) => n.data.layer === 'FRONTEND');

    // Helper to pick icon for feature
    const getFeatureIcon = (name: string) => {
      const lower = name.toLowerCase();
      if (lower.includes('auth') || lower.includes('login') || lower.includes('security')) return '🔐';
      if (lower.includes('file') || lower.includes('snippet') || lower.includes('code')) return '📁';
      if (lower.includes('graph') || lower.includes('diagram') || lower.includes('tree')) return '📊';
      if (lower.includes('gift') || lower.includes('item') || lower.includes('product')) return '🎁';
      if (lower.includes('order') || lower.includes('pay') || lower.includes('cart')) return '🛒';
      if (lower.includes('user') || lower.includes('profile') || lower.includes('admin')) return '👤';
      if (lower.includes('story') || lower.includes('post') || lower.includes('media')) return '📜';
      if (lower.includes('config') || lower.includes('setting') || lower.includes('inquiry')) return '⚙️';
      return '⚡';
    };

    const scenarios: FeatureScenario[] = [];

    if (controllers.length > 0) {
      controllers.forEach((ctrl, idx) => {
        const rawLabel = ctrl.data.label || 'APIController';
        const featureTitle = cleanFeatureName(rawLabel);
        const prefix = rawLabel.replace('Controller', '').toLowerCase();

        // Match associated service, repo, db by name similarity or fallback index
        const matchedSvc = services.find((s) => (s.data.label || '').toLowerCase().includes(prefix)) || services[idx % Math.max(1, services.length)];
        const matchedRepo = repos.find((r) => (r.data.label || '').toLowerCase().includes(prefix)) || repos[idx % Math.max(1, repos.length)];
        const matchedDb = dbTables.find((d) => (d.data.label || '').toLowerCase().includes(prefix)) || dbTables[idx % Math.max(1, dbTables.length)];
        const matchedFe = feComponents[idx % Math.max(1, feComponents.length)];

        const httpMethod = (ctrl.data.httpMethod || 'GET').toUpperCase();
        const endpointPath = cleanEndpointPath(ctrl.data.endpointPath || `/api/v1/${prefix}`);

        const steps: FlowStep[] = [
          {
            id: `${ctrl.id}_step1`,
            stepNumber: 1,
            nodeId: matchedFe?.id || 'fe_comp',
            nodeType: 'REACT_COMPONENT',
            layer: 'FRONTEND',
            title: matchedFe?.data.label || `${rawLabel.replace('Controller', '')}View.tsx`,
            subtitle: 'React Component Event Listener',
            filePath: matchedFe?.data.filePath || `src/components/${rawLabel.replace('Controller', '')}View.tsx`,
            description: `User interacts with UI component. Event handler validates inputs and dispatches HTTP ${httpMethod} request to ${endpointPath}.`,
            dataPayload: `{ "action": "FETCH_${prefix.toUpperCase()}", "timestamp": "${new Date().toISOString()}" }`,
          },
          {
            id: `${ctrl.id}_step2`,
            stepNumber: 2,
            nodeId: 'api_client',
            nodeType: 'REACT_API_CALL',
            layer: 'FRONTEND',
            title: `${httpMethod} ${endpointPath}`,
            subtitle: 'Axios REST API Client',
            description: `Axios serializes payload to JSON, attaches Bearer JWT authorization headers, and dispatches HTTP request.`,
            dataPayload: `Headers: { Authorization: "Bearer eyJhbGci..." }`,
          },
          {
            id: `${ctrl.id}_step3`,
            stepNumber: 3,
            nodeId: ctrl.id,
            nodeType: 'SPRING_CONTROLLER',
            layer: 'BACKEND',
            title: ctrl.data.label,
            subtitle: `@RestController (${httpMethod} ${endpointPath})`,
            filePath: ctrl.data.filePath,
            methodName: ctrl.data.methodName || 'handleRequest',
            httpMethod,
            endpointPath,
            annotationsCsv: ctrl.data.annotations || `@RestController, @RequestMapping("${endpointPath}")`,
            description: `Spring Boot DispatcherServlet routes incoming request to ${ctrl.data.label}. @Valid validates incoming request DTO.`,
            dataPayload: `Parsed ${rawLabel.replace('Controller', '')}DTO payload`,
          },
        ];

        if (matchedSvc) {
          steps.push({
            id: `${ctrl.id}_step4`,
            stepNumber: 4,
            nodeId: matchedSvc.id,
            nodeType: 'SPRING_SERVICE',
            layer: 'BACKEND',
            title: matchedSvc.data.label,
            subtitle: '@Service Business Logic Engine',
            filePath: matchedSvc.data.filePath,
            methodName: matchedSvc.data.methodName || 'processBusinessRules',
            annotationsCsv: matchedSvc.data.annotations || '@Service, @Transactional',
            description: `${matchedSvc.data.label} enforces domain logic and coordinates database operations inside @Transactional boundary.`,
            dataPayload: 'Business State & ACID Transaction',
          });
        }

        if (matchedRepo) {
          steps.push({
            id: `${ctrl.id}_step5`,
            stepNumber: 5,
            nodeId: matchedRepo.id,
            nodeType: 'SPRING_REPOSITORY',
            layer: 'BACKEND',
            title: matchedRepo.data.label,
            subtitle: '@Repository Spring Data JPA',
            filePath: matchedRepo.data.filePath,
            methodName: matchedRepo.data.methodName || 'findData',
            annotationsCsv: matchedRepo.data.annotations || '@Repository, @Autowired',
            description: `Repository parses method signature into JPQL/HQL query and retrieves connection from HikariCP pool.`,
            dataPayload: `JpaRepository.${matchedRepo.data.methodName || 'execute'}(...)`,
          });
        }

        if (matchedDb) {
          steps.push({
            id: `${ctrl.id}_step6`,
            stepNumber: steps.length + 1,
            nodeId: matchedDb.id,
            nodeType: 'DB_TABLE',
            layer: 'DATABASE',
            title: matchedDb.data.label,
            subtitle: `@Entity (${matchedDb.data.targetEntity || 'JPA Model'})`,
            filePath: matchedDb.data.filePath,
            annotationsCsv: matchedDb.data.annotations || '@Entity, @Table, @Id',
            description: `SQL statement executes on database engine. Result set mapped back to Java Entities via Hibernate ORM.`,
            dataPayload: `SELECT * FROM ${matchedDb.data.label.replace('Table: ', '').replace('table: ', '')} WHERE ...`,
          });
        }

        // Subgraph for this feature
        const subNodeSet = new Set<string>([
          ctrl.id,
          matchedSvc?.id,
          matchedRepo?.id,
          matchedDb?.id,
          matchedFe?.id,
        ].filter(Boolean) as string[]);

        const subNodes = nodes.filter((n) => subNodeSet.has(n.id));
        const subEdges = edges.filter((e) => subNodeSet.has(e.source) && subNodeSet.has(e.target));

        scenarios.push({
          id: ctrl.id,
          name: featureTitle,
          icon: getFeatureIcon(featureTitle),
          endpoint: endpointPath,
          httpMethod,
          description: `Parsed flow for ${ctrl.data.label} handling HTTP ${httpMethod} ${endpointPath}`,
          color: idx % 4 === 0 ? 'border-purple-500 bg-purple-950/30 text-purple-300' : idx % 4 === 1 ? 'border-cyan-500 bg-cyan-950/30 text-cyan-300' : idx % 4 === 2 ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300' : 'border-amber-500 bg-amber-950/30 text-amber-300',
          steps,
          subGraphData: {
            nodes: subNodes.length > 0 ? subNodes : nodes,
            edges: subEdges,
          },
        });
      });
    }

    // Fallback if no controllers parsed in graph
    if (scenarios.length === 0) {
      scenarios.push({
        id: 'default_api',
        name: 'REST API & Execution Flow',
        icon: '⚡',
        endpoint: '/api/v1/resource',
        httpMethod: 'POST',
        description: 'Standard execution flow tracing frontend component, REST controller, service, and DB entities',
        color: 'border-indigo-500 bg-indigo-950/30 text-indigo-300',
        steps: getSampleFlowSteps(),
        subGraphData: graphData,
      });
    }

    return scenarios;
  }, [graphData]);

  // Sync active feature ID when scenarios change
  useEffect(() => {
    if (featureScenarios.length > 0) {
      const exists = featureScenarios.some((f) => f.id === activeFeatureId);
      if (!exists) {
        setActiveFeatureId(featureScenarios[0].id);
      }
    }
  }, [featureScenarios, activeFeatureId]);

  // Active feature scenario
  const activeFeature = useMemo(() => {
    return featureScenarios.find((f) => f.id === activeFeatureId) || featureScenarios[0];
  }, [featureScenarios, activeFeatureId]);

  // Filtered scenarios for dropdown search
  const filteredScenarios = useMemo(() => {
    if (!featureSearch.trim()) return featureScenarios;
    const term = featureSearch.toLowerCase();
    return featureScenarios.filter(
      (f) =>
        (f.name || '').toLowerCase().includes(term) ||
        (f.endpoint || '').toLowerCase().includes(term) ||
        (f.httpMethod || '').toLowerCase().includes(term)
    );
  }, [featureScenarios, featureSearch]);

  const activeSteps = activeFeature?.steps || [];

  // Reset step index when feature changes
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [activeFeatureId]);

  // Auto-play timer
  useEffect(() => {
    let t: any;
    if (isPlaying && activeSteps.length > 0) {
      t = setInterval(() => {
        setCurrentStepIndex((p) => {
          if (p >= activeSteps.length - 1) {
            setIsPlaying(false);
            return p;
          }
          return p + 1;
        });
      }, playbackSpeed);
    }
    return () => clearInterval(t);
  }, [isPlaying, playbackSpeed, activeSteps.length]);

  // Auto-scroll to active card
  useEffect(() => {
    activeCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentStepIndex]);

  const activeStep = activeSteps[currentStepIndex] || activeSteps[0] || getSampleFlowSteps()[0];
  const activeAnnotations = getAnnotationDetails(activeStep.annotationsCsv);
  const activeQA = getInterviewQuestionsForNode(activeStep.nodeType);

  const layerColor = (l: string) =>
    l === 'FRONTEND'
      ? { border: 'border-cyan-500', bg: 'bg-cyan-500', text: 'text-cyan-400', glow: 'shadow-cyan-500/30', badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' }
      : l === 'DATABASE'
      ? { border: 'border-amber-500', bg: 'bg-amber-500', text: 'text-amber-400', glow: 'shadow-amber-500/30', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30' }
      : { border: 'border-indigo-500', bg: 'bg-indigo-500', text: 'text-indigo-400', glow: 'shadow-indigo-500/30', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' };

  const layerIcon = (l: string) =>
    l === 'FRONTEND' ? <User className="w-4 h-4" /> : l === 'DATABASE' ? <Database className="w-4 h-4" /> : <Server className="w-4 h-4" />;

  const getMethodBadge = (method: string) => {
    const m = (method || 'GET').toUpperCase();
    if (m === 'GET') return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    if (m === 'POST') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (m === 'PUT') return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (m === 'DELETE') return 'bg-red-500/20 text-red-300 border-red-500/40';
    return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
  };

  const getToolbarBg = () => {
    switch (currentTheme) {
      case 'NEUMORPHIC': return 'bg-[#e0e5ec] border-b border-[#c0cbdc] text-[#2d3748]';
      case 'GLASSMORPHISM': return 'bg-white/70 backdrop-blur-md border-b border-white/80 text-slate-900';
      case 'NORMAL': return 'bg-white border-b border-slate-200 text-slate-900';
      default: return 'bg-[#0a0e1a] border-b border-slate-800 text-slate-100';
    }
  };

  const getDropdownBtnStyle = () => {
    switch (currentTheme) {
      case 'NEUMORPHIC': return 'bg-[#e0e5ec] text-[#2d3748] shadow-[4px_4px_8px_#a3b1c6,-4px_-4px_8px_#ffffff] border border-white/80';
      case 'GLASSMORPHISM': return 'bg-white/80 backdrop-blur-md text-slate-900 border border-white shadow-xs';
      case 'NORMAL': return 'bg-slate-100 text-slate-800 border border-slate-300';
      default: return 'bg-slate-900 border border-slate-700/80 text-white shadow-lg';
    }
  };

  const getDropdownMenuStyle = () => {
    switch (currentTheme) {
      case 'NEUMORPHIC': return 'bg-[#e0e5ec] text-[#2d3748] border-[#c0cbdc] shadow-[14px_14px_28px_#a3b1c6,-14px_-14px_28px_#ffffff]';
      case 'GLASSMORPHISM': return 'bg-white text-slate-900 border-slate-200 shadow-2xl';
      case 'NORMAL': return 'bg-white text-slate-900 border-slate-200 shadow-2xl';
      default: return 'bg-[#0b0f19] text-slate-100 border-slate-700 shadow-2xl';
    }
  };

  const getDropdownItemBg = (isSel: boolean) => {
    if (isSel) {
      return currentTheme === 'NEUMORPHIC' ? '#d0d7e2' : currentTheme === 'NIGHT' ? '#1f1329' : '#f1f5f9';
    }
    return currentTheme === 'NEUMORPHIC' ? '#e0e5ec' : currentTheme === 'NIGHT' ? '#0b0f19' : '#ffffff';
  };

  return (
    <div className={`flex-1 flex flex-col overflow-hidden relative ${
      currentTheme === 'NEUMORPHIC' ? 'bg-[#e0e5ec] text-[#2d3748]' :
      currentTheme === 'GLASSMORPHISM' ? 'bg-[#eef2f6] text-slate-900' :
      currentTheme === 'NORMAL' ? 'bg-[#f8fafc] text-slate-900' :
      'bg-slate-950 text-slate-100'
    }`}>
      {/* ─── SLEEK UNIFIED CONTROL TOOLBAR ─── */}
      <div className={`h-14 px-4 flex items-center justify-between z-50 shrink-0 relative ${getToolbarBg()}`}>
        {/* Left: Feature Search Dropdown & Top Quick Chips */}
        <div className="flex items-center space-x-3 flex-1 min-w-0" ref={dropdownRef}>
          {/* Main Feature Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${getDropdownBtnStyle()}`}
            >
              <span className="text-base select-none">{activeFeature?.icon}</span>
              <div className="flex items-center space-x-2 truncate">
                <span className="font-bold">{activeFeature?.name}</span>
                <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${getMethodBadge(activeFeature?.httpMethod || 'GET')}`}>
                  {activeFeature?.httpMethod}
                </span>
                <span className="text-[10px] opacity-70 font-mono truncate max-w-[160px] hidden md:inline">
                  {activeFeature?.endpoint}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform ${isDropdownOpen ? 'rotate-180 text-pink-500' : ''}`} />
            </button>

            {/* 100% Solid Opaque Dropdown Menu */}
            {isDropdownOpen && (
              <div
                className={`absolute left-0 top-full mt-2 w-96 rounded-2xl border overflow-hidden z-[9999] flex flex-col max-h-96 tools-dropdown ${getDropdownMenuStyle()}`}
                style={{
                  backgroundColor: currentTheme === 'NEUMORPHIC' ? '#e0e5ec' : currentTheme === 'NIGHT' ? '#0b0f19' : '#ffffff',
                  opacity: 1,
                  zIndex: 999999,
                }}
              >
                {/* Search Bar */}
                <div
                  className="p-3 border-b flex items-center justify-between"
                  style={{
                    backgroundColor: currentTheme === 'NEUMORPHIC' ? '#d8e0ec' : currentTheme === 'NIGHT' ? '#070a12' : '#f8fafc',
                    opacity: 1,
                  }}
                >
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                    <input
                      type="text"
                      placeholder={`Search ${featureScenarios.length} feature flows...`}
                      value={featureSearch}
                      onChange={(e) => setFeatureSearch(e.target.value)}
                      className="w-full border rounded-xl pl-8 pr-3 py-1 text-xs focus:outline-none font-mono"
                      style={{
                        backgroundColor: currentTheme === 'NEUMORPHIC' ? '#e0e5ec' : currentTheme === 'NORMAL' ? '#ffffff' : '#0f172a',
                        color: currentTheme === 'NIGHT' ? '#f8fafc' : '#0f172a',
                        opacity: 1,
                      }}
                    />
                  </div>
                  <span className="text-[10px] opacity-60 font-mono ml-2">{filteredScenarios.length} endpoints</span>
                </div>

                {/* Scenarios List */}
                <div
                  className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-500/20"
                  style={{
                    backgroundColor: currentTheme === 'NEUMORPHIC' ? '#e0e5ec' : currentTheme === 'NIGHT' ? '#0b0f19' : '#ffffff',
                    opacity: 1,
                  }}
                >
                  {filteredScenarios.map((feat) => {
                    const isSel = feat.id === activeFeature?.id;
                    return (
                      <button
                        key={feat.id}
                        onClick={() => {
                          setActiveFeatureId(feat.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left p-3 flex items-start space-x-3 transition-colors font-mono ${
                          isSel ? 'border-l-4 border-pink-500 font-bold' : ''
                        }`}
                        style={{
                          backgroundColor: getDropdownItemBg(isSel),
                          opacity: 1,
                        }}
                      >
                        <span className="text-lg mt-0.5 select-none">{feat.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-bold">
                              {feat.name}
                            </span>
                            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${getMethodBadge(feat.httpMethod)}`}>
                              {feat.httpMethod}
                            </span>
                          </div>
                          <p className="text-[10px] opacity-70 truncate font-mono">{feat.endpoint}</p>
                        </div>
                      </button>
                    );
                  })}
                  {filteredScenarios.length === 0 && (
                    <div className="p-6 text-center opacity-50 text-xs font-mono">No matching feature flows found.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Access Chips */}
          <div className="hidden xl:flex items-center space-x-1.5 overflow-hidden">
            {featureScenarios.slice(0, 3).map((feat) => {
              const isSel = feat.id === activeFeature?.id;
              return (
                <button
                  key={feat.id}
                  onClick={() => setActiveFeatureId(feat.id)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-mono border transition-all ${
                    isSel
                      ? 'border-pink-500 text-pink-500 font-bold shadow-md bg-pink-500/10'
                      : currentTheme === 'NEUMORPHIC'
                      ? 'bg-[#e0e5ec] text-[#2d3748] shadow-[inset_2px_2px_4px_#a3b1c6,inset_-2px_-2px_4px_#ffffff] border-white/60'
                      : currentTheme === 'NORMAL'
                      ? 'bg-slate-100 text-slate-800 border-slate-300'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{feat.icon}</span>
                  <span className="truncate max-w-[100px]">{feat.name.replace(' Flow', '')}</span>
                </button>
              );
            })}

            {featureScenarios.length > 3 && (
              <button
                onClick={() => setIsDropdownOpen(true)}
                className="px-2.5 py-1 rounded-xl text-[10px] font-mono text-pink-500 bg-pink-500/10 border border-pink-500/30 hover:bg-pink-500/20 transition-all shrink-0 font-bold"
              >
                +{featureScenarios.length - 3} More
              </button>
            )}
          </div>
        </div>

        {/* Right: View Mode Segmented Control & Playback */}
        <div className="flex items-center space-x-3 shrink-0 ml-4">
          {/* Mode Switcher Segmented Control */}
          <div className={`flex items-center space-x-1 p-1 rounded-xl border ${
            currentTheme === 'NEUMORPHIC' ? 'bg-[#e0e5ec] border-[#c0cbdc] shadow-[inset_3px_3px_6px_#a3b1c6,inset_-3px_-3px_6px_#ffffff]' :
            currentTheme === 'GLASSMORPHISM' ? 'bg-white/80 border-white text-slate-900' :
            currentTheme === 'NORMAL' ? 'bg-slate-100 border-slate-300 text-slate-900' :
            'bg-slate-900 border-slate-800'
          }`}>
            <button
              onClick={() => setViewMode('HLD_DIAGRAM')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                viewMode === 'HLD_DIAGRAM'
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30 font-bold'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>Diagram</span>
            </button>

            <button
              onClick={() => setViewMode('STEP_TIMELINE')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                viewMode === 'STEP_TIMELINE'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Steps</span>
            </button>
          </div>

          {/* Playback Pill & Counter */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-xs font-mono shadow-md shadow-pink-600/30"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              <span>{isPlaying ? 'Pause' : 'Play Flow'}</span>
            </button>

            <div className={`hidden sm:flex items-center space-x-1 text-xs font-mono px-2.5 py-1.5 rounded-xl border ${
              currentTheme === 'NEUMORPHIC' ? 'bg-[#e0e5ec] border-[#c0cbdc] text-[#2d3748]' :
              currentTheme === 'GLASSMORPHISM' ? 'bg-white/80 border-white text-slate-900' :
              currentTheme === 'NORMAL' ? 'bg-white border-slate-300 text-slate-900' :
              'bg-slate-900 border-slate-800 text-slate-300'
            }`}>
              <span className="font-bold text-pink-500">{currentStepIndex + 1}</span>
              <span className="opacity-40">/</span>
              <span className="opacity-70">{activeSteps.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN Explorer CONTENT ─── */}
      {viewMode === 'HLD_DIAGRAM' ? (
        <HLDFlowCanvas
          graphData={activeFeature?.subGraphData || graphData}
          flowSteps={activeSteps}
          activeStepIndex={currentStepIndex}
          onSelectStep={(i) => setCurrentStepIndex(i)}
          onViewCode={onViewCode}
          currentTheme={currentTheme}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* ─── LEFT: Vertical Timeline of Feature Steps ─── */}
          <div className="w-[480px] overflow-y-auto custom-scrollbar border-r border-slate-800 bg-slate-950 shrink-0">
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{activeFeature?.icon}</span>
                  <div>
                    <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">{activeFeature?.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">{activeFeature?.httpMethod} {activeFeature?.endpoint}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-pink-500/10 text-pink-300 border border-pink-500/30">
                  {activeSteps.length} Steps
                </span>
              </div>

              <div className="relative">
                <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-cyan-500 via-indigo-500 via-purple-500 to-amber-500 opacity-30" />

                {activeSteps.map((step, idx) => {
                  const isActive = idx === currentStepIndex;
                  const isPassed = idx < currentStepIndex;
                  const lc = layerColor(step.layer);

                  return (
                    <div
                      key={step.id + idx}
                      ref={isActive ? activeCardRef : undefined}
                      onClick={() => {
                        setCurrentStepIndex(idx);
                        onSelectNode(step.nodeId);
                      }}
                      className="relative pl-12 pb-5 cursor-pointer group"
                    >
                      <div
                        className={`absolute left-[7px] top-1 w-[24px] h-[24px] rounded-full flex items-center justify-center text-[10px] font-bold font-mono z-10 border-2 transition-all ${
                          isActive
                            ? `${lc.bg} text-white border-white shadow-lg ${lc.glow} scale-125`
                            : isPassed
                            ? 'bg-emerald-600 text-white border-emerald-400'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        {isPassed ? <CheckCircle2 className="w-3 h-3" /> : step.stepNumber}
                      </div>

                      <div
                        className={`p-4 rounded-2xl border transition-all ${
                          isActive
                            ? `border-l-4 ${lc.border} bg-slate-900/80 shadow-xl`
                            : isPassed
                            ? 'border-slate-800 bg-slate-900/40 opacity-75'
                            : 'border-slate-800/50 bg-slate-900/20 opacity-50 group-hover:opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 text-[9px] font-bold font-mono rounded-full border ${lc.badge}`}>
                              {step.layer}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{step.subtitle}</span>
                          </div>
                          {step.filePath && onViewCode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewCode(step.filePath!);
                              }}
                              className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] text-slate-300 border border-slate-700 font-mono transition-all"
                            >
                              <FileCode className="w-3 h-3 text-indigo-400" />
                              <span>Code</span>
                            </button>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-white font-mono">{step.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{step.description}</p>

                        {step.dataPayload && isActive && (
                          <div className="mt-2 p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px] text-emerald-400">
                            <span className="text-slate-500">payload: </span>
                            {step.dataPayload}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ─── RIGHT: Active Feature Step Deep-Dive Inspector ─── */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-900/40 p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Active Step Header Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${layerColor(activeStep.layer).bg} shadow-lg ${
                      layerColor(activeStep.layer).glow
                    }`}
                  >
                    {layerIcon(activeStep.layer)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold text-pink-400">
                        Feature Step {activeStep.stepNumber} of {activeSteps.length}
                      </span>
                      <span className={`px-2 py-0.5 text-[9px] font-bold font-mono rounded-full border ${layerColor(activeStep.layer).badge}`}>
                        {activeStep.layer}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white font-mono mt-0.5">{activeStep.title}</h3>
                    <p className="text-xs text-slate-400 font-mono">{activeStep.subtitle}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{activeStep.description}</p>

                {activeStep.filePath && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <code className="text-[10px] text-slate-400 font-mono break-all">{activeStep.filePath}</code>
                    {onViewCode && (
                      <button
                        onClick={() => onViewCode(activeStep.filePath!)}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold font-mono hover:bg-indigo-600/40 transition-all shrink-0 ml-3"
                      >
                        <Code2 className="w-3 h-3" />
                        <span>View Source</span>
                      </button>
                    )}
                  </div>
                )}

                {activeStep.dataPayload && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 font-mono text-xs">
                    <span className="text-emerald-400 font-bold">Data Payload: </span>
                    <span className="text-emerald-300">{activeStep.dataPayload}</span>
                  </div>
                )}
              </div>

              {/* Purpose & Role in Architecture */}
              <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Purpose & Role in Architecture</span>
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {activeStep.nodeType === 'REACT_COMPONENT' &&
                    'React UI component that renders the user interface, handles user events (onClick, onChange, onSubmit), manages local state with useState/useReducer hooks, and triggers API calls via Axios/Fetch to the Spring Boot backend.'}
                  {activeStep.nodeType === 'REACT_API_CALL' &&
                    'HTTP REST client layer. Serializes request payload to JSON, attaches Authorization headers (Bearer JWT), handles CORS, and manages response lifecycle including error boundaries and loading states.'}
                  {activeStep.nodeType === 'SPRING_CONTROLLER' &&
                    'REST API endpoint handler. Receives incoming HTTP requests from the client, validates request parameters and body using @Valid annotations, delegates business logic to @Service beans, and returns ResponseEntity<T> JSON responses.'}
                  {activeStep.nodeType === 'SPRING_SERVICE' &&
                    'Core business logic engine. Enforces domain rules, performs data transformations, coordinates multiple repository calls within @Transactional boundaries (ensuring ACID guarantees), and applies cross-cutting concerns like caching and security.'}
                  {activeStep.nodeType === 'SPRING_REPOSITORY' &&
                    'Data Access Object (DAO) layer. Extends JpaRepository<T, ID> to provide CRUD operations, custom JPQL/HQL queries, pagination support, and automatic SQL generation from method names (e.g., findByUsername). Handles connection pooling via HikariCP.'}
                  {activeStep.nodeType === 'DB_TABLE' &&
                    'Persistent storage layer. Maps Java @Entity classes to relational database tables. Hibernate ORM generates DDL schema, manages dirty checking, first-level cache (L1), and optimistic locking.'}
                </p>
              </div>

              {/* Data Flow Through This Component */}
              <div className="p-5 rounded-2xl bg-cyan-950/15 border border-cyan-500/20">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Data Flow Through This Component</span>
                </h4>
                <div className="space-y-2.5">
                  {activeStep.layer === 'FRONTEND' && (
                    <>
                      <div className="flex items-start space-x-2 text-xs text-slate-300">
                        <ArrowDown className="w-3 h-3 text-cyan-400 mt-0.5 shrink-0" />
                        <span>User triggers event → React state update → Axios HTTP request</span>
                      </div>
                      <div className="flex items-start space-x-2 text-xs text-slate-300">
                        <ArrowDown className="w-3 h-3 text-cyan-400 mt-0.5 shrink-0" />
                        <span>Request payload serialized to JSON with Content-Type header</span>
                      </div>
                      <div className="flex items-start space-x-2 text-xs text-slate-300">
                        <ArrowDown className="w-3 h-3 text-cyan-400 mt-0.5 shrink-0" />
                        <span>Response received → setState → Virtual DOM reconciliation → re-render</span>
                      </div>
                    </>
                  )}
                  {activeStep.layer === 'BACKEND' && activeStep.nodeType === 'SPRING_CONTROLLER' && (
                    <>
                      <div className="flex items-start space-x-2 text-xs text-slate-300">
                        <ArrowDown className="w-3 h-3 text-indigo-400 mt-0.5 shrink-0" />
                        <span>DispatcherServlet → HandlerMapping → RequestMappingHandlerAdapter</span>
                      </div>
                      <div className="flex items-start space-x-2 text-xs text-slate-300">
                        <ArrowDown className="w-3 h-3 text-indigo-400 mt-0.5 shrink-0" />
                        <span>@RequestBody → Jackson ObjectMapper deserializes JSON to DTO</span>
                      </div>
                      <div className="flex items-start space-x-2 text-xs text-slate-300">
                        <ArrowDown className="w-3 h-3 text-indigo-400 mt-0.5 shrink-0" />
                        <span>@Valid triggers Bean Validation → Delegates to @Service → Returns ResponseEntity</span>
                      </div>
                    </>
                  )}
                  {activeStep.layer === 'BACKEND' && activeStep.nodeType === 'SPRING_SERVICE' && (
                    <>
                      <div className="flex items-start space-x-2 text-xs text-slate-300">
                        <ArrowDown className="w-3 h-3 text-purple-400 mt-0.5 shrink-0" />
                        <span>@Transactional opens JDBC connection via PlatformTransactionManager</span>
                      </div>
                      <div className="flex items-start space-x-2 text-xs text-slate-300">
                        <ArrowDown className="w-3 h-3 text-purple-400 mt-0.5 shrink-0" />
                        <span>Business rules execute → calls @Repository methods within transaction</span>
                      </div>
                      <div className="flex items-start space-x-2 text-xs text-slate-300">
                        <ArrowDown className="w-3 h-3 text-purple-400 mt-0.5 shrink-0" />
                        <span>On success → TransactionInterceptor commits; on RuntimeException → rollback</span>
                      </div>
                    </>
                  )}
                  {activeStep.layer === 'BACKEND' && activeStep.nodeType === 'SPRING_REPOSITORY' && (
                    <>
                      <div className="flex items-start space-x-2 text-xs text-slate-300">
                        <ArrowDown className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                        <span>Method name parsed by PartTreeJpaQuery → generates JPQL/HQL</span>
                      </div>
                      <div className="flex items-start space-x-2 text-xs text-slate-300">
                        <ArrowDown className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                        <span>HikariCP provides pooled JDBC connection to database</span>
                      </div>
                      <div className="flex items-start space-x-2 text-xs text-slate-300">
                        <ArrowDown className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                        <span>ResultSet mapped to @Entity POJOs via Hibernate persistence context</span>
                      </div>
                    </>
                  )}
                  {activeStep.layer === 'DATABASE' && (
                    <>
                      <div className="flex items-start space-x-2 text-xs text-slate-300">
                        <ArrowDown className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                        <span>Hibernate generates SQL from entity metadata & dialect</span>
                      </div>
                      <div className="flex items-start space-x-2 text-xs text-slate-300">
                        <ArrowDown className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                        <span>Query optimizer plans execution → index scan or sequential scan</span>
                      </div>
                      <div className="flex items-start space-x-2 text-xs text-slate-300">
                        <ArrowDown className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                        <span>ResultSet returned → Hibernate dirty-checks & populates L1 cache</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Framework Annotations & Internal Mechanics */}
              {activeAnnotations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Framework Annotations & Internal Mechanics</span>
                  </h4>
                  {activeAnnotations.map((ann, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-900 border border-purple-500/20">
                      <span className="font-mono text-xs font-bold text-pink-400 px-2 py-0.5 rounded-lg bg-pink-500/10 border border-pink-500/20 inline-block">
                        {ann.name}
                      </span>
                      <p className="text-xs text-slate-200 mt-2 leading-relaxed">{ann.whyUsed}</p>
                      <p className="text-[11px] text-purple-300/90 font-mono mt-2 pt-2 border-t border-slate-800">
                        ⚙️ <span className="text-slate-400 font-semibold">Under the hood:</span> {ann.internalWorking}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Interview Q&A */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Interview Questions & Detailed Answers</span>
                </h4>
                {activeQA.map((qa, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <p className="text-xs font-bold text-indigo-300 leading-relaxed">Q: {qa.question}</p>
                    <p className="text-xs text-slate-300 leading-relaxed mt-2 pt-2 border-t border-slate-800">
                      <span className="font-bold text-emerald-400">Answer: </span>
                      {qa.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function getSampleFlowSteps(): FlowStep[] {
  return [
    {
      id: 's1', stepNumber: 1, nodeId: 'n1', nodeType: 'REACT_COMPONENT', layer: 'FRONTEND',
      title: 'LoginButton.tsx', subtitle: 'React Event Listener (onClick)', annotationsCsv: '',
      description: 'User submits authentication form. React handleLogin() event triggers form validation.', dataPayload: '{ username: "user@example.com" }'
    },
    {
      id: 's2', stepNumber: 2, nodeId: 'n2', nodeType: 'REACT_API_CALL', layer: 'FRONTEND',
      title: 'POST /api/v1/auth/login', subtitle: 'Axios REST API Client', annotationsCsv: '',
      description: 'Axios sends HTTP POST request over network to Spring Boot backend.', dataPayload: 'Content-Type: application/json'
    },
    {
      id: 's3', stepNumber: 3, nodeId: 'n3', nodeType: 'SPRING_CONTROLLER', layer: 'BACKEND',
      title: 'AuthController.java', subtitle: '@RestController Handler', annotationsCsv: '@RestController, @PostMapping, @RequestBody',
      description: 'DispatcherServlet delegates request to AuthController. Request DTO validated.', dataPayload: 'LoginRequest DTO'
    },
    {
      id: 's4', stepNumber: 4, nodeId: 'n4', nodeType: 'SPRING_SERVICE', layer: 'BACKEND',
      title: 'AuthenticationService.java', subtitle: '@Service Business Logic', annotationsCsv: '@Service, @Transactional',
      description: 'Service checks password hashes and invokes UserRepository to fetch user details.', dataPayload: 'BCrypt Password Check'
    },
    {
      id: 's5', stepNumber: 5, nodeId: 'n5', nodeType: 'SPRING_REPOSITORY', layer: 'BACKEND',
      title: 'UserRepository.java', subtitle: '@Repository Spring Data JPA', annotationsCsv: '@Repository, @Autowired',
      description: 'Repository invokes findByUsername() query using Hibernate ORM session.', dataPayload: 'JpaRepository.findByUsername()'
    },
    {
      id: 's6', stepNumber: 6, nodeId: 'n6', nodeType: 'DB_TABLE', layer: 'DATABASE',
      title: 'users Table', subtitle: '@Entity Persistent Table', annotationsCsv: '@Entity, @Table, @Id',
      description: 'SQL SELECT executes on PostgreSQL. Result set returned to Spring Service layer.', dataPayload: 'SELECT * FROM users WHERE username = ?'
    },
  ];
}
