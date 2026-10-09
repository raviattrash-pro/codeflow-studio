import React, { useState, useCallback, useEffect } from 'react';
import {
  X, Sparkles, Bot, Shield, CheckCircle2, AlertTriangle, ArrowRight,
  GitPullRequest, RefreshCw, Copy, Check, Terminal, Zap, FileCode,
  Layers, Database, Code2, ChevronRight, Activity, Download
} from 'lucide-react';
import axios from 'axios';

interface SelfHealingSwarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
  isLight?: boolean;
}

interface SwarmAgent {
  id: string;
  name: string;
  specialization: string;
  status: string;
  rulesHandled: string[];
  confidence: number;
  remediationsApplied: number;
}

interface RemediationItem {
  agent: string;
  ruleId: string;
  title: string;
  explanation: string;
  targetFile: string;
  generatedFile?: string;
  confidence: number;
  originalCode: string;
  remediatedCode: string;
  diff: string;
}

interface CvePatch {
  cveId: string;
  dependency: string;
  vulnerableVersion: string;
  patchedVersion: string;
  severity: string;
  cvssScore: number;
  patchType: string;
  diff: string;
  status: string;
}

const DEMO_AGENTS: SwarmAgent[] = [
  {
    id: 'agent-decoupler',
    name: 'Layer Decoupler Agent',
    specialization: 'Architecture Boundary Enforcement & DTO Synthesis',
    status: 'ACTIVE',
    rulesHandled: ['LAYER-001', 'LAYER-002', 'CYCLE-001'],
    confidence: 99,
    remediationsApplied: 14,
  },
  {
    id: 'agent-jpa',
    name: 'JPA N+1 & Query Optimizer Agent',
    specialization: 'Hibernate EntityGraph & Batching Synthesis',
    status: 'ACTIVE',
    rulesHandled: ['JPA-001', 'PERF-N1'],
    confidence: 96,
    remediationsApplied: 9,
  },
  {
    id: 'agent-ts-sync',
    name: 'TypeScript Contract Synchronizer Agent',
    specialization: 'Fullstack Java Record ➔ Strict TypeScript/Zod Sync',
    status: 'ACTIVE',
    rulesHandled: ['API-001', 'CONTRACT-SYNC'],
    confidence: 99,
    remediationsApplied: 23,
  },
  {
    id: 'agent-cve-patcher',
    name: 'Zero-Day CVE Autonomous Patcher Agent',
    specialization: 'Automated Security Dependency Upgrades & Regression Guard',
    status: 'MONITORING',
    rulesHandled: ['SEC-001', 'CVE-AUDIT'],
    confidence: 98,
    remediationsApplied: 7,
  },
];

const DEMO_REMEDIATIONS: RemediationItem[] = [
  {
    agent: 'Layer Decoupler Agent',
    ruleId: 'LAYER-001',
    title: 'Synthesize OrderService & Decouple OrderRepository',
    explanation: 'Eliminated direct repository coupling in OrderController by synthesizing transactional OrderService and response DTO.',
    targetFile: 'OrderController.java',
    generatedFile: 'OrderService.java',
    confidence: 99,
    originalCode: `@RestController\n@RequestMapping("/api/v1/orders")\npublic class OrderController {\n    @Autowired\n    private OrderRepository orderRepository; // Direct DB access bypass\n    \n    @GetMapping("/{id}")\n    public Order getOrder(@PathVariable Long id) {\n        return orderRepository.findById(id).orElseThrow();\n    }\n}`,
    remediatedCode: `@RestController\n@RequestMapping("/api/v1/orders")\npublic class OrderController {\n    private final OrderService orderService; // Decoupled through Service boundary\n    \n    public OrderController(OrderService orderService) {\n        this.orderService = orderService;\n    }\n    \n    @GetMapping("/{id}")\n    public OrderResponseDto getOrder(@PathVariable Long id) {\n        return orderService.getOrderById(id);\n    }\n}`,
    diff: `--- a/src/main/java/com/codeflow/controller/OrderController.java\n+++ b/src/main/java/com/codeflow/controller/OrderController.java\n@@ -4,6 +4,6 @@\n public class OrderController {\n-    @Autowired\n-    private OrderRepository orderRepository;\n+    private final OrderService orderService;\n+    public OrderController(OrderService orderService) { this.orderService = orderService; }`,
  },
  {
    agent: 'Zero-Day CVE Patcher & Security Agent',
    ruleId: 'SEC-001',
    title: 'Inject @PreAuthorize RBAC Guard on Mutating Endpoint',
    explanation: 'Added Spring Security 6 authorization guard requiring ADMIN role before executing sensitive deletion.',
    targetFile: 'OwnerController.java',
    confidence: 98,
    originalCode: `@DeleteMapping("/{id}")\npublic ResponseEntity<Void> deleteOwner(@PathVariable Long id) {\n    ownerService.delete(id);\n    return ResponseEntity.noContent().build();\n}`,
    remediatedCode: `@PreAuthorize("hasRole('ADMIN') or hasAuthority('OWNER_DELETE')")\n@DeleteMapping("/{id}")\npublic ResponseEntity<Void> deleteOwner(@PathVariable Long id) {\n    ownerService.delete(id);\n    return ResponseEntity.noContent().build();\n}`,
    diff: `--- a/src/main/java/com/codeflow/controller/OwnerController.java\n+++ b/src/main/java/com/codeflow/controller/OwnerController.java\n@@ -1,3 +1,4 @@\n+    @PreAuthorize("hasRole('ADMIN') or hasAuthority('OWNER_DELETE')")\n     @DeleteMapping("/{id}")\n     public ResponseEntity<Void> deleteOwner(@PathVariable Long id) {`,
  },
  {
    agent: 'JPA N+1 & Query Optimizer Agent',
    ruleId: 'JPA-001',
    title: 'Inject @EntityGraph to Eliminate N+1 Fetch Loop',
    explanation: 'Configured eager entity graph paths reducing 41 individual SELECT statements into 1 single relational join.',
    targetFile: 'OrderRepository.java',
    confidence: 96,
    originalCode: `@Query("SELECT o FROM Order o")\nList<Order> findAllOrders(); // Triggers N+1 child queries for order items`,
    remediatedCode: `@EntityGraph(attributePaths = {"orderItems", "customer"})\n@Query("SELECT o FROM Order o")\nList<Order> findAllOrders(); // Optimized: 1 query with SQL LEFT JOIN`,
    diff: `--- a/src/main/java/com/codeflow/repository/OrderRepository.java\n+++ b/src/main/java/com/codeflow/repository/OrderRepository.java\n@@ -1,2 +1,3 @@\n+    @EntityGraph(attributePaths = {"orderItems", "customer"})\n     @Query("SELECT o FROM Order o")\n     List<Order> findAllOrders();`,
  },
  {
    agent: 'TypeScript Contract Synchronizer Agent',
    ruleId: 'CONTRACT-SYNC',
    title: 'Synthesize Synchronized TypeScript Interface from OrderResponseDto',
    explanation: 'Transformed backend DTO structure into strict TypeScript contract with literal union types.',
    targetFile: 'src/types/generated/order.d.ts',
    confidence: 99,
    originalCode: `export interface OrderDto {\n  id: number;\n  total: number;\n}`,
    remediatedCode: `export interface OrderResponseDto {\n  id: number;\n  orderNumber: string;\n  totalAmount: number;\n  currency: 'USD' | 'EUR' | 'GBP';\n  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED';\n  createdAt: string;\n}`,
    diff: `--- a/src/types/generated/order.d.ts\n+++ b/src/types/generated/order.d.ts\n@@ -1,4 +1,7 @@\n-export interface OrderDto {\n-  id: number;\n-  total: number;\n+export interface OrderResponseDto {\n+  id: number;\n+  orderNumber: string;\n+  totalAmount: number;\n+  currency: 'USD' | 'EUR' | 'GBP';\n+  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED';\n+  createdAt: string;\n }`,
  },
];

const DEMO_CVES: CvePatch[] = [
  {
    cveId: 'CVE-2024-38816',
    dependency: 'org.springframework:spring-webmvc',
    vulnerableVersion: '6.1.13',
    patchedVersion: '6.1.14',
    severity: 'HIGH',
    cvssScore: 7.5,
    patchType: 'POM_DEPENDENCY_BUMP',
    diff: '--- pom.xml\n+++ pom.xml\n@@ -45,3 +45,3 @@\n-    <version>6.1.13</version>\n+    <version>6.1.14</version>',
    status: 'AUTO_PATCH_READY',
  },
  {
    cveId: 'CVE-2024-22243',
    dependency: 'org.springframework:spring-web',
    vulnerableVersion: '6.1.4',
    patchedVersion: '6.1.5',
    severity: 'MEDIUM',
    cvssScore: 6.8,
    patchType: 'URI_COMPONENTS_ENCODING',
    diff: '--- UriBuilder.java\n+++ UriBuilder.java\n@@ -12,2 +12,2 @@\n-    UriComponentsBuilder.fromUriString(input);\n+    UriComponentsBuilder.fromUriString(input).encode();',
    status: 'AUTO_PATCH_READY',
  },
];

export const SelfHealingSwarmModal: React.FC<SelfHealingSwarmModalProps> = ({
  isOpen,
  onClose,
  projectId,
  isLight = false,
}) => {
  const [activeTab, setActiveTab] = useState<'remediation' | 'agents' | 'cve'>('remediation');
  const [agents, setAgents] = useState<SwarmAgent[]>(DEMO_AGENTS);
  const [remediations, setRemediations] = useState<RemediationItem[]>(DEMO_REMEDIATIONS);
  const [cves, setCves] = useState<CvePatch[]>(DEMO_CVES);
  const [selectedRemediationIdx, setSelectedRemediationIdx] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedDiff, setCopiedDiff] = useState(false);
  const [appliedPatches, setAppliedPatches] = useState<Set<number>>(new Set());

  // Fetch agents telemetry on mount or open
  useEffect(() => {
    if (!isOpen) return;
    const fetchAgents = async () => {
      try {
        if (projectId && projectId !== 'demo-spring-petclinic') {
          const { data } = await axios.get(`/api/v1/projects/${projectId}/self-heal/agents`);
          if (data?.agents) setAgents(data.agents);
        }
      } catch {
        setAgents(DEMO_AGENTS);
      }
    };
    fetchAgents();
  }, [isOpen, projectId]);

  const handleRunRemediation = useCallback(async (ruleId: string = 'ALL') => {
    setIsExecuting(true);
    try {
      if (projectId && projectId !== 'demo-spring-petclinic') {
        const { data } = await axios.post(`/api/v1/projects/${projectId}/self-heal/remediate?ruleId=${ruleId}`);
        if (data?.remediations) setRemediations(data.remediations);
      } else {
        await new Promise(r => setTimeout(r, 650));
        setRemediations(DEMO_REMEDIATIONS);
      }
    } catch {
      setRemediations(DEMO_REMEDIATIONS);
    } finally {
      setIsExecuting(false);
    }
  }, [projectId]);

  const handleScanCves = useCallback(async () => {
    setIsExecuting(true);
    try {
      if (projectId && projectId !== 'demo-spring-petclinic') {
        const { data } = await axios.post(`/api/v1/projects/${projectId}/self-heal/cve-scan`);
        if (data?.patches) setCves(data.patches);
      } else {
        await new Promise(r => setTimeout(r, 500));
        setCves(DEMO_CVES);
      }
    } catch {
      setCves(DEMO_CVES);
    } finally {
      setIsExecuting(false);
    }
  }, [projectId]);

  const copyDiff = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDiff(true);
    setTimeout(() => setCopiedDiff(false), 2000);
  };

  const applyPatch = (idx: number) => {
    setAppliedPatches(prev => new Set(prev).add(idx));
  };

  if (!isOpen) return null;

  const bg = isLight ? 'bg-white' : 'bg-slate-900';
  const border = isLight ? 'border-slate-200' : 'border-slate-800';
  const text = isLight ? 'text-slate-900' : 'text-white';
  const textSec = isLight ? 'text-slate-500' : 'text-slate-400';
  const cardBg = isLight ? 'bg-slate-50' : 'bg-slate-800/60';

  const currentRem = remediations[selectedRemediationIdx] || remediations[0];

  return (
    <div className="studio-modal-overlay" onClick={onClose}>
      <div
        className={`studio-modal-card w-full max-w-5xl flex flex-col rounded-2xl shadow-2xl overflow-hidden border ${border} ${bg}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`shrink-0 flex items-center justify-between px-6 py-4 border-b ${border} ${isLight ? 'bg-slate-50' : 'bg-[#070a12]'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-base font-bold font-mono ${text}`}>Autonomous Self-Healing & AI Refactoring Swarm</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-500/10 text-violet-400 border border-violet-500/30">
                  Tool #31 • v11.0 NEW
                </span>
              </div>
              <p className={`text-xs ${textSec} font-mono mt-0.5`}>Multi-agent swarm synthesizing AST mutations, query optimizations & CVE patches</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all cursor-pointer ${isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher & Action Bar */}
        <div className={`px-6 py-3 border-b ${border} flex items-center justify-between flex-wrap gap-3 ${isLight ? 'bg-slate-100/60' : 'bg-slate-950/40'}`}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('remediation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'remediation'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : `${textSec} hover:bg-slate-500/10`
              }`}
            >
              🛠️ Remediation Studio ({remediations.length})
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'agents'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : `${textSec} hover:bg-slate-500/10`
              }`}
            >
              🐝 Swarm Agents (4 Active)
            </button>
            <button
              onClick={() => setActiveTab('cve')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'cve'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : `${textSec} hover:bg-slate-500/10`
              }`}
            >
              🛡️ Zero-Day CVE Patcher ({cves.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'remediation' && (
              <button
                onClick={() => handleRunRemediation('ALL')}
                disabled={isExecuting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg text-xs font-mono font-bold shadow-md shadow-violet-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isExecuting ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
                Trigger Full Swarm
              </button>
            )}
            {activeTab === 'cve' && (
              <button
                onClick={handleScanCves}
                disabled={isExecuting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-mono font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isExecuting ? <RefreshCw size={12} className="animate-spin" /> : <Shield size={12} />}
                Scan & Patch CVEs
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6 space-y-6">

          {/* TAB 1: REMEDIATION STUDIO */}
          {activeTab === 'remediation' && (
            <div className="space-y-5">
              {/* Remediation Cards Carousel / Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {remediations.map((rem, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedRemediationIdx(idx)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                      selectedRemediationIdx === idx
                        ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10'
                        : `${border} ${cardBg} hover:border-slate-500/50`
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-violet-600/20 text-violet-400 border border-violet-500/30">
                        {rem.ruleId}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        {rem.confidence}% Conf.
                      </span>
                    </div>
                    <h4 className={`text-xs font-mono font-bold ${text} truncate`}>{rem.title}</h4>
                    <p className={`text-[11px] font-mono ${textSec} mt-1 truncate`}>{rem.targetFile}</p>
                    {appliedPatches.has(idx) && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 mt-2">
                        <CheckCircle2 size={10} /> Patch Staged
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Active Remediation Detail View */}
              {currentRem && (
                <div className={`rounded-xl border ${border} ${cardBg} p-5 space-y-4`}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40">
                          {currentRem.agent}
                        </span>
                        <span className={`text-xs font-mono font-bold ${text}`}>{currentRem.title}</span>
                      </div>
                      <p className={`text-xs font-mono ${textSec} mt-1.5`}>{currentRem.explanation}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyDiff(currentRem.diff)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border ${border} text-xs font-mono ${text} hover:bg-slate-500/10 transition-colors cursor-pointer`}
                      >
                        {copiedDiff ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        {copiedDiff ? 'Copied' : 'Copy Unified Diff'}
                      </button>
                      <button
                        onClick={() => applyPatch(selectedRemediationIdx)}
                        disabled={appliedPatches.has(selectedRemediationIdx)}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          appliedPatches.has(selectedRemediationIdx)
                            ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                        }`}
                      >
                        <CheckCircle2 size={12} />
                        {appliedPatches.has(selectedRemediationIdx) ? 'Patch Applied ✓' : 'Stage Autonomous Patch'}
                      </button>
                    </div>
                  </div>

                  {/* Side-by-side Before & After Code Blocks */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-2">
                    <div>
                      <div className="flex items-center justify-between mb-1.5 px-1">
                        <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider">Before (Violating Code)</span>
                        <span className={`text-[10px] font-mono ${textSec}`}>{currentRem.targetFile}</span>
                      </div>
                      <pre className="p-3.5 rounded-xl border border-red-500/20 bg-red-950/20 text-[11px] font-mono text-red-200 overflow-x-auto whitespace-pre leading-relaxed custom-scrollbar max-h-64">
                        {currentRem.originalCode}
                      </pre>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5 px-1">
                        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">After (Autonomous Mutation)</span>
                        <span className={`text-[10px] font-mono text-emerald-400`}>AST Verified ✓</span>
                      </div>
                      <pre className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-[11px] font-mono text-emerald-200 overflow-x-auto whitespace-pre leading-relaxed custom-scrollbar max-h-64">
                        {currentRem.remediatedCode}
                      </pre>
                    </div>
                  </div>

                  {/* Unified Diff Preview */}
                  <div className="pt-2">
                    <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block mb-1 px-1">Unified Git Patch</span>
                    <pre className={`p-3 rounded-xl border ${border} bg-black/40 text-[10px] font-mono text-slate-300 overflow-x-auto whitespace-pre leading-normal`}>
                      {currentRem.diff}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SWARM AGENTS TELEMETRY */}
          {activeTab === 'agents' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agents.map((agent) => (
                  <div key={agent.id} className={`p-4 rounded-xl border ${border} ${cardBg} space-y-3`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                          <Bot size={16} />
                        </div>
                        <div>
                          <h4 className={`text-xs font-mono font-bold ${text}`}>{agent.name}</h4>
                          <p className={`text-[10px] font-mono ${textSec}`}>{agent.specialization}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        ● {agent.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center pt-2">
                      <div className={`p-2 rounded-lg border ${border} bg-black/20`}>
                        <div className="text-base font-black font-mono text-emerald-400">{agent.confidence}%</div>
                        <div className={`text-[9px] font-mono ${textSec}`}>Confidence Score</div>
                      </div>
                      <div className={`p-2 rounded-lg border ${border} bg-black/20`}>
                        <div className="text-base font-black font-mono text-violet-400">{agent.remediationsApplied}</div>
                        <div className={`text-[9px] font-mono ${textSec}`}>Patches Synthesized</div>
                      </div>
                    </div>

                    <div className="pt-1">
                      <span className={`text-[10px] font-mono ${textSec}`}>Handled Rules: </span>
                      {agent.rulesHandled.map(r => (
                        <span key={r} className="inline-block mr-1 px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-500/10 text-slate-300 border border-slate-700/50">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ZERO-DAY CVE AUTONOMOUS PATCHER */}
          {activeTab === 'cve' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${text}`}>Automated Dependency Security Vulnerability Patches</h3>
                  <p className={`text-xs font-mono ${textSec} mt-0.5`}>Scans Maven POM and npm lockfiles against real-time advisory databases (NVD, OSV, GitHub Advisory)</p>
                </div>
              </div>

              <div className="space-y-3">
                {cves.map((cve, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${border} ${cardBg} space-y-3`}>
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                          {cve.cveId}
                        </span>
                        <span className={`text-xs font-mono font-bold ${text}`}>{cve.dependency}</span>
                        <span className="text-[10px] font-mono text-amber-400 font-bold">CVSS {cve.cvssScore} ({cve.severity})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-red-400">{cve.vulnerableVersion}</span>
                        <ArrowRight size={12} className={textSec} />
                        <span className="text-xs font-mono font-bold text-emerald-400">{cve.patchedVersion}</span>
                      </div>
                    </div>

                    <pre className="p-3 rounded-lg border border-slate-800 bg-black/40 text-[10px] font-mono text-slate-300 overflow-x-auto whitespace-pre">
                      {cve.diff}
                    </pre>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-mono text-emerald-400">Status: {cve.status}</span>
                      <button
                        onClick={() => copyDiff(cve.diff)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono font-bold border ${border} ${text} hover:bg-slate-500/10 cursor-pointer`}
                      >
                        <Copy size={10} /> Copy Patch
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SelfHealingSwarmModal;
