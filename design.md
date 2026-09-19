# DESIGN.md — PropDesk CRM
## Visual System & Design Specification

**Mode:** Operate — the user completes a task. Scanability, consistency, and native expectations outrank expression.  
**Product Type:** CRM & Client Management (Row 101 — colors.csv)  
**Style:** Minimalism & Swiss + Glassmorphism touches (Rows 1 & 3 — styles.csv)  
**Typography:** Minimal Swiss — Inter (Row 5 — typography.csv)  
**Target:** Web (Desktop + Mobile responsive, agents on-field)

---

## 1. Color System

### 1.1 Semantic Color Tokens (Light Mode — Default)

Sourced from **CRM & Client Management** product palette (Row 101) with real estate adjustments.

```css
:root {
  /* ── Brand ── */
  --color-primary:          #2563EB;   /* Professional blue — trust, reliability */
  --color-primary-hover:    #1D4ED8;
  --color-primary-active:   #1E40AF;
  --color-on-primary:       #FFFFFF;

  --color-secondary:        #3B82F6;   /* Lighter blue for secondary surfaces */
  --color-on-secondary:     #000000;

  --color-accent:           #059669;   /* Emerald green — deal closed, success, CTA */
  --color-accent-hover:     #047857;
  --color-on-accent:        #000000;

  /* ── Surfaces ── */
  --color-bg:               #F8FAFC;   /* App background */
  --color-fg:               #0F172A;   /* Primary text */

  --color-card:             #FFFFFF;   /* Card / panel surface */
  --color-card-fg:          #0F172A;

  --color-muted:            #F1F5FD;   /* Subtle backgrounds, hover rows */
  --color-muted-fg:         #475569;   /* Secondary text, labels, timestamps */

  --color-border:           #E4ECFC;   /* Default borders */
  --color-border-strong:    #CBD5E1;   /* Dividers, separators */

  /* ── Feedback ── */
  --color-destructive:      #DC2626;   /* Delete, lost lead, errors */
  --color-on-destructive:   #FFFFFF;
  --color-warning:          #F59E0B;   /* Amber — follow-up overdue, site visit today */
  --color-success:          #10B981;   /* Deal closed, call connected */

  /* ── Focus / Ring ── */
  --color-ring:             #2563EB;
  --color-ring-offset:      #FFFFFF;
}
```

### 1.2 Dark Mode Tokens

```css
[data-theme="dark"] {
  --color-bg:               #0F172A;
  --color-fg:               #F8FAFC;
  --color-card:             #1E293B;
  --color-card-fg:          #F8FAFC;
  --color-muted:            #1A2332;
  --color-muted-fg:         #94A3B8;
  --color-border:           #334155;
  --color-border-strong:    #475569;
  --color-ring-offset:      #0F172A;
}
```

### 1.3 Lead Pipeline Stage Colors

| Stage | Hex | CSS Variable |
|:---|:---|:---|
| New / Fresh | `#3B82F6` | `--stage-new` |
| Contacted | `#8B5CF6` | `--stage-contacted` |
| Requirement Gathered | `#6366F1` | `--stage-requirement` |
| Property Shared | `#0EA5E9` | `--stage-shared` |
| Site Visit Scheduled | `#F59E0B` | `--stage-visit-scheduled` |
| Site Visit Done | `#F97316` | `--stage-visit-done` |
| Negotiation | `#EC4899` | `--stage-negotiation` |
| Booked / Won | `#10B981` | `--stage-won` |
| Lost / Cold | `#EF4444` | `--stage-lost` |

### 1.4 Lead Priority Colors

| Priority | Badge BG | Badge Text | Emoji |
|:---|:---|:---|:---|
| 🔥 Hot | `#FEF2F2` | `#DC2626` | 🔥 |
| 🟡 Warm | `#FFFBEB` | `#D97706` | 🟡 |
| 🔵 Cold | `#EFF6FF` | `#2563EB` | 🔵 |

### 1.5 Agent Identity Colors (3 Agents)

Each agent gets a distinct hue for instant visual scanning.

| Agent | Avatar BG | Avatar Text | Badge Outline |
|:---|:---|:---|:---|
| Rohan (Agent 1) | `#DBEAFE` | `#1E40AF` | `#3B82F6` |
| Priya (Agent 2) | `#D1FAE5` | `#065F46` | `#10B981` |
| Amit (Agent 3) | `#EDE9FE` | `#5B21B6` | `#8B5CF6` |
| Unassigned | `#F1F5F9` | `#64748B` | `#CBD5E1` |

### 1.6 Lead Source Colors

| Source | Color | Icon |
|:---|:---|:---|
| 99acres | `#E11D48` | 🏠 |
| Magicbricks | `#7C3AED` | 🧱 |
| Housing.com | `#0891B2` | 🏡 |
| Meta Ads | `#2563EB` | 📱 |
| Direct Call | `#059669` | 📞 |
| Central Helpline | `#F59E0B` | ☎️ |
| Walk-in | `#64748B` | 🚶 |
| WhatsApp | `#22C55E` | 💬 |
| Referral | `#EC4899` | 🤝 |

---

## 2. Typography

### 2.1 Font Stack

**Pairing:** Minimal Swiss (Row 5, typography.csv)  
**Rationale:** Inter is the neutral workhorse for dashboards, admin panels, and enterprise apps. Single font family with weight variations for ultimate simplicity and data readability.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --font-mono: 'SF Mono', 'Cascadia Code', 'Fira Code', ui-monospace, monospace;
}
```

### 2.2 Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|:---|:---|:---|:---|:---|:---|
| `--text-display` | 32px | 700 | 1.1 | -0.5px | Dashboard hero stats (₹1.25 Cr) |
| `--text-h1` | 24px | 700 | 1.2 | -0.3px | Page titles |
| `--text-h2` | 20px | 600 | 1.3 | -0.2px | Section headers, modal titles |
| `--text-h3` | 16px | 600 | 1.4 | 0px | Card titles, column headers |
| `--text-body` | 14px | 400 | 1.5 | 0px | Default body, table cells |
| `--text-body-sm` | 13px | 400 | 1.5 | 0px | Secondary info, descriptions |
| `--text-caption` | 12px | 500 | 1.4 | 0.2px | Timestamps, labels, meta |
| `--text-badge` | 11px | 600 | 1 | 0.3px | Badges, tags, stage chips |
| `--text-mono` | 13px | 400 | 1.4 | 0px | Phone numbers, IDs, RERA |

### 2.3 Typography Rules

- **Body minimum:** 14px (never below 12px for any visible text)
- **Line length:** max `65ch` for descriptions, unconstrained for data tables
- **Tabular numbers:** `font-variant-numeric: tabular-nums` on all currency, counts, phone numbers
- **₹ Currency:** Use `tabular-nums` with proper Lakh/Crore formatting: `₹45 L`, `₹1.25 Cr`

---

## 3. Spacing & Layout

### 3.1 Spacing Scale (4px base)

```css
:root {
  --space-0:  0px;
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

### 3.2 Layout Tokens

```css
:root {
  --sidebar-width:       240px;
  --sidebar-collapsed:   64px;
  --header-height:       56px;
  --card-padding:        16px;
  --card-gap:            12px;
  --border-radius-sm:    6px;
  --border-radius-md:    8px;
  --border-radius-lg:    12px;
  --border-radius-xl:    16px;
  --border-radius-full:  9999px;
}
```

### 3.3 Grid System

- **Dashboard:** CSS Grid, `repeat(auto-fit, minmax(260px, 1fr))`, gap `16px`
- **Kanban Board:** `display: flex; overflow-x: auto;` with fixed column widths `280px`
- **Table View:** Full-width with sticky header, `min-width: 900px` with horizontal scroll on mobile
- **Mobile breakpoint:** `768px` — sidebar collapses, Kanban stacks vertically

### 3.4 Responsive Layout Strategy

- **Desktop (≥ 768px):** Left sidebar navigation, slide-out drawer from the right.
- **Mobile (< 768px):** Sidebar converts to fixed Bottom Navigation (max 5 items). Slide-out drawers convert to bottom-up Sheets (BottomSheet pattern) with momentum swipe-to-dismiss.

```css
/* Mobile first */
--bp-sm:   640px;   /* Large phone */
--bp-md:   768px;   /* Tablet — sidebar collapses, layout switches */
--bp-lg:   1024px;  /* Small desktop */
--bp-xl:   1280px;  /* Desktop — full layout */
```

---

## 4. Elevation & Depth

### 4.1 Shadow Scale

```css
:root {
  --shadow-xs:  0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm:  0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md:  0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-lg:  0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  --shadow-xl:  0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);
}
```

### 4.2 Surface Hierarchy

| Layer | Shadow | Use |
|:---|:---|:---|
| **Base** | None | App background |
| **Card** | `--shadow-xs` | Lead cards, KPI cards, property cards |
| **Raised** | `--shadow-sm` | Kanban columns, table container |
| **Overlay** | `--shadow-lg` | Dropdowns, tooltips, popovers |
| **Modal** | `--shadow-xl` | Lead detail drawer, add/edit modals |

### 4.3 Glassmorphism (Selective Use)

Applied only to overlays and navigation header for a modern touch without accessibility risk.

```css
.glass-surface {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

[data-theme="dark"] .glass-surface {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

---

## 5. Component Specifications

### 5.1 Lead Card (Kanban)

```
┌─────────────────────────────────┐
│  [🔥 Hot]  [99acres]           │  ← Priority badge + Source chip
│                                 │
│  Vikram Malhotra                │  ← text-h3, 600 weight
│  3 BHK · Whitefield            │  ← text-body-sm, muted-fg
│  ₹80 L – ₹1.2 Cr              │  ← text-body, tabular-nums
│                                 │
│  ┌──────┐  Assigned to          │
│  │  RV  │  Rohan Verma         │  ← Agent avatar (2-letter initials)
│  └──────┘  Follow-up: Tomorrow  │     with agent-color background
│                                 │
│  [📞 Call]  [💬 WhatsApp]       │  ← Quick action buttons
└─────────────────────────────────┘
```

- **Card size:** `280px` wide, variable height
- **Corner radius:** `--border-radius-lg` (12px)
- **Shadow:** `--shadow-xs`, hover → `--shadow-md` (200ms ease-out)
- **Agent badge:** 32px circle with 2-letter initials, agent-specific background color
- **Drag handle:** Left edge, `4px` colored stripe matching stage color

### 5.2 Lead Table Row

```
┌──────┬─────────────────┬───────────┬──────────────┬─────────┬────────────┬────────────┐
│  ●   │ Name            │ Phone     │ Stage        │ Budget  │ Assigned   │ Follow-up  │
├──────┼─────────────────┼───────────┼──────────────┼─────────┼────────────┼────────────┤
│  🔥  │ Vikram Malhotra │ 98123...  │ ▌Site Visit  │ ₹80L-   │ [RV] Rohan │ Tomorrow   │
│      │ 3BHK Whitefield │           │  Scheduled   │  1.2Cr  │            │            │
└──────┴─────────────────┴───────────┴──────────────┴─────────┴────────────┴────────────┘
```

- **Row height:** `56px` minimum
- **Hover:** `--color-muted` background (150ms)
- **Stage column:** Left-border `3px` in stage color + text
- **Assigned column:** Agent avatar chip (initials + name) in agent color
- **Sortable columns:** Name, Budget, Stage, Follow-up date
- **Filterable:** Owner, Stage, Priority, Source, BHK

### 5.3 KPI Dashboard Card

```
┌─────────────────────────┐
│  Total Leads             │  ← text-caption, muted-fg, uppercase
│                          │
│  247                     │  ← text-display, 700 weight, primary color
│  ↑ 12% from last month  │  ← text-caption, success green (or destructive red)
└─────────────────────────┘
```

- **Min width:** `220px`
- **Padding:** `--space-5`
- **Border-top:** `3px solid` accent color for each card type
- **Animation:** Count-up on page load (200ms duration)

### 5.4 Agent Switcher (Header)

```
┌──────────────────────────────────────────────────────────────────┐
│  [PropDesk Logo]   │ Leads │ Properties │ Visits │   [RV ▾]     │
│  ☎️ +91 80 6900 1234 (Helpline)                    Rohan Verma  │
└──────────────────────────────────────────────────────────────────┘
```

- **Header height:** `56px`
- **Agent dropdown:** Shows current agent avatar + name; click to switch agent view
- **Helpline number:** Prominent display with copy-to-clipboard icon

### 5.5 Lead Detail Drawer

- **Width:** `480px` on desktop, full-screen on mobile
- **Slide-in:** Right side, 300ms ease-out
- **Backdrop:** `rgba(0, 0, 0, 0.4)`, click to close
- **Sections (tabbed):**
  1. **Overview** — Requirements, budget, BHK, localities, stage selector
  2. **Timeline** — Chronological activity log with icons
  3. **Calls** — Call recordings list with inline audio player
  4. **Matching** — Suggested properties matching lead preferences

### 5.6 Quick Action Buttons

| Action | Icon | Color | Behavior |
|:---|:---|:---|:---|
| Call | 📞 | `--color-primary` | Click-to-Call modal / `tel:` link on mobile |
| WhatsApp | 💬 | `#22C55E` | Opens `wa.me/91XXX` with template selector |
| Schedule Visit | 📅 | `--color-warning` | Date/time/property picker modal |
| Add Note | ✏️ | `--color-muted-fg` | Inline text input expansion |

- **Button size:** `36px` height, `--border-radius-md`
- **Touch target:** `44px` minimum (UX guideline Row 22)
- **Hover:** Slight background tint (150ms)

---

## 6. Motion & Animation

### 6.1 Timing Tokens

```css
:root {
  --duration-instant:  100ms;   /* Button press, toggle */
  --duration-fast:     150ms;   /* Hover, focus ring */
  --duration-normal:   200ms;   /* Dropdown open, card hover lift */
  --duration-moderate: 300ms;   /* Drawer slide, modal appear */
  --duration-slow:     500ms;   /* Page transitions (rare) */

  --ease-out:          cubic-bezier(0.16, 1, 0.3, 1);   /* Decelerate — entering */
  --ease-in:           cubic-bezier(0.7, 0, 0.84, 0);   /* Accelerate — exiting */
  --ease-in-out:       cubic-bezier(0.87, 0, 0.13, 1);  /* Symmetric — layout */
  --ease-spring:       cubic-bezier(0.34, 1.56, 0.64, 1); /* Overshoot — playful */
}
```

### 6.2 Animation Inventory

| Element | Trigger | Duration | Easing | Property |
|:---|:---|:---|:---|:---|
| Card hover lift | `mouseenter` | 200ms | `ease-out` | `transform: translateY(-2px)`, `box-shadow` |
| Stage chip | State change | 150ms | `ease-out` | `background-color`, `color` |
| Drawer slide-in | Open | 300ms | `ease-out` | `transform: translateX(0)` |
| Drawer slide-out | Close | 200ms | `ease-in` | `transform: translateX(100%)` |
| Modal backdrop | Open | 200ms | `ease-out` | `opacity: 0 → 1` |
| KPI count-up | Page load | 800ms | `ease-out` | JavaScript counter |
| Kanban drag | Drag start | 150ms | `ease-spring` | `transform: scale(1.02)`, `box-shadow` |
| Row highlight | Hover | 150ms | `ease-out` | `background-color` |
| Toast enter | Show | 300ms | `ease-spring` | `transform: translateY(0)` from below |
| Toast exit | Auto-dismiss | 200ms | `ease-in` | `opacity: 0`, `transform: translateY(8px)` |

### 6.3 Mobile & Touch Interaction Guidelines

- **No False Hovers:** Touch devices trigger hover on tap, causing sticky hover states. ALL hover animations must be gated behind `@media (hover: hover) and (pointer: fine)`.
- **Interruptible Physics:** Use CSS transitions instead of keyframes so that if a user taps a button rapidly or swipes mid-animation, the UI smoothly reverses instead of jumping.
- **Button Press Feedback:** Ensure `transform: scale(0.97)` on `:active` for all pressable elements to provide instant tactile feedback on touchscreens.

### 6.4 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Accessibility Checklist

Based on UX guidelines (ux-guidelines.csv) priority order:

| # | Check | Standard | Status |
|:---|:---|:---|:---|
| 1 | Text contrast ≥ 4.5:1 (body), ≥ 3:1 (large text) | WCAG 2.1 AA | Required |
| 2 | All interactive elements have `aria-label` if icon-only | WCAG 2.1 AA | Required |
| 3 | Full keyboard navigation: Tab, Enter, Escape, Arrow keys | WCAG 2.1 AA | Required |
| 4 | Visible `:focus-visible` ring (`3px solid`, `--color-ring`) | WCAG 2.2 AA | Required |
| 5 | Touch targets ≥ 44px on mobile, ≥ 24px CSS on web | WCAG 2.2 AA | Required |
| 6 | `prefers-reduced-motion` respected | WCAG 2.1 AA | Required |
| 7 | Form labels visible (no placeholder-only inputs) | WCAG 2.1 AA | Required |
| 8 | Error messages near field + `role="alert"` | WCAG 2.1 AA | Required |
| 9 | Stage/priority never communicated by color alone | WCAG 2.1 AA | Required |
| 10 | Semantic HTML (`<nav>`, `<main>`, `<aside>`, `<table>`) | WCAG 2.1 AA | Required |

---

## 8. Library Picks (Curated)

Based on the **pick-ui-library** skill:

| Task | Library | Reason |
|:---|:---|:---|
| **State management** | **Zustand** | Lightweight, no boilerplate — perfect for 2-3 agent lead state, filters, active view. Replaces prop-drilling across Kanban/Table/Drawer. |
| **Drag and drop** (Kanban) | **dnd kit** | Accessible, keyboard-friendly DnD for pipeline stage reordering. |
| **Charts** (Dashboard) | **Recharts** | Static bar/pie charts for lead-by-stage, source breakdown, agent performance. |
| **Toasts / Notifications** | **Sonner** | Lead assigned, call logged, site visit reminder — auto-dismiss, stacking. |
| **Unstyled UI primitives** | **Base UI** | Dialogs (lead detail modal), Select dropdowns (stage/agent/BHK filters), Popovers (WhatsApp template picker). Handles accessibility, focus trapping, dismissal. |
| **Animated numbers** | **NumberFlow** | KPI counter animations (₹1.25 Cr, 247 leads) — proper digit transitions. |
| **Conditional classNames** | **clsx** | Toggle active nav, stage colors, priority badges. |
| **General animation** | **Motion (Framer Motion)** | Drawer slide-in/out, card drag scaling, layout animations. Only used for gestures and exit animations — plain CSS for hovers/fades. |

### Libraries NOT Needed

| Task | Why Skip |
|:---|:---|
| Virtualization (Virtuoso) | Max ~500 leads for a 2–3 person team. No virtualization needed. |
| Command palette (cmdk) | Small team, no keyboard-power-user workflows at this scale. |
| Theme switching (next-themes) | Vanilla CSS `[data-theme]` toggle is sufficient without Next.js. |
| CVA (variant styling) | No complex component library — clsx handles our conditional classes. |

---

## 9. Iconography

- **System:** Inline SVG icons (Lucide icon set — open-source, consistent 24px grid, 1.5px stroke)
- **Agent avatars:** 2-letter initials on colored circles (no photo uploads in MVP)
- **Lead source icons:** Emoji shorthand for quick visual recognition (see Section 1.6)
- **No emoji as functional icons** — emoji for decoration/source labels only; all interactive buttons use SVG

---

## 10. Indian Formatting Specifications

### 10.1 Currency Display

```javascript
function formatINR(lakhs) {
  if (lakhs >= 100) {
    return `₹${(lakhs / 100).toFixed(lakhs % 100 === 0 ? 0 : 2)} Cr`;
  }
  return `₹${lakhs} L`;
}
// formatINR(45)   → "₹45 L"
// formatINR(125)  → "₹1.25 Cr"
// formatINR(850)  → "₹8.5 Cr"
```

### 10.2 Phone Number Display

```
+91 98765 43210   (stored: +919876543210)
```

### 10.3 Date / Time

```
05 Sep 2026, 11:30 AM   (Intl.DateTimeFormat 'en-IN')
"Tomorrow"  |  "2 hours ago"  (relative for recent activity)
```

### 10.4 Area Units

```
1,250 sq. ft.   (default)
150 Gaj  |  2.5 Bigha  |  5 Cents   (regional toggle)
```

---

## 11. Screen-by-Screen Layout Specs

### 11.1 App Shell

```
┌──────────────────────────────────────────────────────────┐
│  HEADER (56px) — Logo, Nav tabs, Helpline badge, Agent ▾ │
├────────────┬─────────────────────────────────────────────┤
│            │                                             │
│  SIDEBAR   │  MAIN CONTENT AREA                         │
│  (240px)   │                                             │
│  Filters   │  Dashboard / Kanban / Table / Calendar /    │
│  Quick     │  Properties / Telephony                     │
│  Nav       │                                             │
│            │                                             │
│  Collapses │                                             │
│  on mobile │                                             │
│            │                                             │
├────────────┴─────────────────────────────────────────────┤
│  (Mobile only) BOTTOM NAV — 5 icons max                  │
└──────────────────────────────────────────────────────────┘
```

### 11.2 Dashboard

```
┌─────────┬─────────┬─────────┬─────────┬─────────┐
│ Total   │ Fresh   │ Site    │ Closed  │ Missed  │  ← KPI cards row
│ Leads   │ Today   │ Visits  │ Deals   │ Calls   │     (auto-fit grid)
│  247    │   8     │   3     │  ₹2.5Cr │   2     │
└─────────┴─────────┴─────────┴─────────┴─────────┘
┌─────────────────────────┬───────────────────────┐
│  Leads by Stage         │  Source Breakdown      │  ← Charts row
│  (Horizontal bar)       │  (Pie/Donut)           │
├─────────────────────────┼───────────────────────┤
│  Agent Performance      │  Today's Follow-ups    │  ← Bottom row
│  (Bar chart)            │  (List)                │
└─────────────────────────┴───────────────────────┘
```

### 11.3 Kanban Board

```
┌── My Leads ── ── All Leads ── ── Unassigned ── ── [+ Add Lead] ──┐
│                                                                    │
│ ┌─ New (5) ──┐ ┌─ Contacted ─┐ ┌─ Site Visit ┐ ┌─ Booked ──┐   │
│ │ [Card]     │ │ [Card]      │ │ [Card]      │ │ [Card]    │   │
│ │ [Card]     │ │ [Card]      │ │             │ │           │   │
│ │ [Card]     │ │             │ │             │ │           │   │
│ │            │ │             │ │             │ │           │   │
│ └────────────┘ └─────────────┘ └─────────────┘ └───────────┘   │
│  ← Horizontally scrollable on mobile →                          │
└────────────────────────────────────────────────────────────────────┘
```

---

## 12. Design Principles Checklist

Before shipping any screen, verify:

- [ ] **Ownership answer in < 1 second** — Agent badge is prominent on every lead representation
- [ ] **Indian formatting correct** — ₹ Lakhs/Crores, +91 phone format, DD MMM YYYY dates
- [ ] **Touch targets ≥ 44px** on mobile for all interactive elements
- [ ] **No color-only indicators** — Every status has text label + icon alongside color
- [ ] **Focus ring visible** on keyboard navigation
- [ ] **Glassmorphism readable** — Text on glass surfaces passes 4.5:1 contrast
- [ ] **WhatsApp opens correctly** — `wa.me` link works without saving contact
- [ ] **Call-to-action hierarchy** — Primary (filled), Secondary (outlined), Tertiary (ghost)
- [ ] **Empty states helpful** — "No leads yet. Add your first lead →"
- [ ] **Loading states present** — Skeleton screens for data-fetching views

---

*This document is the single visual source of truth for PropDesk CRM. All colors, spacing, typography, and component specs defined here should be implemented exactly as specified.*
