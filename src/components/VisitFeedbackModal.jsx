import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, CheckCircle2, MessageSquare, ThumbsUp, ThumbsDown, Clock, AlertCircle } from 'lucide-react';
import { useVisitStore } from '../store/visitStore';
import { useLeadStore } from '../store/leadStore';
import { useAuthStore } from '../store/authStore';
import { useActivityStore } from '../store/activityStore';

export function VisitFeedbackModal({ isOpen, onClose, visit, lead, property }) {
  const { updateFeedback } = useVisitStore();
  const { updateLeadStage } = useLeadStore();
  const { currentUser } = useAuthStore();
  const { logActivity } = useActivityStore();

  const [status, setStatus] = useState('completed');
  const [feedback, setFeedback] = useState('positive');
  const [notes, setNotes] = useState('');

  if (!visit) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    updateFeedback(visit.id, feedback, notes, currentUser?.id || 'emp_admin');

    if (lead?.id) {
      if (status === 'completed') {
        const nextStage = feedback === 'positive' ? 'negotiation' : 'visit_done';
        updateLeadStage(lead.id, nextStage);
        logActivity(
          lead.id,
          currentUser?.id || 'system',
          'SITE_VISIT_COMPLETED',
          `Site visit completed for ${property?.name || 'property'}. Outcome: ${feedback.toUpperCase()}. Notes: ${notes || 'None'}`
        );
      } else if (status === 'cancelled') {
        logActivity(
          lead.id,
          currentUser?.id || 'system',
          'SITE_VISIT_CANCELLED',
          `Site visit cancelled. Reason: ${notes || 'No notes provided'}`
        );
      }
    }

    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop" />
        <Dialog.Content className="modal-content" style={{ maxWidth: 460 }}>
          <div className="modal-header">
            <Dialog.Title className="text-h2" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} />
              Log Site Visit Outcome
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="btn btn-ghost btn-icon" aria-label="Close"><X size={18} /></button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: '10px 14px', background: 'var(--color-muted)', borderRadius: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{lead?.name || 'Client'}</div>
              <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', marginTop: 2 }}>
                Tour of <strong>{property?.name || 'Property'}</strong>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Visit Status *</label>
              <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="completed">Completed Tour</option>
                <option value="rescheduled">Rescheduled</option>
                <option value="cancelled">Client Cancelled / No-show</option>
              </select>
            </div>

            {status === 'completed' && (
              <div className="form-group">
                <label className="form-label">Client Interest Level *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  <button
                    type="button"
                    className={`btn ${feedback === 'positive' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: 12, padding: '8px 4px', justifyContent: 'center' }}
                    onClick={() => setFeedback('positive')}
                  >
                    🔥 High / Offer
                  </button>
                  <button
                    type="button"
                    className={`btn ${feedback === 'neutral' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: 12, padding: '8px 4px', justifyContent: 'center' }}
                    onClick={() => setFeedback('neutral')}
                  >
                    🟡 Considering
                  </button>
                  <button
                    type="button"
                    className={`btn ${feedback === 'negative' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: 12, padding: '8px 4px', justifyContent: 'center' }}
                    onClick={() => setFeedback('negative')}
                  >
                    ❌ Rejected
                  </button>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Client Feedback & Next Action Notes</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="What did the client say about price, layout, builder, or floor preference?"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            <div className="modal-footer" style={{ marginTop: 10 }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">
                Save Visit Feedback
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
