import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Database, Key, Table, ArrowRight, Layers } from 'lucide-react';

import { DEMO_ER_DATA, DEMO_PROJECT_DATA } from '../utils/demoData';

import { ThemeMode } from './Header';

interface EntityField {
  name: string;
  type: string;
  primaryKey: boolean;
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
}

export const ErDiagramModal: React.FC<ErDiagramModalProps> = ({
  projectId,
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
}) => {
  const [data, setData] = useState<ErDiagramData | null>(null);
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

  if (!isOpen) return null;

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
        className={`modal-pop-in w-full max-w-5xl h-[85vh] max-h-[85vh] rounded-3xl border shadow-2xl overflow-hidden flex flex-col my-auto font-mono ${getModalBg()}`}
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
                <span>Database ER Diagram Explorer</span>
                <span className="px-2 py-0.5 text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 rounded-full font-bold">
                  @Entity Mapping
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Visual entity-relationship diagram with primary keys, column types & associations
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

        {/* Content Canvas */}
        <div className={`flex-1 min-h-0 p-6 overflow-auto custom-scrollbar space-y-6 ${
          isLight ? 'bg-slate-50/50' : 'bg-[#090d16]'
        }`}>
          {/* Entity Tables Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Array.isArray(data?.tables) ? data.tables : []).map((table) => (
              <div
                key={table.id}
                className={`rounded-2xl border shadow-lg overflow-hidden transition-all hover:scale-[1.01] ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-amber-500/30'
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
            ))}
          </div>

          {/* Relationships List */}
          {data?.relations && data.relations.length > 0 && (
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0f172a] border-slate-800 text-slate-100'
            }`}>
              <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider font-mono">
                Entity Associations &amp; Relational Constraints
              </h4>
              <div className="space-y-2 font-mono text-xs">
                {data.relations.map((rel, rIdx) => (
                  <div
                    key={rIdx}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#070a12] border-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                        {rel.type}
                      </span>
                      <span className={isLight ? 'text-slate-700 font-medium' : 'text-slate-300'}>{rel.label}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
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
