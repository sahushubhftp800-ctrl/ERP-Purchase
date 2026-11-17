const db = require('./db');

async function autoMigrate() {
  try {
    console.log('🔄 Checking database initialization...');
    
    // Disable FK checks temporarily for safe table creation
    await db.query('SET FOREIGN_KEY_CHECKS = 0;');

    // 1. users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'purchaser', 'approver') NOT NULL DEFAULT 'purchaser',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 2. vendors table
    await db.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vendor_name VARCHAR(150) NOT NULL,
        email VARCHAR(150),
        phone VARCHAR(20),
        address TEXT,
        gst_number VARCHAR(20),
        contact_person VARCHAR(100) DEFAULT NULL,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 3. products table
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_name VARCHAR(150) NOT NULL,
        sku VARCHAR(50) NOT NULL UNIQUE,
        category VARCHAR(100),
        description TEXT,
        price DECIMAL(12,2) NOT NULL,
        stock_quantity INT NOT NULL DEFAULT 0,
        unit VARCHAR(20) DEFAULT 'Unit',
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 4. purchase_orders table
    await db.query(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        po_number VARCHAR(50) NOT NULL UNIQUE,
        vendor_id INT NOT NULL,
        created_by INT NOT NULL,
        order_date DATE NOT NULL,
        expected_delivery_date DATE DEFAULT NULL,
        status ENUM('Draft', 'Submitted', 'Approved', 'Rejected', 'Cancelled', 'Received') NOT NULL DEFAULT 'Draft',
        subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        tax_rate DECIMAL(5,2) NOT NULL DEFAULT 5.00,
        tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        grand_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        notes TEXT,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON UPDATE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 5. purchase_order_items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        product_name VARCHAR(150) NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(12,2) NOT NULL,
        line_total DECIMAL(12,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 6. order_status_history table
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_status_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        previous_status VARCHAR(50),
        new_status VARCHAR(50) NOT NULL,
        changed_by INT NOT NULL,
        comments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (changed_by) REFERENCES users(id)
      ) ENGINE=InnoDB;
    `);

    // 7. audit_logs table
    await db.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id INT,
        details JSON,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    await db.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('✅ All 7 tables verified / created successfully.');

    // Seed default users if table is empty
    const [userRows] = await db.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      console.log('🌱 Seeding default users, vendors & products...');
      
      // bcrypt hashes for: admin123, purchaser123, approver123
      await db.query(`
        INSERT INTO users (id, name, email, password, role) VALUES
        (1, 'Admin Officer', 'admin@erp.com', '$2a$10$wE0/H091g61vTz2xZz3kDe4mG7x8Q4k7F8Q4k7F8Q4k7F8Q4k7F8Q', 'admin'),
        (2, 'Priya Sharma (Purchaser)', 'purchaser@erp.com', '$2a$10$wE0/H091g61vTz2xZz3kDe4mG7x8Q4k7F8Q4k7F8Q4k7F8Q4k7F8Q', 'purchaser'),
        (3, 'Rajesh Kumar (Approver)', 'approver@erp.com', '$2a$10$wE0/H091g61vTz2xZz3kDe4mG7x8Q4k7F8Q4k7F8Q4k7F8Q4k7F8Q', 'approver')
        ON DUPLICATE KEY UPDATE name=VALUES(name);
      `);

      // Better bcrypt hashes generated via bcryptjs for consistency:
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const adminPass = await bcrypt.hash('admin123', salt);
      const purchaserPass = await bcrypt.hash('purchaser123', salt);
      const approverPass = await bcrypt.hash('approver123', salt);

      await db.query('UPDATE users SET password = ? WHERE email = ?', [adminPass, 'admin@erp.com']);
      await db.query('UPDATE users SET password = ? WHERE email = ?', [purchaserPass, 'purchaser@erp.com']);
      await db.query('UPDATE users SET password = ? WHERE email = ?', [approverPass, 'approver@erp.com']);

      // Seed vendors
      await db.query(`
        INSERT IGNORE INTO vendors (id, vendor_name, email, phone, address, gst_number, contact_person) VALUES
        (1, 'ABC Tech Supplies Pvt Ltd', 'sales@abctech.com', '+91 9876543210', 'Plot 42, Okhla Phase III, New Delhi - 110020', '07AAAAA0000A1Z5', 'Amit Verma'),
        (2, 'Global Infotech Solutions', 'orders@globalinfotech.in', '+91 9811223344', '1204 Cyber City, DLF Phase 2, Gurugram - 122002', '06BBBBB1111B2Z6', 'Sunita Rao'),
        (3, 'Pinnacle Electronics Ltd', 'contact@pinnacle.co.in', '+91 9822334455', 'B-14 Sector 62, Noida, UP - 201309', '09CCCCC2222C3Z7', 'Vikram Malhotra'),
        (4, 'Apex Hardware Distributors', 'support@apexdistributors.com', '+91 9833445566', '55 Industrial Area, Peenya, Bengaluru - 560058', '29DDDDD3333D4Z8', 'Ramesh Patel'),
        (5, 'Zenith Office Automation', 'info@zenithoffice.com', '+91 9844556677', '88 Andheri East, MIDC, Mumbai - 400093', '27EEEEE4444E5Z9', 'Neha Desai');
      `);

      // Seed products
      await db.query(`
        INSERT IGNORE INTO products (id, product_name, sku, category, description, price, stock_quantity, unit) VALUES
        (1, 'Enterprise Laptop Core i7 16GB', 'SKU-LAP-001', 'Hardware', 'High-performance 14-inch business laptop with Intel Core i7, 16GB DDR5 RAM, 512GB NVMe SSD.', 40000.00, 25, 'Unit'),
        (2, 'UltraSharp 27-inch 4K Monitor', 'SKU-MON-002', 'Peripherals', 'IPS LED backlit monitor with 3840x2160 UHD resolution, 99% sRGB color gamut and USB-C hub.', 22500.00, 40, 'Unit'),
        (3, 'Wireless Mechanical Keyboard', 'SKU-KEY-003', 'Accessories', 'Tenkeyless RGB backlit mechanical keyboard with hot-swappable brown switches and multi-device Bluetooth.', 3500.00, 100, 'Unit'),
        (4, 'Ergonomic Vertical Mouse', 'SKU-MOU-004', 'Accessories', 'Ergonomic 57-degree vertical grip wireless mouse with 4000 DPI sensor and rechargeable battery.', 1800.00, 120, 'Unit'),
        (5, 'Managed 24-Port Gigabit Switch', 'SKU-NET-005', 'Networking', 'Layer 2+ managed gigabit rackmount ethernet switch with 4 SFP uplink ports and PoE+ support.', 18500.00, 15, 'Unit'),
        (6, 'Cat6 High-Speed Ethernet Cable 305m', 'SKU-NET-006', 'Networking', 'Pure copper UTP Cat6 twisted pair networking cable roll for gigabit infrastructure.', 6200.00, 30, 'Roll'),
        (7, 'High-Yield LaserJet Toner Cartridge', 'SKU-OFF-007', 'Office Supplies', 'Genuine black toner cartridge yielding up to 6,000 pages for office laser printers.', 4800.00, 50, 'Unit'),
        (8, '1000VA Line-Interactive UPS', 'SKU-PWR-008', 'Power Backup', 'Automatic voltage regulation UPS with 4 battery-backed sockets and LCD status display.', 5500.00, 20, 'Unit'),
        (9, 'Ergonomic High-Back Executive Chair', 'SKU-FUR-009', 'Furniture', 'Breathable mesh back executive chair with adjustable 3D lumbar support and pneumatic height control.', 11000.00, 18, 'Unit');
      `);

      // Seed sample purchase order
      await db.query(`
        INSERT IGNORE INTO purchase_orders (id, po_number, vendor_id, created_by, order_date, expected_delivery_date, status, subtotal, tax_rate, tax_amount, grand_total, notes)
        VALUES (1, 'PO-2026-0001', 1, 2, '2026-03-01', '2026-03-15', 'Approved', 445000.00, 5.00, 22250.00, 467250.00, 'Q1 IT Hardware infrastructure procurement.');
      `);

      await db.query(`
        INSERT IGNORE INTO purchase_order_items (order_id, product_id, product_name, quantity, unit_price, line_total) VALUES
        (1, 1, 'Enterprise Laptop Core i7 16GB', 10, 40000.00, 400000.00),
        (1, 2, 'UltraSharp 27-inch 4K Monitor', 2, 22500.00, 45000.00);
      `);

      console.log('✅ Default users, vendors, products & sample PO seeded successfully.');
    } else {
      console.log(`✅ Database already seeded (${userRows[0].count} users present).`);
    }
  } catch (err) {
    console.error('❌ Database migration error:', err);
  }
}

module.exports = autoMigrate;
