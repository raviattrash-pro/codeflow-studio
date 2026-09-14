import React from 'react';

interface GraphicProps {
  isLight?: boolean;
}

export const ReactRuntimeGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <circle cx="40" cy="30" r="14" fill={isLight ? '#e0f2fe' : '#082f49'} stroke="#0ea5e9" strokeWidth="1.5" />
    <text x="40" y="34" textAnchor="middle" fill="#0284c7" fontSize="10" fontWeight="bold" fontFamily="monospace">App</text>
    <line x1="54" y1="30" x2="90" y2="20" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="2 2" />
    <line x1="54" y1="30" x2="90" y2="40" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="2 2" />
    <circle cx="105" cy="20" r="11" fill={isLight ? '#f0f9ff' : '#0c4a6e'} stroke="#38bdf8" strokeWidth="1.2" />
    <text x="105" y="23" textAnchor="middle" fill="#38bdf8" fontSize="8" fontFamily="monospace">Fiber</text>
    <circle cx="105" cy="40" r="11" fill={isLight ? '#f0f9ff' : '#0c4a6e'} stroke="#38bdf8" strokeWidth="1.2" />
    <text x="105" y="43" textAnchor="middle" fill="#38bdf8" fontSize="8" fontFamily="monospace">Hook</text>
    <line x1="116" y1="20" x2="160" y2="30" stroke="#38bdf8" strokeWidth="1.5" />
    <line x1="116" y1="40" x2="160" y2="30" stroke="#38bdf8" strokeWidth="1.5" />
    <rect x="160" y="18" width="65" height="24" rx="6" fill={isLight ? '#eff6ff' : '#1e3a8a'} stroke="#60a5fa" strokeWidth="1" />
    <text x="192" y="33" textAnchor="middle" fill="#93c5fd" fontSize="8.5" fontWeight="bold" fontFamily="monospace">DOM Commit</text>
  </svg>
);

export const TracingGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <line x1="20" y1="30" x2="220" y2="30" stroke={isLight ? '#cbd5e1' : '#1e293b'} strokeWidth="3" rx="1.5" />
    {[
      { x: 35, col: '#06b6d4', label: '1.req', t: '0.5ms' },
      { x: 85, col: '#3b82f6', label: '2.jwt', t: '1.2ms' },
      { x: 135, col: '#8b5cf6', label: '3.srv', t: '14ms' },
      { x: 195, col: '#f59e0b', label: '4.sql', t: '4.2ms' },
    ].map((step, i) => (
      <g key={i}>
        <circle cx={step.x} cy="30" r="8" fill={isLight ? '#ffffff' : '#0f172a'} stroke={step.col} strokeWidth="2" />
        <circle cx={step.x} cy="30" r="3" fill={step.col} />
        <text x={step.x} y="15" textAnchor="middle" fill={step.col} fontSize="7.5" fontWeight="bold" fontFamily="monospace">{step.label}</text>
        <text x={step.x} y="48" textAnchor="middle" fill={isLight ? '#64748b' : '#94a3b8'} fontSize="7" fontFamily="monospace">{step.t}</text>
      </g>
    ))}
  </svg>
);

export const ApiMetricsGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <path d="M 20 48 Q 50 45, 75 32 T 130 38 T 175 18 T 220 24 L 220 52 L 20 52 Z" fill={isLight ? '#e0e7ff' : '#1e1b4b'} opacity="0.6" />
    <path d="M 20 48 Q 50 45, 75 32 T 130 38 T 175 18 T 220 24" fill="none" stroke="#6366f1" strokeWidth="2" />
    <line x1="20" y1="26" x2="220" y2="26" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
    <text x="215" y="22" textAnchor="end" fill="#ef4444" fontSize="7" fontFamily="monospace">P95: 28ms</text>
    <circle cx="175" cy="18" r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="1" />
  </svg>
);

export const SequenceGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <line x1="40" y1="12" x2="40" y2="52" stroke={isLight ? '#94a3b8' : '#334155'} strokeWidth="1.5" strokeDasharray="2 2" />
    <line x1="120" y1="12" x2="120" y2="52" stroke={isLight ? '#94a3b8' : '#334155'} strokeWidth="1.5" strokeDasharray="2 2" />
    <line x1="200" y1="12" x2="200" y2="52" stroke={isLight ? '#94a3b8' : '#334155'} strokeWidth="1.5" strokeDasharray="2 2" />
    <text x="40" y="10" textAnchor="middle" fill="#0284c7" fontSize="7.5" fontWeight="bold" fontFamily="monospace">Client</text>
    <text x="120" y="10" textAnchor="middle" fill="#6366f1" fontSize="7.5" fontWeight="bold" fontFamily="monospace">Gateway</text>
    <text x="200" y="10" textAnchor="middle" fill="#f59e0b" fontSize="7.5" fontWeight="bold" fontFamily="monospace">Service</text>
    <path d="M 42 24 L 115 24" stroke="#0284c7" strokeWidth="1.5" />
    <polygon points="115,22 119,24 115,26" fill="#0284c7" />
    <path d="M 122 36 L 195 36" stroke="#6366f1" strokeWidth="1.5" />
    <polygon points="195,34 199,36 195,38" fill="#6366f1" />
    <path d="M 198 48 L 42 48" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3 2" />
  </svg>
);

export const HeatmapGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    {Array.from({ length: 18 }).map((_, i) => {
      const x = 20 + (i % 9) * 23;
      const y = i < 9 ? 12 : 32;
      const intensities = [0.2, 0.4, 0.8, 0.3, 0.9, 0.5, 0.2, 0.6, 0.4, 0.3, 0.7, 0.2, 0.95, 0.4, 0.3, 0.8, 0.5, 0.2];
      const intensity = intensities[i];
      const col = intensity > 0.85 ? '#f97316' : intensity > 0.6 ? '#6366f1' : intensity > 0.3 ? '#3b82f6' : '#0284c7';
      return (
        <rect
          key={i}
          x={x}
          y={y}
          width="20"
          height="16"
          rx="4"
          fill={col}
          opacity={intensity > 0.85 ? 1 : intensity}
        />
      );
    })}
  </svg>
);

export const ErdGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <rect x="25" y="10" width="80" height="42" rx="6" fill={isLight ? '#f0fdf4' : '#064e3b'} stroke="#10b981" strokeWidth="1.2" />
    <text x="35" y="24" fill="#10b981" fontSize="8" fontWeight="bold" fontFamily="monospace">users</text>
    <text x="35" y="36" fill={isLight ? '#475569' : '#94a3b8'} fontSize="6.5" fontFamily="monospace">PK id : bigint</text>
    <text x="35" y="46" fill={isLight ? '#475569' : '#94a3b8'} fontSize="6.5" fontFamily="monospace">email : text</text>
    <path d="M 105 30 C 125 30, 130 30, 145 30" stroke="#10b981" strokeWidth="1.5" />
    <circle cx="105" cy="30" r="2.5" fill="#10b981" />
    <circle cx="145" cy="30" r="2.5" fill="#10b981" />
    <rect x="145" y="10" width="80" height="42" rx="6" fill={isLight ? '#f0fdf4' : '#064e3b'} stroke="#10b981" strokeWidth="1.2" />
    <text x="155" y="24" fill="#10b981" fontSize="8" fontWeight="bold" fontFamily="monospace">orders</text>
    <text x="155" y="36" fill={isLight ? '#475569' : '#94a3b8'} fontSize="6.5" fontFamily="monospace">PK id : bigint</text>
    <text x="155" y="46" fill={isLight ? '#475569' : '#94a3b8'} fontSize="6.5" fontFamily="monospace">FK user_id</text>
  </svg>
);

export const SecurityGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <rect x="25" y="14" width="60" height="34" rx="6" fill={isLight ? '#eef2ff' : '#1e1b4b'} stroke="#6366f1" strokeWidth="1" />
    <text x="55" y="28" textAnchor="middle" fill="#818cf8" fontSize="7" fontWeight="bold" fontFamily="monospace">Bearer</text>
    <text x="55" y="40" textAnchor="middle" fill="#6366f1" fontSize="7" fontFamily="monospace">JWT Token</text>
    <line x1="85" y1="31" x2="115" y2="31" stroke="#6366f1" strokeWidth="1.5" />
    <polygon points="135,16 155,24 155,42 135,50 115,42 115,24" fill={isLight ? '#fdf4ff' : '#3b0764'} stroke="#a855f7" strokeWidth="1.2" />
    <text x="135" y="35" textAnchor="middle" fill="#c084fc" fontSize="8" fontWeight="bold" fontFamily="monospace">HS256</text>
    <line x1="155" y1="31" x2="185" y2="31" stroke="#10b981" strokeWidth="1.5" />
    <circle cx="200" cy="31" r="12" fill={isLight ? '#f0fdf4' : '#064e3b'} stroke="#10b981" strokeWidth="1.2" />
    <text x="200" y="35" textAnchor="middle" fill="#34d399" fontSize="10">✓</text>
  </svg>
);

export const AiGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <rect x="25" y="10" width="190" height="42" rx="8" fill={isLight ? '#f8fafc' : '#070a12'} stroke={isLight ? '#cbd5e1' : '#1e293b'} strokeWidth="1" />
    <circle cx="38" cy="22" r="3" fill="#ef4444" />
    <circle cx="48" cy="22" r="3" fill="#eab308" />
    <circle cx="58" cy="22" r="3" fill="#22c55e" />
    <text x="75" y="24" fill="#0ea5e9" fontSize="7.5" fontWeight="bold" fontFamily="monospace">AI Audit: 0 Anti-Patterns Found</text>
    <rect x="35" y="32" width="80" height="12" rx="3" fill="#0ea5e9" opacity="0.15" />
    <text x="75" y="41" textAnchor="middle" fill="#38bdf8" fontSize="6.5" fontFamily="monospace">N+1 Query Safe</text>
    <rect x="125" y="32" width="80" height="12" rx="3" fill="#10b981" opacity="0.15" />
    <text x="165" y="41" textAnchor="middle" fill="#34d399" fontSize="6.5" fontFamily="monospace">Stateless Auth OK</text>
  </svg>
);

export const SqlGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <rect x="25" y="10" width="190" height="42" rx="8" fill={isLight ? '#fffbeb' : '#291b00'} stroke="#d97706" strokeWidth="1" />
    <text x="35" y="24" fill="#f59e0b" fontSize="7.5" fontWeight="bold" fontFamily="monospace">SELECT u.id, u.email FROM users</text>
    <text x="35" y="36" fill={isLight ? '#92400e' : '#fbbf24'} fontSize="7" fontFamily="monospace">WHERE active = true LIMIT 50;</text>
    <rect x="155" y="30" width="50" height="14" rx="4" fill="#10b981" opacity="0.2" />
    <text x="180" y="40" textAnchor="middle" fill="#10b981" fontSize="7" fontWeight="bold" fontFamily="monospace">1.8ms (Hit)</text>
  </svg>
);

export const DepsGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <circle cx="60" cy="30" r="16" fill={isLight ? '#eef2ff' : '#1e1b4b'} stroke="#6366f1" strokeWidth="1.2" />
    <text x="60" y="33" textAnchor="middle" fill="#818cf8" fontSize="7.5" fontWeight="bold" fontFamily="monospace">spring-web</text>
    <line x1="76" y1="30" x2="115" y2="20" stroke="#6366f1" strokeWidth="1" strokeDasharray="2 2" />
    <line x1="76" y1="30" x2="115" y2="40" stroke="#6366f1" strokeWidth="1" strokeDasharray="2 2" />
    <circle cx="135" cy="20" r="14" fill={isLight ? '#eff6ff' : '#172554'} stroke="#3b82f6" strokeWidth="1" />
    <text x="135" y="23" textAnchor="middle" fill="#60a5fa" fontSize="6.5" fontFamily="monospace">jackson</text>
    <circle cx="135" cy="40" r="14" fill={isLight ? '#eff6ff' : '#172554'} stroke="#3b82f6" strokeWidth="1" />
    <text x="135" y="43" textAnchor="middle" fill="#60a5fa" fontSize="6.5" fontFamily="monospace">tomcat</text>
    <line x1="149" y1="20" x2="185" y2="30" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2" />
    <circle cx="195" cy="30" r="10" fill={isLight ? '#f0fdf4' : '#064e3b'} stroke="#10b981" strokeWidth="1" />
    <text x="195" y="33" textAnchor="middle" fill="#34d399" fontSize="6" fontFamily="monospace">core</text>
  </svg>
);

export const FileTreeGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <text x="30" y="18" fill="#0284c7" fontSize="8" fontWeight="bold" fontFamily="monospace">📁 src/main/java</text>
    <line x1="38" y1="22" x2="38" y2="48" stroke={isLight ? '#cbd5e1' : '#334155'} strokeWidth="1" />
    <line x1="38" y1="32" x2="52" y2="32" stroke={isLight ? '#cbd5e1' : '#334155'} strokeWidth="1" />
    <text x="56" y="35" fill="#38bdf8" fontSize="7.5" fontFamily="monospace">📄 OrderController.java</text>
    <line x1="38" y1="46" x2="52" y2="46" stroke={isLight ? '#cbd5e1' : '#334155'} strokeWidth="1" />
    <text x="56" y="49" fill="#818cf8" fontSize="7.5" fontFamily="monospace">📄 OrderService.java</text>
  </svg>
);

export const ExportGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <rect x="50" y="8" width="140" height="46" rx="6" fill={isLight ? '#f8fafc' : '#070a12'} stroke="#10b981" strokeWidth="1.2" />
    <text x="65" y="24" fill="#10b981" fontSize="8" fontWeight="bold" fontFamily="monospace"># Architecture.md</text>
    <line x1="65" y1="30" x2="165" y2="30" stroke={isLight ? '#e2e8f0' : '#1e293b'} strokeWidth="2" />
    <line x1="65" y1="36" x2="140" y2="36" stroke={isLight ? '#e2e8f0' : '#1e293b'} strokeWidth="2" />
    <line x1="65" y1="42" x2="175" y2="42" stroke={isLight ? '#e2e8f0' : '#1e293b'} strokeWidth="2" />
    <circle cx="175" cy="20" r="5" fill="#10b981" />
    <text x="175" y="23" textAnchor="middle" fill="#ffffff" fontSize="6">↓</text>
  </svg>
);
