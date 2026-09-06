import React, { useState, useMemo } from 'react';
import { X, Flame, Info } from 'lucide-react';
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
        className={`modal-pop-in w-full max-w-6xl h-[88vh] max-h-[88vh] rounded-3xl border flex flex-col my-auto shadow-2xl overflow-hidden font-sans ${getModalStyle()}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-slate-800 flex items-center justify-between bg-[#0b1120] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base md:text-lg font-bold font-mono text-white">24-Hour Latency Distribution Heatmap</h2>
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
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legend and Summary */}
        <div className="p-4 px-6 border-b border-slate-800 bg-[#090d16] flex flex-wrap items-center justify-between gap-4 text-xs font-mono shrink-0">
          <div className="flex items-center space-x-3 md:space-x-4">
            <span className="text-slate-400">Latency:</span>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded bg-[#06b6d4]" />
              <span className="text-[10px] text-slate-300">&lt;100ms</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded bg-[#10b981]" />
              <span className="text-[10px] text-slate-300">100-200ms</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded bg-[#eab308]" />
              <span className="text-[10px] text-slate-300">200-350ms</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded bg-[#f97316]" />
              <span className="text-[10px] text-slate-300">350-600ms</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded bg-[#ef4444]" />
              <span className="text-[10px] text-slate-300">&gt;600ms</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="hidden sm:inline">Hover any cell to inspect peak RPS &amp; exact P95 execution time</span>
          </div>
        </div>

        {/* Heatmap Matrix Canvas */}
        <div className="flex-1 overflow-auto p-4 md:p-6 custom-scrollbar flex flex-col bg-[#090d16]">
          <div className="min-w-[850px] space-y-3">
            {/* Hours Header Row */}
            <div
              className="items-center pb-2 border-b border-slate-800 font-mono text-[10px] text-slate-400 text-center"
              style={{ display: 'grid', gridTemplateColumns: '220px repeat(24, minmax(24px, 1fr))', gap: '6px' }}
            >
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
                  className={`items-center p-2 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1e293b] border-amber-500 shadow-lg'
                      : 'bg-[#111827] border-slate-800 hover:border-slate-700'
                  }`}
                  style={{ display: 'grid', gridTemplateColumns: '220px repeat(24, minmax(24px, 1fr))', gap: '6px' }}
                >
                  {/* Left Label */}
                  <div className="pr-3 truncate">
                    <div className="flex items-center space-x-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#1e293b] text-cyan-400">
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

                    return (
                      <div
                        key={hour}
                        onMouseEnter={() => setHoveredCell(cell)}
                        onMouseLeave={() => setHoveredCell(null)}
                        className="h-7 rounded-md transition-all transform hover:scale-125 hover:z-30 hover:shadow-xl flex items-center justify-center relative cursor-pointer"
                        style={{
                          backgroundColor: color,
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
          <div className="p-4 px-6 border-t border-slate-800 bg-[#090d16] flex items-center justify-between animate-fade-in font-mono text-xs shrink-0">
            <div className="flex items-center space-x-4 md:space-x-6">
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Time Slot</span>
                <span className="text-slate-200 font-bold">
                  {hoveredCell.hour.toString().padStart(2, '0')}:00 - {(hoveredCell.hour + 1).toString().padStart(2, '0')}:00 UTC
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">P95 Latency</span>
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

            <div className="text-[11px] text-slate-400 hidden sm:block">
              Target ID: <span className="text-indigo-400">{hoveredCell.endpointId}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
