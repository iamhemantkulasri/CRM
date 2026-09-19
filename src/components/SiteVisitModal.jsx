import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { usePropertyStore } from '../store/propertyStore';
import { useVisitStore } from '../store/visitStore';
import { useAuthStore } from '../store/authStore';

export function SiteVisitModal({ isOpen, onClose, lead }) {
  const { properties } = usePropertyStore();
  const { scheduleVisit } = useVisitStore();
  const { currentUser } = useAuthStore();
  
  const [propertyId, setPropertyId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!propertyId || !date || !time) return;
    
    const scheduledDate = new Date(`${date}T${time}`).toISOString();
    scheduleVisit(lead.id, propertyId, currentUser.id, scheduledDate);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop" />
        <Dialog.Content className="modal-content" style={{ maxWidth: 400 }}>
          <div className="modal-header">
            <Dialog.Title className="text-h2">Schedule Site Visit</Dialog.Title>
            <Dialog.Close asChild>
              <button className="btn btn-ghost btn-icon" aria-label="Close"><X size={20} /></button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="modal-body">
            <div style={{ marginBottom: 16, padding: 12, background: 'var(--color-muted)', borderRadius: 'var(--border-radius-md)' }}>
              <div style={{ fontSize: 12, color: 'var(--color-muted-fg)' }}>Lead</div>
              <div style={{ fontWeight: 600 }}>{lead?.name}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Property to Visit</label>
              <select required className="form-select" value={propertyId} onChange={e => setPropertyId(e.target.value)}>
                <option value="" disabled>Select a property...</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - {p.locality}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label"><CalendarIcon size={14} style={{ display: 'inline', marginRight: 4 }}/> Date</label>
                <input required type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label"><Clock size={14} style={{ display: 'inline', marginRight: 4 }}/> Time</label>
                <input required type="time" className="form-input" value={time} onChange={e => setTime(e.target.value)} />
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 24 }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--color-warning)', color: '#000' }}>Schedule Visit</button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
