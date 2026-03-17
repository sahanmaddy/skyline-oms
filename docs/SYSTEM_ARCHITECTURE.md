# Skyline OMS — System Architecture

## 1. Architecture Style
Skyline OMS should use a modular monolith architecture:
- single Laravel application
- Inertia-driven React frontend
- MySQL relational database
- modular domain structure inside one deployable app

This keeps development fast while preserving strong boundaries between domains.

---

## 2. Technology Stack
### Backend
- Laravel 12
- PHP 8.2+
- Form Requests for validation
- Services / Actions for business workflows
- Eloquent ORM
- Laravel Policies / middleware for access control

### Frontend
- React via Inertia
- Tailwind CSS
- shared layout + reusable components
- page-based modules under `resources/js/Modules`

### Database
- MySQL
- migration-driven schema management

### Deployment
- Hostinger-compatible Laravel deployment
- production build via Vite

---

## 3. High-Level Domains
1. Foundation
2. Master Data
3. Purchasing
4. Shipments & Landed Costs
5. Inventory
6. Sales
7. Payments
8. Cheques
9. Dashboards & Reports
10. Administration

---

## 4. Layered Structure
### Presentation Layer
- Inertia pages
- React components
- layouts
- route entry points
- frontend state local to page/module unless global state is clearly justified

### Application Layer
- Controllers
- Form Requests
- Policies
- Actions / Services coordinating use cases

### Domain Layer
- Business rules and workflows
- Cost allocation
- manual batch assignment rules
- credit checks
- cheque lifecycle logic
- stock movement generation

### Persistence Layer
- Eloquent models
- repositories only if complexity later justifies them
- migrations
- database transactions for critical posting flows

---

## 5. Suggested Folder Strategy

### Backend
- `app/Models`
- `app/Http/Controllers`
- `app/Http/Requests`
- `app/Policies`
- `app/Services`
- `app/Actions`
- `app/Enums` (recommended)
- `app/Support` (optional helpers)
- `database/migrations`
- `database/seeders`

### Frontend
- `resources/js/Layouts`
- `resources/js/Components`
- `resources/js/Modules/<ModuleName>/Pages`
- `resources/js/Modules/<ModuleName>/Components`
- `resources/js/Modules/<ModuleName>/Forms`
- `resources/js/Modules/<ModuleName>/Tables`

---

## 6. Core Architectural Decisions
### 6.1 Modular Monolith
Keep everything in one Laravel app initially.
Reason:
- simpler deployment
- easier coordination with Cursor/AI
- lower operational overhead
- enough for current business scale

### 6.2 Service / Action Split
Use:
- **Controllers** for HTTP orchestration
- **Form Requests** for validation
- **Actions** for single business use cases
- **Services** for reusable business logic

Examples:
- `AllocateShipmentCostsAction`
- `PostShipmentReceiptAction`
- `AssignSalesOrderBatchAction`
- `RecordChequeStatusChangeAction`
- `InventoryService`
- `PaymentService`

### 6.3 Posting Model
Draft/editable records are separated conceptually from posted operational/financial effects.
Examples:
- Shipment draft can be edited
- Posted shipment receipt creates inventory batches and stock movements
- Payment record may be recorded before final clearance depending on method

This avoids silent mutation of business-critical history.

### 6.4 Explicit Transaction Boundaries
Use database transactions for:
- posting shipment receipts
- creating inventory batches
- posting dispatch with batch deductions
- recording payments with allocations
- cheque status transitions affecting balances

---

## 7. Domain Flow Overview

### Purchase Flow
Purchase Order -> Supplier Payment / Advance -> Shipment -> Shipment Costs -> Landed Cost Allocation -> Receipt Posting -> Inventory Batch Creation

### Sales Flow
Sales Order -> Manual Batch Selection -> Reservation / Confirmation -> Dispatch -> Delivery / Return -> Payment / Cheque Tracking

### Finance Flow
Customer Receipt / Cheque -> Allocation -> Outstanding Update
Supplier Payment -> Allocation / Advance Update -> Payables Update

---

## 8. Inventory Architecture
Inventory is not maintained as a single product quantity only.
The source of truth is:
- inventory batches
- stock movements

Available stock can be derived as:
- batch remaining quantity minus reservations

Manual batch selection is mandatory for sales issue logic.
No automatic FIFO should happen unless introduced as an optional tool later.

---

## 9. Costing Architecture
Shipment costs are entered at shipment level.
Allocation process:
1. sum all shipment costs
2. calculate each item's value share
3. allocate cost by value
4. derive final cost per item
5. persist final unit cost into inventory batches

This ensures accurate profitability and inventory valuation.

---

## 10. Payment Architecture
Payment records should be generic enough to support:
- customer receipts
- supplier payments
- cash
- bank transfer
- cheque
- PDC

Allocation records link payments to business documents.
Cheque records are separate because they have lifecycle states and dates.

---

## 11. Reporting Architecture
Reports should primarily read from normalized transaction tables.
For heavier dashboards, consider later:
- cached aggregates
- scheduled summary tables
- materialized KPI snapshots

Initial implementation can compute directly from transactional data.

---

## 12. Security Architecture
- authentication via Laravel Breeze/Auth starter
- authorization via roles + permissions
- policy-based access to sensitive actions
- role-aware menus in frontend
- audit logging for critical business actions

---

## 13. Scaling Path
When the app grows, scale in this order:
1. stronger module boundaries
2. queue background jobs for heavy reports/notifications
3. caching of dashboard aggregates
4. API endpoints if mobile/external integrations are needed
5. only split services if business scale truly requires it

For now, keep the system cohesive and maintainable.
