import React from 'react';
import { Server, Layout, Database, Cpu, Activity, ArrowRightLeft } from 'lucide-react';
import { Project } from '../types';

interface ProjectDashboardProps {
  project: Project;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ project }) => {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Backend Tech Card */}
      <div className="glass-panel p-4 rounded-2xl border border-indigo-500/20 bg-indigo-950/20 glow-indigo">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Server className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
            {project.javaVersion ? `Java ${project.javaVersion}` : 'Java 21'}
          </span>
        </div>
        <h3 className="text-sm font-bold text-white">{project.backendFramework || 'Spring Boot'}</h3>
        <p className="text-xs text-slate-400 mt-1">
          {project.controllerCount || 0} Controllers · {project.serviceCount || 0} Services · {project.repositoryCount || 0} Repos
        </p>
      </div>

      {/* Frontend Tech Card */}
      <div className="glass-panel p-4 rounded-2xl border border-cyan-500/20 bg-cyan-950/20 glow-cyan">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Layout className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-mono font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">
            TypeScript
          </span>
        </div>
        <h3 className="text-sm font-bold text-white">{project.frontendFramework || 'React 18'}</h3>
        <p className="text-xs text-slate-400 mt-1">
          {project.componentCount || 0} Components · {project.apiCount || 0} Endpoints mapped
        </p>
      </div>

      {/* Database Tech Card */}
      <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 glow-emerald">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            Spring Data JPA
          </span>
        </div>
        <h3 className="text-sm font-bold text-white">{project.databaseType || 'PostgreSQL'}</h3>
        <p className="text-xs text-slate-400 mt-1">Automated ERD Entity Mapping</p>
      </div>

      {/* Build & Dependency Card */}
      <div className="glass-panel p-4 rounded-2xl border border-purple-500/20 bg-purple-950/20">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-mono font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
            Maven
          </span>
        </div>
        <h3 className="text-sm font-bold text-white">Dependencies Overview</h3>
        <p className="text-xs text-slate-400 mt-1">
          {project.dependencyCount || 0} Starters & External Libraries parsed
        </p>
      </div>
    </div>
  );
};
