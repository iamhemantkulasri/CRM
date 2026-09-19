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
        <div className="table-container" style={{ flex: 1, overflowY: 'auto' }}>
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
      )}
    </div>
  );
}
