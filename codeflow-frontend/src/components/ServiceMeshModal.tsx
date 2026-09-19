import React, { useState } from 'react';
import {
  X, Layers, Copy, Check, Download, Server, Cpu, Activity,
  ArrowRight, ShieldCheck
} from 'lucide-react';
import { ThemeMode } from './Header';

interface ServiceMeshModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
}

export const ServiceMeshModal: React.FC<ServiceMeshModalProps> = ({
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
}) => {
  const [activeTab, setActiveTab] = useState<'ISTIO_YAML' | 'TOPOLOGY'>('TOPOLOGY');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;
  const isLight = currentTheme === 'NORMAL';

  const istioYamlCode = `apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: order-service-vs
  namespace: codeflow-prod
spec:
  hosts:
  - "orders.api.codeflow.io"
  http:
  - match:
    - uri:
        prefix: /api/v1/orders
    route:
    - destination:
        host: order-service
        subset: v1
      weight: 90
    - destination:
        host: order-service
        subset: v2-canary
      weight: 10
    retries:
      attempts: 3
      perTryTimeout: 2s
      retryOn: "5xx,connect-failure,refused-stream"
---
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: order-service-dr
  namespace: codeflow-prod
spec:
  host: order-service
  trafficPolicy:
    loadBalancer:
      simple: LEAST_CONN
    connectionPool:
      tcp:
        maxConnections: 1024
      http:
        http1MaxPendingRequests: 100
        maxRequestsPerConnection: 10
    outlierDetection:
      consecutive5xxErrors: 3
      interval: 10s
      baseEjectionTime: 30s`;

  const copyCode = () => {
    navigator.clipboard.writeText(istioYamlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="studio-modal-overlay">
      <div
        className="studio-modal-card w-full max-w-5xl flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: isLight ? '#ffffff' : '#0f172a' }}
      >
        {/* Header */}
        <div
          className="studio-modal-header flex items-center justify-between px-6 py-4"
          style={{ backgroundColor: isLight ? '#f1f5f9' : '#1e293b' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Multi-Repo Service Mesh & Envoy Federation</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
                  Istio & Envoy
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cross-repository service dependency topology, canary routing weights & Istio destination rules
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/40 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Istio YAML'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div
          className="studio-modal-content flex-1 flex flex-col p-5 space-y-4"
          style={{ backgroundColor: isLight ? '#ffffff' : '#070a12', minHeight: 0 }}
        >
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              {[
                { id: 'TOPOLOGY', name: 'Federated Mesh Topology (4 Services)' },
                { id: 'ISTIO_YAML', name: 'Istio VirtualService & DestinationRule YAML' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer"
                  style={{
                    backgroundColor: activeTab === t.id ? '#7c3aed' : (isLight ? '#f1f5f9' : '#1e293b'),
                    color: activeTab === t.id ? '#ffffff' : (isLight ? '#334155' : '#94a3b8')
                  }}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'TOPOLOGY' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1 overflow-y-auto">
              {[
                { name: 'api-gateway', p95: '4.5ms', rps: '480 RPS', weight: '100%', status: 'Healthy' },
                { name: 'order-service', p95: '28.4ms', rps: '320 RPS', weight: '90% v1 / 10% canary', status: 'Canary Active' },
                { name: 'payment-service', p95: '24.5ms', rps: '150 RPS', weight: '100%', status: 'Healthy' },
                { name: 'notification-service', p95: '8.2ms', rps: '85 RPS', weight: '100%', status: 'Healthy' },
              ].map(svc => (
                <div
                  key={svc.name}
                  className="p-4 rounded-xl border flex flex-col justify-between space-y-3"
                  style={{
                    backgroundColor: isLight ? '#f8fafc' : '#141e33',
                    borderColor: isLight ? '#e2e8f0' : '#1e293b'
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-violet-300 font-mono">{svc.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">{svc.status}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-1">Traffic: {svc.weight}</div>
                  </div>
                  <div className="border-t border-slate-700/50 pt-2 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-cyan-400">P95: {svc.p95}</span>
                    <span className="text-slate-400">{svc.rps}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="border border-slate-700/50 rounded-xl overflow-hidden flex-1 flex flex-col shadow-inner"
              style={{ backgroundColor: '#050811', minHeight: 0 }}
            >
              <pre className="p-4 text-xs font-mono text-violet-300/90 leading-relaxed overflow-auto flex-1">
                {istioYamlCode}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
