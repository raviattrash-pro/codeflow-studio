import React from 'react';
import { Project } from '../types';

interface ProjectDashboardProps {
  project: Project;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ project }) => {
  return (
    <div className="px-4 py-2 flex flex-wrap items-center gap-2 bg-slate-900/60 border-b border-slate-800/50">
      <span className="chip chip-indigo">Java {project.javaVersion || '21'}</span>
      <span className="chip chip-indigo">{project.backendFramework || 'Spring Boot'}</span>
      <span className="chip chip-cyan">{project.frontendFramework || 'React 18'}</span>
      <span className="chip chip-cyan">TypeScript</span>
      <span className="chip chip-emerald">{project.databaseType || 'PostgreSQL'}</span>
      <span className="chip chip-purple">{project.controllerCount || 0} Controllers</span>
      <span className="chip chip-purple">{project.serviceCount || 0} Services</span>
      <span className="chip chip-amber">{project.dependencyCount || 0} Deps</span>
      <span className="chip chip-green">98% Healthy</span>
    </div>
  );
};
