import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ICONS, SYSTEM_LOGS } from '../constants';
import { TerminalStatus, LogEntry } from '../types';
import { reengineerCode } from '../services/geminiService';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function TerminalUI() {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<TerminalStatus>(TerminalStatus.IDLE);
  const [optimizedCode, setOptimizedCode] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial boot logs
    const initialLogs: LogEntry[] = SYSTEM_LOGS.map((msg, i) => ({
      id: `boot-${i}`,
      message: msg,
      type: 'system',
      timestamp: Date.now() + i * 100
    }));
    setLogs(initialLogs);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: `${Date.now()}-${prev.length}`,
      message,
      type,
      timestamp: Date.now()
    }]);
  };

  const handleSniperShot = async () => {
    if (!input.trim()) return;

    setStatus(TerminalStatus.PROCESSING);
    addLog("INITIATING SNIPER_SHOT...", 'warning');
    addLog("SYNCHRONIZING WITH ARCHIVE_CORE...", 'info');

    try {
      // 1. Save original to Firebase
      const path = 'submissions';
      const guestId = `GUEST_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      try {
        await addDoc(collection(db, path), {
          originalCode: input,
          guestId,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
      addLog(`SUCCESS: SCRIPT_ARCHIVED_AS_${guestId}`, 'success');

      // 2. Visual AI Re-engineering
      addLog("RE-ENGINEERING NEURAL_PATHWAYS...", 'system');
      const result = await reengineerCode(input);
      
      setOptimizedCode(result);
      setStatus(TerminalStatus.COMPLETED);
      addLog("SENTINAX_OPTIMIZATION_COMPLETE", 'success');
      
    } catch (error) {
      console.error(error);
      addLog("PROTOCOL_ERROR: EXECUTION_ABORTED", 'error');
      setStatus(TerminalStatus.ERROR);
    }
  };

  return (
    <div className="relative z-10 flex flex-col h-full bg-transparent text-white font-mono p-4 md:p-6 gap-4 md:gap-6">
      {/* Header */}
      <header className="flex items-center justify-between p-4 glass rounded-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <ICONS.Cpu className="w-6 h-6 text-black" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tighter text-emerald-400 glow-text">SENTINAX AI</h1>
            <span className="text-[10px] opacity-50 uppercase tracking-[0.2em]">Tactical Script Engine</span>
          </div>
        </div>
        <div className="hidden md:flex gap-8 text-[11px] font-mono">
          <div className="flex flex-col items-end">
            <span className="opacity-40">STATUS</span>
            <span className="text-emerald-400">CORE_v4_ACTIVE</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="opacity-40">ENCRYPTION</span>
            <span className="text-emerald-400">FORTRESS_ACTIVE</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-4 md:gap-6 min-h-0">
        {/* Left Sidebar - Logs (Hidden on mobile for layout, or simplified) */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-4">
          <div className="glass flex-1 p-4 rounded-xl flex flex-col gap-3 min-h-0 overflow-hidden">
            <h2 className="text-[11px] uppercase tracking-widest text-emerald-500 font-bold mb-2">System Logs</h2>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
              {logs.map((log) => (
                <div key={log.id} className={`text-[10px] animate-in fade-in slide-in-from-left-2 ${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-emerald-300' :
                  log.type === 'warning' ? 'text-amber-300' :
                  'text-white/60'
                }`}>
                  <span className="opacity-40">[{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]</span> {log.message}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
          <div className="glass p-4 rounded-xl flex flex-col gap-2">
            <span className="text-[10px] opacity-40 uppercase tracking-widest">Connection Stronghold</span>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '92%' }}
                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
              />
            </div>
          </div>
        </aside>

        {/* Main Terminal Section */}
        <section className="col-span-1 flex lg:col-span-6 flex-col gap-4 min-h-0">
          <div className="glass flex-1 rounded-xl flex flex-col overflow-hidden border-emerald-500/20 group backdrop-blur-2xl">
            <div className="bg-white/5 p-3 flex justify-between border-b border-white/10 items-center">
              <span className="text-[10px] font-mono opacity-60 flex items-center gap-2 uppercase tracking-widest">
                <ICONS.Terminal className="w-3 h-3" />
                Script_Source_Buffer
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE_SYNC
              </span>
            </div>
            
            <div className="flex-1 p-4 font-mono text-sm overflow-y-auto custom-scrollbar bg-black/20">
              {optimizedCode ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                   <div className="text-[10px] px-2 py-1 rounded bg-white/5 inline-block text-emerald-400 mb-2 border border-white/10">
                    OUTPUT: OPTIMIZED_VERSION
                   </div>
                   <pre className="text-emerald-400/90 leading-relaxed whitespace-pre-wrap break-all text-xs selection:bg-emerald-500 selection:text-black">
                    {optimizedCode}
                   </pre>
                </motion.div>
              ) : (
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={status === TerminalStatus.PROCESSING}
                  placeholder="// PASTE_RAW_PINE_SCRIPT_FOR_RE_ENGINEERING..."
                  className="w-full h-full bg-transparent text-emerald-500/80 resize-none outline-none placeholder:opacity-20 leading-relaxed selection:bg-emerald-500 selection:text-black scrollbar-hide"
                />
              )}
            </div>

            <div className="p-4 bg-black/40 border-t border-white/5 flex gap-4">
              <button
                onClick={handleSniperShot}
                disabled={(!input.trim() && !optimizedCode) || status === TerminalStatus.PROCESSING}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-black font-black py-4 rounded-lg transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.3)] group disabled:opacity-30 disabled:grayscale uppercase tracking-[0.2em] text-xs"
              >
                {status === TerminalStatus.PROCESSING ? (
                  <>
                    <ICONS.Zap className="w-4 h-4 animate-spin" />
                    Calculating...
                  </>
                ) : optimizedCode ? (
                  <>
                    <ICONS.Zap className="w-4 h-4" />
                    Reset Buffer
                  </>
                ) : (
                   <>
                    <ICONS.Zap className="w-4 h-4 group-hover:animate-pulse" />
                    Sniper Shot
                  </>
                )}
              </button>
              {optimizedCode && (
                <button
                  onClick={() => { setOptimizedCode(null); setInput(''); setStatus(TerminalStatus.IDLE); }}
                  className="p-4 glass rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ICONS.ChevronLeft className="w-5 h-5 text-emerald-400" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Right Sidebar - AI Analysis */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-4">
          <div className="glass p-4 rounded-xl flex flex-col gap-4">
            <h2 className="text-[11px] uppercase tracking-widest text-emerald-500 font-bold">AI Neuro-Analysis</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg glow-text">
                {status === TerminalStatus.COMPLETED ? '98%' : '??%'}
              </div>
              <div className="text-[10px]">
                <p className="text-white font-bold uppercase">Efficiency_Score</p>
                <p className="opacity-40">{status === TerminalStatus.COMPLETED ? 'Optimization complete' : 'Waiting for injection...'}</p>
              </div>
            </div>
            <div className="h-px bg-white/10"></div>
            <div className="space-y-4">
              <div className="flex flex-col gap-1 text-[10px]">
                <span className="opacity-40 uppercase tracking-widest">Network Sync</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${status === TerminalStatus.PROCESSING ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 brightness-150 shadow-[0_0_5px_#10b981]'}`} />
                  <span className="font-mono">{status === TerminalStatus.PROCESSING ? 'Syncing...' : 'Cloud_Vault_Ready'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-[10px]">
                <span className="opacity-40 uppercase tracking-widest">Encryption Level</span>
                <span className="font-mono text-emerald-400">Military_v4_Fortress</span>
              </div>
            </div>
          </div>
          
          <div className="glass flex-1 p-6 rounded-xl flex flex-col justify-center items-center gap-4 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
              <ICONS.ShieldCheck className="w-8 h-8 text-white/20" />
            </div>
            <div className="text-[10px] opacity-40 font-mono leading-relaxed uppercase tracking-tighter">
              SYSTEM_SECURED_BY_FORTRESS_v4<br/>
              ALL DATA ARCHIVED ON SUBMISSION
            </div>
          </div>
        </aside>
      </div>

      <footer className="h-4 flex justify-between items-center text-[9px] opacity-30 font-mono tracking-widest uppercase mt-auto">
        <span>Sentinax Global Operations - Restricted Access</span>
        <span className="flex items-center gap-2">
          <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
          Terminal v4.2.0_STABLE
        </span>
      </footer>
    </div>
  );
}
