import React, { useState, useRef, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Users, Building2, Zap } from 'lucide-react';
import { useLeadStore } from '../store/leadStore';
import { useEmployeeStore } from '../store/employeeStore';
import { receiveWebhook, PORTAL_WEBHOOK_SCHEMAS } from '../api/webhooks';
import { Radio } from 'lucide-react';

// ─── CSV Parser ───────────────────────────────────────────────────────────────
function parseCSVLeads(csvText) {
  const lines = csvText.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));

  return lines.slice(1).map((line, idx) => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });

    const budgetStr = row.budget || row.budget_lakhs || '';
    const [minB, maxB] = budgetStr.includes('-')
      ? budgetStr.split('-').map(Number)
      : [Number(budgetStr) * 0.8, Number(budgetStr)];

    return {
      name: row.name || `Lead ${idx + 1}`,
      phone: row.phone || row.mobile || row.contact || '',
      email: row.email || '',
      source: row.source || 'portal_import',
      stage: 'new',
      priority: 'warm',
      assignedTo: null,
      requirements: {
        propertyType: row.property_type || row.type || 'apartment',
        bhk: row.bhk || row.configuration || '',
        budgetMinLakhs: isNaN(minB) ? 0 : Math.round(minB),
        budgetMaxLakhs: isNaN(maxB) ? 0 : Math.round(maxB),
        preferredLocalities: row.locality || row.area || row.location
          ? (row.locality || row.area || row.location).split(/[;|]/).map(s => s.trim()).filter(Boolean)
          : [],
        possessionStatus: row.possession || 'Any',
      },
      notes: [],
      nextFollowUp: null,
    };
  }).filter(lead => lead.name && lead.phone);
}

// ─── Sample Portal Lead Generators ────────────────────────────────────────────
const PORTAL_SAMPLES = {
  '99acres': [
    { name: 'Rajesh Iyer', phone: '+919123456001', source: '99acres', requirements: { propertyType: 'apartment', bhk: '3 BHK', budgetMinLakhs: 85, budgetMaxLakhs: 110, preferredLocalities: ['Whitefield', 'Marathahalli'], possessionStatus: 'Ready to Move' } },
    { name: 'Meena Krishnaswamy', phone: '+919123456002', source: '99acres', requirements: { propertyType: 'apartment', bhk: '2 BHK', budgetMinLakhs: 50, budgetMaxLakhs: 70, preferredLocalities: ['HSR Layout'], possessionStatus: 'Any' } },
    { name: 'Arun Balachandran', phone: '+919123456003', source: '99acres', requirements: { propertyType: 'villa', bhk: '4 BHK', budgetMinLakhs: 200, budgetMaxLakhs: 300, preferredLocalities: ['Sarjapur Road', 'Electronic City'], possessionStatus: 'Under Construction' } },
    { name: 'Kavitha Srinivasan', phone: '+919123456004', source: '99acres', requirements: { propertyType: 'apartment', bhk: '1 BHK', budgetMinLakhs: 30, budgetMaxLakhs: 45, preferredLocalities: ['BTM Layout'], possessionStatus: 'Any' } },
    { name: 'Venkatesh Naidu', phone: '+919123456005', source: '99acres', requirements: { propertyType: 'plot', bhk: '', budgetMinLakhs: 100, budgetMaxLakhs: 180, preferredLocalities: ['Devanahalli', 'Yelahanka'], possessionStatus: '' } },
  ],
  magicbricks: [
    { name: 'Preethi Subramaniam', phone: '+919234567001', source: 'magicbricks', requirements: { propertyType: 'apartment', bhk: '3 BHK', budgetMinLakhs: 75, budgetMaxLakhs: 95, preferredLocalities: ['Koramangala'], possessionStatus: 'Ready to Move' } },
    { name: 'Sunil Mehta', phone: '+919234567002', source: 'magicbricks', requirements: { propertyType: 'apartment', bhk: '2 BHK', budgetMinLakhs: 60, budgetMaxLakhs: 80, preferredLocalities: ['Indiranagar'], possessionStatus: 'Ready to Move' } },
    { name: 'Divya Shankar', phone: '+919234567003', source: 'magicbricks', requirements: { propertyType: 'commercial', bhk: '', budgetMinLakhs: 200, budgetMaxLakhs: 500, preferredLocalities: ['MG Road', 'UB City'], possessionStatus: 'Any' } },
    { name: 'Harish Gowda', phone: '+919234567004', source: 'magicbricks', requirements: { propertyType: 'villa', bhk: '3 BHK', budgetMinLakhs: 130, budgetMaxLakhs: 180, preferredLocalities: ['Bannerghatta Road'], possessionStatus: 'Under Construction' } },
  ],
  'Meta Ads': [
    { name: 'Aishwarya Patil', phone: '+919345678001', source: 'meta_ads', requirements: { propertyType: 'apartment', bhk: '2 BHK', budgetMinLakhs: 45, budgetMaxLakhs: 65, preferredLocalities: ['Bellandur', 'Marathahalli'], possessionStatus: 'Any' } },
    { name: 'Karthik Reddy', phone: '+919345678002', source: 'meta_ads', requirements: { propertyType: 'apartment', bhk: '3 BHK', budgetMinLakhs: 90, budgetMaxLakhs: 120, preferredLocalities: ['Whitefield'], possessionStatus: 'Ready to Move' } },
    { name: 'Pooja Bhat', phone: '+919345678003', source: 'meta_ads', requirements: { propertyType: 'apartment', bhk: '1 BHK', budgetMinLakhs: 25, budgetMaxLakhs: 40, preferredLocalities: ['JP Nagar'], possessionStatus: 'Any' } },
  ],
};

const SAMPLE_CSV = `Name,Phone,Email,Source,Property Type,BHK,Budget,Locality,Possession
Amit Sharma,+919811111001,amit@email.com,website,apartment,3 BHK,80-110,Whitefield,Ready to Move
Sunita Rao,+919811111002,sunita@email.com,referral,villa,4 BHK,200-300,Koramangala,Any
Ramesh Nair,+919811111003,,housing,apartment,2 BHK,50-70,HSR Layout;BTM Layout,Under Construction`;

// ─── Component ────────────────────────────────────────────────────────────────
export function LeadImportModal({ isOpen, onClose }) {
  const { addLead } = useLeadStore();
  const { employees } = useEmployeeStore();
  const [mode, setMode] = useState('portal'); // 'portal' | 'csv'
  const [csvText, setCsvText] = useState('');
  const [parsedLeads, setParsedLeads] = useState([]);
  const [importedCount, setImportedCount] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const [webhookResult, setWebhookResult] = useState(null);

  const reset = () => {
    setCsvText('');
    setParsedLeads([]);
    setImportedCount(null);
    setWebhookResult(null);
    setDragOver(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileRead = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setCsvText(text);
      setParsedLeads(parseCSVLeads(text));
    };
    reader.readAsText(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) handleFileRead(file);
  }, []);

  const handleCSVChange = (text) => {
    setCsvText(text);
    setParsedLeads(parseCSVLeads(text));
  };

  const handleImportPortal = (portalName) => {
    const leads = PORTAL_SAMPLES[portalName] || [];
    leads.forEach(l => addLead({ ...l, notes: [], nextFollowUp: null, stage: 'new', priority: 'warm', assignedTo: null }));
    setImportedCount(leads.length);
  };

  const handleTriggerWebhook = (portalKey) => {
    const schema = PORTAL_WEBHOOK_SCHEMAS[portalKey];
    if (!schema) return;
    const res = receiveWebhook(portalKey, schema.samplePayload, { autoAssign: true });
    setWebhookResult(res);
  };

  const handleImportCSV = () => {
    if (!parsedLeads.length) return;
    parsedLeads.forEach(l => addLead(l));
    setImportedCount(parsedLeads.length);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop" />
        <Dialog.Content
          className="modal-content"
          style={{ maxWidth: 560, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
        >
          {/* Header */}
          <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>
            <div>
              <Dialog.Title className="text-h2" style={{ margin: 0 }}>Import Leads</Dialog.Title>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--color-muted-fg)' }}>
                Bulk import from portals or CSV file
              </p>
            </div>
            <Dialog.Close asChild>
              <button className="btn btn-ghost btn-icon" aria-label="Close"><X size={18} /></button>
            </Dialog.Close>
          </div>

          {/* Success State */}
          {importedCount !== null ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 }}>
              <CheckCircle2 size={48} style={{ color: 'var(--color-success)' }} />
              <div style={{ fontSize: 20, fontWeight: 700 }}>{importedCount} leads imported!</div>
              <p style={{ fontSize: 13, color: 'var(--color-muted-fg)', textAlign: 'center' }}>
                Leads have been added to your pipeline as "New" and are ready for follow-up.
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={reset}>Import More</button>
                <button className="btn btn-primary" onClick={handleClose}>Done</button>
              </div>
            </div>
          ) : (
            <>
              {/* Mode Tabs */}
              <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-border)', marginBottom: 16 }}>
                {[
                  { id: 'portal', label: '⚡ Portal Sim', icon: Zap },
                  { id: 'webhook', label: '📡 Webhook Ingest', icon: Radio },
                  { id: 'csv', label: '📄 CSV Upload', icon: FileText },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setMode(tab.id); reset(); }}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      fontSize: 13,
                      fontWeight: 600,
                      color: mode === tab.id ? 'var(--color-primary)' : 'var(--color-muted-fg)',
                      background: 'none',
                      border: 'none',
                      borderBottom: mode === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
                {mode === 'portal' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <p style={{ fontSize: 13, color: 'var(--color-muted-fg)', marginBottom: 4 }}>
                      Simulate importing fresh leads from real estate portals. Each import adds realistic sample leads to your pipeline.
                    </p>
                    {Object.entries(PORTAL_SAMPLES).map(([portal, leads]) => (
                      <div
                        key={portal}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderRadius: 10,
                          border: '1px solid var(--color-border)',
                          background: 'var(--color-card)',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{portal}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', marginTop: 2 }}>
                            {leads.length} sample leads · Bangalore region
                          </div>
                        </div>
                        <button
                          className="btn btn-primary"
                          style={{ height: 34, fontSize: 12, padding: '0 14px', gap: 6 }}
                          onClick={() => handleImportPortal(portal)}
                        >
                          <Users size={13} /> Import {leads.length} Leads
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {mode === 'webhook' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--color-fg)' }}>
                      <strong>F19 Auto Lead Capture Engine:</strong> Parses raw incoming webhook payloads from property portals, normalizes requirements, and auto-assigns leads via <strong>Round-Robin</strong> across active sales agents.
                    </div>

                    {webhookResult ? (
                      <div style={{ background: 'var(--color-muted)', borderRadius: 10, padding: 16, border: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-success)', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
                          <CheckCircle2 size={16} /> Webhook Ingested & Assigned!
                        </div>
                        <div style={{ fontSize: 13, marginBottom: 4 }}>
                          <strong>Lead:</strong> {webhookResult.lead.name} ({webhookResult.lead.phone})
                        </div>
                        <div style={{ fontSize: 13, marginBottom: 4 }}>
                          <strong>Requirement:</strong> {webhookResult.lead.requirements.bhk} {webhookResult.lead.requirements.propertyType} in {webhookResult.lead.requirements.preferredLocalities.join(', ') || 'Any'}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, marginTop: 6 }}>
                          👤 Auto-Assigned To: {webhookResult.assignedAgent ? `${webhookResult.assignedAgent.name} (${webhookResult.assignedAgent.role})` : 'Unassigned Pool'}
                        </div>
                        <button 
                          className="btn btn-sm btn-ghost" 
                          style={{ marginTop: 12 }} 
                          onClick={() => setWebhookResult(null)}
                        >
                          ← Test Another Portal Webhook
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {Object.entries(PORTAL_WEBHOOK_SCHEMAS).map(([portalKey, info]) => (
                          <div
                            key={portalKey}
                            style={{
                              padding: '12px 14px',
                              borderRadius: 8,
                              border: '1px solid var(--color-border)',
                              background: 'var(--color-card)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 12
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{info.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--color-muted-fg)', marginTop: 2 }}>
                                Simulates live JSON POST payload & triggers auto-assign
                              </div>
                            </div>
                            <button
                              className="btn btn-sm btn-outline"
                              style={{ gap: 6, flexShrink: 0 }}
                              onClick={() => handleTriggerWebhook(portalKey)}
                            >
                              <Radio size={13} /> Fire Webhook
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {mode === 'csv' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Drop Zone */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileRef.current?.click()}
                      style={{
                        border: `2px dashed ${dragOver ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRadius: 10,
                        padding: '24px 16px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: dragOver ? 'rgba(37,99,235,0.04)' : 'var(--color-muted)',
                        transition: 'all 0.15s',
                      }}
                    >
                      <Upload size={24} style={{ color: 'var(--color-primary)', margin: '0 auto 8px' }} />
                      <div style={{ fontSize: 13, fontWeight: 600 }}>Drop a .csv file here</div>
                      <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', marginTop: 4 }}>or click to browse</div>
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".csv"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileRead(e.target.files[0])}
                      />
                    </div>

                    {/* Or paste CSV */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted-fg)' }}>Or paste CSV below</label>
                        <button
                          className="btn btn-ghost"
                          style={{ height: 24, fontSize: 11, padding: '0 8px' }}
                          onClick={() => handleCSVChange(SAMPLE_CSV)}
                        >
                          Use sample
                        </button>
                      </div>
                      <textarea
                        className="form-input"
                        rows={6}
                        value={csvText}
                        onChange={(e) => handleCSVChange(e.target.value)}
                        placeholder={`Name,Phone,Email,Source,Property Type,BHK,Budget,Locality,Possession\nAmit Sharma,+919811111001,...`}
                        style={{ fontFamily: 'var(--font-mono)', fontSize: 11, resize: 'vertical' }}
                      />
                    </div>

                    {/* Parsed Preview */}
                    {parsedLeads.length > 0 && (
                      <div style={{ background: 'var(--color-muted)', borderRadius: 8, padding: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{parsedLeads.length} leads parsed successfully</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 140, overflowY: 'auto' }} className="custom-scrollbar">
                          {parsedLeads.map((l, i) => (
                            <div key={i} style={{ fontSize: 12, display: 'flex', gap: 8, color: 'var(--color-fg)' }}>
                              <span style={{ fontWeight: 600 }}>{l.name}</span>
                              <span style={{ color: 'var(--color-muted-fg)' }}>{l.phone}</span>
                              <span style={{ color: 'var(--color-muted-fg)' }}>{l.requirements.bhk} {l.requirements.propertyType}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {csvText && parsedLeads.length === 0 && (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: '#ef4444', fontSize: 12 }}>
                        <AlertCircle size={14} />
                        Could not parse any leads. Check that CSV has Name and Phone columns.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 14, borderTop: '1px solid var(--color-border)', marginTop: 14 }}>
                <button className="btn btn-ghost" onClick={handleClose}>Cancel</button>
                {mode === 'csv' && (
                  <button
                    className="btn btn-primary"
                    disabled={parsedLeads.length === 0}
                    onClick={handleImportCSV}
                    style={{ gap: 6 }}
                  >
                    <Upload size={14} /> Import {parsedLeads.length > 0 ? `${parsedLeads.length} Leads` : 'Leads'}
                  </button>
                )}
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
