import React, { useState } from 'react';
import { GraphData } from '../types';
import { Layout, Server, Database, Code, ArrowRight, ExternalLink, Activity } from 'lucide-react';

interface VisualFlowCanvasProps {
  graphData: GraphData;
  onSelectNode: (nodeId: string) => void;
  selectedNodeId?: string;
}

export const VisualFlowCanvas: React.FC<VisualFlowCanvasProps> = ({
  graphData,
  onSelectNode,
  selectedNodeId,
}) => {
  const [zoom, setZoom] = useState(1);
  const [filterLayer, setFilterLayer] = useState<'ALL' | 'FRONTEND' | 'BACKEND' | 'DATABASE'>('ALL');

  const filteredNodes = graphData.nodes.filter(
    (n) => filterLayer === 'ALL' || n.data.layer === filterLayer
  );

  const getNodeColor = (layer?: string, nodeType?: string) => {
    if (layer === 'FRONTEND') return 'border-cyan-500/50 bg-cyan-950/30 text-cyan-200';
    if (nodeType === 'SPRING_CONTROLLER') return 'border-indigo-500/50 bg-indigo-950/30 text-indigo-200';
    if (nodeType === 'SPRING_SERVICE') return 'border-purple-500/50 bg-purple-950/30 text-purple-200';
    if (nodeType === 'SPRING_REPOSITORY') return 'border-emerald-500/50 bg-emerald-950/30 text-emerald-200';
    if (layer === 'DATABASE') return 'border-amber-500/50 bg-amber-950/30 text-amber-200';
    return 'border-slate-700 bg-slate-900/60 text-slate-200';
  };

  const getLayerIcon = (layer?: string) => {
    if (layer === 'FRONTEND') return <Layout className="w-4 h-4 text-cyan-400" />;
    if (layer === 'DATABASE') return <Database className="w-4 h-4 text-amber-400" />;
    return <Server className="w-4 h-4 text-indigo-400" />;
  };

  return (
    <div className="flex-1 relative bg-slate-950 overflow-hidden flex flex-col">
      {/* Canvas Layer Filters & Controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 glass-panel p-1.5 rounded-xl border border-slate-800">
        {(['ALL', 'FRONTEND', 'BACKEND', 'DATABASE'] as const).map((layer) => (
          <button
            key={layer}
            onClick={() => setFilterLayer(layer)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterLayer === layer
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {layer}
          </button>
        ))}

        <div className="h-4 w-px bg-slate-800 mx-1" />

        <button
          onClick={() => setZoom((z) => Math.min(z + 0.1, 1.5))}
          className="px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 rounded-lg"
        >
          +
        </button>
        <span className="text-[11px] font-mono text-slate-400">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))}
          className="px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 rounded-lg"
        >
          -
        </button>
      </div>

      {/* Layer Swimlane Headers */}
      <div className="grid grid-cols-3 gap-4 px-6 pt-16 pb-4 border-b border-slate-800/80 text-xs font-bold uppercase tracking-wider text-slate-400">
        <div className="flex items-center space-x-2 text-cyan-400">
          <Layout className="w-4 h-4" />
          <span>React Frontend Layer</span>
        </div>
        <div className="flex items-center space-x-2 text-indigo-400">
          <Server className="w-4 h-4" />
          <span>Spring Boot Backend Layer</span>
        </div>
        <div className="flex items-center space-x-2 text-amber-400">
          <Database className="w-4 h-4" />
          <span>Database & Relational ERD</span>
        </div>
      </div>

      {/* Interactive Visual Graph Nodes Grid */}
      <div className="flex-1 overflow-auto p-6 custom-scrollbar">
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300 transform origin-top-left"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Column 1: Frontend Nodes */}
          <div className="space-y-4">
            {filteredNodes
              .filter((n) => n.data.layer === 'FRONTEND')
              .map((node) => (
                <div
                  key={node.id}
                  onClick={() => onSelectNode(node.id)}
                  className={`glass-panel p-4 rounded-xl cursor-pointer border transition-all duration-200 hover:scale-[1.02] ${getNodeColor(
                    node.data.layer,
                    node.data.nodeType
                  )} ${selectedNodeId === node.id ? 'ring-2 ring-cyan-400 shadow-lg glow-cyan' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getLayerIcon(node.data.layer)}
                      <span className="text-xs font-semibold font-mono text-cyan-300">
                        {node.data.nodeType || 'React Component'}
                      </span>
                    </div>
                    <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse-subtle" />
                  </div>
                  <h4 className="text-sm font-bold text-white font-mono truncate">{node.data.label}</h4>
                  {node.data.filePath && (
                    <p className="text-[11px] text-slate-400 font-mono mt-1 truncate">
                      {node.data.filePath}
                    </p>
                  )}
                </div>
              ))}
          </div>

          {/* Column 2: Backend Nodes */}
          <div className="space-y-4">
            {filteredNodes
              .filter((n) => n.data.layer === 'BACKEND' || !n.data.layer)
              .map((node) => (
                <div
                  key={node.id}
                  onClick={() => onSelectNode(node.id)}
                  className={`glass-panel p-4 rounded-xl cursor-pointer border transition-all duration-200 hover:scale-[1.02] ${getNodeColor(
                    node.data.layer,
                    node.data.nodeType
                  )} ${selectedNodeId === node.id ? 'ring-2 ring-indigo-400 shadow-lg glow-indigo' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getLayerIcon(node.data.layer)}
                      <span className="text-xs font-semibold font-mono text-indigo-300">
                        {node.data.nodeType}
                      </span>
                    </div>
                    {node.data.httpMethod && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {node.data.httpMethod}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white font-mono truncate">{node.data.label}</h4>
                  {node.data.endpointPath && (
                    <p className="text-[11px] text-indigo-400 font-mono mt-1 truncate">
                      Endpoint: {node.data.endpointPath}
                    </p>
                  )}
                </div>
              ))}
          </div>

          {/* Column 3: Database Nodes */}
          <div className="space-y-4">
            {filteredNodes
              .filter((n) => n.data.layer === 'DATABASE')
              .map((node) => (
                <div
                  key={node.id}
                  onClick={() => onSelectNode(node.id)}
                  className={`glass-panel p-4 rounded-xl cursor-pointer border transition-all duration-200 hover:scale-[1.02] ${getNodeColor(
                    node.data.layer,
                    node.data.nodeType
                  )} ${selectedNodeId === node.id ? 'ring-2 ring-amber-400 shadow-lg glow-emerald' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getLayerIcon(node.data.layer)}
                      <span className="text-xs font-semibold font-mono text-amber-300">
                        Database Table
                      </span>
                    </div>
                    <Database className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white font-mono truncate">{node.data.label}</h4>
                  {node.data.targetEntity && (
                    <p className="text-[11px] text-amber-400 font-mono mt-1 truncate">
                      Entity: {node.data.targetEntity}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
