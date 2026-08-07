import React from 'react';
import { Server, Layout, Database, Cpu, Activity, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Project } from '../types';

interface ProjectDashboardProps {
  project: Project;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ project }) => {
  const totalComponents =
    (project.controllerCount || 0) +
    (project.serviceCount || 0) +
    (project.repositoryCount || 0) +
    (project.componentCount || 0);

  const feRatio = totalComponents > 0 ? Math.round(((project.componentCount || 0) / totalComponents) * 100) : 35;
  const beRatio = totalComponents > 0 ? Math.round((((project.controllerCount || 0) + (project.serviceCount || 0)) / totalComponents) * 100) : 45;
  const dbRatio = 100 - feRatio - beRatio;

  return (
    <div className="p-5 space-y-3 bg-slate-950/80 border-b border-slate-800">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {/* Backend Tech Card */}
        <div className="glass-panel p-3.5 rounded-2xl border border-indigo-500/20 bg-indigo-950/20 glow-indigo">
          <div className="flex items-center justify-between mb-2">
            <div className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Server className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
              {project.javaVersion ? `Java ${project.javaVersion}` : 'Java 21'}
            </span>
          </div>
          <h3 className="text-xs font-bold text-white">{project.backendFramework || 'Spring Boot'}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
            {project.controllerCount || 0} Controllers · {project.serviceCount || 0} Services · {project.repositoryCount || 0} Repos
          </p>
        </div>

        {/* Frontend Tech Card */}
        <div className="glass-panel p-3.5 rounded-2xl border border-cyan-500/20 bg-cyan-950/20 glow-cyan">
          <div className="flex items-center justify-between mb-2">
            <div className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Layout className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">
              TypeScript
            </span>
          </div>
          <h3 className="text-xs font-bold text-white">{project.frontendFramework || 'React 18'}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
            {project.componentCount || 0} Components · {project.apiCount || 0} Endpoints
          </p>
        </div>

        {/* Database Tech Card */}
        <div className="glass-panel p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 glow-emerald">
          <div className="flex items-center justify-between mb-2">
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Spring Data JPA
            </span>
          </div>
          <h3 className="text-xs font-bold text-white">{project.databaseType || 'PostgreSQL'}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">Automated ERD Entity Mapping</p>
        </div>

        {/* Build & Dependency Card */}
        <div className="glass-panel p-3.5 rounded-2xl border border-purple-500/20 bg-purple-950/20">
          <div className="flex items-center justify-between mb-2">
            <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
              Maven
            </span>
          </div>
          <h3 className="text-xs font-bold text-white">Dependencies Overview</h3>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
            {project.dependencyCount || 0} Starters & Libraries
          </p>
        </div>

        {/* Project Health Score Card */}
        <div className="glass-panel p-3.5 rounded-2xl border border-pink-500/20 bg-pink-950/20">
          <div className="flex items-center justify-between mb-2">
            <div className="p-1.5 rounded-xl bg-pink-500/10 text-pink-400">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              98% Healthy
            </span>
          </div>
          <h3 className="text-xs font-bold text-white">Clean Architecture</h3>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">SOLID & Decoupled Layers</p>
        </div>
      </div>

      {/* Component Layer Distribution Bar */}
      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Layer Code Ratio:</span>
          <span className="text-cyan-400 font-bold">Frontend ({feRatio}%)</span>
          <span className="text-slate-600">•</span>
          <span className="text-indigo-400 font-bold">Backend ({beRatio}%)</span>
          <span className="text-slate-600">•</span>
          <span className="text-amber-400 font-bold">Database ({dbRatio}%)</span>
        </div>

        <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden flex">
          <div className="h-full bg-cyan-400" style={{ width: `${feRatio}%` }} />
          <div className="h-full bg-indigo-500" style={{ width: `${beRatio}%` }} />
          <div className="h-full bg-amber-400" style={{ width: `${dbRatio}%` }} />
        </div>
      </div>
    </div>
  );
};
