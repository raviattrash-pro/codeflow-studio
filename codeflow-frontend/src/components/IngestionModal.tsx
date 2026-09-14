import React, { useState } from 'react';
import { GitBranch, Upload, X, Loader2, Sparkles, FolderGit2, CheckCircle2, Shield } from 'lucide-react';
import axios from 'axios';
import { Project } from '../types';
import { ThemeMode } from './Header';

interface IngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectIngested: (projectId: string) => void;
  currentTheme?: ThemeMode;
}

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
  const [progress, setProgress] = useState(0);

  const isLight = currentTheme === 'NORMAL';
  const isNeumorphic = currentTheme === 'NEUMORPHIC';
  const isGlass = currentTheme === 'GLASSMORPHISM';

  if (!isOpen) return null;

  const handleGithubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl) return;

    setIsLoading(true);
    setStatusMessage('Initiating repository clone...');
    setProgress(10);

    try {
      const resp = await axios.post<{ projectId: string; status: string }>('/api/v1/projects/github', {
        githubUrl: githubUrl,
        branch: 'main',
      });

      const projectId = resp.data.projectId;
      pollStatus(projectId);
    } catch (err: any) {
      setIsLoading(false);
      setStatusMessage('Failed to clone repository: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleZipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsLoading(true);
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
      setStatusMessage('Upload failed: ' + (err.response?.data?.message || err.message));
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
          setStatusMessage('Analysis failed: ' + p.errorMessage);
        }
      } catch (e) {
        clearInterval(interval);
        setIsLoading(false);
        setStatusMessage('Error checking status');
      }
    }, 1000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal-pop-in w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : isGlass
            ? 'glass-modal border-slate-700/80 text-white'
            : isNeumorphic
            ? 'neumorphic-card border-slate-700 text-slate-100'
            : 'bg-slate-900 border-slate-800 text-white'
        }`}
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
                Analyze Java Spring Boot & React repositories automatically
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all ${
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
            onClick={() => setActiveTab('github')}
            className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-mono font-bold border-b-2 transition-all ${
              activeTab === 'github'
                ? 'border-cyan-500 text-cyan-500'
                : isLight
                ? 'border-transparent text-slate-500 hover:text-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Git Repository URL</span>
          </button>
          <button
            onClick={() => setActiveTab('zip')}
            className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-mono font-bold border-b-2 transition-all ${
              activeTab === 'zip'
                ? 'border-cyan-500 text-cyan-500'
                : isLight
                ? 'border-transparent text-slate-500 hover:text-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload ZIP Archive</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {activeTab === 'github' ? (
            <form onSubmit={handleGithubSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold font-mono mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  GitHub Repository HTTPS URL
                </label>
                <input
                  type="text"
                  placeholder="https://github.com/user/spring-react-app"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  disabled={isLoading}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono outline-none transition-all ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-cyan-500'
                      : 'bg-slate-900 border-slate-800 text-slate-100 focus:border-cyan-500'
                  }`}
                />
              </div>

              <div className={`p-3 rounded-xl border text-[11px] font-mono flex items-center space-x-2 ${
                isLight ? 'bg-cyan-50 border-cyan-200 text-cyan-800' : 'bg-cyan-950/20 border-cyan-500/20 text-cyan-300'
              }`}>
                <Sparkles className="w-4 h-4 shrink-0 text-cyan-500" />
                <span>Supports public and private token-authenticated Spring Boot & React repos</span>
              </div>

              <button
                type="submit"
                disabled={isLoading || !githubUrl}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold font-mono flex items-center justify-center space-x-2 transition-all shadow-lg shadow-cyan-950/40"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
                <span>{isLoading ? 'Cloning & Parsing AST...' : 'Ingest Git Repository'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleZipSubmit} className="space-y-4">
              <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                isLight ? 'border-slate-300 bg-slate-50' : 'border-slate-800 bg-slate-950/50'
              }`}>
                <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <label className="cursor-pointer">
                  <span className="text-xs font-bold text-cyan-500 hover:underline">Select a ZIP file</span>
                  <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}> or drag and drop</span>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    disabled={isLoading}
                    className="hidden"
                  />
                </label>
                {selectedFile && (
                  <p className="mt-2 text-xs font-mono font-bold text-emerald-400">
                    ✓ {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !selectedFile}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold font-mono flex items-center justify-center space-x-2 transition-all shadow-lg shadow-cyan-950/40"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{isLoading ? 'Extracting & Parsing AST...' : 'Upload & Ingest Archive'}</span>
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
