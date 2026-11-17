-- ==============================================================
-- Seed Data for ERP-Based Purchase Order (PO) Management System
-- Database: erp_purchase_system
-- ==============================================================

USE erp_purchase_system;

-- Clear previous data in reverse foreign-key order
DELETE FROM audit_logs;
DELETE FROM order_status_history;
DELETE FROM purchase_order_items;
DELETE FROM purchase_orders;
DELETE FROM products;
DELETE FROM vendors;
DELETE FROM users;

-- Reset Auto-Increment
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE vendors AUTO_INCREMENT = 1;
ALTER TABLE products AUTO_INCREMENT = 1;
ALTER TABLE purchase_orders AUTO_INCREMENT = 1;
ALTER TABLE purchase_order_items AUTO_INCREMENT = 1;
ALTER TABLE order_status_history AUTO_INCREMENT = 1;
ALTER TABLE audit_logs AUTO_INCREMENT = 1;

-- 1. INSERT USERS (Passwords hashed with bcrypt: admin123, purchaser123, approver123)
INSERT INTO users (id, name, email, password, role) VALUES
(1, 'Vikram Sharma (Admin)', 'admin@erp.com', '$2b$10$e2qnFp8Ygrg2QnUPcM3CrOUNTEiwBefuFDUHrIj8IqSUkZIW1CCLG', 'admin'),
(2, 'Neha Patel (Purchaser)', 'purchaser@erp.com', '$2b$10$wsCDuHNDwIqDikpJvQXfReJClNzVP/Raun/XaZJIqnVYpS5zCV8GK', 'purchaser'),
(3, 'Rajesh Verma (Approver)', 'approver@erp.com', '$2b$10$7GMeoDDVPYXOmPJJrts/KOCtd4AXpKy2nvZkFhFbQfgS2P7qR6srG', 'approver');

-- 2. INSERT VENDORS
INSERT INTO vendors (id, vendor_name, email, phone, address, gst_number, contact_person, status) VALUES
(1, 'ABC Traders & Solutions', 'sales@abctraders.in', '+91 98200 12345', 'Plot 45, Okhla Industrial Area Phase III, New Delhi 110020', '07AAAAA0000A1Z5', 'Anil Gupta', 'Active'),
(2, 'Dell India Corporation Ltd', 'orders@dellindia.com', '+91 80 4040 5000', 'Divyasree Greens, Ground Floor, Challaghatta, Bengaluru 560071', '29AABCD1234F1Z8', 'Pooja Iyer', 'Active'),
(3, 'TechPro Peripherals & Distro', 'support@techprodistro.com', '+91 98450 98765', 'Building 12, HITEC City, Hyderabad 500081', '36AAACP5566G1ZH', 'Suresh Reddy', 'Active'),
(4, 'Prime Logistics & Packaging', 'dispatch@primelogistics.co.in', '+91 22 2876 5432', 'Andheri East Industrial Estate, Mumbai 400093', '27AAACP9988H1Z1', 'Karan Mehta', 'Active'),
(5, 'OfficeCare Hub Enterprise', 'care@officecarehub.in', '+91 99100 44556', 'Sector 62, Electronic City, Noida, UP 201301', '09AAAFO3344J1Z3', 'Meenakshi Rao', 'Active'),
(6, 'Apex Micro Systems', 'b2b@apexmicro.com', '+91 98111 22334', 'Nehru Place IT Market, New Delhi 110019', '07AAACA7788K1Z9', 'Rahul Joshi', 'Active');

-- 3. INSERT PRODUCTS
INSERT INTO products (id, product_name, sku, category, description, price, stock_quantity, uom, status) VALUES
(1, 'Dell Latitude 5540 15.6" Laptop (Intel i7, 16GB, 512GB SSD)', 'IT-LAP-001', 'Laptops & Computers', 'High performance enterprise laptop equipped with 13th Gen Intel Core i7, 16GB DDR5 RAM, and fast 512GB NVMe SSD.', 65000.00, 45, 'Units', 'Active'),
(2, 'ThinkPad E14 Gen 5 Laptop (AMD Ryzen 7, 16GB, 512GB)', 'IT-LAP-002', 'Laptops & Computers', 'Durable business grade notebook with military grade reliability, backlit keyboard and fingerprint reader.', 58000.00, 30, 'Units', 'Active'),
(3, 'HP Wireless Optical Mouse M220', 'IT-ACC-001', 'Peripherals & Accessories', 'Ergonomic 2.4GHz wireless mouse with adjustable DPI and long battery endurance.', 750.00, 150, 'Units', 'Active'),
(4, 'Logitech Mechanical Keyboard K845', 'IT-ACC-002', 'Peripherals & Accessories', 'Full size mechanical keyboard with aluminum top casing and tactile linear switches.', 3500.00, 80, 'Units', 'Active'),
(5, 'Dell 27-inch 4K UHD USB-C Monitor (S2722QC)', 'IT-MON-001', 'Displays & Monitors', 'Crisp 4K UHD IPS panel featuring 65W USB-C power delivery and built-in dual speakers.', 26500.00, 25, 'Units', 'Active'),
(6, 'Cisco Catalyst 24-Port Gigabit Network Switch', 'NET-SW-001', 'Networking & Servers', 'Managed Layer 2/3 enterprise rackmount switch with 4x 10G SFP+ uplinks.', 42000.00, 12, 'Units', 'Active'),
(7, 'Cat6 UTP Ethernet Cable Roll (305 Meters)', 'NET-CAB-001', 'Networking & Servers', 'Pure copper gigabit network cabling for high bandwidth infrastructure deployment.', 6800.00, 40, 'Rolls', 'Active'),
(8, 'Ergonomic High-Back Breathable Mesh Chair', 'FUR-CHR-001', 'Office Furniture', 'Adjustable lumbar support chair with 3D armrests and multi-tilt lock mechanism.', 11500.00, 35, 'Units', 'Active'),
(9, 'HP LaserJet Pro MFP 4104dw Wireless Printer', 'IT-PRN-001', 'Printers & Scanners', 'Fast monochrome laser multifunction printer with dual-band Wi-Fi and automatic two-sided printing.', 28900.00, 18, 'Units', 'Active');

-- 4. INSERT PURCHASE ORDERS
-- PO 1: Approved order (ABC Traders)
-- Subtotal: 2*65000 + 5*750 + 2*3500 = 130000 + 3750 + 7000 = 140750.00
-- Tax 5%: 7037.50
-- Grand Total: 147787.50
INSERT INTO purchase_orders (id, po_number, vendor_id, created_by, order_date, expected_delivery_date, status, subtotal, tax_rate, tax_amount, grand_total, payment_terms, notes, approved_by, approved_at) VALUES
(1, 'PO-2026-0001', 1, 2, '2026-11-01', '2026-11-15', 'Approved', 140750.00, 5.00, 7037.50, 147787.50, 'Net 30 Days', 'Quarterly IT accessories procurement for engineering department.', 3, '2026-11-02 11:30:00');

INSERT INTO purchase_order_items (id, order_id, product_id, product_name, quantity, unit_price, line_total) VALUES
(1, 1, 1, 'Dell Latitude 5540 15.6" Laptop (Intel i7, 16GB, 512GB SSD)', 2, 65000.00, 130000.00),
(2, 1, 3, 'HP Wireless Optical Mouse M220', 5, 750.00, 3750.00),
(3, 1, 4, 'Logitech Mechanical Keyboard K845', 2, 3500.00, 7000.00);

-- PO 2: Submitted / Pending approval (Dell India)
-- Subtotal: 5*65000 + 4*26500 = 325000 + 106000 = 431000.00
-- Tax 5%: 21550.00
-- Grand Total: 452550.00
INSERT INTO purchase_orders (id, po_number, vendor_id, created_by, order_date, expected_delivery_date, status, subtotal, tax_rate, tax_amount, grand_total, payment_terms, notes) VALUES
(2, 'PO-2026-0002', 2, 2, '2026-11-10', '2026-11-25', 'Submitted', 431000.00, 5.00, 21550.00, 452550.00, 'Net 15 Days', 'Hardware refresh for new product design squad.');

INSERT INTO purchase_order_items (id, order_id, product_id, product_name, quantity, unit_price, line_total) VALUES
(4, 2, 1, 'Dell Latitude 5540 15.6" Laptop (Intel i7, 16GB, 512GB SSD)', 5, 65000.00, 325000.00),
(5, 2, 5, 'Dell 27-inch 4K UHD USB-C Monitor (S2722QC)', 4, 26500.00, 106000.00);

-- PO 3: Draft (OfficeCare Hub)
-- Subtotal: 6*11500 = 69000.00
-- Tax 5%: 3450.00
-- Grand Total: 72450.00
INSERT INTO purchase_orders (id, po_number, vendor_id, created_by, order_date, expected_delivery_date, status, subtotal, tax_rate, tax_amount, grand_total, payment_terms, notes) VALUES
(3, 'PO-2026-0003', 5, 2, '2026-11-14', '2026-11-30', 'Draft', 69000.00, 5.00, 3450.00, 72450.00, 'Immediate on Delivery', 'Ergonomic seating upgrade for conference and focus rooms.');

INSERT INTO purchase_order_items (id, order_id, product_id, product_name, quantity, unit_price, line_total) VALUES
(6, 3, 8, 'Ergonomic High-Back Breathable Mesh Chair', 6, 11500.00, 69000.00);

-- PO 4: Received order (TechPro Distro)
-- Subtotal: 1*42000 + 3*6800 = 42000 + 20400 = 62400.00
-- Tax 5%: 3120.00
-- Grand Total: 65520.00
INSERT INTO purchase_orders (id, po_number, vendor_id, created_by, order_date, expected_delivery_date, status, subtotal, tax_rate, tax_amount, grand_total, payment_terms, notes, approved_by, approved_at) VALUES
(4, 'PO-2026-0004', 3, 2, '2026-10-15', '2026-10-25', 'Received', 62400.00, 5.00, 3120.00, 65520.00, 'Net 30 Days', 'Floor 2 network expansion rack upgrade items received and inspected.', 3, '2026-10-16 09:15:00');

INSERT INTO purchase_order_items (id, order_id, product_id, product_name, quantity, unit_price, line_total) VALUES
(7, 4, 6, 'Cisco Catalyst 24-Port Gigabit Network Switch', 1, 42000.00, 42000.00),
(8, 4, 7, 'Cat6 UTP Ethernet Cable Roll (305 Meters)', 3, 6800.00, 20400.00);

-- PO 5: Rejected order (Prime Logistics)
-- Subtotal: 2*28900 = 57800.00
-- Tax 5%: 2890.00
-- Grand Total: 60690.00
INSERT INTO purchase_orders (id, po_number, vendor_id, created_by, order_date, expected_delivery_date, status, subtotal, tax_rate, tax_amount, grand_total, payment_terms, notes, approved_by, approved_at, rejection_reason) VALUES
(5, 'PO-2026-0005', 4, 2, '2026-10-28', '2026-11-05', 'Rejected', 57800.00, 5.00, 2890.00, 60690.00, 'Advance 50%', 'Urgent printer request for operations team.', 3, '2026-10-29 14:00:00', 'Budget exhausted for Q3 printer replacement; defer to Q4.');

INSERT INTO purchase_order_items (id, order_id, product_id, product_name, quantity, unit_price, line_total) VALUES
(9, 5, 9, 'HP LaserJet Pro MFP 4104dw Wireless Printer', 2, 28900.00, 57800.00);

-- 5. INSERT ORDER STATUS HISTORY
INSERT INTO order_status_history (order_id, status, changed_by, comment) VALUES
(1, 'Draft', 2, 'Purchase order drafted by Purchaser Neha Patel'),
(1, 'Submitted', 2, 'Submitted for managerial approval'),
(1, 'Approved', 3, 'Approved by Rajesh Verma (Finance Manager)'),
(2, 'Draft', 2, 'Purchase order created for design engineering team'),
(2, 'Submitted', 2, 'Submitted for approval to Rajesh Verma'),
(3, 'Draft', 2, 'Created initial draft for ergonomic seating review'),
(4, 'Draft', 2, 'Initiated network switch procurement'),
(4, 'Submitted', 2, 'Submitted to finance for review'),
(4, 'Approved', 3, 'Approved with immediate processing priority'),
(4, 'Received', 2, 'All hardware delivered at dock, verified and tagged'),
(5, 'Draft', 2, 'Drafted printer request'),
(5, 'Submitted', 2, 'Submitted for sign-off'),
(5, 'Rejected', 3, 'Rejected: Budget exhausted for Q3 printer replacement; defer to Q4');

-- 6. INSERT AUDIT LOGS
INSERT INTO audit_logs (user_id, action, details) VALUES
(1, 'SYSTEM_INIT', 'Database seeded with default ERP enterprise records'),
(2, 'CREATE_PO', 'Created Purchase Order PO-2026-0001 for vendor ABC Traders'),
(3, 'APPROVE_PO', 'Approved Purchase Order PO-2026-0001 (Amount: INR 1,47,787.50)'),
(2, 'CREATE_PO', 'Created Purchase Order PO-2026-0002 for vendor Dell India Corporation');
