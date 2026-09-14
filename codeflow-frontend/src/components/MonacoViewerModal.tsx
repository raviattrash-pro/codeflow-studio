import React, { useEffect, useState, useMemo } from 'react';
import {
  X, Code2, Copy, Check, FileCode, CheckCircle2, Search,
  Bot, Sparkles, Download, Layers, ShieldCheck, Zap
} from 'lucide-react';
import axios from 'axios';
import { DEMO_FILE_SNIPPETS, DEMO_PROJECT_DATA } from '../utils/demoData';
import { ThemeMode } from './Header';

interface MonacoViewerModalProps {
  projectId: string;
  filePath: string | null;
  onClose: () => void;
  currentTheme?: ThemeMode;
  onAskAi?: (prompt: string, analysisType?: string) => void;
}

export const MonacoViewerModal: React.FC<MonacoViewerModalProps> = ({
  projectId,
  filePath,
  onClose,
  currentTheme = 'NIGHT',
  onAskAi,
}) => {
  const [content, setContent] = useState<string>('// Loading file content...');
  const [language, setLanguage] = useState<string>('java');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);

  const isLight = currentTheme === 'NORMAL';
  const isNeumorphic = currentTheme === 'NEUMORPHIC';
  const isGlass = currentTheme === 'GLASSMORPHISM';

  useEffect(() => {
    if (!filePath || !projectId) return;

    const detectedLang = filePath.endsWith('.tsx') || filePath.endsWith('.ts')
      ? 'typescript'
      : filePath.endsWith('.xml')
      ? 'xml'
      : filePath.endsWith('.sql')
      ? 'sql'
      : filePath.endsWith('.json')
      ? 'json'
      : 'java';
    setLanguage(detectedLang);

    if (projectId === DEMO_PROJECT_DATA.id || DEMO_FILE_SNIPPETS[filePath]) {
      const demoSnippet = DEMO_FILE_SNIPPETS[filePath] || `// Source code for ${filePath}\npackage com.codeflow.demo;\n\n// Pre-rendered demo architectural source file\npublic class DemoSource {\n    // View live Spring Boot + React nodes in full flow\n}`;
      setContent(demoSnippet);
      return;
    }

    axios
      .get<{ content: string; language: string }>(`/api/v1/projects/${projectId}/file`, {
        params: { filePath },
      })
      .then((res) => {
        setContent(res.data.content || '');
        setLanguage(res.data.language || detectedLang);
      })
      .catch(() => {
        const demoSnippet = DEMO_FILE_SNIPPETS[filePath] || `// Source code for ${filePath}\npackage com.codeflow.demo;\n\n// Pre-rendered demo architectural source file\npublic class DemoSource {\n    // View live Spring Boot + React nodes in full flow\n}`;
        setContent(demoSnippet);
      });
  }, [projectId, filePath]);

  if (!filePath) return null;

  const lines = useMemo(() => content.split('\n'), [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filePath.split('/').pop() || 'codefile.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Syntax highlighting tokenizer
  const renderHighlightedLine = (line: string) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('--') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
      return <span className="text-slate-500 italic">{line}</span>;
    }

    // Java / Spring Annotations (@RestController, @Service, @GetMapping, etc.)
    const annotationRegex = /(@[A-Za-z0-9_]+(?:\([^)]*\))?)/g;
    // Keywords
    const keywordRegex = /\b(public|private|protected|class|interface|implements|extends|return|new|if|else|for|while|try|catch|throw|throws|import|package|export|default|const|let|var|function|async|await|SELECT|FROM|WHERE|JOIN|INSERT|UPDATE|DELETE|GROUP BY|ORDER BY)\b/g;
    // Strings
    const stringRegex = /(".*?"|'.*?'|`.*?`)/g;

    const parts: React.ReactNode[] = [];
    let lastIdx = 0;

    // Split and highlight keywords and annotations
    const tokens = line.split(/(@[A-Za-z0-9_]+(?:\([^)]*\))?|"[^"]*"|'[^']*'|\b(?:public|private|protected|class|interface|implements|extends|return|new|if|else|for|while|try|catch|throw|throws|import|package|export|default|const|let|var|function|async|await|SELECT|FROM|WHERE|JOIN|INSERT|UPDATE|DELETE)\b)/g);

    return tokens.map((token, i) => {
      if (!token) return null;
      if (token.startsWith('@')) {
        return <span key={i} className="text-pink-400 font-bold">{token}</span>;
      }
      if (token.startsWith('"') || token.startsWith("'")) {
        return <span key={i} className="text-emerald-400">{token}</span>;
      }
      if (/^(public|private|protected|class|interface|implements|extends|return|new|if|else|for|while|try|catch|throw|throws|import|package|export|default|const|let|var|function|async|await|SELECT|FROM|WHERE|JOIN|INSERT|UPDATE|DELETE)$/.test(token)) {
        return <span key={i} className="text-sky-400 font-semibold">{token}</span>;
      }
      if (/^[0-9]+(?:\.[0-9]+)?$/.test(token)) {
        return <span key={i} className="text-amber-400">{token}</span>;
      }
      return <span key={i} className="text-slate-200">{token}</span>;
    });
  };

  const matchesCount = searchQuery
    ? lines.filter(l => l.toLowerCase().includes(searchQuery.toLowerCase())).length
    : 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`w-full max-w-5xl h-[85vh] max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col border my-auto ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : isGlass
            ? 'glass-modal border-slate-700/80 text-white'
            : isNeumorphic
            ? 'neumorphic-card border-slate-700 text-slate-100'
            : 'bg-[#080d1a] border-slate-800 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 font-mono ${
          isLight ? 'bg-slate-50/95 border-slate-200' : 'bg-[#070a12] border-slate-800'
        }`}>
          <div className="flex items-center space-x-3 truncate">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-md">
              <Code2 className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-2">
                <h3 className={`text-sm font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {filePath}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 uppercase font-bold tracking-wider">
                  {language}
                </span>
                <span className="text-[10px] text-slate-400">
                  {lines.length} lines • {(content.length / 1024).toFixed(1)} KB
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Interactive Syntax Viewer &amp; AST Code Inspector
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Search Input */}
            <div className="relative hidden sm:block">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Find in file..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-8 pr-3 py-1.5 rounded-xl border text-xs font-mono outline-none w-36 focus:w-48 transition-all ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                    : 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500'
                }`}
              />
              {searchQuery && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-purple-400 font-bold">
                  {matchesCount}
                </span>
              )}
            </div>

            {/* AI Review Button */}
            {onAskAi && (
              <button
                onClick={() => onAskAi(`Perform a comprehensive code review and architectural analysis for the source file:\nFile: ${filePath}\nLanguage: ${language}\n\nCode snippet:\n${content.slice(0, 1500)}`, 'CODE_REVIEW')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-mono font-bold transition-all shadow-sm"
                title="Ask AI to review and suggest refactorings for this file"
              >
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden md:inline">AI Review</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Copy full source code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className={`p-2 rounded-xl border transition-all ${
                isLight ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Download File"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-all ${
                isLight ? 'hover:bg-slate-200 text-slate-500 hover:text-slate-900' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Editor Code Container with Line Numbers */}
        <div className="flex-1 overflow-auto custom-scrollbar font-mono text-xs leading-relaxed bg-[#050811] text-slate-200">
          <div className="min-w-full inline-block">
            {lines.map((line, idx) => {
              const lineNum = idx + 1;
              const isMatch = searchQuery && line.toLowerCase().includes(searchQuery.toLowerCase());
              const isHovered = hoveredLine === lineNum;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredLine(lineNum)}
                  onMouseLeave={() => setHoveredLine(null)}
                  className={`flex items-start transition-colors px-4 py-0.5 ${
                    isMatch
                      ? 'bg-purple-950/60 border-l-2 border-purple-400'
                      : isHovered
                      ? 'bg-slate-900/60'
                      : ''
                  }`}
                >
                  {/* Line Number Gutter */}
                  <div className="w-12 shrink-0 select-none text-right pr-4 text-[11px] text-slate-600 font-mono">
                    {lineNum}
                  </div>

                  {/* Code Line */}
                  <div className="flex-1 whitespace-pre pl-2 overflow-x-auto">
                    {renderHighlightedLine(line)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
