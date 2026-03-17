# Module 01 - Roles, Employees, Permissions, App Layout

## Decisions
- Roles: Admin, Manager, Sales, Accountant
- Sales orders must be linked to a salesperson
- Warehouse is single for now, but design should be future-ready for multiple warehouses
- Customers have a credit limit
- Product units supported: meters, yards, rolls, kgs, pcs, sets

## Employee Document Rules
- Document types:
  - NIC
  - CV
  - Appointment Letter
  - Contract
  - Certificates
  - Other
- One employee can have multiple documents of the same type
- Files are stored in the app filesystem/server
- Document access allowed for:
  - Admin
  - Manager
  - Accountant
- Document actions required:
  - upload
  - replace
  - delete
  - download
  - view online

## Goals
1. Add role management to users
2. Add employee records linked to user accounts where needed
3. Restrict system sections by role
4. Build the main authenticated app layout
5. Add a dashboard skeleton
6. Prepare user structure for future OMS modules
7. Add employee document management

## Required outputs
- migrations
- models and relationships
- middleware / authorization approach
- seeders
- sidebar layout
- dashboard placeholder page
- employee CRUD
- role-aware navigation
- employee documents table and file handling
- employee document UI with drag-and-drop upload area

## Role access
- Admin: full access
- Manager: broad operational access, reporting access
- Sales: sales-related access only
- Accountant: payments, finance, reports access, employee document access

## Employee Document Access
- Admin: full document access
- Manager: full document access
- Accountant: full document access
- Sales: no document access unless expanded later

## Notes
- Keep warehouse model future-ready even if not used yet
- Do not build inventory logic in this module
- Do not build purchase or sales transactions yet
- Use private/local storage structure that can later be moved to cloud storage if needed