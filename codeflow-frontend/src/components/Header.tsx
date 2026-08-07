import React from 'react';
import { Layers, GitBranch, Upload, Search, Package, Database, Bot, X } from 'lucide-react';
import { ProjectNode } from '../types';

interface HeaderProps {
  currentProjectName?: string;
  currentProjectId?: string | null;
  onOpenIngestModal: () => void;
  onOpenDependencies: () => void;
  onOpenSqlExplorer: () => void;
  onOpenAiAssistant: () => void;
  onExitProject: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchResults?: ProjectNode[];
  onSelectSearchResult?: (nodeId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProjectName,
  currentProjectId,
  onOpenIngestModal,
  onOpenDependencies,
  onOpenSqlExplorer,
  onOpenAiAssistant,
  onExitProject,
  searchQuery,
  onSearchChange,
  searchResults,
  onSelectSearchResult,
}) => {
  return (
    <header className="h-16 glass-panel border-b border-slate-800 px-6 flex items-center justify-between z-30 sticky top-0 relative bg-slate-950/90 backdrop-blur-md">
      {/* Brand Logo & Title */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Layers className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
              CodeFlow Studio
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
              v2.0 Upgrade
            </span>
          </div>
          <p className="text-xs text-slate-400">Google Maps for Source Code</p>
        </div>
      </div>

      {/* Global Search Input */}
      <div className="flex-1 max-w-md mx-8 relative">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Controllers, Services, Repos, Endpoints... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Search Results Dropdown */}
        {searchResults && searchResults.length > 0 && currentProjectId && (
          <div className="absolute top-full mt-2 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
            {searchResults.map((node) => (
              <button
                key={node.id}
                onClick={() => onSelectSearchResult?.(node.id)}
                className="w-full text-left px-4 py-3 border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors flex flex-col"
              >
                <span className="text-sm font-semibold text-slate-200">{node.label}</span>
                <span className="text-xs text-slate-400 mt-1">{node.nodeType}</span>
                {node.filePath && (
                  <span className="text-xs text-slate-500 mt-1 truncate">{node.filePath}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {currentProjectName && (
          <>
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300">
              <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-slate-200">{currentProjectName}</span>
            </div>

            <button
              onClick={onOpenSqlExplorer}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-semibold text-amber-300 transition-all"
            >
              <Database className="w-3.5 h-3.5" />
              <span>SQL Explorer</span>
            </button>

            <button
              onClick={onOpenAiAssistant}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-600/30 to-purple-600/30 hover:from-pink-600/50 hover:to-purple-600/50 border border-pink-500/30 text-xs font-semibold text-pink-200 transition-all"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Assistant</span>
            </button>

            <button
              onClick={onExitProject}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-medium text-red-400 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              <span>Exit Project</span>
            </button>
          </>
        )}

        {currentProjectId && (
          <button
            onClick={onOpenDependencies}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-all"
          >
            <Package className="w-3.5 h-3.5 text-purple-400" />
            <span>Dependencies</span>
          </button>
        )}

        <button
          onClick={onOpenIngestModal}
          className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-all"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Import Project</span>
        </button>
      </div>
    </header>
  );
};
