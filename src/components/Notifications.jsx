import React, { useRef, useEffect } from 'react';
import { Bell, Clock, Phone, X, Calendar } from 'lucide-react';
import { useLeadStore } from '../store/leadStore';
import { useReminderStore } from '../store/reminderStore';
import { addDaysISO } from '../utils/followUp';

/**
 * Notifications Component (Phase 6 deliverable: src/components/Notifications.jsx)
 * Handles overdue follow-up alerts, reminders, and quick call/postpone actions.
 */
export function Notifications({ isOpen, onClose }) {
  const { leads, updateLead } = useLeadStore();
  const { getOverdueLeads } = useReminderStore();
  const popoverRef = useRef(null);

  const overdueLeads = getOverdueLeads(leads);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  const handlePostpone = (lead, days = 1) => {
    const d = new Date(addDaysISO(days));
    d.setHours(10, 0, 0, 0);
    updateLead(lead.id, { nextFollowUp: d.toISOString() });
  };

  const handleCall = (lead) => {
    window.open(`tel:${lead.phone}`, '_self');
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      style={{
        position: 'absolute',
        top: '110%',
        right: 0,
        width: 320,
        background: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        zIndex: 200,
        overflow: 'hidden',
      }}
    >
      {/* Popover Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-muted)' }}>
        <span style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Bell size={14} style={{ color: 'var(--color-danger, #ef4444)' }} />
          Overdue Follow-ups
          {overdueLeads.length > 0 && (
            <span style={{ background: 'var(--color-danger, #ef4444)', color: '#fff', fontSize: 10, padding: '1px 6px', borderRadius: 10, fontWeight: 800 }}>
              {overdueLeads.length}
            </span>
          )}
        </span>
        <button className="btn btn-ghost btn-icon" style={{ width: 24, height: 24, padding: 0 }} onClick={onClose}>
          <X size={14} />
        </button>
      </div>

      {/* Overdue Lead Items */}
      <div style={{ maxHeight: 340, overflowY: 'auto' }} className="custom-scrollbar">
        {overdueLeads.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--color-muted-fg)' }}>
            ✅ All follow-ups are on track!
          </div>
        ) : (
          overdueLeads.map(lead => (
            <div key={lead.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }} className="truncate">{lead.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-danger, #ef4444)', marginTop: 2 }}>
                  <Clock size={10} />
                  <span>
                    {lead.nextFollowUp
                      ? `Due: ${new Date(lead.nextFollowUp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                      : 'No follow-up set (48h+)'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <button
                  className="btn btn-sm btn-ghost"
                  title="Call Lead"
                  onClick={() => handleCall(lead)}
                  style={{ color: 'var(--color-success, #10b981)', padding: '4px 6px' }}
                >
                  <Phone size={13} />
                </button>
                <button
                  className="btn btn-sm btn-ghost"
                  title="Postpone by 1 day"
                  onClick={() => handlePostpone(lead, 1)}
                  style={{ color: 'var(--color-muted-fg)', padding: '4px 6px', fontSize: 11 }}
                >
                  +1d
                </button>
                <button
                  className="btn btn-sm btn-ghost"
                  title="Postpone by 3 days"
                  onClick={() => handlePostpone(lead, 3)}
                  style={{ color: 'var(--color-muted-fg)', padding: '4px 6px', fontSize: 11 }}
                >
                  +3d
                </button>
                <button
                  className="btn btn-sm btn-ghost"
                  title="Postpone to next week"
                  onClick={() => handlePostpone(lead, 7)}
                  style={{ color: 'var(--color-muted-fg)', padding: '4px 6px', fontSize: 11 }}
                >
                  +7d
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;
