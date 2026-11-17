# System Architecture & Technical Specifications
## ERP-Based Purchase Order (PO) Management System

### 1. High-Level 3-Tier Enterprise Architecture

```mermaid
flowchart TD
    subgraph Client_Tier[Client Tier: Presentation Layer]
        ReactApp["React 18 SPA (Vite + Tailwind CSS)"]
        Router["React Router v6 Navigation"]
        AuthCtx["Auth Context & LocalStorage Token Store"]
        AxiosInst["Axios HTTP Client with Bearer Interceptor"]
        UIComp["Tailwind Components: Tables, Cards, Modals, Forms"]
    end

    subgraph App_Tier[Application Tier: Node.js + Express.js API Layer]
        ExpServer["Express REST API (Port 5000)"]
        SecMid["Security: Helmet, CORS, Rate Limiters"]
        AuthMid["JWT Verification & RBAC Authorization Middleware"]
        Controllers["Controllers: Auth, Vendors, Products, Orders, Dashboard, Reports, AI"]
        CalcEngine["Backend Calculation Engine (5% GST & Grand Total)"]
        TxManager["MySQL Transaction Manager (BEGIN, COMMIT, ROLLBACK)"]
        PdfEngine["PDFKit Document Generation Stream"]
        AiEngine["AI Catalog Description Synthesis Engine"]
    end

    subgraph Data_Tier[Data Tier: Persistence Layer]
        MySQLPool["MySQL 8.0 Connection Pool (mysql2/promise)"]
        DBSchema["erp_purchase_system Database"]
        TblUsers["users"]
        TblVendors["vendors"]
        TblProducts["products"]
        TblOrders["purchase_orders"]
        TblItems["purchase_order_items"]
        TblHistory["order_status_history"]
        TblAudit["audit_logs"]
    end

    ReactApp --> AxiosInst
    AxiosInst -->|HTTP / JSON Requests with JWT| ExpServer
    ExpServer --> SecMid --> AuthMid --> Controllers
    Controllers --> CalcEngine
    Controllers --> TxManager
    Controllers --> PdfEngine
    Controllers --> AiEngine
    TxManager --> MySQLPool
    MySQLPool --> DBSchema
    DBSchema --> TblUsers & TblVendors & TblProducts & TblOrders & TblItems & TblHistory & TblAudit
```

---

### 2. Purchase Order Calculation & Integrity Flow

1. **User Action**: The purchaser adds products to an order in the React UI. The UI provides real-time client-side calculation feedback so the user knows estimated totals.
2. **API Request**: When "Submit" is clicked, React sends **only** `product_id` and `quantity`. Frontend prices and totals are purposefully omitted or ignored by the backend.
3. **Database Lookups**: The Express server queries the `products` table directly in MySQL to obtain the true, certified `price` for every line item.
4. **Calculations Applied**:
   $$\text{LineTotal}_i = \text{Quantity}_i \times \text{DatabasePrice}_i$$
   $$\text{Subtotal} = \sum_{i=1}^n \text{LineTotal}_i$$
   $$\text{TaxAmount} = \text{round}\left(\text{Subtotal} \times \frac{5.00}{100}, 2\right)$$
   $$\text{GrandTotal} = \text{Subtotal} + \text{TaxAmount}$$
5. **ACID Transaction**:
   - `connection.beginTransaction()`
   - Generate collision-safe PO Number (`PO-YYYY-XXXX`) using row locking (`FOR UPDATE`)
   - `INSERT INTO purchase_orders`
   - `INSERT INTO purchase_order_items`
   - `INSERT INTO order_status_history`
   - `INSERT INTO audit_logs`
   - `connection.commit()`
   - If any exception occurs: `connection.rollback()`
