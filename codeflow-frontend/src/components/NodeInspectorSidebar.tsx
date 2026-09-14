import React from 'react';
import { NodeDetail } from '../types';
import { getAnnotationDetails } from '../utils/annotationDictionary';
import { getInterviewQuestionsForNode } from '../utils/interviewQuestions';
import { X, Code2, ArrowUpRight, ArrowDownLeft, FileText, Sparkles, BookOpen } from 'lucide-react';
import { ThemeMode } from './Header';

interface NodeInspectorSidebarProps {
  nodeDetail: NodeDetail | null;
  onClose: () => void;
  onViewCode: (filePath: string) => void;
  currentTheme?: ThemeMode;
}

export const NodeInspectorSidebar: React.FC<NodeInspectorSidebarProps> = ({
  nodeDetail,
  onClose,
  onViewCode,
  currentTheme = 'NIGHT',
}) => {
  if (!nodeDetail) return null;

  const { node, calledBy, calls } = nodeDetail;
  const annotationDetails = getAnnotationDetails(node.annotationsCsv);
  const interviewItems = getInterviewQuestionsForNode(node.nodeType);

  const isLight = currentTheme === 'NORMAL';
  const isNeumorphic = currentTheme === 'NEUMORPHIC';
  const isGlass = currentTheme === 'GLASSMORPHISM';

  return (
    <aside className={`w-[420px] border-l h-[calc(100vh-4rem)] flex flex-col z-20 shadow-2xl custom-scrollbar overflow-y-auto ${
      isLight
        ? 'bg-white/95 border-slate-200 text-slate-900'
        : isGlass
        ? 'glass-panel border-slate-700/80 text-white'
        : isNeumorphic
        ? 'neumorphic-card border-slate-700 text-slate-100'
        : 'bg-[#080d1a] border-slate-800 text-white'
    }`}>
      {/* Header */}
      <div className={`p-5 border-b flex items-start justify-between sticky top-0 backdrop-blur-md z-10 ${
        isLight ? 'bg-white/90 border-slate-200' : 'bg-slate-950/95 border-slate-800'
      }`}>
        <div>
          <span className="px-2.5 py-0.5 text-[10px] font-bold font-mono rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            {node.nodeType}
          </span>
          <h3 className={`text-base font-bold mt-1.5 font-mono break-all ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {node.label}
          </h3>
        </div>
        <button
          onClick={onClose}
          className={`p-1.5 rounded-xl transition-all ${
            isLight ? 'hover:bg-slate-200 text-slate-500 hover:text-slate-900' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 space-y-6">
        {/* Source File & Monaco View Button */}
        {node.filePath && (
          <div className={`p-4 rounded-2xl border space-y-2.5 shadow-inner ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium flex items-center space-x-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>Source File Location</span>
              </span>
              <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Line {node.lineNumber || 1}</span>
            </div>
            <p className={`text-xs font-mono break-all ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{node.filePath}</p>
            <button
              onClick={() => onViewCode(node.filePath!)}
              className="w-full mt-2 flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-950/40"
            >
              <Code2 className="w-4 h-4" />
              <span>Open in Monaco Code Editor</span>
            </button>
          </div>
        )}

        {/* Specific Annotation Breakdown */}
        {annotationDetails.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-500 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Framework Annotations & Mechanics</span>
            </div>

            <div className="space-y-3">
              {annotationDetails.map((ann, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border space-y-1.5 shadow-sm ${
                    isLight ? 'bg-white border-purple-200 shadow-slate-200/50' : 'bg-slate-900/90 border-purple-500/20'
                  }`}
                >
                  <span className="font-mono text-xs font-bold text-pink-500 px-2 py-0.5 rounded-lg bg-pink-500/10 border border-pink-500/20 inline-block">
                    {ann.name}
                  </span>
                  <p className={`text-xs font-sans leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>{ann.whyUsed}</p>
                  <p className={`text-[11px] font-mono pt-1 border-t ${
                    isLight ? 'border-slate-200 text-purple-700' : 'border-slate-800 text-purple-300/90'
                  }`}>
                    ⚙️ <span className="font-semibold text-slate-500">Under the hood:</span> {ann.internalWorking}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Called By (Upstream caller) */}
        <div className="space-y-2.5">
          <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            <ArrowDownLeft className="w-4 h-4 text-cyan-500" />
            <span>Called By (Upstream Trigger)</span>
          </h4>
          {calledBy.length === 0 ? (
            <p className="text-xs text-slate-500 italic px-2">No incoming callers detected</p>
          ) : (
            <div className="space-y-1.5">
              {calledBy.map((c) => (
                <div
                  key={c.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <span className={`font-mono truncate ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{c.label}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    isLight ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-slate-800 text-slate-400'
                  }`}>{c.layer}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calls (Downstream target) */}
        <div className="space-y-2.5">
          <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            <ArrowUpRight className="w-4 h-4 text-purple-500" />
            <span>Calls (Downstream Target)</span>
          </h4>
          {calls.length === 0 ? (
            <p className="text-xs text-slate-500 italic px-2">No outgoing targets detected</p>
          ) : (
            <div className="space-y-1.5">
              {calls.map((c) => (
                <div
                  key={c.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <span className={`font-mono truncate ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{c.label}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    isLight ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-slate-800 text-slate-400'
                  }`}>{c.layer}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interview Questions & Expert Detailed Answers */}
        <div className={`p-4 rounded-2xl border space-y-3 shadow-lg ${
          isLight ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950' : 'bg-indigo-950/25 border-indigo-500/25 text-indigo-200'
        }`}>
          <div className="flex items-center space-x-2 text-indigo-500 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Interview Questions & Detailed Answers</span>
          </div>

          <div className="space-y-4">
            {interviewItems.map((qa, qIdx) => (
              <div
                key={qIdx}
                className={`space-y-1.5 p-3.5 rounded-xl border ${
                  isLight ? 'bg-white border-indigo-100 shadow-sm' : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <span className={`text-xs font-bold block ${isLight ? 'text-indigo-900' : 'text-indigo-300'}`}>Q: {qa.question}</span>
                <p className={`text-xs leading-relaxed font-sans pt-1 border-t ${
                  isLight ? 'border-slate-100 text-slate-700' : 'border-slate-800 text-slate-300'
                }`}>
                  <span className="font-bold text-emerald-500">Answer: </span>
                  {qa.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
