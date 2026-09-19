import React from 'react';
import { formatINR, formatDate, formatBudgetRange } from '../utils/formatters';
import { STAGES, PRIORITIES, SOURCES } from '../utils/constants';
import { AgentBadge } from '../components/AgentBadge';
import { useEmployeeStore } from '../store/employeeStore';
import { useLeadStore } from '../store/leadStore';
import { useAuthStore } from '../store/authStore';
import { Edit2, Trash2, FileText } from 'lucide-react';

export function TableView({ leads, onLeadClick, onEditLead, onDeleteLead }) {
  const { getEmployee, employees } = useEmployeeStore();
  const { updateLeadStage, updateLead } = useLeadStore();
  const { currentUser } = useAuthStore();

  const handleStageChange = (e, leadId) => {
    e.stopPropagation();
    const newStage = e.target.value;
    updateLeadStage(leadId, newStage);
  };

  const handleAssignAgent = (e, leadId) => {
    e.stopPropagation();
    const newAgentId = e.target.value || null;
    updateLead(leadId, { assignedTo: newAgentId });
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Lead Details</th>
            <th>Stage & Priority</th>
            <th>Requirements & Notes</th>
            <th>Assigned To</th>
            <th>Added On</th>
            <th style={{ textAlign: 'right', paddingRight: 16 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-muted-fg)' }}>No leads found matching criteria.</td>
            </tr>
          ) : (
            leads.map(lead => {
              const stage = STAGES.find(s => s.id === lead.stage);
              const priority = PRIORITIES.find(p => p.id === lead.priority);
              const source = SOURCES.find(s => s.id === lead.source);
              const agent = getEmployee(lead.assignedTo);
              const latestNote = Array.isArray(lead.notes) && lead.notes.length > 0 ? lead.notes[0]?.text : null;
              
              return (
                <tr 
                  key={lead.id} 
                  onClick={() => onLeadClick(lead)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Color bar indicator */}
                  <td className="stage-bar" style={{ backgroundColor: `var(--stage-${lead.stage})` }}></td>
                  
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-fg)' }}>{lead.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>{lead.phone}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-muted-fg)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                       <span style={{ color: source?.color }}>{source?.icon}</span> {source?.label || lead.source}
                    </div>
                  </td>
                  <td>
                    {/* Stage Selection Dropdown */}
                    <div style={{ marginBottom: 6 }} onClick={(e) => e.stopPropagation()}>
                      <select
                        value={lead.stage}
                        onChange={(e) => handleStageChange(e, lead.id)}
                        style={{
                          background: `var(--stage-${lead.stage})`,
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 6,
                          padding: '4px 8px',
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          outline: 'none',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                          width: '100%',
                          maxWidth: 160
                        }}
                        title="Click to transition pipeline stage (e.g. New Lead, Site Visit Scheduled)"
                      >
                        {STAGES.map(s => (
                          <option key={s.id} value={s.id} style={{ background: 'var(--color-card)', color: 'var(--color-fg)' }}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="badge" style={{ backgroundColor: priority?.bgColor, color: priority?.fgColor, border: 'none' }}>
                        {priority?.emoji} {priority?.label}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--color-fg)' }}>{lead.requirements?.bhk || 'Any BHK'}</div>
                    <div style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', marginTop: 4, fontWeight: 600 }}>
                      {lead.requirements?.budgetMinLakhs ? formatBudgetRange(lead.requirements.budgetMinLakhs, lead.requirements.budgetMaxLakhs) : 'Budget TBD'}
                    </div>
                    {lead.requirements?.preferredLocalities && lead.requirements.preferredLocalities.length > 0 && (
                      <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                        📍 {lead.requirements.preferredLocalities.join(', ')}
                      </div>
                    )}
                    {latestNote && (
                      <div style={{ fontSize: 11, color: 'var(--color-muted-fg)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={latestNote}>
                        <FileText size={10} style={{ flexShrink: 0, color: 'var(--color-primary)' }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{latestNote}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    {/* Admin / Team lead assignment dropdown */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <select
                        value={lead.assignedTo || ''}
                        onChange={(e) => handleAssignAgent(e, lead.id)}
                        className="form-input"
                        style={{
                          height: 30,
                          fontSize: 12,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: lead.assignedTo ? 'var(--color-muted)' : 'rgba(239, 68, 68, 0.08)',
                          borderColor: lead.assignedTo ? 'var(--color-border)' : '#fca5a5',
                          color: lead.assignedTo ? 'var(--color-fg)' : '#dc2626',
                          fontWeight: 600,
                          cursor: 'pointer',
                          width: '100%',
                          minWidth: 130
                        }}
                        title="Assign lead to an advisor or agent"
                      >
                        <option value="">⚠️ Unassigned</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} {emp.role === 'admin' ? '(Admin)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--color-muted-fg)', whiteSpace: 'nowrap' }}>
                    {formatDate(lead.createdAt)}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '4px 8px', height: 28, fontSize: 12, gap: 4 }}
                        onClick={() => onEditLead && onEditLead(lead)}
                        title="Edit lead details"
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '4px 8px', height: 28, fontSize: 12, color: 'var(--color-danger, #ef4444)', gap: 4 }}
                        onClick={() => onDeleteLead && onDeleteLead(lead)}
                        title="Delete lead permanently"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
