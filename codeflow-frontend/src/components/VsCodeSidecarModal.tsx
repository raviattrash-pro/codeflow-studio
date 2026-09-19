import React, { useState } from 'react';
import {
  X, Code2, Copy, Check, Download, ExternalLink, Terminal,
  Cpu, FileCode, CheckCircle2, Play, Sparkles, Monitor
} from 'lucide-react';
import { ThemeMode } from './Header';

interface VsCodeSidecarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
}

export const VsCodeSidecarModal: React.FC<VsCodeSidecarModalProps> = ({
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
}) => {
  const [activeTab, setActiveTab] = useState<'MANIFEST' | 'EXTENSION_TS' | 'LSP_BRIDGE'>('EXTENSION_TS');
  const [copied, setCopied] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState('createOrder');

  if (!isOpen) return null;
  const isLight = currentTheme === 'NORMAL';

  const extensionTsCode = `// CodeFlow Studio VS Code Extension Sidecar (v9.0)
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('CodeFlow Studio Architecture Sidecar is active.');

  // 1. Open Live Architecture Flow Map
  const openFlowMapCmd = vscode.commands.registerCommand('codeflow.openFlowMap', () => {
    const panel = vscode.window.createWebviewPanel(
      'codeflowFlowMap',
      'CodeFlow: Live Architecture Flow',
      vscode.ViewColumn.Beside,
      { enableScripts: true, retainContextWhenHidden: true }
    );
    panel.webview.html = getWebviewContent('http://localhost:3000');
  });

  // 2. Trace Current Function Execution Path
  const traceFunctionCmd = vscode.commands.registerCommand('codeflow.traceCurrentFunction', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const document = editor.document;
    const position = editor.selection.active;
    const wordRange = document.getWordRangeAtPosition(position);
    const functionName = document.getText(wordRange);

    vscode.window.showInformationMessage(\`Tracing execution flow for: \${functionName}...\`);
    // Connects to local CodeFlow daemon on port 8080
    fetch(\`http://localhost:8080/api/v1/trace/inspect?symbol=\${functionName}\`);
  });

  // 3. AI Architecture Remediation
  const aiAuditCmd = vscode.commands.registerCommand('codeflow.aiExplainNode', async () => {
    vscode.window.showInformationMessage('CodeFlow AI: Auditing file layer boundary compliance...');
  });

  context.subscriptions.push(openFlowMapCmd, traceFunctionCmd, aiAuditCmd);
}

function getWebviewContent(url: string) {
  return \`<!DOCTYPE html><html><body style="margin:0;padding:0;overflow:hidden"><iframe src="\${url}" style="width:100vw;height:100vh;border:none;"></iframe></body></html>\`;
}

export function deactivate() {}`;

  const manifestCode = `{
  "name": "codeflow-studio-sidecar",
  "displayName": "CodeFlow Studio Architecture Sidecar",
  "description": "Live Visual Architecture & AST Execution Tracing directly inside VS Code",
  "version": "9.0.0",
  "publisher": "codeflow-studio",
  "engines": { "vscode": "^1.85.0" },
  "categories": ["Programming Languages", "Other"],
  "activationEvents": ["onLanguage:java", "onLanguage:typescript", "onLanguage:javascript"],
  "main": "./dist/extension.js",
  "contributes": {
    "commands": [
      { "command": "codeflow.openFlowMap", "title": "CodeFlow: Open Architecture Flow Map", "icon": "$(type-hierarchy)" },
      { "command": "codeflow.traceCurrentFunction", "title": "CodeFlow: Trace Function Execution Flow", "icon": "$(play)" },
      { "command": "codeflow.aiExplainNode", "title": "CodeFlow: AI Explain Architectural Layer", "icon": "$(sparkle)" }
    ],
    "menus": {
      "editor/context": [
        { "command": "codeflow.traceCurrentFunction", "group": "navigation@1" },
        { "command": "codeflow.aiExplainNode", "group": "navigation@2" }
      ]
    }
  }
}`;

  const lspBridgeCode = `// CodeFlow Studio LSP (Language Server Protocol) Bi-Directional Bridge
{
  "protocol": "codeflow-lsp-v1",
  "activeEditor": {
    "uri": "file:///src/main/java/com/codeflow/studio/controller/OrderController.java",
    "cursor": { "line": 42, "character": 18 },
    "astSymbol": "OrderController.createOrder(@RequestBody OrderRequest)",
    "layer": "API / Controller",
    "connectedEdges": [
      { "target": "OrderService.process()", "type": "DELEGATES_TO" },
      { "target": "JwtAuthenticationFilter", "type": "PROTECTED_BY" }
    ]
  },
  "liveTelemetry": {
    "p95Latency": "28.4ms",
    "activeConnections": 14,
    "lastTraced": "2026-09-19T11:42:00Z"
  }
}`;

  const getCode = () => {
    if (activeTab === 'MANIFEST') return manifestCode;
    if (activeTab === 'LSP_BRIDGE') return lspBridgeCode;
    return extensionTsCode;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="studio-modal-overlay">
      <div
        className="studio-modal-card w-full max-w-5xl flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: isLight ? '#ffffff' : '#0f172a' }}
      >
        {/* Header */}
        <div
          className="studio-modal-header flex items-center justify-between px-6 py-4"
          style={{ backgroundColor: isLight ? '#f1f5f9' : '#1e293b' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">VS Code IDE Sidecar & Extension Suite</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  v9.0 Sidecar
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Explore real-time visual execution flows and AST call graphs directly alongside code in VS Code
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Code'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left IDE Sidebar Simulator */}
          <div
            className="studio-modal-sidebar md:col-span-4 p-4 space-y-4 overflow-y-auto"
            style={{ backgroundColor: isLight ? '#f8fafc' : '#090d16' }}
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                IDE Quick Install
              </span>
              <div className="p-3 rounded-xl border border-slate-700/50 bg-[#141e33] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
                  <span>CLI VSIX Install</span>
                  <Terminal className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <pre className="text-[11px] font-mono text-emerald-400 bg-[#050811] p-2 rounded border border-slate-800 overflow-x-auto">
                  code --install-extension codeflow-studio.vsix
                </pre>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                LSP Cursor Synced Functions
              </span>
              <div className="space-y-1.5">
                {[
                  { name: 'OrderController.createOrder', file: 'OrderController.java:42', type: 'CONTROLLER' },
                  { name: 'OrderService.process', file: 'OrderService.java:68', type: 'SERVICE' },
                  { name: 'OrderRepository.save', file: 'OrderRepository.java:19', type: 'JPA' },
                ].map(fn => (
                  <button
                    key={fn.name}
                    onClick={() => setSelectedFunction(fn.name)}
                    className="w-full text-left p-2.5 rounded-xl border transition cursor-pointer"
                    style={{
                      backgroundColor: selectedFunction === fn.name ? (isLight ? '#e0f2fe' : '#1e293b') : (isLight ? '#ffffff' : '#141e33'),
                      borderColor: selectedFunction === fn.name ? '#38bdf8' : (isLight ? '#cbd5e1' : '#334155')
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-cyan-300 truncate">{fn.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{fn.type}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{fn.file}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>VS Code Extension Server listening on ws://localhost:9099</span>
            </div>
          </div>

          {/* Right Code Display */}
          <div
            className="studio-modal-content md:col-span-8 flex flex-col p-5 space-y-3"
            style={{ backgroundColor: isLight ? '#ffffff' : '#070a12', minHeight: 0 }}
          >
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                {[
                  { id: 'EXTENSION_TS', name: 'extension.ts (TypeScript)' },
                  { id: 'MANIFEST', name: 'package.json (VSIX)' },
                  { id: 'LSP_BRIDGE', name: 'LSP Protocol JSON' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer"
                    style={{
                      backgroundColor: activeTab === t.id ? '#0284c7' : (isLight ? '#f1f5f9' : '#1e293b'),
                      color: activeTab === t.id ? '#ffffff' : (isLight ? '#334155' : '#94a3b8')
                    }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="border border-slate-700/50 rounded-xl overflow-hidden flex-1 flex flex-col shadow-inner"
              style={{ backgroundColor: '#050811', minHeight: 0 }}
            >
              <pre className="p-4 text-xs font-mono text-cyan-300/90 leading-relaxed overflow-auto flex-1">
                {getCode()}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
