# Software Requirements Specification (SRS)
## ERP-Based Purchase Order (PO) Management System

### 1. Introduction
#### 1.1 Purpose
This document provides a detailed specification for the **ERP-Based Purchase Order (PO) Management System with Vendor & Product Integration**. The purpose is to automate and streamline the corporate purchasing workflow, vendor relations, price cataloging, multi-product order generation, automatic tax calculation, managerial sign-off, and warehouse stock synchronization.

#### 1.2 Scope
- **Domain**: Enterprise Resource Planning (ERP) / Procurement Logistics.
- **Target Users**: Corporate Procurement Officers (Purchasers), Departmental Approvers / Finance Managers, and System Administrators.
- **Key Capabilities**: Role-Based Access Control, Vendor Master Database, Product Inventory Catalog, Multi-Item PO Calculation (5% GST), Audit Trail History, Automated PDF Generation, Real-Time Executive Dashboard, and AI-Powered Catalog Description Synthesis.

---

### 2. User Classes and Characteristics
| User Role | Responsibilities & Access Permissions |
| :--- | :--- |
| **Admin** | Full system privileges. User role assignments, system audits, global CRUD on all catalogs, and override controls. |
| **Purchaser** | Create, edit, and submit Purchase Orders. Manage vendor contacts and product pricing catalog. Mark approved orders as 'Received'. |
| **Approver** | Review submitted purchase orders. Authorized to change status to 'Approved' or 'Rejected' (with mandatory reason log). |

---

### 3. Functional Requirements

#### Module 1: Authentication & Authorization
- **FR-1.1**: The system shall register users with name, email, password, and assigned role.
- **FR-1.2**: Passwords must be salted and hashed using bcrypt (cost factor $\ge 10$) before database storage.
- **FR-1.3**: Upon login, a signed JSON Web Token (JWT) shall be generated and stored securely on the client.
- **FR-1.4**: All API endpoints (except login/register) shall require a valid Bearer token.

#### Module 2: Vendor Management
- **FR-2.1**: The system shall store vendor name, contact person, email, phone, business address, GSTIN, and active status.
- **FR-2.2**: Vendor deletion must be blocked if any active purchase order references that vendor (`ON DELETE RESTRICT`).

#### Module 3: Product Catalog & AI Assistant
- **FR-3.1**: The system shall record products with unique SKU codes, categories, unit prices, descriptions, and current warehouse stock quantities.
- **FR-3.2**: An AI assistant shall synthesize technical product descriptions given product name, category, and brand.

#### Module 4: Purchase Order Creation & Calculation Engine
- **FR-4.1**: The purchaser can select an existing vendor and dynamically add multiple line items with custom quantities.
- **FR-4.2**: The backend must fetch true unit prices directly from the database and calculate:
  $$\text{LineTotal} = \text{Quantity} \times \text{DatabasePrice}$$
  $$\text{Subtotal} = \sum \text{LineTotal}$$
  $$\text{TaxAmount} = \text{Subtotal} \times 0.05$$
  $$\text{GrandTotal} = \text{Subtotal} + \text{TaxAmount}$$
- **FR-4.3**: PO insertion must execute within an atomic MySQL transaction (`BEGIN`, `COMMIT`, `ROLLBACK`).
- **FR-4.4**: Each PO must receive a unique, serialized format: `PO-YYYY-XXXX`.

#### Module 5: Order Workflow State Machine
- Supported states: `Draft`, `Submitted`, `Approved`, `Rejected`, `Cancelled`, `Received`.
- Only `Draft` orders can be modified or deleted.
- Only users with role `approver` or `admin` can transition an order from `Submitted` to `Approved` or `Rejected`.
- Transition to `Received` automatically updates product inventory in the database.

#### Module 6: Document Export & PDF Generation
- **FR-6.1**: The system shall dynamically generate an official PDF document for any purchase order via PDFKit streaming (`/api/orders/:id/pdf`).

#### Module 7: Executive Dashboard & Analytics
- Real-time KPIs: Total Orders, Total Vendors, Total Products, Pending Approvals, Total Approved Spend (INR).
- Order status distribution and top suppliers by procurement volume.

---

### 4. Non-Functional Requirements
- **Security**: SQL Injection prevention via parameterized queries; CSRF / XSS protection via Helmet; Rate limiting on authentication routes; Passwords never sent back to client.
- **Performance**: Sub-200ms API response time; connection pooling with up to 15 concurrent pooled threads.
- **Reliability & Consistency**: Database ACID compliance guarantees zero partial order saves.
