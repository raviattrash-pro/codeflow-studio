import React, { useState } from 'react';
import {
  X, Users, Mic, MicOff, MessageSquare, Send, CheckCircle2,
  Share2, Sparkles, Shield, ThumbsUp, Circle
} from 'lucide-react';
import { ThemeMode } from './Header';

interface LiveCollabModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
}

interface Peer {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isSpeaking: boolean;
  color: string;
}

const PEERS: Peer[] = [
  { id: 'p1', name: 'Sarah Chen', role: 'Staff Enterprise Architect', avatar: '👩‍💻', isSpeaking: true, color: '#38bdf8' },
  { id: 'p2', name: 'Alex Rivera', role: 'Lead Backend Engineer', avatar: '👨‍💻', isSpeaking: false, color: '#10b981' },
  { id: 'p3', name: 'Elena Rostov', role: 'DevSecOps Specialist', avatar: '👩‍🔬', isSpeaking: false, color: '#f59e0b' },
];

export const LiveCollabModal: React.FC<LiveCollabModalProps> = ({
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
}) => {
  const [messages, setMessages] = useState([
    { user: 'Sarah Chen', time: '11:42', text: 'Reviewed the OrderController isolation change. Moving to READ_COMMITTED prevents HikariCP contention.' },
    { user: 'Elena Rostov', time: '11:43', text: 'Confirmed. Added @RateLimited annotation to the Express Checkout API.' },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  if (!isOpen) return null;
  const isLight = currentTheme === 'NORMAL';

  const handleSend = () => {
    if (!inputMsg.trim()) return;
    setMessages(prev => [...prev, { user: 'You (Lead Architect)', time: new Date().toLocaleTimeString().slice(0, 5), text: inputMsg.trim() }]);
    setInputMsg('');
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Real-Time WebRTC Architecture Collaboration Room</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-user real-time diagram markup, voice channel, and live architectural review sign-offs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                isAudioMuted
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {isAudioMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isAudioMuted ? 'Muted' : 'Mic Live'}</span>
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
          {/* Left Peer Presence List */}
          <div
            className="studio-modal-sidebar md:col-span-5 p-4 space-y-4 overflow-y-auto"
            style={{ backgroundColor: isLight ? '#f8fafc' : '#090d16' }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Connected Architects (3 Live)
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                  <Circle className="w-2 h-2 fill-emerald-400" /> WebRTC Mesh
                </span>
              </div>

              <div className="space-y-2">
                {PEERS.map(peer => (
                  <div
                    key={peer.id}
                    className="p-3 rounded-xl border flex items-center justify-between transition"
                    style={{
                      backgroundColor: isLight ? '#ffffff' : '#141e33',
                      borderColor: peer.isSpeaking ? peer.color : (isLight ? '#e2e8f0' : '#334155')
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="text-xl relative">
                        {peer.avatar}
                        {peer.isSpeaking && (
                          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{peer.name}</span>
                          {peer.isSpeaking && <span className="text-[10px] text-emerald-400 font-normal">speaking...</span>}
                        </div>
                        <div className="text-[10px] text-slate-400">{peer.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture RFC Sign-off HUD */}
            <div className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-950/20 space-y-2">
              <span className="text-xs font-bold text-indigo-300 block">RFC #88 — Checkout v2 Approval</span>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Required Sign-offs:</span>
                <span className="font-bold text-emerald-400">3 / 3 Approved</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-400 w-full rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Right Live Review Chat */}
          <div
            className="studio-modal-content md:col-span-7 flex flex-col p-5 space-y-3"
            style={{ backgroundColor: isLight ? '#ffffff' : '#070a12', minHeight: 0 }}
          >
            <span className="text-xs font-bold uppercase text-slate-400 shrink-0">
              Live Architecture Discussion Stream
            </span>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border font-mono text-xs space-y-1"
                  style={{
                    backgroundColor: isLight ? '#f8fafc' : '#141e33',
                    borderColor: isLight ? '#e2e8f0' : '#1e293b'
                  }}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-bold text-emerald-400">{m.user}</span>
                    <span>{m.time}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-sans text-xs">{m.text}</p>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <div className="flex items-center gap-2 pt-2 shrink-0">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type architecture annotation or question..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-700 bg-[#141e33] text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleSend}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
