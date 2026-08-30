import React, { useState } from 'react';
import { GraphData } from '../types';
import { FlowStep } from './InteractiveFlowExplorer';
import { getAnnotationDetails } from '../utils/annotationDictionary';
import { getInterviewQuestionsForNode } from '../utils/interviewQuestions';
import { X, Sparkles, BookOpen, Code2, ArrowRight, ArrowDown, Zap, FileCode } from 'lucide-react';
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
  icon: string;
  col: string;
  bg: string;
  row: number;
  colIdx: number;
  nodeType: string;
  annotations?: string;
  filePath?: string;
}

interface Arrow {
  fromId: string;
  toId: string;
  label: string;
  step?: number;
}

export const HLDFlowCanvas: React.FC<HLDFlowCanvasProps> = ({
  graphData, flowSteps, activeStepIndex, onSelectStep, onViewCode, currentTheme = 'NIGHT',
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
    id: n.id, label: n.data.label, sub: 'React Component',
    icon: '📱', col: '#0284c7', bg: '#083344',
    row: i, colIdx: 0, nodeType: 'REACT_COMPONENT',
    annotations: n.data.annotations, filePath: n.data.filePath,
  }));
  if (fe.length === 0) boxes.push({
    id: 'fe_placeholder', label: 'React Client', sub: 'Browser SPA',
    icon: '📱', col: '#0284c7', bg: '#083344',
    row: 0, colIdx: 0, nodeType: 'REACT_COMPONENT', annotations: '',
  });

  // Column 1: API Gateway & Security
  boxes.push({
    id: 'api_gw', label: 'API Gateway', sub: 'Spring Security + JWT',
    icon: '🛡️', col: '#4f46e5', bg: '#1e1b4b',
    row: 0, colIdx: 1, nodeType: 'SPRING_CONTROLLER',
    annotations: '@RestController, @RequestMapping, CorsFilter, JwtAuthenticationFilter',
  });

  // Column 2: Controllers
  ctrl.slice(0, 4).forEach((n, i) => boxes.push({
    id: n.id, label: n.data.label, sub: n.data.endpointPath || '@RestController',
    icon: '⚡', col: '#2563eb', bg: '#1e3a8a',
    row: i, colIdx: 2, nodeType: 'SPRING_CONTROLLER',
    annotations: n.data.annotations, filePath: n.data.filePath,
  }));
  if (ctrl.length === 0) boxes.push({
    id: 'ctrl_placeholder', label: 'MainController', sub: '/api/v1/resource',
    icon: '⚡', col: '#2563eb', bg: '#1e3a8a',
    row: 0, colIdx: 2, nodeType: 'SPRING_CONTROLLER', annotations: '',
  });

  // Column 3: Services
  svc.slice(0, 4).forEach((n, i) => boxes.push({
    id: n.id, label: n.data.label, sub: '@Service + @Transactional',
    icon: '🛠️', col: '#9333ea', bg: '#3b0764',
    row: i, colIdx: 3, nodeType: 'SPRING_SERVICE',
    annotations: n.data.annotations, filePath: n.data.filePath,
  }));
  if (svc.length === 0) boxes.push({
    id: 'svc_placeholder', label: 'BusinessService', sub: '@Service',
    icon: '🛠️', col: '#9333ea', bg: '#3b0764',
    row: 0, colIdx: 3, nodeType: 'SPRING_SERVICE', annotations: '',
  });

  // Column 4: DB & Cache
  db.slice(0, 3).forEach((n, i) => boxes.push({
    id: n.id, label: n.data.label, sub: n.data.nodeType === 'SPRING_REPOSITORY' ? 'JpaRepository' : '@Entity Table',
    icon: n.data.nodeType === 'SPRING_REPOSITORY' ? '⚡' : '🗄️',
    col: '#d97706', bg: '#451a03',
    row: i, colIdx: 4, nodeType: n.data.nodeType,
    annotations: n.data.annotations, filePath: n.data.filePath,
  }));
  if (db.length === 0) boxes.push({
    id: 'db_placeholder', label: 'AppDatabase', sub: 'JpaRepository / PostgreSQL',
    icon: '🗄️', col: '#d97706', bg: '#451a03',
    row: 0, colIdx: 4, nodeType: 'DB_TABLE', annotations: '',
  });

  // Clean 100% Linear End-to-End Pipeline Arrows
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

  const colLabels = ['Clients', 'API Gateway', 'Controllers', 'Services', 'DB & Cache'];

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

  const getCardStyle = (b: BoxNode, isSel: boolean) => {
    if (currentTheme === 'NEUMORPHIC') {
      return {
        backgroundColor: '#e0e5ec',
        boxShadow: isSel
          ? 'inset 6px 6px 12px #a3b1c6, inset -6px -6px 12px #ffffff'
          : '9px 9px 18px #a3b1c6, -9px -9px 18px #ffffff',
        border: '1px solid rgba(255, 255, 255, 0.7)',
        color: '#2d3748',
        borderRadius: '24px',
      };
    }
    if (currentTheme === 'GLASSMORPHISM') {
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 10px 30px rgba(31, 38, 135, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        color: '#0f172a',
        borderRadius: '24px',
      };
    }
    if (currentTheme === 'NORMAL') {
      return {
        backgroundColor: '#ffffff',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        border: `2px solid ${b.col}44`,
        color: '#0f172a',
        borderRadius: '24px',
      };
    }
    return {
      backgroundColor: `${b.bg}CC`,
      border: `1px solid ${b.col}33`,
      color: '#ffffff',
    };
  };

  return (
    <div className={`flex-1 flex overflow-hidden relative ${getCanvasBg()}`}>
      {/* Main 5-Column Canvas Workspace */}
      <div className="flex-1 overflow-auto custom-scrollbar p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-16 min-w-[300px] md:min-w-[1100px] h-full items-start">
          {colLabels.map((lbl, ci) => {
            const colBoxes = boxes.filter((b) => b.colIdx === ci);
            if (colBoxes.length === 0) return null;
            return (
              <div key={ci} className="flex flex-col gap-6 md:gap-10 items-center w-full relative">
                <div className="text-center mb-2">
                  <h2
                    className={`font-bold uppercase tracking-widest text-sm font-mono ${
                      currentTheme === 'NEUMORPHIC' ? 'text-[#2d3748]' :
                      currentTheme === 'NORMAL' || currentTheme === 'GLASSMORPHISM' ? 'text-slate-900 font-extrabold' :
                      'text-white'
                    }`}
                  >
                    {lbl}
                  </h2>
                </div>

                {colBoxes.map((b) => {
                  const isSel = selectedBox?.id === b.id;
                  const outgoingArrows = arrows.filter((a) => a.fromId === b.id);
                  const cardStyle = getCardStyle(b, isSel);

                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBox(isSel ? null : b)}
                      className={`relative w-full max-w-[220px] mx-auto p-6 md:p-8 cursor-pointer flex flex-col items-center justify-center text-center transition-all ${
                        currentTheme === 'NIGHT' ? 'clay-card' : 'hover:-translate-y-1'
                      } ${isSel ? 'selected ring-2 ring-indigo-500' : ''}`}
                      style={cardStyle}
                    >
                      <div className="text-5xl md:text-6xl mb-4 drop-shadow-lg">{b.icon}</div>
                      <div
                        className={`font-mono text-sm md:text-base font-bold mb-2 ${
                          currentTheme === 'NIGHT' ? '' : 'text-slate-900 font-extrabold'
                        }`}
                        style={{ color: currentTheme === 'NIGHT' ? b.col : undefined }}
                      >
                        {b.label.length > 20 ? b.label.slice(0, 20) + '…' : b.label}
                      </div>

                      <div
                        className={`inline-block px-3 py-1 rounded-full text-[10px] md:text-xs font-mono font-bold ${
                          currentTheme === 'NEUMORPHIC' ? 'shadow-[inset_3px_3px_6px_#a3b1c6,inset_-3px_-3px_6px_#ffffff] bg-[#e0e5ec] text-[#2d3748]' :
                          currentTheme === 'GLASSMORPHISM' ? 'glass-gel-pill' :
                          currentTheme === 'NORMAL' ? 'bg-slate-100 text-slate-800 border border-slate-300' :
                          'opacity-90'
                        }`}
                        style={currentTheme === 'NIGHT' ? { color: b.col, borderColor: b.col + '66', backgroundColor: b.col + '15' } : undefined}
                      >
                        {b.nodeType.replace('SPRING_', '').replace('_', ' ')}
                      </div>

                      {/* Connection Arrows & Centered Step Badges */}
                      <div className="hidden md:block">
                        {outgoingArrows.map((arr, i) => {
                          const isActive = arr.step !== undefined && arr.step - 1 === activeStepIndex;

                          const getStepBadgeStyle = () => {
                            if (isActive) {
                              return 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.8)] scale-110 border border-white';
                            }
                            if (currentTheme === 'NEUMORPHIC') {
                              return 'bg-[#e0e5ec] text-[#2d3748] shadow-[4px_4px_8px_#a3b1c6,-4px_-4px_8px_#ffffff] border border-white/80';
                            }
                            if (currentTheme === 'GLASSMORPHISM') {
                              return 'bg-white/90 backdrop-blur-md text-slate-900 border border-white shadow-md';
                            }
                            if (currentTheme === 'NORMAL') {
                              return 'bg-white text-slate-900 border border-slate-300 shadow-md';
                            }
                            return 'bg-slate-900 text-slate-200 border border-slate-700 shadow-md';
                          };

                          return (
                            <div key={i} className="absolute top-1/2 left-full -translate-y-1/2 flex items-center z-20 pointer-events-none" style={{ width: '64px' }}>
                              <div className={`flex-1 h-0.5 ${isActive ? 'bg-pink-500 shadow-[0_0_8px_#ec4899]' : 'arrow-line text-slate-400/60'}`} />
                              <div className={`w-2 h-2 ${isActive ? 'border-pink-500' : 'border-slate-400/60'} border-t-2 border-r-2 transform rotate-45 -ml-1`} />
                              {arr.step && (
                                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-bold ${getStepBadgeStyle()}`}>
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
            currentTheme === 'NEUMORPHIC' ? 'bg-[#e0e5ec] border-[#c0cbdc] text-[#2d3748] shadow-[inset_4px_4px_8px_#a3b1c6]' :
            currentTheme === 'GLASSMORPHISM' ? 'bg-white/90 backdrop-blur-2xl border-white text-slate-900 shadow-xl' :
            currentTheme === 'NORMAL' ? 'bg-white border-slate-200 text-slate-900 shadow-xl' :
            'bg-[#0f172a] border-slate-800 text-slate-100 shadow-2xl'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{selectedBox.icon}</span>
              <div>
                <h3 className="font-bold text-base font-mono">{selectedBox.label}</h3>
                <span className="text-xs font-mono opacity-70">{selectedBox.sub}</span>
              </div>
            </div>
            <button onClick={() => setSelectedBox(null)} className="p-1.5 rounded-xl hover:bg-slate-500/10">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider mb-2 flex items-center space-x-1.5 text-indigo-500">
              <Zap className="w-4 h-4" /><span>Data Flow Execution Path</span>
            </h4>
            <div className="space-y-2">
              {selDataFlow.map((st, i) => (
                <div key={i} className="text-xs font-mono p-3 rounded-xl border bg-slate-500/5 leading-relaxed">
                  {st}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider mb-2 flex items-center space-x-1.5 text-purple-500">
              <Sparkles className="w-4 h-4" /><span>Framework Annotations</span>
            </h4>
            <div className="space-y-2">
              {selAnnotations.map((ann, i) => (
                <div key={i} className="p-3 rounded-xl border bg-slate-500/5 space-y-1">
                  <span className="text-xs font-mono font-bold text-pink-500 block">{ann.name}</span>
                  <p className="text-xs opacity-80">{ann.whyUsed}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider mb-2 flex items-center space-x-1.5 text-amber-500">
              <BookOpen className="w-4 h-4" /><span>Interview Questions & Answers</span>
            </h4>
            <div className="space-y-3">
              {selQA.map((qa, i) => (
                <div key={i} className="p-3 rounded-xl border bg-slate-500/5 space-y-1.5">
                  <span className="text-xs font-mono font-bold block">{qa.question}</span>
                  <p className="text-xs opacity-80 leading-relaxed">{qa.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {selectedBox.filePath && onViewCode && (
            <button
              onClick={() => onViewCode(selectedBox.filePath!)}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs flex items-center justify-center space-x-2 shadow-lg"
            >
              <FileCode className="w-4 h-4" /><span>Inspect Source Code</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
