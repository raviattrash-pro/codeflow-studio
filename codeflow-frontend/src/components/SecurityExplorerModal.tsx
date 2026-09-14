import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, ShieldCheck, Lock, ArrowDown, CheckCircle2, Bot } from 'lucide-react';

import { DEMO_SECURITY_DATA, DEMO_PROJECT_DATA } from '../utils/demoData';

import { ThemeMode } from './Header';

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
  currentTheme?: ThemeMode;
  onAskAi?: (prompt: string, analysisType?: string) => void;
}

export const SecurityExplorerModal: React.FC<SecurityExplorerModalProps> = ({
  projectId,
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
  onAskAi,
}) => {
  const [data, setData] = useState<SecurityData | null>(null);
  const isLight = currentTheme === 'NORMAL' || currentTheme === 'GLASSMORPHISM' || currentTheme === 'NEUMORPHIC';

  useEffect(() => {
    if (!isOpen || !projectId) return;

    if (projectId === DEMO_PROJECT_DATA.id) {
      setData(DEMO_SECURITY_DATA);
      return;
    }

    axios
      .get<SecurityData>(`/api/v1/projects/${projectId}/security-flow`)
      .then((res) => setData(res.data || DEMO_SECURITY_DATA))
      .catch(() => setData(DEMO_SECURITY_DATA));
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  const getModalBg = () => {
    switch (currentTheme) {
      case 'NEUMORPHIC': return 'bg-[#e0e5ec] text-[#2d3748] border-[#c0cbdc] shadow-[15px_15px_30px_#a3b1c6]';
      case 'GLASSMORPHISM': return 'bg-white border-slate-200 text-slate-900 shadow-2xl';
      case 'NORMAL': return 'bg-white border-slate-200 text-slate-900 shadow-2xl';
      default: return 'bg-[#0b101d] text-slate-100 border-slate-800 shadow-[0_25px_80px_rgba(0,0,0,0.95)]';
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal-pop-in w-full max-w-4xl h-[85vh] max-h-[85vh] rounded-3xl border shadow-2xl overflow-hidden flex flex-col my-auto font-mono ${getModalBg()}`}
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 999999 }}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080c16] border-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold flex items-center space-x-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <span>Security Flow Explorer</span>
                <span className="px-2 py-0.5 text-[10px] bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 rounded-full font-bold">
                  {data?.authType || 'Spring Security + JWT'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Visual SecurityFilterChain, JwtAuthenticationFilter, and Authorization evaluation
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onAskAi && (
              <button
                onClick={() => onAskAi('Perform a comprehensive security audit on this Spring Security filter chain and JWT authentication setup.', 'SECURITY')}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold flex items-center space-x-1.5 transition-all"
              >
                <Bot className="w-3.5 h-3.5 text-red-400" />
                <span>AI Security Audit</span>
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-all ${isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pipeline Steps */}
        <div className={`flex-1 min-h-0 p-6 overflow-y-auto custom-scrollbar space-y-4 ${
          isLight ? 'bg-slate-50/50' : 'bg-[#090d16]'
        }`}>
          <div className="max-w-2xl mx-auto space-y-4">
            {(Array.isArray(data?.steps) ? data.steps : []).map((step, idx) => (
              <div key={step.step} className="space-y-3">
                <div className={`p-4 rounded-2xl border shadow-md space-y-2 font-mono ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-indigo-500/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                        {step.step}
                      </span>
                      <span className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{step.name}</span>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                      {step.type}
                    </span>
                  </div>
                  <p className={`text-xs font-sans leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{step.description}</p>
                </div>

                {idx < (data?.steps?.length || 0) - 1 && (
                  <div className="flex justify-center">
                    <ArrowDown className="w-4 h-4 text-indigo-400 animate-bounce" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Filter Chain Summary */}
          {data?.filterChain && (
            <div className={`mt-6 p-4 rounded-2xl border space-y-2 font-mono text-xs ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0f172a] border-slate-800 text-slate-100'
            }`}>
              <span className="text-indigo-500 font-bold uppercase tracking-wider block">
                Active Security Filter Chain Order:
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {data.filterChain.map((filter, fIdx) => (
                  <span
                    key={fIdx}
                    className={`px-2.5 py-1 rounded-lg border ${
                      isLight ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-[#070a12] text-slate-300 border-slate-800'
                    }`}
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
