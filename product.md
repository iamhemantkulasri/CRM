# Product Requirements Document (PRD)
## PropDesk CRM — Real Estate Lead Management for India

**Version:** 1.0  
**Date:** 03 September 2026  
**Author:** Product & Engineering  
**Team Size:** 2–3 Employees + 1 Admin / Agency Owner  

---

## 1. Product Vision

> **One line:** A lightweight, India-first CRM that tells every team member exactly whose lead it is, in under one second.

PropDesk CRM is built for small Indian real estate brokerages (2–3 agents) who need:
- **Instant lead-ownership clarity** — no more "yeh lead kiska hai?" confusion.
- **A single company phone number** shared across all staff with smart call routing.
- **Indian market defaults** — budgets in Lakhs/Crores, BHK-based search, WhatsApp-first communication.
- **Zero enterprise bloat** — fast to open, fast to learn, works on mobile during site visits.

---

## 2. Target Users & Personas

| Persona | Role | Daily Goals | Pain Points |
|:---|:---|:---|:---|
| **Rajan (Agency Owner)** | Admin | Assign leads, track team performance, close high-value deals | Can't see which agent is following up with which customer; leads slip through cracks |
| **Rohan (Agent 1)** | Sales Agent | Call/WhatsApp leads, schedule & attend site visits, update deal status | Wastes time on leads already contacted by Priya; no single place to see his pipeline |
| **Priya (Agent 2)** | Sales Agent | Respond to portal enquiries, share property brochures, collect requirements | Gets calls from customers assigned to Rohan; personal number exposed to clients |
| **Amit (Agent 3, Part-time)** | Sales Agent | Handle overflow leads on weekends, assist with site visits | Doesn't know which leads are free to pick up vs. already owned |

---

## 3. Core Principles

1. **Ownership First** — Every screen, every card, every row answers: *"Who owns this lead?"*
2. **India Native** — Currency (₹ Lakhs/Crores), property types (BHK, Builder Floor), portals (99acres, Magicbricks), and communication (WhatsApp) are defaults, not afterthoughts.
3. **One Number, One Brand** — A single virtual helpline number for professional image; smart routing ensures the right agent answers.
4. **Mobile-Native (Not Just Responsive)** — Agents are on-field 60% of the day. The app must feel like a native iOS/Android app in the browser. This means bottom navigation, swipe-to-dismiss bottom sheets, 44x44px touch targets, and strict `hover: hover` guards to prevent sticky taps.
5. **Simplicity over Features** — 2–3 people don't need enterprise workflows. Every click must earn its place.

---

## 4. Feature Breakdown

### 4.1 Lead Management (Core)

#### F1: Lead Registry
- Add leads manually or via simulated portal import (99acres, Magicbricks, Housing.com, Meta Ads, Direct Call, Walk-in, WhatsApp, Central Helpline Call).
- Required fields: **Name, Phone, Source**.
- Optional fields: Email, Budget (Min–Max in Lakhs), Preferred Localities, BHK, Property Type, Possession Preference.

#### F2: Lead Ownership & Assignment
- **Every lead has exactly one owner** (or is explicitly "Unassigned").
- Admin can assign/reassign any lead.
- Agents can only view and work on their assigned leads (with option to see full team board in read-only).
- **Color-coded owner badge** visible on:
  - Kanban cards (avatar chip + name)
  - Table rows (dedicated "Owner" column with color dot)
  - Lead detail header (prominent owner section)

#### F3: Lead Pipeline (Kanban Board)
9 stages tailored to Indian real estate deal flow:

| Stage | Color | Description |
|:---|:---|:---|
| New / Fresh | `#3B82F6` Blue | Untouched lead from portal or ad |
| Contacted | `#8B5CF6` Purple | First call/WhatsApp attempt made |
| Requirement Gathered | `#6366F1` Indigo | Budget, location, BHK documented |
| Property Shared | `#0EA5E9` Sky | Brochure/options sent to customer |
| Site Visit Scheduled | `#F59E0B` Amber | Date, time, property confirmed |
| Site Visit Done | `#F97316` Orange | Visit completed, feedback collected |
| Negotiation | `#EC4899` Pink | Price discussion, token talk |
| Booked / Won | `#10B981` Emerald | Deal closed, commission earned |
| Lost / Cold | `#EF4444` Red | Dead lead, bought elsewhere |

- Drag-and-drop cards between stages.
- Each stage shows count badge and total deal value.

#### F4: Lead Quick Filters & Search
- **My Leads** — Leads assigned to logged-in agent.
- **All Leads** — Full team view with owner badges.
- **Unassigned** — Leads in the open pool.
- Filter by: Source, Priority (🔥 Hot / 🟡 Warm / 🔵 Cold), BHK, Budget Range, Locality, and Tags.
- **Global Unified Search:** A single search bar in the header to find any lead, property, or deal instantly by name or phone number.

#### F5: Lead Detail View
Slide-out drawer or modal containing:
- **Header:** Lead name, phone, priority badge, owner avatar + reassign button (admin only).
- **Requirements Tab:** Property type, BHK, budget (₹ Lakhs), localities, possession status.
- **Tags & Labels Tab:** Assign custom color-coded tags (e.g. "NRI", "Investor", "First-Time Buyer").
- **Activity Timeline:** Chronological log of every action (assignment, stage change, call, note, site visit).
- **Quick Actions Bar:** 📞 Click-to-Call · 💬 WhatsApp · 📅 Schedule Site Visit · ✏️ Add Note.
- **DNC (Do Not Contact) Flag:** A big red toggle that disables quick actions (Call/WhatsApp) to prevent accidental contact and ensure TRAI compliance.

---

### 4.2 Centralized Telephony (Single Helpline Number)

#### F6: Virtual Company Number
- One published number (e.g. `+91 80 6900 1234`) for the entire agency.
- Displayed prominently in the CRM header for quick reference.

#### F7: Smart Inbound Call Routing
- **Known lead calls** → Route directly to the assigned agent's mobile.
- **Unknown number calls** → Ring all active agents simultaneously (or round-robin). First to answer gets auto-assigned the lead.
- **Missed calls** → Auto-create an "Unassigned" lead with source "Missed Helpline Call" and send WhatsApp/SMS alert to admin.

#### F8: Click-to-Call (Outbound)
- Agent clicks 📞 on any lead card.
- System calls the agent's mobile first, then bridges to the customer.
- Customer sees the company virtual number on caller ID (personal numbers stay private).

#### F9: Call Logging & Recording
- Every call (inbound + outbound) auto-logged with:
  - Direction (In / Out)
  - Duration
  - Disposition (Answered / Missed / Busy)
  - Agent who handled the call
- Audio recording attached to the lead's activity timeline with inline playback.

---

### 4.3 WhatsApp Communication

#### F10: One-Tap WhatsApp Chat
- Click 💬 on any lead → opens `wa.me/91XXXXXXXXXX` with a pre-filled message template.
- No need to save the contact first.

#### F11: WhatsApp Message Templates
Pre-configured templates selectable from a dropdown:
1. **Introduction:** "Hi [Name], this is [Agent] from [Agency]. I saw your enquiry for [BHK] in [Locality]. When can we discuss your requirements?"
2. **Property Share:** "Hi [Name], here are some [BHK] options in [Locality] within your budget of ₹[Budget]. [Link]"
3. **Site Visit Confirmation:** "Hi [Name], your site visit is confirmed for [Date] at [Time]. Location: [Google Maps Link]. I'll meet you there. – [Agent]"
4. **Follow-Up:** "Hi [Name], hope you liked the property at [Location]. Would you like to discuss pricing or see more options?"

---

### 4.4 Property Inventory

#### F12: Property Listings Database
- Add properties with: Name/Project, Builder/Developer, Type (Apartment/Villa/Plot/Commercial), BHK, Area (sq. ft.), Price (₹ Lakhs/Crores), Locality, Status (Ready/Under Construction/Resale/New Launch), RERA Number.
- Property cards with photo placeholder, key specs, and price.

#### F13: Lead ↔ Property Matching
- On a lead's detail view, show "Suggested Properties" that match the lead's budget, BHK, and locality preferences.
- On a property's detail view, show "Interested Leads" who match the property specs.

---

### 4.5 Site Visit Management

#### F14: Schedule Site Visits
- From a lead's detail view: select Property, Date, Time, Assign Agent.
- Site visit card appears on both the lead timeline and the calendar view.

#### F15: Site Visit Calendar
- Weekly/daily agenda view showing all scheduled visits.
- Color-coded by agent.
- Click a visit → jump to the lead detail.

#### F16: Post-Visit Feedback
- After a visit, agent logs outcome: ✅ Interested / 🔄 Show Alternatives / 💰 Price Issue / ❌ Not Interested.
- Feedback appears in lead timeline and updates lead priority automatically.

---

### 4.6 Dashboard & Analytics

#### F17: Admin Dashboard
Summary cards at the top:
- **Total Leads** (all time / this month)
- **Fresh Leads Today**
- **Site Visits Today**
- **Deals Closed (This Month)** with total value in ₹
- **Missed Calls (Today)**

Charts:
- **Leads by Stage** — Horizontal bar chart.
- **Agent Performance** — Leads handled, calls made, site visits done, deals closed per agent.
- **Lead Source Breakdown** — Pie chart (99acres vs Magicbricks vs Meta Ads vs Direct vs Helpline).

#### F18: Agent Personal Dashboard
- My open leads count by stage.
- My follow-ups due today.
- My site visits today.
- My calls today (inbound + outbound).

---

### 4.7 Automated Lead Capture (Integration)

#### F19: Portal Webhooks / Email Parsing
- Automatically capture leads from 99acres, Magicbricks, Housing.com, and Meta Ads.
- Leads flow directly into the CRM in the "New" stage and are either assigned round-robin or marked "Unassigned" based on agency settings.

#### F20: Gamified Lead Distribution ("Shark Tank" Mode)
- Optional distribution mode: When a new inbound lead or webhook arrives, broadcast a "flash notification" to all active agents.
- First agent to click "Claim" gets ownership of the lead, fostering healthy competition.

#### F21: Notification Center & Reminders
- Push notifications / UI alerts for agents: "You have 3 follow-ups overdue today!" or "You haven't contacted Vikram in 48 hours."
- Auto-alerts to admin when a lead sits in "New" unassigned for > 1 hour.

---

### 4.8 Deals & Finance

#### F21: Brokerage / Commission Tracking
- When a deal is marked "Won", track property value, commission percentage (e.g., 2%), and total brokerage owed.
- Track invoice status (Pending/Paid) and agent commission split.

---

### 4.9 Smart Inventory Sharing & Documents

#### F22: Generate WhatsApp Brochure
- Generate a clean, mobile-friendly link or PDF summary of a property (photos + specs) directly from the property card to send via WhatsApp.

#### F23: Document Management (KYC)
- Securely upload and store PDFs/images of Aadhar cards, PAN cards, and booking forms in the Lead Detail Drawer under a "Documents" tab.

---

### 4.10 Audit & Activity Logs

#### F24: Lead Activity Timeline
Every lead has an immutable chronological log:
- `LEAD_CREATED` — Source, timestamp
- `ASSIGNED` — From → To agent
- `STAGE_CHANGED` — Old stage → New stage
- `NOTE_ADDED` — Free-text note by agent
- `CALL_LOGGED` — Direction, duration, disposition, recording link
- `WHATSAPP_SENT` — Template used
- `SITE_VISIT_SCHEDULED` — Property, date, agent
- `SITE_VISIT_FEEDBACK` — Outcome logged
- `REASSIGNED` — Old owner → New owner (admin action)

---

## 5. User Roles & Permissions

| Capability | Admin / Owner | Sales Agent |
|:---|:---:|:---:|
| View all leads | ✅ | ✅ (read-only for others' leads) |
| Add new leads | ✅ | ✅ |
| Edit any lead | ✅ | Own leads only |
| Delete leads | ✅ | ❌ |
| Assign / Reassign leads | ✅ | ❌ |
| Add properties | ✅ | ❌ |
| Edit properties | ✅ | ❌ |
| View properties | ✅ | ✅ |
| View team analytics | ✅ | Own stats only |
| Manage employees | ✅ | ❌ |
| Telephony settings | ✅ | ❌ |

---

## 6. Data Models

### 6.1 Employee
| Field | Type | Notes |
|:---|:---|:---|
| id | string | Unique ID (e.g. `emp_01`) |
| name | string | Full name |
| email | string | Login email |
| phone | string | Personal mobile (for call routing) |
| role | enum | `admin` \| `agent` |
| avatarColor | string | Hex color for UI badge (e.g. `#3B82F6`) |
| status | enum | `active` \| `inactive` |

### 6.2 Lead
| Field | Type | Notes |
|:---|:---|:---|
| id | string | Unique ID |
| name | string | Customer name |
| phone | string | Primary contact number |
| email | string | Optional |
| source | enum | `99acres` \| `magicbricks` \| `housing` \| `meta_ads` \| `direct_call` \| `walk_in` \| `whatsapp` \| `helpline_call` \| `referral` |
| assignedTo | string \| null | Employee ID or null (unassigned) |
| stage | enum | One of 9 pipeline stages |
| priority | enum | `hot` \| `warm` \| `cold` |
| requirements | object | `{ propertyType, bhk, budgetMinLakhs, budgetMaxLakhs, preferredLocalities[], possessionStatus }` |
| notes | array | `[{ text, addedBy, timestamp }]` |
| nextFollowUp | datetime | Next follow-up date/time |
| createdAt | datetime | Auto-set on creation |
| updatedAt | datetime | Auto-set on any edit |

### 6.3 Deal / Commission
| Field | Type | Notes |
|:---|:---|:---|
| id | string | Unique ID |
| leadId | string | Associated closed lead |
| propertyId | string | Associated property sold |
| totalDealValueLakhs | number | Final closing price |
| brokeragePercentage | number | e.g. 2.0 |
| brokerageAmount | number | Calculated total brokerage |
| agentSplitPercentage | number | Agent's cut |
| status | enum | `pending_invoice` \| `invoiced` \| `paid` |

### 6.3 Property
| Field | Type | Notes |
|:---|:---|:---|
| id | string | Unique ID |
| name | string | Project/property name |
| builder | string | Developer name |
| type | enum | `apartment` \| `villa` \| `plot` \| `builder_floor` \| `penthouse` \| `office` \| `shop` \| `commercial_land` \| `warehouse` |
| bhk | string | e.g. "3 BHK" |
| areaSqFt | number | Area in square feet |
| priceLakhs | number | Price in Lakhs (e.g. 85 = ₹85 L) |
| locality | string | Area/sector name |
| city | string | City name |
| status | enum | `ready_to_move` \| `under_construction` \| `resale` \| `new_launch` \| `pre_launch` |
| reraNumber | string | Optional RERA registration |
| imageUrl | string | Property photo URL |

### 6.4 Call Log
| Field | Type | Notes |
|:---|:---|:---|
| id | string | Unique ID |
| leadId | string | Associated lead |
| agentId | string | Agent who handled the call |
| direction | enum | `inbound` \| `outbound` |
| virtualNumber | string | Company helpline number used |
| callerNumber | string | Customer's phone number |
| status | enum | `answered` \| `missed` \| `busy` |
| durationSeconds | number | Call length |
| recordingUrl | string | Audio recording link |
| timestamp | datetime | When the call happened |

### 6.5 Site Visit
| Field | Type | Notes |
|:---|:---|:---|
| id | string | Unique ID |
| leadId | string | Customer lead |
| propertyId | string | Property to visit |
| agentId | string | Agent conducting the visit |
| scheduledDate | datetime | Visit date & time |
| status | enum | `scheduled` \| `completed` \| `cancelled` |
| feedback | enum \| null | `interested` \| `show_alternatives` \| `price_issue` \| `not_interested` |
| feedbackNotes | string | Agent's free-text notes |

### 6.6 Activity Log
| Field | Type | Notes |
|:---|:---|:---|
| id | string | Unique ID |
| leadId | string | Associated lead |
| performedBy | string | Employee ID who performed the action |
| action | enum | `LEAD_CREATED` \| `ASSIGNED` \| `REASSIGNED` \| `STAGE_CHANGED` \| `NOTE_ADDED` \| `CALL_LOGGED` \| `WHATSAPP_SENT` \| `SITE_VISIT_SCHEDULED` \| `SITE_VISIT_FEEDBACK` |
| details | string | Human-readable description |
| timestamp | datetime | When the action occurred |

---

## 7. Screen Inventory

| # | Screen | Primary User | Key Elements |
|:---|:---|:---|:---|
| 1 | **Login / Agent Selector** | All | Agent avatar selection (for demo: no password needed) |
| 2 | **Dashboard** | Admin / Agent | KPI cards, charts, today's agenda |
| 3 | **Leads — Kanban View** | All | Drag-and-drop pipeline board with owner badges |
| 4 | **Leads — Table View** | All | Sortable/filterable table with owner column |
| 5 | **Lead Detail Drawer** | All | Requirements, timeline, quick actions (Call, WhatsApp, Visit) |
| 6 | **Add / Edit Lead Modal** | All | Form with Indian-specific fields |
| 7 | **Property Inventory** | All | Card grid of available properties |
| 8 | **Add / Edit Property Modal** | Admin | Property form with ₹ Lakhs pricing |
| 9 | **Site Visit Calendar** | All | Weekly agenda, color-coded by agent |
| 10 | **Telephony Panel** | All | Call logs, missed calls queue, click-to-call dialer |
| 11 | **Team Management** | Admin | Add/edit employees, set colors, activate/deactivate |
| 12 | **Settings** | Admin | Company name, helpline number, WhatsApp templates |

---

## 8. Indian-Specific Formatting Rules

| Element | Format | Examples |
|:---|:---|:---|
| Currency | ₹ with Lakhs (L) / Crores (Cr) | ₹45 L, ₹1.25 Cr, ₹8.5 Cr |
| Phone Numbers | +91 prefixed, space-separated groups | +91 98765 43210 |
| Area | Sq. Ft. (default), Gaj, Bigha, Marla, Cents | 1,250 sq. ft., 150 Gaj |
| Date | DD MMM YYYY | 05 Sep 2026 |
| Time | 12-hour with AM/PM | 11:30 AM |
| BHK | Number + BHK suffix | 1 RK, 2 BHK, 3.5 BHK |
| RERA | State prefix + number | RERA-KA-2026-001234 |

---

## 9. Non-Functional Requirements

| Requirement | Target |
|:---|:---|
| **First Load** | < 2 seconds on 4G (Mobile-first optimization) |
| **Responsiveness** | Strict mobile-first. No horizontal scroll (except data tables). Bottom nav on mobile, sidebar on desktop. |
| **Interaction Quality** | Native feel: interruptible CSS transitions, touch targets ≥44px, bounce physics for dragging. |
| **Data Persistence** | LocalStorage (MVP); upgrade path to Firebase/Supabase |
| **Offline Tolerance** | Read-only access to cached leads when offline |
| **Browser Support** | Chrome (Android + Desktop), Safari (iOS) |
| **Concurrent Users** | 2–4 simultaneous users |

---

## 10. Release Plan

### Phase 1 — MVP (Build Now)
- [x] Lead CRUD with ownership assignment
- [x] Kanban board with drag-and-drop
- [x] Table view with owner filtering (My / All / Unassigned)
- [x] Lead detail drawer with activity timeline
- [x] Property inventory (Add/View/Match)
- [x] WhatsApp one-tap with templates
- [x] Click-to-Call simulation & call logging
- [x] Site visit scheduling & calendar
- [x] Dashboard with KPI cards
- [x] Agent selector / login simulation
- [x] Indian currency & formatting throughout

### Phase 2 — Enhancements (Future)
- [ ] Real telephony API integration (Exotel / MyOperator webhooks)
- [ ] 99acres / Magicbricks lead import via email parsing
- [ ] Push notifications for follow-up reminders
- [ ] Brokerage / commission tracker per deal
- [ ] PDF agreement & receipt generation
- [ ] Multi-branch support (for agencies expanding to 2+ offices)
- [ ] WhatsApp Business API integration (send messages from CRM directly)

### Phase 3 — Scale (Future)
- [ ] Backend API (Node.js / Express + PostgreSQL)
- [ ] User authentication (email + OTP login)
- [ ] Role-based access control with JWT
- [ ] Automated lead scoring (AI-based priority)
- [ ] Customer portal (buyers can track their property shortlist)

---

## 11. Success Metrics

| Metric | Target |
|:---|:---|
| Time to answer "whose lead is this?" | < 1 second (visual badge scan) |
| Leads with no owner after 1 hour | 0% (auto-alert on unassigned) |
| Missed helpline calls without follow-up | 0% (auto-created as lead) |
| Agent adoption (daily active use) | 100% of team within 1 week |
| Average lead response time | < 15 minutes (from lead creation to first contact) |

---

*This document serves as the single source of truth for building PropDesk CRM. All features, data models, and screens described here should be implemented in Phase 1 unless explicitly marked as Phase 2 or Phase 3.*
