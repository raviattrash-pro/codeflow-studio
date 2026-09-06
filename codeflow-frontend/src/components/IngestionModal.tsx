import React, { useState } from 'react';
import { GitBranch, Upload, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import { Project } from '../types';

interface IngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectIngested: (projectId: string) => void;
}

export const IngestionModal: React.FC<IngestionModalProps> = ({
  isOpen,
  onClose,
  onProjectIngested,
}) => {
  const [activeTab, setActiveTab] = useState<'github' | 'zip'>('github');
  const [githubUrl, setGithubUrl] = useState('https://github.com/spring-projects/spring-petclinic');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [progress, setProgress] = useState(0);

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
        className="w-full max-w-xl glass-modal rounded-3xl p-6 shadow-2xl border border-slate-700/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">Import Project for Analysis</h2>
            <p className="text-xs text-slate-400">Select public GitHub repository or ZIP archive</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex space-x-2 my-5 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('github')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'github'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Public GitHub Repo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('zip')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'zip'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>ZIP File Upload</span>
          </button>
        </div>

        {/* GitHub Form */}
        {activeTab === 'github' && (
          <form onSubmit={handleGithubSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">GitHub Repository URL</label>
              <input
                type="url"
                required
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-xs text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">Supports Spring Boot + React projects (Maven pom.xml)</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
              <span>{isLoading ? 'Analyzing Project...' : 'Start Visual Analysis'}</span>
            </button>
          </form>
        )}

        {/* ZIP Form */}
        {activeTab === 'zip' && (
          <form onSubmit={handleZipSubmit} className="space-y-4">
            <div className="border-2 border-dashed border-slate-700/80 hover:border-indigo-500/50 rounded-2xl p-8 text-center transition-all bg-slate-900/40">
              <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-200">
                {selectedFile ? selectedFile.name : 'Drag & drop project ZIP here, or click to browse'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Maximum archive size: 100 MB</p>
              <input
                type="file"
                accept=".zip"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
                id="zip-file-input"
              />
              <label
                htmlFor="zip-file-input"
                className="inline-block mt-3 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer border border-slate-700"
              >
                Choose File
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !selectedFile}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>{isLoading ? 'Extracting & Parsing...' : 'Upload & Analyze ZIP'}</span>
            </button>
          </form>
        )}

        {/* Progress Bar & Status */}
        {isLoading && (
          <div className="mt-5 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-300 font-mono">
              <span>{statusMessage}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
