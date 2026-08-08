import React, { useState, useRef, useEffect } from 'react';
import { Layers, Search, Database, ShieldCheck, Bot, Package, Download, X, FolderTree, Menu, Import, LogOut, ChevronDown } from 'lucide-react';
import { ProjectNode } from '../types';

interface HeaderProps {
  currentProjectName?: string;
  currentProjectId?: string | null;
  onOpenIngestModal: () => void;
  onOpenDependencies: () => void;
  onOpenSqlExplorer: () => void;
  onOpenAiAssistant: () => void;
  onOpenErDiagram: () => void;
  onOpenSecurityFlow: () => void;
  onOpenFileTree: () => void;
  onExportMarkdown: () => void;
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
  onOpenErDiagram,
  onOpenSecurityFlow,
  onOpenFileTree,
  onExportMarkdown,
  onExitProject,
  searchQuery,
  onSearchChange,
  searchResults,
  onSelectSearchResult,
}) => {
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className="h-16 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 shrink-0"
      style={{ backgroundColor: '#090d16', zIndex: 99999 }}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-sm md:text-lg bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
            CodeFlow Studio
          </h1>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-4 relative hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Controllers, Services..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        {searchResults && searchResults.length > 0 && currentProjectId && (
          <div
            className="absolute top-full mt-2 w-full border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto"
            style={{ backgroundColor: '#0f172a', zIndex: 999999 }}
          >
            {searchResults.map((node) => (
              <button
                key={node.id}
                onClick={() => onSelectSearchResult?.(node.id)}
                className="w-full text-left px-4 py-3 border-b border-slate-800 hover:bg-slate-800 flex flex-col"
              >
                <span className="text-sm font-semibold text-slate-200">{node.label}</span>
                <span className="text-xs text-slate-400 mt-1">{node.nodeType}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {currentProjectName && (
          <div className="hidden md:flex items-center px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <span className="font-mono text-slate-200 truncate max-w-[100px]">{currentProjectName}</span>
          </div>
        )}

        <div className="md:hidden">
          <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2 text-slate-400 hover:text-white">
            <Search className="w-5 h-5" />
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {currentProjectId && (
          <div className="relative hidden md:block" ref={toolsRef} style={{ zIndex: 999999 }}>
            <button
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition-all shadow-md"
            >
              <span>Tools</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isToolsOpen ? 'rotate-180 text-indigo-400' : ''}`} />
            </button>
            
            {/* 100% SOLID OPAQUE Dropdown Menu (zIndex: 999999, no backdrop-filter) */}
            {isToolsOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-slate-700 shadow-[0_25px_60px_rgba(0,0,0,1)] overflow-hidden py-1"
                style={{ backgroundColor: '#0f172a', opacity: 1, zIndex: 999999 }}
              >
                <button onClick={() => { onOpenErDiagram(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center space-x-2.5 text-xs text-amber-300 font-medium transition-colors"><Database className="w-4 h-4" /><span>ER Diagram</span></button>
                <button onClick={() => { onOpenSecurityFlow(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center space-x-2.5 text-xs text-purple-300 font-medium transition-colors"><ShieldCheck className="w-4 h-4" /><span>Security</span></button>
                <button onClick={() => { onOpenAiAssistant(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center space-x-2.5 text-xs text-pink-300 font-medium transition-colors"><Bot className="w-4 h-4" /><span>AI Assistant</span></button>
                <button onClick={() => { onOpenSqlExplorer(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center space-x-2.5 text-xs text-blue-300 font-medium transition-colors"><Database className="w-4 h-4" /><span>SQL Explorer</span></button>
                <button onClick={() => { onOpenDependencies(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center space-x-2.5 text-xs text-indigo-300 font-medium transition-colors"><Package className="w-4 h-4" /><span>Dependencies</span></button>
                <button onClick={() => { onOpenFileTree(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center space-x-2.5 text-xs text-cyan-300 font-medium transition-colors"><FolderTree className="w-4 h-4" /><span>File Tree</span></button>
                <div className="border-t border-slate-800 my-1"></div>
                <button onClick={() => { onExportMarkdown(); setIsToolsOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center space-x-2.5 text-xs text-emerald-300 font-medium transition-colors"><Download className="w-4 h-4" /><span>Export Markdown</span></button>
              </div>
            )}
          </div>
        )}

        <button onClick={onOpenIngestModal} className="hidden md:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30">
          <Import className="w-3.5 h-3.5" /><span>Import</span>
        </button>

        {currentProjectId && (
          <button onClick={onExitProject} className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-medium text-red-400">
            <X className="w-3.5 h-3.5" /><span>Exit</span>
          </button>
        )}
      </div>

      {isMobileMenuOpen && (
        <div
          className="absolute top-16 left-0 right-0 border-b border-slate-800 p-4 flex flex-col space-y-3 md:hidden shadow-2xl"
          style={{ backgroundColor: '#0f172a', zIndex: 999999 }}
        >
          <button onClick={() => { onOpenIngestModal(); setIsMobileMenuOpen(false); }} className="flex items-center space-x-2 text-slate-200 p-2 font-medium"><Import className="w-4 h-4" /><span>Import Project</span></button>
          {currentProjectId && (
            <>
              <button onClick={() => { onOpenErDiagram(); setIsMobileMenuOpen(false); }} className="flex items-center space-x-2 text-amber-300 p-2 font-medium"><Database className="w-4 h-4" /><span>ER Diagram</span></button>
              <button onClick={() => { onOpenSecurityFlow(); setIsMobileMenuOpen(false); }} className="flex items-center space-x-2 text-purple-300 p-2 font-medium"><ShieldCheck className="w-4 h-4" /><span>Security</span></button>
              <button onClick={() => { onOpenAiAssistant(); setIsMobileMenuOpen(false); }} className="flex items-center space-x-2 text-pink-300 p-2 font-medium"><Bot className="w-4 h-4" /><span>AI Assistant</span></button>
              <button onClick={() => { onOpenSqlExplorer(); setIsMobileMenuOpen(false); }} className="flex items-center space-x-2 text-blue-300 p-2 font-medium"><Database className="w-4 h-4" /><span>SQL Explorer</span></button>
              <button onClick={() => { onOpenDependencies(); setIsMobileMenuOpen(false); }} className="flex items-center space-x-2 text-indigo-300 p-2 font-medium"><Package className="w-4 h-4" /><span>Dependencies</span></button>
              <button onClick={() => { onOpenFileTree(); setIsMobileMenuOpen(false); }} className="flex items-center space-x-2 text-cyan-300 p-2 font-medium"><FolderTree className="w-4 h-4" /><span>File Tree</span></button>
              <button onClick={() => { onExportMarkdown(); setIsMobileMenuOpen(false); }} className="flex items-center space-x-2 text-emerald-300 p-2 font-medium"><Download className="w-4 h-4" /><span>Export Markdown</span></button>
              <button onClick={() => { onExitProject(); setIsMobileMenuOpen(false); }} className="flex items-center space-x-2 text-red-400 p-2 font-medium"><LogOut className="w-4 h-4" /><span>Exit Project</span></button>
            </>
          )}
        </div>
      )}
      
      {isSearchOpen && (
        <div
          className="absolute top-16 left-0 right-0 border-b border-slate-800 p-4 md:hidden shadow-2xl"
          style={{ backgroundColor: '#0f172a', zIndex: 999999 }}
        >
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          {searchResults && searchResults.length > 0 && currentProjectId && (
            <div className="mt-2 w-full bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
              {searchResults.map((node) => (
                <button
                  key={node.id}
                  onClick={() => { onSelectSearchResult?.(node.id); setIsSearchOpen(false); }}
                  className="w-full text-left px-4 py-3 border-b border-slate-800 flex flex-col hover:bg-slate-800"
                >
                  <span className="text-sm font-semibold text-slate-200">{node.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
