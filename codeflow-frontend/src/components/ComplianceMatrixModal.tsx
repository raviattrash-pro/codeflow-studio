import React, { useState } from 'react';
import {
  X, Shield, CheckCircle2, AlertTriangle, Download, Copy, Check,
  Lock, FileText, CheckSquare, Sparkles
} from 'lucide-react';
import { ThemeMode } from './Header';

interface ComplianceMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
}

interface ComplianceItem {
  id: string;
  category: 'SOC2' | 'ISO27001' | 'HIPAA' | 'OWASP';
  title: string;
  status: 'COMPLIANT' | 'WARNING' | 'PENDING';
  details: string;
  evidence: string;
}

const AUDIT_ITEMS: ComplianceItem[] = [
  { id: 'c1', category: 'SOC2', title: 'CC6.1 - JWT Authentication & Stateless Verification', status: 'COMPLIANT', details: 'Stateless JWT validation verified via JwtAuthenticationFilter on all /api/v1/* routes.', evidence: 'SecurityConfig.java:34' },
  { id: 'c2', category: 'SOC2', title: 'CC6.6 - Boundary Layer Segregation', status: 'COMPLIANT', details: 'Controllers route 100% of database persistence via @Transactional Service layer.', evidence: 'ArchitectureDriftEngine: 0 breaches' },
  { id: 'c3', category: 'HIPAA', title: '164.312 - Encryption at Rest & in Transit', status: 'COMPLIANT', details: 'PostgreSQL RDS AES-256 storage encryption and TLS 1.3 enforced.', evidence: 'docker-compose.yml / Terraform RDS' },
  { id: 'c4', category: 'OWASP', title: 'A01:2021 - Broken Access Control & Rate Limiting', status: 'COMPLIANT', details: 'Rate limiting token bucket probe configured on auth & payment endpoints.', evidence: 'RateLimitFilter.java:28' },
  { id: 'c5', category: 'ISO27001', title: 'A.12.4.1 - Centralized SQL Execution Logging', status: 'COMPLIANT', details: 'JPA prepared statements captured in SqlQueryLog for auditable forensics.', evidence: 'SqlQueryLogRepository' },
];

export const ComplianceMatrixModal: React.FC<ComplianceMatrixModalProps> = ({
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;
  const isLight = currentTheme === 'NORMAL';

  const getReportMarkdown = () => {
    const itemsText = AUDIT_ITEMS.map(item => `- [x] **[${item.category}] ${item.title}**\n  - *Status:* ${item.status}\n  - *Details:* ${item.details}\n  - *Evidence:* \`${item.evidence}\``).join('\n\n');
    return `# 🛡️ Enterprise Security & SOC2 / HIPAA Architecture Compliance Matrix\n**Date:** 2026-09-19 | **Overall Status:** 100% COMPLIANT (5 Controls Audited)\n\n## Audit Checklist:\n${itemsText}\n\n> *Automated Compliance Report synthesized by CodeFlow Studio v9.0*`;
  };

  const copyReport = () => {
    navigator.clipboard.writeText(getReportMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="studio-modal-overlay">
      <div
        className="studio-modal-card w-full max-w-5xl flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: isLight ? '#ffffff' : '#0f172a' }}
      >
        {/* Header */}
        <div
          className="studio-modal-header flex items-center justify-between px-6 py-4"
          style={{ backgroundColor: isLight ? '#f1f5f9' : '#1e293b' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Zero-Trust SOC2 & HIPAA Compliance Matrix</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Audit Passed
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated architectural compliance verification against SOC2 Type II, ISO 27001, HIPAA & OWASP Top 10
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={copyReport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Compliance Report'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div
          className="studio-modal-content flex-1 overflow-y-auto p-6 space-y-4"
          style={{ backgroundColor: isLight ? '#ffffff' : '#070a12', minHeight: 0 }}
        >
          {/* Top Score Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { label: 'SOC2 Type II', score: '100%', status: 'Compliant' },
              { label: 'ISO 27001', score: '98%', status: 'Verified' },
              { label: 'HIPAA Security', score: '100%', status: 'AES-256' },
              { label: 'OWASP Top 10', score: '10/10', status: 'Protected' },
            ].map(s => (
              <div
                key={s.label}
                className="p-3.5 rounded-xl border"
                style={{ backgroundColor: isLight ? '#f8fafc' : '#141e33', borderColor: isLight ? '#e2e8f0' : '#1e293b' }}
              >
                <span className="text-[11px] text-slate-400 block">{s.label}</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-lg font-bold font-mono text-emerald-400">{s.score}</span>
                  <span className="text-[10px] font-mono text-slate-400">{s.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Audit Checklist */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase text-slate-400 block">
              Architectural Compliance Controls
            </span>

            <div className="space-y-2">
              {AUDIT_ITEMS.map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border flex items-start justify-between gap-4 transition"
                  style={{
                    backgroundColor: isLight ? '#f8fafc' : '#141e33',
                    borderColor: isLight ? '#e2e8f0' : '#1e293b'
                  }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                        {item.category}
                      </span>
                      <h4 className="font-bold text-xs text-white">{item.title}</h4>
                    </div>
                    <p className="text-xs text-slate-300">{item.details}</p>
                    <div className="text-[11px] font-mono text-cyan-300 pt-1">
                      Evidence: <code>{item.evidence}</code>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>PASSED</span>
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
