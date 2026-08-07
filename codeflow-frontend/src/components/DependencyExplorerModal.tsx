import React, { useEffect, useState } from 'react';
import { X, Package, Search, HelpCircle, Code } from 'lucide-react';
import axios from 'axios';
import { ProjectDependency } from '../types';

interface DependencyExplorerModalProps {
  projectId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DependencyExplorerModal: React.FC<DependencyExplorerModalProps> = ({
  projectId,
  isOpen,
  onClose,
}) => {
  const [dependencies, setDependencies] = useState<ProjectDependency[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!projectId || !isOpen) return;

    axios
      .get<ProjectDependency[]>(`/api/v1/projects/${projectId}/dependencies`)
      .then((res) => setDependencies(res.data))
      .catch(() => setDependencies([]));
  }, [projectId, isOpen]);

  if (!isOpen) return null;

  const filteredDeps = dependencies.filter(
    (d) =>
      d.artifactId.toLowerCase().includes(filter.toLowerCase()) ||
      d.groupId?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="w-full max-w-4xl glass-modal rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Project Dependency Explorer</h3>
              <p className="text-xs text-slate-400">Parsed Spring Boot Starters & Maven Plugins</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Input */}
        <div className="p-4 border-b border-slate-800/60 bg-slate-950 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter dependencies (e.g. spring-boot-starter-web)..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Dependencies Grid */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-3 bg-slate-950/60">
          {filteredDeps.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs font-mono">
              No dependencies matched search filter
            </div>
          ) : (
            filteredDeps.map((dep) => (
              <div
                key={dep.id}
                className="glass-panel p-4 rounded-2xl border border-slate-800/80 hover:border-purple-500/40 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-white">{dep.artifactId}</span>
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {dep.scope || 'compile'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{dep.groupId}</span>
                </div>

                {dep.purposeSummary && (
                  <p className="text-xs text-slate-300 flex items-start space-x-2 leading-relaxed">
                    <HelpCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>{dep.purposeSummary}</span>
                  </p>
                )}

                {dep.commonAnnotations && (
                  <div className="pt-2 border-t border-slate-800/60 flex items-center space-x-2 text-[11px] text-slate-400">
                    <Code className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Common Annotations:</span>
                    <span className="font-mono text-indigo-300">{dep.commonAnnotations}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
