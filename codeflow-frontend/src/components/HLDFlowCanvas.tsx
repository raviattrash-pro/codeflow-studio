import React, { useState } from 'react';
import { GraphData } from '../types';
import { FlowStep } from './InteractiveFlowExplorer';
import { getAnnotationDetails } from '../utils/annotationDictionary';
import { getInterviewQuestionsForNode } from '../utils/interviewQuestions';
import { X, Sparkles, BookOpen, Code2, ArrowRight, ArrowDown, Zap, FileCode } from 'lucide-react';

interface HLDFlowCanvasProps {
  graphData: GraphData;
  flowSteps: FlowStep[];
  activeStepIndex: number;
  onSelectStep: (index: number) => void;
  onViewCode?: (filePath: string) => void;
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
  graphData, flowSteps, activeStepIndex, onSelectStep, onViewCode,
}) => {
  const [selectedBox, setSelectedBox] = useState<BoxNode | null>(null);

  const fe = graphData.nodes.filter((n) => n.data.layer === 'FRONTEND');
  const ctrl = graphData.nodes.filter((n) => n.data.nodeType === 'SPRING_CONTROLLER');
  const svc = graphData.nodes.filter((n) => n.data.nodeType === 'SPRING_SERVICE');
  const repo = graphData.nodes.filter((n) => n.data.nodeType === 'SPRING_REPOSITORY');
  const db = graphData.nodes.filter((n) => n.data.layer === 'DATABASE');

  const boxes: BoxNode[] = [];

  fe.slice(0, 3).forEach((n, i) => boxes.push({
    id: n.id, label: n.data.label, sub: 'React Component',
    icon: '📱', col: '#22d3ee', bg: '#083344',
    row: i, colIdx: 0, nodeType: 'REACT_COMPONENT',
    annotations: n.data.annotations, filePath: n.data.filePath,
  }));
  if (fe.length === 0) boxes.push({
    id: 'fe_placeholder', label: 'React Client', sub: 'Browser SPA',
    icon: '📱', col: '#22d3ee', bg: '#083344',
    row: 1, colIdx: 0, nodeType: 'REACT_COMPONENT', annotations: '',
  });

  boxes.push({
    id: 'api_gw', label: 'API Gateway', sub: 'Spring Security + JWT',
    icon: '🛡️', col: '#818cf8', bg: '#1e1b4b',
    row: 0, colIdx: 1, nodeType: 'SPRING_CONTROLLER',
    annotations: '@RestController, @RequestMapping, @CrossOrigin',
  });
  boxes.push({
    id: 'load_bal', label: 'Load Balancer', sub: 'DispatcherServlet Handler',
    icon: '⚖️', col: '#a78bfa', bg: '#2e1065',
    row: 1, colIdx: 1, nodeType: 'SPRING_CONTROLLER',
    annotations: '@RestController, @Valid',
  });

  ctrl.slice(0, 4).forEach((n, i) => boxes.push({
    id: n.id, label: n.data.label,
    sub: `${n.data.httpMethod || 'REST'} ${n.data.endpointPath || ''}`.trim(),
    icon: '⚡', col: '#818cf8', bg: '#312e81',
    row: i, colIdx: 2, nodeType: 'SPRING_CONTROLLER',
    annotations: n.data.annotations || '@RestController, @PostMapping, @RequestBody, @Valid',
    filePath: n.data.filePath,
  }));

  svc.slice(0, 4).forEach((n, i) => boxes.push({
    id: n.id, label: n.data.label, sub: '@Service Business Engine',
    icon: '🛠️', col: '#c084fc', bg: '#3b0764',
    row: i, colIdx: 3, nodeType: 'SPRING_SERVICE',
    annotations: n.data.annotations || '@Service, @Transactional, @Autowired',
    filePath: n.data.filePath,
  }));

  boxes.push({
    id: 'redis', label: 'Redis Cache', sub: 'In-Memory L1 Cache',
    icon: '⚡', col: '#f87171', bg: '#450a0a',
    row: 0, colIdx: 4, nodeType: 'DB_TABLE', annotations: '@Entity, @Cacheable',
  });
  boxes.push({
    id: 'pg', label: db[0]?.data.label || 'PostgreSQL DB', sub: 'Relational Store',
    icon: '🗄️', col: '#fbbf24', bg: '#451a03',
    row: 1, colIdx: 4, nodeType: 'DB_TABLE',
    annotations: db[0]?.data.annotations || '@Entity, @Table, @Id',
    filePath: db[0]?.data.filePath,
  });
  repo.slice(0, 2).forEach((n, i) => boxes.push({
    id: n.id, label: n.data.label, sub: '@Repository Spring Data JPA',
    icon: '📦', col: '#34d399', bg: '#064e3b',
    row: 2 + i, colIdx: 4, nodeType: 'SPRING_REPOSITORY',
    annotations: n.data.annotations || '@Repository, @Autowired',
    filePath: n.data.filePath,
  }));

  const arrows: Arrow[] = [];
  const feIds = boxes.filter((b) => b.colIdx === 0).map((b) => b.id);
  feIds.forEach((fid, i) => arrows.push({ fromId: fid, toId: 'api_gw', label: ['GET Data', 'POST Form', 'Admin Req'][i] || 'Request', step: i + 1 }));
  arrows.push({ fromId: 'api_gw', toId: 'load_bal', label: 'Route', step: feIds.length + 1 });

  const ctrlBoxes = boxes.filter((b) => b.colIdx === 2);
  if (ctrlBoxes[0]) arrows.push({ fromId: 'load_bal', toId: ctrlBoxes[0].id, label: 'Dispatch', step: feIds.length + 2 });

  const svcBoxes = boxes.filter((b) => b.colIdx === 3);
  if (ctrlBoxes[0] && svcBoxes[0]) arrows.push({ fromId: ctrlBoxes[0].id, toId: svcBoxes[0].id, label: 'Invoke Service', step: feIds.length + 3 });
  if (svcBoxes[0]) {
    arrows.push({ fromId: svcBoxes[0].id, toId: 'redis', label: 'Cache Read', step: feIds.length + 4 });
    arrows.push({ fromId: svcBoxes[0].id, toId: 'pg', label: 'DB Write', step: feIds.length + 5 });
  }

  const colLabels = ['Clients', 'API Gateway', 'Controllers', 'Services', 'DB & Cache'];

  // Helper for Data Flow steps per component type
  const getDataFlowSteps = (nodeType: string) => {
    if (nodeType === 'REACT_COMPONENT') {
      return [
        '1. User triggers event handler (onClick/onSubmit) in React UI component.',
        '2. Local state updates with useState/useReducer hook.',
        '3. Form payload serialized to JSON and sent via Axios HTTP REST call.',
      ];
    }
    if (nodeType === 'SPRING_CONTROLLER') {
      return [
        '1. DispatcherServlet inspects request URL and delegates to @RestController handler method.',
        '2. Jackson ObjectMapper deserializes request JSON payload into Java DTO object.',
        '3. @Valid triggers Bean Validation constraints. Invokes @Service business methods and returns ResponseEntity<T> JSON.',
      ];
    }
    if (nodeType === 'SPRING_SERVICE') {
      return [
        '1. PlatformTransactionManager opens a @Transactional boundary.',
        '2. Applies core business rules, security policies, and domain calculations.',
        '3. Invokes @Repository operations. On completion, TransactionInterceptor commits ACID transaction.',
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

  return (
    <div className="flex-1 flex overflow-hidden bg-[#0a0f1c] relative">
      <div className="flex-1 overflow-auto custom-scrollbar p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-16 min-w-[300px] md:min-w-[1100px] h-full items-start">
          {colLabels.map((lbl, ci) => {
            const colBoxes = boxes.filter((b) => b.colIdx === ci);
            if (colBoxes.length === 0) return null;
            return (
              <div key={ci} className="flex flex-col gap-6 md:gap-10 items-center w-full relative">
                <div className="text-center mb-2">
                  <h2 className="font-bold uppercase tracking-widest text-sm font-mono text-white" style={{ color: boxes.find((b) => b.colIdx === ci)?.col || 'white' }}>
                    {lbl}
                  </h2>
                </div>

                {colBoxes.map((b) => {
                  const isSel = selectedBox?.id === b.id;
                  const outgoingArrows = arrows.filter((a) => a.fromId === b.id);

                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBox(isSel ? null : b)}
                      className={`relative w-full p-6 md:p-8 cursor-pointer flex flex-col items-center justify-center text-center clay-card ${isSel ? 'selected' : ''}`}
                      style={{
                        backgroundColor: `${b.bg}CC`,
                        borderColor: `${b.col}33`,
                      }}
                    >
                      <div className="text-5xl md:text-6xl mb-4 drop-shadow-lg">{b.icon}</div>
                      <div className="font-mono text-sm md:text-base font-bold mb-2" style={{ color: b.col }}>
                        {b.label.length > 20 ? b.label.slice(0, 20) + '…' : b.label}
                      </div>
                      <div className="inline-block px-2 py-0.5 rounded-full border text-[10px] md:text-xs font-mono opacity-90" style={{ color: b.col, borderColor: b.col + '66', backgroundColor: b.col + '15' }}>
                        {b.nodeType.replace('SPRING_', '').replace('_', ' ')}
                      </div>

                      {/* Connection Arrows */}
                      <div className="hidden md:block">
                        {outgoingArrows.map((arr, i) => {
                          const isActive = arr.step !== undefined && arr.step - 1 === activeStepIndex;
                          const toBox = boxes.find((bx) => bx.id === arr.toId);
                          const isDown = toBox?.colIdx === b.colIdx;

                          if (isDown) {
                            return (
                              <div key={i} className="absolute top-full left-1/2 -translate-x-1/2 flex flex-col items-center z-10 pointer-events-none" style={{ height: '40px' }}>
                                <div className={`w-0.5 h-full ${isActive ? 'bg-pink-500' : 'arrow-line-vertical text-slate-500/50'}`} />
                                {arr.step && (
                                  <div className="absolute top-1/2 -translate-y-1/2">
                                    <div className={`text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ${isActive ? 'bg-pink-500 text-white shadow-[0_0_12px_rgba(236,72,153,0.8)]' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                                      {arr.step}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          } else {
                            return (
                              <div key={i} className="absolute top-1/2 left-full -translate-y-1/2 flex items-center z-10 pointer-events-none" style={{ width: '64px' }}>
                                <div className={`flex-1 h-0.5 ${isActive ? 'bg-pink-500' : 'arrow-line text-slate-500/50'}`} />
                                <div className={`w-2 h-2 ${isActive ? 'border-pink-500' : 'border-slate-500/50'} border-t-2 border-r-2 transform rotate-45 -ml-1`} />
                                {arr.step && (
                                  <div className="absolute left-1/2 -translate-x-1/2 -top-3">
                                    <div className={`text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ${isActive ? 'bg-pink-500 text-white shadow-[0_0_12px_rgba(236,72,153,0.8)]' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                                      {arr.step}
                                    </div>
                                  </div>
                                )}
                                <div className={`absolute left-1/2 -translate-x-1/2 top-3.5 whitespace-nowrap text-[9px] font-mono font-bold ${isActive ? 'text-pink-400' : 'text-slate-500'}`}>
                                  {arr.label}
                                </div>
                              </div>
                            );
                          }
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

      {/* ─── SLEEK FLOATING INSPECTOR SIDE DRAWER (Fixed 450px Right Drawer) ─── */}
      {selectedBox && (
        <div
          className="fixed top-36 right-4 bottom-4 w-[450px] max-w-[90vw] rounded-3xl border border-slate-700/80 shadow-[0_25px_80px_rgba(0,0,0,0.95)] z-40 overflow-hidden flex flex-col animate-fadeIn"
          style={{ backgroundColor: '#0f172a' }}
        >
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-800 flex items-start justify-between shrink-0" style={{ backgroundColor: '#0a0e1a' }}>
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg border"
                style={{ backgroundColor: selectedBox.bg, borderColor: selectedBox.col + '44' }}
              >
                {selectedBox.icon}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className="px-2 py-0.5 text-[10px] font-bold font-mono rounded-full border"
                    style={{ color: selectedBox.col, borderColor: selectedBox.col + '44', backgroundColor: selectedBox.col + '20' }}
                  >
                    {selectedBox.nodeType.replace('SPRING_', '').replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1 font-mono">{selectedBox.label}</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedBox.sub}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedBox(null)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body Scroll Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5 bg-[#0f172a]">
            {/* File Path & Source Viewer Button */}
            {selectedBox.filePath && (
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <code className="text-[10px] text-slate-300 font-mono break-all">{selectedBox.filePath}</code>
                {onViewCode && (
                  <button
                    onClick={() => onViewCode(selectedBox.filePath!)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold font-mono hover:bg-indigo-600/40 transition-all shrink-0 ml-3"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>View Code</span>
                  </button>
                )}
              </div>
            )}

            {/* 1. Purpose & Role */}
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5 font-mono">
                <Zap className="w-3.5 h-3.5" />
                <span>Purpose & Role in Architecture</span>
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed font-mono">
                {selectedBox.nodeType === 'REACT_COMPONENT' &&
                  'React UI component that renders the user interface, handles user events (onClick, onChange, onSubmit), manages local state with useState/useReducer hooks, and triggers API calls via Axios/Fetch to the Spring Boot backend.'}
                {selectedBox.nodeType === 'SPRING_CONTROLLER' &&
                  'REST API endpoint handler. Receives incoming HTTP requests from the client, validates request parameters and body using @Valid annotations, delegates business logic to @Service beans, and returns ResponseEntity<T> JSON responses.'}
                {selectedBox.nodeType === 'SPRING_SERVICE' &&
                  'Core business logic engine. Enforces domain rules, performs data transformations, coordinates multiple repository calls within @Transactional boundaries (ensuring ACID guarantees), and applies cross-cutting concerns like caching and security.'}
                {selectedBox.nodeType === 'SPRING_REPOSITORY' &&
                  'Data Access Object (DAO) layer. Extends JpaRepository<T, ID> to provide CRUD operations, custom JPQL/HQL queries, pagination support, and automatic SQL generation from method names (e.g., findByUsername). Handles connection pooling via HikariCP.'}
                {selectedBox.nodeType === 'DB_TABLE' &&
                  'Persistent storage layer. Maps Java @Entity classes to relational database tables. Hibernate ORM generates DDL schema, manages dirty checking, first-level cache (L1), and optimistic locking.'}
              </p>
            </div>

            {/* 2. Data Flow Through Component (ALWAYS EXPANDED) */}
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5 font-mono">
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Data Flow Execution Path</span>
              </h4>
              <div className="space-y-2.5">
                {selDataFlow.map((stepStr, i) => (
                  <div key={i} className="flex items-start space-x-2 text-xs text-slate-200 font-mono">
                    <ArrowDown className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                    <span>{stepStr}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Framework Annotations & Mechanics (ALWAYS EXPANDED) */}
            {selAnnotations.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center space-x-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Framework Annotations & Internal Mechanics</span>
                </h4>
                <div className="space-y-3">
                  {selAnnotations.map((ann, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-slate-900 border border-purple-500/20 space-y-2">
                      <span className="font-mono text-xs font-bold text-pink-400 px-2 py-0.5 rounded-lg bg-pink-500/10 border border-pink-500/20 inline-block">
                        {ann.name}
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed">{ann.whyUsed}</p>
                      <p className="text-[11px] text-purple-300/90 font-mono pt-2 border-t border-slate-800">
                        ⚙️ <span className="text-slate-400 font-semibold">Under the hood:</span> {ann.internalWorking}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Interview Q&A (ALWAYS EXPANDED) */}
            {selQA.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5 font-mono">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Interview Questions & Detailed Answers</span>
                </h4>
                <div className="space-y-3">
                  {selQA.map((qa, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 font-mono">
                      <p className="text-xs font-bold text-amber-300 leading-relaxed">Q: {qa.question}</p>
                      <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
                        <span className="font-bold text-emerald-400">Answer: </span>
                        {qa.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
