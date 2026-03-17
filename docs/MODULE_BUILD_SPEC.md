# Skyline OMS — Module Build Specification

## Purpose
This document defines the required workflow for building each module with AI assistance so the system stays consistent, auditable, and aligned with real business rules.

---

## 1. Build Workflow for Every Module
For each module, follow this sequence:

1. Clarify business rules
2. Confirm scope of the module
3. Confirm affected database tables
4. Define statuses and transitions
5. Define calculations and edge cases
6. Build backend
7. Build frontend
8. Test key flows
9. Update documentation
10. Commit changes

Do **not** skip clarification when business rules are uncertain.

---

## 2. Required Clarification Questions Before Building
Before generating code for a module, confirm:
- Who uses this module?
- What are the statuses?
- What actions are allowed in each status?
- What financial impact does it have?
- What inventory impact does it have?
- What reports depend on it?
- What validations are mandatory?
- Can it be partially completed?
- Can it be edited after posting?
- Does it require approval?

---

## 3. Standard Module Deliverables
Every module build should produce, where relevant:

### Backend
- migration(s)
- model(s)
- relationship definitions
- controller(s)
- form request(s)
- action(s) / service(s)
- route definitions
- policy / permission hooks if needed

### Frontend
- list page
- create/edit form
- detail page
- reusable components
- filters / table config
- user feedback states

### Documentation
- update BUSINESS_RULES.md if rules changed
- update MODULES.md if scope changed
- update DB_SCHEMA.md if schema changed
- add notes to TASKS.md or mark progress

---

## 4. Module Definition Template
Use this template before building:

### Module Name
e.g. Purchase Shipments

### Objective
What business problem this module solves.

### Users
Who uses it.

### Core Actions
What users can do.

### Statuses
All lifecycle statuses and transitions.

### Data Model
Tables and relationships touched.

### Validations
Critical rules that prevent bad data.

### Financial Impact
What payables/receivables/costing this affects.

### Inventory Impact
What stock or batches this affects.

### UI Screens
List, create, edit, detail, modal, reports, etc.

### Reports / KPIs
What outputs this module powers.

### Edge Cases
Partial receipt, bounce, over-allocation, cancellation, etc.

---

## 5. Posting Rules
Important modules must distinguish draft vs posted behavior.

### Draft State
- editable
- no final inventory or financial impact unless explicitly designed otherwise

### Posted State
- creates durable business effects
- may lock edits
- may require reversal/correction instead of direct edit

Modules requiring strong posting rules:
- shipment receipt
- stock issue / dispatch
- payment record
- cheque state transition
- stock adjustment

---

## 6. Validation Expectations by Module Type
### Master Data Modules
- unique codes where applicable
- required name/status fields
- prevent delete when transactional usage exists

### Purchase Modules
- supplier required
- at least one item required
- quantities > 0
- costs cannot be negative
- receipt qty cannot exceed sensible bounds unless override allowed

### Shipment/Landed Cost Modules
- shipment must belong to PO
- at least one shipment item
- allocation total must equal shipment cost total
- posted receipt cannot create negative or zero-cost anomalies without explicit handling

### Inventory Modules
- no issue above available quantity
- selected batch must belong to same product and warehouse
- adjustments require reason

### Sales Modules
- customer required
- at least one item required
- selected batches must cover issued quantity
- payment type-specific fields required when relevant

### Payment Modules
- party required
- amount > 0
- allocation cannot exceed remaining balance
- cheque methods require cheque-specific data

---

## 7. UI Expectations per Module
Every business module should have:
- searchable list page
- quick filters
- detail view with summary
- action buttons relevant to current status
- readable totals and statuses
- role-aware access

Transaction-heavy modules should additionally have:
- live totals
- validation hints
- audit snippets
- related record links

---

## 8. Required Tests per Module
At minimum, each core module should define:
- happy-path flow
- one important validation failure
- one important edge case
- one authorization check if applicable

Examples:
- Purchase Shipment: cost allocation totals match
- Sales Order: batch selection cannot exceed available qty
- Cheque: bounced status updates exposure correctly

---

## 9. Definition of Done
A module is done only when:
- business rules are clarified
- schema is added
- backend works
- frontend works
- critical validations exist
- docs are updated
- manual test path is successful
- changes are committed cleanly

---

## 10. Initial Recommended Build Order
1. Auth / Roles / App Layout
2. Products / Customers / Suppliers / Warehouses
3. Purchase Orders
4. Purchase Shipments
5. Shipment Costs + Landed Cost Allocation
6. Inventory Batches + Stock Movements
7. Sales Orders + Manual Batch Selection
8. Payments
9. Cheques / PDC
10. Dashboard + Reports
