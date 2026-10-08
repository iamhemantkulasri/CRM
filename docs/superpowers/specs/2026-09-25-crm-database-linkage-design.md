# Design Document: CRM Full Database Linkage (Supabase)

**Date:** 2026-09-25  
**Project:** TGV Estates CRM & Admin Desk (`c:/Users/iamhe/Downloads/TGV-website/CRM`)  
**Supabase Ref:** `ujdeazibiexbssfikuaz` (`TGV-Estates`)  
**Author:** Pair Programming Assistant (Antigravity) & User  

---

## 1. Overview & Objective

The TGV Estates CRM currently has three core modules connected live to Supabase:
- `properties` (`public.properties`)
- `leads` (`public.leads`)
- `builders_sellers` (`public.builders_sellers`)

Five remaining operational modules operate in browser `localStorage` or hardcoded in-memory state:
1. **Employees & Team** (`employeeStore.js` / `Team.jsx`)
2. **Deals & Finance** (`dealStore.js` / `Deals.jsx`)
3. **Site Visits & Calendar** (`visitStore.js` / `Calendar.jsx`)
4. **Telephony & Call Logs** (`callStore.js` / `Telephony.jsx`)
5. **Tasks Sync** (`taskStore.js` / `Tasks.jsx` — table exists in Supabase, currently 0 rows and unseeded)

The objective is to establish a complete PostgreSQL database linkage for all 5 modules in Supabase, ensuring cross-device synchronization, relational integrity, foreign key indexing, and optimistic UI responsiveness.

---

## 2. Database Schema Design (PostgreSQL / Supabase)

### 2.1 Table: `public.employees`
Stores agency team members and agents. Compatible with existing assigned lead IDs (`'emp_admin'`, `'emp_rohan'`, `'emp_priya'`, `'emp_amit'`).

```sql
CREATE TABLE IF NOT EXISTS public.employees (
  id TEXT PRIMARY KEY DEFAULT ('emp_' || substr(md5(random()::text), 1, 8)),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('admin', 'agent')),
  avatar_color TEXT DEFAULT 'var(--color-fg)',
  avatar_text TEXT DEFAULT 'var(--agent-1-fg)',
  avatar_border TEXT DEFAULT 'var(--agent-1-border)',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.2 Table: `public.deals`
Tracks completed property transactions, total deal value, gross brokerage, and partner splits.

```sql
CREATE TABLE IF NOT EXISTS public.deals (
  id TEXT PRIMARY KEY DEFAULT ('deal_' || substr(md5(random()::text), 1, 8)),
  lead_id TEXT,
  property_id TEXT,
  agent_id TEXT REFERENCES public.employees(id) ON DELETE SET NULL,
  total_deal_value_lakhs NUMERIC NOT NULL,
  brokerage_percentage NUMERIC,
  brokerage_amount NUMERIC,
  gross_brokerage_lakhs NUMERIC,
  partner_id UUID REFERENCES public.builders_sellers(id) ON DELETE SET NULL,
  partner_share_lakhs NUMERIC,
  tgv_share_lakhs NUMERIC,
  agent_split_percentage NUMERIC DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'pending_invoice' CHECK (status IN ('pending_invoice', 'invoiced', 'paid', 'cancelled')),
  closed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Foreign key indexes (Supabase Postgres best practices)
CREATE INDEX IF NOT EXISTS deals_lead_id_idx ON public.deals(lead_id);
CREATE INDEX IF NOT EXISTS deals_property_id_idx ON public.deals(property_id);
CREATE INDEX IF NOT EXISTS deals_agent_id_idx ON public.deals(agent_id);
CREATE INDEX IF NOT EXISTS deals_partner_id_idx ON public.deals(partner_id);
CREATE INDEX IF NOT EXISTS deals_status_idx ON public.deals(status);
```

### 2.3 Table: `public.visits`
Tracks on-site property tours, scheduled dates, and feedback notes for clients.

```sql
CREATE TABLE IF NOT EXISTS public.visits (
  id TEXT PRIMARY KEY DEFAULT ('visit_' || substr(md5(random()::text), 1, 8)),
  lead_id TEXT,
  property_id TEXT,
  agent_id TEXT REFERENCES public.employees(id) ON DELETE SET NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  feedback TEXT,
  feedback_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Foreign key indexes
CREATE INDEX IF NOT EXISTS visits_lead_id_idx ON public.visits(lead_id);
CREATE INDEX IF NOT EXISTS visits_property_id_idx ON public.visits(property_id);
CREATE INDEX IF NOT EXISTS visits_agent_id_idx ON public.visits(agent_id);
CREATE INDEX IF NOT EXISTS visits_scheduled_date_idx ON public.visits(scheduled_date);
```

### 2.4 Table: `public.call_logs`
Tracks telephone dialer history and communication logs.

```sql
CREATE TABLE IF NOT EXISTS public.call_logs (
  id TEXT PRIMARY KEY DEFAULT ('call_' || substr(md5(random()::text), 1, 8)),
  lead_id TEXT,
  agent_id TEXT REFERENCES public.employees(id) ON DELETE SET NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'missed', 'busy', 'declined')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Foreign key indexes
CREATE INDEX IF NOT EXISTS call_logs_lead_id_idx ON public.call_logs(lead_id);
CREATE INDEX IF NOT EXISTS call_logs_agent_id_idx ON public.call_logs(agent_id);
```

### 2.5 Seed Initial Data & Fix `public.tasks`
1. Seed the default team into `public.employees`:
   - `emp_admin` (Rajan Mehta, Admin)
   - `emp_rohan` (Rohan Verma, Agent)
   - `emp_priya` (Priya Sharma, Agent)
   - `emp_amit` (Amit Patel, Agent)
2. Seed the 4 initial tasks into `public.tasks` so the table is not empty.
3. Seed the sample deal into `public.deals`.

### 2.6 Row Level Security (RLS)
Enable RLS on all tables and grant full operational policies for the CRM desk via public role (matching existing `leads` and `tasks` policies):
```sql
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read-write for employees" ON public.employees FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public read-write for deals" ON public.deals FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public read-write for visits" ON public.visits FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public read-write for call_logs" ON public.call_logs FOR ALL TO public USING (true) WITH CHECK (true);
```

---

## 3. Frontend Store Architecture (`CRM/src/store/`)

All stores follow the established optimistic Zustand pattern:
1. **Local State First**: Immediate UI feedback without loading spinners blocking user action.
2. **Asynchronous Supabase Sync**: In the background, perform `supabase.from(table).insert/update/delete`.
3. **Rollback / Reconciliation**: If Supabase responds with the created row or an error, reconcile local state.
4. **Boot Pre-fetching**: Fetch remote data into store when app initializes.

### 3.1 `employeeStore.js`
- `fetchEmployees()`: Queries `supabase.from('employees').select('*').order('name')`.
- `addEmployee(empData)`: Inserts new agent into `public.employees`.
- `updateEmployee(id, updates)`: Updates role, status, phone, email.
- Maintains `getEmployee(id)` and `getActiveAgents()` selectors.

### 3.2 `dealStore.js`
- `fetchDeals()`: Queries `supabase.from('deals').select('*').order('closed_at', { ascending: false })`.
- `addDeal(dealData)`: Computes partner and TGV splits with `splitCommission()` and inserts to `public.deals`.
- `updateDealStatus(id, status)`: Syncs status changes (e.g. `pending_invoice` -> `invoiced` -> `paid`) to `public.deals`.

### 3.3 `visitStore.js`
- `fetchVisits()`: Queries `supabase.from('visits').select('*').order('scheduled_date', { ascending: true })`.
- `scheduleVisit(leadId, propertyId, agentId, scheduledDate)`: Inserts new site tour to `public.visits`.
- `updateFeedback(id, feedback, feedbackNotes, agentId)`: Updates status and notes in `public.visits`.

### 3.4 `callStore.js`
- `fetchCalls()`: Queries `supabase.from('call_logs').select('*').order('created_at', { ascending: false })`.
- `logCall(leadId, agentId, duration, status, notes)`: Inserts call log into `public.call_logs`.

### 3.5 `taskStore.js`
- Ensure `fetchTasks()` handles empty state without clobbering, and saves new tasks cleanly to `public.tasks`.

---

## 4. UI Integrations & Enhancements

1. **`CRM/src/App.jsx`**:
   - Update `AppLayout` `useEffect` to prefetch all stores on boot (`fetchProperties`, `fetchLeads`, `fetchBuilders`, `fetchEmployees`, `fetchTasks`, `fetchDeals`, `fetchVisits`, `fetchCalls`).
2. **`CRM/src/pages/Team.jsx`**:
   - Replace the `alert('MVP: Add Agent disabled.')` placeholder with a clean Add Agent modal dialog allowing admins to add real agents into `public.employees`.
   - Wire Activate/Deactivate button to update employee status live in Supabase.
3. **`CRM/src/pages/Login.jsx`**:
   - Dynamically list active employees fetched from `public.employees` so newly added agents can log in immediately.

---

## 5. Verification & Testing Plan

1. **Database Migration Verification**:
   - Apply SQL migration to Supabase `ujdeazibiexbssfikuaz`.
   - Query tables via `list_tables` / `execute_sql` to confirm all 4 new tables, indexes, and seeded records exist.
2. **Data Persistence Verification**:
   - Create a new deal in `/app/deals` -> verify it appears in Supabase `public.deals`.
   - Schedule a site visit in `/app/calendar` -> verify it appears in `public.visits`.
   - Log a call in `/app/telephony` -> verify it appears in `public.call_logs`.
   - Add a new agent in `/app/team` -> verify agent appears in `public.employees` and on the `/` login screen.
   - Create a task in `/app/tasks` -> verify task persists in `public.tasks`.
3. **Build & Regression Verification**:
   - Run `npm run build` in `CRM/` to verify zero compile or bundling errors.
