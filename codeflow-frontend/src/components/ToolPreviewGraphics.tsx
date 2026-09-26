import React from 'react';

interface GraphicProps {
  isLight?: boolean;
}

// ─── 1. REACT 19 RUNTIME EXPLORER ───
export const ReactRuntimeGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes reactFlow { from { stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }
        @keyframes reactPulse { 0%, 100% { r: 14; opacity: 1; } 50% { r: 15.5; opacity: 0.85; } }
        @keyframes reactPacket { 0% { cx: 54; cy: 30; opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { cx: 160; cy: 30; opacity: 0; } }
      `}</style>
    </defs>
    <circle cx="40" cy="30" r="14" fill={isLight ? '#e0f2fe' : '#082f49'} stroke="#0ea5e9" strokeWidth="1.5" style={{ animation: 'reactPulse 2.5s ease-in-out infinite' }} />
    <text x="40" y="34" textAnchor="middle" fill="#0284c7" fontSize="10" fontWeight="bold" fontFamily="monospace">App</text>
    
    <line x1="54" y1="30" x2="90" y2="20" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="3 3" style={{ animation: 'reactFlow 1.2s linear infinite' }} />
    <line x1="54" y1="30" x2="90" y2="40" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="3 3" style={{ animation: 'reactFlow 1.2s linear infinite' }} />
    
    <circle cx="105" cy="20" r="11" fill={isLight ? '#f0f9ff' : '#0c4a6e'} stroke="#38bdf8" strokeWidth="1.2" />
    <text x="105" y="23" textAnchor="middle" fill="#38bdf8" fontSize="8" fontFamily="monospace">Fiber</text>
    <circle cx="105" cy="40" r="11" fill={isLight ? '#f0f9ff' : '#0c4a6e'} stroke="#38bdf8" strokeWidth="1.2" />
    <text x="105" y="43" textAnchor="middle" fill="#38bdf8" fontSize="8" fontFamily="monospace">Hook</text>
    
    <line x1="116" y1="20" x2="160" y2="30" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" style={{ animation: 'reactFlow 1.2s linear infinite' }} />
    <line x1="116" y1="40" x2="160" y2="30" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" style={{ animation: 'reactFlow 1.2s linear infinite' }} />
    
    <circle r="3" fill="#38bdf8" style={{ animation: 'reactPacket 2s ease-in-out infinite' }} />
    
    <rect x="160" y="18" width="68" height="24" rx="6" fill={isLight ? '#eff6ff' : '#1e3a8a'} stroke="#60a5fa" strokeWidth="1.2" />
    <text x="194" y="33" textAnchor="middle" fill="#93c5fd" fontSize="8.5" fontWeight="bold" fontFamily="monospace">DOM Commit</text>
  </svg>
);

// ─── 2. RUNTIME TRACING REPLAY ───
export const TracingGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes traceTravel { 0% { cx: 20; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { cx: 220; opacity: 0; } }
        @keyframes nodePulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
      `}</style>
    </defs>
    <line x1="20" y1="30" x2="220" y2="30" stroke={isLight ? '#cbd5e1' : '#1e293b'} strokeWidth="3" rx="1.5" />
    <circle cy="30" r="4" fill="#38bdf8" style={{ animation: 'traceTravel 2.4s ease-in-out infinite' }} />
    {[
      { x: 35, col: '#06b6d4', label: '1.req', t: '0.5ms', delay: '0s' },
      { x: 85, col: '#3b82f6', label: '2.jwt', t: '1.2ms', delay: '0.6s' },
      { x: 135, col: '#8b5cf6', label: '3.srv', t: '14ms', delay: '1.2s' },
      { x: 195, col: '#f59e0b', label: '4.sql', t: '4.2ms', delay: '1.8s' },
    ].map((step, i) => (
      <g key={i}>
        <circle cx={step.x} cy="30" r="8" fill={isLight ? '#ffffff' : '#0f172a'} stroke={step.col} strokeWidth="2" />
        <circle cx={step.x} cy="30" r="3" fill={step.col} style={{ transformOrigin: `${step.x}px 30px`, animation: `nodePulse 2s ease-in-out infinite ${step.delay}` }} />
        <text x={step.x} y="15" textAnchor="middle" fill={step.col} fontSize="7.5" fontWeight="bold" fontFamily="monospace">{step.label}</text>
        <text x={step.x} y="48" textAnchor="middle" fill={isLight ? '#64748b' : '#94a3b8'} fontSize="7" fontFamily="monospace">{step.t}</text>
      </g>
    ))}
  </svg>
);

// ─── 3. API METRICS & TELEMETRY ───
export const ApiMetricsGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes p95Beacon { 0%, 100% { r: 4; opacity: 1; } 50% { r: 6.5; opacity: 0.5; } }
        @keyframes dashMove { to { stroke-dashoffset: -16; } }
      `}</style>
      <linearGradient id="metricGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
      </linearGradient>
    </defs>
    <path d="M 20 48 Q 50 45, 75 32 T 130 38 T 175 18 T 220 24 L 220 52 L 20 52 Z" fill="url(#metricGrad)" />
    <path d="M 20 48 Q 50 45, 75 32 T 130 38 T 175 18 T 220 24" fill="none" stroke="#6366f1" strokeWidth="2" />
    <line x1="20" y1="26" x2="220" y2="26" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 3" style={{ animation: 'dashMove 1.5s linear infinite' }} />
    <text x="215" y="22" textAnchor="end" fill="#ef4444" fontSize="7" fontWeight="bold" fontFamily="monospace">P95: 28ms</text>
    <circle cx="175" cy="18" r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" style={{ animation: 'p95Beacon 1.8s ease-in-out infinite' }} />
  </svg>
);

// ─── 4. 7-SWIMLANE SEQUENCE TRACER ───
export const SequenceGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes seqFlow { to { stroke-dashoffset: -12; } }
        @keyframes seqPacket1 { 0% { cx: 42; opacity: 0; } 10% { opacity: 1; } 45% { cx: 115; opacity: 1; } 50% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes seqPacket2 { 0%, 45% { opacity: 0; } 50% { cx: 122; opacity: 1; } 90% { cx: 195; opacity: 1; } 95% { opacity: 0; } 100% { opacity: 0; } }
      `}</style>
    </defs>
    <line x1="40" y1="12" x2="40" y2="52" stroke={isLight ? '#94a3b8' : '#334155'} strokeWidth="1.5" strokeDasharray="2 2" />
    <line x1="120" y1="12" x2="120" y2="52" stroke={isLight ? '#94a3b8' : '#334155'} strokeWidth="1.5" strokeDasharray="2 2" />
    <line x1="200" y1="12" x2="200" y2="52" stroke={isLight ? '#94a3b8' : '#334155'} strokeWidth="1.5" strokeDasharray="2 2" />
    <text x="40" y="10" textAnchor="middle" fill="#0284c7" fontSize="7.5" fontWeight="bold" fontFamily="monospace">Client</text>
    <text x="120" y="10" textAnchor="middle" fill="#6366f1" fontSize="7.5" fontWeight="bold" fontFamily="monospace">Gateway</text>
    <text x="200" y="10" textAnchor="middle" fill="#f59e0b" fontSize="7.5" fontWeight="bold" fontFamily="monospace">Service</text>
    
    <path d="M 42 24 L 115 24" stroke="#0284c7" strokeWidth="1.5" />
    <polygon points="115,22 119,24 115,26" fill="#0284c7" />
    <circle cy="24" r="2.5" fill="#38bdf8" style={{ animation: 'seqPacket1 2.5s ease-in-out infinite' }} />

    <path d="M 122 36 L 195 36" stroke="#6366f1" strokeWidth="1.5" />
    <polygon points="195,34 199,36 195,38" fill="#6366f1" />
    <circle cy="36" r="2.5" fill="#a855f7" style={{ animation: 'seqPacket2 2.5s ease-in-out infinite' }} />

    <path d="M 198 48 L 42 48" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3 2" style={{ animation: 'seqFlow 1.2s linear infinite' }} />
  </svg>
);

// ─── 5. 24-HOUR LATENCY HEATMAP ───
export const HeatmapGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes heatPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
      `}</style>
    </defs>
    {Array.from({ length: 18 }).map((_, i) => {
      const x = 20 + (i % 9) * 23;
      const y = i < 9 ? 12 : 32;
      const intensities = [0.2, 0.4, 0.8, 0.3, 0.9, 0.5, 0.2, 0.6, 0.4, 0.3, 0.7, 0.2, 0.95, 0.4, 0.3, 0.8, 0.5, 0.2];
      const intensity = intensities[i];
      const col = intensity > 0.85 ? '#f97316' : intensity > 0.6 ? '#6366f1' : intensity > 0.3 ? '#3b82f6' : '#0284c7';
      const delay = `${(i * 0.15) % 2}s`;
      return (
        <rect
          key={i}
          x={x}
          y={y}
          width="20"
          height="16"
          rx="4"
          fill={col}
          style={{ animation: `heatPulse 2s ease-in-out infinite ${delay}` }}
        />
      );
    })}
  </svg>
);

// ─── 6. DATABASE ERD & SQL EXPLORER ───
export const ErdGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes erdFlow { to { stroke-dashoffset: -16; } }
        @keyframes erdDot { 0% { cx: 105; opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { cx: 145; opacity: 0; } }
      `}</style>
    </defs>
    <rect x="25" y="10" width="80" height="42" rx="6" fill={isLight ? '#f0fdf4' : '#064e3b'} stroke="#10b981" strokeWidth="1.2" />
    <text x="35" y="24" fill="#10b981" fontSize="8" fontWeight="bold" fontFamily="monospace">users</text>
    <text x="35" y="36" fill={isLight ? '#475569' : '#94a3b8'} fontSize="6.5" fontFamily="monospace">PK id : bigint</text>
    <text x="35" y="46" fill={isLight ? '#475569' : '#94a3b8'} fontSize="6.5" fontFamily="monospace">email : text</text>
    
    <path d="M 105 30 L 145 30" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" style={{ animation: 'erdFlow 1.2s linear infinite' }} />
    <circle cx="105" cy="30" r="2.5" fill="#10b981" />
    <circle cx="145" cy="30" r="2.5" fill="#10b981" />
    <circle cy="30" r="2.5" fill="#34d399" style={{ animation: 'erdDot 2s ease-in-out infinite' }} />

    <rect x="145" y="10" width="80" height="42" rx="6" fill={isLight ? '#f0fdf4' : '#064e3b'} stroke="#10b981" strokeWidth="1.2" />
    <text x="155" y="24" fill="#10b981" fontSize="8" fontWeight="bold" fontFamily="monospace">orders</text>
    <text x="155" y="36" fill={isLight ? '#475569' : '#94a3b8'} fontSize="6.5" fontFamily="monospace">PK id : bigint</text>
    <text x="155" y="46" fill={isLight ? '#475569' : '#94a3b8'} fontSize="6.5" fontFamily="monospace">FK user_id</text>
  </svg>
);

// ─── 7. AI CODE & SECURITY ASSISTANT ───
export const AiGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes aiScanline { 0% { transform: translateX(0); opacity: 0; } 30% { opacity: 0.8; } 70% { opacity: 0.8; } 100% { transform: translateX(180px); opacity: 0; } }
        @keyframes dotBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </defs>
    <rect x="25" y="10" width="190" height="42" rx="8" fill={isLight ? '#f8fafc' : '#070a12'} stroke={isLight ? '#cbd5e1' : '#1e293b'} strokeWidth="1" />
    <line x1="30" y1="12" x2="30" y2="50" stroke="#0ea5e9" strokeWidth="2" style={{ animation: 'aiScanline 3s ease-in-out infinite' }} />
    <circle cx="38" cy="22" r="3" fill="#ef4444" style={{ animation: 'dotBlink 1.5s ease-in-out infinite' }} />
    <circle cx="48" cy="22" r="3" fill="#eab308" style={{ animation: 'dotBlink 1.5s ease-in-out infinite 0.5s' }} />
    <circle cx="58" cy="22" r="3" fill="#22c55e" style={{ animation: 'dotBlink 1.5s ease-in-out infinite 1s' }} />
    <text x="75" y="24" fill="#0ea5e9" fontSize="7.5" fontWeight="bold" fontFamily="monospace">AI Audit: 0 Anti-Patterns Found</text>
    <rect x="35" y="32" width="80" height="12" rx="3" fill="#0ea5e9" opacity="0.15" />
    <text x="75" y="41" textAnchor="middle" fill="#38bdf8" fontSize="6.5" fontFamily="monospace">N+1 Query Safe</text>
    <rect x="125" y="32" width="80" height="12" rx="3" fill="#10b981" opacity="0.15" />
    <text x="165" y="41" textAnchor="middle" fill="#34d399" fontSize="6.5" fontFamily="monospace">Stateless Auth OK</text>
  </svg>
);

// ─── 8. LIVE SQL QUERY EXPLORER ───
export const SqlGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes sqlCursor { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes hitPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      `}</style>
    </defs>
    <rect x="25" y="10" width="190" height="42" rx="8" fill={isLight ? '#fffbeb' : '#291b00'} stroke="#d97706" strokeWidth="1" />
    <text x="35" y="24" fill="#f59e0b" fontSize="7.5" fontWeight="bold" fontFamily="monospace">SELECT u.id, u.email FROM users</text>
    <text x="35" y="36" fill={isLight ? '#92400e' : '#fbbf24'} fontSize="7" fontFamily="monospace">WHERE active = true LIMIT 50;</text>
    <line x1="148" y1="28" x2="148" y2="38" stroke="#f59e0b" strokeWidth="1.5" style={{ animation: 'sqlCursor 1s infinite' }} />
    <rect x="155" y="30" width="52" height="14" rx="4" fill="#10b981" opacity="0.25" style={{ transformOrigin: '181px 37px', animation: 'hitPulse 2s ease-in-out infinite' }} />
    <text x="181" y="40" textAnchor="middle" fill="#10b981" fontSize="7" fontWeight="bold" fontFamily="monospace">1.8ms (Hit)</text>
  </svg>
);

// ─── 9. MAVEN DEPENDENCY GRAPH ───
export const DepsGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes depsFlow { to { stroke-dashoffset: -12; } }
        @keyframes centerPulse { 0%, 100% { r: 16; } 50% { r: 17.5; } }
      `}</style>
    </defs>
    <circle cx="60" cy="30" r="16" fill={isLight ? '#eef2ff' : '#1e1b4b'} stroke="#6366f1" strokeWidth="1.2" style={{ animation: 'centerPulse 3s ease-in-out infinite' }} />
    <text x="60" y="33" textAnchor="middle" fill="#818cf8" fontSize="7.5" fontWeight="bold" fontFamily="monospace">spring-web</text>
    <line x1="76" y1="30" x2="115" y2="20" stroke="#6366f1" strokeWidth="1.2" strokeDasharray="3 3" style={{ animation: 'depsFlow 1.2s linear infinite' }} />
    <line x1="76" y1="30" x2="115" y2="40" stroke="#6366f1" strokeWidth="1.2" strokeDasharray="3 3" style={{ animation: 'depsFlow 1.2s linear infinite' }} />
    <circle cx="135" cy="20" r="14" fill={isLight ? '#eff6ff' : '#172554'} stroke="#3b82f6" strokeWidth="1" />
    <text x="135" y="23" textAnchor="middle" fill="#60a5fa" fontSize="6.5" fontFamily="monospace">jackson</text>
    <circle cx="135" cy="40" r="14" fill={isLight ? '#eff6ff' : '#172554'} stroke="#3b82f6" strokeWidth="1" />
    <text x="135" y="43" textAnchor="middle" fill="#60a5fa" fontSize="6.5" fontFamily="monospace">tomcat</text>
    <line x1="149" y1="20" x2="185" y2="30" stroke="#3b82f6" strokeWidth="1.2" strokeDasharray="3 3" style={{ animation: 'depsFlow 1.2s linear infinite' }} />
    <circle cx="195" cy="30" r="10" fill={isLight ? '#f0fdf4' : '#064e3b'} stroke="#10b981" strokeWidth="1" />
    <text x="195" y="33" textAnchor="middle" fill="#34d399" fontSize="6" fontFamily="monospace">core</text>
  </svg>
);

// ─── 10. INTERACTIVE FILE TREE ───
export const FileTreeGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes fileHighlight { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; } }
      `}</style>
    </defs>
    <text x="30" y="18" fill="#0284c7" fontSize="8" fontWeight="bold" fontFamily="monospace">📁 src/main/java</text>
    <line x1="38" y1="22" x2="38" y2="48" stroke={isLight ? '#cbd5e1' : '#334155'} strokeWidth="1" />
    <line x1="38" y1="32" x2="52" y2="32" stroke={isLight ? '#cbd5e1' : '#334155'} strokeWidth="1" />
    <rect x="54" y="24" width="125" height="14" rx="3" fill="#38bdf8" opacity="0.15" style={{ animation: 'fileHighlight 2s ease-in-out infinite' }} />
    <text x="56" y="34" fill="#38bdf8" fontSize="7.5" fontFamily="monospace">📄 OrderController.java</text>
    <line x1="38" y1="46" x2="52" y2="46" stroke={isLight ? '#cbd5e1' : '#334155'} strokeWidth="1" />
    <text x="56" y="49" fill="#818cf8" fontSize="7.5" fontFamily="monospace">📄 OrderService.java</text>
  </svg>
);

// ─── 11. ARCHITECTURE SPEC EXPORTER ───
export const ExportGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes downloadBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(3px); } }
      `}</style>
    </defs>
    <rect x="50" y="8" width="140" height="46" rx="6" fill={isLight ? '#f8fafc' : '#070a12'} stroke="#10b981" strokeWidth="1.2" />
    <text x="65" y="24" fill="#10b981" fontSize="8" fontWeight="bold" fontFamily="monospace"># Architecture.md</text>
    <line x1="65" y1="30" x2="165" y2="30" stroke={isLight ? '#e2e8f0' : '#1e293b'} strokeWidth="2" />
    <line x1="65" y1="36" x2="140" y2="36" stroke={isLight ? '#e2e8f0' : '#1e293b'} strokeWidth="2" />
    <line x1="65" y1="42" x2="175" y2="42" stroke={isLight ? '#e2e8f0' : '#1e293b'} strokeWidth="2" />
    <g style={{ animation: 'downloadBounce 1.5s ease-in-out infinite' }}>
      <circle cx="175" cy="20" r="6" fill="#10b981" />
      <text x="175" y="23" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">↓</text>
    </g>
  </svg>
);

// ─── 12. ARCHITECTURE HEALTH SCORECARD ───
export const ScorecardGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes gaugeRotate { 0% { stroke-dashoffset: 110; } 100% { stroke-dashoffset: 20; } }
        @keyframes barShimmer { 0%, 100% { opacity: 0.85; } 50% { opacity: 1; } }
      `}</style>
    </defs>
    <circle cx="45" cy="30" r="18" fill="none" stroke={isLight ? '#cbd5e1' : '#1e293b'} strokeWidth="3" />
    <circle cx="45" cy="30" r="18" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="100 100" strokeLinecap="round" style={{ animation: 'gaugeRotate 2s ease-out forwards' }} />
    <text x="45" y="34" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold" fontFamily="monospace">94%</text>
    <rect x="80" y="16" width="130" height="6" rx="3" fill={isLight ? '#e2e8f0' : '#1e293b'} />
    <rect x="80" y="16" width="118" height="6" rx="3" fill="#10b981" style={{ animation: 'barShimmer 2s infinite' }} />
    <rect x="80" y="28" width="130" height="6" rx="3" fill={isLight ? '#e2e8f0' : '#1e293b'} />
    <rect x="80" y="28" width="105" height="6" rx="3" fill="#06b6d4" style={{ animation: 'barShimmer 2s infinite 0.4s' }} />
    <rect x="80" y="40" width="130" height="6" rx="3" fill={isLight ? '#e2e8f0' : '#1e293b'} />
    <rect x="80" y="40" width="125" height="6" rx="3" fill="#8b5cf6" style={{ animation: 'barShimmer 2s infinite 0.8s' }} />
  </svg>
);

// ─── 13. REST API SANDBOX & CURL ───
export const SandboxGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes methodBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
      `}</style>
    </defs>
    <rect x="25" y="14" width="38" height="16" rx="4" fill="#06b6d4" fillOpacity="0.2" stroke="#06b6d4" strokeWidth="1" />
    <text x="44" y="25" textAnchor="middle" fill="#06b6d4" fontSize="8" fontWeight="bold" fontFamily="monospace" style={{ animation: 'methodBlink 2s infinite' }}>POST</text>
    <rect x="70" y="14" width="145" height="16" rx="4" fill={isLight ? '#f1f5f9' : '#0f172a'} stroke={isLight ? '#cbd5e1' : '#334155'} strokeWidth="1" />
    <text x="78" y="25" fill="#38bdf8" fontSize="7.5" fontFamily="monospace">/api/v1/orders/checkout</text>
    <rect x="25" y="36" width="190" height="14" rx="3" fill={isLight ? '#f0fdf4' : '#064e3b'} fillOpacity="0.4" stroke="#10b981" strokeWidth="0.8" />
    <text x="32" y="46" fill="#34d399" fontSize="7" fontFamily="monospace">✓ 201 Created • 48ms • &apos;ord_883&apos; (OK)</text>
  </svg>
);

// ─── 14. JAVA DTO TO TYPESCRIPT GENERATOR ───
export const TsGenGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes arrowSlide { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(4px); } }
      `}</style>
    </defs>
    <rect x="25" y="12" width="80" height="38" rx="5" fill={isLight ? '#fffbeb' : '#451a03'} fillOpacity="0.3" stroke="#f59e0b" strokeWidth="1" />
    <text x="32" y="24" fill="#f59e0b" fontSize="7.5" fontWeight="bold" fontFamily="monospace">class UserDto</text>
    <text x="32" y="34" fill="#fbbf24" fontSize="6.5" fontFamily="monospace">Long id;</text>
    <text x="32" y="44" fill="#fbbf24" fontSize="6.5" fontFamily="monospace">String email;</text>

    <text x="120" y="34" textAnchor="middle" fill="#38bdf8" fontSize="14" fontWeight="bold" style={{ animation: 'arrowSlide 1.5s ease-in-out infinite' }}>➔</text>

    <rect x="135" y="12" width="80" height="38" rx="5" fill={isLight ? '#eff6ff' : '#172554'} fillOpacity="0.4" stroke="#3b82f6" strokeWidth="1" />
    <text x="142" y="24" fill="#60a5fa" fontSize="7.5" fontWeight="bold" fontFamily="monospace">interface User</text>
    <text x="142" y="34" fill="#93c5fd" fontSize="6.5" fontFamily="monospace">id: number;</text>
    <text x="142" y="44" fill="#93c5fd" fontSize="6.5" fontFamily="monospace">email: string;</text>
  </svg>
);

// ─── 15. CHAOS & RESILIENCE SIMULATOR ───
export const ChaosGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes sparkPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.3); } }
        @keyframes chaosLine { to { stroke-dashoffset: -12; } }
      `}</style>
    </defs>
    <rect x="30" y="18" width="55" height="24" rx="6" fill={isLight ? '#f0fdf4' : '#064e3b'} stroke="#10b981" strokeWidth="1" />
    <text x="57" y="32" textAnchor="middle" fill="#34d399" fontSize="7.5" fontWeight="bold" fontFamily="monospace">CLOSED</text>

    <line x1="88" y1="30" x2="110" y2="30" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" style={{ animation: 'chaosLine 1s linear infinite' }} />
    <text x="99" y="24" textAnchor="middle" fill="#ef4444" fontSize="9" style={{ transformOrigin: '99px 21px', animation: 'sparkPulse 1.2s infinite' }}>💥</text>

    <rect x="113" y="18" width="50" height="24" rx="6" fill={isLight ? '#fef2f2' : '#450a0a'} stroke="#ef4444" strokeWidth="1.5" />
    <text x="138" y="32" textAnchor="middle" fill="#f87171" fontSize="7.5" fontWeight="bold" fontFamily="monospace">OPEN</text>

    <line x1="166" y1="30" x2="182" y2="30" stroke="#f59e0b" strokeWidth="1.5" />

    <circle cx="200" cy="30" r="12" fill={isLight ? '#fef3c7' : '#78350f'} stroke="#f59e0b" strokeWidth="1" />
    <text x="200" y="33" textAnchor="middle" fill="#fbbf24" fontSize="6.5" fontWeight="bold" fontFamily="monospace">HALF</text>
  </svg>
);

// ─── 16. 4K BLUEPRINT & C4 EXPORTER ───
export const BlueprintGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes bpFlow { to { stroke-dashoffset: -12; } }
      `}</style>
    </defs>
    <rect x="25" y="10" width="50" height="40" rx="4" fill={isLight ? '#f0f9ff' : '#082f49'} stroke="#0ea5e9" strokeWidth="1" />
    <text x="50" y="28" textAnchor="middle" fill="#38bdf8" fontSize="7" fontWeight="bold" fontFamily="monospace">React 19</text>
    <text x="50" y="38" textAnchor="middle" fill="#7dd3fc" fontSize="5.5" fontFamily="monospace">Client</text>

    <line x1="75" y1="30" x2="105" y2="30" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" style={{ animation: 'bpFlow 1.2s linear infinite' }} />

    <rect x="105" y="10" width="50" height="40" rx="4" fill={isLight ? '#f0fdf4' : '#064e3b'} stroke="#10b981" strokeWidth="1" />
    <text x="130" y="28" textAnchor="middle" fill="#34d399" fontSize="7" fontWeight="bold" fontFamily="monospace">Spring 3</text>
    <text x="130" y="38" textAnchor="middle" fill="#6ee7b7" fontSize="5.5" fontFamily="monospace">Backend</text>

    <line x1="155" y1="30" x2="185" y2="30" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" style={{ animation: 'bpFlow 1.2s linear infinite' }} />

    <rect x="185" y="10" width="40" height="40" rx="4" fill={isLight ? '#faf5ff' : '#3b0764'} stroke="#a855f7" strokeWidth="1" />
    <text x="205" y="28" textAnchor="middle" fill="#c084fc" fontSize="7" fontWeight="bold" fontFamily="monospace">PG 16</text>
    <text x="205" y="38" textAnchor="middle" fill="#d8b4fe" fontSize="5.5" fontFamily="monospace">DB</text>
  </svg>
);

// ─── 17. GIT PR ARCHITECTURE DRIFT ───
export const DriftGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes driftWarning { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.08); } }
      `}</style>
    </defs>
    <rect x="25" y="14" width="70" height="32" rx="4" fill={isLight ? '#f8fafc' : '#0f172a'} stroke="#f59e0b" strokeWidth="1" />
    <text x="60" y="28" textAnchor="middle" fill="#f59e0b" fontSize="7" fontWeight="bold" fontFamily="monospace">main (v7.0)</text>
    <text x="60" y="38" textAnchor="middle" fill="#94a3b8" fontSize="6" fontFamily="monospace">Clean Layers</text>

    <line x1="95" y1="30" x2="140" y2="30" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
    <text x="117" y="24" textAnchor="middle" fill="#ef4444" fontSize="7.5" fontWeight="bold" style={{ transformOrigin: '117px 20px', animation: 'driftWarning 1.5s infinite' }}>⚠️ DRIFT</text>

    <rect x="140" y="14" width="75" height="32" rx="4" fill={isLight ? '#fef2f2' : '#450a0a'} stroke="#ef4444" strokeWidth="1.5" />
    <text x="177" y="28" textAnchor="middle" fill="#f87171" fontSize="7" fontWeight="bold" fontFamily="monospace">feat/pr-142</text>
    <text x="177" y="38" textAnchor="middle" fill="#fca5a5" fontSize="6" fontFamily="monospace">1 Layer Breach</text>
  </svg>
);

// ─── 18. AUTOMATED E2E TEST SUITE GENERATOR ───
export const TestGenGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes plusPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.3); } }
      `}</style>
    </defs>
    <rect x="25" y="12" width="85" height="36" rx="4" fill={isLight ? '#f0fdf4' : '#064e3b'} stroke="#10b981" strokeWidth="1" />
    <text x="67" y="25" textAnchor="middle" fill="#34d399" fontSize="7" fontWeight="bold" fontFamily="monospace">RestAssuredTest</text>
    <text x="67" y="38" textAnchor="middle" fill="#6ee7b7" fontSize="6" fontFamily="monospace">given().when().then()</text>

    <text x="125" y="34" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="bold" style={{ transformOrigin: '125px 30px', animation: 'plusPulse 1.8s infinite' }}>+</text>

    <rect x="140" y="12" width="75" height="36" rx="4" fill={isLight ? '#eff6ff' : '#172554'} stroke="#3b82f6" strokeWidth="1" />
    <text x="177" y="25" textAnchor="middle" fill="#60a5fa" fontSize="7" fontWeight="bold" fontFamily="monospace">Playwright TS</text>
    <text x="177" y="38" textAnchor="middle" fill="#93c5fd" fontSize="6" fontFamily="monospace">expect(201 Created)</text>
  </svg>
);

// ─── 19. CLOUD IAC & DOCKER SYNTHESIZER ───
export const CloudInfraGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes floatAnim { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
      `}</style>
    </defs>
    <rect x="25" y="15" width="55" height="30" rx="4" fill={isLight ? '#f0f9ff' : '#082f49'} stroke="#0ea5e9" strokeWidth="1" style={{ animation: 'floatAnim 3s ease-in-out infinite' }} />
    <text x="52" y="32" textAnchor="middle" fill="#38bdf8" fontSize="7.5" fontWeight="bold" fontFamily="monospace">Docker</text>

    <text x="95" y="34" textAnchor="middle" fill="#94a3b8" fontSize="10">•</text>

    <rect x="110" y="15" width="55" height="30" rx="4" fill={isLight ? '#faf5ff' : '#3b0764'} stroke="#a855f7" strokeWidth="1" style={{ animation: 'floatAnim 3s ease-in-out infinite 1s' }} />
    <text x="137" y="32" textAnchor="middle" fill="#c084fc" fontSize="7.5" fontWeight="bold" fontFamily="monospace">Terraform</text>

    <text x="180" y="34" textAnchor="middle" fill="#94a3b8" fontSize="10">•</text>

    <circle cx="202" cy="30" r="14" fill={isLight ? '#eff6ff' : '#172554'} stroke="#3b82f6" strokeWidth="1" style={{ animation: 'floatAnim 3s ease-in-out infinite 2s' }} />
    <text x="202" y="33" textAnchor="middle" fill="#60a5fa" fontSize="7" fontWeight="bold" fontFamily="monospace">K8s</text>
  </svg>
);

// ─── 20. KAFKA & WEBSOCKET EVENT STREAMS ───
export const EventStreamGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes streamFlow { to { stroke-dashoffset: -16; } }
        @keyframes streamDot { 0% { cx: 54; opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { cx: 110; opacity: 0; } }
      `}</style>
    </defs>
    <circle cx="40" cy="30" r="14" fill={isLight ? '#faf5ff' : '#3b0764'} stroke="#a855f7" strokeWidth="1.2" />
    <text x="40" y="33" textAnchor="middle" fill="#c084fc" fontSize="7" fontWeight="bold" fontFamily="monospace">Pub</text>

    <line x1="54" y1="30" x2="110" y2="30" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 4" style={{ animation: 'streamFlow 1.2s linear infinite' }} />
    <circle cy="30" r="2.5" fill="#f0abfc" style={{ animation: 'streamDot 1.8s ease-in-out infinite' }} />
    <text x="82" y="24" textAnchor="middle" fill="#a855f7" fontSize="6.5" fontFamily="monospace">orders.topic</text>

    <rect x="110" y="16" width="50" height="28" rx="4" fill={isLight ? '#fdf4ff' : '#4a044e'} stroke="#d946ef" strokeWidth="1" />
    <text x="135" y="33" textAnchor="middle" fill="#f0abfc" fontSize="7" fontWeight="bold" fontFamily="monospace">Kafka</text>

    <line x1="160" y1="30" x2="195" y2="30" stroke="#d946ef" strokeWidth="2" strokeDasharray="4 4" style={{ animation: 'streamFlow 1.2s linear infinite' }} />

    <circle cx="205" cy="30" r="12" fill={isLight ? '#f0fdf4' : '#064e3b'} stroke="#10b981" strokeWidth="1" />
    <text x="205" y="33" textAnchor="middle" fill="#34d399" fontSize="6.5" fontWeight="bold" fontFamily="monospace">Sub</text>
  </svg>
);

// ─── 21. VOICE ARCHITECTURE COPILOT ───
export const VoiceCopilotGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes eqBounce { 0%, 100% { transform: scaleY(0.3); } 50% { transform: scaleY(1.15); } }
        @keyframes micPulse { 0%, 100% { r: 16; } 50% { r: 18; } }
      `}</style>
    </defs>
    <circle cx="60" cy="30" r="16" fill={isLight ? '#faf5ff' : '#3b0764'} stroke="#a855f7" strokeWidth="1.5" style={{ animation: 'micPulse 2s infinite' }} />
    <text x="60" y="34" textAnchor="middle" fill="#c084fc" fontSize="12">🎙️</text>

    {[12, 22, 28, 20, 14, 26, 18, 10].map((h, i) => {
      const delays = ['0s', '0.2s', '0.5s', '0.1s', '0.4s', '0.3s', '0.6s', '0.2s'];
      return (
        <rect
          key={i}
          x={95 + i * 8}
          y={30 - h / 2}
          width="4"
          height={h}
          rx="2"
          fill="#a855f7"
          style={{ transformOrigin: `${95 + i * 8 + 2}px 30px`, animation: `eqBounce 1.2s ease-in-out infinite ${delays[i]}` }}
        />
      );
    })}

    <text x="185" y="34" fill="#c084fc" fontSize="7.5" fontWeight="bold" fontFamily="monospace">&quot;Audit DB&quot;</text>
  </svg>
);

// ─── 22. OPENTELEMETRY DISTRIBUTED TRACING ───
export const DistributedTracingGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes spanScan { 0% { x: 30; opacity: 0; } 50% { opacity: 0.8; } 100% { x: 190; opacity: 0; } }
        @keyframes warnBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </defs>
    <line y1="10" y2="52" stroke="#38bdf8" strokeWidth="1.5" style={{ animation: 'spanScan 2.5s ease-in-out infinite' }} />
    <rect x="30" y="14" width="160" height="6" rx="3" fill="#06b6d4" />
    <text x="198" y="20" fill="#06b6d4" fontSize="6.5" fontFamily="monospace">48ms</text>

    <rect x="50" y="24" width="110" height="6" rx="3" fill="#3b82f6" />
    <text x="168" y="30" fill="#3b82f6" fontSize="6.5" fontFamily="monospace">38ms</text>

    <rect x="80" y="34" width="70" height="6" rx="3" fill="#ef4444" />
    <text x="158" y="40" fill="#ef4444" fontSize="6.5" fontWeight="bold" fontFamily="monospace" style={{ animation: 'warnBlink 1.5s infinite' }}>24ms ⚠️</text>

    <rect x="150" y="44" width="20" height="6" rx="3" fill="#10b981" />
  </svg>
);

// ─── 23. VS CODE IDE SIDECAR & EXTENSION ───
export const VsCodeGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes vsFlow { to { stroke-dashoffset: -16; } }
      `}</style>
    </defs>
    <rect x="25" y="10" width="30" height="40" rx="4" fill={isLight ? '#eff6ff' : '#1e293b'} stroke="#3b82f6" strokeWidth="1.2" />
    <line x1="33" y1="18" x2="47" y2="18" stroke="#3b82f6" strokeWidth="2" />
    <line x1="33" y1="24" x2="44" y2="24" stroke="#60a5fa" strokeWidth="1.5" />
    <line x1="33" y1="30" x2="50" y2="30" stroke="#60a5fa" strokeWidth="1.5" />
    
    <path d="M 60 30 L 105 30" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" style={{ animation: 'vsFlow 1.2s linear infinite' }} />
    <polygon points="105,27 111,30 105,33" fill="#3b82f6" />
    
    <rect x="115" y="10" width="100" height="40" rx="4" fill={isLight ? '#f0f9ff' : '#0f172a'} stroke="#0284c7" strokeWidth="1.2" />
    <text x="165" y="26" textAnchor="middle" fill="#0284c7" fontSize="7.5" fontWeight="bold" fontFamily="monospace">codeflow-sidecar</text>
    <text x="165" y="38" textAnchor="middle" fill={isLight ? '#64748b' : '#38bdf8'} fontSize="6.5" fontFamily="monospace">ws://127.0.0.1:4000</text>
  </svg>
);

// ─── 24. CHROME EXTENSION & GITHUB DOM ───
export const ChromeExtGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes chromeFlow { to { stroke-dashoffset: -12; } }
        @keyframes badgeGlow { 0%, 100% { opacity: 0.85; } 50% { opacity: 1; } }
      `}</style>
    </defs>
    <rect x="25" y="12" width="80" height="36" rx="4" fill={isLight ? '#faf5ff' : '#1e1b4b'} stroke="#a855f7" strokeWidth="1.2" />
    <text x="65" y="26" textAnchor="middle" fill="#a855f7" fontSize="7.5" fontWeight="bold" fontFamily="monospace">github.com/repo</text>
    <circle cx="37" cy="36" r="3" fill="#ef4444" />
    <circle cx="45" cy="36" r="3" fill="#eab308" />
    <circle cx="53" cy="36" r="3" fill="#22c55e" />
    <path d="M 110 30 L 135 30" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="3 3" style={{ animation: 'chromeFlow 1.2s linear infinite' }} />
    <rect x="140" y="10" width="75" height="40" rx="6" fill={isLight ? '#fdf2f8' : '#3b0764'} stroke="#ec4899" strokeWidth="1.2" style={{ animation: 'badgeGlow 2s infinite' }} />
    <text x="177" y="26" textAnchor="middle" fill="#ec4899" fontSize="7.5" fontWeight="bold" fontFamily="monospace">DOM Overlay</text>
    <text x="177" y="38" textAnchor="middle" fill="#f472b6" fontSize="6.5" fontFamily="monospace">[View Flow ⚡]</text>
  </svg>
);

// ─── 25. WEBRTC LIVE COLLAB & WHITEBOARD ───
export const LiveCollabGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes p2pFlow { to { stroke-dashoffset: -16; } }
        @keyframes avatarPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
      `}</style>
    </defs>
    <circle cx="45" cy="24" r="10" fill="#3b82f6" style={{ transformOrigin: '45px 24px', animation: 'avatarPulse 2s infinite' }} />
    <text x="45" y="27" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">A</text>
    <text x="45" y="44" textAnchor="middle" fill="#3b82f6" fontSize="6.5" fontFamily="monospace">Alex (Host)</text>
    
    <circle cx="195" cy="24" r="10" fill="#10b981" style={{ transformOrigin: '195px 24px', animation: 'avatarPulse 2s infinite 1s' }} />
    <text x="195" y="27" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">S</text>
    <text x="195" y="44" textAnchor="middle" fill="#10b981" fontSize="6.5" fontFamily="monospace">Sarah</text>
    
    <path d="M 60 24 C 100 10, 140 10, 180 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 4" style={{ animation: 'p2pFlow 1.2s linear infinite' }} />
    <rect x="105" y="14" width="30" height="18" rx="4" fill={isLight ? '#eff6ff' : '#1e1b4b'} stroke="#6366f1" strokeWidth="1" />
    <text x="120" y="26" textAnchor="middle" fill="#6366f1" fontSize="7" fontWeight="bold" fontFamily="monospace">P2P</text>
  </svg>
);

// ─── 26. ZERO-TRUST COMPLIANCE MATRIX ───
export const ComplianceGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes compPulse { 0%, 100% { opacity: 0.85; } 50% { opacity: 1; } }
      `}</style>
    </defs>
    {[
      { label: 'SOC2', status: 'PASS', col: '#10b981', x: 25, delay: '0s' },
      { label: 'ISO27001', status: 'PASS', col: '#10b981', x: 75, delay: '0.4s' },
      { label: 'HIPAA', status: 'WARN', col: '#f59e0b', x: 130, delay: '0.8s' },
      { label: 'GDPR', status: 'PASS', col: '#10b981', x: 185, delay: '1.2s' },
    ].map((item, i) => (
      <g key={i} style={{ animation: `compPulse 2s infinite ${item.delay}` }}>
        <rect x={item.x} y="12" width="45" height="36" rx="4" fill={isLight ? '#f8fafc' : '#1e293b'} stroke={item.col} strokeWidth="1.2" />
        <text x={item.x + 22.5} y="25" textAnchor="middle" fill={isLight ? '#1e293b' : '#f8fafc'} fontSize="6.5" fontWeight="bold" fontFamily="monospace">{item.label}</text>
        <rect x={item.x + 8} y="31" width="29" height="12" rx="2" fill={item.col} opacity="0.25" />
        <text x={item.x + 22.5} y="40" textAnchor="middle" fill={item.col} fontSize="6" fontWeight="bold" fontFamily="monospace">{item.status}</text>
      </g>
    ))}
  </svg>
);

// ─── 27. GRAPHQL SDL & GRPC PROTOBUF V3 ───
export const GraphqlGrpcGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes swapArrows { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.3); } }
      `}</style>
    </defs>
    <rect x="25" y="12" width="80" height="36" rx="4" fill={isLight ? '#fdf2f8' : '#3b0764'} stroke="#ec4899" strokeWidth="1.2" />
    <text x="65" y="26" textAnchor="middle" fill="#ec4899" fontSize="7.5" fontWeight="bold" fontFamily="monospace">GraphQL SDL</text>
    <text x="65" y="38" textAnchor="middle" fill="#f472b6" fontSize="6.5" fontFamily="monospace">type Query &#123; ... &#125;</text>
    
    <text x="120" y="34" textAnchor="middle" fill="#8b5cf6" fontSize="12" fontWeight="bold" style={{ transformOrigin: '120px 30px', animation: 'swapArrows 1.8s infinite' }}>⇄</text>
    
    <rect x="135" y="12" width="80" height="36" rx="4" fill={isLight ? '#eff6ff' : '#1e293b'} stroke="#3b82f6" strokeWidth="1.2" />
    <text x="175" y="26" textAnchor="middle" fill="#3b82f6" fontSize="7.5" fontWeight="bold" fontFamily="monospace">gRPC Proto3</text>
    <text x="175" y="38" textAnchor="middle" fill="#60a5fa" fontSize="6.5" fontFamily="monospace">service Order &#123; ... &#125;</text>
  </svg>
);

// ─── 28. MULTI-REPO SERVICE MESH & ISTIO ───
export const ServiceMeshGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes meshFlow { to { stroke-dashoffset: -12; } }
        @keyframes mtlsPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
      `}</style>
    </defs>
    <rect x="25" y="14" width="50" height="32" rx="4" fill={isLight ? '#f0fdf4' : '#064e3b'} stroke="#10b981" strokeWidth="1.2" />
    <text x="50" y="28" textAnchor="middle" fill="#10b981" fontSize="7" fontWeight="bold" fontFamily="monospace">auth-svc</text>
    <text x="50" y="38" textAnchor="middle" fill="#34d399" fontSize="5.5" fontFamily="monospace">Envoy :8081</text>
    
    <path d="M 80 30 L 105 30" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="3 3" style={{ animation: 'meshFlow 1.2s linear infinite' }} />
    
    <rect x="110" y="10" width="45" height="40" rx="4" fill={isLight ? '#e0f2fe' : '#0c4a6e'} stroke="#0284c7" strokeWidth="1.2" style={{ transformOrigin: '132px 30px', animation: 'mtlsPulse 2s infinite' }} />
    <text x="132" y="26" textAnchor="middle" fill="#0284c7" fontSize="7" fontWeight="bold" fontFamily="monospace">mTLS 🔒</text>
    <text x="132" y="38" textAnchor="middle" fill="#38bdf8" fontSize="6" fontFamily="monospace">Istio Pilot</text>
    
    <path d="M 160 30 L 180 30" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="3 3" style={{ animation: 'meshFlow 1.2s linear infinite' }} />
    
    <rect x="185" y="14" width="50" height="32" rx="4" fill={isLight ? '#faf5ff' : '#3b0764'} stroke="#a855f7" strokeWidth="1.2" />
    <text x="210" y="28" textAnchor="middle" fill="#a855f7" fontSize="7" fontWeight="bold" fontFamily="monospace">order-svc</text>
    <text x="210" y="38" textAnchor="middle" fill="#c084fc" fontSize="5.5" fontFamily="monospace">Envoy :8082</text>
  </svg>
);

// ─── 29. SECURITY EXPLORER & RBAC ───
export const SecurityGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes secFlow { to { stroke-dashoffset: -12; } }
        @keyframes shieldPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
      `}</style>
    </defs>
    <rect x="25" y="14" width="60" height="34" rx="6" fill={isLight ? '#eef2ff' : '#1e1b4b'} stroke="#6366f1" strokeWidth="1" />
    <text x="55" y="28" textAnchor="middle" fill="#818cf8" fontSize="7" fontWeight="bold" fontFamily="monospace">Bearer</text>
    <text x="55" y="40" textAnchor="middle" fill="#6366f1" fontSize="7" fontFamily="monospace">JWT Token</text>
    
    <line x1="85" y1="31" x2="115" y2="31" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="3 3" style={{ animation: 'secFlow 1.2s linear infinite' }} />
    
    <polygon points="135,16 155,24 155,42 135,50 115,42 115,24" fill={isLight ? '#fdf4ff' : '#3b0764'} stroke="#a855f7" strokeWidth="1.2" style={{ transformOrigin: '135px 33px', animation: 'shieldPulse 2s infinite' }} />
    <text x="135" y="35" textAnchor="middle" fill="#c084fc" fontSize="8" fontWeight="bold" fontFamily="monospace">HS256</text>
    
    <line x1="155" y1="31" x2="185" y2="31" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" style={{ animation: 'secFlow 1.2s linear infinite' }} />
    
    <circle cx="200" cy="31" r="12" fill={isLight ? '#f0fdf4' : '#064e3b'} stroke="#10b981" strokeWidth="1.2" />
    <text x="200" y="35" textAnchor="middle" fill="#34d399" fontSize="10">✓</text>
  </svg>
);

// ─── 30. CI/CD ARCHITECTURE GATE ───
export const ArchGateGraphic: React.FC<GraphicProps> = ({ isLight }) => (
  <svg viewBox="0 0 240 60" className="w-full h-14 select-none">
    <defs>
      <style>{`
        @keyframes gateShield { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        @keyframes gateScan { 0% { x: 20; opacity: 0; } 30% { opacity: 1; } 70% { opacity: 1; } 100% { x: 220; opacity: 0; } }
        @keyframes gateCheck { 0%, 60% { opacity: 0; transform: scale(0.5); } 80% { opacity: 1; transform: scale(1.1); } 100% { opacity: 1; transform: scale(1); } }
      `}</style>
    </defs>
    <polygon points="40,8 58,16 58,38 40,48 22,38 22,16" fill={isLight ? '#ecfdf5' : '#064e3b'} stroke="#10b981" strokeWidth="1.5" style={{ transformOrigin: '40px 28px', animation: 'gateShield 2.5s ease-in-out infinite' }} />
    <text x="40" y="31" textAnchor="middle" fill="#34d399" fontSize="12" fontWeight="bold">🛡</text>

    <rect x="70" y="12" width="40" height="10" rx="3" fill={isLight ? '#f0fdf4' : '#052e16'} stroke="#22c55e" strokeWidth="0.8" />
    <text x="90" y="20" textAnchor="middle" fill="#4ade80" fontSize="6" fontFamily="monospace">PASS</text>
    <rect x="70" y="26" width="40" height="10" rx="3" fill={isLight ? '#f0fdf4' : '#052e16'} stroke="#22c55e" strokeWidth="0.8" />
    <text x="90" y="34" textAnchor="middle" fill="#4ade80" fontSize="6" fontFamily="monospace">PASS</text>
    <rect x="70" y="40" width="40" height="10" rx="3" fill={isLight ? '#fef2f2' : '#450a0a'} stroke="#ef4444" strokeWidth="0.8" />
    <text x="90" y="48" textAnchor="middle" fill="#f87171" fontSize="6" fontFamily="monospace">FAIL</text>

    <rect x="20" y="29" width="12" height="2" rx="1" fill="#10b981" opacity="0.6" style={{ animation: 'gateScan 2s linear infinite' }} />

    <line x1="110" y1="30" x2="145" y2="30" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" style={{ animation: 'secFlow 1.2s linear infinite' }} />

    <rect x="150" y="14" width="70" height="34" rx="6" fill={isLight ? '#f0fdf4' : '#052e16'} stroke="#10b981" strokeWidth="1" />
    <text x="185" y="28" textAnchor="middle" fill="#4ade80" fontSize="7" fontWeight="bold" fontFamily="monospace">CI/CD Gate</text>
    <text x="185" y="40" textAnchor="middle" fill="#22c55e" fontSize="8" fontFamily="monospace">83% ✓</text>
  </svg>
);
