import React, { useState, useCallback } from 'react';
import { X, Shield, ShieldCheck, ShieldAlert, ShieldX, ChevronDown, ChevronRight, FileText, Download, RotateCcw, Terminal, AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';
import axios from 'axios';

interface ArchGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
  isLight?: boolean;
}

interface RuleResult {
  id: string;
  name: string;
  description: string;
  severity: string;
  status: string;
  violations: Array<{ ruleId: string; message: string; severity: string; nodeName?: string; sourceNode?: string; targetNode?: string }>;
}

interface GateReport {
  projectId: string;
  timestamp: string;
  totalRules: number;
  passed: number;
  failed: number;
  score: number;
  status: string;
  rules: RuleResult[];
  totalViolations: number;
  nodeCount: number;
  edgeCount: number;
}

const ArchGateModal: React.FC<ArchGateModalProps> = ({ isOpen, onClose, projectId, isLight }) => {
  const [report, setReport] = useState<GateReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());
  const [markdownReport, setMarkdownReport] = useState<string | null>(null);

  const runValidation = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    setReport(null);
    setMarkdownReport(null);
    try {
      const { data } = await axios.post(`/api/v1/projects/${projectId}/arch-gate/validate`);
      setReport(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Validation failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const fetchMarkdown = useCallback(async () => {
    if (!projectId) return;
    try {
      const { data } = await axios.get(`/api/v1/projects/${projectId}/arch-gate/report`);
      setMarkdownReport(data.content);
    } catch {
      setMarkdownReport('Failed to generate markdown report.');
    }
  }, [projectId]);

  const toggleRule = (ruleId: string) => {
    setExpandedRules(prev => {
      const next = new Set(prev);
      if (next.has(ruleId)) next.delete(ruleId);
      else next.add(ruleId);
      return next;
    });
  };

  const copyMarkdown = () => {
    if (markdownReport) {
      navigator.clipboard.writeText(markdownReport);
    }
  };

  if (!isOpen) return null;

  const bg = isLight ? 'bg-white' : 'bg-zinc-900';
  const border = isLight ? 'border-zinc-200' : 'border-zinc-800';
  const text = isLight ? 'text-zinc-800' : 'text-zinc-100';
  const textSec = isLight ? 'text-zinc-500' : 'text-zinc-400';
  const cardBg = isLight ? 'bg-zinc-50' : 'bg-zinc-800/50';

  const severityColor: Record<string, string> = {
    CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/30',
    HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    MEDIUM: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    LOW: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className={`relative w-full max-w-4xl max-h-[90vh] rounded-2xl border ${border} ${bg} shadow-2xl overflow-hidden flex flex-col`} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={`shrink-0 flex items-center justify-between p-6 border-b ${border}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${text}`}>CI/CD Architecture Gate</h2>
              <p className={`text-xs ${textSec}`}>Validate architecture rules before merge</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg hover:bg-zinc-500/10 ${textSec}`}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
          {/* Actions Bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={runValidation}
              disabled={loading || !projectId}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <RotateCcw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              {loading ? 'Validating...' : 'Run Architecture Gate'}
            </button>
            {report && (
              <button
                onClick={fetchMarkdown}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border ${border} ${text} hover:bg-zinc-500/10 transition-colors`}
              >
                <FileText size={16} /> Export Report
              </button>
            )}
            {!projectId && (
              <p className={`text-sm ${textSec}`}>
                <Info size={14} className="inline mr-1" />
                Ingest a project first to run validation
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              <AlertTriangle size={16} className="inline mr-2" />{error}
            </div>
          )}

          {/* Score Card */}
          {report && (
            <div className={`grid grid-cols-4 gap-4`}>
              <div className={`p-4 rounded-xl border ${border} ${cardBg} text-center`}>
                <div className={`text-3xl font-black ${report.status === 'PASSED' ? 'text-emerald-400' : 'text-red-400'}`}>{report.score}%</div>
                <div className={`text-xs mt-1 ${textSec}`}>Architecture Score</div>
              </div>
              <div className={`p-4 rounded-xl border ${border} ${cardBg} text-center`}>
                <div className="text-3xl font-black text-emerald-400">{report.passed}</div>
                <div className={`text-xs mt-1 ${textSec}`}>Rules Passed</div>
              </div>
              <div className={`p-4 rounded-xl border ${border} ${cardBg} text-center`}>
                <div className="text-3xl font-black text-red-400">{report.failed}</div>
                <div className={`text-xs mt-1 ${textSec}`}>Rules Failed</div>
              </div>
              <div className={`p-4 rounded-xl border ${border} ${cardBg} text-center`}>
                <div className={`text-3xl font-black ${textSec}`}>{report.totalViolations}</div>
                <div className={`text-xs mt-1 ${textSec}`}>Total Violations</div>
              </div>
            </div>
          )}

          {/* Overall Status Banner */}
          {report && (
            <div className={`p-4 rounded-xl border flex items-center gap-3 ${
              report.status === 'PASSED'
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              {report.status === 'PASSED' ? (
                <ShieldCheck size={24} className="text-emerald-400" />
              ) : (
                <ShieldX size={24} className="text-red-400" />
              )}
              <div>
                <p className={`font-semibold ${report.status === 'PASSED' ? 'text-emerald-300' : 'text-red-300'}`}>
                  Architecture Gate {report.status}
                </p>
                <p className={`text-xs ${textSec}`}>
                  {report.nodeCount} components analyzed · {report.edgeCount} connections · {report.timestamp}
                </p>
              </div>
            </div>
          )}

          {/* Rules Detail */}
          {report && (
            <div className="space-y-3">
              <h3 className={`text-sm font-semibold ${text}`}>Validation Rules</h3>
              {report.rules.map((rule) => (
                <div key={rule.id} className={`rounded-xl border ${border} ${cardBg} overflow-hidden`}>
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`w-full flex items-center gap-3 p-4 text-left hover:bg-zinc-500/5 transition-colors`}
                  >
                    {rule.status === 'PASS' ? (
                      <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle size={18} className="text-red-400 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${text}`}>{rule.id} — {rule.name}</div>
                      <div className={`text-xs ${textSec} mt-0.5`}>{rule.description}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${severityColor[rule.severity] || 'text-zinc-400'}`}>
                      {rule.severity}
                    </span>
                    {rule.violations.length > 0 && (
                      expandedRules.has(rule.id)
                        ? <ChevronDown size={16} className={textSec} />
                        : <ChevronRight size={16} className={textSec} />
                    )}
                  </button>

                  {expandedRules.has(rule.id) && rule.violations.length > 0 && (
                    <div className={`border-t ${border} p-4 space-y-2`}>
                      {rule.violations.map((v, i) => (
                        <div key={i} className={`flex items-start gap-2 text-xs ${textSec}`}>
                          <AlertTriangle size={12} className="text-amber-400 mt-0.5 shrink-0" />
                          <span>{v.message}{v.nodeName ? ` (${v.nodeName})` : ''}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Markdown Export */}
          {markdownReport && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-semibold ${text}`}>Markdown Report (for CI/CD)</h3>
                <button
                  onClick={copyMarkdown}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs transition-colors"
                >
                  <Download size={12} /> Copy to Clipboard
                </button>
              </div>
              <pre className={`p-4 rounded-xl border ${border} ${cardBg} text-xs overflow-x-auto ${textSec} whitespace-pre-wrap font-mono`}>
                {markdownReport}
              </pre>
            </div>
          )}

          {/* Empty state */}
          {!report && !loading && !error && (
            <div className="text-center py-16">
              <Shield size={48} className={`mx-auto mb-4 ${textSec} opacity-30`} />
              <h3 className={`text-lg font-semibold ${text} mb-2`}>Architecture Quality Gate</h3>
              <p className={`text-sm ${textSec} max-w-md mx-auto`}>
                Validate your project against 6 architecture rules covering layer separation,
                circular dependencies, JPA compliance, API naming, and security annotations.
              </p>
              <div className={`mt-6 grid grid-cols-3 gap-3 max-w-lg mx-auto`}>
                {['LAYER-001', 'CYCLE-001', 'LAYER-002', 'JPA-001', 'API-001', 'SEC-001'].map(id => (
                  <div key={id} className={`p-2 rounded-lg border ${border} ${cardBg} text-xs ${textSec}`}>{id}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArchGateModal;
