import React from 'react';
import { Project } from '../types';
import { ThemeMode } from './Header';

interface ProjectDashboardProps {
  project: Project;
  currentTheme?: ThemeMode;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ project, currentTheme = 'NIGHT' }) => {
  const getContainerStyle = () => {
    switch (currentTheme) {
      case 'NEUMORPHIC':
        return 'bg-[#e0e5ec] border-b border-[#c0cbdc] text-[#2d3748]';
      case 'GLASSMORPHISM':
        return 'bg-white/60 backdrop-blur-md border-b border-white/80 text-slate-900';
      case 'NORMAL':
        return 'bg-slate-100 border-b border-slate-200 text-slate-900';
      default:
        return 'bg-slate-900/60 border-b border-slate-800/50 text-slate-100';
    }
  };

  const getChipStyle = (type: string) => {
    if (currentTheme === 'NEUMORPHIC') {
      return 'bg-[#e0e5ec] text-[#2d3748] shadow-[inset_3px_3px_6px_#a3b1c6,inset_-3px_-3px_6px_#ffffff] border border-white/60 px-3 py-1 rounded-full text-xs font-mono font-bold';
    }
    if (currentTheme === 'GLASSMORPHISM') {
      return 'bg-white/70 backdrop-blur-md text-slate-900 border border-white shadow-sm px-3 py-1 rounded-full text-xs font-mono font-bold';
    }
    if (currentTheme === 'NORMAL') {
      return 'bg-white text-slate-800 border border-slate-300 shadow-xs px-3 py-1 rounded-full text-xs font-mono font-bold';
    }
    return `chip chip-${type}`;
  };

  return (
    <div className={`px-4 py-2 flex flex-wrap items-center gap-2 ${getContainerStyle()}`}>
      <span className={getChipStyle('indigo')}>Java {project.javaVersion || '21'}</span>
      <span className={getChipStyle('indigo')}>{project.backendFramework || 'Spring Boot'}</span>
      <span className={getChipStyle('cyan')}>{project.frontendFramework || 'React 18'}</span>
      <span className={getChipStyle('cyan')}>TypeScript</span>
      <span className={getChipStyle('emerald')}>{project.databaseType || 'PostgreSQL'}</span>
      <span className={getChipStyle('purple')}>{project.controllerCount || 0} Controllers</span>
      <span className={getChipStyle('purple')}>{project.serviceCount || 0} Services</span>
      <span className={getChipStyle('amber')}>{project.dependencyCount || 0} Deps</span>
      <span className={getChipStyle('green')}>98% Healthy</span>
    </div>
  );
};
