import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Database, Clock, Terminal, Copy, Check, Filter } from 'lucide-react';

interface SqlQueryLog {
  id: string;
  projectId: string;
  repositoryName: string;
  targetTable: string;
  sqlQuery: string;
  queryType: string;
  executionTimeMs: number;
  rowsReturned: number;
  timestamp: string;
}

interface SqlExplorerModalProps {
  projectId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SqlExplorerModal: React.FC<SqlExplorerModalProps> = ({
  projectId,
  isOpen,
  onClose,
}) => {
  const [logs, setLogs] = useState<SqlQueryLog[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    if (!isOpen || !projectId) return;

    axios
      .get<SqlQueryLog[]>(`/api/v1/projects/${projectId}/sql`)
      .then((res) => setLogs(res.data))
      .catch(() => setLogs([]));
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLogs = logs.filter(
    (l) => filterType === 'ALL' || l.queryType.toUpperCase() === filterType
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center space-x-2">
                <span>SQL Query Explorer</span>
                <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                  Runtime Tracing
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Captured Hibernate / Spring Data JPA generated SQL statements & timing metrics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filter */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-950/50 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Filter Query Type:</span>
            {['ALL', 'SELECT', 'INSERT', 'UPDATE'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-lg border transition-all ${
                  filterType === type
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="text-slate-400">
            Total Queries: <span className="font-bold text-white">{filteredLogs.length}</span>
          </div>
        </div>

        {/* Query Log List */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono">No SQL queries captured for this project yet.</div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/30 transition-all space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                        log.queryType === 'SELECT'
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                          : log.queryType === 'INSERT'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      }`}
                    >
                      {log.queryType}
                    </span>
                    <span className="text-slate-300 font-bold">{log.repositoryName}</span>
                    <span className="text-slate-600">→</span>
                    <span className="text-amber-400">Table: {log.targetTable}</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold text-white">{log.executionTimeMs}ms</span>
                    </span>
                    <span className="text-slate-500">{log.rowsReturned} rows</span>
                    <button
                      onClick={() => handleCopy(log.id, log.sqlQuery)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all flex items-center space-x-1"
                      title="Copy SQL Query"
                    >
                      {copiedId === log.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-amber-200/90 overflow-x-auto custom-scrollbar leading-relaxed">
                  {log.sqlQuery}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
