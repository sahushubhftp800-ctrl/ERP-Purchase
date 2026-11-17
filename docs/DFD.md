# Data Flow Diagrams (DFD)
## ERP-Based Purchase Order (PO) Management System

### 1. Level 0 DFD (Context Diagram)

The Level 0 Context Diagram represents the entire ERP system as a single central process interacting with external entities (Purchaser, Approver, Admin, Vendor, and MySQL Database).

```mermaid
flowchart TD
    subgraph External_Entities[External Entities]
        P[Purchaser]
        A[Approver / Finance Manager]
        ADM[System Administrator]
        V[Vendor / Supplier]
    end

    ERP((0.0 ERP Purchase Order System))

    DB[(MySQL Relational Database)]

    P -->|Vendor & Product Inputs, PO Items| ERP
    ERP -->|PO Drafts, Status Notifications, PDF Previews| P

    A -->|Approval / Rejection Sign-off, Feedback| ERP
    ERP -->|Pending Orders Queue, Value Summaries| A

    ADM -->|User Roles, System Configurations, Master Controls| ERP
    ERP -->|Audit Trails, System Reports, Metrics| ADM

    ERP -->|Approved Purchase Orders, Dispatch Requests| V

    ERP <-->|Read / Write Transactions, State Changes| DB
```

---

### 2. Level 1 DFD (Decomposed Sub-Processes)

Level 1 breaks down the main system into its functional sub-processes:

```mermaid
flowchart TD
    User([User: Admin / Purchaser / Approver])

    P1((1.0 Authentication & RBAC))
    P2((2.0 Vendor Master Management))
    P3((3.0 Product Catalog Management))
    P4((4.0 PO Creation & Calculation Engine))
    P5((5.0 Approval Workflow Engine))
    P6((6.0 Inventory Stock Sync))
    P7((7.0 PDF Generation & Reporting))

    D1[(D1: Users Store)]
    D2[(D2: Vendors Store)]
    D3[(D3: Products Store)]
    D4[(D4: Purchase Orders Store)]
    D5[(D5: PO Items Store)]
    D6[(D6: Audit & History Store)]

    User -->|Login Credentials| P1
    P1 -->|Verify Hash & Issue JWT| D1

    User -->|Vendor Profile & GSTIN| P2
    P2 <-->|CRUD Vendor Records| D2

    User -->|Product SKU, Pricing, AI Spec| P3
    P3 <-->|CRUD Product Records| D3

    User -->|Select Vendor & Line Items| P4
    P4 -->|Fetch Verified Unit Prices| D3
    P4 -->|Compute Subtotal, 5% GST, Grand Total| P4
    P4 -->|Save Master PO in Transaction| D4
    P4 -->|Save Line Items| D5
    P4 -->|Log Creation Activity| D6

    User -->|Approve / Reject Action| P5
    P5 -->|Update PO Status| D4
    P5 -->|Record Transition & Comment| D6

    P5 -->|On Goods Received| P6
    P6 -->|Increment Warehouse Quantity| D3

    D4 & D5 & D2 -->|Order & Financial Data| P7
    P7 -->|Generate Official PDF Stream / Analytics| User
```
