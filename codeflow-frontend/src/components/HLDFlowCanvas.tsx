import React, { useState } from 'react';
import { GraphData } from '../types';
import { FlowStep } from './InteractiveFlowExplorer';
import { getAnnotationDetails } from '../utils/annotationDictionary';
import { getInterviewQuestionsForNode } from '../utils/interviewQuestions';
import {
  X, Sparkles, BookOpen, Code2, ArrowRight, Zap,
  FileCode, Smartphone, ShieldCheck, Cpu, Database,
  Layers, CheckCircle2, Server, Terminal, ExternalLink
} from 'lucide-react';
import { ThemeMode } from './Header';

interface HLDFlowCanvasProps {
  graphData: GraphData;
  flowSteps: FlowStep[];
  activeStepIndex: number;
  onSelectStep: (index: number) => void;
  onViewCode?: (filePath: string) => void;
  currentTheme?: ThemeMode;
}

interface BoxNode {
  id: string;
  label: string;
  sub: string;
  iconType: 'client' | 'gateway' | 'controller' | 'service' | 'database';
  col: string;
  bg: string;
  row: number;
  colIdx: number;
  nodeType: string;
  annotations?: string;
  filePath?: string;
  badge: string;
}

interface Arrow {
  fromId: string;
  toId: string;
  label: string;
  step?: number;
}

export const HLDFlowCanvas: React.FC<HLDFlowCanvasProps> = ({
  graphData,
  flowSteps,
  activeStepIndex,
  onSelectStep,
  onViewCode,
  currentTheme = 'NIGHT',
}) => {
  const [selectedBox, setSelectedBox] = useState<BoxNode | null>(null);

  const fe = (Array.isArray(graphData.nodes) ? graphData.nodes : []).filter((n) => n.data.layer === 'FRONTEND');
  const ctrl = (Array.isArray(graphData.nodes) ? graphData.nodes : []).filter((n) => n.data.nodeType === 'SPRING_CONTROLLER');
  const svc = (Array.isArray(graphData.nodes) ? graphData.nodes : []).filter((n) => n.data.nodeType === 'SPRING_SERVICE');
  const repo = (Array.isArray(graphData.nodes) ? graphData.nodes : []).filter((n) => n.data.nodeType === 'SPRING_REPOSITORY');
  const db = (Array.isArray(graphData.nodes) ? graphData.nodes : []).filter((n) => n.data.layer === 'DATABASE');

  const boxes: BoxNode[] = [];

  // Column 0: Clients
  fe.slice(0, 3).forEach((n, i) => boxes.push({
    id: n.id,
    label: n.data.label,
    sub: 'React Component SPA',
    iconType: 'client',
    col: '#06b6d4',
    bg: '#083344',
    row: i,
    colIdx: 0,
    nodeType: 'REACT_COMPONENT',
    annotations: n.data.annotations,
    filePath: n.data.filePath,
    badge: 'Client SPA',
  }));
  if (fe.length === 0) boxes.push({
    id: 'fe_placeholder',
    label: 'React Client',
    sub: 'Browser SPA UI',
    iconType: 'client',
    col: '#06b6d4',
    bg: '#083344',
    row: 0,
    colIdx: 0,
    nodeType: 'REACT_COMPONENT',
    annotations: '',
    badge: 'Client SPA',
  });

  // Column 1: API Gateway & Security
  boxes.push({
    id: 'api_gw',
    label: 'API Gateway',
    sub: 'Spring Security + JWT',
    iconType: 'gateway',
    col: '#6366f1',
    bg: '#1e1b4b',
    row: 0,
    colIdx: 1,
    nodeType: 'SPRING_CONTROLLER',
    annotations: '@RestController, @RequestMapping, CorsFilter, JwtAuthenticationFilter',
    badge: 'Gateway / Auth',
  });

  // Column 2: Controllers
  ctrl.slice(0, 4).forEach((n, i) => boxes.push({
    id: n.id,
    label: n.data.label,
    sub: n.data.endpointPath || '@RestController',
    iconType: 'controller',
    col: '#3b82f6',
    bg: '#1e3a8a',
    row: i,
    colIdx: 2,
    nodeType: 'SPRING_CONTROLLER',
    annotations: n.data.annotations,
    filePath: n.data.filePath,
    badge: '@RestController',
  }));
  if (ctrl.length === 0) boxes.push({
    id: 'ctrl_placeholder',
    label: 'MainController',
    sub: '/api/v1/resource',
    iconType: 'controller',
    col: '#3b82f6',
    bg: '#1e3a8a',
    row: 0,
    colIdx: 2,
    nodeType: 'SPRING_CONTROLLER',
    annotations: '',
    badge: '@RestController',
  });

  // Column 3: Services
  svc.slice(0, 4).forEach((n, i) => boxes.push({
    id: n.id,
    label: n.data.label,
    sub: '@Service + @Transactional',
    iconType: 'service',
    col: '#a855f7',
    bg: '#3b0764',
    row: i,
    colIdx: 3,
    nodeType: 'SPRING_SERVICE',
    annotations: n.data.annotations,
    filePath: n.data.filePath,
    badge: '@Service',
  }));
  if (svc.length === 0) boxes.push({
    id: 'svc_placeholder',
    label: 'BusinessService',
    sub: '@Service Business Layer',
    iconType: 'service',
    col: '#a855f7',
    bg: '#3b0764',
    row: 0,
    colIdx: 3,
    nodeType: 'SPRING_SERVICE',
    annotations: '',
    badge: '@Service',
  });

  // Column 4: DB & Cache
  db.slice(0, 3).forEach((n, i) => boxes.push({
    id: n.id,
    label: n.data.label,
    sub: n.data.nodeType === 'SPRING_REPOSITORY' ? 'JpaRepository' : '@Entity Table',
    iconType: 'database',
    col: '#f59e0b',
    bg: '#451a03',
    row: i,
    colIdx: 4,
    nodeType: n.data.nodeType,
    annotations: n.data.annotations,
    filePath: n.data.filePath,
    badge: n.data.nodeType === 'SPRING_REPOSITORY' ? 'JpaRepository' : 'SQL Table',
  }));
  if (db.length === 0) boxes.push({
    id: 'db_placeholder',
    label: 'AppDatabase',
    sub: 'JpaRepository / PostgreSQL',
    iconType: 'database',
    col: '#f59e0b',
    bg: '#451a03',
    row: 0,
    colIdx: 4,
    nodeType: 'DB_TABLE',
    annotations: '',
    badge: 'PostgreSQL DB',
  });

  // 100% Linear End-to-End Pipeline Arrows
  const arrows: Arrow[] = [];
  
  // Step 1: Client -> API Gateway
  const firstFe = boxes.find((b) => b.colIdx === 0);
  const gw = boxes.find((b) => b.id === 'api_gw');
  if (firstFe && gw) {
    arrows.push({ fromId: firstFe.id, toId: gw.id, label: 'HTTP Request', step: 1 });
  }

  // Step 2: API Gateway -> First Controller
  const firstCtrl = boxes.find((b) => b.colIdx === 2);
  if (gw && firstCtrl) {
    arrows.push({ fromId: gw.id, toId: firstCtrl.id, label: 'Filter & Dispatch', step: 2 });
  }

  // Step 3: Controller -> First Service
  const firstSvc = boxes.find((b) => b.colIdx === 3);
  if (firstCtrl && firstSvc) {
    arrows.push({ fromId: firstCtrl.id, toId: firstSvc.id, label: 'Invoke Service', step: 3 });
  }

  // Step 4: Service -> First DB/Repository
  const firstDb = boxes.find((b) => b.colIdx === 4);
  if (firstSvc && firstDb) {
    arrows.push({ fromId: firstSvc.id, toId: firstDb.id, label: 'SQL Query', step: 4 });
  }

  const colLabels = [
    { title: 'Clients', sub: 'React SPA / UI', icon: Smartphone, col: 'text-cyan-400' },
    { title: 'Gateway', sub: 'Security & Router', icon: ShieldCheck, col: 'text-indigo-400' },
    { title: 'Controllers', sub: 'REST Endpoints', icon: Cpu, col: 'text-blue-400' },
    { title: 'Services', sub: 'Business Logic', icon: Layers, col: 'text-purple-400' },
    { title: 'Persistence', sub: 'JPA & Databases', icon: Database, col: 'text-amber-400' },
  ];

  const getDataFlowSteps = (nodeType: string) => {
    if (nodeType === 'REACT_COMPONENT') {
      return [
        '1. User triggers browser event (onClick / onSubmit) in React UI component.',
        '2. Axios HTTP client serializes state payload into JSON DTO.',
        '3. Asynchronous fetch request sent over TLS connection to Spring Boot API gateway.',
      ];
    }
    if (nodeType === 'SPRING_CONTROLLER') {
      return [
        '1. Spring DispatcherServlet receives incoming HTTP request and resolves HandlerMapping.',
        '2. Controller method invoked with @RequestBody parameter binding and @Valid DTO bean validation.',
        '3. Business delegation call routed to @Service layer.',
      ];
    }
    if (nodeType === 'SPRING_SERVICE') {
      return [
        '1. Spring AOP proxy intercepts invocation to manage @Transactional boundary.',
        '2. Business validation and domain calculations executed.',
        '3. Data persistence delegation passed to JpaRepository / Hibernate session.',
      ];
    }
    if (nodeType === 'SPRING_REPOSITORY') {
      return [
        '1. PartTreeJpaQuery parses method name (e.g., findByUsername) into HQL / JPQL AST.',
        '2. HikariCP connection pool allocates a pooled JDBC connection.',
        '3. Result set returned from relational database and mapped into @Entity domain objects via Hibernate ORM.',
      ];
    }
    return [
      '1. Database engine query optimizer analyzes execution plan (index scan vs sequential scan).',
      '2. Query executes on target table indexes and returns raw ResultSet rows.',
      '3. Hibernate dirty-checking mechanism syncs entity state with L1 session cache.',
    ];
  };

  const selAnnotations = selectedBox ? getAnnotationDetails(selectedBox.annotations) : [];
  const selQA = selectedBox ? getInterviewQuestionsForNode(selectedBox.nodeType) : [];
  const selDataFlow = selectedBox ? getDataFlowSteps(selectedBox.nodeType) : [];

  const getCanvasBg = () => {
    switch (currentTheme) {
      case 'NEUMORPHIC': return 'bg-[#e0e5ec] text-[#2d3748]';
      case 'GLASSMORPHISM': return 'bg-[#eef2f6] text-slate-900';
      case 'NORMAL': return 'bg-[#f8fafc] text-slate-900';
      default: return 'bg-[#0a0f1c] text-slate-100';
    }
  };

  const renderIcon = (type: BoxNode['iconType'], col: string) => {
    switch (type) {
      case 'client': return <Smartphone className="w-4 h-4" style={{ color: col }} />;
      case 'gateway': return <ShieldCheck className="w-4 h-4" style={{ color: col }} />;
      case 'controller': return <Cpu className="w-4 h-4" style={{ color: col }} />;
      case 'service': return <Layers className="w-4 h-4" style={{ color: col }} />;
      case 'database': return <Database className="w-4 h-4" style={{ color: col }} />;
    }
  };

  return (
    <div className={`flex-1 flex overflow-hidden relative ${getCanvasBg()}`}>
      {/* Main 5-Column Architecture Grid */}
      <div className="flex-1 overflow-auto custom-scrollbar p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-12 min-w-[300px] md:min-w-[1150px] h-full items-start">
          {colLabels.map((colMeta, ci) => {
            const colBoxes = boxes.filter((b) => b.colIdx === ci);
            if (colBoxes.length === 0) return null;
            const HeaderIcon = colMeta.icon;

            return (
              <div key={ci} className="flex flex-col gap-5 items-center w-full relative">
                {/* Sleek Column Header */}
                <div className="w-full pb-3 mb-1 border-b border-slate-700/30 flex items-center justify-between px-1">
                  <div className="flex items-center space-x-2">
                    <HeaderIcon className={`w-4 h-4 ${colMeta.col}`} />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
                      {colMeta.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {colBoxes.length} {colBoxes.length === 1 ? 'node' : 'nodes'}
                  </span>
                </div>

                {colBoxes.map((b) => {
                  const isSel = selectedBox?.id === b.id;
                  const outgoingArrows = arrows.filter((a) => a.fromId === b.id);

                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBox(isSel ? null : b)}
                      className={`relative w-full max-w-[220px] mx-auto p-4 rounded-xl cursor-pointer transition-all duration-200 group ${
                        isSel
                          ? 'ring-2 ring-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.35)] scale-[1.02]'
                          : 'hover:scale-[1.01] hover:shadow-lg'
                      } ${
                        currentTheme === 'NEUMORPHIC'
                          ? 'bg-[#e0e5ec] shadow-[6px_6px_12px_#a3b1c6,-6px_-6px_12px_#ffffff] border border-white/60 text-slate-800'
                          : currentTheme === 'GLASSMORPHISM'
                          ? 'bg-white/80 backdrop-blur-xl border border-white/80 shadow-md text-slate-900'
                          : currentTheme === 'NORMAL'
                          ? 'bg-white border border-slate-200 shadow-sm text-slate-900'
                          : 'bg-[#0f172a]/95 border border-slate-800/90 text-slate-100 hover:border-slate-700'
                      }`}
                      style={
                        currentTheme === 'NIGHT'
                          ? { borderLeft: `3px solid ${b.col}` }
                          : { borderLeft: `3px solid ${b.col}` }
                      }
                    >
                      {/* Top Meta Row: Badge & Type */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div
                          className="p-1.5 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${b.col}18` }}
                        >
                          {renderIcon(b.iconType, b.col)}
                        </div>
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-tight truncate max-w-[130px]"
                          style={{
                            backgroundColor: `${b.col}15`,
                            color: b.col,
                            border: `1px solid ${b.col}33`,
                          }}
                        >
                          {b.badge}
                        </span>
                      </div>

                      {/* Main Node Label */}
                      <div className="font-mono text-xs font-bold leading-tight truncate mb-1 text-slate-100 group-hover:text-indigo-300 transition-colors">
                        {b.label}
                      </div>

                      {/* Subtitle / Path */}
                      <div className="font-mono text-[10px] text-slate-400 truncate opacity-80">
                        {b.sub}
                      </div>

                      {/* Outgoing Connectors / Pipeline Badges */}
                      <div className="hidden md:block">
                        {outgoingArrows.map((arr, i) => {
                          const isActive = arr.step !== undefined && arr.step - 1 === activeStepIndex;

                          return (
                            <div
                              key={i}
                              className="absolute top-1/2 left-full -translate-y-1/2 flex items-center z-20 pointer-events-none"
                              style={{ width: '48px' }}
                            >
                              <div
                                className={`flex-1 h-[2px] ${
                                  isActive
                                    ? 'bg-gradient-to-r from-pink-500 to-indigo-500 shadow-[0_0_10px_#ec4899] animate-pulse'
                                    : 'bg-slate-700/70'
                                }`}
                              />
                              <div
                                className={`w-2 h-2 ${
                                  isActive ? 'border-pink-500' : 'border-slate-500'
                                } border-t-2 border-r-2 transform rotate-45 -ml-1`}
                              />
                              {arr.step && (
                                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                                  <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shadow-md ${
                                      isActive
                                        ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white scale-110 ring-2 ring-white/50 animate-bounce'
                                        : 'bg-slate-900 text-slate-300 border border-slate-700'
                                    }`}
                                  >
                                    {arr.step}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Non-Colliding Side-by-Side Inspector Drawer Panel */}
      {selectedBox && (
        <div
          className={`w-96 shrink-0 border-l h-full overflow-y-auto custom-scrollbar p-6 space-y-6 z-30 transition-all ${
            currentTheme === 'NEUMORPHIC'
              ? 'bg-[#e0e5ec] border-[#c0cbdc] text-[#2d3748] shadow-[inset_4px_4px_8px_#a3b1c6]'
              : currentTheme === 'GLASSMORPHISM'
              ? 'bg-white/95 backdrop-blur-2xl border-white text-slate-900 shadow-2xl'
              : currentTheme === 'NORMAL'
              ? 'bg-white border-slate-200 text-slate-900 shadow-2xl'
              : 'bg-[#0f172a] border-slate-800 text-slate-100 shadow-2xl'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div
                className="p-2 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${selectedBox.col}22` }}
              >
                {renderIcon(selectedBox.iconType, selectedBox.col)}
              </div>
              <div>
                <h3 className="font-bold text-sm font-mono text-slate-100">{selectedBox.label}</h3>
                <span className="text-[11px] font-mono text-slate-400">{selectedBox.badge}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedBox(null)}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section: Execution Flow Path */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider mb-2.5 flex items-center space-x-1.5 text-indigo-400">
              <Zap className="w-3.5 h-3.5" />
              <span>Data Flow Execution Path</span>
            </h4>
            <div className="space-y-2">
              {selDataFlow.map((st, i) => (
                <div
                  key={i}
                  className="text-xs font-mono p-3 rounded-xl border border-slate-800/80 bg-slate-900/60 leading-relaxed text-slate-300"
                >
                  {st}
                </div>
              ))}
            </div>
          </div>

          {/* Section: Annotations */}
          {selAnnotations.length > 0 && (
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider mb-2.5 flex items-center space-x-1.5 text-pink-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Framework Annotations</span>
              </h4>
              <div className="space-y-2">
                {selAnnotations.map((ann, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-slate-800/80 bg-slate-900/60 space-y-1"
                  >
                    <span className="text-xs font-mono font-bold text-pink-400 block">{ann.name}</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{ann.whyUsed}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Interview Q&A */}
          {selQA.length > 0 && (
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider mb-2.5 flex items-center space-x-1.5 text-amber-400">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Interview Deep Dive</span>
              </h4>
              <div className="space-y-2.5">
                {selQA.map((qa, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-slate-800/80 bg-slate-900/60 space-y-1.5"
                  >
                    <span className="text-xs font-mono font-bold text-amber-300 block">{qa.question}</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{qa.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Source Code Action Button */}
          {selectedBox.filePath && onViewCode && (
            <button
              onClick={() => onViewCode(selectedBox.filePath!)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <FileCode className="w-4 h-4" />
              <span>Inspect Source Code</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
