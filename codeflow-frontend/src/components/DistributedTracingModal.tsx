import React, { useState } from 'react';
import {
  X, Activity, Clock, Server, ArrowRight, CheckCircle2,
  Layers, AlertTriangle, Filter, RefreshCw
} from 'lucide-react';
import { ThemeMode } from './Header';

interface DistributedTracingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
}

interface Span {
  id: string;
  service: string;
  operation: string;
  startOffsetMs: number;
  durationMs: number;
  statusCode: number;
  isBottleneck?: boolean;
}

const SPANS: Span[] = [
  { id: 's1', service: 'frontend-web', operation: 'POST /api/v1/orders/checkout', startOffsetMs: 0, durationMs: 48.2, statusCode: 201 },
  { id: 's2', service: 'api-gateway', operation: 'JwtAuthFilter.doFilter()', startOffsetMs: 1.2, durationMs: 4.5, statusCode: 200 },
  { id: 's3', service: 'order-service', operation: 'OrderController.createOrder()', startOffsetMs: 6.0, durationMs: 41.5, statusCode: 201 },
  { id: 's4', service: 'order-service', operation: 'OrderService.process()', startOffsetMs: 7.2, durationMs: 38.0, statusCode: 200 },
  { id: 's5', service: 'payment-service', operation: 'StripeGatewayClient.charge()', startOffsetMs: 12.0, durationMs: 24.5, statusCode: 200, isBottleneck: true },
  { id: 's6', service: 'postgres-db', operation: 'INSERT INTO orders ...', startOffsetMs: 37.5, durationMs: 3.2, statusCode: 200 },
  { id: 's7', service: 'kafka-broker', operation: 'KafkaProducer.send(orders.created)', startOffsetMs: 41.0, durationMs: 2.1, statusCode: 200 },
];

export const DistributedTracingModal: React.FC<DistributedTracingModalProps> = ({
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
}) => {
  const [selectedSpan, setSelectedSpan] = useState<Span>(SPANS[4]);

  if (!isOpen) return null;

  const isLight = currentTheme === 'NORMAL';
  const totalDuration = 48.2;

  return (
    <div className="studio-modal-overlay">
      <div
        className="studio-modal-card w-full max-w-5xl  flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: isLight ? '#ffffff' : '#0f172a' }}
      >
        {/* Header */}
        <div
          className="studio-modal-header flex items-center justify-between px-6 py-4"
          style={{ backgroundColor: isLight ? '#f1f5f9' : '#1e293b' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">OpenTelemetry (OTel) Distributed Tracing</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  W3C TraceContext
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-service span waterfall with automated critical-path bottleneck isolation and Jaeger trace context
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div
          className="studio-modal-content flex-1 overflow-y-auto p-6 space-y-6"
          style={{ backgroundColor: isLight ? '#ffffff' : '#070a12' }}
        >
          {/* Top Trace Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div
              className="p-3 rounded-xl border"
              style={{ backgroundColor: isLight ? '#f8fafc' : '#141e33', borderColor: isLight ? '#e2e8f0' : '#1e293b' }}
            >
              <span className="text-[11px] text-slate-400 block">Trace ID</span>
              <span className="text-xs font-mono font-bold text-cyan-400">4bf92f3577b34da6a3ce929d0e0e4736</span>
            </div>
            <div
              className="p-3 rounded-xl border"
              style={{ backgroundColor: isLight ? '#f8fafc' : '#141e33', borderColor: isLight ? '#e2e8f0' : '#1e293b' }}
            >
              <span className="text-[11px] text-slate-400 block">Total Latency</span>
              <span className="text-xs font-mono font-bold text-emerald-400">48.2 ms (7 Spans)</span>
            </div>
            <div
              className="p-3 rounded-xl border border-rose-500/40"
              style={{ backgroundColor: isLight ? '#fff1f2' : '#1f131a' }}
            >
              <span className="text-[11px] text-rose-400 font-bold block">Critical Path Bottleneck</span>
              <span className="text-xs font-mono font-bold text-rose-300">StripeGatewayClient.charge() (24.5ms • 51%)</span>
            </div>
          </div>

          {/* Span Waterfall */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase text-slate-400 block">
              Distributed Span Execution Waterfall
            </span>

            <div className="space-y-2">
              {SPANS.map(span => {
                const leftPercent = (span.startOffsetMs / totalDuration) * 100;
                const widthPercent = Math.max((span.durationMs / totalDuration) * 100, 4);

                return (
                  <div
                    key={span.id}
                    onClick={() => setSelectedSpan(span)}
                    className="p-3 rounded-xl border transition cursor-pointer"
                    style={{
                      backgroundColor: selectedSpan.id === span.id ? (isLight ? '#e0f2fe' : '#1e293b') : (isLight ? '#f8fafc' : '#0f172a'),
                      borderColor: selectedSpan.id === span.id ? '#38bdf8' : (isLight ? '#e2e8f0' : '#1e293b')
                    }}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-cyan-400">{span.service}</span>
                        <span className="text-slate-400 font-mono text-[11px]">{span.operation}</span>
                        {span.isBottleneck && (
                          <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-rose-500/20 text-rose-400 border border-rose-500/40">
                            BOTTLENECK
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">{span.durationMs}ms</span>
                    </div>

                    {/* Waterfall Bar Track */}
                    <div
                      className="w-full h-3 rounded-full relative overflow-hidden"
                      style={{ backgroundColor: isLight ? '#e2e8f0' : '#090d16' }}
                    >
                      <div
                        className={`absolute top-0 bottom-0 rounded-full transition-all ${
                          span.isBottleneck
                            ? 'bg-gradient-to-r from-rose-500 to-amber-500 shadow-md shadow-rose-500/30'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                        }`}
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
