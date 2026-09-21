import React from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Floating update prompt: appears when a new CRM build is available.
 * Refresh applies the waiting service worker immediately.
 * Also surfaces a subtle offline indicator when the network drops.
 */
export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
    offlineReady: [offlineReady],
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      // Hourly update check while the app stays open
      if (registration) {
        setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 60 * 1000);
      }
    },
  });

  const [isOffline, setIsOffline] = React.useState(
    typeof navigator !== 'undefined' ? navigator.onLine === false : false
  );

  React.useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!needRefresh && !isOffline) return null;

  return (
    <div
      role={needRefresh ? 'alert' : 'status'}
      style={{
        position: 'fixed',
        bottom: 76,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        borderRadius: 12,
        background: needRefresh ? 'var(--color-primary)' : '#0F172A',
        color: '#fff',
        fontSize: 13,
        fontWeight: 600,
        boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        maxWidth: 'calc(100vw - 32px)',
      }}
    >
      {needRefresh ? (
        <>
          <RefreshCw size={15} />
          <span>New version available</span>
          <button
            type="button"
            onClick={() => updateServiceWorker(true)}
            style={{
              background: '#fff',
              color: 'var(--color-primary)',
              border: 'none',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setNeedRefresh(false)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.8, fontSize: 14, padding: '2px 4px' }}
          >
            ✕
          </button>
        </>
      ) : (
        <>
          <WifiOff size={15} />
          <span>You&apos;re offline{offlineReady ? ' — cached data available' : ''}</span>
        </>
      )}
    </div>
  );
}
