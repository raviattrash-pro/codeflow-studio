import React, { useState, useEffect, useRef } from 'react';
import { GraphData } from '../types';
import { HLDFlowCanvas } from './HLDFlowCanvas';
import { getAnnotationDetails } from '../utils/annotationDictionary';
import { getInterviewQuestionsForNode } from '../utils/interviewQuestions';
import {
  Play, Pause, SkipBack, SkipForward, RotateCcw,
  User, Server, Database, CheckCircle2,
  Sparkles, Layers, FileCode, Workflow, ArrowRight,
  BookOpen, Code2, ArrowDown, Clock, Zap
} from 'lucide-react';

interface InteractiveFlowExplorerProps {
  graphData: GraphData;
  onSelectNode: (nodeId: string) => void;
  selectedNodeId?: string;
  onViewCode?: (filePath: string) => void;
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

export const InteractiveFlowExplorer: React.FC<InteractiveFlowExplorerProps> = ({
  graphData, onSelectNode, selectedNodeId, onViewCode,
}) => {
  const [viewMode, setViewMode] = useState<'HLD_DIAGRAM' | 'STEP_TIMELINE'>('HLD_DIAGRAM');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(2500);
  const activeCardRef = useRef<HTMLDivElement>(null);

  // Generate dynamic step flow from parsed graph nodes
  const flowSteps: FlowStep[] = React.useMemo(() => {
    if (!graphData.nodes || graphData.nodes.length === 0) return getSampleFlowSteps();

    const steps: FlowStep[] = [];
    let c = 1;

    const reactComp = graphData.nodes.find((n) => n.data.layer === 'FRONTEND');
    if (reactComp) steps.push({ id: reactComp.id, stepNumber: c++, nodeId: reactComp.id, nodeType: 'REACT_COMPONENT', layer: 'FRONTEND', title: reactComp.data.label, subtitle: 'User Event / State Trigger', filePath: reactComp.data.filePath, methodName: reactComp.data.methodName || 'handleUserAction', annotationsCsv: reactComp.data.annotations, description: 'User interacts with UI component. Event handler triggers client-side validation & API request.', dataPayload: '{ "username": "admin", "action": "SUBMIT" }' });

    const apiCall = graphData.nodes.find((n) => n.data.nodeType === 'REACT_API_CALL');
    if (apiCall) steps.push({ id: apiCall.id, stepNumber: c++, nodeId: apiCall.id, nodeType: 'REACT_API_CALL', layer: 'FRONTEND', title: `${apiCall.data.httpMethod || 'POST'} ${apiCall.data.endpointPath || '/api/v1/resource'}`, subtitle: 'HTTP REST Client (Axios)', filePath: apiCall.data.filePath, httpMethod: apiCall.data.httpMethod, endpointPath: apiCall.data.endpointPath, annotationsCsv: apiCall.data.annotations, description: 'Axios serializes payload to JSON, attaches Bearer JWT tokens, and sends HTTP request across network.', dataPayload: 'Content-Type: application/json' });

    graphData.nodes.filter((n) => n.data.nodeType === 'SPRING_CONTROLLER').forEach((ctrl) => {
      steps.push({ id: ctrl.id, stepNumber: c++, nodeId: ctrl.id, nodeType: 'SPRING_CONTROLLER', layer: 'BACKEND', title: ctrl.data.label, subtitle: `@RestController (${ctrl.data.httpMethod || 'POST'} ${ctrl.data.endpointPath || '/api'})`, filePath: ctrl.data.filePath, methodName: ctrl.data.methodName, httpMethod: ctrl.data.httpMethod, endpointPath: ctrl.data.endpointPath, annotationsCsv: ctrl.data.annotations || '@RestController, @PostMapping, @RequestBody', description: 'Spring Boot DispatcherServlet routes request to Controller method. Input DTO is validated.', dataPayload: 'Parsed DTO Object' });
    });

    graphData.nodes.filter((n) => n.data.nodeType === 'SPRING_SERVICE').forEach((srv) => {
      steps.push({ id: srv.id, stepNumber: c++, nodeId: srv.id, nodeType: 'SPRING_SERVICE', layer: 'BACKEND', title: srv.data.label, subtitle: '@Service Business Logic Engine', filePath: srv.data.filePath, methodName: srv.data.methodName, annotationsCsv: srv.data.annotations || '@Service, @Transactional', description: 'Service executes business logic, applies security policies, and invokes Repository methods inside atomic @Transactional boundaries.', dataPayload: 'Processed Business State' });
    });

    graphData.nodes.filter((n) => n.data.nodeType === 'SPRING_REPOSITORY').forEach((repo) => {
      steps.push({ id: repo.id, stepNumber: c++, nodeId: repo.id, nodeType: 'SPRING_REPOSITORY', layer: 'BACKEND', title: repo.data.label, subtitle: '@Repository Spring Data JPA', filePath: repo.data.filePath, methodName: repo.data.methodName, annotationsCsv: repo.data.annotations || '@Repository, @Autowired', description: 'Repository converts method calls into Hibernate HQL/Criteria queries and handles connection pooling via HikariCP.', dataPayload: 'Hibernate HQL Query' });
    });

    graphData.nodes.filter((n) => n.data.layer === 'DATABASE').forEach((tbl) => {
      steps.push({ id: tbl.id, stepNumber: c++, nodeId: tbl.id, nodeType: 'DB_TABLE', layer: 'DATABASE', title: tbl.data.label, subtitle: `@Entity (${tbl.data.targetEntity || 'JPA Model'})`, filePath: tbl.data.filePath, annotationsCsv: tbl.data.annotations || '@Entity, @Table, @Id', description: 'SQL query executes on database engine. Result set mapped back to Java Entities via Hibernate ORM.', dataPayload: 'SELECT * FROM table WHERE id = ?' });
    });

    return steps.length > 0 ? steps : getSampleFlowSteps();
  }, [graphData]);

  // Auto-play timer
  useEffect(() => {
    let t: any;
    if (isPlaying) {
      t = setInterval(() => {
        setCurrentStepIndex((p) => {
          if (p >= flowSteps.length - 1) { setIsPlaying(false); return p; }
          return p + 1;
        });
      }, playbackSpeed);
    }
    return () => clearInterval(t);
  }, [isPlaying, playbackSpeed, flowSteps.length]);

  // Auto-scroll to active card
  useEffect(() => {
    activeCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentStepIndex]);

  const activeStep = flowSteps[currentStepIndex] || flowSteps[0];
  const activeAnnotations = getAnnotationDetails(activeStep.annotationsCsv);
  const activeQA = getInterviewQuestionsForNode(activeStep.nodeType);

  const layerColor = (l: string) => l === 'FRONTEND' ? { border: 'border-cyan-500', bg: 'bg-cyan-500', text: 'text-cyan-400', glow: 'shadow-cyan-500/30', badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' } : l === 'DATABASE' ? { border: 'border-amber-500', bg: 'bg-amber-500', text: 'text-amber-400', glow: 'shadow-amber-500/30', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30' } : { border: 'border-indigo-500', bg: 'bg-indigo-500', text: 'text-indigo-400', glow: 'shadow-indigo-500/30', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' };

  const layerIcon = (l: string) => l === 'FRONTEND' ? <User className="w-4 h-4" /> : l === 'DATABASE' ? <Database className="w-4 h-4" /> : <Server className="w-4 h-4" />;

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      {/* Toolbar */}
      <div className="h-14 glass-panel border-b border-slate-800 px-5 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button onClick={() => setViewMode('HLD_DIAGRAM')} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'HLD_DIAGRAM' ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30 font-bold' : 'text-slate-400 hover:text-white'}`}>
            <Workflow className="w-4 h-4" /><span>HLD Architecture</span>
          </button>
          <button onClick={() => setViewMode('STEP_TIMELINE')} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'STEP_TIMELINE' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold' : 'text-slate-400 hover:text-white'}`}>
            <Layers className="w-4 h-4" /><span>Step-by-Step Flow</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button onClick={() => { setCurrentStepIndex(0); setIsPlaying(false); }} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"><RotateCcw className="w-3.5 h-3.5" /></button>
            <button onClick={() => setCurrentStepIndex((p) => Math.max(0, p - 1))} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"><SkipBack className="w-3.5 h-3.5" /></button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-pink-600/30">
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button onClick={() => setCurrentStepIndex((p) => Math.min(flowSteps.length - 1, p + 1))} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"><SkipForward className="w-3.5 h-3.5" /></button>
          </div>

          <span className="text-xs font-mono"><span className="font-bold text-pink-400">Step {currentStepIndex + 1}</span><span className="text-slate-500"> / </span><span className="text-slate-300">{flowSteps.length}</span></span>

          <div className="flex items-center space-x-1 text-xs font-mono">
            {[{ l: '1x', s: 3000 }, { l: '2x', s: 1800 }, { l: '3x', s: 900 }].map((sp) => (
              <button key={sp.s} onClick={() => setPlaybackSpeed(sp.s)} className={`px-2 py-1 rounded-lg border transition-all ${playbackSpeed === sp.s ? 'bg-indigo-600 text-white border-indigo-500 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>{sp.l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'HLD_DIAGRAM' ? (
        <HLDFlowCanvas graphData={graphData} flowSteps={flowSteps} activeStepIndex={currentStepIndex} onSelectStep={(i) => setCurrentStepIndex(i)} />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* ─── LEFT: Vertical Timeline with Connected Steps ─── */}
          <div className="w-[480px] overflow-y-auto custom-scrollbar border-r border-slate-800 bg-slate-950 shrink-0">
            <div className="p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Execution Timeline ({flowSteps.length} Steps)</span>
              </h3>

              <div className="relative">
                {/* Vertical connector line */}
                <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-cyan-500 via-indigo-500 via-purple-500 to-amber-500 opacity-30" />

                {flowSteps.map((step, idx) => {
                  const isActive = idx === currentStepIndex;
                  const isPassed = idx < currentStepIndex;
                  const lc = layerColor(step.layer);

                  return (
                    <div
                      key={step.id + idx}
                      ref={isActive ? activeCardRef : undefined}
                      onClick={() => { setCurrentStepIndex(idx); onSelectNode(step.nodeId); }}
                      className="relative pl-12 pb-5 cursor-pointer group"
                    >
                      {/* Step circle on timeline */}
                      <div className={`absolute left-[7px] top-1 w-[24px] h-[24px] rounded-full flex items-center justify-center text-[10px] font-bold font-mono z-10 border-2 transition-all ${
                        isActive ? `${lc.bg} text-white border-white shadow-lg ${lc.glow} scale-125` :
                        isPassed ? 'bg-emerald-600 text-white border-emerald-400' :
                        'bg-slate-800 text-slate-500 border-slate-700'
                      }`}>
                        {isPassed ? <CheckCircle2 className="w-3 h-3" /> : step.stepNumber}
                      </div>

                      {/* Step Card */}
                      <div className={`p-4 rounded-2xl border transition-all ${
                        isActive ? `border-l-4 ${lc.border} bg-slate-900/80 shadow-xl` :
                        isPassed ? 'border-slate-800 bg-slate-900/40 opacity-75' :
                        'border-slate-800/50 bg-slate-900/20 opacity-50 group-hover:opacity-80'
                      }`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 text-[9px] font-bold font-mono rounded-full border ${lc.badge}`}>
                              {step.layer}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{step.subtitle}</span>
                          </div>
                          {step.filePath && onViewCode && (
                            <button onClick={(e) => { e.stopPropagation(); onViewCode(step.filePath!); }} className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] text-slate-300 border border-slate-700 font-mono transition-all">
                              <FileCode className="w-3 h-3 text-indigo-400" /><span>Code</span>
                            </button>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-white font-mono">{step.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{step.description}</p>

                        {/* Data payload preview */}
                        {step.dataPayload && isActive && (
                          <div className="mt-2 p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px] text-emerald-400">
                            <span className="text-slate-500">payload: </span>{step.dataPayload}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ─── RIGHT: Active Step Deep-Dive Detail Panel ─── */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-900/40 p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Active Step Header */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${layerColor(activeStep.layer).bg} shadow-lg ${layerColor(activeStep.layer).glow}`}>
                    {layerIcon(activeStep.layer)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold text-pink-400">Step {activeStep.stepNumber}</span>
                      <span className={`px-2 py-0.5 text-[9px] font-bold font-mono rounded-full border ${layerColor(activeStep.layer).badge}`}>{activeStep.layer}</span>
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
                      <button onClick={() => onViewCode(activeStep.filePath!)} className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold font-mono hover:bg-indigo-600/40 transition-all shrink-0 ml-3">
                        <Code2 className="w-3 h-3" /><span>View Source</span>
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

              {/* Purpose & Role */}
              <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5" /><span>Purpose & Role in Architecture</span>
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {activeStep.nodeType === 'REACT_COMPONENT' && 'React UI component that renders the user interface, handles user events (onClick, onChange, onSubmit), manages local state with useState/useReducer hooks, and triggers API calls via Axios/Fetch to the Spring Boot backend.'}
                  {activeStep.nodeType === 'REACT_API_CALL' && 'HTTP REST client layer. Serializes request payload to JSON, attaches Authorization headers (Bearer JWT), handles CORS, and manages response lifecycle including error boundaries and loading states.'}
                  {activeStep.nodeType === 'SPRING_CONTROLLER' && 'REST API endpoint handler. Receives incoming HTTP requests from the client, validates request parameters and body using @Valid annotations, delegates business logic to @Service beans, and returns ResponseEntity<T> JSON responses.'}
                  {activeStep.nodeType === 'SPRING_SERVICE' && 'Core business logic engine. Enforces domain rules, performs data transformations, coordinates multiple repository calls within @Transactional boundaries (ensuring ACID guarantees), and applies cross-cutting concerns like caching and security.'}
                  {activeStep.nodeType === 'SPRING_REPOSITORY' && 'Data Access Object (DAO) layer. Extends JpaRepository<T, ID> to provide CRUD operations, custom JPQL/HQL queries, pagination support, and automatic SQL generation from method names (e.g., findByUsername). Handles connection pooling via HikariCP.'}
                  {activeStep.nodeType === 'DB_TABLE' && 'Persistent storage layer. Maps Java @Entity classes to relational database tables. Hibernate ORM generates DDL schema, manages dirty checking, first-level cache (L1), and optimistic locking.'}
                </p>
              </div>

              {/* Data Flow Through This Component */}
              <div className="p-5 rounded-2xl bg-cyan-950/15 border border-cyan-500/20">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                  <ArrowRight className="w-3.5 h-3.5" /><span>Data Flow Through This Component</span>
                </h4>
                <div className="space-y-2.5">
                  {activeStep.layer === 'FRONTEND' && (
                    <>
                      <div className="flex items-start space-x-2 text-xs text-slate-300"><ArrowDown className="w-3 h-3 text-cyan-400 mt-0.5 shrink-0" /><span>User triggers event → React state update → Axios HTTP request</span></div>
                      <div className="flex items-start space-x-2 text-xs text-slate-300"><ArrowDown className="w-3 h-3 text-cyan-400 mt-0.5 shrink-0" /><span>Request payload serialized to JSON with Content-Type header</span></div>
                      <div className="flex items-start space-x-2 text-xs text-slate-300"><ArrowDown className="w-3 h-3 text-cyan-400 mt-0.5 shrink-0" /><span>Response received → setState → Virtual DOM reconciliation → re-render</span></div>
                    </>
                  )}
                  {activeStep.layer === 'BACKEND' && activeStep.nodeType === 'SPRING_CONTROLLER' && (
                    <>
                      <div className="flex items-start space-x-2 text-xs text-slate-300"><ArrowDown className="w-3 h-3 text-indigo-400 mt-0.5 shrink-0" /><span>DispatcherServlet → HandlerMapping → RequestMappingHandlerAdapter</span></div>
                      <div className="flex items-start space-x-2 text-xs text-slate-300"><ArrowDown className="w-3 h-3 text-indigo-400 mt-0.5 shrink-0" /><span>@RequestBody → Jackson ObjectMapper deserializes JSON to DTO</span></div>
                      <div className="flex items-start space-x-2 text-xs text-slate-300"><ArrowDown className="w-3 h-3 text-indigo-400 mt-0.5 shrink-0" /><span>@Valid triggers Bean Validation → Delegates to @Service → Returns ResponseEntity</span></div>
                    </>
                  )}
                  {activeStep.layer === 'BACKEND' && activeStep.nodeType === 'SPRING_SERVICE' && (
                    <>
                      <div className="flex items-start space-x-2 text-xs text-slate-300"><ArrowDown className="w-3 h-3 text-purple-400 mt-0.5 shrink-0" /><span>@Transactional opens JDBC connection via PlatformTransactionManager</span></div>
                      <div className="flex items-start space-x-2 text-xs text-slate-300"><ArrowDown className="w-3 h-3 text-purple-400 mt-0.5 shrink-0" /><span>Business rules execute → calls @Repository methods within transaction</span></div>
                      <div className="flex items-start space-x-2 text-xs text-slate-300"><ArrowDown className="w-3 h-3 text-purple-400 mt-0.5 shrink-0" /><span>On success → TransactionInterceptor commits; on RuntimeException → rollback</span></div>
                    </>
                  )}
                  {activeStep.layer === 'BACKEND' && activeStep.nodeType === 'SPRING_REPOSITORY' && (
                    <>
                      <div className="flex items-start space-x-2 text-xs text-slate-300"><ArrowDown className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" /><span>Method name parsed by PartTreeJpaQuery → generates JPQL/HQL</span></div>
                      <div className="flex items-start space-x-2 text-xs text-slate-300"><ArrowDown className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" /><span>HikariCP provides pooled JDBC connection to database</span></div>
                      <div className="flex items-start space-x-2 text-xs text-slate-300"><ArrowDown className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" /><span>ResultSet mapped to @Entity POJOs via Hibernate persistence context</span></div>
                    </>
                  )}
                  {activeStep.layer === 'DATABASE' && (
                    <>
                      <div className="flex items-start space-x-2 text-xs text-slate-300"><ArrowDown className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" /><span>Hibernate generates SQL from entity metadata & dialect</span></div>
                      <div className="flex items-start space-x-2 text-xs text-slate-300"><ArrowDown className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" /><span>Query optimizer plans execution → index scan or sequential scan</span></div>
                      <div className="flex items-start space-x-2 text-xs text-slate-300"><ArrowDown className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" /><span>ResultSet returned → Hibernate dirty-checks & populates L1 cache</span></div>
                    </>
                  )}
                </div>
              </div>

              {/* Annotations Breakdown */}
              {activeAnnotations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" /><span>Framework Annotations & Internal Mechanics</span>
                  </h4>
                  {activeAnnotations.map((ann, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-900 border border-purple-500/20">
                      <span className="font-mono text-xs font-bold text-pink-400 px-2 py-0.5 rounded-lg bg-pink-500/10 border border-pink-500/20 inline-block">{ann.name}</span>
                      <p className="text-xs text-slate-200 mt-2 leading-relaxed">{ann.whyUsed}</p>
                      <p className="text-[11px] text-purple-300/90 font-mono mt-2 pt-2 border-t border-slate-800">⚙️ <span className="text-slate-400 font-semibold">Under the hood:</span> {ann.internalWorking}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Interview Q&A */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5" /><span>Interview Questions & Detailed Answers</span>
                </h4>
                {activeQA.map((qa, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <p className="text-xs font-bold text-indigo-300 leading-relaxed">Q: {qa.question}</p>
                    <p className="text-xs text-slate-300 leading-relaxed mt-2 pt-2 border-t border-slate-800">
                      <span className="font-bold text-emerald-400">Answer: </span>{qa.answer}
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
    { id: 's1', stepNumber: 1, nodeId: 'n1', nodeType: 'REACT_COMPONENT', layer: 'FRONTEND', title: 'LoginButton.tsx', subtitle: 'React Event Listener (onClick)', annotationsCsv: '', description: 'User submits authentication form. React handleLogin() event triggers form validation.', dataPayload: '{ username: "user@example.com" }' },
    { id: 's2', stepNumber: 2, nodeId: 'n2', nodeType: 'REACT_API_CALL', layer: 'FRONTEND', title: 'POST /api/v1/auth/login', subtitle: 'Axios REST API Client', annotationsCsv: '', description: 'Axios sends HTTP POST request over network to Spring Boot backend.', dataPayload: 'Content-Type: application/json' },
    { id: 's3', stepNumber: 3, nodeId: 'n3', nodeType: 'SPRING_CONTROLLER', layer: 'BACKEND', title: 'AuthController.java', subtitle: '@RestController Handler', annotationsCsv: '@RestController, @PostMapping, @RequestBody', description: 'DispatcherServlet delegates request to AuthController. Request DTO validated.', dataPayload: 'LoginRequest DTO' },
    { id: 's4', stepNumber: 4, nodeId: 'n4', nodeType: 'SPRING_SERVICE', layer: 'BACKEND', title: 'AuthenticationService.java', subtitle: '@Service Business Logic', annotationsCsv: '@Service, @Transactional', description: 'Service checks password hashes and invokes UserRepository to fetch user details.', dataPayload: 'BCrypt Password Check' },
    { id: 's5', stepNumber: 5, nodeId: 'n5', nodeType: 'SPRING_REPOSITORY', layer: 'BACKEND', title: 'UserRepository.java', subtitle: '@Repository Spring Data JPA', annotationsCsv: '@Repository, @Autowired', description: 'Repository invokes findByUsername() query using Hibernate ORM session.', dataPayload: 'JpaRepository.findByUsername()' },
    { id: 's6', stepNumber: 6, nodeId: 'n6', nodeType: 'DB_TABLE', layer: 'DATABASE', title: 'users Table', subtitle: '@Entity Persistent Table', annotationsCsv: '@Entity, @Table, @Id', description: 'SQL SELECT executes on PostgreSQL. Result set returned to Spring Service layer.', dataPayload: 'SELECT * FROM users WHERE username = ?' },
  ];
}
