import React, { useState } from 'react';
import { GraphData } from '../types';
import { FlowStep } from './InteractiveFlowExplorer';
import { getAnnotationDetails } from '../utils/annotationDictionary';
import { getInterviewQuestionsForNode } from '../utils/interviewQuestions';
import { X, Sparkles, BookOpen, Code2, ArrowRight } from 'lucide-react';

interface HLDFlowCanvasProps {
  graphData: GraphData;
  flowSteps: FlowStep[];
  activeStepIndex: number;
  onSelectStep: (index: number) => void;
}

interface BoxNode {
  id: string;
  label: string;
  sub: string;
  icon: string;
  col: string;        // accent hex
  bg: string;          // bg hex
  row: number;         // grid row (0-based)
  colIdx: number;      // grid col (0-based, 0..4)
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
  graphData, flowSteps, activeStepIndex, onSelectStep,
}) => {
  const [selectedBox, setSelectedBox] = useState<BoxNode | null>(null);

  const fe = graphData.nodes.filter((n) => n.data.layer === 'FRONTEND');
  const ctrl = graphData.nodes.filter((n) => n.data.nodeType === 'SPRING_CONTROLLER');
  const svc = graphData.nodes.filter((n) => n.data.nodeType === 'SPRING_SERVICE');
  const repo = graphData.nodes.filter((n) => n.data.nodeType === 'SPRING_REPOSITORY');
  const db = graphData.nodes.filter((n) => n.data.layer === 'DATABASE');

  /* ─── Build positioned boxes (5 columns, up to 4 rows) ─── */
  const boxes: BoxNode[] = [];

  // Col 0 – Clients (max 3)
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

  // Col 1 – Gateway + LB
  boxes.push({
    id: 'api_gw', label: 'API Gateway', sub: 'Spring Security + JWT',
    icon: '🛡️', col: '#818cf8', bg: '#1e1b4b',
    row: 0, colIdx: 1, nodeType: 'SPRING_CONTROLLER',
    annotations: '@RestController, @RequestMapping',
  });
  boxes.push({
    id: 'load_bal', label: 'Load Balancer', sub: 'DispatcherServlet',
    icon: '⚖️', col: '#a78bfa', bg: '#2e1065',
    row: 1, colIdx: 1, nodeType: 'SPRING_CONTROLLER',
    annotations: '@RestController',
  });

  // Col 2 – Controllers (max 4)
  ctrl.slice(0, 4).forEach((n, i) => boxes.push({
    id: n.id, label: n.data.label,
    sub: `${n.data.httpMethod || 'REST'} ${n.data.endpointPath || ''}`.trim(),
    icon: '⚡', col: '#818cf8', bg: '#312e81',
    row: i, colIdx: 2, nodeType: 'SPRING_CONTROLLER',
    annotations: n.data.annotations || '@RestController, @PostMapping, @RequestBody',
    filePath: n.data.filePath,
  }));

  // Col 3 – Services (max 4)
  svc.slice(0, 4).forEach((n, i) => boxes.push({
    id: n.id, label: n.data.label, sub: '@Service @Transactional',
    icon: '🛠️', col: '#c084fc', bg: '#3b0764',
    row: i, colIdx: 3, nodeType: 'SPRING_SERVICE',
    annotations: n.data.annotations || '@Service, @Transactional',
    filePath: n.data.filePath,
  }));

  // Col 4 – DB / Cache / Repos
  boxes.push({
    id: 'redis', label: 'Redis Cache', sub: 'In-Memory L1 Cache',
    icon: '⚡', col: '#f87171', bg: '#450a0a',
    row: 0, colIdx: 4, nodeType: 'DB_TABLE', annotations: '',
  });
  boxes.push({
    id: 'pg', label: db[0]?.data.label || 'PostgreSQL', sub: 'Relational DB',
    icon: '🗄️', col: '#fbbf24', bg: '#451a03',
    row: 1, colIdx: 4, nodeType: 'DB_TABLE',
    annotations: db[0]?.data.annotations || '@Entity, @Table, @Id',
    filePath: db[0]?.data.filePath,
  });
  repo.slice(0, 2).forEach((n, i) => boxes.push({
    id: n.id, label: n.data.label, sub: '@Repository JPA',
    icon: '📦', col: '#34d399', bg: '#064e3b',
    row: 2 + i, colIdx: 4, nodeType: 'SPRING_REPOSITORY',
    annotations: n.data.annotations || '@Repository',
    filePath: n.data.filePath,
  }));

  /* ─── Arrows ─── */
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

  /* ─── Grid layout constants ─── */
  const COL_W = 170;
  const ROW_H = 90;
  const GAP_X = 30;
  const GAP_Y = 12;
  const PAD_X = 24;
  const PAD_Y = 50;
  const BOX_W = COL_W;
  const BOX_H = 72;

  const colLabels = ['Clients', 'API Gateway', 'Controllers', 'Services', 'DB & Cache'];
  const colColors = ['#22d3ee', '#818cf8', '#818cf8', '#c084fc', '#fbbf24'];

  const getPos = (b: BoxNode) => ({
    x: PAD_X + b.colIdx * (COL_W + GAP_X),
    y: PAD_Y + b.row * (ROW_H + GAP_Y),
  });
  const getCenter = (b: BoxNode) => {
    const p = getPos(b);
    return { cx: p.x + BOX_W / 2, cy: p.y + BOX_H / 2 };
  };

  const totalW = PAD_X * 2 + 5 * COL_W + 4 * GAP_X;
  const maxRow = Math.max(...boxes.map((b) => b.row));
  const totalH = PAD_Y + (maxRow + 1) * (ROW_H + GAP_Y) + 20;

  /* ─── Detail panel data ─── */
  const selAnnotations = selectedBox ? getAnnotationDetails(selectedBox.annotations) : [];
  const selQA = selectedBox ? getInterviewQuestionsForNode(selectedBox.nodeType) : [];

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-950">
      {/* Left: Diagram Canvas */}
      <div className="flex-1 overflow-auto custom-scrollbar p-2">
        <svg width={totalW} height={totalH} className="mx-auto block" style={{ minWidth: totalW }}>
          {/* Column header labels */}
          {colLabels.map((lbl, ci) => (
            <text
              key={`col-${ci}`}
              x={PAD_X + ci * (COL_W + GAP_X) + COL_W / 2}
              y={28}
              textAnchor="middle"
              fill={colColors[ci]}
              fontSize="11"
              fontWeight="800"
              fontFamily="monospace"
              letterSpacing="1"
            >
              {lbl.toUpperCase()}
            </text>
          ))}

          {/* Arrows */}
          <defs>
            <marker id="ah" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0,8 3,0 6" fill="#64748b" />
            </marker>
            <marker id="ah-active" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0,8 3,0 6" fill="#ec4899" />
            </marker>
          </defs>

          {arrows.map((a, i) => {
            const fb = boxes.find((b) => b.id === a.fromId);
            const tb = boxes.find((b) => b.id === a.toId);
            if (!fb || !tb) return null;
            const f = getCenter(fb);
            const t = getCenter(tb);

            // Clamp endpoints to box edges
            const dx = t.cx - f.cx;
            const dy = t.cy - f.cy;
            const angle = Math.atan2(dy, dx);
            const x1 = f.cx + Math.cos(angle) * (BOX_W / 2 + 2);
            const y1 = f.cy + Math.sin(angle) * (BOX_H / 2 + 2);
            const x2 = t.cx - Math.cos(angle) * (BOX_W / 2 + 10);
            const y2 = t.cy - Math.sin(angle) * (BOX_H / 2 + 10);

            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;
            const isActive = a.step !== undefined && a.step - 1 === activeStepIndex;

            return (
              <g key={`a-${i}`}>
                <line x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={isActive ? '#ec4899' : '#475569'}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  markerEnd={isActive ? 'url(#ah-active)' : 'url(#ah)'}
                />
                {a.step && (
                  <circle cx={mx} cy={my} r={10}
                    fill={isActive ? '#ec4899' : '#1e293b'}
                    stroke={isActive ? '#f9a8d4' : '#475569'}
                    strokeWidth={1}
                  />
                )}
                {a.step && (
                  <text x={mx} y={my + 3.5} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="monospace">
                    {a.step}
                  </text>
                )}
                <text x={mx} y={my - 14} textAnchor="middle" fill={isActive ? '#f9a8d4' : '#64748b'} fontSize="8" fontWeight="600" fontFamily="monospace">
                  {a.label}
                </text>
              </g>
            );
          })}

          {/* Component Boxes */}
          {boxes.map((b) => {
            const p = getPos(b);
            const isSel = selectedBox?.id === b.id;
            return (
              <g key={b.id} onClick={() => setSelectedBox(isSel ? null : b)} className="cursor-pointer">
                <rect
                  x={p.x} y={p.y} width={BOX_W} height={BOX_H} rx={14}
                  fill={b.bg}
                  stroke={isSel ? '#ec4899' : b.col + '66'}
                  strokeWidth={isSel ? 2.5 : 1.5}
                />
                {isSel && (
                  <rect
                    x={p.x - 3} y={p.y - 3} width={BOX_W + 6} height={BOX_H + 6} rx={16}
                    fill="none" stroke="#ec489966" strokeWidth={2}
                  />
                )}
                <text x={p.x + BOX_W / 2} y={p.y + 22} textAnchor="middle" fontSize="14">{b.icon}</text>
                <text x={p.x + BOX_W / 2} y={p.y + 40} textAnchor="middle" fill={b.col} fontSize="10" fontWeight="bold" fontFamily="monospace">
                  {b.label.length > 18 ? b.label.slice(0, 18) + '…' : b.label}
                </text>
                <text x={p.x + BOX_W / 2} y={p.y + 54} textAnchor="middle" fill={b.col + '99'} fontSize="8" fontFamily="monospace">
                  {b.sub.length > 24 ? b.sub.slice(0, 24) + '…' : b.sub}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Right: Detail Inspector Panel (shown when a node is clicked) */}
      {selectedBox && (
        <aside className="w-[380px] bg-slate-900 border-l border-slate-800 overflow-y-auto custom-scrollbar shrink-0 flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-start justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
            <div>
              <span className="text-lg mr-2">{selectedBox.icon}</span>
              <span className="px-2 py-0.5 text-[10px] font-bold font-mono rounded-full border" style={{
                color: selectedBox.col,
                borderColor: selectedBox.col + '44',
                backgroundColor: selectedBox.col + '15',
              }}>
                {selectedBox.nodeType.replace('SPRING_', '').replace('_', ' ')}
              </span>
              <h3 className="text-sm font-bold text-white mt-2 font-mono">{selectedBox.label}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{selectedBox.sub}</p>
              {selectedBox.filePath && (
                <p className="text-[10px] text-slate-500 mt-1 font-mono break-all">{selectedBox.filePath}</p>
              )}
            </div>
            <button onClick={() => setSelectedBox(null)} className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Purpose Section */}
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Code2 className="w-3.5 h-3.5" />
                <span>Purpose & Role in Architecture</span>
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                {selectedBox.nodeType === 'REACT_COMPONENT' && 'React UI component that renders the user interface, handles user events (onClick, onChange, onSubmit), manages local state with useState/useReducer hooks, and triggers API calls via Axios/Fetch to the Spring Boot backend.'}
                {selectedBox.nodeType === 'SPRING_CONTROLLER' && `REST API endpoint handler. Receives incoming HTTP requests from the client, validates request parameters and body using @Valid annotations, delegates business logic to @Service beans, and returns ResponseEntity<T> JSON responses.`}
                {selectedBox.nodeType === 'SPRING_SERVICE' && 'Core business logic engine. Enforces domain rules, performs data transformations, coordinates multiple repository calls within @Transactional boundaries (ensuring ACID guarantees), and applies cross-cutting concerns like caching and security.'}
                {selectedBox.nodeType === 'SPRING_REPOSITORY' && 'Data Access Object (DAO) layer. Extends JpaRepository<T, ID> to provide CRUD operations, custom JPQL/HQL queries, pagination support, and automatic SQL generation from method names (e.g., findByUsername). Handles connection pooling via HikariCP.'}
                {selectedBox.nodeType === 'DB_TABLE' && 'Persistent storage layer. Maps Java @Entity classes to relational database tables. Hibernate ORM generates DDL schema, manages dirty checking, first-level cache (L1), and optimistic locking. Supports PostgreSQL, MySQL, and H2.'}
              </p>
            </div>

            {/* Annotations Breakdown */}
            {selAnnotations.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Framework Annotations & Internal Mechanics</span>
                </h4>
                {selAnnotations.map((ann, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-800/80 border border-purple-500/20 space-y-1.5">
                    <span className="font-mono text-xs font-bold text-pink-400 px-2 py-0.5 rounded-lg bg-pink-500/10 border border-pink-500/20 inline-block">
                      {ann.name}
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">{ann.whyUsed}</p>
                    <p className="text-[11px] text-purple-300/90 font-mono pt-1 border-t border-slate-700">
                      ⚙️ <span className="font-semibold text-slate-400">Under the hood:</span> {ann.internalWorking}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Data Flow Description */}
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Data Flow</h4>
              <div className="space-y-2 text-xs text-slate-300">
                {selectedBox.colIdx === 0 && (
                  <>
                    <p className="flex items-center space-x-2"><ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" /><span>User triggers event → React state update → Axios HTTP request</span></p>
                    <p className="flex items-center space-x-2"><ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" /><span>Request payload serialized to JSON with Content-Type header</span></p>
                    <p className="flex items-center space-x-2"><ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" /><span>Response received → setState → Virtual DOM re-render</span></p>
                  </>
                )}
                {selectedBox.colIdx === 1 && (
                  <>
                    <p className="flex items-center space-x-2"><ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" /><span>Incoming HTTP request → Security Filter Chain → JWT validation</span></p>
                    <p className="flex items-center space-x-2"><ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" /><span>DispatcherServlet → HandlerMapping → RequestMappingHandlerAdapter</span></p>
                    <p className="flex items-center space-x-2"><ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" /><span>Route to target @RestController endpoint handler method</span></p>
                  </>
                )}
                {selectedBox.colIdx === 2 && (
                  <>
                    <p className="flex items-center space-x-2"><ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" /><span>@RequestBody → Jackson ObjectMapper deserializes JSON to DTO</span></p>
                    <p className="flex items-center space-x-2"><ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" /><span>@Valid triggers Bean Validation (Hibernate Validator)</span></p>
                    <p className="flex items-center space-x-2"><ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" /><span>Delegates to @Service → Returns ResponseEntity&lt;T&gt; with HTTP status</span></p>
                  </>
                )}
                {selectedBox.colIdx === 3 && (
                  <>
                    <p className="flex items-center space-x-2"><ArrowRight className="w-3 h-3 text-purple-400 shrink-0" /><span>@Transactional opens JDBC connection, disables auto-commit</span></p>
                    <p className="flex items-center space-x-2"><ArrowRight className="w-3 h-3 text-purple-400 shrink-0" /><span>Business rules execute → calls @Repository methods</span></p>
                    <p className="flex items-center space-x-2"><ArrowRight className="w-3 h-3 text-purple-400 shrink-0" /><span>On success → TransactionInterceptor commits; on exception → rollback</span></p>
                  </>
                )}
                {selectedBox.colIdx === 4 && (
                  <>
                    <p className="flex items-center space-x-2"><ArrowRight className="w-3 h-3 text-amber-400 shrink-0" /><span>Hibernate generates SQL from HQL/Criteria API or method name query</span></p>
                    <p className="flex items-center space-x-2"><ArrowRight className="w-3 h-3 text-amber-400 shrink-0" /><span>HikariCP provides pooled JDBC connection to PostgreSQL/MySQL</span></p>
                    <p className="flex items-center space-x-2"><ArrowRight className="w-3 h-3 text-amber-400 shrink-0" /><span>ResultSet mapped to @Entity POJOs → returned through persistence context</span></p>
                  </>
                )}
              </div>
            </div>

            {/* Interview Q&A */}
            {selQA.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Interview Questions & Answers</span>
                </h4>
                {selQA.map((qa, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                    <p className="text-xs font-bold text-indigo-300">Q: {qa.question}</p>
                    <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-700">
                      <span className="font-bold text-emerald-400">A: </span>{qa.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
};
