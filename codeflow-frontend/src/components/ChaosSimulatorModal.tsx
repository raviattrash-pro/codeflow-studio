import React, { useState, useEffect } from 'react';
import {
  X, Flame, Play, RotateCcw, AlertOctagon, CheckCircle2, ShieldAlert,
  Zap, Activity, Cpu, ArrowRight, ShieldCheck, Terminal, Copy, Check
} from 'lucide-react';
import { ThemeMode } from './Header';

interface ChaosSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
}

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface ChaosScenario {
  id: string;
  title: string;
  description: string;
  faultType: 'LATENCY_SPIKE' | 'SERVICE_500' | 'CONNECTION_LEAK';
  targetComponent: string;
  expectedBehavior: string;
}

const SCENARIOS: ChaosScenario[] = [
  {
    id: 'hikari-exhaust',
    title: 'HikariCP Connection Pool Exhaustion',
    description: 'Simulates 50 concurrent transactions holding database locks for > 5000ms.',
    faultType: 'CONNECTION_LEAK',
    targetComponent: 'PostgreSQL DataSource / HikariPool-1',
    expectedBehavior: 'Resilience4j bulkhead trips, fast-rejecting overflow requests with HTTP 429.',
  },
  {
    id: 'stripe-timeout',
    title: 'Stripe Gateway 504 Gateway Timeout',
    description: 'Injects artificial 8000ms latency on external credit card authorization webhooks.',
    faultType: 'LATENCY_SPIKE',
    targetComponent: 'PaymentGatewayClient.java (@CircuitBreaker)',
    expectedBehavior: 'Circuit transitions CLOSED ➔ OPEN after 3 failures; fallback queues payment asynchronously.',
  },
  {
    id: 'redis-stampede',
    title: 'Redis Cache Thundering Herd Storm',
    description: 'Simulates sudden cache key eviction causing 500 simultaneous DB queries for hot products.',
    faultType: 'SERVICE_500',
    targetComponent: 'ProductCatalogService.java (@Cacheable)',
    expectedBehavior: 'Single-flight mutex locks ensure only 1 thread queries DB while 499 await cached result.',
  }
];

export const ChaosSimulatorModal: React.FC<ChaosSimulatorModalProps> = ({
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
}) => {
  const [selectedScenario, setSelectedScenario] = useState<ChaosScenario>(SCENARIOS[1]);
  const [isRunning, setIsRunning] = useState(false);
  const [circuitState, setCircuitState] = useState<CircuitState>('CLOSED');
  const [requestCount, setRequestCount] = useState(0);
  const [failureRate, setFailureRate] = useState(0);
  const [fallbackTriggered, setFallbackTriggered] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isLight = currentTheme === 'NORMAL';
  const isGlass = currentTheme === 'GLASSMORPHISM';
  const isNeumorphic = currentTheme === 'NEUMORPHIC';

  const handleRunSimulation = () => {
    setIsRunning(true);
    setLogs([]);
    setRequestCount(0);
    setFailureRate(0);
    setFallbackTriggered(0);
    setCircuitState('CLOSED');

    const addLog = (msg: string) => {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    addLog(`Starting Chaos Injection: ${selectedScenario.title}`);
    addLog(`Targeting: ${selectedScenario.targetComponent}`);

    // Step 1: Normal traffic
    setTimeout(() => {
      setRequestCount(10);
      setFailureRate(5);
      addLog('Traffic load: 10 req/s — Circuit State: CLOSED (Normal)');
    }, 600);

    // Step 2: Fault injected
    setTimeout(() => {
      setRequestCount(35);
      setFailureRate(68);
      setFallbackTriggered(12);
      setCircuitState('OPEN');
      addLog('⚠️ Fault Injected: 8000ms latency detected on payment gateway');
      addLog('💥 Failure rate exceeded 50% threshold! CircuitBreaker transitioned to OPEN (Fast-Fail)');
    }, 1500);

    // Step 3: Fallback handling
    setTimeout(() => {
      setRequestCount(50);
      setFailureRate(100);
      setFallbackTriggered(38);
      addLog('🛡️ Fallback executed: Queued payments to RabbitMQ dead-letter queue');
      addLog('Testing recovery in HALF_OPEN state...');
      setCircuitState('HALF_OPEN');
    }, 2800);

    // Step 4: Recovery
    setTimeout(() => {
      setCircuitState('CLOSED');
      setFailureRate(0);
      addLog('✅ Gateway recovered! CircuitBreaker transitioned to CLOSED (Healthy)');
      setIsRunning(false);
    }, 4200);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCircuitState('CLOSED');
    setRequestCount(0);
    setFailureRate(0);
    setFallbackTriggered(0);
    setLogs([]);
  };

  const copyConfig = () => {
    const yaml = `resilience4j:
  circuitbreaker:
    instances:
      paymentService:
        slidingWindowSize: 10
        minimumNumberOfCalls: 5
        failureRateThreshold: 50
        waitDurationInOpenState: 10000ms
        permittedNumberOfCallsInHalfOpenState: 3
        automaticTransitionFromOpenToHalfOpenEnabled: true`;
    navigator.clipboard.writeText(yaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCircuitBadge = () => {
    switch (circuitState) {
      case 'CLOSED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">CLOSED (Healthy)</span>;
      case 'OPEN':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">OPEN (Tripped / Fast-Fail)</span>;
      case 'HALF_OPEN':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">HALF_OPEN (Testing Recovery)</span>;
    }
  };

  return (
    <div className="studio-modal-overlay">
      <div
        className={`w-full max-w-5xl  flex flex-col studio-modal-card rounded-2xl shadow-2xl overflow-hidden border ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : isGlass
            ? 'bg-[#0f172a] border-cyan-500/40 text-white'
            : isNeumorphic
            ? 'bg-[#1e2330] border-slate-700/50 text-slate-100'
            : 'bg-[#0f172a] border-slate-700 text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white font-bold shadow-lg shadow-rose-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Chaos Engineering & Resilience Simulator</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Resilience4j
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Inject connection pool starvation, third-party timeouts, and watch live CircuitBreaker state transitions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Scenarios */}
          <div className="md:col-span-4 border-r border-slate-700/50 p-4 space-y-2 overflow-y-auto bg-slate-800/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Fault Injection Scenarios
            </span>
            {SCENARIOS.map(sc => (
              <button
                key={sc.id}
                onClick={() => {
                  setSelectedScenario(sc);
                  handleReset();
                }}
                className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1.5 ${
                  selectedScenario.id === sc.id
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                    : 'bg-slate-800/40 border-slate-700/40 text-slate-300 hover:bg-slate-800/70'
                }`}
              >
                <span className="text-xs font-bold">{sc.title}</span>
                <p className="text-[11px] text-slate-400 leading-snug">{sc.description}</p>
              </button>
            ))}
          </div>

          {/* Right Live Simulation & Telemetry */}
          <div className="md:col-span-8 flex flex-col overflow-y-auto p-5 space-y-5">
            {/* Top State Machine Card */}
            <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block mb-1">CircuitBreaker State</span>
                <div className="flex items-center gap-2">
                  {getCircuitBadge()}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRunSimulation}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold font-mono rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isRunning ? 'Injecting Chaos...' : 'Inject Chaos Fault'}</span>
                </button>
                <button
                  onClick={handleReset}
                  className="p-2 text-xs rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Metrics HUD */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-slate-700/40 bg-slate-800/20">
                <span className="text-[11px] text-slate-400 block">Total Requests</span>
                <span className="text-xl font-bold font-mono text-cyan-300">{requestCount}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-700/40 bg-slate-800/20">
                <span className="text-[11px] text-slate-400 block">Failure Rate</span>
                <span className={`text-xl font-bold font-mono ${failureRate > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {failureRate}%
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-700/40 bg-slate-800/20">
                <span className="text-[11px] text-slate-400 block">Fallbacks Triggered</span>
                <span className="text-xl font-bold font-mono text-amber-300">{fallbackTriggered}</span>
              </div>
            </div>

            {/* Live Terminal Log */}
            <div className="border border-slate-700/50 rounded-xl overflow-hidden bg-slate-950 flex-1 flex flex-col min-h-[160px]">
              <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-rose-400" />
                  <span className="font-mono">Resilience Telemetry Stream</span>
                </div>
              </div>
              <div className="p-3 font-mono text-xs text-slate-300 space-y-1 overflow-y-auto flex-1 max-h-48">
                {logs.length > 0 ? (
                  logs.map((l, i) => (
                    <div key={i} className="leading-relaxed">
                      {l}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic">Click "Inject Chaos Fault" to start real-time telemetry...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
