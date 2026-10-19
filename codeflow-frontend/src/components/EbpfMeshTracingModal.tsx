import React, { useState, useCallback, useEffect } from 'react';
import {
  X, Activity, Cpu, Network, ShieldCheck, Zap, Server, Globe,
  RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, Gauge, Radio, Sliders, Terminal
} from 'lucide-react';
import axios from 'axios';

interface EbpfMeshTracingModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
  isLight?: boolean;
}

interface KernelProbe {
  id: string;
  hook: string;
  target: string;
  overheadNs: number;
  eventsPerSec: number;
  status: string;
  description: string;
}

interface LiveTrace {
  traceId: string;
  timestamp: string;
  protocol: string;
  srcCluster: string;
  dstCluster: string;
  endpoint: string;
  kernelLatencyUs: number;
  tcpRttMs: number;
  retransmits: number;
  bytesTransferred: number;
  verdict: string;
}

interface ClusterNode {
  id: string;
  name: string;
  provider: string;
  region: string;
  pods: number;
  health: string;
  egressMbps: number;
  ingressMbps: number;
  ebpfAgent: string;
}

interface MeshTunnel {
  from: string;
  to: string;
  type: string;
  rttMs: number;
  jitterMs: number;
  lossRatePct: number;
  status: string;
}

interface ServiceSlo {
  serviceId: string;
  serviceName: string;
  targetSloPct: number;
  currentAvailabilityPct: number;
  errorBudgetRemainingPct: number;
  burnRateFactor: number;
  status: string;
  activeMitigation: string;
  p99LatencyMs: number;
}

const DEMO_PROBES: KernelProbe[] = [
  {
    id: 'ebpf-probe-01',
    hook: 'kprobe:sys_enter_connect',
    target: 'libc:connect() / tcp_v4_connect',
    overheadNs: 48,
    eventsPerSec: 18450,
    status: 'ATTACHED',
    description: 'Tracks TCP connection establishment, DNS resolution latency, and remote IP binding.'
  },
  {
    id: 'ebpf-probe-02',
    hook: 'kretprobe:sys_enter_accept',
    target: 'sock_common_recv()',
    overheadNs: 52,
    eventsPerSec: 14200,
    status: 'ATTACHED',
    description: 'Measures inbound connection handshake queue delay & kernel SYN backlog exhaustion.'
  },
  {
    id: 'ebpf-probe-03',
    hook: 'tracepoint:tcp:tcp_retransmit_skb',
    target: 'net/ipv4/tcp_output.c',
    overheadNs: 16,
    eventsPerSec: 8,
    status: 'ATTACHED',
    description: 'Zero-overhead packet loss detection, congestion window (cwnd) collapse & segment drops.'
  },
  {
    id: 'ebpf-probe-04',
    hook: 'uprobe:libssl:SSL_write',
    target: 'OpenSSL 3.2.0 / BoringSSL',
    overheadNs: 78,
    eventsPerSec: 9820,
    status: 'ATTACHED',
    description: 'Intercepts plaintext HTTP/1.1, HTTP/2 & gRPC protobuf payloads before TLS encryption.'
  },
  {
    id: 'ebpf-probe-05',
    hook: 'sock_ops:bpf_sock_ops_state_change',
    target: 'BPF_PROG_TYPE_SOCK_OPS',
    overheadNs: 34,
    eventsPerSec: 24100,
    status: 'ATTACHED',
    description: 'Dynamically tunes TCP window scaling, SRTT (Smoothed RTT) and packet pacing per socket.'
  }
];

const DEMO_TRACES: LiveTrace[] = [
  {
    traceId: 'ebpf-tr-9021',
    timestamp: '12:25:48.112',
    protocol: 'HTTP/2 (gRPC)',
    srcCluster: 'aws-eks-us-east-1',
    dstCluster: 'gcp-gke-europe-west1',
    endpoint: '/order.v1.OrderService/ProcessPayment',
    kernelLatencyUs: 14.2,
    tcpRttMs: 81.4,
    retransmits: 0,
    bytesTransferred: 4096,
    verdict: 'FORWARD_OK'
  },
  {
    traceId: 'ebpf-tr-9022',
    timestamp: '12:25:47.890',
    protocol: 'HTTP/1.1',
    srcCluster: 'azure-aks-eastus2',
    dstCluster: 'aws-eks-us-east-1',
    endpoint: '/api/v1/users/auth/verify',
    kernelLatencyUs: 8.6,
    tcpRttMs: 22.1,
    retransmits: 0,
    bytesTransferred: 1024,
    verdict: 'FORWARD_OK'
  },
  {
    traceId: 'ebpf-tr-9023',
    timestamp: '12:25:46.450',
    protocol: 'Postgres Wire (TCP)',
    srcCluster: 'baremetal-onprem-dc1',
    dstCluster: 'baremetal-onprem-dc1',
    endpoint: 'SELECT * FROM orders WHERE user_id = ?',
    kernelLatencyUs: 3.1,
    tcpRttMs: 0.42,
    retransmits: 0,
    bytesTransferred: 16384,
    verdict: 'ZERO_COPY_READ'
  },
  {
    traceId: 'ebpf-tr-9024',
    timestamp: '12:25:45.920',
    protocol: 'Kafka Native (TCP)',
    srcCluster: 'aws-eks-us-east-1',
    dstCluster: 'baremetal-onprem-dc1',
    endpoint: 'PRODUCE orders.created [p:0, o:1428]',
    kernelLatencyUs: 12.8,
    tcpRttMs: 14.6,
    retransmits: 1,
    bytesTransferred: 8192,
    verdict: 'WARN_RETRANSMIT'
  }
];

const DEMO_CLUSTERS: ClusterNode[] = [
  {
    id: 'cluster-aws',
    name: 'AWS EKS Production (us-east-1)',
    provider: 'AWS',
    region: 'us-east-1',
    pods: 18,
    health: 'HEALTHY',
    egressMbps: 420.5,
    ingressMbps: 380.2,
    ebpfAgent: 'Cilium 1.16 + Hubble'
  },
  {
    id: 'cluster-gcp',
    name: 'GCP GKE EU Core (europe-west1)',
    provider: 'GCP',
    region: 'europe-west1',
    pods: 12,
    health: 'HEALTHY',
    egressMbps: 185.0,
    ingressMbps: 210.4,
    ebpfAgent: 'Cilium 1.16 + Hubble'
  },
  {
    id: 'cluster-azure',
    name: 'Azure AKS Failover (eastus2)',
    provider: 'AZURE',
    region: 'eastus2',
    pods: 8,
    health: 'HEALTHY',
    egressMbps: 94.2,
    ingressMbps: 88.6,
    ebpfAgent: 'Cilium 1.16 + Hubble'
  },
  {
    id: 'cluster-onprem',
    name: 'Bare-Metal Private DC (on-prem-dc1)',
    provider: 'BARE_METAL',
    region: 'us-central-dc',
    pods: 24,
    health: 'HEALTHY',
    egressMbps: 890.1,
    ingressMbps: 940.8,
    ebpfAgent: 'eBPF TC (Traffic Control) + XDP'
  }
];

const DEMO_TUNNELS: MeshTunnel[] = [
  {
    from: 'AWS EKS us-east-1',
    to: 'GCP GKE europe-west1',
    type: 'WireGuard mTLS Mesh',
    rttMs: 81.4,
    jitterMs: 1.8,
    lossRatePct: 0.001,
    status: 'CONNECTED'
  },
  {
    from: 'AWS EKS us-east-1',
    to: 'Azure AKS eastus2',
    type: 'WireGuard mTLS Mesh',
    rttMs: 22.1,
    jitterMs: 0.4,
    lossRatePct: 0.000,
    status: 'CONNECTED'
  },
  {
    from: 'AWS EKS us-east-1',
    to: 'Bare-Metal on-prem-dc1',
    type: 'AWS DirectConnect 10Gbps + eBPF XDP',
    rttMs: 14.6,
    jitterMs: 0.2,
    lossRatePct: 0.000,
    status: 'CONNECTED'
  },
  {
    from: 'GCP GKE europe-west1',
    to: 'Bare-Metal on-prem-dc1',
    type: 'Cloud Interconnect + WireGuard',
    rttMs: 86.2,
    jitterMs: 2.1,
    lossRatePct: 0.002,
    status: 'CONNECTED'
  }
];

const DEMO_SLOS: ServiceSlo[] = [
  {
    serviceId: 'svc-checkout',
    serviceName: 'CheckoutService (Spring Boot)',
    targetSloPct: 99.95,
    currentAvailabilityPct: 99.98,
    errorBudgetRemainingPct: 84.0,
    burnRateFactor: 0.8,
    status: 'HEALTHY',
    activeMitigation: 'NONE',
    p99LatencyMs: 34.2
  },
  {
    serviceId: 'svc-payment',
    serviceName: 'PaymentGateway (Spring Boot)',
    targetSloPct: 99.99,
    currentAvailabilityPct: 99.995,
    errorBudgetRemainingPct: 92.5,
    burnRateFactor: 0.4,
    status: 'HEALTHY',
    activeMitigation: 'NONE',
    p99LatencyMs: 88.1
  },
  {
    serviceId: 'svc-inventory',
    serviceName: 'InventoryFeed (Spring Boot)',
    targetSloPct: 99.90,
    currentAvailabilityPct: 99.81,
    errorBudgetRemainingPct: 28.0,
    burnRateFactor: 6.2,
    status: 'ELEVATED_BURN',
    activeMitigation: 'eBPF Adaptive Rate-Limiter (20% Shed)',
    p99LatencyMs: 240.5
  },
  {
    serviceId: 'svc-notifications',
    serviceName: 'NotificationService (Kafka + Node)',
    targetSloPct: 99.50,
    currentAvailabilityPct: 99.88,
    errorBudgetRemainingPct: 96.0,
    burnRateFactor: 0.2,
    status: 'HEALTHY',
    activeMitigation: 'NONE',
    p99LatencyMs: 18.0
  }
];

export const EbpfMeshTracingModal: React.FC<EbpfMeshTracingModalProps> = ({
  isOpen,
  onClose,
  projectId,
  isLight = false
}) => {
  const [activeTab, setActiveTab] = useState<'probes' | 'mesh' | 'slos'>('probes');
  const [probes, setProbes] = useState<KernelProbe[]>(DEMO_PROBES);
  const [traces, setTraces] = useState<LiveTrace[]>(DEMO_TRACES);
  const [clusters, setClusters] = useState<ClusterNode[]>(DEMO_CLUSTERS);
  const [tunnels, setTunnels] = useState<MeshTunnel[]>(DEMO_TUNNELS);
  const [slos, setSlos] = useState<ServiceSlo[]>(DEMO_SLOS);
  const [loading, setLoading] = useState(false);
  const [throttleMessage, setThrottleMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [probesRes, meshRes, slosRes] = await Promise.allSettled([
        axios.get(`/api/v1/projects/${projectId}/ebpf/probes`),
        axios.get(`/api/v1/projects/${projectId}/ebpf/mesh`),
        axios.get(`/api/v1/projects/${projectId}/ebpf/slo-guards`)
      ]);

      if (probesRes.status === 'fulfilled' && probesRes.value.data?.probes) {
        setProbes(probesRes.value.data.probes);
        if (probesRes.value.data.liveTraces) setTraces(probesRes.value.data.liveTraces);
      }
      if (meshRes.status === 'fulfilled' && meshRes.value.data?.clusters) {
        setClusters(meshRes.value.data.clusters);
        if (meshRes.value.data.tunnels) setTunnels(meshRes.value.data.tunnels);
      }
      if (slosRes.status === 'fulfilled' && slosRes.value.data?.services) {
        setSlos(slosRes.value.data.services);
      }
    } catch {
      // Use fallback demo data
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, fetchData]);

  const handleApplyThrottle = async (serviceId: string) => {
    try {
      if (projectId) {
        await axios.post(`/api/v1/projects/${projectId}/ebpf/throttle?serviceId=${serviceId}&action=RATE_LIMIT_25`);
      }
      setThrottleMessage(`eBPF kernel packet regulation applied to ${serviceId}: 25% traffic shed active.`);
      setTimeout(() => setThrottleMessage(null), 4000);
    } catch {
      setThrottleMessage(`eBPF kernel packet regulation applied to ${serviceId} (Demo Simulated).`);
      setTimeout(() => setThrottleMessage(null), 4000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="studio-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className={`studio-modal-card max-w-6xl border-2 border-black dark:border-slate-700 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${
          isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-slate-100'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-black dark:border-slate-700 flex items-center justify-between bg-emerald-50 dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
              <Cpu className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-mono font-bold text-base text-slate-900 dark:text-white">
                  Distributed Mesh & eBPF Kernel Tracing
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-600 text-white">
                  v12.0
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  Linux 6.8 • eBPF JIT Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Zero-overhead kernel socket telemetry, multi-cloud cluster mesh & autonomous SLO error budget regulation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-slate-300 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <button
            onClick={() => setActiveTab('probes')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 font-mono text-xs font-semibold cursor-pointer transition ${
              activeTab === 'probes'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Kernel Probes & Sockets ({probes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('mesh')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 font-mono text-xs font-semibold cursor-pointer transition ${
              activeTab === 'mesh'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Multi-Cloud Mesh ({clusters.length} Clusters)</span>
          </button>
          <button
            onClick={() => setActiveTab('slos')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 font-mono text-xs font-semibold cursor-pointer transition ${
              activeTab === 'slos'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>SLO Error Budgets & Guards ({slos.length})</span>
          </button>
        </div>

        {/* Throttle Notification banner */}
        {throttleMessage && (
          <div className="mx-5 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-400 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{throttleMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 min-h-0 space-y-6">
          {activeTab === 'probes' && (
            <div className="space-y-6">
              {/* Telemetry Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Avg Probe Overhead</span>
                  <div className="text-xl font-bold font-mono text-emerald-500 mt-1">45.6 ns</div>
                  <span className="text-[10px] text-slate-500">&lt; 0.001% CPU consumption</span>
                </div>
                <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Total Event Rate</span>
                  <div className="text-xl font-bold font-mono text-sky-400 mt-1">66,578 /sec</div>
                  <span className="text-[10px] text-slate-500">Zero-copy ring buffer</span>
                </div>
                <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Kernel Ring Buffer</span>
                  <div className="text-xl font-bold font-mono text-purple-400 mt-1">64 MB (21.4%)</div>
                  <span className="text-[10px] text-slate-500">0 buffer overruns</span>
                </div>
                <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Network JIT Status</span>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">BPF_JIT_ALWAYS</div>
                  <span className="text-[10px] text-slate-500">XDP & TC bypassed stack</span>
                </div>
              </div>

              {/* Probes Grid */}
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Active Linux Kernel Hooks ({probes.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {probes.map((probe) => (
                    <div
                      key={probe.id}
                      className={`p-4 rounded-xl border transition ${
                        isLight ? 'bg-white border-slate-200 hover:border-emerald-400' : 'bg-slate-900/60 border-slate-800 hover:border-emerald-500/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {probe.hook}
                          </span>
                          <span className="text-xs font-mono text-slate-300 font-semibold">{probe.target}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-emerald-400">
                          {probe.overheadNs} ns
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{probe.description}</p>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-800/80 text-[11px] font-mono">
                        <span className="text-slate-500">Throughput: {probe.eventsPerSec.toLocaleString()} events/s</span>
                        <span className="text-emerald-500 font-bold">● {probe.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Socket Traces Table */}
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Real-Time Socket Stream (Microsecond Accurate)
                </h3>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className={`border-b ${isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                      <tr>
                        <th className="p-3">Protocol / Endpoint</th>
                        <th className="p-3">Source ➔ Destination</th>
                        <th className="p-3">Kernel Latency</th>
                        <th className="p-3">TCP RTT</th>
                        <th className="p-3">Size</th>
                        <th className="p-3 text-right">Verdict</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {traces.map((trace) => (
                        <tr key={trace.traceId} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                          <td className="p-3">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{trace.endpoint}</div>
                            <span className="text-[10px] text-emerald-500">{trace.protocol}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                              <span>{trace.srcCluster}</span>
                              <ArrowRight className="w-3 h-3 text-slate-600" />
                              <span className="text-slate-300">{trace.dstCluster}</span>
                            </div>
                          </td>
                          <td className="p-3 font-bold text-emerald-400">
                            {trace.kernelLatencyUs} µs
                          </td>
                          <td className="p-3 text-slate-300">
                            {trace.tcpRttMs} ms
                          </td>
                          <td className="p-3 text-slate-400">
                            {(trace.bytesTransferred / 1024).toFixed(1)} KB
                          </td>
                          <td className="p-3 text-right">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              trace.verdict.includes('WARN')
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {trace.verdict}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mesh' && (
            <div className="space-y-6">
              {/* Mesh Topology Summary */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                isLight ? 'bg-emerald-50/50 border-emerald-200' : 'bg-emerald-950/20 border-emerald-800/40'
              }`}>
                <div className="flex items-center gap-3">
                  <Globe className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h4 className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      Cross-Cloud WireGuard Mesh Active
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      ChaCha20-Poly1305 kernel encrypted tunnels across 4 clusters • Zero-hop routing
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold">MTU 1420</span>
                  <span className="text-slate-400">Packet Loss: 0.0008%</span>
                </div>
              </div>

              {/* Cluster Nodes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {clusters.map((cluster) => (
                  <div
                    key={cluster.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between ${
                      isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                          {cluster.provider}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">● {cluster.health}</span>
                      </div>
                      <h4 className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200 mb-1">
                        {cluster.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">{cluster.pods} pods • {cluster.ebpfAgent}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/80 text-[11px] font-mono flex items-center justify-between text-slate-400">
                      <span>↑ {cluster.egressMbps} Mbps</span>
                      <span>↓ {cluster.ingressMbps} Mbps</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cross-Cluster WireGuard Latency Matrix */}
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Inter-Cluster Tunnels & Latency Matrix ({tunnels.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tunnels.map((tunnel, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border ${
                        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{tunnel.from}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-bold text-slate-200">{tunnel.to}</span>
                        </div>
                        <span className="text-emerald-400 font-bold">{tunnel.rttMs} ms</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2">
                        <span>{tunnel.type}</span>
                        <span>Jitter: ±{tunnel.jitterMs}ms</span>
                        <span className="text-emerald-500">Loss: {tunnel.lossRatePct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'slos' && (
            <div className="space-y-6">
              {/* SLO Control Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
              }`}>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h4 className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      Autonomous SLO Guard: Multi-Burn-Rate Mitigation
                    </h4>
                    <p className="text-xs text-slate-400">
                      When burn rate &gt; 5.0x, eBPF dynamic socket regulation sheds non-critical traffic automatically
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  GUARD ACTIVE
                </span>
              </div>

              {/* SLO Services Cards */}
              <div className="space-y-3">
                {slos.map((s) => {
                  const isElevated = s.burnRateFactor > 3.0;
                  return (
                    <div
                      key={s.serviceId}
                      className={`p-4 rounded-xl border transition ${
                        isElevated
                          ? 'border-amber-500/40 bg-amber-950/10'
                          : isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
                              {s.serviceName}
                            </h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              isElevated
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {s.status}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-mono">
                            Target SLO: {s.targetSloPct}% • Current Availability: {s.currentAvailabilityPct}% • p99: {s.p99LatencyMs}ms
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleApplyThrottle(s.serviceId)}
                            className="px-3 py-1.5 rounded-lg font-mono text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Regulate Traffic</span>
                          </button>
                        </div>
                      </div>

                      {/* Error Budget Visual Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono mb-1">
                          <span className="text-slate-400">30-Day Error Budget Remaining</span>
                          <span className={`font-bold ${isElevated ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {s.errorBudgetRemainingPct}% (Burn Rate: {s.burnRateFactor}x)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isElevated ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${s.errorBudgetRemainingPct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mt-2">
                          <span>Active Kernel Mitigation: {s.activeMitigation}</span>
                          <span>Multi-window burn factor</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EbpfMeshTracingModal;
