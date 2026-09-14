import React, { useState } from 'react';
import {
  X, Activity, Send, Play, RotateCcw, CheckCircle2,
  Zap, Layers, Radio, ArrowRight, MessageSquare
} from 'lucide-react';
import { ThemeMode } from './Header';

interface EventStreamVisualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
}

interface EventLog {
  id: string;
  topic: string;
  timestamp: string;
  payload: string;
  consumer: string;
  latencyMs: number;
}

export const EventStreamVisualizerModal: React.FC<EventStreamVisualizerModalProps> = ({
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
}) => {
  const [selectedTopic, setSelectedTopic] = useState<'orders.created' | 'payments.settled' | 'inventory.reserved'>('orders.created');
  const [isPublishing, setIsPublishing] = useState(false);
  const [events, setEvents] = useState<EventLog[]>([
    {
      id: 'ev-1',
      topic: 'orders.created',
      timestamp: '14:32:01.420',
      payload: '{"orderId":"ord_881","userId":"usr_42","amount":1999.00}',
      consumer: 'InventoryReservationConsumer.java',
      latencyMs: 3.4
    }
  ]);

  if (!isOpen) return null;

  const isLight = currentTheme === 'NORMAL';

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      const newEv: EventLog = {
        id: `ev-${Date.now()}`,
        topic: selectedTopic,
        timestamp: new Date().toLocaleTimeString() + '.' + Math.floor(Math.random() * 900 + 100),
        payload: JSON.stringify({
          eventId: `evt_${Math.floor(Math.random() * 90000 + 10000)}`,
          topic: selectedTopic,
          data: { timestamp: new Date().toISOString() }
        }),
        consumer: selectedTopic === 'orders.created' ? 'PaymentProcessorConsumer.java' : 'NotificationDispatchConsumer.java',
        latencyMs: Number((Math.random() * 4 + 1.2).toFixed(1))
      };
      setEvents(prev => [newEv, ...prev]);
      setIsPublishing(false);
    }, 300);
  };

  return (
    <div className="studio-modal-overlay">
      <div
        className="studio-modal-card w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: isLight ? '#ffffff' : '#0f172a' }}
      >
        {/* Header */}
        <div
          className="studio-modal-header flex items-center justify-between px-6 py-4"
          style={{ backgroundColor: isLight ? '#f1f5f9' : '#1e293b' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Event Stream & Kafka / WebSocket Visualizer</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  Event-Driven
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Visualize Spring Cloud Stream producers, Kafka consumer groups, and WebSocket / SSE live telemetry streams
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Controls */}
          <div
            className="studio-modal-sidebar md:col-span-4 p-4 space-y-4 overflow-y-auto"
            style={{ backgroundColor: isLight ? '#f8fafc' : '#090d16' }}
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Kafka Topics / Channels
              </span>
              <div className="space-y-2">
                {['orders.created', 'payments.settled', 'inventory.reserved'].map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedTopic(t as any)}
                    className="w-full text-left p-3 rounded-xl border transition cursor-pointer"
                    style={{
                      backgroundColor: selectedTopic === t ? (isLight ? '#f3e8ff' : '#1e293b') : (isLight ? '#ffffff' : '#141e33'),
                      borderColor: selectedTopic === t ? '#c084fc' : (isLight ? '#cbd5e1' : '#334155')
                    }}
                  >
                    <span className="text-xs font-bold block">{t}</span>
                    <span className="text-[10px] text-slate-400 font-mono">3 Consumer Groups • 0 Lag</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/20 hover:from-purple-500 hover:to-pink-500 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {isPublishing ? 'Publishing...' : 'Publish Test Event Payload'}
            </button>
          </div>

          {/* Right Live Stream */}
          <div
            className="studio-modal-content md:col-span-8 flex flex-col p-5 overflow-y-auto space-y-3"
            style={{ backgroundColor: isLight ? '#ffffff' : '#070a12' }}
          >
            <span className="text-xs font-bold uppercase text-slate-400">
              Live Event Consumer Stream ({events.length})
            </span>

            <div className="space-y-2 flex-1">
              {events.map(ev => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl border font-mono text-xs space-y-1.5"
                  style={{
                    backgroundColor: isLight ? '#f8fafc' : '#0f172a',
                    borderColor: isLight ? '#e2e8f0' : '#1e293b'
                  }}
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-purple-400 font-bold">{ev.topic}</span>
                    <span className="text-[11px]">{ev.timestamp} ({ev.latencyMs}ms)</span>
                  </div>
                  <pre
                    className="p-2 rounded text-cyan-300 text-[11px] overflow-x-auto"
                    style={{ backgroundColor: isLight ? '#f1f5f9' : '#050811' }}
                  >
                    {ev.payload}
                  </pre>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Consumed by: {ev.consumer}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
