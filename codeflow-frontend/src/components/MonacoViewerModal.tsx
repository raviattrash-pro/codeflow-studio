import React, { useEffect, useState } from 'react';
import { X, Code2, Copy, Check, FileCode, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { DEMO_FILE_SNIPPETS, DEMO_PROJECT_DATA } from '../utils/demoData';
import { ThemeMode } from './Header';

interface MonacoViewerModalProps {
  projectId: string;
  filePath: string | null;
  onClose: () => void;
  currentTheme?: ThemeMode;
}

export const MonacoViewerModal: React.FC<MonacoViewerModalProps> = ({
  projectId,
  filePath,
  onClose,
  currentTheme = 'NIGHT',
}) => {
  const [content, setContent] = useState<string>('// Loading file content...');
  const [language, setLanguage] = useState<string>('java');
  const [copied, setCopied] = useState(false);

  const isLight = currentTheme === 'NORMAL';
  const isNeumorphic = currentTheme === 'NEUMORPHIC';
  const isGlass = currentTheme === 'GLASSMORPHISM';

  useEffect(() => {
    if (!filePath || !projectId) return;

    const detectedLang = filePath.endsWith('.tsx') || filePath.endsWith('.ts') ? 'typescript' : filePath.endsWith('.xml') ? 'xml' : filePath.endsWith('.sql') ? 'sql' : 'java';
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
        setContent(res.data.content);
        setLanguage(res.data.language || detectedLang);
      })
      .catch(() => {
        const demoSnippet = DEMO_FILE_SNIPPETS[filePath] || `// Source code for ${filePath}\npackage com.codeflow.demo;\n\n// Pre-rendered demo architectural source file\npublic class DemoSource {\n    // View live Spring Boot + React nodes in full flow\n}`;
        setContent(demoSnippet);
      });
  }, [projectId, filePath]);

  if (!filePath) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`w-full max-w-4xl h-[80vh] max-h-[80vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col border my-auto ${
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
          <div className="flex items-center space-x-3 truncate">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h3 className={`text-sm font-bold font-mono truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {filePath}
              </h3>
              <span className="text-[10px] text-indigo-400 uppercase font-mono font-bold tracking-wider">{language}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleCopy}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
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

        {/* Editor Code Container */}
        <div className={`flex-1 p-6 overflow-auto custom-scrollbar font-mono text-xs leading-relaxed whitespace-pre ${
          isLight ? 'bg-slate-950 text-cyan-200 shadow-inner' : 'bg-slate-950 text-slate-200'
        }`}>
          <code>{content}</code>
        </div>
      </div>
    </div>
  );
};
