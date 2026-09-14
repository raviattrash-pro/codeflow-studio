import React, { useState } from 'react';
import {
  X, Download, Layers, Sparkles, FileText, Image as ImageIcon,
  Check, Copy, ExternalLink, Code2, ZoomIn, ZoomOut, Maximize2
} from 'lucide-react';
import { ThemeMode } from './Header';

interface ArchitectureBlueprintExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
}

export const ArchitectureBlueprintExportModal: React.FC<ArchitectureBlueprintExportModalProps> = ({
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
}) => {
  const [c4Level, setC4Level] = useState<'L1' | 'L2' | 'L3'>('L2');
  const [copied, setCopied] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const isLight = currentTheme === 'NORMAL';
  const isGlass = currentTheme === 'GLASSMORPHISM';
  const isNeumorphic = currentTheme === 'NEUMORPHIC';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getMermaidDefinition = () => {
    switch (c4Level) {
      case 'L1':
        return `C4Context
title System Context Diagram for CodeFlow Studio

Person(developer, "Software Engineer", "Views code architecture, traces SQL, and simulates chaos")
System(codeflow, "CodeFlow Studio Platform", "Parses AST, visualizes HLD/LLD flows, and audits codebases")
System_Ext(github, "GitHub / Git Repo", "Hosts application source code and repositories")
System_Ext(llm, "AI Providers (Gemini / OpenAI)", "Powers semantic code analysis and architecture explanations")

Rel(developer, codeflow, "Interacts with", "HTTPS / React 19")
Rel(codeflow, github, "Clones repository", "JGit / HTTPS")
Rel(codeflow, llm, "Sends AST context", "WebClient / REST")`;

      case 'L2':
        return `C4Container
title Container Diagram for CodeFlow Studio Full Stack

Container(spa, "Single Page App", "React 19, TypeScript, Tailwind CSS, Lucide", "Interactive architecture visualizer & command palette")
Container(api, "API Application", "Spring Boot 3.2.3, Java 21, JavaParser", "Parses Java AST, computes graph nodes, and serves REST APIs")
ContainerDb(db, "Database", "PostgreSQL 16 / H2", "Stores project schemas, parsed nodes, edges, and SQL logs")

Rel(spa, api, "Makes API calls", "JSON/HTTPS")
Rel(api, db, "Reads & writes AST graph", "Spring Data JPA / HikariCP")`;

      case 'L3':
        return `C4Component
title Component Diagram for Spring Boot Backend Layer

Component(ctrl, "ProjectController", "Spring REST Controller", "Provides CRUD endpoints for project analysis")
Component(aiCtrl, "AiAssistantController", "Spring REST Controller", "Provides AI code review and audit endpoints")
Component(svc, "ProjectService", "Spring Service", "Orchestrates Git clone, JavaParser parsing, and edge resolution")
Component(aiSvc, "AiService", "Spring Service", "Builds codebase context and dispatches to LLMs")
Component(repo, "ProjectNodeRepository", "Spring Data JPA Repository", "Persists class nodes and architectural layers")

Rel(ctrl, svc, "Invokes")
Rel(aiCtrl, aiSvc, "Invokes")
Rel(svc, repo, "Persists AST entities")`;
    }
  };

  const handleExportSvg = () => {
    setIsExporting(true);
    setTimeout(() => {
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%">
  <rect width="1200" height="800" fill="#0f172a"/>
  <text x="600" y="60" text-anchor="middle" fill="#38bdf8" font-size="28" font-family="sans-serif" font-weight="bold">CodeFlow Studio — 4K Architecture Blueprint</text>
  <text x="600" y="90" text-anchor="middle" fill="#94a3b8" font-size="16" font-family="sans-serif">Level: ${c4Level} C4 Architecture Model • Generated ${new Date().toLocaleDateString()}</text>
  
  <!-- Frontend Container -->
  <rect x="80" y="200" width="300" height="220" rx="16" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="230" y="240" text-anchor="middle" fill="#38bdf8" font-size="18" font-weight="bold">Frontend (React 19)</text>
  <text x="230" y="270" text-anchor="middle" fill="#cbd5e1" font-size="13">HLD Canvas & Flow Visualizer</text>
  <text x="230" y="295" text-anchor="middle" fill="#cbd5e1" font-size="13">Command Palette (Ctrl+K)</text>
  <text x="230" y="320" text-anchor="middle" fill="#cbd5e1" font-size="13">Monaco AST Code Viewer</text>

  <!-- Spring Boot Backend Container -->
  <rect x="450" y="200" width="300" height="220" rx="16" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
  <text x="600" y="240" text-anchor="middle" fill="#34d399" font-size="18" font-weight="bold">Backend (Spring Boot 3)</text>
  <text x="600" y="270" text-anchor="middle" fill="#cbd5e1" font-size="13">JavaParser AST Engine</text>
  <text x="600" y="295" text-anchor="middle" fill="#cbd5e1" font-size="13">Spring Security 6 (JWT)</text>
  <text x="600" y="320" text-anchor="middle" fill="#cbd5e1" font-size="13">AiService RAG Provider</text>

  <!-- Database Container -->
  <rect x="820" y="200" width="300" height="220" rx="16" fill="#1e293b" stroke="#a855f7" stroke-width="2"/>
  <text x="970" y="240" text-anchor="middle" fill="#a855f7" font-size="18" font-weight="bold">Database & Persistence</text>
  <text x="970" y="270" text-anchor="middle" fill="#cbd5e1" font-size="13">PostgreSQL 16 Schema</text>
  <text x="970" y="295" text-anchor="middle" fill="#cbd5e1" font-size="13">HikariCP Pool (10 conns)</text>
  <text x="970" y="320" text-anchor="middle" fill="#cbd5e1" font-size="13">Flyway / Liquibase Migrations</text>
</svg>`;

      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `codeflow-c4-blueprint-${c4Level.toLowerCase()}-${Date.now()}.svg`;
      a.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
    }, 600);
  };

  return (
    <div className="studio-modal-overlay">
      <div
        className={`w-full max-w-5xl  flex flex-col studio-modal-card rounded-2xl shadow-2xl overflow-hidden border ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : isGlass
            ? 'bg-[#0f172a] border-cyan-500/40 text-white'
            : isNeumorphic
            ? 'bg-[#1e2330] border-slate-700/50 text-slate-100'
            : 'bg-[#0f172a] border-slate-700 text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">4K Architecture Blueprint & C4 Exporter</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  Vector 4K
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Export scalable SVG blueprints, high-res C4 diagrams, and PlantUML / Mermaid specs for RFCs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportSvg}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow transition"
            >
              <Download className="w-3.5 h-3.5" />
              {isExporting ? 'Exporting...' : 'Export 4K SVG'}
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
          {/* Left Controls */}
          <div className="md:col-span-4 border-r border-slate-700/50 p-4 space-y-4 overflow-y-auto bg-slate-800/20">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                C4 Model Zoom Level
              </span>
              <div className="space-y-2">
                {[
                  { id: 'L1', name: 'Level 1: System Context', desc: 'High-level actors, external services, & boundary' },
                  { id: 'L2', name: 'Level 2: Container Diagram', desc: 'SPA Frontend, Spring API backend, & Database' },
                  { id: 'L3', name: 'Level 3: Component Diagram', desc: 'Controllers, Services, Repositories, & AST engine' },
                ].map(lvl => (
                  <button
                    key={lvl.id}
                    onClick={() => setC4Level(lvl.id as any)}
                    className={`w-full text-left p-3 rounded-xl border transition ${
                      c4Level === lvl.id
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-800/40 border-slate-700/40 text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <span className="text-xs font-bold block">{lvl.name}</span>
                    <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">{lvl.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700/40">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                PlantUML / Mermaid Code
              </span>
              <button
                onClick={() => copyToClipboard(getMermaidDefinition(), 'mermaid')}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
              >
                {copied === 'mermaid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied === 'mermaid' ? 'Copied Mermaid Code' : 'Copy Mermaid C4'}
              </button>
            </div>
          </div>

          {/* Right Blueprint Canvas Preview */}
          <div className="md:col-span-8 flex flex-col p-5 overflow-y-auto space-y-4">
            <div className="border border-slate-700/60 rounded-xl overflow-hidden bg-slate-950 p-6 flex flex-col items-center justify-center relative shadow-2xl min-h-[380px]">
              {/* Blueprint Grid Watermark */}
              <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

              <div className="w-full space-y-4 relative z-10">
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-black text-cyan-400 tracking-wide">
                    {c4Level === 'L1' ? 'Level 1: System Context' : c4Level === 'L2' ? 'Level 2: Container Model' : 'Level 3: Component Diagram'}
                  </h3>
                  <p className="text-xs text-slate-400">Target Architecture: Spring Boot 3.2.3 • React 19 • PostgreSQL 16</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl border border-cyan-500/40 bg-slate-900/80 shadow-lg text-center">
                    <span className="text-xs font-black text-cyan-300 block mb-1">React 19 SPA</span>
                    <p className="text-[11px] text-slate-400">HLD Canvas & Flows</p>
                  </div>
                  <div className="p-4 rounded-xl border border-emerald-500/40 bg-slate-900/80 shadow-lg text-center">
                    <span className="text-xs font-black text-emerald-300 block mb-1">Spring Boot 3</span>
                    <p className="text-[11px] text-slate-400">JavaParser AST Engine</p>
                  </div>
                  <div className="p-4 rounded-xl border border-purple-500/40 bg-slate-900/80 shadow-lg text-center">
                    <span className="text-xs font-black text-purple-300 block mb-1">PostgreSQL 16</span>
                    <p className="text-[11px] text-slate-400">Hikari Connection Pool</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
