import React from 'react';
import { NodeDetail } from '../types';
import { getAnnotationDetails } from '../utils/annotationDictionary';
import { getInterviewQuestionsForNode } from '../utils/interviewQuestions';
import { X, Code2, HelpCircle, ArrowUpRight, ArrowDownLeft, FileText, Sparkles, BookOpen } from 'lucide-react';

interface NodeInspectorSidebarProps {
  nodeDetail: NodeDetail | null;
  onClose: () => void;
  onViewCode: (filePath: string) => void;
}

export const NodeInspectorSidebar: React.FC<NodeInspectorSidebarProps> = ({
  nodeDetail,
  onClose,
  onViewCode,
}) => {
  if (!nodeDetail) return null;

  const { node, calledBy, calls } = nodeDetail;
  const annotationDetails = getAnnotationDetails(node.annotationsCsv);
  const interviewItems = getInterviewQuestionsForNode(node.nodeType);

  return (
    <aside className="w-[420px] glass-panel border-l border-slate-800 h-[calc(100vh-4rem)] flex flex-col z-20 shadow-2xl custom-scrollbar overflow-y-auto">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex items-start justify-between sticky top-0 bg-slate-950/95 backdrop-blur-md z-10">
        <div>
          <span className="px-2.5 py-0.5 text-[10px] font-bold font-mono rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {node.nodeType}
          </span>
          <h3 className="text-base font-bold text-white mt-1.5 font-mono break-all">{node.label}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 space-y-6">
        {/* Source File & Monaco View Button */}
        {node.filePath && (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Source File Location</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">Line {node.lineNumber || 1}</span>
            </div>
            <p className="text-xs font-mono text-slate-200 break-all">{node.filePath}</p>
            <button
              onClick={() => onViewCode(node.filePath!)}
              className="w-full mt-2 flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/50 hover:to-purple-600/50 text-indigo-200 border border-indigo-500/30 text-xs font-semibold transition-all shadow-md"
            >
              <Code2 className="w-4 h-4" />
              <span>Open in Monaco Code Editor</span>
            </button>
          </div>
        )}

        {/* Specific Annotation Breakdown */}
        {annotationDetails.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Framework Annotations & Internal Mechanics</span>
            </div>

            <div className="space-y-3">
              {annotationDetails.map((ann, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-900/90 border border-purple-500/20 space-y-1.5 shadow-sm"
                >
                  <span className="font-mono text-xs font-bold text-pink-400 px-2 py-0.5 rounded-lg bg-pink-500/10 border border-pink-500/20 inline-block">
                    {ann.name}
                  </span>
                  <p className="text-xs text-slate-200 font-sans leading-relaxed">{ann.whyUsed}</p>
                  <p className="text-[11px] text-purple-300/90 font-mono pt-1 border-t border-slate-800">
                    ⚙️ <span className="font-semibold text-slate-400">Under the hood:</span> {ann.internalWorking}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Called By (Upstream caller) */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <ArrowDownLeft className="w-4 h-4 text-cyan-400" />
            <span>Called By (Upstream Trigger)</span>
          </h4>
          {calledBy.length === 0 ? (
            <p className="text-xs text-slate-500 italic px-2">No incoming callers detected</p>
          ) : (
            <div className="space-y-1.5">
              {calledBy.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="font-mono text-slate-200 truncate">{c.label}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">{c.layer}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calls (Downstream target) */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <ArrowUpRight className="w-4 h-4 text-purple-400" />
            <span>Calls (Downstream Target)</span>
          </h4>
          {calls.length === 0 ? (
            <p className="text-xs text-slate-500 italic px-2">No outgoing targets detected</p>
          ) : (
            <div className="space-y-1.5">
              {calls.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="font-mono text-slate-200 truncate">{c.label}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">{c.layer}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interview Questions & Expert Detailed Answers */}
        <div className="p-4 rounded-2xl bg-indigo-950/25 border border-indigo-500/25 space-y-3 shadow-lg">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Interview Questions & Detailed Answers</span>
          </div>

          <div className="space-y-4">
            {interviewItems.map((qa, qIdx) => (
              <div key={qIdx} className="space-y-1.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-bold text-indigo-300 block">Q: {qa.question}</span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1 border-t border-slate-800">
                  <span className="font-bold text-emerald-400">Answer: </span>
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
