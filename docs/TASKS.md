# Skyline OMS — Phased Task Checklist

## Phase 0 — Environment & Project Foundation
- [ ] Confirm local Laravel + Breeze + React environment is stable
- [ ] Confirm Git baseline commit
- [ ] Create docs folder and project rules files
- [ ] Open project in Cursor and index workspace
- [ ] Confirm deployment approach for Hostinger

## Phase 1 — Application Foundation
- [ ] Refine authentication flow
- [ ] Add roles and permissions
- [ ] Add employee management
- [ ] Build app shell: sidebar, topbar, page layout
- [ ] Add route protection and role-aware navigation
- [ ] Add shared UI primitives

## Phase 2 — Master Data
- [ ] Build units of measure
- [ ] Build product categories
- [ ] Build products module
- [ ] Build customers module
- [ ] Build suppliers module
- [ ] Build warehouses module
- [ ] Build payment methods module
- [ ] Build cost types module
- [ ] Build banks module

## Phase 3 — Purchase Orders
- [ ] Define PO numbering
- [ ] Build purchase order listing
- [ ] Build purchase order create/edit
- [ ] Support multiple item lines
- [ ] Add PO statuses
- [ ] Add supplier prepayment logic
- [ ] Add PO detail page
- [ ] Add PO approval flow if required

## Phase 4 — Shipments & Landed Costs
- [ ] Build purchase shipments module
- [ ] Support multiple shipments per PO
- [ ] Support multiple items per shipment
- [ ] Build shipment costs entry
- [ ] Build landed cost allocation by value
- [ ] Build shipment posting / receipt flow
- [ ] Create inventory batches from shipment receipt
- [ ] Build landed cost calculation preview

## Phase 5 — Inventory Core
- [ ] Build inventory batches module
- [ ] Build stock movements log
- [ ] Build stock availability views
- [ ] Build manual batch selection UX
- [ ] Add stock reservation rules
- [ ] Add stock issue rules
- [ ] Add stock adjustment module
- [ ] Add inventory valuation report

## Phase 6 — Sales Orders
- [ ] Define SO numbering
- [ ] Build sales order listing
- [ ] Build sales order create/edit
- [ ] Support cash, credit, PDC, unsecured credit sales
- [ ] Add manual batch assignment for each line
- [ ] Add gross profit preview from selected batches
- [ ] Add order operational status flow
- [ ] Add dispatch / delivery / return handling

## Phase 7 — Payments
- [ ] Build customer receipts module
- [ ] Build supplier payments module
- [ ] Build payment allocations
- [ ] Add outstanding balance calculations
- [ ] Add customer credit limit checks
- [ ] Add supplier advance balance visibility

## Phase 8 — Cheque Management
- [ ] Build cheque entry screen
- [ ] Add PDC due-date tracking
- [ ] Add deposit workflow
- [ ] Add clearance workflow
- [ ] Add bounce handling
- [ ] Add cheque status history
- [ ] Add cheque due dashboard widget
- [ ] Add bounced cheque report

## Phase 9 — Dashboard & Reporting
- [ ] Build executive dashboard
- [ ] Add sales KPIs
- [ ] Add purchase KPIs
- [ ] Add inventory KPIs
- [ ] Add receivables / payables widgets
- [ ] Add due cheques widget
- [ ] Build sales reports
- [ ] Build purchase reports
- [ ] Build stock movement reports
- [ ] Build receivables aging
- [ ] Build payables aging

## Phase 10 — Hardening
- [ ] Add audit logging
- [ ] Add soft-delete strategy where needed
- [ ] Add form/request validation coverage
- [ ] Add service/action layer cleanup
- [ ] Add seeders for demo/admin setup
- [ ] Add test coverage for critical flows
- [ ] Add deployment checklist
- [ ] Add backup / maintenance notes

## Build Rule
Before starting each module:
- confirm business rules
- ask targeted questions
- update documentation if rules changed
