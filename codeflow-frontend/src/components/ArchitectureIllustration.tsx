import React, { useState } from 'react';
import { Sparkles, Activity, Shield, Database, Cpu, Layers, Server, Globe, Zap } from 'lucide-react';
import { ThemeMode } from './Header';

interface ArchitectureIllustrationProps {
  currentTheme?: ThemeMode;
  onExploreLayer?: (layer: string) => void;
}

export const ArchitectureIllustration: React.FC<ArchitectureIllustrationProps> = ({
  currentTheme = 'NIGHT',
  onExploreLayer,
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const isLight = currentTheme === 'NORMAL' || currentTheme === 'GLASSMORPHISM' || currentTheme === 'NEUMORPHIC';

  const nodes = [
    {
      id: 'client',
      label: 'React 19 SPA',
      tech: 'Vite • TanStack Query • Fiber',
      sub: 'Hydrated Client UI',
      icon: Globe,
      color: '#0ea5e9',
      latency: '0.4ms',
      x: 35,
      y: 110,
      width: 145,
      height: 90,
      type: 'Client Layer',
      desc: 'Optimistic UI mutations, virtual DOM diffing, and Axios HTTP request dispatch.',
    },
    {
      id: 'gateway',
      label: 'Security Gateway',
      tech: 'Spring Security 6.2 • JWT',
      sub: 'Token & CORS Filter',
      icon: Shield,
      color: '#6366f1',
      latency: '1.2ms',
      x: 220,
      y: 110,
      width: 145,
      height: 90,
      type: 'Edge & Auth',
      desc: 'Stateless Bearer token validation, HMAC-SHA256 signature verification, and CORS headers.',
    },
    {
      id: 'controller',
      label: 'Spring Controller',
      tech: '@RestController • Java 21',
      sub: 'Dispatcher & Validation',
      icon: Cpu,
      color: '#38bdf8',
      latency: '0.9ms',
      x: 405,
      y: 110,
      width: 145,
      height: 90,
      type: 'API Routing',
      desc: 'Jakarta validation, DTO mapping, and Virtual Thread execution dispatch.',
    },
    {
      id: 'service',
      label: 'Business Service',
      tech: '@Service • @Transactional',
      sub: 'Domain Logic & Events',
      icon: Layers,
      color: '#8b5cf6',
      latency: '14.8ms',
      x: 590,
      y: 110,
      width: 145,
      height: 90,
      type: 'Business Logic',
      desc: 'ACID transaction management, stock reservation, and domain event publishing.',
    },
    {
      id: 'cache',
      label: 'Redis Cache',
      tech: 'In-Memory RAM • TTL 60s',
      sub: 'Fast Cache Hit',
      icon: Zap,
      color: '#10b981',
      latency: '1.1ms',
      x: 775,
      y: 40,
      width: 145,
      height: 80,
      type: 'Cache Cluster',
      desc: 'Sub-millisecond key-value lookup, avoiding costly disk database access.',
    },
    {
      id: 'database',
      label: 'PostgreSQL DB',
      tech: 'Hibernate JPA • HikariCP',
      sub: 'Relational ACID Store',
      icon: Database,
      color: '#f59e0b',
      latency: '4.2ms',
      x: 775,
      y: 160,
      width: 145,
      height: 80,
      type: 'Persistence Store',
      desc: 'B-tree indexed relational tables, foreign keys, and WAL durability.',
    },
  ];

  return (
    <div className={`w-full rounded-2xl border p-5 sm:p-7 relative overflow-hidden transition-all duration-300 shadow-2xl ${
      isLight
        ? 'bg-gradient-to-b from-white via-slate-50 to-slate-100 border-slate-200/90 text-slate-900'
        : 'bg-gradient-to-b from-[#090d16] via-[#0c1222] to-[#090d16] border-slate-800/90 text-slate-100'
    }`}>
      {/* Background Graphic Grid */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: isLight
            ? 'radial-gradient(#94a3b8 1px, transparent 1px)'
            : 'radial-gradient(#334155 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Header Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-500/15 gap-2 relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
          <div className="w-2.5 h-2.5 rounded-full bg-sky-500 -ml-5" />
          <span className="text-xs font-mono font-bold tracking-wider uppercase opacity-80">
            Interactive System Blueprint • Real-Time Flow Simulation
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] font-mono opacity-75">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>5-Hop Pipeline</span>
          </span>
          <span>•</span>
          <span>P95 End-to-End: <strong className="text-sky-400">22.6ms</strong></span>
        </div>
      </div>

      {/* SVG Canvas with Interactive Vector Graphic */}
      <div className="relative w-full overflow-x-auto custom-scrollbar pb-2">
        <svg
          viewBox="0 0 960 280"
          className="w-full min-w-[760px] h-auto select-none"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="pipeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="dbGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="cacheGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
            </linearGradient>

            {/* Filter Glow */}
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Connection Lines (Data Pipes) */}
          <path d="M 180 155 L 220 155" stroke="url(#pipeGlow)" strokeWidth="3" strokeDasharray="4 4" className="animate-pulse" />
          <path d="M 365 155 L 405 155" stroke="url(#pipeGlow)" strokeWidth="3" strokeDasharray="4 4" className="animate-pulse" />
          <path d="M 550 155 L 590 155" stroke="url(#pipeGlow)" strokeWidth="3" strokeDasharray="4 4" className="animate-pulse" />
          <path d="M 735 145 C 750 145, 755 80, 775 80" fill="none" stroke="url(#cacheGlow)" strokeWidth="2.5" strokeDasharray="3 3" />
          <path d="M 735 165 C 750 165, 755 200, 775 200" fill="none" stroke="url(#dbGlow)" strokeWidth="2.5" strokeDasharray="3 3" />

          {/* Animated Flow Particles */}
          <circle r="4" fill="#38bdf8" filter="url(#glowFilter)">
            <animateMotion path="M 180 155 L 365 155 L 550 155 L 735 155" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <circle r="3.5" fill="#10b981" filter="url(#glowFilter)">
            <animateMotion path="M 735 145 C 750 145, 755 80, 775 80" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle r="3.5" fill="#f59e0b" filter="url(#glowFilter)">
            <animateMotion path="M 735 165 C 750 165, 755 200, 775 200" dur="2.4s" repeatCount="indefinite" />
          </circle>

          {/* Node Cards */}
          {nodes.map((node) => {
            const isHovered = hoveredNode === node.id;
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => onExploreLayer?.(node.id)}
                className="cursor-pointer transition-all duration-200"
              >
                {/* Node Outer Container */}
                <rect
                  x="0"
                  y="0"
                  width={node.width}
                  height={node.height}
                  rx="14"
                  fill={
                    isHovered
                      ? isLight ? '#f1f5f9' : '#131b2e'
                      : isLight ? '#ffffff' : '#0b101c'
                  }
                  stroke={isHovered ? node.color : isLight ? '#cbd5e1' : '#1e293b'}
                  strokeWidth={isHovered ? '2' : '1.2'}
                  filter={isHovered ? 'url(#glowFilter)' : undefined}
                />

                {/* Top Accent Line */}
                <rect
                  x="14"
                  y="0"
                  width={node.width - 28}
                  height="2.5"
                  rx="1.25"
                  fill={node.color}
                />

                {/* Node Title */}
                <text
                  x="14"
                  y="26"
                  fill={isLight ? '#0f172a' : '#f8fafc'}
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {node.label}
                </text>

                {/* Subtitle / Annotation */}
                <text
                  x="14"
                  y="44"
                  fill={node.color}
                  fontSize="9.5"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  {node.tech}
                </text>

                {/* Layer Type */}
                <text
                  x="14"
                  y="62"
                  fill={isLight ? '#64748b' : '#94a3b8'}
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {node.sub}
                </text>

                {/* Latency Pill */}
                <rect
                  x={node.width - 48}
                  y={node.height - 22}
                  width="40"
                  height="16"
                  rx="6"
                  fill={isLight ? '#f8fafc' : '#070a12'}
                  stroke={isLight ? '#e2e8f0' : '#1e293b'}
                  strokeWidth="1"
                />
                <text
                  x={node.width - 28}
                  y={node.height - 11}
                  textAnchor="middle"
                  fill="#10b981"
                  fontSize="8.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {node.latency}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Dynamic Hover Detail Card */}
      <div className={`mt-4 p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono transition-all ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0b101c] border-slate-800 text-slate-200'
      }`}>
        {hoveredNode ? (
          (() => {
            const current = nodes.find((n) => n.id === hoveredNode);
            if (!current) return null;
            return (
              <>
                <div className="flex items-center space-x-2.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: current.color }} />
                  <span className="font-bold text-sky-400">{current.label}</span>
                  <span className="opacity-50">|</span>
                  <span className="opacity-80">{current.desc}</span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-500/10 border border-slate-500/20">
                    Latency: {current.latency}
                  </span>
                  <span className="text-sky-400 font-bold">Interactive Hop →</span>
                </div>
              </>
            );
          })()
        ) : (
          <div className="flex items-center justify-between w-full opacity-70">
            <span>Hover over any architecture node above to inspect its execution mechanics and micro-telemetry.</span>
            <span className="text-[10px] text-sky-400 font-bold hidden sm:inline">6 Architecture Hops Active</span>
          </div>
        )}
      </div>
    </div>
  );
};
