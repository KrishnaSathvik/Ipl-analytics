import { useState, useEffect } from 'react';
import { Cricket, X, PlusCircle } from '@phosphor-icons/react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show after 3 seconds — don't be too eager
      setTimeout(() => setShow(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setShow(false);
  }

  if (!show || installed) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 72, left: 12, right: 12, zIndex: 60,
      background: '#09090b', borderRadius: 14, padding: '14px 16px',
      border: '1px solid rgba(249,115,22,0.4)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', gap: 12,
      animation: 'slideUp 0.3s ease',
    }}>
      <Cricket size={28} weight="fill" color="var(--accent)" style={{flexShrink:0}} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f0f8', marginBottom: 2 }}>
          Add IPL Hub to Home Screen
        </div>
        <div style={{ fontSize: 11, color: '#71717a' }}>
          Get live scores one tap away. Works offline.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={handleInstall} style={{
          display:'flex',alignItems:'center',gap:5,
          padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
          background: '#f97316', color: '#fff', border: 'none', cursor: 'pointer',
        }}><PlusCircle size={14} weight="bold" /> Add</button>
        <button onClick={() => setShow(false)} style={{
          display:'flex',alignItems:'center',justifyContent:'center',
          padding: '7px 10px', borderRadius: 8, fontSize: 12,
          background: 'rgba(255,255,255,0.08)', color: '#71717a',
          border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
        }}><X size={14} weight="bold" /></button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
