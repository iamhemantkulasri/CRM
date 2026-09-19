import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Copy, Check, MessageSquare, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export function CatalogModal({ isOpen, onClose, selectedProperties = [] }) {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [copied, setCopied] = useState(false);

  // Generate a friendly token based on client name or timestamp
  const safeName = (clientName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-') || 'client').slice(0, 20);
  const idsParam = (selectedProperties || []).map(p => p.id).join(',');
  const token = `${safeName}-${Date.now().toString(36)}`;
  
  // Production vs local domain
  const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://tgvestates.com';

  const catalogUrl = `${baseUrl}/c/${token}?ids=${encodeURIComponent(idsParam)}&client=${encodeURIComponent(clientName || 'Valued Client')}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(catalogUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const text = `Hi ${clientName || 'there'}, here is the private, curated property selection we put together for you from TGV Estates:\n\n🔗 ${catalogUrl}\n\nYou can review high-resolution galleries, unit floor plans, and commute details directly on the link, or download the complete PDF brochure with one click. Let me know when you'd like to schedule a visit!`;
    const cleanPhone = clientPhone.replace(/[^0-9]/g, '');
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop" />
        <Dialog.Content 
          className="modal-content"
          style={{ 
            maxWidth: 580, 
            width: '94vw', 
            padding: 24, 
            borderRadius: 16, 
            border: '1px solid var(--color-border)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ 
                  background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', 
                  color: '#fff', 
                  padding: '3px 8px', 
                  borderRadius: 6, 
                  fontSize: 11, 
                  fontWeight: 700 
                }}>
                  PRIVATE DOSSIER
                </span>
                <Dialog.Title className="text-h2" style={{ margin: 0 }}>
                  Generate Client Catalog
                </Dialog.Title>
              </div>
              <p className="text-body mt-1" style={{ color: 'var(--color-muted-fg)', fontSize: 13 }}>
                Send a private, unlisted TGV Estates digital presentation directly over WhatsApp.
              </p>
            </div>
            <Dialog.Close asChild>
              <button className="btn btn-icon btn-ghost" aria-label="Close">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Client Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Vikram Malhotra"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>WhatsApp Number (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Selected Properties Preview */}
            <div style={{ background: 'var(--color-bg-secondary)', padding: 12, borderRadius: 10, border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-muted-fg)' }}>
                  Selected Units ({selectedProperties.length})
                </span>
                <span style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}>
                  Hidden from public search
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 140, overflowY: 'auto' }}>
                {selectedProperties.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '4px 8px', background: 'var(--color-surface)', borderRadius: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                      <span style={{ fontWeight: 600 }}>{p.name || p.title}</span>
                      <span style={{ color: 'var(--color-muted-fg)', fontSize: 12 }}>({p.configuration || p.bhk})</span>
                      <span style={{ 
                        fontSize: 10, 
                        padding: '1px 5px', 
                        borderRadius: 4, 
                        background: p.tier === 'normal' ? '#f1f5f9' : '#eff6ff',
                        color: p.tier === 'normal' ? '#475569' : '#1d4ed8',
                        fontWeight: 600
                      }}>
                        {p.tier === 'normal' ? 'Off-Market' : 'Luxury'}
                      </span>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--color-fg)' }}>
                      {formatINR(p.priceLakhs)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Link output box */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Secret Catalog Link</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  readOnly
                  className="form-input"
                  style={{ background: 'var(--color-bg-secondary)', fontSize: 12, fontFamily: 'monospace' }}
                  value={catalogUrl}
                />
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCopy}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 95 }}
                >
                  {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Trust note */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-muted-fg)' }}>
              <ShieldCheck size={16} color="#10b981" />
              <span>Protected with <code>noindex</code> meta tags. Search engines will never crawl or display these properties.</span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleWhatsApp}
                style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, background: '#16a34a', borderColor: '#16a34a' }}
              >
                <MessageSquare size={16} />
                <span>Send via WhatsApp</span>
              </button>
              <a
                href={catalogUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <ExternalLink size={16} />
                <span>Preview</span>
              </a>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
