# Skyline OMS — UI Guidelines

## 1. Product Direction
The UI should feel like a clean, modern internal business system:
- fast to scan
- low visual noise
- high data density without feeling cramped
- optimized for desktop first
- responsive enough for tablet use

Tech stack:
- Laravel + Inertia + React + Tailwind
- reusable components
- module-based page structure

## 2. Layout
### App Shell
- Left sidebar for primary navigation
- Top bar for page title, breadcrumbs, search, user menu
- Main content area with consistent page padding
- Sticky page header on complex list/detail screens when helpful

### Sidebar Navigation
Recommended sections:
- Dashboard
- Sales
- Purchases
- Inventory
- Customers
- Suppliers
- Payments
- Cheques
- Employees
- Reports
- Settings

Rules:
- keep icons simple
- show active route clearly
- support collapsible groups
- role-based menu visibility

## 3. Page Patterns
### List Pages
Each module list page should have:
- page title
- short subtitle or purpose line
- primary CTA on top right
- filter bar
- data table
- pagination
- row actions menu

### Create/Edit Pages
Should use:
- sectioned forms
- sticky save/cancel action bar on long forms
- inline validation
- clear required field indicators
- read-only summary panels for calculated values

### Detail Pages
Should contain:
- header summary card
- status badges
- timeline / audit snippets where useful
- tabs or sections for related data
- actions grouped by business process

## 4. Visual Style
### Colors
Use a restrained business palette:
- Primary: Indigo / Slate-based tone
- Success: Green
- Warning: Amber
- Danger: Red
- Info: Blue
- Neutral backgrounds: White / Slate-50 / Gray-50

Guidelines:
- do not overuse bright colors
- use color mainly for status, alerts, emphasis
- most surfaces should remain neutral

### Typography
- Prefer clear sans-serif default stack
- Page title: bold and prominent
- Section title: medium to bold
- Table text: compact but readable
- Secondary info: muted gray tone

### Spacing
- Use consistent spacing scale
- Cards should breathe but not waste space
- Dense operational tables may use tighter row height

## 5. Components
### Core Components
- AppShell
- SidebarNav
- Topbar
- PageHeader
- StatCard
- FilterBar
- DataTable
- StatusBadge
- EmptyState
- ConfirmDialog
- SlideOver / Modal
- FormField
- Select
- DatePicker
- CurrencyInput
- QuantityInput
- Tabs
- SummaryPanel
- AuditTimeline

### Table Design
Tables are central to the app.
Rules:
- sticky headers on long tables
- right-align numeric columns
- show currency consistently
- keep actions in trailing column
- allow sorting and filtering where valuable
- support row click to view details

### Status Badges
Badges must be consistent across modules.

Examples:
- Draft = gray
- Confirmed = blue
- Paid = green
- Partially Paid = amber
- Cancelled = red
- Pending Cheque = purple/amber mix or distinct neutral-accent
- Bounced = red

## 6. Forms and Data Entry UX
### General Rules
- Minimize typing where selections are better
- Use searchable dropdowns for customers, suppliers, products, batches
- Default values where safe
- Auto-calculate totals in real time
- Show calculation breakdowns for high-impact transactions

### Purchase Forms
- allow multiple item rows
- show subtotal, extra costs, landed cost preview
- shipment cost allocation should be understandable
- received quantities should be editable where partial receipts occur

### Sales Forms
- allow multiple item rows
- batch selection must be explicit and visible
- show available quantity by batch
- show batch cost and expected margin while selecting
- payment type should change visible fields dynamically

### Payment Forms
- switch fields based on payment method
- cheque entry requires cheque date, bank, number, amount
- partial allocation should be supported with clear remaining balance display

## 7. Dashboard UX
Dashboard should be scannable in 10 seconds.
Recommended structure:
1. KPI row
2. Alerts / due items
3. Trend charts
4. Operational summary tables

Suggested widgets:
- Sales today / month
- Purchases today / month
- Receivables outstanding
- Payables outstanding
- Cheques due this week
- Low stock products
- Recent activity
- Top customers / products

Rules:
- no chart clutter
- each chart answers one question
- alerts should be visible without scrolling too far

## 8. Reporting UX
- filter-first design
- export buttons near filters
- preserve filters in URL where possible
- show summary totals above report table
- support printing later

## 9. Interaction Rules
- destructive actions require confirmation
- successful saves show toast feedback
- validation errors appear inline and in summary if many
- long-running actions show progress/loading state
- prevent duplicate submissions on save/post actions

## 10. Accessibility & Usability
- keyboard navigable major actions
- visible focus states
- sufficient color contrast
- avoid relying only on color for meaning
- large enough click targets on actions
- date/currency formatting should match business locale

## 11. Mobile / Responsive Strategy
- desktop first
- tablet supported
- mobile fallback for lookup/detail access, not full heavy transaction entry
- on small screens, tables may switch to stacked cards for low-density modules only

## 12. Design Philosophy
The system should feel:
- trustworthy
- operational
- fast
- not trendy for the sake of trend
- built for serious daily business use
