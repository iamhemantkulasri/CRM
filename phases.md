# Implementation Phases — PropDesk CRM

**Total MVP Scope:** 12 screens, 19 features, 6 data models  
**Tech Stack:** Vite + React, Vanilla CSS (design tokens from design.md), Zustand, dnd kit, Recharts, Sonner, Base UI, clsx  
**Storage:** LocalStorage (MVP) → Firebase/Supabase upgrade path

---

## Phase Overview

```mermaid
gantt
    title PropDesk CRM — Build Phases
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d

    section Phase 1 — Foundation
    Project scaffold + design system       :p1a, 2026-09-04, 1d
    Data layer + seed data + agent selector :p1b, after p1a, 1d
    App shell (header, sidebar, routing)    :p1c, after p1b, 1d

    section Phase 2 — Lead Core
    Lead CRUD + Add/Edit modal             :p2a, after p1c, 1d
    Kanban board + drag-and-drop           :p2b, after p2a, 2d
    Table view + filters                   :p2c, after p2b, 1d
    Lead detail drawer + activity timeline :p2d, after p2c, 1d

    section Phase 3 — Communication
    WhatsApp one-tap + templates           :p3a, after p2d, 1d
    Click-to-Call simulation + call logs   :p3b, after p3a, 1d
    Telephony panel                        :p3c, after p3b, 1d

    section Phase 4 — Property + Visits
    Property inventory + CRUD              :p4a, after p3c, 1d
    Lead-Property matching                 :p4b, after p4a, 1d
    Site visit scheduling + calendar       :p4c, after p4b, 1d

    section Phase 5 — Dashboard + Polish
    Dashboard KPIs + charts                :p5a, after p4c, 1d
    Deals & Commission Tracking            :p5b, after p5a, 1d
    Document Management (KYC)              :p5c, after p5b, 1d
    Team management + settings             :p5d, after p5c, 1d
    Responsive polish + dark mode          :p5e, after p5d, 1d
    Final QA + demo data                   :p5f, after p5e, 1d

    section Phase 6 — Advanced Integrations
    Auto Lead Capture (Webhooks)           :p6a, after p5f, 1d
    Smart Notifications & Reminders        :p6b, after p6a, 1d
    Smart Inventory Sharing                :p6c, after p6b, 1d

    section Phase 7 — Gamification (Optional)
    Shark Tank Lead Distribution           :p7a, after p6c, 1d

---

## Phase 1 — Foundation & App Shell

**Goal:** Working app skeleton with design system, data layer, agent login, and navigation. No lead features yet — just the bones.

| Deliverable | Files | Features |
|:---|:---|:---|
| Vite + React project | `package.json`, `vite.config.js` | Project scaffold |
| Design system CSS | `src/index.css` | All tokens from design.md (colors, typography, spacing, shadows, animations) |
| Data layer | `src/store/` | Zustand stores, LocalStorage persistence, seed data (3 agents, 15 leads, 8 properties) |
| Agent selector | `src/pages/Login.jsx` | Screen 1: Click avatar to "login" as Rajan/Rohan/Priya/Amit |
| App shell | `src/App.jsx`, `src/components/` | Header (logo, nav, helpline badge, agent switcher), Sidebar (filters), Routing |
| Indian formatters | `src/utils/` | `formatINR()`, `formatPhone()`, `formatDate()`, `formatArea()` |

**Exit criteria:** Can open the app, select an agent, see the header with helpline number, navigate between empty pages (Dashboard, Leads, Properties, Visits, Calls).

---

## Phase 2 — Lead Management Core

**Goal:** The heart of the CRM — leads with clear ownership, pipeline, and detail view.

| Deliverable | Files | Features |
|:---|:---|:---|
| Lead CRUD | `src/store/leadStore.js` | Add, edit, delete, assign leads. Audit log on every action. |
| Add/Edit Lead modal | `src/components/LeadModal.jsx` | Screen 6: Form with Indian fields (Name, Phone, Source, BHK, Budget ₹L, Localities) |
| Kanban board | `src/pages/Kanban.jsx` | Screen 3: 9 pipeline columns, drag-and-drop (dnd kit), agent badge on every card |
| Table view | `src/pages/TableView.jsx` | Screen 4: Sortable table with owner column, stage badges |
| Quick filters & Tags | Filter sidebar / toolbar | F4: Custom tags (e.g. NRI), DNC flags, My Leads + Source/Priority filters |
| Lead detail drawer | `src/components/LeadDrawer.jsx` | Screen 5: Slide-out, requirements tab, tags, activity timeline, quick actions bar |
| Activity timeline | `src/store/activityStore.js` | F19: Immutable chronological log (created, assigned, stage changed, notes) |

**Exit criteria:** Can add a lead, see it on Kanban with agent badge, drag to a new stage, filter "My Leads", open detail drawer with timeline.

---

## Phase 3 — Communication (WhatsApp + Telephony)

**Goal:** One-tap WhatsApp and simulated call logging.

| Deliverable | Files | Features |
|:---|:---|:---|
| WhatsApp one-tap | `src/components/WhatsAppButton.jsx` | F10: Opens `wa.me` link with pre-filled message |
| WhatsApp templates | `src/components/WhatsAppTemplates.jsx` | F11: 4 template dropdown (Introduction, Property Share, Visit Confirm, Follow-Up) |
| Click-to-Call simulation | `src/components/CallModal.jsx` | F8: Simulated dialer modal, call timer, disposition selection |
| Call logging | `src/store/callStore.js` | F9: Auto-log calls to lead timeline (direction, duration, status) |
| Telephony panel | `src/pages/Telephony.jsx` | Screen 10: Call logs list, missed calls queue, simulated incoming call |

**Exit criteria:** Can click WhatsApp on a lead → opens wa.me with template. Can simulate a call → logged in lead timeline. Can view all calls in Telephony panel.

---

## Phase 4 — Property Inventory + Site Visits

**Goal:** Property database with lead matching and visit scheduling.

| Deliverable | Files | Features |
|:---|:---|:---|
| Property inventory | `src/pages/Properties.jsx` | Screen 7: Card grid with photo, specs, ₹ price |
| Property CRUD | `src/components/PropertyModal.jsx` | Screen 8: Add/edit form (admin only) |
| Lead ↔ Property matching | `src/components/MatchingTab.jsx` | F13: Suggested properties on lead detail; interested leads on property detail |
| Site visit scheduling | `src/components/SiteVisitModal.jsx` | F14: Select property, date, time, agent |
| Visit calendar | `src/pages/Calendar.jsx` | Screen 9: Weekly agenda, color-coded by agent |
| Post-visit feedback | `src/components/VisitFeedback.jsx` | F16: Log outcome (Interested/Alternatives/Price Issue/Not Interested) |

**Exit criteria:** Can add a property, see matching leads. Can schedule a site visit from lead detail, see it on calendar, log feedback.

---

## Phase 5 — Dashboard, Finance & Polish

**Goal:** Analytics, team management, commission tracking, KYC docs, and final polish.

| Deliverable | Files | Features |
|:---|:---|:---|
| Admin dashboard | `src/pages/Dashboard.jsx` | Screen 2: KPI cards (animated count-up), 3 charts (Recharts) |
| Deals & Finance | `src/pages/Deals.jsx` | F21: Brokerage/Commission tracker, invoice status, agent splits |
| Document Management | `src/components/DocsTab.jsx` | F23: Upload/store KYC docs in Lead Drawer |
| Team management | `src/pages/Team.jsx` | Screen 11: Add/edit employees, avatar colors, activate/deactivate |
| Settings | `src/pages/Settings.jsx` | Screen 12: Company name, helpline number, WhatsApp templates |
| Global Search | `src/components/Header.jsx` | F4: Unified search bar across all leads, properties, and deals |
| Dark mode | CSS `[data-theme="dark"]` toggle | Toggle in header, persisted in LocalStorage |
| **Mobile Polish** | CSS breakpoints & App Shell | Convert sidebar to fixed Bottom Nav on mobile (<768px). Implement Bottom Sheets for drawers with momentum scroll. Ensure 44px minimum touch targets and strict `hover: hover` guards. |

**Exit criteria:** Dashboard shows real KPI data. Can track commissions on won deals. Can upload KYC docs. The app feels completely native on an iPhone or Android device, with proper touch mechanics and no horizontal layout breaks.

---

## Phase 6 — Advanced Integrations ✅ (COMPLETED)

**Goal:** Automation and smart workflows.

| Deliverable | Files | Features |
|:---|:---|:---|
| Auto Lead Capture | `src/api/webhooks.js` | F19: Parse incoming leads from portals and auto-assign (Round-Robin) |
| Smart Notifications | `src/components/Notifications.jsx` | F20: Reminders for overdue follow-ups |
| Inventory Sharing | `src/components/ShareBrochure.jsx` | F22: Generate WhatsApp property brochures instantly |

**Exit criteria:** System can receive a webhook and auto-create a lead. Agents receive follow-up reminders. ✅ All criteria satisfied.

---

## Phase 7 — Gamification (Optional)

**Goal:** Drive sales team urgency through competitive lead distribution.

| Deliverable | Files | Features |
|:---|:---|:---|
| Gamified Lead Distribution | `src/api/webhooks.js` | F20: "Shark Tank" mode broadcast to all agents for new inbound leads |

**Exit criteria:** A new webhook lead pops up on all agents' screens; first to click "Claim" gets assigned ownership.

---

## Dependency Graph

```mermaid
flowchart LR
    P1[Phase 1: Foundation] --> P2[Phase 2: Lead Core]
    P2 --> P3[Phase 3: Communication]
    P2 --> P4[Phase 4: Properties + Visits]
    P3 --> P5[Phase 5: Dashboard + Polish]
    P4 --> P5
```

> **Phases 3 and 4 can run in parallel** after Phase 2 is complete — they only share the lead data model and detail drawer, which Phase 2 delivers.

---

## Risk Register

| Risk | Impact | Mitigation |
|:---|:---|:---|
| dnd kit complexity for 9 Kanban columns | Medium | Start with simplified 4-column demo, expand to 9 after basic DnD works |
| LocalStorage size limit (~5MB) | Low | 500 leads × 2KB = ~1MB. Well within limits for MVP team size. |
| Mobile Kanban horizontal scroll UX | Medium | Test on real 360px devices early in Phase 5 |
| Recharts bundle size | Low | Tree-shake to only import BarChart, PieChart, ResponsiveContainer |

---

*Each phase is designed to deliver a working, demonstrable increment. Phase 1 alone gives you a clickable app shell. Phase 2 alone gives you a usable CRM.*
