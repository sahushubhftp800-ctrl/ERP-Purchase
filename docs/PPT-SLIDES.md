# ERP-Based Purchase Order (PO) Management System
## 10-Slide Project Presentation (PPT Content & Viva Speaking Script)

---

### Slide 1: Title Slide (Project Overview)
* **Slide Title**: ERP-Based Purchase Order (PO) Management System
* **Subtitle**: An End-to-End Enterprise Procurement Platform with Automated GST Calculations & Multi-Role Approval Workflow
* **Key Badges/Highlights**: Full-Stack Web Application | 3-Tier Architecture | Production Cloud Deployed
* **Technology Stack**: React 18, Tailwind CSS, Node.js, Express.js, MySQL 8.0, JWT, Railway Cloud
* **Presented By**: [Your Name / Roll Number / Branch]
* **Guided By**: [Professor / Project Guide Name]
* **College/Department**: Department of Computer Science & Engineering, [College Name]

> **🗣️ Speaking Notes (Viva Presentation):**
> *"Good morning respected evaluators and professors. Today, I am presenting my major project: 'ERP-Based Purchase Order Management System'. Procurement and vendor purchasing is the financial backbone of any manufacturing, IT, or retail enterprise. Our project eliminates manual paperwork, human errors in tax computation, and purchase delays by automating the complete lifecycle from vendor onboarding to multi-stage approvals and automated inventory updates."*

---

### Slide 2: Problem Statement & Industry Motivation
* **Slide Title**: Problem Statement & Challenges in Traditional Purchasing
* **Key Bullet Points**:
  - **Manual Paperwork & Spreadsheet Bottlenecks**: Procurement teams spend hours creating manual POs in spreadsheets, leading to lost records and duplicate orders.
  - **Calculation Inaccuracies**: Manual GST and subtotal calculations frequently suffer from human errors and price tampering.
  - **Lack of Authorization & Audit Trail**: Unauthorized purchases occur when there is no strict Role-Based Access Control (RBAC) between purchasers and approvers.
  - **Delayed Inventory Updates**: When goods arrive at the warehouse, stock quantities are updated late or forgotten.
  - **Scattered Vendor Information**: Lack of centralized repository for vendor GST numbers, contacts, and historical order performance.

> **🗣️ Speaking Notes (Viva Presentation):**
> *"In traditional small to medium enterprises, purchasing is done via spreadsheets, emails, or paper vouchers. This creates three critical vulnerabilities: first, employees can accidentally or intentionally manipulate product unit prices; second, tax computations like 5% GST are often miscalculated; and third, there is no immutable audit trail of who created, reviewed, or approved the expense. Our system was designed specifically to solve these four industry challenges."*

---

### Slide 3: Proposed Solution & Core Objectives
* **Slide Title**: Proposed Solution & Project Objectives
* **Key Bullet Points**:
  - **Automated Calculation Engine**: Automatic computation of line-item totals, subtotal, strict 5% GST tax, and grand total with zero manual override.
  - **Strict Database Price Verification**: Backend verifies product prices directly from the master catalog to prevent frontend client tampering.
  - **Multi-Role Workflow State Machine**: Structured transition: `Draft` ➔ `Submitted` ➔ `Approved` / `Rejected` ➔ `Received`.
  - **Automatic Inventory Reconciliation**: Upon marking a PO as `Received`, warehouse stock quantities are automatically incremented in a single ACID transaction.
  - **Automated Binary PDF Generation**: Instant generation of official procurement purchase order invoices formatted for printing and sharing.

> **🗣️ Speaking Notes (Viva Presentation):**
> *"Our solution provides a centralized, secure web-based ERP system. The core objective is twofold: compliance and automation. For example, if a company purchases 10 laptops at ₹40,000 each, our calculation engine automatically locks the price, calculates a ₹4,00,000 subtotal, applies 5% GST of ₹20,000, and outputs a grand total of ₹4,20,000. It prevents client-side tampering by fetching verified catalog prices on the server."*

---

### Slide 4: System Architecture & Technologies
* **Slide Title**: 3-Tier Enterprise Architecture
* **Visual Diagram Layout**:
  - **Tier 1 (Presentation Layer)**: React 18 SPA + Tailwind CSS v4 + Vite + Lucide Icons
  - **Tier 2 (Application Layer)**: Node.js + Express 5 REST API + JWT Authentication + Helmet Security + PDFKit
  - **Tier 3 (Data Layer)**: MySQL 8.0 Relational Database with InnoDB Engine & ACID Transaction Support
  - **DevOps & Cloud**: Dockerized Containers, GitHub CI/CD, Railway Cloud Deployment
* **Key Bullet Points**:
  - Clean separation of concerns between UI, Business Logic, and Persistence.
  - Stateless RESTful API communication via Axios with JWT Bearer token interceptors.
  - Production-grade security: Reverse proxy trust, CORS whitelist, Helmet headers, and rate limiters.

> **🗣️ Speaking Notes (Viva Presentation):**
> *"We implemented an industry-standard 3-tier architecture. The presentation layer uses React 18 and Tailwind CSS for a reactive, zero-reload user experience. The application layer runs on Express 5, handling authentication, business logic, validation, and PDF streaming. The data layer uses MySQL 8.0 with InnoDB to guarantee ACID transaction properties during multi-item order creation."*

---

### Slide 5: Database Design & Normalization (3NF)
* **Slide Title**: Relational Database Design (3rd Normal Form)
* **Key Bullet Points**:
  - **7 Normalized Tables**:
    1. `users` (Authentication, credentials, role ENUM)
    2. `vendors` (Suppliers, GST numbers, contact info)
    3. `products` (SKU uniqueness, categories, base price, live stock)
    4. `purchase_orders` (PO master header, totals, timestamps)
    5. `purchase_order_items` (Order line items, quantities, locked prices)
    6. `order_status_history` (Audit log of status changes and approval comments)
    7. `audit_logs` (System-wide action audit trail with IP address)
  - **Key Relationships & Integrity**:
    - 1 Vendor to Many Purchase Orders (`FOREIGN KEY ... ON UPDATE CASCADE`)
    - 1 Purchase Order to Many Order Items (`ON DELETE CASCADE`)
    - 1 Product to Many Order Items (`ON DELETE RESTRICT` prevents accidental catalog deletion)
  - **Normalization**: Fully decomposed to 3NF to eliminate insertion, update, and deletion anomalies.

> **🗣️ Speaking Notes (Viva Presentation):**
> *"Database normalization was a top priority. Instead of storing vendor or product details inside the order table, we decomposed the schema into 7 relational tables adhering to Third Normal Form (3NF). We enforced foreign key constraints with cascade policies—for instance, deleting a draft order automatically cascades to its items, while products with historical order items are protected from accidental deletion using RESTRICT."*

---

### Slide 6: Calculation Engine & Transactional Integrity
* **Slide Title**: Business Logic: Calculation Engine & ACID Transactions
* **Formulas Implemented**:
  $$\text{Line Total} = \text{Quantity} \times \text{Unit Price}_{\text{catalog}}$$
  $$\text{Subtotal} = \sum_{i=1}^{n} \text{Line Total}_i$$
  $$\text{Tax (GST 5\%)} = \text{Subtotal} \times 0.05$$
  $$\text{Grand Total} = \text{Subtotal} + \text{Tax}$$
* **Concurrency & Safety**:
  - **Row-Locking Sequential PO Numbers**: Uses `SELECT ... FOR UPDATE` to generate consecutive `PO-YYYY-XXXX` identifiers without race conditions.
  - **ACID Transactions**: Order creation and line-item insertions are wrapped in `connection.beginTransaction()`, `commit()`, and `rollback()` on failure.
  - **Tamper-Proof Math**: Frontend prices are completely ignored by the API server; unit prices are verified directly against the database catalog.

> **🗣️ Speaking Notes (Viva Presentation):**
> *"Our calculation engine enforces strict mathematical integrity. When a purchase order is submitted, the backend opens a database transaction, locks the counter row to generate an incremental PO number like PO-2026-0002, recalculates line totals using catalog prices, applies 5% GST, and records the grand total. If any single item fails validation, the entire transaction rolls back cleanly, leaving zero orphaned records."*

---

### Slide 7: Security & Role-Based Access Control (RBAC)
* **Slide Title**: Security Architecture & Role-Based Access Control (RBAC)
* **Role Permissions Matrix**:
  | Feature / Action | Admin | Purchaser | Approver |
  | :--- | :---: | :---: | :---: |
  | View Dashboard & Catalog | ✅ | ✅ | ✅ |
  | Create / Edit Draft PO | ✅ | ✅ | ❌ |
  | Submit PO for Approval | ✅ | ✅ | ❌ |
  | Approve / Reject PO | ✅ | ❌ | ✅ |
  | Mark Order as Received | ✅ | ❌ | ✅ |
  | User & RBAC Management | ✅ | ❌ | ❌ |
* **Security Layers**:
  - Passwords hashed using `bcryptjs` with salt factor 10 (never plaintext).
  - Stateless JSON Web Tokens (JWT) signed with HMAC-SHA256, expiring in 7 days.
  - Rate limiting (100 requests per 15 min window) to protect authentication endpoints against brute-force attacks.
  - `helmet` HTTP headers configured to neutralize XSS, clickjacking, and MIME-sniffing.

> **🗣️ Speaking Notes (Viva Presentation):**
> *"Security in enterprise software is paramount. We implemented strict Role-Based Access Control. A Purchaser can create and submit orders, but cannot approve their own purchases. Only designated Approvers or Admins can approve or reject orders. Authentication uses salted bcrypt hashing and JWT tokens passed via HTTP Authorization headers. Endpoints are guarded by middleware that checks token validity and user roles before executing any query."*

---

### Slide 8: Enterprise Features & AI Assistant
* **Slide Title**: Enterprise Features & AI Catalog Integration
* **Key Bullet Points**:
  - **Real-Time Executive Analytics**: Interactive dashboard displaying total spend, approval turnaround rate, status breakdown, and top vendor charts.
  - **Automated Binary PDF Generation**: Dynamic server-side rendering of official PO invoice PDFs using `pdfkit` with custom corporate headers, tables, and tax summaries.
  - **Live Audit Trail & Status Timeline**: Visual step-by-step timeline on order details showing previous status, new status, reviewer identity, and review comments.
  - **AI Product Catalog Assistant**: Integrated AI module that takes product names, SKUs, and categories to automatically synthesize polished enterprise descriptions.
  - **CSV Export Engine**: One-click export of procurement and vendor analytics for financial reporting.

> **🗣️ Speaking Notes (Viva Presentation):**
> *"Beyond basic CRUD operations, our system includes advanced enterprise modules. We have a built-in server-side PDF generator using PDFKit that creates high-resolution invoices on demand. We integrated an AI catalog assistant that drafts professional product descriptions for warehouse managers. Furthermore, every status change records the timestamp, user ID, and comments in a dedicated audit log."*

---

### Slide 9: Testing, Quality Assurance & Cloud Deployment
* **Slide Title**: Quality Assurance & Cloud Production Deployment
* **Verification & Testing Results**:
  - **39 Automated Integration Tests**: 100% Passing (0 failures) covering Authentication, RBAC, Validation, Edge cases, Negative inputs, and ACID rollback.
  - **Security Test Coverage**: Verified rejection of forged JWT tokens, SQL injection patterns, and unauthorized role escalations.
* **Production Deployment Details**:
  - **Live Web App**: `https://erp-backend-production-e6ac0611.up.railway.app`
  - **Managed Cloud Database**: MySQL 8.0 on Railway with persistent volume storage.
  - **Self-Healing Migrations**: Container auto-initializes tables and seed records on first launch.
  - **CI/CD Pipeline**: GitHub repository `sahushubhftp800-ctrl/ERP-Purchase` automatically triggers cloud build and deployment on push.

> **🗣️ Speaking Notes (Viva Presentation):**
> *"To ensure software reliability, we built a comprehensive test suite of 39 automated integration test cases covering positive, negative, and edge scenarios—achieving a 100% pass rate. Furthermore, this project is not just running locally; it is live in production on Railway Cloud with automated continuous deployment directly from our GitHub repository."*

---

### Slide 10: Conclusion, Future Scope & Q&A
* **Slide Title**: Conclusion & Future Enhancements
* **Summary of Achievements**:
  - Successfully built a complete, production-ready, full-stack ERP procurement system.
  - Solved manual spreadsheet errors with automated 5% GST calculations and server-verified catalog prices.
  - Delivered transparent multi-role approval workflow with live audit logs and instant PDF export.
* **Future Scope**:
  - **Multi-Currency Support**: Dynamic currency conversion for international cross-border vendors.
  - **Automated Email Notifications**: Triggering SendGrid/SMTP emails to vendors when POs are approved.
  - **Mobile ERP Companion App**: React Native mobile app for executive on-the-go approvals.
  - **Vendor Portal**: Dedicated portal for suppliers to acknowledge orders and upload shipment tracking details.
* **Thank You & Q&A**: Inviting questions from the evaluation panel.

> **🗣️ Speaking Notes (Viva Presentation):**
> *"In conclusion, this project demonstrates how modern full-stack technologies—React, Node.js, and MySQL—can transform legacy corporate procurement into a fast, transparent, and error-free digital process. In the future, we plan to add multi-currency conversion, supplier portals, and mobile notifications. Thank you very much for your time and guidance. I am now open to your questions and would be delighted to demonstrate the live application."*
