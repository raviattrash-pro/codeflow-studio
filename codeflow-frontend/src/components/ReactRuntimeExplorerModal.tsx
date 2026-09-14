import React, { useState, useEffect } from 'react';
import {
  X, Play, Pause, SkipBack, SkipForward, RotateCcw,
  Layers, Activity, Zap, ShieldCheck, Check, Copy,
  Sparkles, Code2, AlertTriangle, ArrowRight, CheckCircle2,
  ChevronRight, ChevronDown, Clock, Cpu, FileCode,
  Flame, Monitor, Server, Terminal, RefreshCw, Box, Globe
} from 'lucide-react';
import { ThemeMode } from './Header';
import { DEMO_REACT_RUNTIME_SCENARIOS } from '../utils/demoData';
import { ReactFiberNode, HookMutationStep, ClientInterceptorTrace } from '../types';

interface ReactRuntimeExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string | null;
  currentTheme?: ThemeMode;
}

type ExplorerTab = 'fiber' | 'hooks' | 'interceptors' | 'audit';

export const ReactRuntimeExplorerModal: React.FC<ReactRuntimeExplorerModalProps> = ({
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
}) => {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<ExplorerTab>('fiber');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFiberNode, setSelectedFiberNode] = useState<ReactFiberNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'fiber_app': true,
    'fiber_query_provider': true,
    'fiber_checkout_page': true,
    'fiber_auth_provider': true
  });
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  const scenario = DEMO_REACT_RUNTIME_SCENARIOS[activeScenarioIdx] || DEMO_REACT_RUNTIME_SCENARIOS[0];
  const activeStep = scenario.steps[currentStepIdx] || scenario.steps[0];

  // Set default selected fiber node
  useEffect(() => {
    if (scenario.componentRoot) {
      // Pick first meaningful child or root
      const firstChild = scenario.componentRoot.children?.[0]?.children?.[0] || scenario.componentRoot;
      setSelectedFiberNode(firstChild);
    }
  }, [activeScenarioIdx, scenario]);

  // VCR auto-play timer
  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => (prev + 1) % scenario.steps.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isOpen, isPlaying, scenario.steps.length]);

  if (!isOpen) return null;

  const toggleNodeExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copySnippet = (code: string) => {
    navigator.clipboard.writeText(code);
    setHasCopiedCode(true);
    setTimeout(() => setHasCopiedCode(false), 2000);
  };

  // Recursive component to render Fiber Tree hierarchy
  const renderFiberTree = (node: ReactFiberNode, depth: number = 0) => {
    const isExpanded = expandedNodes[node.id] !== false;
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedFiberNode?.id === node.id;

    return (
      <div key={node.id} className="flex flex-col">
        <div
          onClick={() => setSelectedFiberNode(node)}
          className={`cursor-pointer px-3 py-2 rounded-xl border transition-all flex items-center justify-between text-xs font-mono my-0.5 group ${
            isSelected
              ? 'bg-indigo-600/30 border-indigo-500 shadow-md ring-1 ring-indigo-500/50 text-white'
              : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
          style={{ marginLeft: `${depth * 16}px` }}
        >
          <div className="flex items-center space-x-2 truncate">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNodeExpand(node.id);
                }}
                className="p-0.5 hover:bg-slate-700 rounded text-slate-400"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <span className="w-4 h-4 inline-block text-center text-slate-600">•</span>
            )}

            <span className="text-sm">
              {node.type === 'PROVIDER' ? '🛡️' : node.type === 'HOOK' ? '🪝' : '⚛️'}
            </span>

            <span className="font-bold truncate">{node.name}</span>
            {node.type === 'PROVIDER' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Provider
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
              node.renderCount > 2
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {node.renderCount}x render
            </span>
            <span className="text-[10px] text-cyan-400 font-bold">
              {node.renderTimeMs}ms
            </span>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="flex flex-col">
            {node.children!.map((child) => renderFiberTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="modal-backdrop">
      <div className="w-full max-w-6xl h-[90vh] rounded-3xl overflow-hidden flex flex-col border border-slate-800 shadow-2xl relative bg-[#0a0e1a] text-slate-100">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-pink-600 shadow-lg shadow-indigo-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base md:text-lg font-bold font-mono text-white">
                  React 19 Runtime Explorer &amp; Client Flow Suite
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  v5.0 Core
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Fiber Tree Reconciliation • Hook State Timeline • Axios Interceptor Tracer
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Scenario Switcher */}
            <div className="flex items-center space-x-1.5 overflow-x-auto custom-scrollbar">
              {DEMO_REACT_RUNTIME_SCENARIOS.map((sc, i) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    setActiveScenarioIdx(i);
                    setCurrentStepIdx(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
                    activeScenarioIdx === i
                      ? 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{sc.icon}</span>
                  <span>{sc.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {[
              { key: 'fiber', label: '🌳 Fiber Tree & Renders', count: '6 Nodes' },
              { key: 'hooks', label: '🪝 Hook State Timeline', count: `${scenario.steps.length} Steps` },
              { key: 'interceptors', label: '🌐 Axios Interceptors', count: '6 Stages' },
              { key: 'audit', label: '⚡ Performance Audit', count: '0 Wasted' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as ExplorerTab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-75">({tab.count})</span>
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
            <span className="text-emerald-400 font-bold">● React 19 Concurrent Fiber</span>
            <span>•</span>
            <span>Total Client Duration: <strong className="text-white">{scenario.totalClientDurationMs}ms</strong></span>
          </div>
        </div>

        {/* Main Explorer Workspace Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {/* TAB 1: FIBER TREE & COMPONENT INSPECTOR */}
          {activeTab === 'fiber' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
              {/* Left Column: Fiber Tree Hierarchy */}
              <div className="lg:col-span-6 flex flex-col h-full rounded-2xl bg-slate-950/70 border border-slate-800/80 p-4">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-white">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>Virtual DOM Fiber Node Tree</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Click node to inspect props &amp; hooks
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                  {renderFiberTree(scenario.componentRoot)}
                </div>
              </div>

              {/* Right Column: Selected Fiber Node Details */}
              <div className="lg:col-span-6 flex flex-col h-full rounded-2xl bg-slate-950/70 border border-slate-800/80 p-4">
                {selectedFiberNode ? (
                  <div className="space-y-4 font-mono text-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-base font-bold text-white">
                            &lt;{selectedFiberNode.name} /&gt;
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {selectedFiberNode.type}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          ID: {selectedFiberNode.id}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-cyan-400">{selectedFiberNode.renderTimeMs}ms render</div>
                        <div className="text-[10px] text-slate-400">{selectedFiberNode.renderCount} renders in lifecycle</div>
                      </div>
                    </div>

                    {/* Re-render Trigger Reason */}
                    {selectedFiberNode.reRenderReason && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                        <div className="text-[10px] uppercase font-bold text-amber-400 mb-1">
                          Re-render Cause:
                        </div>
                        <div>{selectedFiberNode.reRenderReason}</div>
                      </div>
                    )}

                    {/* State Summary */}
                    {selectedFiberNode.stateSummary && (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                          Active Component State:
                        </div>
                        <div className="text-emerald-400">{selectedFiberNode.stateSummary}</div>
                      </div>
                    )}

                    {/* Associated Hooks */}
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">
                        Attached React Hooks ({selectedFiberNode.hooks.length}):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedFiberNode.hooks.map((h, idx) => (
                          <span key={idx} className="px-2 py-1 rounded-lg text-[10px] font-bold bg-indigo-950 border border-indigo-800 text-indigo-300">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Props JSON Viewer */}
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">
                        Passed Component Props:
                      </div>
                      <pre className="p-3 rounded-lg bg-[#070a12] text-indigo-300 text-[11px] leading-relaxed border border-slate-900 overflow-x-auto">
                        <code>{JSON.stringify(selectedFiberNode.props, null, 2)}</code>
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 font-mono text-xs">
                    <Layers className="w-8 h-8 mb-2 opacity-50" />
                    <span>Select a component node from the tree to inspect details</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: HOOK STATE TIMELINE (VCR SCRUBBER) */}
          {activeTab === 'hooks' && (
            <div className="space-y-6">
              {/* Scrubber Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-950/80 border border-slate-800 gap-3">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center space-x-2 transition-all ${
                      isPlaying
                        ? 'bg-pink-600 border border-pink-500 text-white shadow-lg shadow-pink-600/30'
                        : 'bg-slate-900 border border-slate-700 text-slate-200 hover:text-white'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'Auto-Playing' : 'Play Timeline'}</span>
                  </button>

                  <button
                    onClick={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
                    disabled={currentStepIdx === 0}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setCurrentStepIdx((prev) => Math.min(scenario.steps.length - 1, prev + 1))}
                    disabled={currentStepIdx === scenario.steps.length - 1}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setCurrentStepIdx(0)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-3 text-xs font-mono">
                  <span className="text-slate-400">Step {currentStepIdx + 1} of {scenario.steps.length}:</span>
                  <span className="px-2.5 py-1 rounded-lg bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
                    {activeStep.hookName}
                  </span>
                </div>
              </div>

              {/* Step Sequence Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {scenario.steps.map((step, idx) => {
                  const isCurrent = idx === currentStepIdx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setCurrentStepIdx(idx)}
                      className={`cursor-pointer p-3 rounded-xl border text-xs font-mono transition-all ${
                        isCurrent
                          ? 'bg-[#1a1530] border-pink-500 shadow-md ring-1 ring-pink-500/50 text-pink-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[10px] text-slate-500">STEP {step.stepIndex}</span>
                        <span className="text-emerald-400 text-[10px] font-bold">{step.durationMs}ms</span>
                      </div>
                      <div className="font-bold truncate text-white">{step.hookName}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{step.component}</div>
                    </div>
                  );
                })}
              </div>

              {/* Active Step Details & Code Snippet */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* State Before & After Diff */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 font-mono text-xs">
                    <div className="text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                      Mutation Description:
                    </div>
                    <p className="text-slate-200 leading-relaxed mb-3">
                      {activeStep.diffDescription}
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                      <div>
                        <span className="text-[10px] font-bold text-red-400 uppercase">State Before:</span>
                        <pre className="p-2.5 rounded-lg bg-[#070a12] text-red-300 text-[10px] mt-1 border border-red-950 overflow-x-auto">
                          <code>{JSON.stringify(activeStep.stateBefore, null, 2)}</code>
                        </pre>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase">State After:</span>
                        <pre className="p-2.5 rounded-lg bg-[#070a12] text-emerald-300 text-[10px] mt-1 border border-emerald-950 overflow-x-auto">
                          <code>{JSON.stringify(activeStep.stateAfter, null, 2)}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Code Snippet Viewer */}
                <div className="lg:col-span-6">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 font-mono text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400">File: <strong className="text-white">{activeStep.component}</strong></span>
                      <button
                        onClick={() => copySnippet(activeStep.codeSnippet)}
                        className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] text-slate-300 hover:text-white flex items-center space-x-1"
                      >
                        {hasCopiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{hasCopiedCode ? 'Copied' : 'Copy Code'}</span>
                      </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-[#070a12] text-indigo-300 text-[11px] leading-relaxed border border-slate-900 overflow-x-auto">
                      <code>{activeStep.codeSnippet}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AXIOS INTERCEPTOR PIPELINE */}
          {activeTab === 'interceptors' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2 text-white font-bold">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Full Client-to-Server Axios / Fetch Pipeline Stages</span>
                </div>
                <span className="text-slate-400">6 Stages Executed</span>
              </div>

              <div className="space-y-3">
                {scenario.interceptorPipeline.map((stage, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-indigo-500/50 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-sm">{stage.label}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                            {stage.stage}
                          </span>
                          {stage.statusText && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                              {stage.statusText}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-xs mt-1">{stage.details}</p>

                        {stage.headers && (
                          <div className="mt-2 text-[10px] text-indigo-300 bg-[#070a12] p-2 rounded-lg border border-slate-900">
                            <strong>Injected Headers:</strong> {JSON.stringify(stage.headers)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-emerald-400">{stage.durationMs}ms</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PERFORMANCE & RE-RENDER AUDIT */}
          {activeTab === 'audit' && (
            <div className="space-y-6 font-mono">
              {/* Top Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Client Latency', val: `${scenario.totalClientDurationMs}ms`, col: 'text-cyan-400', sub: 'Sub-16ms target' },
                  { label: 'Fiber Re-renders', val: '7 Passes', col: 'text-indigo-400', sub: 'Optimized via React 19' },
                  { label: 'Wasted Re-renders', val: '0 Wasted', col: 'text-emerald-400', sub: '100% Clean Memoization' },
                  { label: 'Hooks Evaluated', val: '8 Hooks', col: 'text-purple-400', sub: 'Mutations, Memos, State' },
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">{stat.label}</span>
                    <div className={`text-xl font-extrabold mt-1 ${stat.col}`}>{stat.val}</div>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">{stat.sub}</span>
                  </div>
                ))}
              </div>

              {/* Optimization Recommendations */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>React 19 &amp; TanStack Query Best Practice Audit</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="font-bold text-emerald-400 mb-1">✅ Atomic Cache Invalidation</div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Using <code className="text-emerald-300">queryClient.invalidateQueries(&#123; queryKey: ['orders'] &#125;)</code> ensures only dependent views re-fetch rather than full page reloads.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="font-bold text-emerald-400 mb-1">✅ Concurrent Transitions</div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      React 19 <code className="text-emerald-300">useActionState</code> and <code className="text-emerald-300">useOptimistic</code> provide immediate UI responsiveness with automated rollback guards.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <span className="text-xs font-mono text-slate-400">
            Powered by React 19 AST &amp; Static Fiber Analyzer Engine
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-xs font-mono font-bold text-white shadow-md"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
