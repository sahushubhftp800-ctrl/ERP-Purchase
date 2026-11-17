# Entity-Relationship (ER) Diagram & Database Design
## ERP-Based Purchase Order (PO) Management System

### 1. Mermaid Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ PURCHASE_ORDERS : "creates"
    USERS ||--o{ PURCHASE_ORDERS : "approves"
    USERS ||--o{ ORDER_STATUS_HISTORY : "transitions"
    USERS ||--o{ AUDIT_LOGS : "triggers"
    VENDORS ||--o{ PURCHASE_ORDERS : "supplies"
    PURCHASE_ORDERS ||--|{ PURCHASE_ORDER_ITEMS : "contains"
    PRODUCTS ||--o{ PURCHASE_ORDER_ITEMS : "referenced_in"
    PURCHASE_ORDERS ||--o{ ORDER_STATUS_HISTORY : "tracks_history"

    USERS {
        int id PK
        string name
        string email UK
        string password
        enum role "admin, purchaser, approver"
        timestamp created_at
    }

    VENDORS {
        int id PK
        string vendor_name
        string email
        string phone
        text address
        string gst_number
        string contact_person
        enum status "Active, Inactive"
        timestamp created_at
    }

    PRODUCTS {
        int id PK
        string product_name
        string sku UK
        string category
        text description
        decimal price
        int stock_quantity
        string uom
        enum status "Active, Discontinued"
        timestamp created_at
    }

    PURCHASE_ORDERS {
        int id PK
        string po_number UK
        int vendor_id FK
        int created_by FK
        date order_date
        date expected_delivery_date
        enum status "Draft, Submitted, Approved, Rejected, Cancelled, Received"
        decimal subtotal
        decimal tax_rate
        decimal tax_amount
        decimal grand_total
        string payment_terms
        text notes
        int approved_by FK
        timestamp approved_at
        text rejection_reason
        timestamp created_at
        timestamp updated_at
    }

    PURCHASE_ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        string product_name
        int quantity
        decimal unit_price
        decimal line_total
        string notes
    }

    ORDER_STATUS_HISTORY {
        int id PK
        int order_id FK
        string status
        int changed_by FK
        text comment
        timestamp created_at
    }

    AUDIT_LOGS {
        int id PK
        int user_id FK
        string action
        text details
        string ip_address
        timestamp created_at
    }
```

---

### 2. Cardinality & Relationship Breakdown

1. **USERS to PURCHASE_ORDERS (1:M)**
   - Ek user (`purchaser` ya `admin`) multiple Purchase Orders create kar sakta hai (`created_by`).
   - Ek purchase order ka exactly ek hi creator hota hai.
   - Separate relationship: Ek user (`approver` ya `admin`) multiple purchase orders ko sign-off / approve kar sakta hai (`approved_by`).

2. **VENDORS to PURCHASE_ORDERS (1:M)**
   - Ek vendor se company multiple times goods mangwa sakti hai (multiple POs).
   - Har individual purchase order sirf ek specific vendor ke naam issue hota hai.
   - `ON DELETE RESTRICT` constraint laga hai: Agar kisi vendor ke against active orders hain, toh accidental deletion block hoti hai.

3. **PURCHASE_ORDERS to PURCHASE_ORDER_ITEMS (1:M)**
   - Ek Purchase Order ke andar multiple line items (different products) ho sakte hain.
   - `ON DELETE CASCADE` laga hai: Agar Draft order delete hota hai, toh uske line items automatically clean ho jaate hain.

4. **PRODUCTS to PURCHASE_ORDER_ITEMS (1:M)**
   - Ek catalog product multiple purchase orders ke andar repeat ho sakta hai.
   - Unit price and line total are snapshot-stored inside `purchase_order_items` taaki future mein product base price update hone par purani historical orders ki accounting alter na ho!

5. **PURCHASE_ORDERS to ORDER_STATUS_HISTORY (1:M)**
   - Har status transition (`Draft` -> `Submitted` -> `Approved` -> `Received`) ka timestamped audit record store hota hai.

---

### 3. Database Normalization (Viva Explanation)

- **1NF (First Normal Form)**:
  - Har column mein atomic (indivisible) values hain.
  - Multi-valued attributes nahi hain (jaise order table ke andar comma-separated product list daalne ke bajaye humne separate `purchase_order_items` table banaya).
- **2NF (Second Normal Form)**:
  - Table already 1NF mein hai aur har non-key column fully functionally dependent hai primary key par.
  - No partial dependency.
- **3NF (Third Normal Form)**:
  - Koi transitive dependency nahi hai ($A \rightarrow B$ and $B \rightarrow C$).
  - Vendor ki address, GST number, aur phone details `vendors` table mein isolated hain; unhe har order mein duplicate nahi kiya gaya. Sirf `vendor_id` foreign key store hoti hai.
