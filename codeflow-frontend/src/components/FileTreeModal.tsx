import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Search, Folder, FileCode, Copy, Check, Sparkles, Orbit, Network, FileText, Code2 } from 'lucide-react';

interface FileTreeModalProps {
  projectId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onViewCode?: (filePath: string) => void;
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
}) => {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [stats, setStats] = useState<FileTreeStats>({ totalFolders: 0, totalFiles: 0 });
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('interactive');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src']));
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen && projectId) {
      axios
        .get<FileTreeResponse>(`/api/v1/projects/${projectId}/file-tree`)
        .then((res) => {
          const root = res.data;
          const children = root.children || [root];
          setTreeData(children);
          if (root.stats) {
            setStats(root.stats);
          } else {
            setStats(calculateStats(children));
          }
        })
        .catch(() => {
          setTreeData([]);
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
        if (node.name.toLowerCase().includes(lowerTerm) || fullPath.toLowerCase().includes(lowerTerm)) {
          acc.push(node);
        }
      } else if (node.type === 'folder' && node.children) {
        const filteredChildren = filterTree(node.children, term, fullPath);
        if (filteredChildren.length > 0 || node.name.toLowerCase().includes(lowerTerm)) {
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
            className="tree-node flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-800/60 cursor-pointer group text-xs font-mono"
            onClick={() => {
              if (node.type === 'folder') toggleFolder(fullPath);
              else if (onViewCode) onViewCode(fullPath);
            }}
          >
            <div className="flex items-center space-x-2 truncate">
              <span className="text-base select-none">{getIcon(node.name, node.type)}</span>
              <span className={`truncate ${node.type === 'folder' ? 'font-bold text-amber-200' : 'text-slate-200'}`}>
                {node.name}
              </span>
            </div>
            {node.type === 'file' && (
              <div className="flex items-center space-x-2 text-[10px] text-slate-500 opacity-80 group-hover:opacity-100">
                {node.lineCount && <span>{node.lineCount} lines</span>}
                {onViewCode && (
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
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
    if (viewMode !== 'galaxy' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    // Flatten tree nodes into stars
    interface GalaxyNode {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      name: string;
      color: string;
      isFolder: boolean;
      path: string;
    }

    const nodes: GalaxyNode[] = [];
    const centerX = width / 2;
    const centerY = height / 2;

    const flatten = (items: TreeNode[], depth = 1, currentPath = '') => {
      items.forEach((item, idx) => {
        const fullPath = currentPath ? `${currentPath}/${item.name}` : item.name;
        const angle = (idx / items.length) * Math.PI * 2 + depth;
        const dist = depth * 70 + Math.random() * 30;
        const x = centerX + Math.cos(angle) * dist;
        const y = centerY + Math.sin(angle) * dist;

        nodes.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: item.type === 'folder' ? 6 : 4,
          name: item.name,
          color: item.type === 'folder' ? '#fbbf24' : item.name.endsWith('.java') ? '#818cf8' : '#22d3ee',
          isFolder: item.type === 'folder',
          path: fullPath,
        });

        if (item.children) {
          flatten(item.children, depth + 1, fullPath);
        }
      });
    };

    flatten(filteredData);

    const render = () => {
      ctx.fillStyle = '#060912';
      ctx.fillRect(0, 0, width, height);

      // Draw connections to center
      ctx.lineWidth = 0.5;
      nodes.forEach((n) => {
        ctx.strokeStyle = `${n.color}33`;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(n.x, n.y);
        ctx.stroke();

        // Update particle physics
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 50 || n.x > width - 50) n.vx *= -1;
        if (n.y < 50 || n.y > height - 50) n.vy *= -1;

        // Draw star
        ctx.shadowBlur = 10;
        ctx.shadowColor = n.color;
        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '10px monospace';
        ctx.fillText(n.name, n.x + 8, n.y + 3);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [viewMode, filteredData]);

  if (!isOpen) return null;

  const asciiText = generateAscii(filteredData);
  const emojiText = generateEmoji(filteredData);
  const mermaidText = generateMermaid(filteredData);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="w-full max-w-5xl h-[85vh] max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center space-x-2">
                <span>File Tree & Architecture Visualizer</span>
                <span className="px-2 py-0.5 text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
                  {stats.totalFolders} Folders · {stats.totalFiles} Files
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Interactive project tree, ASCII, Emoji, Mermaid AST, and Galaxy Starfield view
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

        {/* View Mode Tabs & Filter */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search files and folders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-mono">
            {[
              { id: 'interactive', label: 'Interactive', icon: Folder },
              { id: 'ascii', label: 'ASCII Tree', icon: FileText },
              { id: 'emoji', label: 'Emoji Tree', icon: Sparkles },
              { id: 'mermaid', label: 'Mermaid', icon: Code2 },
              { id: 'galaxy', label: 'Galaxy View', icon: Orbit },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id as ViewMode)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                    active
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
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
        <div className="flex-1 min-h-0 p-6 overflow-y-auto custom-scrollbar bg-slate-950/50">
          {viewMode === 'interactive' && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              {renderInteractiveTree(filteredData)}
              {filteredData.length === 0 && (
                <div className="p-8 text-center text-slate-500 font-mono text-xs">No matching files found.</div>
              )}
            </div>
          )}

          {viewMode === 'ascii' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button
                  onClick={() => handleCopyText(asciiText)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied ASCII' : 'Copy ASCII Tree'}</span>
                </button>
              </div>
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-200/90 overflow-x-auto custom-scrollbar whitespace-pre leading-relaxed">
                {asciiText}
              </div>
            </div>
          )}

          {viewMode === 'emoji' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button
                  onClick={() => handleCopyText(emojiText)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Emoji' : 'Copy Emoji Tree'}</span>
                </button>
              </div>
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-200/90 overflow-x-auto custom-scrollbar whitespace-pre leading-relaxed">
                {emojiText}
              </div>
            </div>
          )}

          {viewMode === 'mermaid' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button
                  onClick={() => handleCopyText(mermaidText)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Mermaid' : 'Copy Mermaid Code'}</span>
                </button>
              </div>
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-purple-200/90 overflow-x-auto custom-scrollbar whitespace-pre leading-relaxed">
                {mermaidText}
              </div>
            </div>
          )}

          {viewMode === 'galaxy' && (
            <div className="relative w-full h-[500px] rounded-2xl overflow-hidden border border-slate-800 bg-[#060912]">
              <canvas ref={canvasRef} className="w-full h-full block" />
              <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
                ⭐ <span className="text-amber-400 font-bold">Gold</span> = Folders · <span className="text-indigo-400 font-bold">Purple</span> = Java · <span className="text-cyan-400 font-bold">Cyan</span> = React/TSX
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
