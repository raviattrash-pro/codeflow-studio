import React from 'react';
import { Project } from '../types';
import { ThemeMode } from './Header';
import { Activity, Database, Server, Cpu, Layers } from 'lucide-react';

interface ProjectDashboardProps {
  project: Project;
  currentTheme?: ThemeMode;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  project,
  currentTheme = 'NIGHT',
}) => {
  const isLight = currentTheme === 'NORMAL' || currentTheme === 'GLASSMORPHISM' || currentTheme === 'NEUMORPHIC';

  return (
    <div className={`px-6 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 text-xs font-mono transition-colors ${
      isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#080c16] border-slate-800 text-slate-300'
    }`}>
      {/* Left: Stack badges */}
      <div className="flex flex-wrap items-center gap-2">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold border ${
          isLight ? 'bg-indigo-50 text-indigo-800 border-indigo-200' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
        }`}>
          <Cpu className="w-3.5 h-3.5" />
          <span>Java {project.javaVersion || '21'}</span>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold border ${
          isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        }`}>
          <Server className="w-3.5 h-3.5" />
          <span>{project.backendFramework || 'Spring Boot'}</span>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold border ${
          isLight ? 'bg-sky-50 text-sky-800 border-sky-200' : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
        }`}>
          <Activity className="w-3.5 h-3.5" />
          <span>{project.frontendFramework || 'React SPA'}</span>
        </div>
      </div>

      {/* Right: Real Component Counts */}
      <div className="flex items-center gap-2">
        <span className={`px-2.5 py-1 rounded-lg font-semibold border ${
          isLight ? 'bg-sky-50 text-sky-800 border-sky-200' : 'bg-slate-800/80 text-sky-300 border-slate-700/60'
        }`}>
          {project.controllerCount || 0} Controllers
        </span>
        <span className={`px-2.5 py-1 rounded-lg font-semibold border ${
          isLight ? 'bg-purple-50 text-purple-800 border-purple-200' : 'bg-slate-800/80 text-purple-300 border-slate-700/60'
        }`}>
          {project.serviceCount || 0} Services
        </span>
        <span className={`px-2.5 py-1 rounded-lg font-semibold border ${
          isLight ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-800/80 text-amber-300 border-slate-700/60'
        }`}>
          {project.repositoryCount || 0} Repositories
        </span>
        <span className={`px-2.5 py-1 rounded-lg font-semibold border ${
          isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-800/80 text-emerald-300 border-slate-700/60'
        }`}>
          {project.dependencyCount || 0} Dependencies
        </span>
      </div>
    </div>
  );
};
