import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Database, Key, Table, ArrowRight, Layers } from 'lucide-react';

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
}

export const ErDiagramModal: React.FC<ErDiagramModalProps> = ({
  projectId,
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<ErDiagramData | null>(null);

  useEffect(() => {
    if (!isOpen || !projectId) return;

    axios
      .get<ErDiagramData>(`/api/v1/projects/${projectId}/er-diagram`)
      .then((res) => setData(res.data))
      .catch(() => setData(null));
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center space-x-2">
                <span>Database ER Diagram Explorer</span>
                <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                  @Entity Mapping
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Visual entity-relationship diagram with primary keys, column types & associations
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

        {/* Content Canvas */}
        <div className="flex-1 p-6 overflow-auto custom-scrollbar bg-slate-950/60 space-y-6">
          {/* Entity Tables Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.tables.map((table) => (
              <div
                key={table.id}
                className="rounded-2xl border border-amber-500/30 bg-slate-900 shadow-xl overflow-hidden font-mono"
              >
                {/* Table Header */}
                <div className="px-4 py-3 bg-amber-950/40 border-b border-amber-500/20 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Table className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-200">{table.tableName}</span>
                  </div>
                  <span className="text-[10px] text-amber-400/70">{table.entityName}</span>
                </div>

                {/* Table Fields */}
                <div className="p-3 space-y-1.5 text-xs divide-y divide-slate-800/60">
                  {table.fields.map((field, fIdx) => (
                    <div key={fIdx} className="pt-1.5 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        {field.primaryKey ? (
                          <Key className="w-3 h-3 text-amber-400 shrink-0" />
                        ) : (
                          <span className="w-3 text-center text-slate-600 font-bold">•</span>
                        )}
                        <span className={`text-[11px] ${field.primaryKey ? 'font-bold text-white' : 'text-slate-300'}`}>
                          {field.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">{field.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Relationships List */}
          {data?.relations && data.relations.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                Entity Associations & Relational Constraints
              </h4>
              <div className="space-y-2 font-mono text-xs">
                {data.relations.map((rel, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {rel.type}
                      </span>
                      <span className="text-slate-300">{rel.label}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
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
