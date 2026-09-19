import React from 'react';
import { Settings as SettingsIcon, Building, Phone, MessageSquare } from 'lucide-react';

export function Settings() {
  return (
    <div className="page h-full" style={{ overflowY: 'auto' }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure CRM defaults and templates</p>
        </div>
      </div>

      <div style={{ maxWidth: 600, padding: '0 4px' }}>
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building size={18} /> Company Profile
          </h3>
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label className="form-label">Agency Name</label>
              <input type="text" className="form-input" defaultValue="PropDesk Realty" />
            </div>
            <div>
              <label className="form-label">Helpline Number (Virtual Number)</label>
              <input type="text" className="form-input" defaultValue="+91 80 6900 1234" disabled />
              <p style={{ fontSize: 12, color: 'var(--color-muted-fg)', marginTop: 4 }}>Used for inbound routing and outbound masking.</p>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageSquare size={18} /> WhatsApp Templates
          </h3>
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label className="form-label">Introduction Template</label>
              <textarea className="form-input" rows={3} defaultValue="Hi [Name], this is [Agent] from [Agency]. I saw your enquiry for [BHK] in [Locality]. When can we discuss your requirements?" />
            </div>
            <div>
              <label className="form-label">Site Visit Confirmation</label>
              <textarea className="form-input" rows={3} defaultValue="Hi [Name], your site visit is confirmed for [Date] at [Time]. Location: [Google Maps Link]. I'll meet you there. – [Agent]" />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => alert('Changes discarded')}>Cancel</button>
          <button className="btn btn-primary" onClick={() => alert('Settings saved (Simulated)')}>Save Settings</button>
        </div>
      </div>
    </div>
  );
}
