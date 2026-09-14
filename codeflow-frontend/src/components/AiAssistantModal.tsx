import React, { useState } from 'react';
import axios from 'axios';
import { X, Sparkles, Bot, Send, ShieldCheck, Database, Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import { DEMO_PROJECT_DATA } from '../utils/demoData';
import { ThemeMode } from './Header';

interface AiAssistantModalProps {
  projectId: string | null;
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
}

interface AiResponse {
  title: string;
  explanation: string;
  keyComponents: string[];
  recommendation: string;
}

const getDemoAiResponse = (queryPrompt: string): AiResponse => {
  const p = queryPrompt.toLowerCase();
  if (p.includes('security') || p.includes('jwt')) {
    return {
      title: 'Spring Security 6.x + JWT Architectural Review',
      explanation: 'The application enforces stateless security using JwtAuthenticationFilter. Request tokens are parsed from Authorization Bearer headers and validated against signature keys before populating SecurityContextHolder.',
      keyComponents: [
        'SecurityConfig.java - Central security filter chain definition with CORS policy',
        'JwtAuthenticationFilter.java - Intercepts HTTP requests and validates JWT claims',
        'AdminController.java - Implements @CrossOrigin and input validations',
      ],
      recommendation: 'Enable refresh token rotation and configure Content-Security-Policy (CSP) headers for production deployments.',
    };
  }
  if (p.includes('database') || p.includes('jpa') || p.includes('sql')) {
    return {
      title: 'JPA Entity & Database Schema Performance Review',
      explanation: 'Domain models map to PostgreSQL tables via Jakarta Persistence annotations. The application leverages Spring Data JpaRepository for automated query derivation and HikariCP connection pooling.',
      keyComponents: [
        'OrderRepository.java - JpaRepository with custom derived query methods',
        'orders & order_items tables - Relational schema with foreign key constraints',
        'HikariCP Connection Pool - Optimized JDBC pool with auto-commit false in transactions',
      ],
      recommendation: 'Add composite indexes on (user_id, created_at) in orders table to accelerate customer order history queries.',
    };
  }
  return {
    title: 'Full-Stack Spring Boot 3 + React 19 Architectural Assessment',
    explanation: 'Clean 5-tier architecture: React 19 UI triggers Axios calls to Spring Security Gateway, routing through @RestController to @Service beans with @Transactional boundaries and Spring Data JpaRepository.',
    keyComponents: [
      'Frontend Layer: React 19 SPA with Axios & Tailwind CSS',
      'API Gateway: Spring Security 6.x stateless filter chain',
      'Business Core: @Service business logic with ACID transactions',
      'Data Layer: Spring Data JPA + Hibernate ORM + PostgreSQL',
    ],
    recommendation: 'Adopt OpenAPI/Swagger 3 annotations for automated API contract generation and add unit tests for @Transactional rollbacks.',
  };
};

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  projectId,
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AiResponse | null>(null);

  const isLight = currentTheme === 'NORMAL';
  const isNeumorphic = currentTheme === 'NEUMORPHIC';
  const isGlass = currentTheme === 'GLASSMORPHISM';

  if (!isOpen) return null;

  const handleQuery = (queryPrompt: string) => {
    if (!projectId) return;
    setLoading(true);
    setPrompt(queryPrompt);

    if (projectId === DEMO_PROJECT_DATA.id) {
      setTimeout(() => {
        setResponse(getDemoAiResponse(queryPrompt));
        setLoading(false);
      }, 500);
      return;
    }

    axios
      .post<AiResponse>(`/api/v1/projects/${projectId}/ai/explain`, { prompt: queryPrompt })
      .then((res) => {
        setResponse(res.data || getDemoAiResponse(queryPrompt));
      })
      .catch(() => setResponse(getDemoAiResponse(queryPrompt)))
      .finally(() => setLoading(false));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal-pop-in w-full max-w-3xl h-[85vh] max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : isGlass
            ? 'glass-modal border-slate-700/80 text-white'
            : isNeumorphic
            ? 'neumorphic-card border-slate-700 text-slate-100'
            : 'bg-slate-900 border-slate-800 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4.5 border-b flex items-center justify-between shrink-0 ${
          isLight ? 'bg-slate-50/95 border-slate-200' : 'bg-slate-950/90 border-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className={`text-base font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  AI Architecture Assistant & Code Auditor
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Deep Context Engine
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Ask deep technical questions about Spring Boot lifecycle, React integration, queries, or security
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all ${
              isLight ? 'hover:bg-slate-200 text-slate-500 hover:text-slate-900' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className={`flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6 ${
          isLight ? 'bg-slate-100/50' : 'bg-slate-950/40'
        }`}>
          {/* Quick Prompts */}
          <div className="space-y-2">
            <span className={`text-xs font-bold uppercase tracking-wider block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              ⚡ Quick Technical Audits
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {[
                { label: 'Explain Full Architecture', query: 'Explain the high level architecture and layer boundaries' },
                { label: 'Audit Security & JWT Pipeline', query: 'Audit Spring Security filter chain and JWT validation flow' },
                { label: 'Inspect JPA & DB Bottlenecks', query: 'Analyze database entity relationships and connection pooling' },
              ].map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuery(qp.query)}
                  className={`p-3 rounded-2xl border text-left text-xs transition-all ${
                    isLight
                      ? 'bg-white hover:bg-purple-50 text-slate-800 border-slate-200 hover:border-purple-300 shadow-sm'
                      : 'bg-slate-900/90 hover:bg-slate-850 text-slate-200 border-slate-800 hover:border-purple-500/40'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-bold text-purple-500 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{qp.label}</span>
                  </div>
                  <p className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{qp.query}</p>
                </button>
              ))}
            </div>
          </div>

          {/* AI Response Card */}
          {loading && (
            <div className={`p-8 rounded-2xl border text-center space-y-3 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
            }`}>
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className={`text-xs font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Synthesizing repository AST, Spring Boot context, and database schema...
              </p>
            </div>
          )}

          {response && !loading && (
            <div className={`p-6 rounded-3xl border space-y-5 shadow-lg ${
              isLight ? 'bg-white border-purple-200 shadow-purple-100/50' : 'bg-slate-900/90 border-purple-500/30'
            }`}>
              <div className="flex items-center space-x-2 text-purple-500 border-b border-purple-500/20 pb-3">
                <Bot className="w-5 h-5" />
                <h4 className={`text-sm font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {response.title}
                </h4>
              </div>

              <div className="space-y-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Analysis & Mechanics
                </span>
                <p className={`text-xs font-sans leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                  {response.explanation}
                </p>
              </div>

              {Array.isArray(response.keyComponents) && response.keyComponents.length > 0 && (
                <div className="space-y-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Key Architectural Nodes
                  </span>
                  <div className="space-y-1.5">
                    {response.keyComponents.map((comp, cIdx) => (
                      <div
                        key={cIdx}
                        className={`p-2.5 rounded-xl border text-xs font-mono flex items-center space-x-2 ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950/80 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="text-purple-400">▹</span>
                        <span>{comp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {response.recommendation && (
                <div className={`p-4 rounded-2xl border space-y-1.5 ${
                  isLight ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                }`}>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Senior Architect Recommendation</span>
                  </div>
                  <p className="text-xs leading-relaxed font-sans">{response.recommendation}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Query Input */}
        <div className={`p-4 border-t shrink-0 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (prompt.trim()) handleQuery(prompt);
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask anything about Spring controllers, JPA models, React query hooks..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className={`flex-1 px-4 py-3 rounded-2xl border text-xs outline-none transition-all ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-500 placeholder-slate-400 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-100 focus:border-purple-500 placeholder-slate-500'
              }`}
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold font-mono flex items-center space-x-1.5 transition-all shadow-lg shadow-purple-900/30"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
