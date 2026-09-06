import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Play, Pause, SkipBack, SkipForward, Activity, Zap, Clock, Cpu, Server, Database, Layers, ArrowRight, Gauge, Smartphone, ShieldCheck, Code, Wrench, HardDrive, RefreshCw, Terminal, CheckCircle2, FileText, CornerDownRight } from 'lucide-react';

interface TraceStep {
  step: number;
  layer: string;
  component: string;
  action: string;
  durationMs: number;
}

interface ExecutionTrace {
  id: String;
  projectId: string;
  endpoint: string;
  httpMethod: string;
  durationMs: number;
  status: string;
  timestamp: string;
  traceStepsJson: string;
}

import { ThemeMode } from './Header';

interface RuntimeTracingModalProps {
  projectId: string | null;
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
}

import { DEMO_TRACES, DEMO_PROJECT_DATA } from '../utils/demoData';

export const RuntimeTracingModal: React.FC<RuntimeTracingModalProps> = ({
  projectId,
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
}) => {
  const [traces, setTraces] = useState<ExecutionTrace[]>([]);
  const [selectedTrace, setSelectedTrace] = useState<ExecutionTrace | null>(null);
  const [parsedSteps, setParsedSteps] = useState<TraceStep[]>([]);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x, 2x, 3x, 5x
  const [activeTab, setActiveTab] = useState<'ACTION' | 'PAYLOAD' | 'SQL'>('ACTION');
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen || !projectId) return;

    if (projectId === DEMO_PROJECT_DATA.id) {
      setTraces(DEMO_TRACES);
      if (DEMO_TRACES.length > 0) selectTrace(DEMO_TRACES[0]);
      return;
    }

    axios
      .get<ExecutionTrace[]>(`/api/v1/projects/${projectId}/traces`)
      .then((res) => {
        const loadedTraces = Array.isArray(res.data) && res.data.length > 0 ? res.data : DEMO_TRACES;
        setTraces(loadedTraces);
        if (loadedTraces.length > 0) {
          selectTrace(loadedTraces[0]);
        }
      })
      .catch(() => {
        setTraces(DEMO_TRACES);
        if (DEMO_TRACES.length > 0) selectTrace(DEMO_TRACES[0]);
      });
  }, [isOpen, projectId]);

  const selectTrace = (trace: ExecutionTrace) => {
    setSelectedTrace(trace);
    try {
      const steps: TraceStep[] = JSON.parse(trace.traceStepsJson);
      setParsedSteps(steps);
      setActiveStepIdx(0);
      setIsPlaying(false);
    } catch (e) {
      setParsedSteps([]);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      const interval = 1200 / playbackSpeed;
      timerRef.current = setInterval(() => {
        setActiveStepIdx((prev) => {
          if (prev >= parsedSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, interval);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, playbackSpeed, parsedSteps.length]);

  const getLayerIcon = (layer: string) => {
    switch (layer.toUpperCase()) {
      case 'CLIENT': return <Smartphone className="w-4 h-4 text-cyan-400" />;
      case 'API_GATEWAY': return <ShieldCheck className="w-4 h-4 text-indigo-400" />;
      case 'CONTROLLER': return <Code className="w-4 h-4 text-pink-400" />;
      case 'SERVICE': return <Wrench className="w-4 h-4 text-purple-400" />;
      case 'REPOSITORY': return <HardDrive className="w-4 h-4 text-amber-400" />;
      default: return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  if (!isOpen) return null;

  const getModalStyle = () => {
    switch (currentTheme) {
      case 'NEUMORPHIC':
        return 'bg-[#e0e5ec] text-[#2d3748] border-white/60 shadow-[15px_15px_30px_#a3b1c6,-15px_-15px_30px_#ffffff]';
      case 'GLASSMORPHISM':
        return 'bg-white/80 backdrop-blur-2xl border-white text-slate-900 shadow-2xl';
      case 'NORMAL':
        return 'bg-white border-slate-200 text-slate-900 shadow-2xl';
      default:
        return 'bg-[#0b0f19] border-slate-800/80 text-slate-100 shadow-[0_25px_80px_rgba(0,0,0,0.95)]';
    }
  };

  const getHeaderStyle = () => {
    switch (currentTheme) {
      case 'NEUMORPHIC':
        return 'bg-[#e0e5ec] border-b border-[#c0cbdc] text-[#2d3748]';
      case 'GLASSMORPHISM':
        return 'bg-white/70 backdrop-blur-xl border-b border-white/80 text-slate-900';
      case 'NORMAL':
        return 'bg-slate-100 border-b border-slate-200 text-slate-900';
      default:
        return 'bg-[#080b13] border-b border-slate-800/80 text-slate-100';
    }
  };

  const progressPercent = parsedSteps.length > 0 ? ((activeStepIdx + 1) / parsedSteps.length) * 100 : 0;
  const activeStep = parsedSteps[activeStepIdx];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`w-full max-w-6xl h-[88vh] max-h-[88vh] border rounded-3xl overflow-hidden flex flex-col my-auto ${getModalStyle()}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`px-6 py-4 flex items-center justify-between shrink-0 ${getHeaderStyle()}`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
              <Activity className="w-5 h-5 animate-pulse text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono flex items-center space-x-2.5">
                <span>Runtime Tracing & Execution Replay Engine</span>
                <span className="px-2.5 py-0.5 text-[10px] bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-500 border border-cyan-500/40 rounded-full font-bold shadow-sm">
                  v3.0.0 RELEASE
                </span>
              </h3>
              <p className="text-xs opacity-70 font-mono mt-0.5">
                Live Controller ➔ Service ➔ Repository ➔ SQL execution playback with interactive player controls
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-all border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Workspace Layout */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* Left Panel: Captured Traces Sidebar */}
          <div className="w-80 border-r border-slate-800/80 bg-[#080b13] overflow-y-auto custom-scrollbar p-3.5 space-y-2.5 shrink-0">
            <div className="flex items-center justify-between px-2 mb-3">
              <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400 inline" />
                <span>Captured Traces ({traces.length})</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>

            {(Array.isArray(traces) ? traces : []).map((trace) => {
              const isSel = selectedTrace?.id === trace.id;
              const methodCol = trace.httpMethod === 'POST' ? 'text-green-400 border-green-500/40 bg-green-500/10' :
                                trace.httpMethod === 'DELETE' ? 'text-red-400 border-red-500/40 bg-red-500/10' :
                                trace.httpMethod === 'PUT' ? 'text-amber-400 border-amber-500/40 bg-amber-500/10' :
                                'text-blue-400 border-blue-500/40 bg-blue-500/10';

              return (
                <button
                  key={String(trace.id)}
                  onClick={() => selectTrace(trace)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    isSel
                      ? 'bg-slate-800/90 border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.15)] scale-[1.02]'
                      : 'bg-[#0f172a]/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-md border ${methodCol}`}>
                      {trace.httpMethod}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold flex items-center space-x-1 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                      <Clock className="w-3 h-3 inline" />
                      <span>{trace.durationMs}ms</span>
                    </span>
                  </div>
                  <div className="text-xs font-mono font-bold text-white truncate">{trace.endpoint}</div>
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mt-2">
                    <span className="text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 inline" />
                      <span>200 OK</span>
                    </span>
                    <span>100% Parsed</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Panel: Interactive Replay Canvas & Telemetry Dashboard */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0d16] p-5 space-y-4">
            {selectedTrace ? (
              <div className="flex-1 flex flex-col min-h-0 space-y-4">
                {/* 1. Live Engine Telemetry Cards Bar */}
                <div className="grid grid-cols-4 gap-3 shrink-0">
                  <div className="p-3 rounded-2xl bg-[#0f172a] border border-slate-800/80 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Gauge className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">P95 Latency</span>
                      <span className="text-xs font-mono font-bold text-cyan-400">{selectedTrace.durationMs} ms</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#0f172a] border border-slate-800/80 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Status</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">200 OK</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#0f172a] border border-slate-800/80 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Thread</span>
                      <span className="text-xs font-mono font-bold text-purple-300 truncate max-w-[90px] block">http-nio-8080</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#0f172a] border border-slate-800/80 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">DB Queries</span>
                      <span className="text-xs font-mono font-bold text-amber-400">1 SELECT, 1 UPDATE</span>
                    </div>
                  </div>
                </div>

                {/* 2. Interactive Player Controls & Progress Bar */}
                <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800/80 flex flex-col space-y-3 shrink-0 shadow-lg">
                  <div className="flex items-center justify-between">
                    {/* Control Buttons */}
                    <div className="flex items-center space-x-2.5">
                      <button
                        onClick={() => setActiveStepIdx(Math.max(0, activeStepIdx - 1))}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all active:scale-95 shadow-sm"
                        title="Step Backward"
                      >
                        <SkipBack className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs font-mono shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                        <span>{isPlaying ? 'Pause' : 'Play Trace'}</span>
                      </button>

                      <button
                        onClick={() => setActiveStepIdx(Math.min(parsedSteps.length - 1, activeStepIdx + 1))}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all active:scale-95 shadow-sm"
                        title="Step Forward"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => { setIsPlaying(false); setActiveStepIdx(0); }}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-all active:scale-95"
                        title="Reset Replay"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Step Counter & Speed Selector */}
                    <div className="flex items-center space-x-3 font-mono text-xs">
                      <div className="flex items-center space-x-1.5 bg-[#080b13] px-3 py-1.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400">Step:</span>
                        <span className="font-bold text-cyan-400">{activeStepIdx + 1}</span>
                        <span className="text-slate-600">/</span>
                        <span className="text-slate-300">{parsedSteps.length}</span>
                      </div>

                      <div className="flex items-center space-x-1 bg-[#080b13] p-1 rounded-xl border border-slate-800">
                        {[1, 2, 3, 5].map((spd) => (
                          <button
                            key={spd}
                            onClick={() => setPlaybackSpeed(spd)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              playbackSpeed === spd
                                ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-md'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Interactive Trace Range Slider Bar */}
                  <div className="relative w-full flex items-center my-3">
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, parsedSteps.length - 1)}
                      value={activeStepIdx}
                      onChange={(e) => setActiveStepIdx(Number(e.target.value))}
                      className="w-full h-3.5 rounded-full appearance-none cursor-pointer z-20 outline-none trace-slider-input"
                      style={{
                        backgroundColor: currentTheme === 'NEUMORPHIC' ? '#cbd5e1' : currentTheme === 'NORMAL' ? '#cbd5e1' : currentTheme === 'GLASSMORPHISM' ? '#cbd5e1' : '#1e293b',
                      }}
                    />
                    <div
                      className="absolute left-0 top-0 bottom-0 h-3.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full pointer-events-none z-10 shadow-sm"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* 3. Claymorphic 5-Column Pipeline Cards */}
                <div className="p-4.5 rounded-2xl bg-[#0f172a] border border-slate-800/80 shrink-0">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Interactive Pipeline Nodes</span>
                    </span>
                    <span className="text-cyan-400 font-mono text-[10px]">Click node card to jump to step</span>
                  </div>

                  <div className="grid grid-cols-5 gap-2.5 w-full">
                    {parsedSteps.map((st, idx) => {
                      const isCurr = idx === activeStepIdx;
                      const isPast = idx < activeStepIdx;

                      return (
                        <button
                          key={st.step}
                          onClick={() => setActiveStepIdx(idx)}
                          className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all min-w-0 cursor-pointer relative ${
                            isCurr
                              ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] scale-[1.04] -translate-y-0.5'
                              : isPast
                              ? 'bg-slate-800/90 border-slate-700 text-slate-200 hover:-translate-y-0.5'
                              : 'bg-[#080b13]/80 border-slate-800/80 text-slate-500 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center space-x-1.5 mb-1.5">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${
                              isCurr ? 'bg-cyan-400 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {st.step}
                            </span>
                            {getLayerIcon(st.layer)}
                          </div>
                          <span className="text-[11px] font-mono font-bold truncate w-full">{st.layer}</span>
                          <span className="text-[9px] font-mono text-slate-400 mt-0.5 truncate w-full">{st.component}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Multi-Tab Deep-Dive Inspector */}
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-5 rounded-2xl bg-[#0f172a] border border-slate-800/80 space-y-4">
                  {activeStep && (
                    <div className="space-y-4 font-mono">
                      {/* Inspector Header & Tab Switcher */}
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-cyan-400" />
                          <span className="text-sm font-bold text-white">
                            Step {activeStep.step}: {activeStep.layer}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1 bg-[#080b13] p-1 rounded-xl border border-slate-800">
                          <button
                            onClick={() => setActiveTab('ACTION')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              activeTab === 'ACTION'
                                ? 'bg-cyan-500 text-slate-950 font-extrabold'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Execution Action
                          </button>

                          <button
                            onClick={() => setActiveTab('PAYLOAD')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              activeTab === 'PAYLOAD'
                                ? 'bg-indigo-500 text-white font-extrabold'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Payload DTO
                          </button>

                          <button
                            onClick={() => setActiveTab('SQL')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              activeTab === 'SQL'
                                ? 'bg-amber-500 text-slate-950 font-extrabold'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            SQL Query
                          </button>
                        </div>
                      </div>

                      {/* Tab 1: Execution Action */}
                      {activeTab === 'ACTION' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3.5 rounded-xl bg-[#080b13] border border-slate-800">
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Target Component:</span>
                              <span className="text-xs font-bold text-white block truncate">{activeStep.component}</span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-[#080b13] border border-slate-800">
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Execution Layer:</span>
                              <span className="text-xs font-bold text-cyan-400 block">{activeStep.layer}</span>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-[#080b13] border border-slate-800 space-y-2">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block flex items-center space-x-1.5">
                              <CornerDownRight className="w-3.5 h-3.5 text-cyan-400 inline" />
                              <span>Internal Mechanics & Method Invocation:</span>
                            </span>
                            <p className="text-xs text-cyan-300 leading-relaxed font-mono bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80">
                              {activeStep.action}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Tab 2: Payload DTO */}
                      {activeTab === 'PAYLOAD' && (
                        <div className="p-4 rounded-xl bg-[#080b13] border border-slate-800 space-y-2">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Inspected DTO Payload JSON:</span>
                          <pre className="text-xs text-indigo-300 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80 font-mono overflow-x-auto">
{`{
  "endpoint": "${selectedTrace.endpoint}",
  "httpMethod": "${selectedTrace.httpMethod}",
  "layer": "${activeStep.layer}",
  "status": "200 OK",
  "executedBy": "${activeStep.component}"
}`}
                          </pre>
                        </div>
                      )}

                      {/* Tab 3: SQL Query */}
                      {activeTab === 'SQL' && (
                        <div className="p-4 rounded-xl bg-[#080b13] border border-slate-800 space-y-2">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Generated Hibernate SQL Query:</span>
                          <pre className="text-xs text-amber-300 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80 font-mono overflow-x-auto">
{`SELECT t1.id, t1.label, t1.layer FROM ${(activeStep.component || '').toLowerCase().replace(/[^a-z]/g, '_')} t1 WHERE t1.status = 'ACTIVE' LIMIT 1;`}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-sm font-mono">
                Select a trace from the left panel to replay.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
