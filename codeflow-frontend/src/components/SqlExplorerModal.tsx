import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Database, Clock, Terminal, Copy, Check, Filter, Bot, Zap } from 'lucide-react';

import { DEMO_SQL_LOGS, DEMO_PROJECT_DATA } from '../utils/demoData';

import { ThemeMode } from './Header';

interface SqlQueryLog {
  id: string;
  projectId?: string;
  repositoryName: string;
  targetTable: string;
  sqlQuery: string;
  queryType: string;
  executionTimeMs: number;
  rowsReturned: number;
  timestamp?: string;
}

interface SqlExplorerModalProps {
  projectId: string | null;
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
  onAskAi?: (prompt: string, analysisType?: string) => void;
}

export const SqlExplorerModal: React.FC<SqlExplorerModalProps> = ({
  projectId,
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
  onAskAi,
}) => {
  const [logs, setLogs] = useState<SqlQueryLog[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  const isLight = currentTheme === 'NORMAL' || currentTheme === 'GLASSMORPHISM' || currentTheme === 'NEUMORPHIC';

  const formattedDemoLogs: SqlQueryLog[] = DEMO_SQL_LOGS.map((s) => ({
    id: s.id,
    projectId: DEMO_PROJECT_DATA.id,
    repositoryName: s.repository,
    targetTable: s.targetTable,
    sqlQuery: s.sql,
    queryType: s.queryType,
    executionTimeMs: s.durationMs,
    rowsReturned: s.rowCount,
    timestamp: new Date().toISOString(),
  }));

  useEffect(() => {
    if (!isOpen || !projectId) return;

    if (projectId === DEMO_PROJECT_DATA.id) {
      setLogs(formattedDemoLogs);
      return;
    }

    axios
      .get<SqlQueryLog[]>(`/api/v1/projects/${projectId}/sql`)
      .then((res) => setLogs(Array.isArray(res.data) && res.data.length > 0 ? res.data : formattedDemoLogs))
      .catch(() => setLogs(formattedDemoLogs));
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLogs = (Array.isArray(logs) ? logs : []).filter(
    (l) => filterType === 'ALL' || (l.queryType || '').toUpperCase() === filterType
  );

  const getModalBg = () => {
    switch (currentTheme) {
      case 'NEUMORPHIC': return 'bg-[#e0e5ec] text-[#2d3748] border-[#c0cbdc] shadow-[15px_15px_30px_#a3b1c6]';
      case 'GLASSMORPHISM': return 'bg-white border-slate-200 text-slate-900 shadow-2xl';
      case 'NORMAL': return 'bg-white border-slate-200 text-slate-900 shadow-2xl';
      default: return 'bg-[#0b101d] text-slate-100 border-slate-800 shadow-[0_25px_80px_rgba(0,0,0,0.95)]';
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal-pop-in w-full max-w-4xl h-[85vh]  rounded-3xl border shadow-2xl overflow-hidden flex flex-col my-auto font-mono ${getModalBg()}`}
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 999999 }}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080c16] border-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold flex items-center space-x-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <span>SQL Query Explorer</span>
                <span className="px-2 py-0.5 text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 rounded-full font-bold">
                  Runtime Tracing
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Captured Hibernate / Spring Data JPA generated SQL statements &amp; timing metrics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all ${isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filter */}
        <div className={`px-6 py-3 border-b flex items-center justify-between text-xs font-mono shrink-0 ${
          isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-slate-950/50 border-slate-800/80'
        }`}>
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className={isLight ? 'text-slate-600 font-semibold' : 'text-slate-400'}>Filter Query Type:</span>
            {['ALL', 'SELECT', 'INSERT', 'UPDATE'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-lg border transition-all ${
                  filterType === type
                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40 font-bold'
                    : isLight ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className={isLight ? 'text-slate-600' : 'text-slate-400'}>
            Total Queries: <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{filteredLogs.length}</span>
          </div>
        </div>

        {/* Query Log List */}
        <div className={`flex-1 min-h-0 p-6 overflow-y-auto custom-scrollbar space-y-4 ${
          isLight ? 'bg-slate-50/50' : 'bg-[#090d16]'
        }`}>
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono">No SQL queries captured for this project yet.</div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  isLight ? 'bg-white border-slate-200 shadow-sm hover:border-amber-400' : 'bg-slate-950 border-slate-800 hover:border-amber-500/30'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                        log.queryType === 'SELECT'
                          ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30'
                          : log.queryType === 'INSERT'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                          : 'bg-purple-500/10 text-purple-500 border-purple-500/30'
                      }`}
                    >
                      {log.queryType}
                    </span>
                    <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>{log.repositoryName}</span>
                    <span className="text-slate-400">→</span>
                    <span className="text-amber-500 font-semibold">Table: {log.targetTable}</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{log.executionTimeMs}ms</span>
                    </span>
                    <span className="text-slate-400">{log.rowsReturned} rows</span>
                    <div className="flex items-center space-x-2">
                      {onAskAi && (
                        <button
                          onClick={() => onAskAi(`Analyze this SQL query and suggest indexes and query optimizations:\n\n${log.sqlQuery}\nTarget Table: ${log.targetTable}\nDuration: ${log.executionTimeMs}ms`, 'SQL_OPTIMIZE')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-semibold flex items-center space-x-1 transition-all"
                          title="Ask AI to optimize query"
                        >
                          <Zap className="w-3 h-3 text-emerald-400" />
                          <span>AI Optimize</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleCopy(log.id, log.sqlQuery)}
                        className={`p-1.5 rounded-lg transition-all flex items-center space-x-1 ${
                          isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                        title="Copy SQL Query"
                      >
                        {copiedId === log.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-xl font-mono text-xs overflow-x-auto custom-scrollbar leading-relaxed border ${
                  isLight ? 'bg-amber-50/60 border-amber-200/60 text-amber-900' : 'bg-[#070a12] border-slate-900 text-amber-200/90'
                }`}>
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
