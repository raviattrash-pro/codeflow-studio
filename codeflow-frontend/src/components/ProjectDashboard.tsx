import React from 'react';
import { Project } from '../types';
import { ThemeMode } from './Header';

interface ProjectDashboardProps {
  project: Project;
  currentTheme?: ThemeMode;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ project, currentTheme = 'NIGHT' }) => {
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
        return 'bg-[#0a0f1d] border-b border-slate-800/80 text-slate-100';
    }
  };

  const getChipStyle = (colorType: 'sky' | 'indigo' | 'emerald' | 'purple' | 'amber') => {
    if (currentTheme === 'NEUMORPHIC') {
      return 'bg-[#e0e5ec] text-[#2d3748] shadow-[inset_2px_2px_4px_#a3b1c6,inset_-2px_-2px_4px_#ffffff] border border-white/60 px-3 py-1 rounded-lg text-xs font-mono font-bold';
    }
    if (isLight) {
      switch (colorType) {
        case 'sky': return 'bg-sky-50 text-sky-800 border border-sky-200/80 px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-xs';
        case 'indigo': return 'bg-indigo-50 text-indigo-800 border border-indigo-200/80 px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-xs';
        case 'emerald': return 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-xs';
        case 'purple': return 'bg-purple-50 text-purple-800 border border-purple-200/80 px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-xs';
        case 'amber': return 'bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-xs';
      }
    }
    switch (colorType) {
      case 'sky': return 'bg-sky-950/60 text-sky-300 border border-sky-800/80 px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-xs';
      case 'indigo': return 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/80 px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-xs';
      case 'emerald': return 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-xs';
      case 'purple': return 'bg-purple-950/60 text-purple-300 border border-purple-800/80 px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-xs';
      case 'amber': return 'bg-amber-950/60 text-amber-300 border border-amber-800/80 px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-xs';
    }
  };

  return (
    <div className={`px-4 py-2 flex flex-wrap items-center gap-2 ${getContainerStyle()}`}>
      <span className={getChipStyle('indigo')}>Java {project.javaVersion || '21'}</span>
      <span className={getChipStyle('indigo')}>{project.backendFramework || 'Spring Boot'}</span>
      <span className={getChipStyle('sky')}>{project.frontendFramework || 'React 19'}</span>
      <span className={getChipStyle('sky')}>TypeScript 7</span>
      <span className={getChipStyle('emerald')}>{project.databaseType || 'PostgreSQL'}</span>
      <span className={getChipStyle('purple')}>{project.controllerCount || 0} Controllers</span>
      <span className={getChipStyle('purple')}>{project.serviceCount || 0} Services</span>
      <span className={getChipStyle('amber')}>{project.dependencyCount || 0} Deps</span>
      <span className={getChipStyle('emerald')}>98% Healthy</span>
    </div>
  );
};
