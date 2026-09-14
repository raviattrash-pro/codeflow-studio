import React, { useState, useEffect } from 'react';
import {
  X, Mic, MicOff, Sparkles, Volume2, ArrowRight, CheckCircle2, Command
} from 'lucide-react';
import { ThemeMode } from './Header';

interface VoiceCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
  onExecuteCommand: (action: string) => void;
}

export const VoiceCopilotModal: React.FC<VoiceCopilotModalProps> = ({
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
  onExecuteCommand,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [matchedIntent, setMatchedIntent] = useState<string | null>(null);

  if (!isOpen) return null;

  const isLight = currentTheme === 'NORMAL';
  const isGlass = currentTheme === 'GLASSMORPHISM';
  const isNeumorphic = currentTheme === 'NEUMORPHIC';

  const handleToggleListen = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setTranscript('Listening...');

    // Web Speech API fallback simulation
    setTimeout(() => {
      const samples = [
        'Audit database entity relationships',
        'Simulate Redis connection failure',
        'Switch to Glassmorphism theme',
        'Generate TypeScript interface for OrderDto',
        'Show API latency heatmap',
      ];
      const picked = samples[Math.floor(Math.random() * samples.length)];
      setTranscript(picked);
      setIsListening(false);
      setMatchedIntent(picked);
    }, 1800);
  };

  const handleExecute = () => {
    if (matchedIntent) {
      onClose();
      onExecuteCommand(matchedIntent);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg p-6 flex flex-col rounded-2xl shadow-2xl border items-center text-center space-y-6 ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : isGlass
            ? 'bg-[#0f172a] backdrop-blur-xl border-cyan-500/30 text-white'
            : isNeumorphic
            ? 'bg-[#1e2330] border-slate-700/50 text-slate-100'
            : 'bg-[#0f172a] border-slate-700 text-white'
        }`}
      >
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Voice Architecture Copilot</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Mic Button with Pulsing Wave */}
        <div className="relative">
          {isListening && (
            <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping" />
          )}
          <button
            onClick={handleToggleListen}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition transform hover:scale-105 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold">
            {isListening ? 'Listening for voice command...' : 'Tap Mic to Speak Architecture Command'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            "Audit database", "Simulate Stripe failure", "Generate TypeScript types", or "Switch to Night view"
          </p>
        </div>

        {transcript && (
          <div className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300">
            "{transcript}"
          </div>
        )}

        {matchedIntent && (
          <button
            onClick={handleExecute}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-xs text-white shadow-lg transition flex items-center justify-center gap-2"
          >
            <span>Execute: {matchedIntent}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
