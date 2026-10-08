import React, { useEffect, useState } from 'react';
import { usePartnerStore } from '../store/partnerStore';
import { toApprovalUpdate } from '../store/partnerAdmin.js';
import { supabase } from '../api/supabase';

export function Partners() {
  const { partners, queue, fetchPartners, fetchQueue, setSuspended } = usePartnerStore();
  const [tab, setTab] = useState('queue');
  const [commissions, setCommissions] = useState({});
  const [websiteFlags, setWebsiteFlags] = useState({});
  const [reasons, setReasons] = useState({});
  const [rejectError, setRejectError] = useState('');

  useEffect(() => {
    fetchPartners();
    fetchQueue();
  }, [fetchPartners, fetchQueue]);

  const handleApprove = async (row) => {
    const update = toApprovalUpdate({
      commission_pct: commissions[row.id] ?? null,
      show_on_website: websiteFlags[row.id] ?? false,
    });
    await supabase.from('properties').update(update).eq('id', row.id);
    await fetchQueue();
  };

  const handleReject = async (row) => {
    if (!String(reasons[row.id] ?? '').trim()) {
      setRejectError('Rejection reason required');
      return;
    }
    setRejectError('');
    const update = toApprovalUpdate({ decision: 'rejected', reason: reasons[row.id] ?? '' });
    await supabase.from('properties').update(update).eq('id', row.id);
    await fetchQueue();
  };

  const handleSuspend = async (partner) => {
    const suspended = partner.status !== 'suspended';
    await setSuspended(partner.id, suspended);
    await fetchPartners();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Partner Inbox</h1>
          <p className="page-subtitle">Review pending partner listings, approve or reject, and manage partners.</p>
        </div>
        <div className="page-actions">
          <button className={`btn btn-sm ${tab === 'queue' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('queue')}>
            Pending Queue ({(queue || []).length})
          </button>
          <button className={`btn btn-sm ${tab === 'partners' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('partners')}>
            Partners ({(partners || []).length})
          </button>
        </div>
      </div>

      {tab === 'queue' ? (
        <div className="table-container">
          {rejectError && (
            <div style={{ padding: '8px 16px', color: '#ef4444', fontSize: 13 }}>{rejectError}</div>
          )}
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Partner ID</th>
                <th>Price (₹L)</th>
                <th>City / Sector</th>
                <th>Commission %</th>
                <th>Website</th>
                <th>Reject reason</th>
                <th style={{ textAlign: 'right', paddingRight: 16 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(queue || []).map((row) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 600 }}>{row.title}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{row.owner_partner_id}</td>
                  <td>{row.price_lakhs}</td>
                  <td>{[row.location_city ?? row.city, row.location_sector ?? row.locality ?? row.sector].filter(Boolean).join(' / ')}</td>
                  <td>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: 80, height: 30 }}
                      value={commissions[row.id] ?? ''}
                      onChange={(e) => setCommissions((c) => ({ ...c, [row.id]: e.target.value }))}
                      placeholder="%"
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={websiteFlags[row.id] ?? false}
                      onChange={(e) => setWebsiteFlags((f) => ({ ...f, [row.id]: e.target.checked }))}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: 160, height: 30 }}
                      value={reasons[row.id] ?? ''}
                      onChange={(e) => setReasons((r) => ({ ...r, [row.id]: e.target.value }))}
                      placeholder="Rejection reason"
                    />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button className="btn btn-sm btn-primary" onClick={() => handleApprove(row)}>Approve</button>
                      <button className="btn btn-sm btn-ghost" style={{ color: '#ef4444' }} onClick={() => handleReject(row)}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(queue || []).length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-muted-fg)', fontSize: 13 }}>
              No pending partner listings.
            </div>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Firm</th>
                <th>Type</th>
                <th>Phone</th>
                <th>Status</th>
                <th style={{ textAlign: 'right', paddingRight: 16 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(partners || []).map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.firm_name}</td>
                  <td>{p.type}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.phone}</td>
                  <td><span className="badge">{p.status}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-sm btn-ghost" onClick={() => handleSuspend(p)}>
                      {p.status === 'suspended' ? 'Activate' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(partners || []).length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-muted-fg)', fontSize: 13 }}>
              No partners yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
