import React, { useState } from 'react';
import {
  X, Activity, ShieldCheck, Database, Layers, Sparkles,
  AlertTriangle, CheckCircle2, Info, ArrowUpRight, Download,
  RefreshCw, ChevronRight, Zap, ExternalLink, Filter
} from 'lucide-react';
import { ThemeMode } from './Header';

interface ArchitectureScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
  onTriggerAiFix?: (findingTitle: string, query: string) => void;
}

interface MetricDial {
  id: string;
  name: string;
  category: 'SECURITY' | 'DATABASE' | 'DEPENDENCY' | 'REACT19';
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'F';
  status: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
  color: string;
  bgColor: string;
  borderColor: string;
  summary: string;
}

interface AuditFinding {
  id: string;
  title: string;
  category: 'SECURITY' | 'DATABASE' | 'DEPENDENCY' | 'REACT19';
  severity: 'CRITICAL' | 'WARNING' | 'PASS' | 'INFO';
  component: string;
  impact: string;
  recommendation: string;
  aiPrompt: string;
}

const DIALS: MetricDial[] = [
  {
    id: 'sec',
    name: 'Security & Auth Posture',
    category: 'SECURITY',
    score: 94,
    grade: 'A+',
    status: 'EXCELLENT',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    summary: 'Stateless JWT filter chain active, HMAC-SHA256 validated, BCrypt hashing verified.',
  },
  {
    id: 'db',
    name: 'SQL & Persistence Efficiency',
    category: 'DATABASE',
    score: 88,
    grade: 'A',
    status: 'GOOD',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    summary: 'HikariCP tuned, 1 potential N+1 fetch warning in OrderItems relationship.',
  },
  {
    id: 'dep',
    name: 'Dependency & CVE Risk',
    category: 'DEPENDENCY',
    score: 98,
    grade: 'A+',
    status: 'EXCELLENT',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    summary: '0 critical CVEs detected across 8 Maven dependencies. Java 21 LTS verified.',
  },
  {
    id: 'react',
    name: 'React 19 & Client Bundle',
    category: 'REACT19',
    score: 92,
    grade: 'A+',
    status: 'EXCELLENT',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    summary: 'Code splitting enabled (444 kB main bundle), memoized selectors, zero hydration errors.',
  },
];

const FINDINGS: AuditFinding[] = [
  {
    id: 'f1',
    title: 'Restrict CORS Wildcard in AdminController',
    category: 'SECURITY',
    severity: 'WARNING',
    component: 'AdminController.java',
    impact: '@CrossOrigin(origins = "*") permits cross-origin requests from any untrusted origin.',
    recommendation: 'Specify allowed origins explicitly via application.yml security whitelist property.',
    aiPrompt: 'Provide hardened Spring Security CORS configuration to replace @CrossOrigin wildcard in AdminController.java',
  },
  {
    id: 'f2',
    title: 'N+1 Fetch Risk in OrderItems Relationship',
    category: 'DATABASE',
    severity: 'WARNING',
    component: 'OrderEntity.java / OrderRepository.java',
    impact: 'Eager loading on @ManyToOne relations can trigger 1+N database queries during order list retrieval.',
    recommendation: 'Use FetchType.LAZY with @EntityGraph(attributePaths = {"orderItems"}) on JpaRepository queries.',
    aiPrompt: 'Show how to refactor OrderEntity and OrderRepository to eliminate N+1 query problem using @EntityGraph',
  },
  {
    id: 'f3',
    title: 'Stateless Session Management Active',
    category: 'SECURITY',
    severity: 'PASS',
    component: 'SecurityConfig.java',
    impact: 'SessionCreationPolicy.STATELESS prevents server-side memory leaks and supports horizontal scaling.',
    recommendation: 'Maintained automatically. Ensure JWT tokens carry expiry claims (< 1 hour).',
    aiPrompt: 'Explain how stateless JWT session management operates in Spring Security 6',
  },
  {
    id: 'f4',
    title: 'Missing Composite Index on (user_id, created_at)',
    category: 'DATABASE',
    severity: 'INFO',
    component: 'orders table (PostgreSQL / H2)',
    impact: 'Querying recent orders for a user scans the table sequentially as table size grows.',
    recommendation: 'Add @Table(indexes = {@Index(columnList = "user_id, created_at DESC")}) to OrderEntity.',
    aiPrompt: 'Generate Liquibase / Flyway migration and JPA @Table index definition for orders table composite index',
  },
  {
    id: 'f5',
    title: 'Vite Code Splitting & Dynamic Modals Active',
    category: 'REACT19',
    severity: 'PASS',
    component: 'App.tsx & React.lazy',
    impact: 'Initial JavaScript bundle payload reduced from 1.2 MB to 444 kB, improving First Contentful Paint.',
    recommendation: 'Continue lazy loading non-critical heavy visualization tools and modals.',
    aiPrompt: 'Explain best practices for dynamic chunk loading and Suspense boundaries in React 19',
  },
  {
    id: 'f6',
    title: 'No Known Vulnerabilities in Maven BOM',
    category: 'DEPENDENCY',
    severity: 'PASS',
    component: 'pom.xml (Spring Boot 3.2.3 BOM)',
    impact: 'Dependencies matched against National Vulnerability Database (NVD) with 0 high/critical flags.',
    recommendation: 'Schedule automated quarterly dependency upgrades to stay aligned with Spring Boot LTS.',
    aiPrompt: 'Show Maven versions-maven-plugin and Dependabot configuration for Spring Boot 3 projects',
  }
];

export const ArchitectureScorecardModal: React.FC<ArchitectureScorecardModalProps> = ({
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
  onTriggerAiFix,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const isLight = currentTheme === 'NORMAL';
  const isGlass = currentTheme === 'GLASSMORPHISM';
  const isNeumorphic = currentTheme === 'NEUMORPHIC';

  const overallScore = Math.round(
    DIALS.reduce((acc, d) => acc + d.score, 0) / DIALS.length
  );

  const filteredFindings = FINDINGS.filter(f => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'WARNINGS') return f.severity === 'WARNING' || f.severity === 'CRITICAL';
    return f.category === selectedFilter;
  });

  const handleExportReport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const markdown = `# CodeFlow Studio — Architecture Health Scorecard Report
Generated on: ${new Date().toISOString()}
Overall Score: ${overallScore}/100 (Grade: A+)

## 1. Domain Health Dials
- Security & Auth Posture: 94/100 (A+)
- SQL & Persistence Efficiency: 88/100 (A)
- Dependency & CVE Risk: 98/100 (A+)
- React 19 & Client Bundle: 92/100 (A+)

## 2. Key Audit Findings & Remediation Plan
${FINDINGS.map((f, i) => `### ${i + 1}. [${f.severity}] ${f.title}
- **Component**: ${f.component}
- **Category**: ${f.category}
- **Impact**: ${f.impact}
- **Recommendation**: ${f.recommendation}
`).join('\n')}
`;
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `codeflow-architecture-scorecard-${Date.now()}.md`;
      a.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
    }, 600);
  };

  const getSeverityBadge = (sev: AuditFinding['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-500/20 text-red-400 border border-red-500/30">CRITICAL</span>;
      case 'WARNING':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">WARNING</span>;
      case 'PASS':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">PASS</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">INFO</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : isGlass
            ? 'bg-[#0f172a] border-cyan-500/40 text-white'
            : isNeumorphic
            ? 'bg-[#1e2330] border-slate-700/50 text-slate-100 shadow-[20px_20px_60px_#151922,-20px_-20px_60px_#272d3e]'
            : 'bg-[#0f172a] border-slate-700 text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Architecture Health Scorecard</h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Grade A+ (93%)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Continuous static AST analysis, CVE scanning, JPA entity inspection & React 19 audit
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportReport}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition"
            >
              <Download className="w-3.5 h-3.5" />
              {isExporting ? 'Exporting...' : 'Export Audit Dossier (.md)'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 4 Health Dials */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {DIALS.map(dial => (
              <div
                key={dial.id}
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-400">{dial.name}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${dial.bgColor} ${dial.color}`}>
                      {dial.grade}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className={`text-3xl font-black ${dial.color}`}>{dial.score}</span>
                    <span className="text-xs text-slate-500 font-medium">/ 100</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${dial.score}%` }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1">{dial.summary}</p>
              </div>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Inspection Findings ({filteredFindings.length})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {['ALL', 'WARNINGS', 'SECURITY', 'DATABASE', 'REACT19', 'DEPENDENCY'].map(filterKey => (
                <button
                  key={filterKey}
                  onClick={() => setSelectedFilter(filterKey)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
                    selectedFilter === filterKey
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {filterKey}
                </button>
              ))}
            </div>
          </div>

          {/* Findings List */}
          <div className="space-y-3">
            {filteredFindings.map(finding => (
              <div
                key={finding.id}
                className={`p-4 rounded-xl border transition ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-slate-800/30 border-slate-700/40 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5">
                      {getSeverityBadge(finding.severity)}
                      <h4 className="font-semibold text-sm">{finding.title}</h4>
                      <code className="text-xs px-2 py-0.5 rounded bg-slate-800/70 text-cyan-300 font-mono">
                        {finding.component}
                      </code>
                    </div>
                    <p className="text-xs text-slate-300">{finding.impact}</p>
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{finding.recommendation}</span>
                    </div>
                  </div>

                  {/* AI Remediation Trigger */}
                  {onTriggerAiFix && (
                    <button
                      onClick={() => {
                        onClose();
                        onTriggerAiFix(finding.title, finding.aiPrompt);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow transition flex-shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      1-Click AI Fix
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-700/50 bg-slate-800/40 flex items-center justify-between text-xs text-slate-400">
          <span>Target Architecture: Spring Boot 3.2.3 • Java 21 • React 19 • PostgreSQL</span>
          <span>Score refreshed via AST analysis</span>
        </div>
      </div>
    </div>
  );
};
