import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';

/**
 * Sidebar install entry: native install button on Chromium,
 * Add-to-Home-Screen guidance on iOS. Hidden when already installed
 * (standalone) or when the browser offers no install path.
 */
export function InstallAppButton() {
  const { canInstall, promptInstall, isStandalone, isIOS } = usePwaInstall();
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (isStandalone) return null;

  if (canInstall) {
    return (
      <button
        type="button"
        className="btn btn-primary"
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, fontWeight: 700, height: 38 }}
        disabled={installing}
        onClick={async () => {
          setInstalling(true);
          await promptInstall();
          setInstalling(false);
        }}
      >
        <Download size={15} />
        <span>{installing ? 'Installing…' : 'Install App'}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <div>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 12, fontWeight: 600, height: 36 }}
          onClick={() => setShowIosHelp((v) => !v)}
        >
          <Share size={14} />
          <span>Add to Home Screen</span>
        </button>
        {showIosHelp && (
          <div style={{ marginTop: 8, padding: 10, borderRadius: 10, background: 'var(--color-bg-secondary, #F1F5FD)', border: '1px solid var(--color-border)', fontSize: 11, lineHeight: 1.6, color: 'var(--color-fg)', position: 'relative' }}>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setShowIosHelp(false)}
              style={{ position: 'absolute', top: 4, right: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted-fg)', padding: 4, display: 'flex' }}
            >
              <X size={12} />
            </button>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Install on iPhone / iPad</div>
            <div>1. Tap <strong>Share</strong> in Safari&apos;s toolbar</div>
            <div>2. Scroll and tap <strong>Add to Home Screen</strong></div>
            <div>3. Tap <strong>Add</strong> — the CRM opens full-screen</div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
