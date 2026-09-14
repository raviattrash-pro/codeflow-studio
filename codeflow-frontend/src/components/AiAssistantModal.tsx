import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  X, Sparkles, Bot, Send, ShieldCheck, Database, Layers, CheckCircle2,
  Copy, Check, Zap, Package, Code2, Cpu, Trash2, Download, Server
} from 'lucide-react';
import { DEMO_PROJECT_DATA } from '../utils/demoData';
import { ThemeMode } from './Header';
import { AiMessage, AiAnalysisType, AiProviderStatus } from '../types';

interface AiAssistantModalProps {
  projectId: string | null;
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
  initialPrompt?: string;
  initialAnalysisType?: AiAnalysisType;
}

interface AiApiResponse {
  title: string;
  explanation: string;
  keyComponents?: string[];
  recommendation?: string;
  recommendations?: string[];
}

const QUICK_AUDITS: { label: string; query: string; type: AiAnalysisType; color: string; emoji: string }[] = [
  { label: 'Architecture', emoji: '🏗️', query: 'Explain the full-stack architecture, layer boundaries, and data flow patterns', type: 'ARCHITECTURE', color: 'text-cyan-500' },
  { label: 'Security Audit', emoji: '🔐', query: 'Audit Spring Security filter chain, JWT validation, CORS policy, and authentication flow', type: 'SECURITY', color: 'text-red-500' },
  { label: 'Database Review', emoji: '🗄️', query: 'Analyze JPA entity relationships, N+1 query risks, connection pooling, and indexing strategy', type: 'DATABASE', color: 'text-amber-500' },
  { label: 'SQL Optimization', emoji: '⚡', query: 'Review captured SQL queries for performance bottlenecks, missing indexes, and query plan optimization', type: 'SQL_OPTIMIZE', color: 'text-emerald-500' },
  { label: 'Dependency Scan', emoji: '📦', query: 'Analyze Maven dependencies for version conflicts, security vulnerabilities, and upgrade recommendations', type: 'DEPENDENCY_AUDIT', color: 'text-purple-500' },
  { label: 'Code Quality', emoji: '🔍', query: 'Review code quality patterns: SOLID compliance, anti-patterns, complexity, and test coverage gaps', type: 'CODE_REVIEW', color: 'text-blue-500' },
  { label: 'API Design', emoji: '🌐', query: 'Evaluate REST API design: HTTP method semantics, status codes, pagination, and error responses', type: 'ARCHITECTURE', color: 'text-indigo-500' },
  { label: 'Interview Prep', emoji: '🎓', query: 'Generate technical interview questions covering Spring Boot lifecycle, JPA internals, React hooks', type: 'INTERVIEW', color: 'text-pink-500' },
];

const getDemoAiResponse = (queryPrompt: string, analysisType: AiAnalysisType): AiApiResponse => {
  const p = queryPrompt.toLowerCase();

  if (analysisType === 'SECURITY' || p.includes('security') || p.includes('jwt')) {
    return {
      title: '🔐 Spring Security 6.x + JWT Architectural Review',
      explanation: `**Security Filter Chain Analysis**\n\nThe application enforces stateless security using a custom JwtAuthenticationFilter registered in the SecurityFilterChain bean.\n\n**Authentication Flow:**\n- Incoming HTTP requests pass through CorsFilter → JwtAuthenticationFilter → UsernamePasswordAuthenticationFilter\n- JWT tokens are parsed from Authorization: Bearer <token> headers\n- HMAC-SHA256 signature validation against the configured secret key\n- SecurityContextHolder is populated with the authenticated principal\n\n**Key Files:**\n- SecurityConfig.java — Central filter chain definition with CORS origin mappings\n- JwtAuthenticationFilter.java — Token parsing, validation, and context population\n- AdminController.java — @CrossOrigin and @Valid input validations\n\n**⚠️ Potential Issues:**\n- CORS is configured with origins = "*" — restrict to explicit origins in production\n- No refresh token rotation mechanism detected\n- CSRF protection is disabled (acceptable for stateless JWT APIs)`,
      keyComponents: [
        'SecurityConfig.java — @Bean SecurityFilterChain with .csrf().disable() and .sessionManagement(STATELESS)',
        'JwtAuthenticationFilter.java — OncePerRequestFilter with HMAC-SHA256 token validation',
        'AdminController.java — @CrossOrigin(origins = "*") — needs production hardening',
      ],
      recommendation: 'Enable refresh token rotation, restrict CORS to explicit frontend origins, add Content-Security-Policy headers, and configure rate limiting on authentication endpoints.',
    };
  }

  if (analysisType === 'DATABASE' || p.includes('database') || p.includes('jpa') || p.includes('sql')) {
    return {
      title: '🗄️ JPA Entity & Database Schema Performance Review',
      explanation: `**Persistence Layer Architecture**\n\nDomain models map to PostgreSQL tables via Jakarta Persistence annotations. The application uses Spring Data JPA with Hibernate 6 ORM.\n\n**Entity Relationships:**\n- users (1) → (N) orders — @ManyToOne with FetchType.LAZY\n- orders (1) → (N) order_items — @OneToMany(cascade = CascadeType.ALL)\n- order_items (N) → (1) products — @ManyToOne with FetchType.EAGER\n\n**Connection Pooling:**\n- HikariCP with default pool size (10) and auto-commit disabled in transactional contexts\n\n**⚠️ Performance Risks:**\n- FetchType.EAGER on order_items → products causes N+1 SELECT problem when loading order lists\n- Missing composite index on (user_id, created_at) in the orders table\n- No @BatchSize annotation on collection mappings`,
      keyComponents: [
        'OrderRepository.java — JpaRepository with custom derived query methods',
        'orders & order_items tables — Relational schema with FK constraints',
        'HikariCP — Default pool size 10, auto-commit false in @Transactional',
      ],
      recommendation: 'Switch order_items→products to FetchType.LAZY with @EntityGraph for list queries. Add composite index on (user_id, created_at). Configure @BatchSize(size=20).',
    };
  }

  if (analysisType === 'SQL_OPTIMIZE') {
    return {
      title: '⚡ SQL Query Performance & Optimization Report',
      explanation: `**Captured Query Analysis**\n\n6 SQL statements were captured during runtime tracing.\n\n**Optimization Opportunities:**\n- SELECT * FROM orders WHERE user_id = ? (12ms) — Add index on user_id column\n- SELECT o.*, oi.* FROM orders o JOIN order_items oi — Use @EntityGraph instead of explicit JOIN\n- INSERT INTO order_items in a loop — Use saveAll() for batch inserts with spring.jpa.properties.hibernate.jdbc.batch_size=25\n\n**Query Plan Recommendations:**\n- Enable spring.jpa.show-sql=true with org.hibernate.SQL=DEBUG logging\n- Add spring.jpa.properties.hibernate.generate_statistics=true to monitor cache hit ratios`,
      keyComponents: [
        'OrderRepository.findByUserId() — Missing index on user_id (12ms → <1ms with index)',
        'Batch INSERT pattern — Loop inserts should use saveAll() with JDBC batching',
        'JOIN FETCH vs EntityGraph — Prefer @EntityGraph for cleaner N+1 resolution',
      ],
      recommendation: 'CREATE INDEX idx_orders_user_id ON orders(user_id); CREATE INDEX idx_orders_created_at ON orders(user_id, created_at DESC);',
    };
  }

  if (analysisType === 'DEPENDENCY_AUDIT') {
    return {
      title: '📦 Maven Dependency Audit & Security Scan',
      explanation: `**Dependency Analysis**\n\n8 Maven dependencies analyzed across 4 scopes.\n\n**Auto-Configuration Mechanics:**\n- spring-boot-starter-web → Embeds Tomcat 10, Jackson, Spring MVC DispatcherServlet\n- spring-boot-starter-data-jpa → Hibernate 6 ORM, HikariCP, Spring Data repositories\n- spring-boot-starter-actuator → Health, metrics, and info endpoints\n\n**Security Considerations:**\n- javaparser:3.25.8 — No known CVEs, latest stable\n- jgit:6.8.0 — Check for CVE-2023-4759 (path traversal in older versions)\n- h2:runtime — H2 console should be disabled in production\n\n**Upgrade Suggestions:**\n- Spring Boot 3.2.3 → 3.3.x (latest LTS with virtual thread improvements)\n- Consider adding spring-boot-starter-validation for @Valid/@NotNull`,
      keyComponents: [
        'spring-boot-starter-web — Tomcat 10 embedded server + Jackson JSON + Spring MVC',
        'spring-boot-starter-data-jpa — Hibernate 6 + HikariCP + Spring Data JPA',
        'jgit:6.8.0 — Git clone engine, verify no path traversal CVE exposure',
      ],
      recommendation: 'Upgrade to Spring Boot 3.3.x, add spring-boot-starter-validation, disable H2 console in production profile.',
    };
  }

  if (analysisType === 'INTERVIEW') {
    return {
      title: '🎓 Technical Interview Q&A — Spring Boot + React Full Stack',
      explanation: `**Generated Interview Questions & Expert Answers**\n\n**Q1: Explain the Spring Boot auto-configuration mechanism.**\nA: Spring Boot scans META-INF/spring/AutoConfiguration.imports at startup. Each auto-configuration class uses @ConditionalOnClass, @ConditionalOnMissingBean to decide whether to register beans.\n\n**Q2: How does @Transactional work internally?**\nA: Spring creates a CGLIB proxy. The proxy intercepts the call, obtains a JDBC connection from HikariCP, disables auto-commit, executes the method, and either commits or rolls back. Important: self-invocation bypasses the proxy.\n\n**Q3: What is React 19's useOptimistic hook?**\nA: useOptimistic allows showing an optimistic UI state while an async action is pending. It takes the current state and a reducer, returning [optimisticState, addOptimistic].\n\n**Q4: Explain N+1 SELECT problem and solutions.**\nA: When Hibernate lazy-loads a collection for N parents, it executes 1+N queries. Solutions: @EntityGraph, JOIN FETCH, @BatchSize, or DTO projections.`,
      keyComponents: [
        'Spring Boot auto-configuration — @ConditionalOnClass + @ConditionalOnMissingBean',
        '@Transactional — CGLIB proxy, HikariCP connection, commit/rollback lifecycle',
        'React 19 useOptimistic — Optimistic UI updates during async server actions',
        'N+1 SELECT — @EntityGraph, JOIN FETCH, @BatchSize, DTO projections',
      ],
      recommendation: 'Practice explaining these concepts with diagrams. Focus on the "why" behind each pattern.',
    };
  }

  return {
    title: '🌐 Full-Stack Spring Boot 3 + React 19 Architectural Assessment',
    explanation: `**Architecture Overview**\n\nClean 5-tier architecture with clear separation of concerns:\n\n**Layer 1 — React 19 SPA (Frontend)**\n- Component hierarchy: App → QueryClientProvider → Feature Pages → UI Components\n- State management via TanStack Query + React 19 useState/useOptimistic\n- Axios HTTP client with JWT injection interceptors\n\n**Layer 2 — Spring Security Gateway**\n- Stateless JWT filter chain: CorsFilter → JwtAuthenticationFilter → SecurityContextHolder\n\n**Layer 3 — @RestController Endpoints**\n- RESTful API with @GetMapping, @PostMapping, @RequestBody, @Valid\n\n**Layer 4 — @Service Business Logic**\n- @Transactional boundaries with single responsibility principle\n\n**Layer 5 — Data Access Layer**\n- Spring Data JPA + PostgreSQL 16 + HikariCP + Hibernate 6 L1/L2 cache`,
    keyComponents: [
      'React 19 SPA — Axios, TanStack Query, Tailwind CSS, Vite 8 bundling',
      'Spring Security Gateway — Stateless JWT + CORS + HMAC-SHA256',
      '@Service layer — @Transactional with ACID guarantees',
      'Spring Data JPA — JpaRepository + PostgreSQL 16 + HikariCP',
    ],
    recommendation: 'Consider adding OpenAPI/Swagger 3, Resilience4j circuit breakers, and structured logging with correlation IDs.',
  };
};

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  projectId,
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
  initialPrompt,
  initialAnalysisType,
}) => {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [providerStatus, setProviderStatus] = useState<AiProviderStatus>({ provider: 'none', model: 'demo', isConnected: false });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLight = currentTheme === 'NORMAL';
  const isGlass = currentTheme === 'GLASSMORPHISM';
  const isNeumorphic = currentTheme === 'NEUMORPHIC';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      axios.get<AiProviderStatus>('/api/v1/ai/status')
        .then(res => setProviderStatus(res.data))
        .catch(() => setProviderStatus({ provider: 'none', model: 'demo', isConnected: false }));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && initialPrompt && messages.length === 0) {
      handleSend(initialPrompt, initialAnalysisType || 'GENERAL');
    }
  }, [isOpen, initialPrompt]);

  if (!isOpen) return null;

  const handleSend = (prompt: string, analysisType: AiAnalysisType = 'GENERAL') => {
    if (!projectId || !prompt.trim()) return;

    const userMsg: AiMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt.trim(),
      timestamp: Date.now(),
      analysisType,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    if (projectId === DEMO_PROJECT_DATA.id || providerStatus.provider === 'none') {
      setTimeout(() => {
        const demo = getDemoAiResponse(prompt, analysisType);
        const assistantMsg: AiMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: formatApiResponse(demo),
          timestamp: Date.now(),
          analysisType,
        };
        setMessages(prev => [...prev, assistantMsg]);
        setLoading(false);
      }, 800 + Math.random() * 600);
      return;
    }

    axios.post<AiApiResponse>(`/api/v1/projects/${projectId}/ai/explain`, {
      prompt: prompt.trim(),
      analysisType,
    })
      .then(res => {
        const assistantMsg: AiMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: formatApiResponse(res.data),
          timestamp: Date.now(),
          analysisType,
        };
        setMessages(prev => [...prev, assistantMsg]);
      })
      .catch(() => {
        const demo = getDemoAiResponse(prompt, analysisType);
        const assistantMsg: AiMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: formatApiResponse(demo),
          timestamp: Date.now(),
          analysisType,
        };
        setMessages(prev => [...prev, assistantMsg]);
      })
      .finally(() => setLoading(false));
  };

  const formatApiResponse = (resp: AiApiResponse): string => {
    let text = '';
    if (resp.title) text += `## ${resp.title}\n\n`;
    if (resp.explanation) text += resp.explanation + '\n';
    if (resp.keyComponents && resp.keyComponents.length > 0) {
      text += '\n**Key Components:**\n';
      resp.keyComponents.forEach(c => { text += `- ${c}\n`; });
    }
    const rec = resp.recommendation || (resp.recommendations && resp.recommendations.length > 0 ? resp.recommendations.join('. ') : '');
    if (rec) {
      text += `\n**💡 Recommendation:** ${rec}\n`;
    }
    return text;
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => setMessages([]);

  const handleExportMarkdown = () => {
    const md = messages.map(m =>
      m.role === 'user'
        ? `### 🧑 User\n${m.content}\n`
        : `### 🤖 AI Assistant\n${m.content}\n`
    ).join('\n---\n\n');
    const blob = new Blob([`# CodeFlow Studio — AI Architecture Analysis\n\n${md}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'codeflow-ai-analysis.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('## ')) {
        return <h3 key={i} className={`text-sm font-bold mt-3 mb-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{line.slice(3)}</h3>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className={`text-xs font-bold mt-2.5 mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{line.slice(2, -2)}</p>;
      }
      if (line.startsWith('- ')) {
        return (
          <div key={i} className="flex items-start space-x-2 pl-2 py-0.5">
            <span className="text-cyan-500 mt-0.5 shrink-0">▹</span>
            <span className={`text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{renderInline(line.slice(2))}</span>
          </div>
        );
      }
      if (line.trim() === '') return <div key={i} className="h-1.5" />;
      return <p key={i} className={`text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{renderInline(line)}</p>;
    });
  };

  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const providerBadge = providerStatus.provider === 'none'
    ? { label: 'Demo Mode', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' }
    : providerStatus.provider === 'gemini'
    ? { label: `Gemini · ${providerStatus.model}`, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' }
    : providerStatus.provider === 'openai'
    ? { label: `OpenAI · ${providerStatus.model}`, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
    : { label: `Ollama · ${providerStatus.model}`, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal-pop-in w-full max-w-4xl h-[90vh] max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : isGlass
            ? 'glass-modal border-slate-700/80 text-white'
            : isNeumorphic
            ? 'neumorphic-card border-slate-700 text-slate-100'
            : 'bg-[#0b0f19] border-slate-800 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
          isLight ? 'bg-slate-50/95 border-slate-200' : 'bg-slate-950/90 border-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-950/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className={`text-base font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  AI Architecture Intelligence
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${providerBadge.color}`}>
                  {providerBadge.label}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Deep codebase analysis powered by RAG context injection from your parsed AST
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            {messages.length > 0 && (
              <>
                <button onClick={handleExportMarkdown} className={`p-2 rounded-xl transition-all ${isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400'}`} title="Export as Markdown">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={handleClearChat} className={`p-2 rounded-xl transition-all ${isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400'}`} title="Clear conversation">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button onClick={onClose} className={`p-2 rounded-xl transition-all ${isLight ? 'hover:bg-slate-200 text-slate-500 hover:text-slate-900' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Thread */}
        <div className={`flex-1 min-h-0 overflow-y-auto custom-scrollbar ${isLight ? 'bg-slate-100/50' : 'bg-slate-950/30'}`}>
          {messages.length === 0 ? (
            <div className="p-6 space-y-6">
              <div className="text-center pt-8 pb-4">
                <div className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center mb-4 ${
                  isLight ? 'bg-purple-100 text-purple-600' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                }`}>
                  <Bot className="w-8 h-8" />
                </div>
                <h4 className={`text-lg font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Ask anything about your codebase
                </h4>
                <p className={`text-xs mt-1.5 max-w-md mx-auto ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  AI analyzes your parsed Spring Boot controllers, JPA entities, security configs, and React components to provide context-aware insights.
                </p>
              </div>

              <div>
                <span className={`text-xs font-bold uppercase tracking-wider block mb-3 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  ⚡ Quick Architecture Audits
                </span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {QUICK_AUDITS.map((audit, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(audit.query, audit.type)}
                      className={`p-3.5 rounded-2xl border text-left transition-all group ${
                        isLight
                          ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-purple-300 shadow-sm hover:shadow-md'
                          : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 hover:border-purple-500/40'
                      }`}
                    >
                      <div className={`flex items-center space-x-1.5 font-bold text-xs mb-1 ${audit.color}`}>
                        <span>{audit.emoji}</span>
                        <span>{audit.label}</span>
                      </div>
                      <p className={`text-[10px] line-clamp-2 leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {audit.query.slice(0, 65)}...
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${isLight ? 'bg-cyan-50/50 border-cyan-200' : 'bg-cyan-950/20 border-cyan-500/20'}`}>
                <div className="flex items-center flex-wrap gap-4 text-xs">
                  {[
                    { icon: '🔍', text: 'RAG Context from AST' },
                    { icon: '🛡️', text: 'Security Scan' },
                    { icon: '⚡', text: 'SQL Optimization' },
                    { icon: '📝', text: 'Export as Markdown' },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center space-x-1.5">
                      <span>{f.icon}</span>
                      <span className={`font-mono ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-5">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                    msg.role === 'user'
                      ? isLight
                        ? 'bg-indigo-600 text-white rounded-br-md shadow-md shadow-indigo-200'
                        : 'bg-indigo-600/90 text-white rounded-br-md shadow-lg shadow-indigo-950/50'
                      : isLight
                      ? 'bg-white border border-slate-200 rounded-bl-md shadow-sm'
                      : 'bg-slate-900/90 border border-slate-800 rounded-bl-md shadow-lg'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="text-xs leading-relaxed font-sans">{msg.content}</p>
                    ) : (
                      <div>
                        {renderContent(msg.content)}
                        <div className={`flex items-center justify-end mt-3 pt-2 space-x-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-700/30'}`}>
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                              isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className={`px-5 py-4 rounded-2xl rounded-bl-md ${
                    isLight ? 'bg-white border border-slate-200' : 'bg-slate-900/90 border border-slate-800'
                  }`}>
                    <div className="flex items-center space-x-2.5">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Analyzing codebase context...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className={`p-4 border-t shrink-0 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
          {messages.length > 0 && messages.length < 12 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                'Deep dive into security vulnerabilities',
                'Generate unit test scaffolding',
                'Show database optimization SQL',
                'Explain the @Transactional lifecycle',
              ].map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(chip)}
                  disabled={loading}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-mono border transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-purple-950/30 hover:border-purple-500/30 hover:text-purple-300'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) handleSend(input);
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask about controllers, JPA entities, security config, React hooks, optimization..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className={`flex-1 px-4 py-3 rounded-2xl border text-xs outline-none transition-all ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-purple-500 placeholder-slate-400 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-100 focus:border-purple-500 placeholder-slate-500'
              }`}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white text-xs font-bold font-mono flex items-center space-x-1.5 transition-all shadow-lg shadow-purple-900/30"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
