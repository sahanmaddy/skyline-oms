# Skyline OMS — Database Schema

## Design Principles
- Transactional tables are normalized.
- Inventory is batch-based.
- Manual batch selection is required for sales.
- Shipments sit under purchase orders.
- Shipment costs are common costs allocated across shipment items.
- Financial and operational statuses are separated where useful.
- Auditability is preserved through movement and allocation tables.

---

## 1. Security / Users

### users
- id
- name
- email
- password
- is_active
- last_login_at
- created_at
- updated_at
- deleted_at (optional soft delete)

### roles
- id
- code
- name
- description

### permissions
- id
- code
- name
- description

### role_user
- user_id
- role_id

### permission_role
- permission_id
- role_id

### employees
- id
- user_id (nullable if no login)
- employee_code
- full_name
- phone
- email
- department
- designation
- status
- notes

Relationships:
- users 1—0..1 employees
- users m—m roles
- roles m—m permissions

---

## 2. Master Data

### units_of_measure
- id
- code
- name
- symbol
- is_active

### product_categories
- id
- name
- parent_id (nullable)
- is_active

### products
- id
- sku
- name
- category_id
- unit_of_measure_id
- default_sell_price (nullable)
- description
- is_active
- notes

### warehouses
- id
- code
- name
- address
- is_active

### customers
- id
- customer_code
- name
- contact_person
- phone
- email
- address_line_1
- address_line_2
- city
- credit_limit
- payment_terms_days
- credit_security_type   # none / cheque / mixed / cash_only
- is_active
- notes

### suppliers
- id
- supplier_code
- name
- contact_person
- phone
- email
- address_line_1
- address_line_2
- city
- payment_terms_days
- currency_code
- is_active
- notes

### payment_methods
- id
- code              # cash, bank_transfer, cheque, pdc, supplier_tt
- name
- direction         # incoming / outgoing / both
- is_active

### cost_types
- id
- code              # freight, clearing, transport, insurance, etc.
- name
- is_active

### banks
- id
- name
- branch
- account_name
- account_number
- is_active

Relationships:
- products belongs to product_categories, units_of_measure
- customers, suppliers are standalone masters
- payment_methods, cost_types, banks used by finance/shipment records

---

## 3. Purchasing

### purchase_orders
- id
- po_number
- supplier_id
- warehouse_id
- order_date
- currency_code
- exchange_rate
- supplier_reference
- status              # draft, approved, awaiting_payment, paid, partially_shipped, shipped, partially_received, completed, cancelled
- payment_status      # unpaid, partially_paid, paid
- subtotal_amount
- total_amount
- notes
- created_by
- approved_by (nullable)
- approved_at (nullable)

### purchase_order_items
- id
- purchase_order_id
- product_id
- ordered_qty
- unit_price
- line_amount
- notes

Relationships:
- purchase_orders 1—m purchase_order_items
- purchase_orders belongs to suppliers, warehouses
- purchase_order_items belongs to products

---

## 4. Shipments & Receiving

### purchase_shipments
- id
- purchase_order_id
- shipment_number
- shipment_reference
- eta_date (nullable)
- shipped_date (nullable)
- received_date (nullable)
- status              # draft, in_transit, received, posted, cancelled
- notes
- created_by

### purchase_shipment_items
- id
- purchase_shipment_id
- purchase_order_item_id
- product_id
- shipped_qty
- received_qty
- supplier_unit_cost
- base_line_amount
- allocated_landed_cost
- final_unit_cost
- final_line_cost

### shipment_costs
- id
- purchase_shipment_id
- cost_type_id
- description
- amount
- currency_code
- exchange_rate
- local_amount
- notes

### shipment_cost_allocations
- id
- shipment_cost_id
- purchase_shipment_item_id
- allocated_amount

Relationships:
- purchase_orders 1—m purchase_shipments
- purchase_shipments 1—m purchase_shipment_items
- purchase_shipments 1—m shipment_costs
- shipment_costs 1—m shipment_cost_allocations
- purchase_shipment_items belongs to purchase_order_items and products

---

## 5. Inventory

### inventory_batches
- id
- batch_number
- product_id
- warehouse_id
- purchase_order_id (nullable)
- purchase_shipment_id (nullable)
- purchase_shipment_item_id (nullable)
- source_type         # purchase, adjustment, return, opening_balance
- source_id (nullable)
- received_date
- original_qty
- remaining_qty
- reserved_qty
- supplier_unit_cost
- landed_cost_per_unit
- final_unit_cost
- status              # open, depleted, closed
- notes

### stock_movements
- id
- movement_number
- product_id
- warehouse_id
- inventory_batch_id (nullable)
- movement_type       # receipt, reserve, issue, release, return_in, adjustment_in, adjustment_out
- quantity
- unit_cost (nullable)
- reference_type
- reference_id
- movement_date
- remarks
- created_by

Relationships:
- inventory_batches belongs to products, warehouses, shipments
- stock_movements belongs to products, warehouses, optionally inventory_batches

---

## 6. Sales

### sales_orders
- id
- so_number
- customer_id
- order_date
- due_date (nullable)
- sales_type           # cash, credit, pdc, unsecured_credit
- order_status         # draft, confirmed, packed, dispatched, delivered, returned, cancelled
- payment_status       # unpaid, partially_paid, paid, pending_cheque, overdue
- subtotal_amount
- total_amount
- notes
- salesperson_id (nullable, employee_id)
- created_by

### sales_order_items
- id
- sales_order_id
- product_id
- ordered_qty
- sell_unit_price
- line_amount
- notes

### sales_order_item_batches
- id
- sales_order_item_id
- inventory_batch_id
- selected_qty
- batch_unit_cost
- sell_unit_price
- line_cost
- line_profit

Relationships:
- sales_orders 1—m sales_order_items
- sales_order_items 1—m sales_order_item_batches
- sales_orders belongs to customers and optionally employees
- sales_order_item_batches belongs to inventory_batches

---

## 7. Payments

### payments
- id
- payment_number
- direction            # incoming / outgoing
- party_type           # customer / supplier
- party_id
- payment_method_id
- payment_date
- amount
- currency_code
- exchange_rate
- local_amount
- reference_number
- bank_id (nullable)
- status               # recorded, pending, cleared, cancelled, bounced
- notes
- created_by

### payment_allocations
- id
- payment_id
- allocatable_type     # sales_order / purchase_order / invoice / advance
- allocatable_id
- allocated_amount

Relationships:
- payments 1—m payment_allocations
- payments belongs to payment_methods and optionally banks

---

## 8. Cheques

### cheques
- id
- cheque_number
- customer_id
- sales_order_id (nullable)
- bank_id (nullable)
- cheque_date
- received_date
- amount
- status               # received, deposited, cleared, bounced, cancelled, returned
- payment_id (nullable)
- notes
- created_by

### cheque_status_histories
- id
- cheque_id
- from_status (nullable)
- to_status
- changed_at
- remarks
- changed_by

Relationships:
- cheques belongs to customers, optionally sales_orders, banks, payments
- cheques 1—m cheque_status_histories

---

## 9. Optional Ledger / Balance Support

### customer_balances (can be materialized or derived later)
- id
- customer_id
- balance_amount
- last_updated_at

### supplier_balances (can be materialized or derived later)
- id
- supplier_id
- balance_amount
- last_updated_at

In initial version, balances can be derived from sales/purchase/payment tables rather than stored.

---

## 10. Audit / Logs

### activity_logs
- id
- user_id
- subject_type
- subject_id
- action
- description
- metadata_json
- created_at

---

## Relationship Summary
- suppliers 1—m purchase_orders
- purchase_orders 1—m purchase_order_items
- purchase_orders 1—m purchase_shipments
- purchase_shipments 1—m purchase_shipment_items
- purchase_shipments 1—m shipment_costs
- purchase_shipment_items 1—1..m inventory_batches
- products 1—m inventory_batches
- products 1—m purchase_order_items
- products 1—m sales_order_items
- customers 1—m sales_orders
- sales_orders 1—m sales_order_items
- sales_order_items 1—m sales_order_item_batches
- inventory_batches 1—m sales_order_item_batches
- payments 1—m payment_allocations
- customers 1—m cheques
- cheques 1—m cheque_status_histories
