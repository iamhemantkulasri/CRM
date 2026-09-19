import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Phone, MapPin, Building, GripVertical, AlertCircle, Clock, Edit2, Trash2, FileText } from 'lucide-react';
import { formatINR, formatBudgetRange, formatPhone } from '../utils/formatters';
import { AgentBadge } from './AgentBadge';
import { PriorityBadge } from './PriorityBadge';
import { SourceBadge } from './SourceBadge';
import { useEmployeeStore } from '../store/employeeStore';
import { useReminderStore } from '../store/reminderStore';

export function LeadCard({ lead, onClick, onEdit, onDelete }) {
  const { getEmployee } = useEmployeeStore();
  const assignedAgent = getEmployee(lead.assignedTo);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id, data: lead });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 100 : 'auto',
  };

  const latestNote = Array.isArray(lead.notes) && lead.notes.length > 0 ? lead.notes[0]?.text : null;

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`lead-card ${isDragging ? 'is-dragging' : ''}`}
      onClick={() => onClick && onClick(lead)}
    >
      {/* Drag Handle & Header */}
      <div className="lead-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="lead-card-actions" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div {...attributes} {...listeners} className="drag-handle" onClick={(e) => e.stopPropagation()}>
            <GripVertical size={16} />
          </div>
          <PriorityBadge priorityId={lead.priority} className="text-[10px] py-0.5 px-1.5" />
          <SourceBadge sourceId={lead.source} className="text-[10px] py-0.5 px-1.5" />
        </div>

        {/* Quick Edit & Delete Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} onClick={(e) => e.stopPropagation()}>
          {onEdit && (
            <button
              type="button"
              className="btn-icon"
              style={{ padding: 4, color: 'var(--color-muted-fg)', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 4 }}
              title="Edit lead details"
              onClick={() => onEdit(lead)}
            >
              <Edit2 size={13} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="btn-icon"
              style={{ padding: 4, color: 'var(--color-danger, #ef4444)', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 4 }}
              title="Delete lead permanently"
              onClick={() => onDelete(lead)}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Main Info */}
      <div className="lead-card-body">
        <h4 className="lead-name">{lead.name}</h4>
        <div className="lead-phone">
          <Phone size={12} />
          <span>{formatPhone(lead.phone)}</span>
        </div>
      </div>

      {/* Requirements Summary */}
      <div className="lead-requirements">
        <div className="lead-req-item">
          <Building size={12} className="text-muted-fg" />
          {lead.requirements?.bhk || 'Any'}
        </div>
        <div className="lead-req-budget">
          {lead.requirements?.budgetMinLakhs ? formatBudgetRange(lead.requirements.budgetMinLakhs, lead.requirements.budgetMaxLakhs) : 'Budget TBD'}
        </div>
      </div>

      {/* Localities (Optional) */}
      {lead.requirements?.preferredLocalities && lead.requirements.preferredLocalities.length > 0 && (
        <div className="lead-localities">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate">{lead.requirements.preferredLocalities.join(', ')}</span>
        </div>
      )}

      {/* Quick Note preview if present */}
      {latestNote && (
        <div style={{
          marginTop: 6,
          padding: '4px 8px',
          borderRadius: 6,
          background: 'rgba(0,0,0,0.03)',
          border: '1px solid var(--color-border)',
          fontSize: 11,
          color: 'var(--color-fg)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 5,
          lineHeight: 1.3
        }}>
          <FileText size={11} style={{ flexShrink: 0, marginTop: 2, color: 'var(--color-primary)' }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{latestNote}</span>
        </div>
      )}

      {/* Footer */}
      <div className="lead-card-footer" style={{ marginTop: 8 }}>
        <AgentBadge employee={assignedAgent} size="sm" />
        
        {/* Next Follow-up — smart overdue/due-today badge */}
        {(() => {
          const { isOverdue: checkOverdue, isDueToday: checkDueToday } = useReminderStore.getState();
          if (checkOverdue(lead)) {
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '2px 6px', borderRadius: 6 }}>
                <AlertCircle size={10} />
                Overdue
              </div>
            );
          }
          if (checkDueToday(lead)) {
            return <div className="due-badge">Due Today</div>;
          }
          if (lead.nextFollowUp) {
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--color-muted-fg)' }}>
                <Clock size={10} />
                {new Date(lead.nextFollowUp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </div>
            );
          }
          return <div className="no-due">No Follow-up</div>;
        })()}
      </div>
    </div>
  );
}
