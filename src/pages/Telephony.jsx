import React from 'react';
import { EmptyState } from '../components/EmptyState';
import { PhoneCall } from 'lucide-react';
import { useCallStore } from '../store/callStore';
import { useLeadStore } from '../store/leadStore';
import { useEmployeeStore } from '../store/employeeStore';
import { formatRelativeDate } from '../utils/formatters';
import { AgentBadge } from '../components/AgentBadge';

export function Telephony() {
  const { calls } = useCallStore();
  const { leads } = useLeadStore();
  const { getEmployee } = useEmployeeStore();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Telephony</h1>
          <p className="page-subtitle">Call logs and dialer history</p>
        </div>
      </div>
      
      {calls.length === 0 ? (
        <EmptyState 
          icon={PhoneCall}
          title="No Calls Yet"
          description="Make your first call from a lead's profile to see the history here."
        />
      ) : (
        <>
          <div className="table-container telephony-desktop-table" style={{ flex: 1, overflowY: 'auto' }}>
            <table className="data-table">
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  <th>Lead</th>
                  <th>Agent</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {calls.map(call => {
                  const lead = leads.find(l => l.id === call.leadId);
                  const agent = getEmployee(call.agentId);
                  return (
                    <tr key={call.id}>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--color-fg)' }}>{lead?.name || 'Unknown Lead'}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>{lead?.phone || '-'}</div>
                      </td>
                      <td>
                        <AgentBadge employee={agent} size="sm" showName={true} />
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}
                      </td>
                      <td>
                        <span className="badge" style={{ backgroundColor: call.status === 'connected' ? 'var(--color-success)' : 'var(--color-muted)', color: call.status === 'connected' ? 'white' : 'var(--color-fg)', border: 'none' }}>
                          {call.status}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--color-muted-fg)' }}>
                        {formatRelativeDate(call.timestamp)}
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--color-muted-fg)', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {call.notes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="telephony-mobile-cards" style={{ display: 'none', flexDirection: 'column', gap: 12, paddingBottom: 24 }}>
            {calls.map(call => {
              const lead = leads.find(l => l.id === call.leadId);
              const agent = getEmployee(call.agentId);
              const durationStr = `${Math.floor(call.duration / 60)}:${(call.duration % 60).toString().padStart(2, '0')}`;
              const isConnected = call.status === 'connected';

              return (
                <div key={call.id} className="card call-mobile-card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="badge" style={{ 
                        backgroundColor: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: isConnected ? 'var(--color-success)' : 'var(--color-danger, #ef4444)',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: 11,
                        textTransform: 'uppercase'
                      }}>
                        {call.status}
                      </span>
                      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted-fg)' }}>
                        ⏱️ {durationStr}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--color-muted-fg)' }}>
                      {formatRelativeDate(call.timestamp)}
                    </span>
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{lead?.name || 'Unknown Lead'}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                      📞 {lead?.phone || 'No phone'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 8 }}>
                    <AgentBadge employee={agent} size="sm" showName={true} />
                    {call.notes && (
                      <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', maxWidth: '60%', textAlign: 'right' }} className="truncate">
                        "{call.notes}"
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
