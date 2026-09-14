import React, { useState, useEffect } from 'react';
import {
  X, Mic, MicOff, Volume2, Sparkles, Terminal, Activity, ArrowRight
} from 'lucide-react';
import { ThemeMode } from './Header';

interface VoiceCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
  onExecuteCommand: (cmd: string) => void;
}

export const VoiceCopilotModal: React.FC<VoiceCopilotModalProps> = ({
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
  onExecuteCommand,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('Press mic or select a quick voice command...');

  if (!isOpen) return null;

  const isLight = currentTheme === 'NORMAL';

  const triggerVoice = (cmdText: string) => {
    setTranscript(cmdText);
    setFeedback(`Executing: "${cmdText}"`);
    onExecuteCommand(cmdText);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleStartListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setFeedback('Web Speech API not supported in this browser. Please use quick commands below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setFeedback('Listening... Speak an architecture command now');
      };

      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        triggerVoice(text);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setFeedback('Could not capture audio. Please select a quick command below.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      setFeedback('Speech recognition error. Use quick buttons below.');
    }
  };

  return (
    <div className="studio-modal-overlay">
      <div
        className="studio-modal-card w-full max-w-lg flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: isLight ? '#ffffff' : '#0f172a' }}
      >
        {/* Header */}
        <div
          className="studio-modal-header flex items-center justify-between px-6 py-4"
          style={{ backgroundColor: isLight ? '#f1f5f9' : '#1e293b' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white font-bold shadow-lg shadow-rose-500/20">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Voice Architecture Copilot</h2>
              <p className="text-xs text-slate-400">Speak natural commands to audit & control</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div
          className="studio-modal-content p-6 space-y-5"
          style={{ backgroundColor: isLight ? '#ffffff' : '#070a12' }}
        >
          <div className="flex flex-col items-center justify-center py-4 space-y-3">
            <button
              onClick={handleStartListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-500/30'
                  : 'bg-gradient-to-tr from-rose-500 to-amber-500 text-white hover:scale-105 shadow-rose-500/30'
              }`}
            >
              {isListening ? <Mic className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
            <span className="text-xs text-slate-400 font-mono text-center">
              {feedback}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Suggested Voice Commands
            </span>
            <div className="space-y-1.5">
              {[
                'Audit database entity relationships',
                'Simulate Redis connection failure',
                'Synthesize Docker Compose setup',
                'Generate RestAssured test suite',
                'Switch to Glassmorphism view',
              ].map(cmd => (
                <button
                  key={cmd}
                  onClick={() => triggerVoice(cmd)}
                  className="w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between text-xs cursor-pointer"
                  style={{
                    backgroundColor: isLight ? '#f8fafc' : '#141e33',
                    borderColor: isLight ? '#e2e8f0' : '#1e293b',
                    color: isLight ? '#0f172a' : '#f8fafc'
                  }}
                >
                  <span className="font-mono">"{cmd}"</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
