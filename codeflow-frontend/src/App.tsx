import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Header } from './components/Header';
import { IngestionModal } from './components/IngestionModal';
import { ProjectDashboard } from './components/ProjectDashboard';
import { InteractiveFlowExplorer } from './components/InteractiveFlowExplorer';
import { NodeInspectorSidebar } from './components/NodeInspectorSidebar';
import { MonacoViewerModal } from './components/MonacoViewerModal';
import { DependencyExplorerModal } from './components/DependencyExplorerModal';
import { SqlExplorerModal } from './components/SqlExplorerModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { ErDiagramModal } from './components/ErDiagramModal';
import { SecurityExplorerModal } from './components/SecurityExplorerModal';
import { FileTreeModal } from './components/FileTreeModal';
import { Project, GraphData, NodeDetail, ProjectNode } from './types';
import { Layers, Sparkles } from 'lucide-react';

export default function App() {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined);
  const [selectedNodeDetail, setSelectedNodeDetail] = useState<NodeDetail | null>(null);

  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isDependencyModalOpen, setIsDependencyModalOpen] = useState(false);
  const [isSqlExplorerOpen, setIsSqlExplorerOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isErDiagramOpen, setIsErDiagramOpen] = useState(false);
  const [isSecurityFlowOpen, setIsSecurityFlowOpen] = useState(false);
  const [isFileTreeOpen, setIsFileTreeOpen] = useState(false);
  const [viewingFilePath, setViewingFilePath] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProjectNode[]>([]);

  useEffect(() => {
    if (!currentProjectId || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      axios
        .get<ProjectNode[]>(`/api/v1/projects/${currentProjectId}/search?q=${searchQuery}`)
        .then((res) => setSearchResults(res.data))
        .catch(() => setSearchResults([]));
    }, 300);

    return () => clearTimeout(timer);
  }, [currentProjectId, searchQuery]);

  const handleSelectSearchResult = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleExitProject = () => {
    setCurrentProjectId(null);
    setProject(null);
    setGraphData({ nodes: [], edges: [] });
    setSelectedNodeId(undefined);
    setSelectedNodeDetail(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleExportMarkdown = async () => {
    if (!currentProjectId) return;
    try {
      const response = await axios.get(`/api/v1/projects/${currentProjectId}/export/markdown`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${project?.name || 'architecture'}-export.md`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export markdown:', err);
    }
  };

  // Fetch project details & graph when project ID changes
  useEffect(() => {
    if (!currentProjectId) return;

    axios.get<Project>(`/api/v1/projects/${currentProjectId}`).then((res) => {
      setProject(res.data);
    });

    axios.get<GraphData>(`/api/v1/projects/${currentProjectId}/graph`).then((res) => {
      setGraphData(res.data);
    });
  }, [currentProjectId]);

  // Fetch node detail when selectedNodeId changes
  useEffect(() => {
    if (!currentProjectId || !selectedNodeId) {
      setSelectedNodeDetail(null);
      return;
    }

    axios
      .get<NodeDetail>(`/api/v1/projects/${currentProjectId}/nodes/${selectedNodeId}`)
      .then((res) => {
        setSelectedNodeDetail(res.data);
      })
      .catch(() => setSelectedNodeDetail(null));
  }, [currentProjectId, selectedNodeId]);

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header Navbar */}
      <Header
        currentProjectName={project?.name}
        currentProjectId={currentProjectId}
        onOpenIngestModal={() => setIsIngestModalOpen(true)}
        onOpenDependencies={() => setIsDependencyModalOpen(true)}
        onOpenSqlExplorer={() => setIsSqlExplorerOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenErDiagram={() => setIsErDiagramOpen(true)}
        onOpenSecurityFlow={() => setIsSecurityFlowOpen(true)}
        onOpenFileTree={() => setIsFileTreeOpen(true)}
        onExportMarkdown={handleExportMarkdown}
        onExitProject={handleExitProject}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={searchResults}
        onSelectSearchResult={handleSelectSearchResult}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {!currentProjectId ? (
          /* Empty State Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-500 flex items-center justify-center shadow-2xl glow-indigo mb-6 animate-pulse-subtle">
              <Layers className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl font-extrabold text-white max-w-xl leading-tight">
              Interactive Execution Flow Explorer for Spring Boot & React
            </h2>
            <p className="text-sm text-slate-400 max-w-lg mt-3 leading-relaxed">
              Step-by-step visual execution flow tracing with interactive playback, annotation breakdowns, ERD Explorer, Security Flow, AI Assistant, and source code viewer.
            </p>

            <div className="mt-8 flex items-center space-x-4">
              <button
                onClick={() => setIsIngestModalOpen(true)}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-sm font-bold text-white shadow-xl shadow-pink-600/40 transition-all transform hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                <span>Import GitHub Repo / ZIP</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active Project Canvas & Inspector */
          <div className="flex-1 flex flex-col overflow-hidden">
            {project && <ProjectDashboard project={project} />}

            <div className="flex-1 flex overflow-hidden">
              <InteractiveFlowExplorer
                graphData={graphData}
                onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
                selectedNodeId={selectedNodeId}
                onViewCode={(path) => setViewingFilePath(path)}
              />

              {selectedNodeDetail && (
                <NodeInspectorSidebar
                  nodeDetail={selectedNodeDetail}
                  onClose={() => setSelectedNodeId(undefined)}
                  onViewCode={(path) => setViewingFilePath(path)}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <IngestionModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onProjectIngested={(projectId) => {
          setCurrentProjectId(projectId);
          setSelectedNodeId(undefined);
        }}
      />

      <MonacoViewerModal
        projectId={currentProjectId!}
        filePath={viewingFilePath}
        onClose={() => setViewingFilePath(null)}
      />

      <DependencyExplorerModal
        projectId={currentProjectId}
        isOpen={isDependencyModalOpen}
        onClose={() => setIsDependencyModalOpen(false)}
      />

      <SqlExplorerModal
        projectId={currentProjectId}
        isOpen={isSqlExplorerOpen}
        onClose={() => setIsSqlExplorerOpen(false)}
      />

      <AiAssistantModal
        projectId={currentProjectId}
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
      />

      <ErDiagramModal
        projectId={currentProjectId}
        isOpen={isErDiagramOpen}
        onClose={() => setIsErDiagramOpen(false)}
      />

      <SecurityExplorerModal
        projectId={currentProjectId}
        isOpen={isSecurityFlowOpen}
        onClose={() => setIsSecurityFlowOpen(false)}
      />

      <FileTreeModal
        projectId={currentProjectId}
        isOpen={isFileTreeOpen}
        onClose={() => setIsFileTreeOpen(false)}
        onViewCode={(path) => {
          setIsFileTreeOpen(false);
          setViewingFilePath(path);
        }}
      />
    </div>
  );
}
