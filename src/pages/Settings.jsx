import React, { useState } from 'react';
import { Settings as SettingsIcon, Building, Phone, MessageSquare, Check, RotateCcw } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';

export function Settings() {
  const settings = useSettingsStore();
  const [formState, setFormState] = useState({
    agencyName: settings.agencyName,
    helplineNumber: settings.helplineNumber,
    introTemplate: settings.introTemplate,
    visitTemplate: settings.visitTemplate
  });
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    settings.updateSettings(formState);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  const handleReset = () => {
    settings.resetDefaults();
    setFormState({
      agencyName: 'TGV Estates',
      helplineNumber: '+91 85868 28107',
      introTemplate: 'Hi [Name], this is [Agent] from [Agency]. I saw your enquiry for [BHK] in [Locality]. When can we discuss your requirements?',
      visitTemplate: "Hi [Name], your site visit is confirmed for [Date] at [Time]. Location: [Google Maps Link]. I'll meet you there. – [Agent]",
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  return (
    <div className="page h-full" style={{ overflowY: 'auto' }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure CRM defaults and communication templates</p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ maxWidth: 640, padding: '0 4px' }}>
        {savedMessage && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '10px 14px', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 13 }}>
            <Check size={16} /> Settings saved successfully!
          </div>
        )}

        <div className="card" style={{ marginBottom: 20 }}>
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building size={18} /> Company Profile
          </h3>
          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <label className="form-label">Agency Name</label>
              <input
                type="text"
                className="form-input"
                value={formState.agencyName}
                onChange={e => setFormState({ ...formState, agencyName: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Helpline Number (Virtual Masquerade Hotline)</label>
              <input
                type="text"
                className="form-input"
                value={formState.helplineNumber}
                onChange={e => setFormState({ ...formState, helplineNumber: e.target.value })}
              />
              <p style={{ fontSize: 12, color: 'var(--color-muted-fg)', marginTop: 4 }}>Displayed on client brochures, website redirects, and WhatsApp headers.</p>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageSquare size={18} /> WhatsApp Templates
          </h3>
          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <label className="form-label">Introduction Template</label>
              <textarea
                className="form-input"
                rows={3}
                value={formState.introTemplate}
                onChange={e => setFormState({ ...formState, introTemplate: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Site Visit Confirmation</label>
              <textarea
                className="form-input"
                rows={3}
                value={formState.visitTemplate}
                onChange={e => setFormState({ ...formState, visitTemplate: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" className="btn btn-ghost" onClick={handleReset} style={{ gap: 6 }}>
            <RotateCcw size={14} /> Reset Defaults
          </button>
          <button type="submit" className="btn btn-primary">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
