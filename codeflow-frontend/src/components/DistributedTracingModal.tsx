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
  const isGlass = currentTheme === 'GLASSMORPHISM';
  const isNeumorphic = currentTheme === 'NEUMORPHIC';

  const totalDuration = 48.2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : isGlass
            ? 'bg-slate-900/90 backdrop-blur-xl border-cyan-500/30 text-white'
            : isNeumorphic
            ? 'bg-[#1e2330] border-slate-700/50 text-slate-100'
            : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
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
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Trace Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-xl border border-slate-700/50 bg-slate-800/30">
              <span className="text-[11px] text-slate-400 block">Trace ID</span>
              <span className="text-xs font-mono font-bold text-cyan-300">4bf92f3577b34da6a3ce929d0e0e4736</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-700/50 bg-slate-800/30">
              <span className="text-[11px] text-slate-400 block">Total Latency</span>
              <span className="text-xs font-mono font-bold text-emerald-400">48.2 ms (7 Spans)</span>
            </div>
            <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-500/10">
              <span className="text-[11px] text-rose-400 block font-bold">Critical Bottleneck</span>
              <span className="text-xs font-mono font-bold text-rose-300">payment-service (24.5ms • 51%)</span>
            </div>
          </div>

          {/* Span Waterfall Timeline */}
          <div className="space-y-2 border border-slate-700/50 rounded-xl p-4 bg-slate-950/70">
            <div className="text-[11px] font-bold uppercase text-slate-400 mb-3 flex items-center justify-between">
              <span>Service Span Waterfall (0ms ➔ 48.2ms)</span>
              <span>Duration</span>
            </div>

            {SPANS.map(span => {
              const leftPercent = (span.startOffsetMs / totalDuration) * 100;
              const widthPercent = Math.max((span.durationMs / totalDuration) * 100, 4);

              return (
                <div
                  key={span.id}
                  onClick={() => setSelectedSpan(span)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition flex items-center justify-between gap-3 ${
                    selectedSpan.id === span.id
                      ? 'bg-cyan-500/15 border-cyan-500/50'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="w-1/3">
                    <span className="text-xs font-bold font-mono text-slate-200 block truncate">{span.service}</span>
                    <span className="text-[10px] font-mono text-slate-400 block truncate">{span.operation}</span>
                  </div>

                  {/* Waterfall Bar */}
                  <div className="flex-1 h-3 bg-slate-800/80 rounded-full relative overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        span.isBottleneck
                          ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                      }`}
                      style={{
                        marginLeft: `${leftPercent}%`,
                        width: `${widthPercent}%`
                      }}
                    />
                  </div>

                  <span className="text-xs font-mono text-cyan-300 w-16 text-right font-bold">
                    {span.durationMs}ms
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
