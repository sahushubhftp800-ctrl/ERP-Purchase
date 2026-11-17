# Complete ERP-Based Purchase Order (PO) Management System
### With Vendor & Product Integration, Automatic 5% GST Calculation, Role-Based Access Control, PDF Generation & AI Catalog Assistant

![Status](https://img.shields.io/badge/Status-Fully%20Operational-emerald?style=for-the-badge)
![Tests](https://img.shields.io/badge/Tests-39%2F39%20Passing-brightgreen?style=for-the-badge)
![Architecture](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Express%20%7C%20MySQL-blue?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge)
![License](https://img.shields.io/badge/License-Academic%20Evaluation-purple?style=for-the-badge)

---

## 1. Project Overview

The **ERP Purchase Order (PO) Management System** is a full-stack enterprise web application designed to automate, streamline, and govern the procurement operations of an organization. It bridges suppliers (vendors), product pricing catalogs, dynamic multi-item requisition, automatic GST tax calculation, managerial sign-off, PDF invoicing, and warehouse inventory synchronization.

### 🏢 Key Features
- **Authentication & RBAC**: JWT-based login with role privileges:
  - **Administrator (`admin`)**: System-wide control, user role updates, audit logging.
  - **Procurement Officer (`purchaser`)**: Add vendors, manage products, create, edit, & draft multi-item POs.
  - **Finance Manager (`approver`)**: Review submitted orders, approve or reject with audit trail.
- **Master Vendor Directory**: Maintain complete records including company name, contact person, phone, email, dispatch address, and GSTIN compliance numbers.
- **Master Product Catalog**: Manage inventory items with SKUs, categories, base pricing, and stock counts.
- **AI Catalog Assistant**: Automatically generates enterprise technical specifications and catalog descriptions.
- **Dynamic Purchase Order Requisition**: Add multiple items to a single purchase order with live line totals, automatic subtotal, 5% GST calculation, duplicate item protection, and grand total in Indian Rupees (₹).
- **Backend Price Verification & Transactions**: Product prices are retrieved directly from MySQL to prevent client-side price tampering. Orders and child items are committed inside an atomic MySQL transaction (`BEGIN`, `COMMIT`, `ROLLBACK`).
- **Workflow State Machine**: Supports `Draft` ➔ `Submitted` ➔ `Approved` ➔ `Received` (or `Rejected` / `Cancelled`). Marking an order as `Received` automatically updates product stock quantities!
- **Draft Re-Editing**: Draft orders can be re-opened, edited, and resubmitted seamlessly before approval.
- **Document Export & PDF Generation**: Generates vector-grade official Purchase Order PDFs on demand via PDFKit streaming (`/api/orders/:id/pdf`).
- **Interactive Analytics Dashboard**: Real-time KPI summaries, order status breakdowns, top vendor spends, and downloadable CSV financial reports.
- **Floating Toast System**: Elegant in-app notification feedback (Success, Warning, Error) replacing native alert popups.
- **Unified Single-Port Production Serving**: When built, the Node.js backend serves both the React Single Page App and the REST API from a single port (5000).

---

## 2. Technology Stack

| Layer | Technologies Used | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite 8, Tailwind CSS, Lucide Icons, React Router v6, Axios | Responsive Single Page Application (SPA) UI |
| **Backend** | Node.js, Express.js 5, Helmet, CORS, Rate Limiters | High-throughput REST API & business calculations |
| **Database** | MySQL 8.0, `mysql2/promise` connection pooling | 3NF Relational database with Foreign Key constraints |
| **Security** | JSON Web Tokens (JWT), Bcrypt password hashing | Stateless token authentication & credential security |
| **PDF Engine**| PDFKit | Server-side vector PDF document generation |
| **AI Module** | AI Catalog Assistant Engine | Automatic synthesis of product catalog descriptions |
| **DevOps** | Docker, Docker Compose, Render Config, Vercel Config | Containerization & production cloud deployment |

---

## 3. Pre-Configured Test Credentials

For quick evaluation during college presentations or viva voce, three test accounts with distinct roles are seeded:

| Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@erp.com` | `admin123` | Complete access, change user roles, view all audit logs |
| **Purchaser** | `purchaser@erp.com` | `purchaser123` | Create vendors, add products, create & submit POs, receive stock |
| **Approver** | `approver@erp.com` | `approver123` | Review submitted purchase orders, sign-off or reject |

> 💡 **College Evaluation Feature**: The login screen (`http://localhost:5173/login` or `http://localhost:5000/login`) contains **1-Click Quick Login Buttons** for each role, allowing instant role switching without manual typing!

---

## 4. Mathematical Calculation Engine

When creating a purchase order, calculations are performed using the formula:

$$\text{LineTotal}_i = \text{Quantity}_i \times \text{DatabaseUnitPrice}_i$$
$$\text{Subtotal} = \sum_{i=1}^n \text{LineTotal}_i$$
$$\text{TaxAmount (5\% GST)} = \text{round}\left(\text{Subtotal} \times 0.05, 2\right)$$
$$\text{GrandTotal} = \text{Subtotal} + \text{TaxAmount}$$

---

## 5. Local Setup & Running Instructions

### Option A: Standard Full-Stack Development Mode (Two Terminals)
```bash
# Terminal 1: Backend API (Port 5000)
cd c:\final\backend
npm run dev

# Terminal 2: React Frontend (Port 5173)
cd c:\final\frontend
npm run dev
```

### Option B: Single-Command Production Mode (Port 5000 Only)
The backend is configured to automatically serve the built React frontend from `frontend/dist` alongside all REST APIs:
```bash
# 1. Build the frontend
npm run build

# 2. Start the unified production server
npm start
```
*Access the entire system at: `http://localhost:5000`*

### Option C: 1-Click Docker Containerization
If Docker is installed on the machine, you can run the complete project with zero local dependencies:
```bash
docker compose up --build
```
*Docker initializes MySQL 8.0, executes `schema.sql` and `seed.sql`, builds the frontend, and runs the application on `http://localhost:5000`.*

---

## 6. Running the Automated Test Suite

We provide a comprehensive automated test runner covering 39 positive, negative, security, calculation, and workflow scenarios:

```bash
npm test
```
Or directly:
```bash
node backend/test-suite.js
```

**Results**: 39 Tests executed, 39 Passed, 0 Failed. See full [docs/Test-Report.md](file:///c:/final/docs/Test-Report.md).

---

## 7. Project Directory Structure

```
c:\final\
├── backend/
│   ├── config/
│   │   └── db.js                 # MySQL connection pool configuration
│   ├── controllers/
│   │   ├── authController.js      # Register, login, profile, user role updates
│   │   ├── vendorController.js    # Vendor CRUD and spend tracking
│   │   ├── productController.js   # Product catalog CRUD and category filtering
│   │   ├── orderController.js     # Transactional PO creation, calculations, state transitions
│   │   ├── dashboardController.js # Real-time dashboard KPI metrics
│   │   ├── reportController.js    # Analytical summaries and CSV exports
│   │   └── aiController.js        # AI product catalog description synthesizer
│   ├── middleware/
│   │   └── auth.js                # JWT token verification and RBAC authorization
│   ├── routes/                    # Express REST route definitions
│   ├── utils/
│   │   └── pdfGenerator.js        # PDFKit dynamic purchase order document streamer
│   ├── test-suite.js              # 39-step automated end-to-end test runner
│   ├── .env                       # Environment variables (port, db creds, jwt secret)
│   ├── package.json
│   └── server.js                  # Main server entrypoint (API + SPA static hosting)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx         # App shell with Sidebar, Navbar, and Outlet
│   │   │   ├── Navbar.jsx         # Header bar with user profile & quick action
│   │   │   ├── Sidebar.jsx        # Navigation sidebar with active state highlights
│   │   │   ├── ProtectedRoute.jsx # Route authentication & role guard
│   │   │   └── StatusBadge.jsx    # Visual color-coded badge for order status
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # User login, logout, and token state provider
│   │   │   └── ToastContext.jsx   # Floating animated notification toast provider
│   │   ├── pages/
│   │   │   ├── Login.jsx          # Login screen with 1-click test credential buttons
│   │   │   ├── Register.jsx       # User registration page
│   │   │   ├── Dashboard.jsx      # Metrics cards, status breakdown, recent orders
│   │   │   ├── Vendors.jsx        # Vendor management with add/edit/view modals
│   │   │   ├── Products.jsx       # Product catalog with integrated AI description generator
│   │   │   ├── PurchaseOrders.jsx # Orders table with status tabs & date filters
│   │   │   ├── CreateOrder.jsx    # Multi-product requisition with live calculations & draft edit
│   │   │   ├── OrderDetails.jsx   # Full PO view, status timeline, approve/reject controls, print
│   │   │   ├── Reports.jsx        # Procurement spend reports and CSV export
│   │   │   ├── Users.jsx          # User management and role switching (Admin only)
│   │   │   └── NotFound.jsx       # 404 page
│   │   ├── services/
│   │   │   └── api.js             # Axios instance with Bearer interceptor
│   │   ├── utils/
│   │   │   └── formatters.js      # Indian Rupee (₹) and date formatters
│   │   ├── App.jsx                # React Router v6 routing setup
│   │   ├── index.css              # Tailwind CSS styles and print media rules
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   ├── schema.sql                 # DDL script creating all 7 normalized MySQL tables
│   └── seed.sql                   # Rich Indian enterprise dummy records
│
├── docs/
│   ├── SRS.md                     # Software Requirements Specification
│   ├── ER-Diagram.md              # Mermaid ER Diagram & Normalization defense
│   ├── DFD.md                     # Level 0 and Level 1 Data Flow Diagrams
│   ├── System-Architecture.md     # 3-Tier Enterprise Architecture specs
│   ├── VIVA-QUESTIONS.md          # 25+ Expected viva questions with Hinglish answers
│   ├── Test-Report.md             # Complete QA test report & bug resolution matrix
│   └── Postman_Collection.json    # Complete API collection for Postman
│
├── Dockerfile                     # Multi-stage production container build
├── docker-compose.yml             # 1-click compose for MySQL + App
├── render.yaml                    # Render cloud deployment blueprint
├── vercel.json                    # Vercel deployment configuration
├── package.json                   # Root package with project-wide scripts
└── README.md
```

---

## 8. Deliverables Checklist for College Submission

- [x] Complete React frontend source code with Tailwind CSS
- [x] Complete Node.js + Express backend REST API
- [x] MySQL database schema and enterprise seed script
- [x] Server-side 5% GST calculation engine
- [x] Multi-item transactional order creation with rollback protection
- [x] Official PDF generation and download
- [x] AI product description generator extension
- [x] Comprehensive Automated Integration Test Suite (`npm test` — 39/39 passing)
- [x] Quality Assurance & Bug Resolution Report ([docs/Test-Report.md](file:///c:/final/docs/Test-Report.md))
- [x] Software Requirements Specification ([docs/SRS.md](file:///c:/final/docs/SRS.md))
- [x] Entity-Relationship Diagram ([docs/ER-Diagram.md](file:///c:/final/docs/ER-Diagram.md))
- [x] Data Flow Diagrams ([docs/DFD.md](file:///c:/final/docs/DFD.md))
- [x] System Architecture ([docs/System-Architecture.md](file:///c:/final/docs/System-Architecture.md))
- [x] College Viva Preparation Guide ([docs/VIVA-QUESTIONS.md](file:///c:/final/docs/VIVA-QUESTIONS.md))
- [x] Postman API Collection ([docs/Postman_Collection.json](file:///c:/final/docs/Postman_Collection.json))
- [x] Dockerization & Production Cloud Configurations (`Dockerfile`, `docker-compose.yml`, `render.yaml`, `vercel.json`)
