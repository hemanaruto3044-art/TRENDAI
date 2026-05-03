import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth, logout, signInWithGoogle, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ICONS } from '../constants';
import { PineScriptSubmission } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [submissions, setSubmissions] = useState<PineScriptSubmission[]>([]);
  const [selected, setSelected] = useState<PineScriptSubmission | null>(null);
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });

    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      unsubscribeAuth();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!user || user.email !== 'hemanaruto3044@gmail.com') {
      setSubmissions([]);
      return;
    }

    const path = 'submissions';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PineScriptSubmission[];
      setSubmissions(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [user]);

  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyStatus('COPIED!');
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (err) {
      console.error(err);
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopyStatus('COPIED!');
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  const exportPDF = async () => {
    if (!selected) return;
    const element = document.getElementById('code-preview-area');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { backgroundColor: '#000' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.setFontSize(22);
      pdf.text('SENTINAX_AI // ANALYSIS_REPORT', 15, 20);
      pdf.setFontSize(10);
      pdf.text(`ID: ${selected.guestId}`, 15, 30);
      pdf.text(`TIMESTAMP: ${new Date(selected.createdAt?.toDate()).toLocaleString()}`, 15, 35);
      
      pdf.addImage(imgData, 'PNG', 0, 45, pdfWidth, pdfHeight);
      pdf.save(`SentinaxReport_${selected.guestId}.pdf`);
    } catch (err) {
      console.error(err);
      alert('PDF_EXPORT_FAILED');
    }
  };

  if (loading) return null;

  if (!user || user.email !== 'hemanaruto3044@gmail.com') {
    return (
      <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center p-6 text-white font-mono">
        <ICONS.ShieldCheck className="w-16 h-16 text-[#00FF00] mb-8" />
        <h1 className="text-xl font-black mb-2 tracking-[0.5em] uppercase">Sentinel Protocol</h1>
        <p className="text-xs opacity-50 mb-8">AUTHENTICATION_REQUIRED_FOR_LOG_ACCESS</p>
        <button
          onClick={signInWithGoogle}
          className="px-8 py-4 border border-[#00FF00]/30 hover:bg-[#00FF00]/10 flex items-center gap-3 transition-all"
        >
          <ICONS.User className="w-5 h-5" />
          <span className="text-xs uppercase font-bold tracking-widest">Sign in with Google</span>
        </button>
        <button onClick={onClose} className="mt-8 text-[10px] opacity-30 hover:opacity-100 transition-opacity">EXIT_COMMAND</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] glass backdrop-blur-3xl text-white font-mono flex flex-col md:flex-row overflow-hidden pb-safe">
       {/* Sidebar - List */}
       <div className={`w-full md:w-80 border-r border-white/10 flex flex-col ${selected && isMobileView ? 'hidden' : 'flex'} bg-black/40`}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center glass m-2 rounded-xl">
          <div>
            <h2 className="text-sm font-black tracking-widest uppercase text-emerald-400 glow-text">Guest Logs</h2>
            <p className="text-[10px] opacity-40">Tactical Archives</p>
          </div>
          <button onClick={logout} className="p-2 opacity-30 hover:opacity-100 hover:text-red-400 transition-all"><ICONS.LogOut className="w-4 h-4" /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
          {submissions.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelected(sub)}
              className={`w-full p-4 rounded-xl border border-white/5 text-left transition-all flex items-center justify-between group ${selected?.id === sub.id ? 'glass bg-emerald-500/10 border-emerald-500/30' : 'hover:bg-white/5'}`}
            >
              <div>
                <div className={`text-[11px] font-bold ${selected?.id === sub.id ? 'text-emerald-400' : 'text-white/80'}`}>{sub.guestId}</div>
                <div className="text-[9px] opacity-40">{sub.createdAt?.toDate()?.toLocaleString()}</div>
              </div>
              <ICONS.Search className={`w-3 h-3 transition-opacity ${selected?.id === sub.id ? 'opacity-100 text-emerald-400' : 'opacity-0 group-hover:opacity-40'}`} />
            </button>
          ))}
        </div>
        
        <div className="p-4 bg-black/20">
          <button onClick={onClose} className="w-full py-3 glass rounded-xl text-[10px] uppercase font-bold tracking-widest hover:bg-white/5 border-white/5 transition-all">TERMINATE_SESSION</button>
        </div>
      </div>

      {/* Main Preview */}
      <div className={`flex-1 flex flex-col ${!selected && isMobileView ? 'hidden' : 'flex'} bg-black/10`}>
        {selected ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 flex flex-col p-4 md:p-6"
            >
              <div className="glass rounded-2xl flex-1 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <div className="flex items-center gap-4">
                    {isMobileView && (
                      <button onClick={() => setSelected(null)} className="p-2 -ml-2 text-emerald-400 glass rounded-lg"><ICONS.ChevronLeft className="w-5 h-5" /></button>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-emerald-400 glow-text">{selected.guestId}</h3>
                      <p className="text-[10px] opacity-40 uppercase tracking-widest">Source_Script_Retrieval</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(selected.originalCode)}
                      className={`px-4 py-2 text-black text-[10px] font-black tracking-widest uppercase rounded-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 ${copyStatus ? 'bg-white' : 'bg-emerald-500 hover:bg-emerald-400'}`}
                    >
                      {copyStatus || 'COPY_ALL'}
                    </button>
                    <button
                      onClick={exportPDF}
                      className="p-2 glass rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                      <ICONS.FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div id="code-preview-area" className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-black/40">
                  <div className="mb-4 flex items-center gap-2 opacity-30 text-[10px] uppercase font-bold tracking-tighter">
                    <ICONS.Database className="w-3 h-3" />
                    <span>DECRYPTED_RAW_OUTPUT_v3.0.1</span>
                  </div>
                  <pre className="text-xs text-white/90 whitespace-pre-wrap break-words leading-relaxed font-mono select-all bg-black p-4 rounded-xl border border-white/5">
                    {selected.originalCode}
                  </pre>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-10">
            <ICONS.Terminal className="w-32 h-32 mb-6" />
            <p className="text-xs uppercase tracking-[0.8em]">SECURED_ACCESS_ONLY</p>
          </div>
        )}
      </div>
    </div>
  );
}
