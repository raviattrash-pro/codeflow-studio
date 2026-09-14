import React from 'react';
import { Project } from '../types';
import { ThemeMode } from './Header';
import { Activity, Database, Server, Cpu, Zap } from 'lucide-react';

interface ProjectDashboardProps {
  project: Project;
  currentTheme?: ThemeMode;
  onFilterLayer?: (layer: string) => void;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  project,
  currentTheme = 'NIGHT',
  onFilterLayer,
}) => {
  const isLight = currentTheme === 'NORMAL' || currentTheme === 'GLASSMORPHISM' || currentTheme === 'NEUMORPHIC';

  const getContainerStyle = () => {
    switch (currentTheme) {
      case 'NEUMORPHIC':
        return 'bg-[#e0e5ec] border-b border-[#c0cbdc] text-[#2d3748]';
      case 'GLASSMORPHISM':
        return 'bg-white/80 backdrop-blur-md border-b border-slate-200/80 text-slate-900 shadow-xs';
      case 'NORMAL':
        return 'bg-slate-50 border-b border-slate-200 text-slate-900';
      default:
        return 'bg-[#080c16] border-b border-slate-800/80 text-slate-100';
    }
  };

  return (
    <div className={`px-4 py-2 flex flex-wrap items-center justify-between gap-3 ${getContainerStyle()}`}>
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
          isLight ? 'bg-indigo-50/80 text-indigo-900 border-indigo-200/80' : 'bg-indigo-950/50 text-indigo-300 border-indigo-800/60'
        }`}>
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>Java {project.javaVersion || '21'}</span>
        </div>
        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
          isLight ? 'bg-emerald-50/80 text-emerald-900 border-emerald-200/80' : 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60'
        }`}>
          <Server className="w-3.5 h-3.5 text-emerald-400" />
          <span>{project.backendFramework || 'Spring Boot 3.2'}</span>
        </div>
        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
          isLight ? 'bg-sky-50/80 text-sky-900 border-sky-200/80' : 'bg-sky-950/50 text-sky-300 border-sky-800/60'
        }`}>
          <Activity className="w-3.5 h-3.5 text-sky-400" />
          <span>{project.frontendFramework || 'React 19 SPA'}</span>
        </div>
        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
          isLight ? 'bg-amber-50/80 text-amber-900 border-amber-200/80' : 'bg-amber-950/50 text-amber-300 border-amber-800/60'
        }`}>
          <Database className="w-3.5 h-3.5 text-amber-400" />
          <span>{project.databaseType || 'PostgreSQL 16'}</span>
        </div>
        <div className="hidden lg:flex items-center space-x-1.5 pl-2 border-l border-slate-500/20">
          <button
            onClick={() => onFilterLayer?.('CONTROLLER')}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border hover:opacity-80 transition-opacity ${
              isLight ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-slate-900 text-sky-300 border-slate-800'
            }`}
          >
            {project.controllerCount || 7} Controllers
          </button>
          <button
            onClick={() => onFilterLayer?.('SERVICE')}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border hover:opacity-80 transition-opacity ${
              isLight ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-slate-900 text-indigo-300 border-slate-800'
            }`}
          >
            {project.serviceCount || 5} Services
          </button>
          <button
            onClick={() => onFilterLayer?.('DEPENDENCY')}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border hover:opacity-80 transition-opacity ${
              isLight ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-slate-900 text-amber-300 border-slate-800'
            }`}
          >
            {project.dependencyCount || 8} Deps
          </button>
        </div>
      </div>
      <div className="flex items-center space-x-3 text-xs font-mono">
        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border ${
          isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">98.4% System Health</span>
        </div>
        <div className="hidden sm:flex items-center space-x-1 text-slate-400 text-[11px]">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>P95: <strong>28ms</strong></span>
        </div>
      </div>
    </div>
  );
};
