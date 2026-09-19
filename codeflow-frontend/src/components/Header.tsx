import React from 'react';
import { X, Sun, Moon, GitBranch } from 'lucide-react';
import { ProjectNode } from '../types';

export type ThemeMode = 'NIGHT' | 'NORMAL' | 'NEUMORPHIC' | 'GLASSMORPHISM';

interface HeaderProps {
  currentProjectName?: string;
  currentProjectId?: string | null;
  onLoadDemo?: () => void;
  onOpenIngestModal: () => void;
  onOpenDependencies: () => void;
  onOpenSqlExplorer: () => void;
  onOpenAiAssistant: () => void;
  onOpenErDiagram: () => void;
  onOpenSecurityFlow: () => void;
  onOpenFileTree: () => void;
  onOpenRuntimeTracing?: () => void;
  onOpenApiMetrics?: () => void;
  onOpenSequenceDiagram?: () => void;
  onOpenLatencyHeatmap?: () => void;
  onOpenReactRuntime?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenScorecard?: () => void;
  onOpenApiSandbox?: () => void;
  onOpenTsGenerator?: () => void;
  onOpenChaos?: () => void;
  onOpenBlueprint?: () => void;
  onOpenVoiceCopilot?: () => void;
  onOpenDrift?: () => void;
  onOpenTestGen?: () => void;
  onOpenCloudInfra?: () => void;
  onOpenEventStream?: () => void;
  onOpenDistTracing?: () => void;
  onOpenVsCode?: () => void;
  onOpenChromeExt?: () => void;
  onOpenLiveCollab?: () => void;
  onOpenCompliance?: () => void;
  onOpenGraphqlGrpc?: () => void;
  onOpenServiceMesh?: () => void;
  onExportMarkdown: () => void;
  onExitProject: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchResults?: ProjectNode[];
  onSelectSearchResult?: (nodeId: string) => void;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProjectName,
  currentProjectId,
  onLoadDemo,
  onOpenIngestModal,
  onOpenDependencies,
  onOpenSqlExplorer,
  onOpenAiAssistant,
  onOpenErDiagram,
  onOpenFileTree,
  onExitProject,
  searchQuery,
  onSearchChange,
  currentTheme,
  onThemeChange,
}) => {
  const isLight = currentTheme === 'NORMAL' || currentTheme === 'GLASSMORPHISM' || currentTheme === 'NEUMORPHIC';

  const toggleTheme = () => {
    if (currentTheme === 'NIGHT') onThemeChange('NORMAL');
    else if (currentTheme === 'NORMAL') onThemeChange('NEUMORPHIC');
    else if (currentTheme === 'NEUMORPHIC') onThemeChange('GLASSMORPHISM');
    else onThemeChange('NIGHT');
  };

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className={`h-14 px-4 sm:px-8 border-b-2 flex items-center justify-between sticky top-0 shrink-0 z-50 transition-colors ${
      isLight ? 'bg-[#ece2fa] border-black text-slate-900' : 'bg-[#090d16] border-slate-800 text-slate-100'
    }`}>
      {/* Brand Title - Clicking navigates to Home */}
      <div className="flex items-center cursor-pointer" onClick={onExitProject} title="Go to Home">
        <span className="text-xl sm:text-2xl font-black font-sans tracking-tight text-purple-700 dark:text-purple-400">
          Code
        </span>
        <span className="text-xl sm:text-2xl font-black font-sans tracking-tight text-slate-900 dark:text-white">
          Flow
        </span>
      </div>

      {/* Desktop Nav Links */}
      <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
        <button
          onClick={onOpenFileTree}
          className={`transition cursor-pointer ${isLight ? 'text-slate-800 hover:text-purple-700' : 'text-slate-300 hover:text-purple-400'}`}
        >
          Browse
        </button>

        <button
          onClick={onOpenAiAssistant}
          className={`transition cursor-pointer ${isLight ? 'text-slate-800 hover:text-purple-700' : 'text-slate-300 hover:text-purple-400'}`}
        >
          API Key
        </button>

        <button
          onClick={onOpenIngestModal}
          className={`transition cursor-pointer ${isLight ? 'text-slate-800 hover:text-purple-700' : 'text-slate-300 hover:text-purple-400'}`}
        >
          Private Repos
        </button>

        <button
          onClick={toggleTheme}
          className={`transition cursor-pointer ${isLight ? 'text-slate-800 hover:text-purple-700' : 'text-slate-300 hover:text-purple-400'}`}
        >
          {isLight ? 'Dark' : 'Light'}
        </button>

        <a
          href="https://github.com/raviattrash-pro/codeflow-studio"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-1.5 transition cursor-pointer ${isLight ? 'text-slate-800 hover:text-purple-700' : 'text-slate-300 hover:text-purple-400'}`}
        >
          <GitBranch className="w-4 h-4" />
          <span>GitHub</span>
          <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded font-bold ${
            isLight ? 'bg-purple-100 text-purple-800' : 'bg-purple-950 text-purple-300'
          }`}>★ 16.6k</span>
        </a>

        {currentProjectId && (
          <button
            onClick={onExitProject}
            className="p-1 rounded-full text-rose-500 hover:bg-rose-500/10 transition cursor-pointer ml-1"
            title="Exit Project"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile Nav Controls */}
      <div className="flex md:hidden items-center gap-2">
        <button
          onClick={toggleTheme}
          className="text-xs font-bold px-2 py-1 rounded-md border border-slate-400 dark:border-slate-700"
        >
          {isLight ? 'Dark' : 'Light'}
        </button>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg border border-slate-400 dark:border-slate-700 text-slate-900 dark:text-white"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className={`absolute top-full left-0 right-0 p-4 border-b-2 z-50 flex flex-col gap-3 shadow-xl md:hidden ${
          isLight ? 'bg-[#f4effa] border-black text-slate-900' : 'bg-[#090d16] border-slate-800 text-slate-100'
        }`}>
          <button
            onClick={() => { onOpenFileTree(); setMobileMenuOpen(false); }}
            className="text-left font-bold py-1.5 px-3 rounded-lg hover:bg-purple-100 dark:hover:bg-slate-800"
          >
            Browse Code Tree
          </button>
          <button
            onClick={() => { onOpenAiAssistant(); setMobileMenuOpen(false); }}
            className="text-left font-bold py-1.5 px-3 rounded-lg hover:bg-purple-100 dark:hover:bg-slate-800"
          >
            API Key & Copilot
          </button>
          <button
            onClick={() => { onOpenIngestModal(); setMobileMenuOpen(false); }}
            className="text-left font-bold py-1.5 px-3 rounded-lg hover:bg-purple-100 dark:hover:bg-slate-800"
          >
            Import Repository
          </button>
          <a
            href="https://github.com/raviattrash-pro/codeflow-studio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between font-bold py-1.5 px-3 rounded-lg hover:bg-purple-100 dark:hover:bg-slate-800"
          >
            <span className="flex items-center gap-2"><GitBranch className="w-4 h-4" /> GitHub</span>
            <span className="text-xs font-mono bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded">★ 16.6k</span>
          </a>
          {currentProjectId && (
            <button
              onClick={() => { onExitProject(); setMobileMenuOpen(false); }}
              className="text-left font-bold py-1.5 px-3 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40"
            >
              Exit Project Workspace
            </button>
          )}
        </div>
      )}
    </header>
  );
};
