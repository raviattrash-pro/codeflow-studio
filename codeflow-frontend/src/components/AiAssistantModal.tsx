import React, { useState } from 'react';
import axios from 'axios';
import { X, Sparkles, Bot, Send, ShieldCheck, Database, Layers, CheckCircle2, ArrowRight } from 'lucide-react';

interface AiAssistantModalProps {
  projectId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface AiResponse {
  title: string;
  explanation: string;
  keyComponents: string[];
  recommendation: string;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  projectId,
  isOpen,
  onClose,
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AiResponse | null>(null);

  if (!isOpen) return null;

  const handleQuery = (queryPrompt: string) => {
    if (!projectId) return;
    setLoading(true);
    setPrompt(queryPrompt);

    axios
      .post<AiResponse>(`/api/v1/projects/${projectId}/ai/explain`, { prompt: queryPrompt })
      .then((res) => {
        setResponse(res.data);
      })
      .catch(() => setResponse(null))
      .finally(() => setLoading(false));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="w-full max-w-3xl h-[85vh] max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center space-x-2">
                <span>AI Code Assistant & Architectural Explainer</span>
                <span className="px-2 py-0.5 text-[10px] bg-pink-500/20 text-pink-300 border border-pink-500/30 rounded-full">
                  v2.0 Upgrade
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Ask architectural questions or generate security & database compliance reviews
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

        {/* Preset Prompt Buttons */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 flex flex-wrap gap-2 text-xs font-mono shrink-0">
          <button
            onClick={() => handleQuery('Explain Architecture')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition-all"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Explain Overall Architecture</span>
          </button>
          <button
            onClick={() => handleQuery('Security & JWT')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Security & Auth Review</span>
          </button>
          <button
            onClick={() => handleQuery('Database & JPA')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 transition-all"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database & JPA Review</span>
          </button>
        </div>

        {/* Main Response Area */}
        <div className="flex-1 min-h-0 p-6 overflow-y-auto custom-scrollbar space-y-5">
          {loading ? (
            <div className="p-12 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-pink-500 mx-auto animate-spin" />
              <p className="text-sm font-mono text-slate-300">Analyzing AST graphs and generating architectural response...</p>
            </div>
          ) : response ? (
            <div className="space-y-5 animate-fade-in">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white font-mono">{response.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{response.explanation}</p>
              </div>

              {response.keyComponents && (
                <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block font-mono">
                    Key Architectural Components
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {response.keyComponents.map((comp, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 text-xs font-mono rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {response.recommendation && (
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block font-mono">
                    Optimization Recommendation
                  </span>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">{response.recommendation}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 font-mono">
              Select a preset prompt above or type your architectural query below.
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center space-x-3 shrink-0">
          <input
            type="text"
            placeholder="Ask AI Assistant about architecture, security, JPA, or controllers..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuery(prompt)}
            className="flex-1 bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-all font-mono"
          />
          <button
            onClick={() => handleQuery(prompt)}
            disabled={!prompt.trim() || loading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
