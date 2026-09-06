import React, { useState, useMemo } from 'react';
import { X, Activity, AlertTriangle, ArrowUpDown, Search, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ApiMetric, DEMO_API_METRICS } from '../utils/metricsData';
import { ThemeMode } from './Header';

interface ApiMetricsDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
}

export const ApiMetricsDashboardModal: React.FC<ApiMetricsDashboardModalProps> = ({
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'GET' | 'POST' | 'PUT' | 'DELETE'>('ALL');
  const [sortBy, setSortBy] = useState<'p95LatencyMs' | 'requestCount24h' | 'errorRatePercent' | 'endpoint'>('p95LatencyMs');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const metrics = DEMO_API_METRICS;

  const summaryStats = useMemo(() => {
    const totalRequests = metrics.reduce((acc, curr) => acc + curr.requestCount24h, 0);
    const avgLatency = Math.round(metrics.reduce((acc, curr) => acc + curr.avgLatencyMs, 0) / (metrics.length || 1));
    const avgP95 = Math.round(metrics.reduce((acc, curr) => acc + curr.p95LatencyMs, 0) / (metrics.length || 1));
    const avgErrorRate = (metrics.reduce((acc, curr) => acc + curr.errorRatePercent, 0) / (metrics.length || 1)).toFixed(2);

    return {
      totalEndpoints: metrics.length,
      totalRequests,
      avgLatency,
      avgP95,
      avgErrorRate,
    };
  }, [metrics]);

  const filteredMetrics = useMemo(() => {
    return metrics
      .filter((m) => {
        const matchesMethod = methodFilter === 'ALL' || m.method === methodFilter;
        const matchesSearch =
          m.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.controller.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesMethod && matchesSearch;
      })
      .sort((a, b) => {
        const factor = sortOrder === 'asc' ? 1 : -1;
        if (sortBy === 'endpoint') {
          return a.endpoint.localeCompare(b.endpoint) * factor;
        }
        return (a[sortBy] - b[sortBy]) * factor;
      });
  }, [metrics, methodFilter, searchTerm, sortBy, sortOrder]);

  if (!isOpen) return null;

  const getMethodBadgeClass = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      case 'POST':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'PUT':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'DELETE':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  const getStatusBadge = (status: ApiMetric['status'], p95: number) => {
    if (status === 'CRITICAL' || p95 > 500) {
      return (
        <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
          <ShieldAlert className="w-3 h-3 shrink-0" />
          <span>High Latency</span>
        </span>
      );
    }
    if (status === 'DEGRADED' || p95 > 200) {
      return (
        <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span>Degraded</span>
        </span>
      );
    }
    return (
      <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        <CheckCircle2 className="w-3 h-3 shrink-0" />
        <span>Optimal</span>
      </span>
    );
  };

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
        className={`w-full max-w-5xl h-[88vh] max-h-[88vh] rounded-3xl border flex flex-col my-auto overflow-hidden font-sans ${getModalStyle()}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 md:p-6 border-b border-slate-800 flex items-center justify-between bg-[#0b1120] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base md:text-lg font-bold font-mono text-white">API Metrics &amp; Telemetry Dashboard</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  v4.1.0 Live
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Real-time latency distributions, throughput analytics, and endpoint status monitors.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 md:p-6 border-b border-slate-800 bg-[#090d16] shrink-0">
          <div className="p-3.5 rounded-2xl bg-[#131b2e] border border-slate-800 flex flex-col">
            <span className="text-[11px] font-mono text-slate-400">Total Tracked Endpoints</span>
            <span className="text-xl md:text-2xl font-bold font-mono text-white mt-1">{summaryStats.totalEndpoints}</span>
            <span className="text-[10px] font-mono text-emerald-400 mt-0.5">100% Instrumenting</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#131b2e] border border-slate-800 flex flex-col">
            <span className="text-[11px] font-mono text-slate-400">Avg P95 Response Time</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-xl md:text-2xl font-bold font-mono text-amber-400">{summaryStats.avgP95}</span>
              <span className="text-xs font-mono text-slate-400">ms</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-0.5">Global P95 SLA: &lt;300ms</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#131b2e] border border-slate-800 flex flex-col">
            <span className="text-[11px] font-mono text-slate-400">24h Total Throughput</span>
            <span className="text-xl md:text-2xl font-bold font-mono text-cyan-400 mt-1">
              {summaryStats.totalRequests.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-slate-400 mt-0.5">Requests processed</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#131b2e] border border-slate-800 flex flex-col">
            <span className="text-[11px] font-mono text-slate-400">Average Error Rate</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-xl md:text-2xl font-bold font-mono text-emerald-400">{summaryStats.avgErrorRate}%</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-0.5">99.4% Availability SLA</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 px-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-[#0c1222] shrink-0">
          <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by endpoint path or controller..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-[#1e293b] border border-slate-700 text-xs text-slate-100 placeholder-slate-400 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Method Filter Buttons */}
            <div className="flex items-center bg-[#1e293b] p-1 rounded-xl border border-slate-700 text-xs font-mono">
              {(['ALL', 'GET', 'POST', 'PUT', 'DELETE'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setMethodFilter(method)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    methodFilter === method
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Control */}
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#1e293b] border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="p95LatencyMs">P95 Latency</option>
              <option value="avgLatencyMs">Avg Latency</option>
              <option value="requestCount24h">24h Requests</option>
              <option value="errorRatePercent">Error Rate</option>
              <option value="endpoint">Path Name</option>
            </select>
            <button
              onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
              className="p-1.5 rounded-xl bg-[#1e293b] border border-slate-700 text-slate-300 hover:text-white"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metrics Grid List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 custom-scrollbar bg-[#090d16]">
          {filteredMetrics.length === 0 ? (
            <div className="text-center py-16 text-slate-500 font-mono text-xs">
              No matching API endpoints found matching filter criteria.
            </div>
          ) : (
            filteredMetrics.map((metric) => {
              const latencyPercent = Math.min(100, Math.round((metric.p95LatencyMs / 1000) * 100));
              return (
                <div
                  key={metric.id}
                  className="p-4 rounded-2xl bg-[#111827] border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start space-x-3 min-w-[280px]">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border shrink-0 ${getMethodBadgeClass(
                        metric.method
                      )}`}
                    >
                      {metric.method}
                    </span>
                    <div className="truncate">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                          {metric.endpoint}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 block mt-0.5 truncate">
                        Controller: <span className="text-indigo-400">{metric.controller}</span>
                      </span>
                    </div>
                  </div>

                  {/* Latency Bar & Figures */}
                  <div className="flex-1 max-w-xs space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">P95 / Avg Latency</span>
                      <span className="font-bold text-slate-200">
                        <span className="text-amber-400 font-extrabold">{metric.p95LatencyMs}ms</span> / {metric.avgLatencyMs}ms
                      </span>
                    </div>
                    <div className="w-full bg-[#030712] h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          metric.p95LatencyMs > 500
                            ? 'bg-gradient-to-r from-amber-500 to-red-500'
                            : metric.p95LatencyMs > 200
                            ? 'bg-gradient-to-r from-cyan-500 to-amber-500'
                            : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                        }`}
                        style={{ width: `${Math.max(8, latencyPercent)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>P99: {metric.p99LatencyMs}ms</span>
                      <span>SLA: &lt;300ms</span>
                    </div>
                  </div>

                  {/* Volume & Error Rate */}
                  <div className="flex items-center justify-between md:justify-end space-x-4 md:space-x-6 text-right font-mono">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-slate-400 block">24h Volume</span>
                      <span className="text-xs font-bold text-slate-200">
                        {metric.requestCount24h.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-slate-400 block">Error Rate</span>
                      <span
                        className={`text-xs font-bold ${
                          metric.errorRatePercent > 2
                            ? 'text-red-400'
                            : metric.errorRatePercent > 1
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {metric.errorRatePercent}%
                      </span>
                    </div>
                    <div className="min-w-[100px] flex justify-end">
                      {getStatusBadge(metric.status, metric.p95LatencyMs)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
