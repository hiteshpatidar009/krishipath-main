# KrishiPath Company Dashboard — Implementation Plan

## Context

Build a complete, production-ready AgriTech SaaS dashboard for KrishiPath — a platform where agricultural companies run farmer-targeted reward campaigns. The user wants 10 fully designed screens with realistic data, charts, and premium UI. The current project is a bare React 19 + Vite 8 + Tailwind CSS v4 app with a single interactive dot-grid component in App.tsx. No design system packages are installed.

---

## Brand System

| Token | Value |
|---|---|
| Primary (Forest Green) | `#2E7D32` |
| Primary Light | `#4CAF50` |
| Primary Dark | `#1B5E20` |
| Secondary (Harvest Gold) | `#F9A825` |
| Background | `#F8FAF5` |
| Surface | `#FFFFFF` |
| Text Primary | `#1A2E1A` |
| Text Secondary | `#6B7B6B` |
| Border | `#E0EBE0` |
| Success | `#43A047` |
| Warning | `#FB8C00` |
| Error | `#E53935` |
| Info | `#039BE5` |

Tokens defined in `src/index.css` using Tailwind v4's `@theme` block.

---

## Packages to Install

```
pnpm add recharts lucide-react react-router-dom
```

---

## File Structure

```
src/
├── App.tsx                              # BrowserRouter + Routes
├── index.css                            # @theme tokens + tailwindcss import
├── data/
│   └── mockData.ts                      # All types + dummy data
├── components/
│   ├── layout/
│   │   ├── Layout.tsx                   # Sidebar + TopBar + <Outlet>
│   │   ├── Sidebar.tsx                  # Left nav, logo, user profile
│   │   └── TopBar.tsx                   # Breadcrumb, search, notification bell
│   ├── ui/
│   │   ├── Button.tsx                   # variant: primary | secondary | ghost | danger
│   │   ├── Badge.tsx                    # status color mapping
│   │   ├── Card.tsx                     # base surface container
│   │   ├── StatCard.tsx                 # KPI tile: icon, value, label, delta
│   │   ├── Table.tsx                    # sortable generic table
│   │   ├── Modal.tsx                    # portal modal with backdrop
│   │   ├── StepIndicator.tsx            # horizontal step progress bar
│   │   ├── EmptyState.tsx              # SVG + heading + CTA
│   │   ├── ProgressBar.tsx             # labeled horizontal bar
│   │   └── Toast.tsx                   # auto-dismiss notification
│   └── screens/
│       ├── Registration/
│       │   ├── Registration.tsx         # 4-step shell
│       │   ├── Step1CompanyInfo.tsx
│       │   ├── Step2KYC.tsx
│       │   └── Step3WalletSetup.tsx
│       ├── Dashboard.tsx
│       ├── Wallet.tsx
│       ├── CampaignBuilder/
│       │   ├── CampaignBuilder.tsx      # 5-step shell
│       │   ├── Step1BasicInfo.tsx
│       │   ├── Step2Content.tsx
│       │   ├── Step3Rewards.tsx
│       │   ├── Step4Targeting.tsx
│       │   └── Step5Review.tsx
│       ├── RewardSettings.tsx
│       ├── FarmerTargeting.tsx
│       ├── CampaignDashboard.tsx
│       ├── Analytics.tsx
│       ├── FarmerLeads.tsx
│       └── Notifications.tsx
```

---

## Router Structure (App.tsx)

```
/register              → <Registration />          (no sidebar)
/                      → <Layout> wrapping:
  /                    → <Dashboard />
  /wallet              → <Wallet />
  /campaigns           → <CampaignDashboard />
  /campaigns/new       → <CampaignBuilder />
  /rewards             → <RewardSettings />
  /targeting           → <FarmerTargeting />
  /analytics           → <Analytics />
  /leads               → <FarmerLeads />
  /notifications       → <Notifications />
```

---

## Mock Data (`src/data/mockData.ts`)

### Campaigns (4 records)
| Name | Status | Reach | Wallet Used |
|---|---|---|---|
| Kharif Season Fertilizer Drive | active | 18,400 | ₹32,000 |
| Pest Control Awareness | active | 12,800 | ₹21,500 |
| Organic Seed Introduction | paused | 9,200 | ₹15,800 |
| Winter Crop Webinar Series | draft | 0 | ₹0 |

### KPI Summary
- Wallet Balance: ₹1,24,500
- Today's Spend: ₹3,420
- Active Campaigns: 6
- Total Reach: 48,230
- Avg ROI: 3.2x
- Callback Requests: 312

### Farmer Leads: 50 records (Maharashtra, Punjab, UP, Karnataka, Rajasthan)
### Wallet: 20 transactions spanning 3 months
### Analytics: 6-month monthly timeseries (Jan–Jun, upward trend, Kharif spike in March–April)
### Notifications: 15 records across campaign/wallet/leads/system categories

---

## Screen Feature Summary

### Registration (`/register`) — no sidebar, centered card
- Step 1: Company Name, Logo Upload, Business Category, Website, GST
- Step 2: Contact Person, Phone (+91), Email, Address, State
- Step 3: Recharge preset cards (₹500/₹1000/₹5000/₹10000) + payment method
- Step 4: Success animation + "Go to Dashboard" CTA

### Dashboard (`/`)
- Row 1: 4 StatCards (Wallet Balance, Today's Spend, Active Campaigns, Total Reach)
- Row 2: 4 StatCards (Video %, Quiz %, Downloads, Callbacks)
- Row 3: AreaChart (6-month reach) + Wallet Pie (spend breakdown)
- Row 4: Recent Campaigns table + Recent Leads list
- Row 5: Quick Action cards

### Wallet (`/wallet`)
- Hero card with large balance + gradient + top-up button
- Top-Up Modal: preset amounts + custom input
- Stats: Total Recharged, Total Spent, Platform Fees
- BarChart: monthly spend by category
- Transaction History Table with debit/credit color coding

### Campaign Builder (`/campaigns/new`)
- Step 1: Name, Goal dropdown, Description, visual goal picker
- Step 2: Video upload zone, PDF upload zone, Quiz builder (add Q, 4 options)
- Step 3: Reward amounts per type (₹), Daily Budget, End Date, Live Cost Estimator panel
- Step 4: State multi-select, District multi-select, Crop checkboxes, Language radio
- Step 5: Full summary, cost breakdown table, Wallet After Launch, Launch CTA

### Reward Settings (`/rewards`)
- 4 cards (Video/Quiz/Brochure/Callback) with amount input + toggle
- Default: Video ₹2, Quiz ₹3, Brochure ₹1, Callback ₹10
- Live estimator sidebar

### Farmer Targeting (`/targeting`)
- Filter panel + estimated audience counter
- Static India map SVG with highlighted states
- Locked "Coming Soon" advanced filters
- Save Segment CTA

### Campaign Dashboard (`/campaigns`)
- Search + Status filter + Date range
- Full table with all campaign fields + status badges
- Row actions: Pause/Resume, Duplicate, View Details, Delete
- New Campaign button

### Analytics (`/analytics`)
- Date range picker (7d/30d/6m/custom)
- 4 KPI StatCards
- AreaChart: reach + spend dual-axis
- BarChart: Video vs Quiz vs Downloads per month
- PieChart: reward spend breakdown
- Top Performing Campaign card
- Top Districts + Top Crops ProgressBar lists

### Farmer Leads (`/leads`)
- Search, Status/State/Crop/Campaign filters, Export CSV
- Stats: Total, Contacted, Converted
- Table with masked phone + reveal button
- Status flow: new → contacted → interested → converted
- Call button (opens tel: link)

### Notifications (`/notifications`)
- Category tabs: All / Campaign / Wallet / Leads / System
- Mark All Read action
- List items: icon, title, message, relative timestamp, unread dot
- Click to mark read

---

## Implementation Order

1. Install packages
2. Update `src/index.css` with `@theme` brand tokens
3. Create `src/data/mockData.ts`
4. Create UI primitives: Button, Badge, Card, StatCard, ProgressBar, StepIndicator, Modal, Toast, EmptyState, Table
5. Create layout: Sidebar, TopBar, Layout
6. Update App.tsx with BrowserRouter + all routes (stub screens first)
7. Build Dashboard (most important screen)
8. Build CampaignDashboard + Wallet + FarmerLeads (core value screens)
9. Build CampaignBuilder multi-step wizard
10. Build Registration multi-step form
11. Build Analytics (recharts heavy)
12. Build Notifications, RewardSettings, FarmerTargeting
13. Wire modals (top-up, delete confirm), add toasts, polish transitions

---

## Key Technical Notes

- **Tailwind v4 @theme:** All design tokens defined in CSS; Tailwind auto-generates `bg-primary`, `text-text-secondary`, etc.
- **recharts:** Wrap all charts in `<ResponsiveContainer width="100%" height={N}>`. Use `linearGradient` defs for AreaChart fills.
- **react-router-dom v7:** Use `<Outlet>` in Layout; `useLocation()` in Sidebar for active route detection.
- **No backend:** All form submissions use `setTimeout`-based fake loading then show success Toast. All data from mockData.ts.
- **Sorting in Table:** Local state `sortKey + sortDir`, pure client-side sort on passed data array.

---

## Verification

1. Navigate to every route via sidebar and confirm each screen renders without errors
2. Click through all 4 Registration steps — verify step indicator updates
3. Click through all 5 Campaign Builder steps — verify cost estimator updates
4. Click top-up in Wallet — modal opens, submit shows success toast
5. Interact with charts (hover tooltips visible)
6. Sort table columns in Farmer Leads
7. Mark notifications as read via click + "Mark All Read"
8. Delete a campaign — confirm modal appears
