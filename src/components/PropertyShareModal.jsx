import React, { useState, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Search, Send, User, Check, Phone, Building2 } from 'lucide-react';
import { useLeadStore } from '../store/leadStore';
import { useAuthStore } from '../store/authStore';
import { useActivityStore } from '../store/activityStore';
import { formatINR } from '../utils/formatters';
import { calculatePropertyMatch } from '../utils/matchingEngine';

export function PropertyShareModal({ property, isOpen, onClose }) {
  const { leads } = useLeadStore();
  const { currentUser } = useAuthStore();
  const { logActivity } = useActivityStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sentLeadId, setSentLeadId] = useState(null);

  if (!property) return null;

  // Filter and score leads for this property
  const rankedLeads = useMemo(() => {
    return leads
      .map(lead => ({
        lead,
        score: calculatePropertyMatch(lead.requirements, property)
      }))
      .filter(({ lead }) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          lead.name?.toLowerCase().includes(q) ||
          lead.phone?.includes(q) ||
          lead.requirements?.preferredLocalities?.some(loc => loc.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => b.score - a.score);
  }, [leads, property, searchQuery]);

  const handleSendPitch = (lead) => {
    const mapUrl = property.locationLink || `https://maps.google.com/?q=${encodeURIComponent(property.locality + ', ' + (property.city || 'India'))}`;
    const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    
    const text = `Hi ${lead.name}, this is PropDesk Realty.\n\n` +
      `Here is a selected property tailored for your requirement:\n` +
      `🏡 *${property.name}* (${property.configuration || property.bhk})\n` +
      `📍 ${property.locality}, ${property.city || 'India'}\n` +
      `💰 Price: ${formatINR(property.priceLakhs)} | ${property.areaSqFt ? property.areaSqFt + ' sq.ft' : ''}\n` +
      `🗺️ Location: ${mapUrl}\n\n` +
      `Let us know if you would like to schedule a site visit!`;

    logActivity(
      lead.id,
      currentUser?.id,
      'WHATSAPP_SENT',
      `Sent property brochure for "${property.name}" to ${lead.name} via WhatsApp`
    );

    setSentLeadId(lead.id);
    setTimeout(() => setSentLeadId(null), 2500);

    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop" />
        <Dialog.Content className="modal-content" style={{ maxWidth: 540, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
          <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>
            <div>
              <Dialog.Title className="text-h2" style={{ margin: 0 }}>
                Send to Pipeline Lead
              </Dialog.Title>
              <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--color-muted-fg)' }}>
                Select a lead to send <strong>{property.name}</strong> directly via WhatsApp
              </p>
            </div>
            <Dialog.Close asChild>
              <button className="btn btn-ghost btn-icon" aria-label="Close"><X size={18} /></button>
            </Dialog.Close>
          </div>

          {/* Search bar inside modal */}
          <div style={{ position: 'relative', marginTop: 14, marginBottom: 12 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted-fg)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 34, height: 36, fontSize: 13 }}
              placeholder="Search lead by name, phone, or locality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* List of ranked leads */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }} className="custom-scrollbar">
            {rankedLeads.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-muted-fg)', fontSize: 13 }}>
                No matching leads found.
              </div>
            ) : (
              rankedLeads.map(({ lead, score }) => (
                <div
                  key={lead.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-card)',
                    gap: 10
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={14} className="text-primary" />
                      <span style={{ fontWeight: 600, fontSize: 13 }} className="truncate">{lead.name}</span>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 10,
                        background: score >= 75 ? 'rgba(16,185,129,0.15)' : 'rgba(37,99,235,0.15)',
                        color: score >= 75 ? 'var(--color-success)' : 'var(--color-primary)'
                      }}>
                        {score}% Match
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', marginTop: 2 }}>
                      {lead.phone} • {lead.requirements?.bhk || 'Any BHK'} • {lead.requirements?.preferredLocalities?.join(', ') || 'Any Area'}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleSendPitch(lead)}
                    style={{
                      height: 32,
                      fontSize: 12,
                      gap: 4,
                      padding: '0 10px',
                      color: sentLeadId === lead.id ? 'var(--color-success)' : '#15803d',
                      borderColor: '#bbf7d0',
                      background: '#f0fdf4'
                    }}
                  >
                    {sentLeadId === lead.id ? <Check size={14} /> : <Send size={13} />}
                    <span>{sentLeadId === lead.id ? 'Sent!' : 'Send Pitch'}</span>
                  </button>
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Close</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
