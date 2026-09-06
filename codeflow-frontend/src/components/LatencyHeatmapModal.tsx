import React, { useState, useMemo } from 'react';
import { X, Flame, Clock, Calendar, BarChart2, Info, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { generateDemoHeatmapData, DEMO_API_METRICS, HeatmapCell } from '../utils/metricsData';
import { ThemeMode } from './Header';

interface LatencyHeatmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
}

export const LatencyHeatmapModal: React.FC<LatencyHeatmapModalProps> = ({
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
}) => {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [selectedMetricId, setSelectedMetricId] = useState<string | null>(null);

  const heatmapCells = useMemo(() => generateDemoHeatmapData(), []);
  const metrics = DEMO_API_METRICS;

  if (!isOpen) return null;

  const getHeatmapColor = (p95Ms: number) => {
    if (p95Ms > 600) return '#ef4444'; // Red (Critical)
    if (p95Ms > 350) return '#f97316'; // Orange
    if (p95Ms > 200) return '#eab308'; // Amber / Yellow
    if (p95Ms > 100) return '#10b981'; // Green (Good)
    return '#06b6d4'; // Cyan (Optimal/Fast)
  };

  const getCellOpacity = (p95Ms: number) => {
    return Math.min(1, Math.max(0.35, p95Ms / 800));
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div
        className={`w-full max-w-6xl h-[88vh] rounded-3xl border flex flex-col shadow-2xl overflow-hidden font-sans ${
          currentTheme === 'NEUMORPHIC'
            ? 'bg-[#e0e5ec] text-[#2d3748] border-[#c0cbdc]'
            : currentTheme === 'NORMAL' || currentTheme === 'GLASSMORPHISM'
            ? 'bg-slate-900 text-slate-100 border-slate-700'
            : 'bg-[#090d16] text-slate-100 border-slate-800'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold font-mono text-white">24-Hour Latency Distribution Heatmap</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Hourly P95 Quantiles
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Visualizing temporal latency fluctuations, burst spikes, and high-traffic bottlenecks.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legend and Summary */}
        <div className="p-4 px-6 border-b border-slate-800/60 bg-slate-950/20 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center space-x-4">
            <span className="text-slate-400">Latency Spectrum:</span>
            <div className="flex items-center space-x-1.5">
              <div className="w-3.5 h-3.5 rounded bg-[#06b6d4]" />
              <span className="text-[10px] text-slate-300">&lt;100ms</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3.5 h-3.5 rounded bg-[#10b981]" />
              <span className="text-[10px] text-slate-300">100-200ms</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3.5 h-3.5 rounded bg-[#eab308]" />
              <span className="text-[10px] text-slate-300">200-350ms</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3.5 h-3.5 rounded bg-[#f97316]" />
              <span className="text-[10px] text-slate-300">350-600ms</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3.5 h-3.5 rounded bg-[#ef4444]" />
              <span className="text-[10px] text-slate-300">&gt;600ms (Critical)</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>Hover any cell to inspect peak RPS &amp; exact P95 execution time</span>
          </div>
        </div>

        {/* Heatmap Matrix Canvas */}
        <div className="flex-1 overflow-auto p-6 custom-scrollbar flex flex-col">
          <div className="min-w-[850px] space-y-4">
            {/* Hours Header Row */}
            <div className="grid grid-cols-[220px_repeat(24,1fr)] gap-1.5 items-center pb-2 border-b border-slate-800 font-mono text-[10px] text-slate-400 text-center">
              <div className="text-left font-bold pl-2">Endpoint Target</div>
              {Array.from({ length: 24 }).map((_, hour) => (
                <div key={hour} className="truncate">
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Heatmap Rows per Endpoint */}
            {metrics.map((metric) => {
              const rowCells = heatmapCells.filter((c) => c.endpointId === metric.id);
              const isSelected = selectedMetricId === metric.id;

              return (
                <div
                  key={metric.id}
                  onClick={() => setSelectedMetricId(isSelected ? null : metric.id)}
                  className={`grid grid-cols-[220px_repeat(24,1fr)] gap-1.5 items-center p-2 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-amber-500/80 shadow-lg'
                      : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Left Label */}
                  <div className="pr-3 truncate">
                    <div className="flex items-center space-x-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-cyan-400">
                        {metric.method}
                      </span>
                      <span className="text-xs font-mono font-bold text-white truncate" title={metric.endpoint}>
                        {metric.endpoint}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 truncate block mt-0.5">
                      {metric.controller}
                    </span>
                  </div>

                  {/* 24 Hour Matrix Cells */}
                  {Array.from({ length: 24 }).map((_, hour) => {
                    const cell = rowCells.find((c) => c.hour === hour) || {
                      hour,
                      endpointId: metric.id,
                      p95LatencyMs: metric.p95LatencyMs,
                      requestCount: Math.round(metric.requestCount24h / 24),
                      errorCount: 0,
                    };
                    const color = getHeatmapColor(cell.p95LatencyMs);
                    const opacity = getCellOpacity(cell.p95LatencyMs);

                    return (
                      <div
                        key={hour}
                        onMouseEnter={() => setHoveredCell(cell)}
                        onMouseLeave={() => setHoveredCell(null)}
                        className="h-8 rounded-lg transition-all transform hover:scale-125 hover:z-30 hover:shadow-xl flex items-center justify-center relative group"
                        style={{
                          backgroundColor: color,
                          opacity: opacity,
                        }}
                      >
                        {cell.p95LatencyMs > 500 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Hover / Selected Cell Detail Drawer Footer */}
        {hoveredCell && (
          <div className="p-4 px-6 border-t border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between animate-fade-in font-mono text-xs">
            <div className="flex items-center space-x-6">
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Time Slot</span>
                <span className="text-slate-200 font-bold">
                  {hoveredCell.hour.toString().padStart(2, '0')}:00 - {(hoveredCell.hour + 1).toString().padStart(2, '0')}:00 UTC
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">P95 Response Time</span>
                <span
                  className="font-extrabold text-sm"
                  style={{ color: getHeatmapColor(hoveredCell.p95LatencyMs) }}
                >
                  {hoveredCell.p95LatencyMs} ms
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Hourly Volume</span>
                <span className="text-slate-200 font-bold">{hoveredCell.requestCount.toLocaleString()} reqs</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Errors</span>
                <span className={`font-bold ${hoveredCell.errorCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {hoveredCell.errorCount} failures
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              Target ID: <span className="text-indigo-400">{hoveredCell.endpointId}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
