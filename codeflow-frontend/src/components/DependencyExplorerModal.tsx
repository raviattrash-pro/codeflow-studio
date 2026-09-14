import React, { useEffect, useState } from 'react';
import { X, Package, Search, HelpCircle, Code, ExternalLink, Sparkles, BookOpen, CheckCircle2, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { ProjectDependency } from '../types';
import { DEMO_DEPENDENCIES, DEMO_PROJECT_DATA } from '../utils/demoData';
import { ThemeMode } from './Header';

interface DependencyExplorerModalProps {
  projectId: string | null;
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
}

interface DetailedDepInfo {
  purpose: string;
  benefits: string[];
  internalWorking: string;
  interviewQuestions: { question: string; answer: string }[];
  docsUrl: string;
}

const STARTER_METADATA: Record<string, DetailedDepInfo> = {
  'spring-boot-starter-web': {
    purpose: 'Starter for building web applications, including RESTful applications using Spring MVC. Uses Tomcat as the embedded container.',
    benefits: [
      'Provides Spring MVC DispatcherServlet out-of-the-box',
      'Embedded Tomcat web server (no external WAR deployment required)',
      'Jackson ObjectMapper for automated JSON serialization/deserialization',
      'Hibernate Validator for DTO payload validation (@Valid)'
    ],
    internalWorking: 'Spring Boot @EnableAutoConfiguration scans classpath for Servlet & DispatcherServlet classes. WebMvcAutoConfiguration automatically configures RequestMappingHandlerMapping and registers default Jackson JSON converters.',
    interviewQuestions: [
      {
        question: 'What is the internal execution flow of Spring MVC when a request hits DispatcherServlet?',
        answer: 'DispatcherServlet intercepts request -> queries RequestMappingHandlerMapping to locate handler method -> invokes RequestMappingHandlerAdapter -> executes controller -> serializes return DTO using HttpMessageConverter.'
      },
      {
        question: 'How do you replace embedded Tomcat with Undertow or Jetty in Spring Boot?',
        answer: 'Exclude spring-boot-starter-tomcat dependency from spring-boot-starter-web in pom.xml and declare spring-boot-starter-undertow instead.'
      }
    ],
    docsUrl: 'https://docs.spring.io/spring-boot/docs/current/reference/html/web.html'
  },
  'spring-boot-starter-data-jpa': {
    purpose: 'Starter for using Spring Data JPA with Hibernate ORM to manage relational database persistence.',
    benefits: [
      'Automatic repository interface generation from entity method names (JpaRepository)',
      'Hibernate ORM session management and L1/L2 cache',
      'Declarative transaction management (@Transactional)',
      'HikariCP high-performance connection pool'
    ],
    internalWorking: 'JpaRepositoriesAutoConfiguration imports HibernateJpaAutoConfiguration. Enables PartTreeJpaQuery parsing to build CriteriaQuery ASTs directly from method names at startup.',
    interviewQuestions: [
      {
        question: 'What is the N+1 select problem in JPA and how do you resolve it?',
        answer: 'N+1 occurs when querying N parent entities causes N additional queries for lazy child associations. Resolved using JOIN FETCH or @EntityGraph.'
      },
      {
        question: 'How does Spring Data JPA create repository implementations without concrete classes?',
        answer: 'Spring uses JDK Dynamic Proxies around JpaRepository interfaces, delegating calls to SimpleJpaRepository implementation.'
      }
    ],
    docsUrl: 'https://spring.io/projects/spring-data-jpa'
  },
  'spring-boot-starter-security': {
    purpose: 'Starter for using Spring Security to secure web applications with stateless JWT authentication & RBAC authorization.',
    benefits: [
      'Stateless SecurityFilterChain with ordered filters',
      'BCryptPasswordEncoder password hashing',
      'Method-level security (@PreAuthorize, @Secured)',
      'CSRF and CORS configuration filters'
    ],
    internalWorking: 'SecurityAutoConfiguration registers DelegatingFilterProxy to forward servlet filters to FilterChainProxy. Evaluates AuthenticatedPrincipal and GrantedAuthority tokens.',
    interviewQuestions: [
      {
        question: 'How do you configure stateless JWT authentication filter in Spring Security 6?',
        answer: 'Define SecurityFilterChain @Bean, disable SessionCreationPolicy.STATELESS, and register custom JwtAuthenticationFilter before UsernamePasswordAuthenticationFilter.'
      }
    ],
    docsUrl: 'https://spring.io/projects/spring-security'
  }
};

export const DependencyExplorerModal: React.FC<DependencyExplorerModalProps> = ({
  projectId,
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
}) => {
  const [dependencies, setDependencies] = useState<ProjectDependency[]>([]);
  const [selectedDep, setSelectedDep] = useState<ProjectDependency | null>(null);
  const [filter, setFilter] = useState('');

  const isLight = currentTheme === 'NORMAL' || currentTheme === 'GLASSMORPHISM' || currentTheme === 'NEUMORPHIC';

  useEffect(() => {
    if (!projectId || !isOpen) return;

    if (projectId === DEMO_PROJECT_DATA.id) {
      setDependencies(DEMO_DEPENDENCIES);
      if (DEMO_DEPENDENCIES.length > 0) setSelectedDep(DEMO_DEPENDENCIES[0]);
      return;
    }

    axios
      .get<ProjectDependency[]>(`/api/v1/projects/${projectId}/dependencies`)
      .then((res) => {
        const deps = Array.isArray(res.data) && res.data.length > 0 ? res.data : DEMO_DEPENDENCIES;
        setDependencies(deps);
        if (deps.length > 0) setSelectedDep(deps[0]);
      })
      .catch(() => {
        setDependencies(DEMO_DEPENDENCIES);
        if (DEMO_DEPENDENCIES.length > 0) setSelectedDep(DEMO_DEPENDENCIES[0]);
      });
  }, [projectId, isOpen]);

  if (!isOpen) return null;

  const filteredDeps = (Array.isArray(dependencies) ? dependencies : []).filter(
    (d) =>
      (d.artifactId || '').toLowerCase().includes((filter || '').toLowerCase()) ||
      (d.groupId || '').toLowerCase().includes((filter || '').toLowerCase())
  );

  const activeMeta = selectedDep ? STARTER_METADATA[selectedDep.artifactId] || {
    purpose: selectedDep.purposeSummary || 'Spring Boot starter library providing pre-configured auto-configuration beans.',
    benefits: ['Simplifies Maven dependency management', 'Includes production-ready default configurations'],
    internalWorking: `Spring Boot Auto-configuration scans ${selectedDep.artifactId} jar for META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports.`,
    interviewQuestions: [
      {
        question: `Why is ${selectedDep.artifactId} included in this project?`,
        answer: `It provides essential runtime classes and auto-configuration for ${selectedDep.artifactId}.`
      }
    ],
    docsUrl: 'https://spring.io/projects/spring-boot'
  } : null;

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
        className={`modal-pop-in w-full max-w-5xl h-[85vh] max-h-[85vh] rounded-3xl border shadow-2xl overflow-hidden flex flex-col my-auto font-mono ${getModalBg()}`}
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 999999 }}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080c16] border-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>Project Dependency Explorer</h3>
              <p className="text-xs text-slate-400 font-mono">Parsed Spring Boot Starters, Internal Working &amp; Interview Guides</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-all ${isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* Left Dependency List */}
          <div className={`w-80 border-r flex flex-col shrink-0 ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950'
          }`}>
            <div className={`p-3 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter dependencies..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className={`w-full border rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono focus:outline-none ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                      : 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
              {filteredDeps.map((dep) => {
                const isSelected = selectedDep?.id === dep.id;
                return (
                  <div
                    key={dep.id}
                    onClick={() => setSelectedDep(dep)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border font-mono text-xs flex items-center justify-between ${
                      isSelected
                        ? (isLight ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold' : 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200 font-bold')
                        : (isLight ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100' : 'border-slate-800/60 bg-slate-900/40 text-slate-300 hover:bg-slate-800/50')
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className={`truncate font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{dep.artifactId}</div>
                      <div className="text-[10px] text-slate-400 truncate">{dep.groupId}</div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-500' : 'text-slate-400'}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Detailed Inspector */}
          {selectedDep && activeMeta && (
            <div className={`flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 font-sans ${
              isLight ? 'bg-white' : 'bg-slate-900/50'
            }`}>
              <div className={`p-5 rounded-2xl border space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-base font-bold ${isLight ? 'text-indigo-700' : 'text-indigo-300'}`}>{selectedDep.artifactId}</span>
                  <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 font-bold">
                    {selectedDep.scope || 'compile'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">{selectedDep.groupId}</p>
                <p className={`text-sm mt-2 leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>{activeMeta.purpose}</p>

                {activeMeta.docsUrl && (
                  <a
                    href={activeMeta.docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs text-indigo-500 hover:text-indigo-600 font-mono mt-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Official Spring Documentation</span>
                  </a>
                )}
              </div>

              {/* Benefits */}
              {activeMeta.benefits.length > 0 && (
                <div className={`p-5 rounded-2xl border space-y-2 ${
                  isLight ? 'bg-emerald-50/50 border-emerald-200/60' : 'bg-indigo-950/20 border-indigo-500/20'
                }`}>
                  <span className={`text-xs font-bold uppercase tracking-wider block font-mono ${isLight ? 'text-emerald-800' : 'text-indigo-400'}`}>
                    Key Features &amp; Benefits
                  </span>
                  <div className="space-y-1.5">
                    {activeMeta.benefits.map((b, i) => (
                      <div key={i} className={`flex items-start space-x-2 text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Internal Working */}
              <div className={`p-5 rounded-2xl border space-y-2 ${
                isLight ? 'bg-indigo-50/50 border-indigo-200/60' : 'bg-purple-950/20 border-purple-500/20'
              }`}>
                <span className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 font-mono ${isLight ? 'text-indigo-800' : 'text-purple-400'}`}>
                  <Sparkles className="w-4 h-4" />
                  <span>Internal Working &amp; Auto-Configuration</span>
                </span>
                <p className={`text-xs leading-relaxed font-mono ${isLight ? 'text-slate-700' : 'text-purple-200/90'}`}>{activeMeta.internalWorking}</p>
              </div>

              {/* Interview Q&A */}
              {activeMeta.interviewQuestions.length > 0 && (
                <div className="space-y-3">
                  <span className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 font-mono ${isLight ? 'text-indigo-800' : 'text-indigo-400'}`}>
                    <BookOpen className="w-4 h-4" />
                    <span>Common Interview Questions &amp; Answers</span>
                  </span>
                  <div className="space-y-3">
                    {activeMeta.interviewQuestions.map((qa, i) => (
                      <div key={i} className={`p-4 rounded-2xl border space-y-2 text-xs ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                      }`}>
                        <p className={`font-bold ${isLight ? 'text-indigo-900' : 'text-indigo-300'}`}>Q: {qa.question}</p>
                        <p className={`leading-relaxed pt-2 border-t ${isLight ? 'border-slate-200 text-slate-700' : 'border-slate-800 text-slate-300'}`}>
                          <span className="font-bold text-emerald-500">Answer: </span>
                          {qa.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
