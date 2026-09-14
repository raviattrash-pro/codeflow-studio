import React, { useState } from 'react';
import {
  X, GitBranch, GitPullRequest, AlertTriangle, CheckCircle2,
  Layers, ArrowRight, Download, Copy, Check, Sparkles, Plus, Minus, AlertCircle
} from 'lucide-react';
import { ThemeMode } from './Header';

interface ArchitectureDriftModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
  onTriggerAi?: (prompt: string) => void;
}

interface DriftItem {
  id: string;
  type: 'ADDED' | 'REMOVED' | 'VIOLATION' | 'MODIFIED';
  title: string;
  component: string;
  layer: string;
  impact: string;
  risk: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  remediation?: string;
}

const DRIFT_ITEMS: DriftItem[] = [
  {
    id: 'd1',
    type: 'VIOLATION',
    title: 'Layer Boundary Breach: Controller Bypasses Service Layer',
    component: 'PaymentWebhookController.java',
    layer: 'API / Controller',
    impact: 'Directly calls PaymentAuditRepository.save() instead of delegating to PaymentAuditService. Violates clean architecture.',
    risk: 'HIGH',
    remediation: 'Inject PaymentAuditService into PaymentWebhookController and delegate audit log persistence.',
  },
  {
    id: 'd2',
    type: 'ADDED',
    title: 'New Endpoint: POST /api/v1/checkout/v2/express',
    component: 'ExpressCheckoutController.java',
    layer: 'API / Controller',
    impact: 'Introduces 1-tap Apple Pay / Google Pay flow. Rate limiting filter is missing on this route.',
    risk: 'MEDIUM',
    remediation: 'Attach @RateLimited(requests = 20, duration = "1m") to prevent credential stuffing.',
  },
  {
    id: 'd3',
    type: 'ADDED',
    title: 'New Database Table: idempotency_keys',
    component: 'IdempotencyKeyEntity.java',
    layer: 'Persistence / JPA',
    impact: 'Adds distributed locking table for payment deduplication. Index on (key, expires_at) is verified.',
    risk: 'LOW',
  },
  {
    id: 'd4',
    type: 'MODIFIED',
    title: 'Altered Transaction Isolation: OrderService.process()',
    component: 'OrderService.java',
    layer: 'Business / Service',
    impact: 'Changed from READ_COMMITTED to SERIALIZABLE. May increase HikariCP lock contention under > 500 RPS load.',
    risk: 'HIGH',
    remediation: 'Benchmark under burst traffic or revert to optimistic locking with @Version column.',
  },
  {
    id: 'd5',
    type: 'REMOVED',
    title: 'Deprecated Endpoint: DELETE /api/v0/cart/legacy',
    component: 'LegacyCartController.java',
    layer: 'API / Controller',
    impact: 'Legacy endpoint successfully excised. 0 active clients detected in API gateway logs.',
    risk: 'NONE',
  }
];

export const ArchitectureDriftModal: React.FC<ArchitectureDriftModalProps> = ({
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
  onTriggerAi,
}) => {
  const [selectedBranch, setSelectedBranch] = useState<'feat/checkout-v2' | 'feat/microservices'>('feat/checkout-v2');
  const [copied, setCopied] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');

  if (!isOpen) return null;

  const isLight = currentTheme === 'NORMAL';
  const isGlass = currentTheme === 'GLASSMORPHISM';
  const isNeumorphic = currentTheme === 'NEUMORPHIC';

  const filteredItems = DRIFT_ITEMS.filter(i => {
    if (filterType === 'ALL') return true;
    if (filterType === 'VIOLATIONS') return i.type === 'VIOLATION';
    return i.type === filterType;
  });

  const getPrCommentMarkdown = () => {
    return `## 🏛️ CodeFlow Architecture Drift Impact Assessment
**Target Branch:** main ➔ **Source Branch:** ${selectedBranch}
**Overall Architectural Risk:** 🔴 **HIGH (1 Boundary Breach, 1 Isolation Risk)**

### ⚠️ Detected Architecture Drift & Violations:
${DRIFT_ITEMS.map(d => `- **[${d.type}]** ${d.component} — ${d.title}
  - *Layer:* ${d.layer}
  - *Impact:* ${d.impact}
  ${d.remediation ? `  - *Fix:* ${d.remediation}` : ''}`).join('\n')}

> *Automated Architecture Assessment by CodeFlow Studio v8.0*`;
  };

  const copyPrComment = () => {
    navigator.clipboard.writeText(getPrCommentMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getBadge = (type: DriftItem['type']) => {
    switch (type) {
      case 'VIOLATION':
        return <span className="px-2 py-0.5 text-xs font-bold rounded bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> VIOLATION</span>;
      case 'ADDED':
        return <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"><Plus className="w-3 h-3" /> ADDED</span>;
      case 'REMOVED':
        return <span className="px-2 py-0.5 text-xs font-bold rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1"><Minus className="w-3 h-3" /> REMOVED</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-bold rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">MODIFIED</span>;
    }
  };

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Git PR Architecture Drift Inspector</h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  AST Delta Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Compare pull request branches against main to detect layer boundary breaches, leaked transactions, and API drift
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={copyPrComment}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied PR Comment' : 'Copy GitHub PR Comment'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Branch Comparison Card */}
          <div className="md:col-span-4 border-r border-slate-700/50 p-4 space-y-4 overflow-y-auto bg-slate-800/20">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Pull Request Branch
              </span>
              <div className="space-y-2">
                {[
                  { id: 'feat/checkout-v2', title: 'PR #142: feat/checkout-v2', diff: '+2 endpoints, 1 layer breach' },
                  { id: 'feat/microservices', title: 'PR #139: feat/kafka-events', diff: '+3 producers, 0 violations' },
                ].map(b => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBranch(b.id as any)}
                    className={`w-full text-left p-3 rounded-xl border transition ${
                      selectedBranch === b.id
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                        : 'bg-slate-800/40 border-slate-700/40 text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <GitBranch className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-bold truncate">{b.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">{b.diff}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Overall Risk HUD */}
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 space-y-2">
              <span className="text-[11px] font-bold uppercase text-red-400 block">
                Architecture Impact: HIGH RISK
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                1 Layer Boundary Violation detected: <code className="text-red-300 font-mono">PaymentWebhookController</code> directly queries the persistence layer, bypassing transaction management.
              </p>
            </div>
          </div>

          {/* Right Drift Timeline & Items */}
          <div className="md:col-span-8 flex flex-col overflow-y-auto p-5 space-y-4">
            {/* Filter Pills */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">
                Drift Findings ({filteredItems.length})
              </span>
              <div className="flex items-center gap-1.5">
                {['ALL', 'VIOLATIONS', 'ADDED', 'MODIFIED', 'REMOVED'].map(k => (
                  <button
                    key={k}
                    onClick={() => setFilterType(k)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
                      filterType === k
                        ? 'bg-amber-500 text-slate-950 font-bold shadow'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            {/* Findings List */}
            <div className="space-y-3">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition ${
                    item.type === 'VIOLATION'
                      ? 'bg-red-500/5 border-red-500/30'
                      : isLight
                      ? 'bg-white border-slate-200'
                      : 'bg-slate-800/30 border-slate-700/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        {getBadge(item.type)}
                        <h4 className="font-semibold text-sm">{item.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300">{item.component}</span>
                        <span>•</span>
                        <span>{item.layer}</span>
                      </div>
                      <p className="text-xs text-slate-300 pt-1">{item.impact}</p>
                      {item.remediation && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 pt-1">
                          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Fix: {item.remediation}</span>
                        </div>
                      )}
                    </div>

                    {onTriggerAi && item.remediation && (
                      <button
                        onClick={() => {
                          onClose();
                          onTriggerAi(`Provide architectural refactor for ${item.component}: ${item.remediation}`);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow hover:from-purple-500 hover:to-indigo-500 transition flex-shrink-0"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Refactor with AI
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
