import React, { useEffect, useState } from 'react';
import { X, Code2, Copy, Check } from 'lucide-react';
import axios from 'axios';

interface MonacoViewerModalProps {
  projectId: string;
  filePath: string | null;
  onClose: () => void;
}

export const MonacoViewerModal: React.FC<MonacoViewerModalProps> = ({
  projectId,
  filePath,
  onClose,
}) => {
  const [content, setContent] = useState<string>('// Loading file content...');
  const [language, setLanguage] = useState<string>('java');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!filePath || !projectId) return;

    axios
      .get<{ content: string; language: string }>(`/api/v1/projects/${projectId}/file`, {
        params: { filePath },
      })
      .then((res) => {
        setContent(res.data.content);
        setLanguage(res.data.language);
      })
      .catch(() => {
        setContent('// Failed to load file snippet');
      });
  }, [projectId, filePath]);

  if (!filePath) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="w-full max-w-4xl glass-modal rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono break-all">{filePath}</h3>
              <span className="text-[10px] text-slate-400 uppercase font-mono">{language}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Monaco Viewer Container */}
        <div className="flex-1 bg-slate-950 p-6 overflow-auto custom-scrollbar font-mono text-xs text-slate-200 leading-relaxed whitespace-pre">
          <code>{content}</code>
        </div>
      </div>
    </div>
  );
};
