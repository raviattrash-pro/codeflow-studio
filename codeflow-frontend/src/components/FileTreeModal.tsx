import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Search, Folder, FileCode, Copy, Check, Sparkles, Orbit, FileText, Code2, Layers, Cpu, CheckCircle2 } from 'lucide-react';
import { DEMO_FILE_TREE_DATA, DEMO_PROJECT_DATA } from '../utils/demoData';
import { ThemeMode } from './Header';

interface FileTreeModalProps {
  projectId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onViewCode?: (filePath: string) => void;
  currentTheme?: ThemeMode;
}

interface TreeNode {
  name: string;
  type: 'folder' | 'file';
  children?: TreeNode[];
  language?: string;
  lineCount?: number;
}

interface FileTreeStats {
  totalFolders: number;
  totalFiles: number;
}

interface FileTreeResponse {
  name: string;
  type: 'folder' | 'file';
  children?: TreeNode[];
  stats?: FileTreeStats;
}

type ViewMode = 'interactive' | 'ascii' | 'emoji' | 'mermaid' | 'galaxy';

export const FileTreeModal: React.FC<FileTreeModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onViewCode,
  currentTheme = 'NIGHT',
}) => {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [stats, setStats] = useState<FileTreeStats>({ totalFolders: 0, totalFiles: 0 });
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('interactive');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src']));
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isLight = currentTheme === 'NORMAL';
  const isNeumorphic = currentTheme === 'NEUMORPHIC';
  const isGlass = currentTheme === 'GLASSMORPHISM';

  useEffect(() => {
    if (isOpen && projectId) {
      if (projectId === DEMO_PROJECT_DATA.id) {
        const root = DEMO_FILE_TREE_DATA as any;
        const children = root.children || [root];
        setTreeData(children);
        setStats(calculateStats(children));
        return;
      }

      axios
        .get<FileTreeResponse>(`/api/v1/projects/${projectId}/file-tree`)
        .then((res) => {
          const root = res.data;
          if (!root) {
            const demoRoot = DEMO_FILE_TREE_DATA as any;
            setTreeData(demoRoot.children || [demoRoot]);
            setStats(calculateStats(demoRoot.children || [demoRoot]));
            return;
          }
          const children = root.children || [root];
          setTreeData(children);
          if (root.stats) {
            setStats(root.stats);
          } else {
            setStats(calculateStats(children));
          }
        })
        .catch(() => {
          const demoRoot = DEMO_FILE_TREE_DATA as any;
          const children = demoRoot.children || [demoRoot];
          setTreeData(children);
          setStats(calculateStats(children));
        });
    }
  }, [isOpen, projectId]);

  const calculateStats = (nodes: TreeNode[]): FileTreeStats => {
    let folders = 0;
    let files = 0;
    const walk = (items: TreeNode[]) => {
      items.forEach((item) => {
        if (item.type === 'folder') {
          folders++;
          if (item.children) walk(item.children);
        } else {
          files++;
        }
      });
    };
    walk(nodes);
    return { totalFolders: folders, totalFiles: files };
  };

  const toggleFolder = (path: string) => {
    const next = new Set(expandedFolders);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setExpandedFolders(next);
  };

  const getIcon = (name: string, type: 'folder' | 'file') => {
    if (!name) return '📄';
    if (type === 'folder') return '📁';
    if (name.endsWith('.java')) return '☕';
    if (name.endsWith('.tsx') || name.endsWith('.jsx')) return '⚛️';
    if (name.endsWith('.ts') || name.endsWith('.js')) return '📜';
    if (name.endsWith('.xml')) return '📄';
    if (name.endsWith('.json')) return '📦';
    if (name.endsWith('.md') || name.endsWith('.txt')) return '📝';
    if (name.endsWith('.yml') || name.endsWith('.yaml')) return '⚙️';
    return '📄';
  };

  const filterTree = (nodes: TreeNode[], term: string, currentPath = ''): TreeNode[] => {
    if (!term.trim()) return nodes;
    const lowerTerm = term.toLowerCase();

    return nodes.reduce((acc: TreeNode[], node) => {
      const fullPath = currentPath ? `${currentPath}/${node.name}` : node.name;
      if (node.type === 'file') {
        if ((node.name || '').toLowerCase().includes(lowerTerm) || fullPath.toLowerCase().includes(lowerTerm)) {
          acc.push(node);
        }
      } else if (node.type === 'folder' && node.children) {
        const filteredChildren = filterTree(node.children, term, fullPath);
        if (filteredChildren.length > 0 || (node.name || '').toLowerCase().includes(lowerTerm)) {
          acc.push({ ...node, children: filteredChildren });
        }
      }
      return acc;
    }, []);
  };

  const filteredData = filterTree(treeData, search);

  const renderInteractiveTree = (nodes: TreeNode[], currentPath = '', level = 0) => {
    return nodes.map((node) => {
      const fullPath = currentPath ? `${currentPath}/${node.name}` : node.name;
      const isExpanded = expandedFolders.has(fullPath) || Boolean(search.trim());

      return (
        <div key={fullPath} style={{ paddingLeft: `${level * 16}px` }}>
          <div
            className={`tree-node flex items-center justify-between py-1.5 px-2.5 rounded-xl cursor-pointer group text-xs font-mono transition-colors ${
              isLight
                ? 'hover:bg-slate-100 text-slate-800'
                : 'hover:bg-slate-800/70 text-slate-200'
            }`}
            onClick={() => {
              if (node.type === 'folder') toggleFolder(fullPath);
              else if (onViewCode) onViewCode(fullPath);
            }}
          >
            <div className="flex items-center space-x-2 truncate">
              <span className="text-base select-none">{getIcon(node.name, node.type)}</span>
              <span className={`truncate ${
                node.type === 'folder'
                  ? isLight ? 'font-bold text-amber-700' : 'font-bold text-amber-300'
                  : isLight ? 'text-slate-800' : 'text-slate-200'
              }`}>
                {node.name}
              </span>
            </div>
            {node.type === 'file' && (
              <div className="flex items-center space-x-2 text-[10px]">
                {node.lineCount && (
                  <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>{node.lineCount} lines</span>
                )}
                {onViewCode && (
                  <span className={`px-2 py-0.5 rounded-lg border font-medium ${
                    isLight
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  }`}>
                    View
                  </span>
                )}
              </div>
            )}
          </div>

          {node.type === 'folder' && isExpanded && node.children && (
            <div>{renderInteractiveTree(node.children, fullPath, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  // ASCII Tree
  const generateAscii = (nodes: TreeNode[], prefix = ''): string => {
    let res = '';
    nodes.forEach((node, index) => {
      const isLast = index === nodes.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      res += `${prefix}${connector}${node.name}\n`;
      if (node.type === 'folder' && node.children) {
        const newPrefix = prefix + (isLast ? '    ' : '│   ');
        res += generateAscii(node.children, newPrefix);
      }
    });
    return res;
  };

  // Emoji Tree
  const generateEmoji = (nodes: TreeNode[], prefix = ''): string => {
    let res = '';
    nodes.forEach((node, index) => {
      const isLast = index === nodes.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const icon = getIcon(node.name, node.type);
      res += `${prefix}${connector}${icon} ${node.name}\n`;
      if (node.type === 'folder' && node.children) {
        const newPrefix = prefix + (isLast ? '    ' : '│   ');
        res += generateEmoji(node.children, newPrefix);
      }
    });
    return res;
  };

  // Mermaid Diagram
  const generateMermaid = (nodes: TreeNode[]): string => {
    let lines: string[] = ['graph TD'];
    let counter = 1;

    const getId = (name: string) => {
      const sanitized = name.replace(/[^a-zA-Z0-9]/g, '_');
      return `${sanitized}_${counter++}`;
    };

    const walk = (items: TreeNode[], parentId?: string) => {
      items.forEach((item) => {
        const nodeId = getId(item.name);
        const icon = item.type === 'folder' ? '📁' : '📄';
        lines.push(`  ${nodeId}["${icon} ${item.name}"]`);
        if (parentId) {
          lines.push(`  ${parentId} --> ${nodeId}`);
        }
        if (item.type === 'folder' && item.children) {
          walk(item.children, nodeId);
        }
      });
    };

    walk(nodes);
    return lines.join('\n');
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Galaxy Starfield View Canvas Rendering
  useEffect(() => {
    if (viewMode !== 'galaxy' || !canvasRef.current || treeData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 500);

    interface CelestialNode {
      name: string;
      type: 'folder' | 'file';
      x: number;
      y: number;
      radius: number;
      color: string;
      vx: number;
      vy: number;
    }

    const celestialNodes: CelestialNode[] = [];

    const flatten = (items: TreeNode[]) => {
      items.forEach((item) => {
        let color = '#38bdf8';
        if (item.type === 'folder') color = '#fbbf24';
        else if (item.name.endsWith('.java')) color = '#818cf8';
        else if (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) color = '#22d3ee';

        celestialNodes.push({
          name: item.name,
          type: item.type,
          x: Math.random() * (width - 100) + 50,
          y: Math.random() * (height - 100) + 50,
          radius: item.type === 'folder' ? 7 : 4.5,
          color,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
        });

        if (item.children) flatten(item.children);
      });
    };

    flatten(treeData);

    const render = () => {
      ctx.fillStyle = isLight ? '#f8fafc' : '#040711';
      ctx.fillRect(0, 0, width, height);

      // Draw faint connections
      ctx.strokeStyle = isLight ? 'rgba(99, 102, 241, 0.12)' : 'rgba(56, 189, 248, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < celestialNodes.length; i++) {
        for (let j = i + 1; j < celestialNodes.length; j++) {
          const dx = celestialNodes[i].x - celestialNodes[j].x;
          const dy = celestialNodes[i].y - celestialNodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(celestialNodes[i].x, celestialNodes[i].y);
            ctx.lineTo(celestialNodes[j].x, celestialNodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Update and draw nodes
      celestialNodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 30 || node.x > width - 30) node.vx *= -1;
        if (node.y < 30 || node.y > height - 30) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isLight ? 4 : 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = isLight ? '#334155' : 'rgba(226, 232, 240, 0.85)';
        ctx.fillText(node.name, node.x + 9, node.y + 3);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [viewMode, treeData, isLight]);

  if (!isOpen) return null;

  const asciiText = generateAscii(filteredData);
  const emojiText = generateEmoji(filteredData);
  const mermaidText = generateMermaid(filteredData);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`w-full max-w-5xl h-[88vh] max-h-[88vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50'
            : isGlass
            ? 'glass-modal border-slate-700/80 text-white'
            : isNeumorphic
            ? 'neumorphic-card border-slate-700 text-slate-100'
            : 'bg-[#0b0f19] border-slate-800 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4.5 border-b flex items-center justify-between shrink-0 ${
          isLight ? 'bg-slate-50/90 border-slate-200' : 'bg-slate-950/90 border-slate-800/80'
        }`}>
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 text-cyan-400 border border-cyan-500/30">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className={`text-base font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Project File Hierarchy & AST Starfield
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Recursive AST
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Full folder topology with multi-format export (ASCII, Mermaid, Emoji, Starfield Galaxy)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-3 px-3 py-1.5 rounded-xl border text-xs font-mono ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}>
              <span>📁 {stats.totalFolders} folders</span>
              <span>•</span>
              <span>📄 {stats.totalFiles} files</span>
            </div>

            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-all ${
                isLight ? 'hover:bg-slate-200 text-slate-500 hover:text-slate-900' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
          isLight ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-950/40 border-slate-800/80'
        }`}>
          <div className="relative flex-1 max-w-md">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              placeholder="Filter file or directory name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-xl border text-xs font-mono outline-none transition-all ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 focus:border-cyan-500 placeholder-slate-400'
                  : 'bg-slate-900 border-slate-800 text-slate-200 focus:border-cyan-500 placeholder-slate-500'
              }`}
            />
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-mono">
            {[
              { id: 'interactive', label: 'Interactive Tree', icon: Folder },
              { id: 'ascii', label: 'ASCII Tree', icon: FileText },
              { id: 'emoji', label: 'Emoji Tree', icon: Sparkles },
              { id: 'mermaid', label: 'Mermaid Spec', icon: Code2 },
              { id: 'galaxy', label: 'Starfield Galaxy', icon: Orbit },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id as ViewMode)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                    active
                      ? isLight
                        ? 'bg-cyan-500/10 text-cyan-700 border-cyan-400 font-bold shadow-sm'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold shadow-lg shadow-cyan-950/50'
                      : isLight
                      ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 min-h-0 p-6 overflow-y-auto custom-scrollbar ${
          isLight ? 'bg-slate-100/60' : 'bg-slate-950/60'
        }`}>
          {viewMode === 'interactive' && (
            <div className={`p-4 rounded-2xl border shadow-sm ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
            }`}>
              {renderInteractiveTree(filteredData)}
              {filteredData.length === 0 && (
                <div className={`p-8 text-center font-mono text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                  No matching files found.
                </div>
              )}
            </div>
          )}

          {viewMode === 'ascii' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button
                  onClick={() => handleCopyText(asciiText)}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                    isLight
                      ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied ASCII' : 'Copy ASCII Tree'}</span>
                </button>
              </div>
              <div className={`p-5 rounded-2xl border font-mono text-xs overflow-x-auto custom-scrollbar whitespace-pre leading-relaxed ${
                isLight
                  ? 'bg-slate-900 text-amber-300 border-slate-800 shadow-inner'
                  : 'bg-slate-950 text-amber-200/90 border-slate-800 shadow-inner'
              }`}>
                {asciiText}
              </div>
            </div>
          )}

          {viewMode === 'emoji' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button
                  onClick={() => handleCopyText(emojiText)}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                    isLight
                      ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Emoji' : 'Copy Emoji Tree'}</span>
                </button>
              </div>
              <div className={`p-5 rounded-2xl border font-mono text-xs overflow-x-auto custom-scrollbar whitespace-pre leading-relaxed ${
                isLight
                  ? 'bg-slate-900 text-cyan-300 border-slate-800 shadow-inner'
                  : 'bg-slate-950 text-cyan-200/90 border-slate-800 shadow-inner'
              }`}>
                {emojiText}
              </div>
            </div>
          )}

          {viewMode === 'mermaid' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button
                  onClick={() => handleCopyText(mermaidText)}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                    isLight
                      ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Mermaid' : 'Copy Mermaid Code'}</span>
                </button>
              </div>
              <div className={`p-5 rounded-2xl border font-mono text-xs overflow-x-auto custom-scrollbar whitespace-pre leading-relaxed ${
                isLight
                  ? 'bg-slate-900 text-purple-300 border-slate-800 shadow-inner'
                  : 'bg-slate-950 text-purple-200/90 border-slate-800 shadow-inner'
              }`}>
                {mermaidText}
              </div>
            </div>
          )}

          {viewMode === 'galaxy' && (
            <div className={`relative w-full h-[500px] rounded-2xl overflow-hidden border shadow-xl ${
              isLight ? 'border-slate-300 bg-slate-50' : 'border-slate-800 bg-[#040711]'
            }`}>
              <canvas ref={canvasRef} className="w-full h-full block" />
              <div className={`absolute top-4 left-4 backdrop-blur-md px-3.5 py-2 rounded-xl border text-[11px] font-mono shadow-lg ${
                isLight
                  ? 'bg-white/90 border-slate-300 text-slate-800 shadow-slate-200'
                  : 'bg-slate-900/80 border-slate-800 text-slate-200'
              }`}>
                ⭐ <span className="text-amber-500 font-bold">Gold</span> = Folders · <span className="text-indigo-500 font-bold">Purple</span> = Java · <span className="text-cyan-500 font-bold">Cyan</span> = React/TSX
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
