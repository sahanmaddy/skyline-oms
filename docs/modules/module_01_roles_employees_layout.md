# Module 01 - Roles, Employees, Permissions, App Layout

## Decisions
- Roles: Admin, Manager, Sales, Accountant
- Sales orders must be linked to a salesperson
- Warehouse is single for now, but design should be future-ready for multiple warehouses
- Customers have a credit limit
- Product units supported: meters, yards, rolls, kgs, pcs, sets

## Goals
1. Add role management to users
2. Add employee records linked to user accounts where needed
3. Restrict system sections by role
4. Build the main authenticated app layout
5. Add a dashboard skeleton
6. Prepare user structure for future OMS modules

## Required outputs
- migrations
- models and relationships
- middleware / authorization approach
- seeders
- sidebar layout
- dashboard placeholder page
- employee CRUD
- role-aware navigation

## Role access
- Admin: full access
- Manager: broad operational access, reporting access
- Sales: sales-related access only
- Accountant: payments, finance, reports access

## Notes
- Keep warehouse model future-ready even if not used yet
- Do not build inventory logic in this module
- Do not build purchase or sales transactions yet