import React, { useState, useCallback, useRef } from 'react';
import TerminalUI from './components/TerminalUI';
import AdminPanel from './components/AdminPanel';
import { ICONS } from './constants';

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = useCallback(() => {
    clickCountRef.current += 1;
    
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    if (clickCountRef.current === 3) {
      setIsAdminOpen(true);
      clickCountRef.current = 0;
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 400);
    }
  }, []);

  return (
    <main className="h-screen w-screen bg-[#050505] overflow-hidden flex flex-col relative select-none">
      {/* Theme Overlays */}
      <div className="emerald-gradient absolute inset-0 opacity-40 pointer-events-none" />
      <div className="scanline absolute inset-0 z-50 pointer-events-none" />

      {/* Hidden Control Trigger (Logo) */}
      <div 
        onClick={handleLogoClick}
        className="absolute top-4 left-4 z-[60] cursor-pointer active:scale-95 transition-transform"
        id="sentinax-logo-trigger"
      >
        <ICONS.Cpu className="w-8 h-8 text-[#00FF00] drop-shadow-[0_0_8px_rgba(0,255,0,0.5)]" />
      </div>

      <TerminalUI />

      {isAdminOpen && (
        <AdminPanel onClose={() => setIsAdminOpen(false)} />
      )}
    </main>
  );
}
