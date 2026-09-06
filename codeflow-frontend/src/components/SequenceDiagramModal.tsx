import React, { useState, useEffect } from 'react';
import { X, Play, Pause, SkipBack, SkipForward, ArrowRight, Zap, Code, ShieldCheck, Database, Server, Smartphone, Layout, RefreshCw } from 'lucide-react';
import { SequenceHop, DEMO_SEQUENCE_HOPS } from '../utils/metricsData';
import { ThemeMode } from './Header';

interface SequenceDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
}

const LANES: { id: SequenceHop['from']; label: string; sub: string; icon: any; color: string; bg: string }[] = [
  { id: 'BROWSER', label: 'User Browser', sub: 'Client Engine', icon: Smartphone, color: '#38bdf8', bg: '#082f49' },
  { id: 'REACT_APP', label: 'React 19 SPA', sub: 'UI Components', icon: Layout, color: '#06b6d4', bg: '#164e63' },
  { id: 'API_GATEWAY', label: 'API Gateway', sub: 'Spring Security', icon: ShieldCheck, color: '#6366f1', bg: '#312e81' },
  { id: 'CONTROLLER', label: 'OrderController', sub: '@RestController', icon: Zap, color: '#8b5cf6', bg: '#4c1d95' },
  { id: 'SERVICE', label: 'OrderService', sub: '@Transactional', icon: Server, color: '#a855f7', bg: '#581c87' },
  { id: 'REPOSITORY', label: 'OrderRepository', sub: 'Spring Data JPA', icon: Code, color: '#ec4899', bg: '#701a75' },
  { id: 'DATABASE', label: 'PostgreSQL 16', sub: 'ACID Storage', icon: Database, color: '#f59e0b', bg: '#78350f' },
];

export const SequenceDiagramModal: React.FC<SequenceDiagramModalProps> = ({
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed] = useState(1500); // ms per step
  const hops = DEMO_SEQUENCE_HOPS;

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= hops.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, hops.length]);

  if (!isOpen) return null;

  const getLaneIndex = (id: SequenceHop['from']) => LANES.findIndex((l) => l.id === id);

  const getModalStyle = () => {
    switch (currentTheme) {
      case 'NEUMORPHIC':
        return 'bg-[#e0e5ec] text-[#2d3748] border-[#c0cbdc] shadow-[15px_15px_30px_#a3b1c6,-15px_-15px_30px_#ffffff]';
      case 'NORMAL':
        return 'bg-white border-slate-200 text-slate-900 shadow-2xl';
      default:
        return 'bg-[#0f172a] text-slate-100 border-slate-800 shadow-[0_25px_80px_rgba(0,0,0,0.95)]';
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`w-full max-w-6xl h-[90vh] max-h-[90vh] rounded-3xl border flex flex-col my-auto shadow-2xl overflow-hidden font-sans ${getModalStyle()}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-slate-800 flex items-center justify-between bg-[#0b1120] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-pink-500/30 shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base md:text-lg font-bold font-mono text-white">Full-Stack Request/Response Sequence Flow</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-pink-500/20 text-pink-300 border border-pink-500/40">
                  Interactive Hop Tracer
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Visualizing asynchronous HTTP, AOP proxies, Hibernate dirty checking, and database round trips.
              </p>
            </div>
          </div>

          {/* VCR Playback Controls */}
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="flex items-center bg-[#1e293b] border border-slate-700 rounded-xl p-1 font-mono text-xs">
              <button
                onClick={() => {
                  setActiveStep(0);
                  setIsPlaying(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                title="Reset to Start"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                title="Step Back"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-3 py-1 rounded-lg flex items-center space-x-1 font-bold ${
                  isPlaying ? 'bg-amber-500 text-black' : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play Flow'}</span>
              </button>
              <button
                onClick={() => setActiveStep((s) => Math.min(hops.length - 1, s + 1))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                title="Step Forward"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#1e293b] border border-slate-700 text-slate-300 hidden sm:block">
              Hop <span className="text-pink-400 font-bold">{activeStep + 1}</span> / {hops.length}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main 7-Swimlane Sequence Stage */}
        <div className="flex-1 overflow-auto p-4 md:p-6 flex flex-col custom-scrollbar bg-[#090d16]">
          {/* Top Swimlane Headers */}
          <div className="grid grid-cols-7 gap-2 md:gap-3 pb-4 border-b border-slate-800 sticky top-0 bg-[#090d16] z-20">
            {LANES.map((lane) => {
              const Icon = lane.icon;
              return (
                <div
                  key={lane.id}
                  className="p-2 md:p-3 rounded-2xl border flex flex-col items-center text-center shadow-lg transition-all"
                  style={{
                    backgroundColor: `${lane.bg}`,
                    borderColor: `${lane.color}55`,
                  }}
                >
                  <div
                    className="w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center mb-1 text-white shadow-md"
                    style={{ backgroundColor: lane.color }}
                  >
                    <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </div>
                  <span className="text-[11px] md:text-xs font-bold font-mono text-white truncate max-w-full">{lane.label}</span>
                  <span className="text-[9px] md:text-[10px] font-mono text-slate-300 opacity-80 truncate hidden sm:block">{lane.sub}</span>
                </div>
              );
            })}
          </div>

          {/* Vertical Hop Sequences */}
          <div className="relative flex-1 py-6 space-y-4 min-w-[650px]">
            {/* Vertical Lifelines */}
            <div className="absolute inset-0 grid grid-cols-7 gap-2 md:gap-3 pointer-events-none z-0">
              {LANES.map((lane) => (
                <div key={lane.id} className="flex justify-center h-full">
                  <div className="w-0.5 h-full border-dashed border-l border-slate-700/60" />
                </div>
              ))}
            </div>

            {/* Sequence Message Rows */}
            {hops.map((hop, idx) => {
              const isSelected = idx === activeStep;
              const isPassed = idx < activeStep;
              const fromIdx = getLaneIndex(hop.from);
              const toIdx = getLaneIndex(hop.to);
              const isLeftToRight = toIdx >= fromIdx;

              const startCol = Math.min(fromIdx, toIdx);
              const spanCols = Math.abs(toIdx - fromIdx);

              return (
                <div
                  key={hop.step}
                  onClick={() => {
                    setActiveStep(idx);
                    setIsPlaying(false);
                  }}
                  className={`relative z-10 cursor-pointer p-3.5 md:p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-[#1e293b] border-pink-500 shadow-2xl ring-2 ring-pink-500/40'
                      : isPassed
                      ? 'bg-[#111827] border-slate-800 opacity-85 hover:opacity-100'
                      : 'bg-[#0f172a] border-slate-800/60 opacity-50 hover:opacity-85'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                          isSelected
                            ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/50'
                            : isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {hop.step}
                      </span>
                      <span className="font-mono text-xs font-bold text-white truncate">{hop.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shrink-0">
                        {hop.protocol}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">{hop.durationMs}ms</span>
                  </div>

                  {/* Visual Lane-to-Lane Connector Arrow */}
                  <div className="grid grid-cols-7 gap-2 md:gap-3 my-2.5 py-1 items-center">
                    <div
                      style={{
                        gridColumnStart: startCol + 1,
                        gridColumnEnd: `span ${Math.max(1, spanCols + 1)}`,
                      }}
                      className="flex items-center relative"
                    >
                      <div className="flex-1 flex items-center relative">
                        <div
                          className={`w-full h-1 rounded-full ${
                            isSelected
                              ? 'bg-gradient-to-r from-pink-500 via-indigo-500 to-cyan-400 shadow-[0_0_10px_rgba(236,72,153,0.8)]'
                              : 'bg-slate-700'
                          }`}
                        />
                        {isLeftToRight ? (
                          <ArrowRight
                            className={`w-4 h-4 -ml-2 shrink-0 ${
                              isSelected ? 'text-cyan-400 animate-pulse' : 'text-slate-500'
                            }`}
                          />
                        ) : (
                          <ArrowRight
                            className={`w-4 h-4 -mr-2 rotate-180 order-first shrink-0 ${
                              isSelected ? 'text-pink-400 animate-pulse' : 'text-slate-500'
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Inspector on Active Step */}
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#030712] p-3 rounded-xl">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                          Transmission Payload / State
                        </span>
                        <code className="text-xs font-mono text-emerald-400 block break-all">
                          {hop.payloadSummary}
                        </code>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                          Framework &amp; Mechanics Context
                        </span>
                        <span className="text-xs font-mono text-purple-300 block leading-relaxed">
                          {hop.annotationHint}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
