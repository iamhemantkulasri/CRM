import React, { useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { PhoneCall, Phone, Plus, X, Search } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useCallStore } from '../store/callStore';
import { useLeadStore } from '../store/leadStore';
import { useEmployeeStore } from '../store/employeeStore';
import { formatRelativeDate } from '../utils/formatters';
import { AgentBadge } from '../components/AgentBadge';
import { CallModal } from '../components/CallModal';

export function Telephony() {
  const { calls } = useCallStore();
  const { leads } = useLeadStore();
  const { getEmployee } = useEmployeeStore();

  const [activeCallLead, setActiveCallLead] = useState(null);
  const [isDialerModalOpen, setIsDialerModalOpen] = useState(false);
  const [dialerSearch, setDialerSearch] = useState('');

  const filteredDialerLeads = dialerSearch.trim()
    ? leads.filter(l => l.name.toLowerCase().includes(dialerSearch.toLowerCase()) || l.phone.includes(dialerSearch))
    : leads.slice(0, 15);

  const handleStartCall = (lead) => {
    setIsDialerModalOpen(false);
    setActiveCallLead(lead);
  };

  return (
    <div className="page h-full" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="page-title">Telephony</h1>
          <p className="page-subtitle">Call logs, simulated dialer, and client call outcomes</p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setIsDialerModalOpen(true)}
          style={{ gap: 6 }}
        >
          <Phone size={15} /> Quick Dial / Log Call
        </button>
      </div>
      
      {calls.length === 0 ? (
        <EmptyState 
          icon={PhoneCall}
          title="No Calls Yet"
          description="Click '+ Quick Dial / Log Call' above or call a lead from their profile to start recording call logs."
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
                  <th style={{ textAlign: 'right' }}>Action</th>
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
                      <td style={{ textAlign: 'right' }}>
                        {lead && (
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ gap: 4, padding: '4px 8px', fontSize: 12 }}
                            onClick={() => setActiveCallLead(lead)}
                            title={`Call ${lead.name}`}
                          >
                            <Phone size={12} /> Call Again
                          </button>
                        )}
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

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{lead?.name || 'Unknown Lead'}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                        📞 {lead?.phone || 'No phone'}
                      </div>
                    </div>
                    {lead && (
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ gap: 4, padding: '4px 8px', fontSize: 12 }}
                        onClick={() => setActiveCallLead(lead)}
                      >
                        <Phone size={12} /> Call
                      </button>
                    )}
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

      {/* Select Client to Call Modal */}
      <Dialog.Root open={isDialerModalOpen} onOpenChange={setIsDialerModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="modal-backdrop" />
          <Dialog.Content className="modal-content" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <Dialog.Title className="text-h2" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Phone size={18} style={{ color: 'var(--color-primary)' }} />
                Quick Dial / Log Call
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="btn btn-ghost btn-icon"><X size={18} /></button>
              </Dialog.Close>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="search-input-wrapper">
                <Search size={15} className="search-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search client by name or phone..."
                  value={dialerSearch}
                  onChange={e => setDialerSearch(e.target.value)}
                  style={{ width: '100%' }}
                  autoFocus
                />
              </div>

              <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }} className="custom-scrollbar">
                {filteredDialerLeads.map(l => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => handleStartCall(l)}
                    className="card card-hoverable"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      textAlign: 'left',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-card)',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{l.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--color-muted-fg)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{l.phone}</div>
                    </div>
                    <span className="btn btn-primary btn-sm" style={{ gap: 4, height: 28, fontSize: 11.5 }}>
                      <Phone size={11} /> Dial
                    </span>
                  </button>
                ))}
                {filteredDialerLeads.length === 0 && (
                  <div style={{ padding: 16, textAlign: 'center', color: 'var(--color-muted-fg)', fontSize: 13 }}>
                    No leads found matching "{dialerSearch}"
                  </div>
                )}
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Active Call Simulator Modal */}
      {activeCallLead && (
        <CallModal
          isOpen={Boolean(activeCallLead)}
          onClose={() => setActiveCallLead(null)}
          lead={activeCallLead}
        />
      )}
    </div>
  );
}
