import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, ShieldCheck, Lock, ArrowDown, CheckCircle2 } from 'lucide-react';

interface SecurityStep {
  step: number;
  name: string;
  type: string;
  description: string;
}

interface SecurityData {
  authType: string;
  steps: SecurityStep[];
  filterChain: string[];
}

interface SecurityExplorerModalProps {
  projectId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityExplorerModal: React.FC<SecurityExplorerModalProps> = ({
  projectId,
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<SecurityData | null>(null);

  useEffect(() => {
    if (!isOpen || !projectId) return;

    axios
      .get<SecurityData>(`/api/v1/projects/${projectId}/security-flow`)
      .then((res) => setData(res.data))
      .catch(() => setData(null));
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="w-full max-w-4xl h-[85vh] max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center space-x-2">
                <span>Security Flow Explorer</span>
                <span className="px-2 py-0.5 text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                  {data?.authType || 'Spring Security + JWT'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Visual SecurityFilterChain, JwtAuthenticationFilter, and Authorization evaluation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pipeline Steps */}
        <div className="flex-1 min-h-0 p-6 overflow-y-auto custom-scrollbar bg-slate-950/60 space-y-4">
          <div className="max-w-2xl mx-auto space-y-4">
            {(data?.steps || []).map((step, idx) => (
              <div key={step.step} className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-900 border border-purple-500/30 shadow-lg space-y-2 font-mono">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                        {step.step}
                      </span>
                      <span className="text-sm font-bold text-white">{step.name}</span>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {step.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">{step.description}</p>
                </div>

                {idx < (data?.steps?.length || 0) - 1 && (
                  <div className="flex justify-center">
                    <ArrowDown className="w-4 h-4 text-purple-400 animate-bounce" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Filter Chain Summary */}
          {data?.filterChain && (
            <div className="mt-6 p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 font-mono text-xs">
              <span className="text-purple-400 font-bold uppercase tracking-wider block">
                Active Security Filter Chain Order:
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {data.filterChain.map((filter, fIdx) => (
                  <span
                    key={fIdx}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800"
                  >
                    {filter}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
