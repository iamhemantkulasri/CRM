import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Calendar as CalendarIcon, Clock, Building2, User } from 'lucide-react';
import { usePropertyStore } from '../store/propertyStore';
import { useVisitStore } from '../store/visitStore';
import { useLeadStore } from '../store/leadStore';
import { useAuthStore } from '../store/authStore';
import { useActivityStore } from '../store/activityStore';

export function SiteVisitModal({ isOpen, onClose, lead = null }) {
  const { properties } = usePropertyStore();
  const { scheduleVisit } = useVisitStore();
  const { leads, updateLeadStage } = useLeadStore();
  const { currentUser } = useAuthStore();
  const { logActivity } = useActivityStore();
  
  const [selectedLeadId, setSelectedLeadId] = useState(lead?.id || '');
  const [propertyId, setPropertyId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('11:00');

  useEffect(() => {
    if (lead?.id) {
      setSelectedLeadId(lead.id);
      if (lead.propertyId) {
        setPropertyId(lead.propertyId);
      }
    } else {
      setSelectedLeadId('');
      setPropertyId('');
    }
    // Default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split('T')[0]);
  }, [lead, isOpen]);

  const targetLead = lead || leads.find(l => l.id === selectedLeadId);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalLeadId = lead?.id || selectedLeadId;
    if (!finalLeadId || !propertyId || !date || !time) return;
    
    const scheduledDate = new Date(`${date}T${time}`).toISOString();
    scheduleVisit(finalLeadId, propertyId, currentUser?.id || 'emp_admin', scheduledDate);
    
    // Auto-advance lead stage to visit_scheduled
    updateLeadStage(finalLeadId, 'visit_scheduled');
    
    const propObj = properties.find(p => p.id === propertyId);
    logActivity(
      finalLeadId,
      currentUser?.id || 'emp_admin',
      'SITE_VISIT_SCHEDULED',
      `Site visit scheduled for ${propObj?.name || 'Property'} on ${new Date(scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at ${time}`
    );

    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop" />
        <Dialog.Content className="modal-content" style={{ maxWidth: 440 }}>
          <div className="modal-header">
            <Dialog.Title className="text-h2" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CalendarIcon size={18} style={{ color: 'var(--color-warning)' }} />
              Schedule Site Visit
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="btn btn-ghost btn-icon" aria-label="Close"><X size={18} /></button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {lead ? (
              <div style={{ padding: '10px 14px', background: 'var(--color-muted)', borderRadius: 'var(--border-radius-md)' }}>
                <div style={{ fontSize: 11, color: 'var(--color-muted-fg)', textTransform: 'uppercase', fontWeight: 700 }}>Client</div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-fg)' }}>{lead.name} ({lead.phone})</div>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Client / Lead *</label>
                <select required className="form-select" value={selectedLeadId} onChange={e => setSelectedLeadId(e.target.value)}>
                  <option value="">Select a client...</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.phone}) - {l.stage}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Property to Tour *</label>
              <select required className="form-select" value={propertyId} onChange={e => setPropertyId(e.target.value)}>
                <option value="">Select a property...</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {p.locality} (₹{p.priceLakhs}L)</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label"><CalendarIcon size={14} style={{ display: 'inline', marginRight: 4 }}/> Date *</label>
                <input required type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label"><Clock size={14} style={{ display: 'inline', marginRight: 4 }}/> Time *</label>
                <input required type="time" className="form-input" value={time} onChange={e => setTime(e.target.value)} />
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 12 }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--color-warning)', color: '#000', fontWeight: 700 }}>
                Confirm Site Visit
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
