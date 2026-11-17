const db = require('../config/db');
const logAudit = require('../utils/auditLogger');

// Get All Vendors (with optional search and order counts)
exports.getVendors = async (req, res) => {
  try {
    const { search, status } = req.query;
    let sql = `
      SELECT v.*, 
        COUNT(po.id) AS total_orders,
        COALESCE(SUM(CASE WHEN po.status IN ('Approved', 'Received') THEN po.grand_total ELSE 0 END), 0) AS total_spend
      FROM vendors v
      LEFT JOIN purchase_orders po ON v.id = po.vendor_id
    `;
    const params = [];
    const conditions = [];

    if (search) {
      conditions.push('(v.vendor_name LIKE ? OR v.email LIKE ? OR v.phone LIKE ? OR v.gst_number LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (status) {
      conditions.push('v.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' GROUP BY v.id ORDER BY v.id DESC';

    const [vendors] = await db.query(sql, params);
    res.json({ success: true, count: vendors.length, vendors });
  } catch (error) {
    console.error('Fetch vendors error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching vendors.' });
  }
};

// Get Vendor By ID with their Purchase Orders
exports.getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const [vendors] = await db.query('SELECT * FROM vendors WHERE id = ?', [id]);

    if (vendors.length === 0) {
      return res.status(404).json({ success: false, message: 'Vendor not found.' });
    }

    const [orders] = await db.query(
      'SELECT id, po_number, order_date, status, grand_total FROM purchase_orders WHERE vendor_id = ? ORDER BY id DESC',
      [id]
    );

    res.json({
      success: true,
      vendor: vendors[0],
      orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching vendor details.' });
  }
};

// Create Vendor
exports.createVendor = async (req, res) => {
  try {
    const { vendor_name, email, phone, address, gst_number, contact_person, status } = req.body;

    if (!vendor_name || !vendor_name.trim()) {
      return res.status(400).json({ success: false, message: 'Vendor company name is required.' });
    }

    const [result] = await db.query(
      `INSERT INTO vendors (vendor_name, email, phone, address, gst_number, contact_person, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        vendor_name.trim(),
        email ? email.trim() : null,
        phone ? phone.trim() : null,
        address ? address.trim() : null,
        gst_number ? gst_number.toUpperCase().trim() : null,
        contact_person ? contact_person.trim() : null,
        status || 'Active'
      ]
    );

    // Audit log
    await logAudit(req.user.id, 'CREATE_VENDOR', `Added vendor: ${vendor_name} (ID: ${result.insertId})`);

    res.status(201).json({
      success: true,
      message: 'Vendor created successfully.',
      vendorId: result.insertId
    });
  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating vendor.' });
  }
};

// Update Vendor
exports.updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { vendor_name, email, phone, address, gst_number, contact_person, status } = req.body;

    if (!vendor_name || !vendor_name.trim()) {
      return res.status(400).json({ success: false, message: 'Vendor company name is required.' });
    }

    const [result] = await db.query(
      `UPDATE vendors 
       SET vendor_name = ?, email = ?, phone = ?, address = ?, gst_number = ?, contact_person = ?, status = ?
       WHERE id = ?`,
      [
        vendor_name.trim(),
        email ? email.trim() : null,
        phone ? phone.trim() : null,
        address ? address.trim() : null,
        gst_number ? gst_number.toUpperCase().trim() : null,
        contact_person ? contact_person.trim() : null,
        status || 'Active',
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Vendor not found.' });
    }

    res.json({ success: true, message: 'Vendor updated successfully.' });
  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating vendor.' });
  }
};

// Delete Vendor
exports.deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if vendor has purchase orders
    const [orders] = await db.query(
      'SELECT id, po_number FROM purchase_orders WHERE vendor_id = ? LIMIT 1',
      [id]
    );

    if (orders.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete vendor because existing purchase order (${orders[0].po_number}) is linked to it. Consider deactivating instead.`
      });
    }

    const [result] = await db.query('DELETE FROM vendors WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Vendor not found.' });
    }

    res.json({ success: true, message: 'Vendor deleted successfully.' });
  } catch (error) {
    console.error('Delete vendor error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting vendor.' });
  }
};
