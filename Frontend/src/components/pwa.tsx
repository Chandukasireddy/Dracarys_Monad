'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, WifiOff } from 'lucide-react';
type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
export function PwaControl({ notify }: { notify: (message: string) => void }) {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production')
      void navigator.serviceWorker.register('/sw.js').catch(() => {});
    const install = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPrompt);
    };
    const on = () => setOffline(!navigator.onLine);
    on();
    window.addEventListener('beforeinstallprompt', install);
    window.addEventListener('online', on);
    window.addEventListener('offline', on);
    return () => {
      window.removeEventListener('beforeinstallprompt', install);
      window.removeEventListener('online', on);
      window.removeEventListener('offline', on);
    };
  }, []);
  return (
    <>
      <button
        className="install-button"
        onClick={async () => {
          if (prompt) {
            await prompt.prompt();
            await prompt.userChoice;
            setPrompt(null);
          } else
            notify(
              'To install: open your browser menu and choose “Add to Home Screen”. On iPhone, use Safari’s Share menu.',
            );
        }}
      >
        <Download size={16} /> Install Streaker <span>↗</span>
      </button>
      {offline &&
        createPortal(
          <div className="offline-label">
            <WifiOff size={13} /> Offline · demo progress saved on this device
          </div>,
          document.body,
        )}
    </>
  );
}
