import React, { useState } from 'react';
import { GitBranch, Upload, X, Loader2, Sparkles, FolderGit2, AlertTriangle, Play, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { Project } from '../types';
import { ThemeMode } from './Header';

interface IngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectIngested: (projectId: string) => void;
  currentTheme?: ThemeMode;
}

const SAMPLE_REPOS = [
  { label: 'Spring PetClinic', url: 'https://github.com/spring-projects/spring-petclinic' },
  { label: 'CodeFlow Studio', url: 'https://github.com/raviattrash-pro/codeflow-studio' },
  { label: 'Spring REST Service', url: 'https://github.com/spring-guides/gs-rest-service' },
];

export const IngestionModal: React.FC<IngestionModalProps> = ({
  isOpen,
  onClose,
  onProjectIngested,
  currentTheme = 'NIGHT',
}) => {
  const [activeTab, setActiveTab] = useState<'github' | 'zip'>('github');
  const [githubUrl, setGithubUrl] = useState('https://github.com/spring-projects/spring-petclinic');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const isLight = currentTheme === 'NORMAL';
  const isNeumorphic = currentTheme === 'NEUMORPHIC';
  const isGlass = currentTheme === 'GLASSMORPHISM';

  if (!isOpen) return null;

  const handleGithubSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let cleanUrl = githubUrl.trim();
    if (!cleanUrl) {
      cleanUrl = 'https://github.com/spring-projects/spring-petclinic';
      setGithubUrl(cleanUrl);
    }

    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage('Connecting to backend & cloning repo...');
    setProgress(15);

    try {
      const resp = await axios.post<{ projectId: string; status: string }>('/api/v1/projects/github', {
        githubUrl: cleanUrl,
        branch: 'main',
      });

      const projectId = resp.data.projectId;
      pollStatus(projectId);
    } catch (err: any) {
      setIsLoading(false);
      const serverMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      setErrorMessage(serverMsg ? `Failed to ingest repository: ${serverMsg}` : 'Failed to connect to backend server. Make sure the Spring Boot backend is running on port 8080.');
    }
  };

  const handleZipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a ZIP file containing your Spring Boot or React repository.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage('Uploading ZIP archive...');
    setProgress(15);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const resp = await axios.post<{ projectId: string; status: string }>('/api/v1/projects/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const projectId = resp.data.projectId;
      pollStatus(projectId);
    } catch (err: any) {
      setIsLoading(false);
      const serverMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      setErrorMessage(serverMsg ? `Upload failed: ${serverMsg}` : 'Failed to upload archive. Make sure the Spring Boot backend is running on port 8080.');
    }
  };

  const pollStatus = (projectId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get<Project>(`/api/v1/projects/${projectId}/status`);
        const p = res.data;
        setProgress(p.progressPercentage || 50);
        setStatusMessage(`Parsing: ${p.status} (${p.progressPercentage}%)`);

        if (p.status === 'COMPLETED') {
          clearInterval(interval);
          setIsLoading(false);
          onProjectIngested(projectId);
          onClose();
        } else if (p.status === 'FAILED') {
          clearInterval(interval);
          setIsLoading(false);
          setErrorMessage(p.errorMessage || 'Analysis failed on the server.');
        }
      } catch (e) {
        clearInterval(interval);
        setIsLoading(false);
        setErrorMessage('Lost connection while polling analysis status.');
      }
    }, 1000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 999999 }}>
      <div
        className={`modal-pop-in w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : isGlass
            ? 'glass-modal border-slate-700/80 text-white'
            : isNeumorphic
            ? 'neumorphic-card border-slate-700 text-slate-100'
            : 'bg-[#0f172a] border-slate-800 text-white'
        }`}
        style={{ backgroundColor: isLight ? '#ffffff' : '#0f172a' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4.5 border-b flex items-center justify-between shrink-0 ${
          isLight ? 'bg-slate-50/95 border-slate-200' : 'bg-[#070a12] border-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Ingest Codebase Architecture
              </h3>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Analyze Java Spring Boot &amp; React repositories automatically
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isLight ? 'hover:bg-slate-200 text-slate-500 hover:text-slate-900' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className={`flex border-b px-6 pt-3 gap-2 ${
          isLight ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-950/30 border-slate-800'
        }`}>
          <button
            onClick={() => { setActiveTab('github'); setErrorMessage(null); }}
            className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-mono font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'github'
                ? isLight
                  ? 'border-purple-600 text-purple-700 font-extrabold'
                  : 'border-purple-400 text-purple-400 font-extrabold'
                : isLight
                ? 'border-transparent text-slate-600 hover:text-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Git Repository URL</span>
          </button>
          <button
            onClick={() => { setActiveTab('zip'); setErrorMessage(null); }}
            className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-mono font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'zip'
                ? isLight
                  ? 'border-purple-600 text-purple-700 font-extrabold'
                  : 'border-purple-400 text-purple-400 font-extrabold'
                : isLight
                ? 'border-transparent text-slate-600 hover:text-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload ZIP Archive</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-mono flex items-start space-x-2.5 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-red-200 block mb-0.5">Ingestion Error</span>
                <span className="leading-relaxed">{errorMessage}</span>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGithubUrl('https://github.com/spring-projects/spring-petclinic');
                      setErrorMessage(null);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-red-900/60 hover:bg-red-800 border border-red-700/60 text-white text-[11px] font-mono font-bold transition cursor-pointer"
                  >
                    Use Spring PetClinic Sample
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'github' ? (
            <form onSubmit={handleGithubSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold font-mono mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  GitHub Repository HTTPS URL
                </label>
                <input
                  type="text"
                  placeholder="https://github.com/spring-projects/spring-petclinic"
                  value={githubUrl}
                  onChange={(e) => { setGithubUrl(e.target.value); setErrorMessage(null); }}
                  disabled={isLoading}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono outline-none transition-all ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-500'
                      : 'bg-slate-900 border-slate-800 text-slate-100 focus:border-purple-500'
                  }`}
                />

                {/* Preset Repositories */}
                <div className="mt-2.5 flex items-center flex-wrap gap-1.5">
                  <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Presets:</span>
                  {SAMPLE_REPOS.map((repo, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => { setGithubUrl(repo.url); setErrorMessage(null); }}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition cursor-pointer ${
                        githubUrl === repo.url
                          ? isLight
                            ? 'bg-purple-100 border-purple-600 text-purple-900 font-bold shadow-xs'
                            : 'bg-purple-900/40 border-purple-500 text-purple-200 font-bold shadow-xs'
                          : isLight
                          ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {repo.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`p-3 rounded-xl border text-[11px] font-mono flex items-center space-x-2 ${
                isLight ? 'bg-purple-50 border-purple-200 text-purple-900' : 'bg-purple-950/20 border-purple-500/20 text-purple-300'
              }`}>
                <Sparkles className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400" />
                <span>Supports public and token-authenticated Spring Boot &amp; React repos</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#9333ea] hover:bg-[#7e22ce] active:scale-[0.99] text-white text-xs font-bold font-mono flex items-center justify-center space-x-2 transition-all border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
                <span>{isLoading ? 'Cloning & Parsing AST...' : 'Ingest Git Repository'}</span>
                {!isLoading && <ArrowRight className="w-3.5 h-3.5 ml-1" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleZipSubmit} className="space-y-4">
              <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                isLight ? 'border-slate-300 bg-slate-50' : 'border-slate-800 bg-slate-950/50'
              }`}>
                <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <label className="cursor-pointer">
                  <span className="text-xs font-bold text-purple-600 hover:underline">Select a ZIP file</span>
                  <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}> or drag and drop</span>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={(e) => { setSelectedFile(e.target.files?.[0] || null); setErrorMessage(null); }}
                    disabled={isLoading}
                    className="hidden"
                  />
                </label>
                {selectedFile && (
                  <p className="mt-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    ✓ {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#9333ea] hover:bg-[#7e22ce] active:scale-[0.99] text-white text-xs font-bold font-mono flex items-center justify-center space-x-2 transition-all border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{isLoading ? 'Extracting & Parsing AST...' : 'Upload & Ingest Archive'}</span>
                {!isLoading && <ArrowRight className="w-3.5 h-3.5 ml-1" />}
              </button>
            </form>
          )}

          {/* Progress / Status Message */}
          {isLoading && (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>{statusMessage}</span>
                <span className="font-bold text-cyan-400">{progress}%</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
