import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  X, Database, Key, Table, ArrowRight, Layers, Search,
  ZoomIn, ZoomOut, RotateCcw, Bot, Sparkles, Filter, Link2
} from 'lucide-react';

import { DEMO_ER_DATA, DEMO_PROJECT_DATA } from '../utils/demoData';
import { ThemeMode } from './Header';

interface EntityField {
  name: string;
  type: string;
  primaryKey: boolean;
  foreignKey?: string;
}

interface EntityTable {
  id: string;
  tableName: string;
  entityName: string;
  fields: EntityField[];
}

interface Relation {
  source: string;
  target: string;
  type: string;
  label: string;
}

interface ErDiagramData {
  tables: EntityTable[];
  relations: Relation[];
}

interface ErDiagramModalProps {
  projectId: string | null;
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
  onAskAi?: (prompt: string, analysisType?: string) => void;
}

export const ErDiagramModal: React.FC<ErDiagramModalProps> = ({
  projectId,
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
  onAskAi,
}) => {
  const [data, setData] = useState<ErDiagramData | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const isLight = currentTheme === 'NORMAL' || currentTheme === 'GLASSMORPHISM' || currentTheme === 'NEUMORPHIC';

  useEffect(() => {
    if (!isOpen || !projectId) return;

    if (projectId === DEMO_PROJECT_DATA.id) {
      setData(DEMO_ER_DATA);
      return;
    }

    axios
      .get<ErDiagramData>(`/api/v1/projects/${projectId}/er-diagram`)
      .then((res) => setData(res.data || DEMO_ER_DATA))
      .catch(() => setData(DEMO_ER_DATA));
  }, [isOpen, projectId]);

  const filteredTables = useMemo(() => {
    if (!data?.tables) return [];
    if (!filterQuery.trim()) return data.tables;
    const q = filterQuery.toLowerCase();
    return data.tables.filter(
      (t) =>
        t.tableName.toLowerCase().includes(q) ||
        t.entityName.toLowerCase().includes(q) ||
        t.fields.some((f) => f.name.toLowerCase().includes(q))
    );
  }, [data, filterQuery]);

  if (!isOpen) return null;

  const totalFields = (data?.tables || []).reduce((acc, t) => acc + (t.fields?.length || 0), 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal-pop-in w-full max-w-5xl h-[85vh] max-h-[85vh] rounded-3xl border shadow-2xl overflow-hidden flex flex-col my-auto font-mono ${
          isLight ? 'bg-white border-slate-200 text-slate-900 shadow-2xl' : 'bg-[#0b101d] text-slate-100 border-slate-800 shadow-[0_25px_80px_rgba(0,0,0,0.95)]'
        }`}
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
              <div className="flex items-center space-x-2">
                <h3 className={`text-base font-bold flex items-center space-x-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <span>Database ER Diagram Explorer</span>
                </h3>
                <span className="px-2 py-0.5 text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 rounded-full font-bold">
                  {data?.tables?.length || 0} Entities • {totalFields} Columns
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Interactive JPA relational schema, column data types, and foreign key linkages
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Search filter */}
            <div className="relative hidden sm:block">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter table or column..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className={`pl-8 pr-3 py-1.5 rounded-xl border text-xs font-mono outline-none w-44 focus:w-56 transition-all ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                    : 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-amber-500'
                }`}
              />
            </div>

            {/* Zoom Controls */}
            <div className={`flex items-center space-x-1 p-1 rounded-xl border ${
              isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'
            }`}>
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
                className="p-1 hover:text-amber-400 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono px-1 font-bold">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                className="p-1 hover:text-amber-400 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 hover:text-amber-400 transition-colors"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* AI Schema Audit Button */}
            {onAskAi && (
              <button
                onClick={() => onAskAi('Perform a comprehensive database schema review, analyze JPA entity mappings, indexing strategy, and N+1 query risks.', 'DATABASE')}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center space-x-1.5 transition-all"
              >
                <Bot className="w-3.5 h-3.5" />
                <span className="hidden md:inline">AI Review</span>
              </button>
            )}

            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-all ${isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Canvas */}
        <div className={`flex-1 min-h-0 p-6 overflow-auto custom-scrollbar space-y-6 ${
          isLight ? 'bg-slate-50/50' : 'bg-[#090d16]'
        }`}>
          {/* Entity Tables Grid with Zoom Scaling */}
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top left',
              transition: 'transform 0.15s ease-out',
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredTables.map((table) => {
              const isHighlighted = selectedTable === table.id;
              return (
                <div
                  key={table.id}
                  onClick={() => setSelectedTable(selectedTable === table.id ? null : table.id)}
                  className={`rounded-2xl border shadow-lg overflow-hidden transition-all cursor-pointer ${
                    isHighlighted
                      ? 'ring-2 ring-amber-500 border-amber-500 scale-[1.02]'
                      : isLight
                      ? 'bg-white border-slate-200 hover:border-amber-400'
                      : 'bg-[#0f172a] border-amber-500/30 hover:border-amber-500/60'
                  }`}
                >
                  {/* Table Header */}
                  <div className={`px-4 py-3 border-b flex items-center justify-between ${
                    isLight ? 'bg-amber-50 border-amber-200/80 text-amber-900' : 'bg-amber-950/40 border-amber-500/20 text-amber-200'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <Table className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold">{table.tableName}</span>
                    </div>
                    <span className="text-[10px] opacity-75 font-semibold">{table.entityName}</span>
                  </div>

                  {/* Table Fields */}
                  <div className={`p-3 space-y-1.5 text-xs divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
                    {table.fields.map((field, fIdx) => (
                      <div key={fIdx} className="pt-1.5 flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          {field.primaryKey ? (
                            <Key className="w-3 h-3 text-amber-500 shrink-0" />
                          ) : (
                            <span className="w-3 text-center text-slate-400 font-bold">•</span>
                          )}
                          <span className={`text-[11px] ${field.primaryKey ? 'font-bold text-amber-600 dark:text-amber-300' : isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            {field.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{field.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Relationships List */}
          {data?.relations && data.relations.length > 0 && (
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0f172a] border-slate-800 text-slate-100'
            }`}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                  <Link2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Entity Associations &amp; Relational Constraints</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">
                  {data.relations.length} Active Foreign Key Mappings
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-xs">
                {data.relations.map((rel, rIdx) => (
                  <div
                    key={rIdx}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isLight ? 'bg-slate-50 border-slate-200 hover:border-amber-300' : 'bg-[#070a12] border-slate-800 hover:border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                        {rel.type}
                      </span>
                      <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{rel.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
