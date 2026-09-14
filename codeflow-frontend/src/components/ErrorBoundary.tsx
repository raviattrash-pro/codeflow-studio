import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Copy, Check } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, copied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('CodeFlow Studio caught runtime error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, copied: false });
    window.location.reload();
  };

  private handleCopyError = () => {
    const details = `Error: ${this.state.error?.message}\n\nStack:\n${this.state.error?.stack}\n\nComponent Stack:\n${this.state.errorInfo?.componentStack}`;
    navigator.clipboard.writeText(details);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070a12] text-slate-100 flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-xl w-full bg-[#0f172a] border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {this.props.fallbackTitle || 'Studio Runtime Boundary'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {this.props.fallbackMessage || 'An unexpected runtime state was caught safely by CodeFlow Studio'}
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            <div className="bg-[#070a12] border border-slate-800 rounded-xl p-4 font-mono text-xs text-red-300 overflow-x-auto max-h-48 scrollbar-thin">
              <div className="font-semibold text-red-400 mb-1">
                {this.state.error?.name || 'Error'}: {this.state.error?.message || 'Unknown Exception'}
              </div>
              {this.state.error?.stack && (
                <pre className="text-[10px] text-slate-500 mt-2 whitespace-pre-wrap leading-relaxed">
                  {this.state.error.stack.split('\n').slice(0, 6).join('\n')}
                </pre>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleCopyError}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition"
              >
                {this.state.copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied Diagnostic</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Diagnostics</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reload Studio</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
