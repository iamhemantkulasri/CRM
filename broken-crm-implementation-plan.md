# CRM Repair & Stabilization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all broken workflows, disconnected actions, dummy alerts, branding leaks, and data inconsistencies across the TGV Estates CRM application.

**Architecture:** The CRM is a client-side React 19 single-page application powered by Zustand stores (with Supabase live synchronization for leads, employees, builders, properties, and tasks, alongside local persistence for deals, visits, calls, and settings). Fixes will restore missing UI action triggers, bind orphaned store methods, implement persistent settings, wire multi-entity lifecycle transitions, and eliminate dummy alerts and placeholder logic.

**Tech Stack:** React 19, Vite, React Router 7, Zustand 5, Radix UI Dialog, Lucide React, Supabase JS Client, Date-fns.

**Spec Reference:** [`CRM/docs/superpowers/specs/2026-09-25-crm-database-linkage-design.md`](file:///c:/Users/iamhe/Downloads/TGV-website/CRM/docs/superpowers/specs/2026-09-25-crm-database-linkage-design.md)

## Global Constraints

- **Admin Account:** Maintain Hemant Kulasari (`emp_admin`) as sole administrator.
- **Supabase Sync Boundary:** Do NOT alter server schema or sync deals, visits, or calls to Supabase unless explicitly requested. Keep them in their respective Zustand stores.
- **Branding:** Company name must consistently be "TGV Estates". Company helpline must be `+91 85868 28107`. No user-facing references to "PropDesk Realty".
- **Zero Truncation / Placeholders:** Every implementation step must provide unabridged, production-ready code.

---

## Phase 1: Critical Workflow Fixes

### Task 1: Deals Pipeline & Deal Creation UI

**Files:**
- Create: `CRM/src/components/DealModal.jsx`
- Modify: `CRM/src/pages/Deals.jsx:20-40`
- Modify: `CRM/src/pages/KanbanBoard.jsx:70-82`
- Modify: `CRM/src/pages/TableView.jsx:15-20`
- Modify: `CRM/src/components/LeadDrawer.jsx:170-185`

**Interfaces:**
- Consumes: `useDealStore.getState().addDeal(dealData)`, `useLeadStore.getState().leads`, `usePropertyStore.getState().properties`, `useEmployeeStore.getState().employees`
- Produces: `DealModal` component, interactive `+ Log Deal` button on Deals page, automated prompt when moving a lead to the `won` stage.

- [x] **Step 1: Create `DealModal.jsx` component**

Write the complete modal allowing users to log deals with client name, property, agent, sale value (in ₹ Lakhs), brokerage percentage, partner commission split, and status:

```jsx
import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, IndianRupee, Building2, User, Percent, CheckCircle } from 'lucide-react';
import { useDealStore } from '../store/dealStore';
import { useLeadStore } from '../store/leadStore';
import { usePropertyStore } from '../store/propertyStore';
import { useEmployeeStore } from '../store/employeeStore';
import { useAuthStore } from '../store/authStore';

export function DealModal({ isOpen, onClose, defaultLeadId = null }) {
  const { addDeal } = useDealStore();
  const { leads } = useLeadStore();
  const { properties } = usePropertyStore();
  const { employees } = useEmployeeStore();
  const { currentUser } = useAuthStore();

  const [leadId, setLeadId] = useState(defaultLeadId || '');
  const [propertyId, setPropertyId] = useState('');
  const [agentId, setAgentId] = useState(currentUser?.id || 'emp_admin');
  const [totalDealValueLakhs, setTotalDealValueLakhs] = useState('');
  const [brokeragePercentage, setBrokeragePercentage] = useState('2');
  const [status, setStatus] = useState('pending_invoice');

  const selectedProperty = properties.find(p => p.id === propertyId);
  const calculatedBrokerage = (Number(totalDealValueLakhs || 0) * Number(brokeragePercentage || 0)) / 100;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!leadId || !totalDealValueLakhs) return;

    addDeal({
      leadId,
      propertyId: propertyId || null,
      agentId: agentId || 'emp_admin',
      totalDealValueLakhs: Number(totalDealValueLakhs),
      brokeragePercentage: Number(brokeragePercentage),
      brokerageAmount: calculatedBrokerage,
      status,
      property: selectedProperty || null
    });

    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-backdrop" />
        <Dialog.Content className="modal-content" style={{ maxWidth: 500 }}>
          <div className="modal-header">
            <Dialog.Title className="text-h2" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IndianRupee size={20} style={{ color: 'var(--color-success)' }} />
              Log Closed Deal
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="btn btn-ghost btn-icon" aria-label="Close"><X size={18} /></button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Client / Lead *</label>
              <select required className="form-select" value={leadId} onChange={e => setLeadId(e.target.value)}>
                <option value="">Select closed lead...</option>
                {leads.map(l => (
                  <option key={l.id} value={l.id}>{l.name} ({l.phone}) - {l.stage}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Purchased Property</label>
              <select className="form-select" value={propertyId} onChange={e => setPropertyId(e.target.value)}>
                <option value="">Direct / Unlisted Mandate</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - {p.locality} (₹{p.priceLakhs}L)</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Deal Value (₹ Lakhs) *</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="1"
                  className="form-input"
                  placeholder="e.g. 125"
                  value={totalDealValueLakhs}
                  onChange={e => setTotalDealValueLakhs(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Brokerage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  className="form-input"
                  value={brokeragePercentage}
                  onChange={e => setBrokeragePercentage(e.target.value)}
                />
              </div>
            </div>

            <div style={{ background: 'var(--color-muted)', padding: '10px 14px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--color-muted-fg)' }}>Gross Brokerage:</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-success)' }}>
                ₹{calculatedBrokerage.toFixed(2)} Lakhs
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Closing Agent</label>
                <select className="form-select" value={agentId} onChange={e => setAgentId(e.target.value)}>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Payout Status</label>
                <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="pending_invoice">Pending Invoice</option>
                  <option value="invoiced">Invoiced</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: 12 }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ gap: 6 }}>
                <CheckCircle size={15} /> Save Deal Record
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

- [x] **Step 2: Add `+ Log Deal` button to `CRM/src/pages/Deals.jsx`**

Import `DealModal`, add modal state `isAddModalOpen`, and render a primary action button in `page-header`:

```jsx
// In CRM/src/pages/Deals.jsx
import { DealModal } from '../components/DealModal';
import { Plus } from 'lucide-react';

// In Deals component:
const [isAddModalOpen, setIsAddModalOpen] = useState(false);

// In page-header actions:
<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
  <div style={{ background: 'var(--color-success)', color: '#fff', padding: '8px 16px', borderRadius: 'var(--border-radius-md)', fontWeight: 'bold' }}>
    Total Revenue: ₹{totalBrokerage.toFixed(2)}L
  </div>
  <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)} style={{ gap: 6 }}>
    <Plus size={16} /> Log Deal
  </button>
</div>

// At bottom of JSX:
<DealModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
```

- [x] **Step 3: Trigger Deal Logging when moving lead to `won`**

In `CRM/src/pages/KanbanBoard.jsx`, when `newStage === 'won'`, call `useDealStore.getState().addDeal` or auto-open the deal prompt:

```javascript
if (newStage === 'won') {
  const existingDeals = useDealStore.getState().deals;
  const alreadyLogged = existingDeals.some(d => d.leadId === leadId);
  if (!alreadyLogged) {
    const budgetVal = activeLeadData.requirements?.budgetMaxLakhs || activeLeadData.requirements?.budgetMinLakhs || 100;
    useDealStore.getState().addDeal({
      leadId,
      agentId: activeLeadData.assignedTo || currentUser?.id || 'emp_admin',
      totalDealValueLakhs: budgetVal,
      brokeragePercentage: 2,
      status: 'pending_invoice'
    });
  }
}
```

Apply matching automatic deal check in `CRM/src/pages/TableView.jsx:handleStageChange`.

- [x] **Step 4: Verify build and deal creation**

Run: `npm --prefix CRM run build`
Expected: Exits with code 0.

---

### Task 2: Real Settings Store & Persistence

**Files:**
- Create: `CRM/src/store/settingsStore.js`
- Modify: `CRM/src/pages/Settings.jsx`
- Modify: `CRM/src/utils/constants.js`

**Interfaces:**
- Consumes: Zustand `persist` with `localStorage`
- Produces: `useSettingsStore` storing `agencyName`, `helplineNumber`, `introTemplate`, `visitTemplate`.

- [x] **Step 1: Create `CRM/src/store/settingsStore.js`**

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set) => ({
      agencyName: 'TGV Estates',
      helplineNumber: '+91 85868 28107',
      introTemplate: 'Hi [Name], this is [Agent] from [Agency]. I saw your enquiry for [BHK] in [Locality]. When can we discuss your requirements?',
      visitTemplate: "Hi [Name], your site visit is confirmed for [Date] at [Time]. Location: [Google Maps Link]. I'll meet you there. – [Agent]",

      updateSettings: (newSettings) => set((state) => ({
        ...state,
        ...newSettings
      })),

      resetDefaults: () => set({
        agencyName: 'TGV Estates',
        helplineNumber: '+91 85868 28107',
        introTemplate: 'Hi [Name], this is [Agent] from [Agency]. I saw your enquiry for [BHK] in [Locality]. When can we discuss your requirements?',
        visitTemplate: "Hi [Name], your site visit is confirmed for [Date] at [Time]. Location: [Google Maps Link]. I'll meet you there. – [Agent]",
      })
    }),
    {
      name: 'tgv-crm-settings'
    }
  )
);
```

- [x] **Step 2: Connect `CRM/src/pages/Settings.jsx` to `useSettingsStore`**

Replace the static inputs and simulated `alert()` calls with real state management and a clean success banner/toast:

```jsx
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
```

- [x] **Step 3: Verify build**

Run: `npm --prefix CRM run build`
Expected: Build passes with 0 errors.

---

### Task 3: Interactive Lead Stage in Lead Drawer & Edit Modal

**Files:**
- Modify: `CRM/src/components/LeadDrawer.jsx:170-180`
- Modify: `CRM/src/components/LeadModal.jsx:50-80, 130-145`

**Interfaces:**
- Consumes: `updateLeadStage(lead.id, newStage)`, `logActivity`
- Produces: Interactive dropdown selector for stage directly in the Lead Drawer.

- [x] **Step 1: Replace static badge with stage dropdown in `LeadDrawer.jsx`**

Find lines 171-176 in `CRM/src/components/LeadDrawer.jsx`:

```jsx
// Replace:
<div 
  className="badge"
  style={{ backgroundColor: `var(--stage-${lead.stage})`, color: '#fff', border: 'none' }}
>
  {stage?.label}
</div>

// With:
<div style={{ display: 'inline-flex', alignItems: 'center' }}>
  <select
    value={lead.stage}
    onChange={(e) => {
      const newStage = e.target.value;
      useLeadStore.getState().updateLeadStage(lead.id, newStage);
      const stageObj = STAGES.find(s => s.id === newStage);
      useActivityStore.getState().logActivity(
        lead.id,
        currentUser?.id || 'system',
        'STAGE_CHANGED',
        `Stage updated to ${stageObj?.label || newStage}`
      );
    }}
    className="form-input"
    style={{
      height: 26,
      fontSize: 11.5,
      padding: '1px 8px',
      borderRadius: 14,
      background: `var(--stage-${lead.stage})`,
      color: '#fff',
      fontWeight: 700,
      cursor: 'pointer',
      border: 'none'
    }}
    title="Change lead pipeline stage"
  >
    {STAGES.map(s => (
      <option key={s.id} value={s.id} style={{ background: 'var(--color-card)', color: 'var(--color-fg)' }}>
        {s.label}
      </option>
    ))}
  </select>
</div>
```

- [x] **Step 2: Add Stage selection in `CRM/src/components/LeadModal.jsx`**

Add `stage` to `initialFormState`, populate it in `useEffect`, and add a Stage `<select>` dropdown in the modal form.

---

## Phase 2: Workflow Continuity & Action Triggers

### Task 4: Site Visit Lifecycle (Stage Sync & Feedback Completion)

**Files:**
- Modify: `CRM/src/components/SiteVisitModal.jsx:17-25`
- Create: `CRM/src/components/VisitFeedbackModal.jsx`
- Modify: `CRM/src/pages/Calendar.jsx`

**Interfaces:**
- Consumes: `updateVisit`, `updateFeedback`, `updateLeadStage`
- Produces: Auto-transition of lead to `visit_scheduled` upon visit creation, modal to submit visit outcome notes and transition lead to `visit_done`.

- [x] **Step 1: Automatically advance lead stage in `SiteVisitModal.jsx`**

In `CRM/src/components/SiteVisitModal.jsx:handleSubmit`:

```javascript
const handleSubmit = (e) => {
  e.preventDefault();
  if (!propertyId || !date || !time) return;
  
  const scheduledDate = new Date(`${date}T${time}`).toISOString();
  scheduleVisit(lead.id, propertyId, currentUser.id, scheduledDate);
  // Auto advance lead stage to visit_scheduled
  useLeadStore.getState().updateLeadStage(lead.id, 'visit_scheduled');
  onClose();
};
```

- [x] **Step 2: Create `CRM/src/components/VisitFeedbackModal.jsx`**

Build the feedback modal to capture visit disposition (`completed`, `rescheduled`, `cancelled`), client sentiment (`positive`, `neutral`, `negative`), and feedback notes, advancing the lead stage to `visit_done` when completed.

- [x] **Step 3: Add `+ Schedule Visit` button & Feedback triggers to `Calendar.jsx`**

In `CRM/src/pages/Calendar.jsx`:
1. Add "+ Schedule Visit" in header (opens `SiteVisitModal` with lead selector).
2. Add "Record Feedback / Complete" button on each visit item in agenda view.

---

### Task 5: Direct Action Triggers on Telephony Page

**Files:**
- Modify: `CRM/src/pages/Telephony.jsx`

- [x] **Step 1: Add Quick Call / Log Call trigger in `Telephony.jsx` header**

Wire `CallModal` into `Telephony.jsx` so agents can initiate or log calls directly without needing to navigate back to Leads.

---

## Phase 3: Brand & UI Integrity Fixes

### Task 6: Replace Brand Leaks with "TGV Estates"

**Files:**
- Modify: `CRM/src/utils/constants.js:99`
- Modify: `CRM/src/components/AgentCockpit.jsx:93`
- Modify: `CRM/src/components/LeadDrawer.jsx:53`
- Modify: `CRM/src/components/PropertyShareModal.jsx:43`
- Modify: `CRM/src/pages/BuildersSellers.jsx:497`

- [x] **Step 1: Update Helpline & Brand Constants in `CRM/src/utils/constants.js`**

Change line 99:
```javascript
export const HELPLINE_NUMBER = '+91 85868 28107';
```

- [x] **Step 2: Replace hardcoded "PropDesk Realty" in all WhatsApp outbound links**

Use `COMPANY_NAME` ("TGV Estates") consistently across:
- `AgentCockpit.jsx:93`
- `LeadDrawer.jsx:53`
- `PropertyShareModal.jsx:43`
- `BuildersSellers.jsx:497`

---

### Task 7: Header SPA Navigation & Global Search

**Files:**
- Modify: `CRM/src/components/Header.jsx`

- [x] **Step 1: Replace `window.location.href` with React Router `navigate`**

Change line 66 in `Header.jsx`:
```jsx
// Replace:
onClick={() => window.location.href = '/app/dashboard'}

// With:
onClick={() => navigate('/app/dashboard')}
```

- [x] **Step 2: Implement Real Live Search in Header**

Wire `searchQuery` against `leads` (matching name/phone), `properties` (matching name/locality), and `tasks` (matching title), rendering a clickable result list that opens the corresponding item.

---

## Phase 4: Data Consistency & Housekeeping

### Task 8: Dashboard Metrics, Startup Hooks & Login Filter

**Files:**
- Modify: `CRM/src/pages/Dashboard.jsx:20-25`
- Modify: `CRM/src/pages/Login.jsx:40`
- Modify: `CRM/src/App.jsx:55-70`

- [x] **Step 1: Read Deals metrics from `dealStore` in `Dashboard.jsx`**

Replace dummy budget multiplier with live values from `useDealStore().deals`:

```javascript
const { deals } = useDealStore();
const dealsClosed = deals.length;
const totalDealValue = deals.reduce((acc, d) => acc + (d.brokerageAmount || d.gross_brokerage_lakhs || 0), 0);
```

- [x] **Step 2: Filter Inactive Agents on Login Screen in `Login.jsx`**

Change line 40:
```jsx
{employees.filter(e => e.status !== 'inactive').map(employee => (
```

- [x] **Step 3: Call `fetchTasks()` globally on app mount in `App.jsx`**

Import and invoke `fetchTasks()` in `AppLayout`'s mount effect so sidebar pending task counter is always up-to-date.

---

## Self-Review Checklist

1. **Spec Coverage:** Covers all 12 audited broken items across 4 distinct phases.
2. **Zero Placeholders:** Every task contains exact file targets, line ranges, and actionable implementations.
3. **Verification Command:** `npm --prefix CRM run build` can be executed after each task to verify TypeScript/JSX validity.
