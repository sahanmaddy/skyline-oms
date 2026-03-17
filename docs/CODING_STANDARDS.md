# Skyline OMS — Coding Standards

## 1. General Principles
- Optimize for clarity over cleverness.
- Write code another developer or AI can safely extend later.
- Keep modules cohesive and business-rule driven.
- Prefer explicit naming over short ambiguous names.
- Avoid hidden side effects.

## 2. Backend Standards (Laravel)
### Controllers
- Controllers should stay thin.
- Controllers handle request/response orchestration only.
- Business workflows belong in Actions or Services.

### Validation
- Use Form Request classes for non-trivial validation.
- Keep validation rules centralized per use case.
- Add custom messages only where helpful.

### Models
- Define relationships explicitly.
- Guard or fillable strategy must be consistent.
- Use casts for dates, money-supporting decimals, JSON fields, booleans.
- Keep model methods focused on domain meaning.

### Services / Actions
Use Actions for single business use cases:
- post shipment receipt
- allocate shipment cost
- assign batches to sales order
- record payment
- update cheque status

Use Services for reusable domain logic:
- inventory calculations
- balance calculations
- margin calculations
- numbering generation if centralized

### Database
- Every schema change must use a migration.
- Never modify production schema manually.
- Use foreign keys where appropriate.
- Use soft deletes only where business-safe.
- Wrap critical posting flows in DB transactions.

### Status Handling
- Prefer enums or central constants for statuses.
- Never scatter raw status strings everywhere.
- Operational status and financial status should be separate when concepts differ.

### Money / Quantities
- Use decimal fields, not float.
- Standardize scale/precision by business use case.
- Be careful with currency conversion and rounding.
- Record both source currency and local amount where relevant.

### Auditing
- Critical state changes should create logs or status history records.
- Do not silently overwrite posted financial/inventory facts.

## 3. Frontend Standards (React + Inertia)
### Structure
- Organize by module under `resources/js/Modules`.
- Shared primitives go in `resources/js/Components`.
- Layouts go in `resources/js/Layouts`.

### Components
- Keep components focused and reusable.
- Split very large screens into meaningful subcomponents.
- Prefer controlled forms for important transaction entry.

### State
- Keep state local unless truly shared.
- Do not introduce heavy global state too early.
- Derived values should be computed, not duplicated.

### Forms
- Use consistent field wrappers and validation display.
- Disable save actions during submission.
- Show calculated totals in real time for transactional forms.

### Tables
- Reuse a consistent table pattern.
- Numeric columns right-aligned.
- Row actions standardized.
- Filters predictable across modules.

## 4. Naming Conventions
### Backend
- Models: singular PascalCase
- Tables: plural snake_case
- Controllers: PascalCase + Controller
- Requests: PascalCase + Request
- Services: PascalCase + Service
- Actions: PascalCase + Action

### Frontend
- Components: PascalCase
- hooks/helpers: camelCase
- folders: PascalCase for module folders, kebab/snake only if existing convention requires

### Variables
- Use descriptive names:
  - `allocatedLandedCost`
  - `selectedBatchQuantity`
  - `outstandingReceivableAmount`
Not:
  - `alc`
  - `qty1`
  - `val`

## 5. Business Rule Safety
- Ask questions before building a module if rules are unclear.
- Do not assume accounting or stock behavior.
- Do not auto-implement FIFO where manual batch selection is required.
- Do not merge operational and financial concepts just for convenience.

## 6. Error Handling
- Fail loudly on invalid business states.
- Return friendly validation or business-rule messages to UI.
- Log unexpected exceptions with context.
- Prevent partial updates in multi-step postings.

## 7. Testing Standards
Prioritize tests for:
- landed cost allocation
- batch selection and stock deduction
- payment allocation
- cheque status transitions
- customer credit limit checks
- supplier prepayment flow

At minimum:
- feature tests for critical workflows
- unit tests for calculation logic

## 8. Documentation Standards
- Keep docs in sync when business rules change.
- Update module docs before or alongside major module build.
- Prefer markdown docs stored in `/docs`.

## 9. Git Standards
- Commit per module or coherent feature.
- Avoid massive mixed commits.
- Commit messages should be explicit, e.g.:
  - `Build purchase order master/detail flow`
  - `Add shipment landed cost allocation logic`
  - `Implement manual batch selection on sales orders`

## 10. AI Collaboration Standards
- Build one module at a time.
- Return full changed files when practical.
- Explain assumptions clearly.
- Preserve existing working functionality unless asked to refactor.
