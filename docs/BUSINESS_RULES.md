# Skyline OMS — Business Rules

## 1. Core Business Model
Skyline OMS is a wholesale and trading-focused order management system for a textile/fabric business.
It must support purchasing, shipments, landed costs, batch-based inventory, sales, customer credit, supplier prepayments, post-dated cheques, dashboards, and operational reporting.

## 2. Inventory Rules
1. Inventory is batch-based.
2. Batch selection for sales is **manual**, not FIFO or weighted average by default.
3. Each received shipment creates one or more inventory batches.
4. The same product may exist in multiple batches at different costs.
5. Stock must always be traceable back to the source shipment and purchase.
6. Negative stock is not allowed unless explicitly enabled later by a system setting.
7. Reserved stock and available stock must be distinguishable.
8. Stock deductions should happen from the batch selected by the user at dispatch/fulfillment stage.

## 3. Product Costing Rules
1. The same product can have different purchase prices across different shipments.
2. Supplier unit cost alone is not the final cost.
3. Final item cost must include landed cost allocation.
4. Landed cost must be stored per received batch so gross profit can be calculated correctly.
5. Inventory valuation must use batch-level final cost.

## 4. Purchase Order Rules
1. Suppliers may need to be paid before shipping.
2. A purchase order may contain multiple items.
3. A purchase order may have one or more shipments.
4. Shipment quantities may be partial relative to the purchase order.
5. Purchase order status must reflect commercial progress and logistics progress separately where useful.
6. Purchase orders must support draft, approval, supplier confirmation, payment, shipment, receipt, and closure stages.
7. The system must support partial receipt and partial closure.

## 5. Shipment Rules
1. A shipment belongs to one purchase order.
2. A shipment may contain multiple items.
3. Shipment extra costs are common shipment-level costs.
4. Shipment-level costs must be allocated across shipment items using a defined allocation method.
5. Default landed-cost allocation method should be **by item value**, unless changed later.
6. Each shipment should support reference details such as shipment number, ETA, received date, notes, and status.
7. Shipment receipt creates inventory batches.

## 6. Purchase Cost / Landed Cost Rules
1. Extra costs may include freight, insurance, clearing, port charges, handling, inland transport, taxes not claimable, and miscellaneous costs.
2. Extra costs may be entered after shipment creation and before final receipt posting if needed.
3. Common shipment costs must be distributed to received item lines.
4. Landed cost calculation must be visible and auditable.
5. System must preserve both:
   - supplier/base cost
   - allocated landed cost
   - final effective cost
6. Any later adjustment to landed cost must create an audit trail and inventory value adjustment rule.

## 7. Supplier Payment Rules
1. Supplier payments may occur before shipment.
2. Supplier payments may be full or partial.
3. Supplier payments must be linked to purchase orders or supplier advance balances.
4. System must show outstanding payable amount per supplier and per purchase order where relevant.
5. Advance payments must be tracked separately from finalized purchase liability if needed.

## 8. Sales Order Rules
1. Sales may be:
   - cash sales
   - credit sales
   - credit sales with post-dated cheques
   - credit sales without cheques
2. Sales orders may contain multiple items.
3. Each sales order line must allow manual batch selection.
4. Batch selection must validate available quantity.
5. Selling price is entered independently from batch cost.
6. Gross profit should be computed from selected batch effective cost.
7. Sales orders must support operational statuses such as draft, confirmed, packed, dispatched, delivered, returned, cancelled.
8. Financial payment status must be separate from operational status.

## 9. Customer Credit Rules
1. Customers may have credit limits.
2. Customers may or may not provide cheque security.
3. Some customers buy on credit without giving cheques.
4. System should support customer-level risk flags such as:
   - cash only
   - cheque preferred
   - unsecured credit
   - over-limit warning
5. Credit exposure must include unpaid invoices and uncleared cheque risk where relevant.

## 10. Cheque / PDC Rules
1. Customers may pay using post-dated cheques.
2. Cheques must be tracked individually.
3. Cheque lifecycle must support:
   - received
   - deposited
   - cleared
   - bounced
   - cancelled / returned
4. A cheque may be allocated to one or more invoices/orders if needed later.
5. Bounced cheques must restore customer outstanding balance if previously marked settled.
6. The system must support due-date visibility for cheque calendar and cashflow planning.

## 11. Cash and Direct Payment Rules
1. Cash sales should normally be considered paid immediately.
2. Direct transfer, cash deposit, or bank transfer should be recordable as payment methods.
3. Partial payments must be supported for both customers and suppliers.
4. Payment allocations must be auditable.

## 12. Customer and Supplier Master Rules
1. Customers and suppliers are separate masters.
2. One party may later support both customer and supplier roles if needed, but initial implementation can keep them separate.
3. Master records should include contact, address, tax/business info, payment preferences, status, and notes.
4. Inactive records should not be hard deleted if transactions exist.

## 13. Employee / User Rules
1. Employees who use the system must have role-based access.
2. Roles should include at minimum:
   - Admin
   - Manager
   - Sales
   - Warehouse
   - Accounts
3. Users should only see actions permitted by role.
4. Audit logging should capture who created, updated, approved, dispatched, or posted records.

## 14. Dashboard Rules
1. Dashboard should show operational and financial KPIs.
2. KPIs should include at minimum:
   - sales totals
   - purchases totals
   - stock value
   - low stock items
   - receivables
   - payables
   - pending cheques
   - overdue balances
3. Dashboard metrics must respect transaction status logic.

## 15. Reporting Rules
1. Reports must be filterable by date range, customer, supplier, product, employee, and status where relevant.
2. Reports should include:
   - sales summary
   - purchase summary
   - inventory valuation
   - stock movement
   - batch aging
   - receivables aging
   - payables aging
   - cheque due report
   - bounced cheque report
3. Export to Excel/PDF can be added later, but reporting structures should support it.

## 16. Audit and Data Integrity Rules
1. Transactional records must not be silently overwritten without trace.
2. Important posted transactions should be locked or require privileged reversal/amendment flow.
3. Deletes should generally be soft deletes for masters and controlled cancellation for transactions.
4. Every inventory-affecting event must create stock movement records.
5. Every payment-affecting event must create payment and allocation records.

## 17. Architecture and Build Rules
1. Build one module at a time.
2. Ask business questions before generating each module.
3. Do not rewrite the entire project without explicit approval.
4. Use Laravel 12 + React + Inertia + Tailwind.
5. Use migrations for all database changes.
6. Prefer Form Requests for validation.
7. Prefer Services/Actions for complex business logic.
