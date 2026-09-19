import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Phone, PhoneOff } from 'lucide-react';
import { useCallStore } from '../store/callStore';
import { useAuthStore } from '../store/authStore';

export function CallModal({ lead, isOpen, onClose }) {
  const { currentUser } = useAuthStore();
  const { logCall } = useCallStore();
  
  const [status, setStatus] = useState('dialing'); // dialing, connected, disposition
  const [duration, setDuration] = useState(0);
  const [disposition, setDisposition] = useState('connected');
  const [notes, setNotes] = useState('');

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setStatus('dialing');
      setDuration(0);
      setNotes('');
      // Simulate connection after 2 seconds
      const timer = setTimeout(() => setStatus('connected'), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Timer
  useEffect(() => {
    let interval;
    if (status === 'connected') {
      interval = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleEndCall = () => {
    if (status === 'dialing') {
      // Hung up before answer
      logCall(lead.id, currentUser.id, 0, 'no-answer', 'Hung up before connected');
      onClose();
    } else {
      setStatus('disposition');
    }
  };

  const handleSaveDisposition = () => {
    logCall(lead.id, currentUser.id, duration, disposition, notes);
    onClose();
  };

  const formatTime = (secs) => `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;

  if (!lead) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleEndCall}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop" />
        <Dialog.Content className="modal-content" style={{ maxWidth: 400, textAlign: 'center' }}>
          
          {status !== 'disposition' ? (
            <div style={{ padding: '24px 0' }}>
              <div style={{ 
                width: 80, height: 80, borderRadius: '50%', background: 'var(--color-primary)', 
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px', fontSize: 32, fontWeight: 'bold'
              }}>
                {lead.name.charAt(0)}
              </div>
              <h2 className="text-h2" style={{ marginBottom: 8 }}>{lead.name}</h2>
              <p style={{ color: 'var(--color-muted-fg)', fontFamily: 'var(--font-mono)' }}>{lead.phone}</p>
              
              <div style={{ marginTop: 24, fontSize: 18, fontWeight: 500, color: status === 'connected' ? 'var(--color-success)' : 'var(--color-muted-fg)' }}>
                {status === 'dialing' ? 'Dialing...' : formatTime(duration)}
              </div>

              <div style={{ marginTop: 32 }}>
                <button 
                  onClick={handleEndCall}
                  style={{ 
                    background: 'var(--color-destructive)', color: 'white', border: 'none', 
                    borderRadius: '50%', width: 64, height: 64, display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', margin: '0 auto', cursor: 'pointer' 
                  }}
                >
                  <PhoneOff size={24} />
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-h2" style={{ marginBottom: 24, textAlign: 'left' }}>Call Outcome</h2>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">Status</label>
                <select className="form-select" value={disposition} onChange={e => setDisposition(e.target.value)}>
                  <option value="connected">Connected</option>
                  <option value="no-answer">No Answer</option>
                  <option value="busy">Busy</option>
                  <option value="wrong-number">Wrong Number</option>
                </select>
              </div>
              <div className="form-group" style={{ textAlign: 'left', marginTop: 16 }}>
                <label className="form-label">Call Notes</label>
                <textarea 
                  className="form-input" 
                  rows={3} 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)}
                  placeholder="What was discussed?"
                />
              </div>
              <div className="modal-footer" style={{ marginTop: 24 }}>
                <button className="btn btn-primary" onClick={handleSaveDisposition}>Save & Close</button>
              </div>
            </div>
          )}

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
