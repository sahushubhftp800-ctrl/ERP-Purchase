const db = require('../config/db');
const { generatePurchaseOrderPdf } = require('../utils/pdfGenerator');
const logAudit = require('../utils/auditLogger');

// Helper to generate next unique PO Number safely
const generatePoNumber = async (connection) => {
  const currentYear = new Date().getFullYear();
  const prefix = `PO-${currentYear}-`;

  // Fetch the latest PO number for current year with row lock
  const [rows] = await connection.query(
    'SELECT po_number FROM purchase_orders WHERE po_number LIKE ? ORDER BY id DESC LIMIT 1 FOR UPDATE',
    [`${prefix}%`]
  );

  let nextSequence = 1;
  if (rows.length > 0) {
    const lastNumber = rows[0].po_number;
    const parts = lastNumber.split('-');
    if (parts.length === 3) {
      const parsed = parseInt(parts[2], 10);
      if (!isNaN(parsed)) {
        nextSequence = parsed + 1;
      }
    }
  }

  const paddedSequence = String(nextSequence).padStart(4, '0');
  return `${prefix}${paddedSequence}`;
};

// GET /api/orders - List all purchase orders with filters
exports.getOrders = async (req, res) => {
  try {
    const { status, vendor_id, search, start_date, end_date } = req.query;

    let sql = `
      SELECT 
        po.id,
        po.po_number,
        po.order_date,
        po.expected_delivery_date,
        po.status,
        po.subtotal,
        po.tax_rate,
        po.tax_amount,
        po.grand_total,
        po.created_at,
        v.id AS vendor_id,
        v.vendor_name,
        v.email AS vendor_email,
        u.name AS created_by_name,
        u.email AS created_by_email,
        appr.name AS approved_by_name,
        COUNT(poi.id) AS total_items
      FROM purchase_orders po
      JOIN vendors v ON po.vendor_id = v.id
      JOIN users u ON po.created_by = u.id
      LEFT JOIN users appr ON po.approved_by = appr.id
      LEFT JOIN purchase_order_items poi ON po.id = poi.order_id
    `;

    const conditions = [];
    const params = [];

    if (status && status !== 'All') {
      conditions.push('po.status = ?');
      params.push(status);
    }

    if (vendor_id) {
      conditions.push('po.vendor_id = ?');
      params.push(vendor_id);
    }

    if (search) {
      conditions.push('(po.po_number LIKE ? OR v.vendor_name LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term);
    }

    if (start_date) {
      conditions.push('po.order_date >= ?');
      params.push(start_date);
    }

    if (end_date) {
      conditions.push('po.order_date <= ?');
      params.push(end_date);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' GROUP BY po.id ORDER BY po.id DESC';

    const [orders] = await db.query(sql, params);
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching purchase orders.' });
  }
};

// GET /api/orders/:id - Get full order details with line items and history
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch order header
    const [orders] = await db.query(
      `SELECT 
        po.*,
        v.vendor_name,
        v.email AS vendor_email,
        v.phone AS vendor_phone,
        v.address AS vendor_address,
        v.gst_number AS vendor_gst,
        v.contact_person AS vendor_contact_person,
        u.name AS created_by_name,
        u.email AS created_by_email,
        appr.name AS approved_by_name,
        appr.email AS approved_by_email
      FROM purchase_orders po
      JOIN vendors v ON po.vendor_id = v.id
      JOIN users u ON po.created_by = u.id
      LEFT JOIN users appr ON po.approved_by = appr.id
      WHERE po.id = ?`,
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Purchase order not found.' });
    }

    const order = orders[0];

    // Fetch line items
    const [items] = await db.query(
      `SELECT 
        poi.*,
        p.sku,
        p.category,
        p.uom,
        p.stock_quantity AS current_stock
      FROM purchase_order_items poi
      JOIN products p ON poi.product_id = p.id
      WHERE poi.order_id = ?
      ORDER BY poi.id ASC`,
      [id]
    );

    // Fetch status history
    const [history] = await db.query(
      `SELECT 
        osh.*,
        u.name AS changed_by_name,
        u.role AS changed_by_role
      FROM order_status_history osh
      JOIN users u ON osh.changed_by = u.id
      WHERE osh.order_id = ?
      ORDER BY osh.created_at ASC`,
      [id]
    );

    res.json({
      success: true,
      order,
      items,
      history
    });
  } catch (error) {
    console.error('Fetch single order error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching purchase order details.' });
  }
};

// POST /api/orders - Create Purchase Order with atomic transaction and backend verification
exports.createOrder = async (req, res) => {
  // Grab a dedicated connection from pool for transaction
  const connection = await db.getConnection();

  try {
    const {
      vendor_id,
      order_date,
      expected_delivery_date,
      payment_terms,
      notes,
      items,
      status: initialStatus
    } = req.body;

    // Validation
    if (!vendor_id) {
      return res.status(400).json({ success: false, message: 'Vendor is required.' });
    }

    if (!order_date) {
      return res.status(400).json({ success: false, message: 'Order date is required.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one product item must be added.' });
    }

    // Begin atomic transaction
    await connection.beginTransaction();

    // Verify vendor exists
    const [vendorRows] = await connection.query('SELECT id, vendor_name FROM vendors WHERE id = ?', [vendor_id]);
    if (vendorRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Selected vendor does not exist.' });
    }

    // Verify and calculate every line item securely from database prices!
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const productId = parseInt(item.product_id, 10);
      const quantity = parseInt(item.quantity, 10);

      if (!productId || isNaN(productId)) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Invalid product selection in order items.' });
      }

      if (!quantity || isNaN(quantity) || quantity <= 0) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Quantity must be a positive number for all items.' });
      }

      // Fetch authentic product details directly from MySQL
      const [productRows] = await connection.query(
        'SELECT id, product_name, price FROM products WHERE id = ?',
        [productId]
      );

      if (productRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ success: false, message: `Product ID ${productId} not found.` });
      }

      const prod = productRows[0];
      const unitPrice = parseFloat(prod.price);
      const lineTotal = Math.round(unitPrice * quantity * 100) / 100;
      calculatedSubtotal += lineTotal;

      validatedItems.push({
        product_id: prod.id,
        product_name: prod.product_name,
        quantity,
        unit_price: unitPrice,
        line_total: lineTotal,
        notes: item.notes || null
      });
    }

    // Tax calculation (5% standard default as requested)
    const taxRate = parseFloat(process.env.TAX_RATE || '5.00');
    const taxAmount = Math.round(calculatedSubtotal * (taxRate / 100) * 100) / 100;
    const grandTotal = Math.round((calculatedSubtotal + taxAmount) * 100) / 100;

    // Status: can be Draft or Submitted
    const status = initialStatus === 'Submitted' ? 'Submitted' : 'Draft';

    // Generate unique PO Number
    const poNumber = await generatePoNumber(connection);

    // Insert master PO record
    const [orderResult] = await connection.query(
      `INSERT INTO purchase_orders 
       (po_number, vendor_id, created_by, order_date, expected_delivery_date, status, subtotal, tax_rate, tax_amount, grand_total, payment_terms, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        poNumber,
        vendor_id,
        req.user.id,
        order_date,
        expected_delivery_date || null,
        status,
        calculatedSubtotal,
        taxRate,
        taxAmount,
        grandTotal,
        payment_terms || 'Net 30 Days',
        notes || null
      ]
    );

    const orderId = orderResult.insertId;

    // Insert line items
    for (const vItem of validatedItems) {
      await connection.query(
        `INSERT INTO purchase_order_items (order_id, product_id, product_name, quantity, unit_price, line_total, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, vItem.product_id, vItem.product_name, vItem.quantity, vItem.unit_price, vItem.line_total, vItem.notes]
      );
    }

    // Insert status history entry
    const initialComment = status === 'Submitted'
      ? 'Purchase order created and submitted for approval'
      : 'Purchase order created in Draft status';

    await connection.query(
      'INSERT INTO order_status_history (order_id, status, changed_by, comment) VALUES (?, ?, ?, ?)',
      [orderId, status, req.user.id, initialComment]
    );

    // Audit log
    await logAudit(req.user.id, 'CREATE_PO', `Created ${poNumber} for vendor ${vendorRows[0].vendor_name} (Total: ₹${grandTotal})`, connection);

    // Commit transaction
    await connection.commit();

    res.status(201).json({
      success: true,
      message: `Purchase order ${poNumber} created successfully.`,
      orderId,
      po_number: poNumber,
      subtotal: calculatedSubtotal,
      tax_amount: taxAmount,
      grand_total: grandTotal,
      status
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Transaction rolled back: Server error while creating purchase order.' });
  } finally {
    connection.release();
  }
};

// PUT /api/orders/:id - Update order and items (only allowed if status is Draft)
exports.updateOrder = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { id } = req.params;
    const {
      vendor_id,
      order_date,
      expected_delivery_date,
      payment_terms,
      notes,
      items,
      status: nextStatus
    } = req.body;

    await connection.beginTransaction();

    // Check existing order
    const [existing] = await connection.query(
      'SELECT id, po_number, status, created_by FROM purchase_orders WHERE id = ? FOR UPDATE',
      [id]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Purchase order not found.' });
    }

    const currentOrder = existing[0];

    // Only allow editing if in Draft status
    if (currentOrder.status !== 'Draft') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Orders in '${currentOrder.status}' status cannot be modified. Only Draft orders can be updated.`
      });
    }

    // Verify and calculate items
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const productId = parseInt(item.product_id, 10);
      const quantity = parseInt(item.quantity, 10);

      const [productRows] = await connection.query(
        'SELECT id, product_name, price FROM products WHERE id = ?',
        [productId]
      );

      if (productRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ success: false, message: `Product ID ${productId} not found.` });
      }

      const prod = productRows[0];
      const unitPrice = parseFloat(prod.price);
      const lineTotal = Math.round(unitPrice * quantity * 100) / 100;
      calculatedSubtotal += lineTotal;

      validatedItems.push({
        product_id: prod.id,
        product_name: prod.product_name,
        quantity,
        unit_price: unitPrice,
        line_total: lineTotal,
        notes: item.notes || null
      });
    }

    const taxRate = parseFloat(process.env.TAX_RATE || '5.00');
    const taxAmount = Math.round(calculatedSubtotal * (taxRate / 100) * 100) / 100;
    const grandTotal = Math.round((calculatedSubtotal + taxAmount) * 100) / 100;

    const newStatus = nextStatus === 'Submitted' ? 'Submitted' : 'Draft';

    // Update master order
    await connection.query(
      `UPDATE purchase_orders 
       SET vendor_id = ?, order_date = ?, expected_delivery_date = ?, payment_terms = ?, notes = ?, 
           subtotal = ?, tax_rate = ?, tax_amount = ?, grand_total = ?, status = ?
       WHERE id = ?`,
      [
        vendor_id,
        order_date,
        expected_delivery_date || null,
        payment_terms || 'Net 30 Days',
        notes || null,
        calculatedSubtotal,
        taxRate,
        taxAmount,
        grandTotal,
        newStatus,
        id
      ]
    );

    // Delete existing line items and re-insert fresh validated items
    await connection.query('DELETE FROM purchase_order_items WHERE order_id = ?', [id]);

    for (const vItem of validatedItems) {
      await connection.query(
        `INSERT INTO purchase_order_items (order_id, product_id, product_name, quantity, unit_price, line_total, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, vItem.product_id, vItem.product_name, vItem.quantity, vItem.unit_price, vItem.line_total, vItem.notes]
      );
    }

    if (newStatus !== currentOrder.status) {
      await connection.query(
        'INSERT INTO order_status_history (order_id, status, changed_by, comment) VALUES (?, ?, ?, ?)',
        [id, newStatus, req.user.id, `Status updated to ${newStatus}`]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: `Purchase order ${currentOrder.po_number} updated successfully.`
    });
  } catch (error) {
    await connection.rollback();
    console.error('Update order error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating purchase order.' });
  } finally {
    connection.release();
  }
};

// PATCH /api/orders/:id/status - Workflow transitions: Submit, Approve, Reject, Cancel, Receive
exports.updateOrderStatus = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { id } = req.params;
    const { status, comment, rejection_reason } = req.body;
    const user = req.user;

    const validStatuses = ['Draft', 'Submitted', 'Approved', 'Rejected', 'Cancelled', 'Received'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status specified.' });
    }

    await connection.beginTransaction();

    const [rows] = await connection.query(
      'SELECT id, po_number, status, grand_total FROM purchase_orders WHERE id = ? FOR UPDATE',
      [id]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Purchase order not found.' });
    }

    const currentOrder = rows[0];

    // Authorization checks based on role and target status
    if (status === 'Approved' || status === 'Rejected') {
      if (user.role !== 'approver' && user.role !== 'admin') {
        await connection.rollback();
        return res.status(403).json({
          success: false,
          message: 'Only Approvers or Admins can approve or reject purchase orders.'
        });
      }

      if (currentOrder.status !== 'Submitted') {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Cannot ${status.toLowerCase()} an order with current status '${currentOrder.status}'. Order must be 'Submitted' first.`
        });
      }
    }

    if (status === 'Received') {
      if (currentOrder.status !== 'Approved') {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Only Approved purchase orders can be marked as Received.'
        });
      }

      // Automatically increment stock quantities for delivered products!
      const [orderItems] = await connection.query(
        'SELECT product_id, quantity FROM purchase_order_items WHERE order_id = ?',
        [id]
      );

      for (const item of orderItems) {
        await connection.query(
          'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
    }

    // Apply update to purchase_orders table
    if (status === 'Approved') {
      await connection.query(
        'UPDATE purchase_orders SET status = ?, approved_by = ?, approved_at = NOW(), rejection_reason = NULL WHERE id = ?',
        [status, user.id, id]
      );
    } else if (status === 'Rejected') {
      await connection.query(
        'UPDATE purchase_orders SET status = ?, approved_by = ?, approved_at = NOW(), rejection_reason = ? WHERE id = ?',
        [status, user.id, rejection_reason || comment || 'No reason provided', id]
      );
    } else {
      await connection.query('UPDATE purchase_orders SET status = ? WHERE id = ?', [status, id]);
    }

    // Insert status history
    await connection.query(
      'INSERT INTO order_status_history (order_id, status, changed_by, comment) VALUES (?, ?, ?, ?)',
      [id, status, user.id, comment || `Status moved to ${status} by ${user.name}`]
    );

    // Audit log
    await logAudit(user.id, `PO_STATUS_${status.toUpperCase()}`, `PO ${currentOrder.po_number} changed from ${currentOrder.status} to ${status}`, connection);

    await connection.commit();

    res.json({
      success: true,
      message: `Purchase order ${currentOrder.po_number} status updated to ${status}.`,
      status
    });
  } catch (error) {
    await connection.rollback();
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating purchase order status.' });
  } finally {
    connection.release();
  }
};

// DELETE /api/orders/:id - Delete order (Only allowed for Draft orders or by Admin)
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT id, po_number, status FROM purchase_orders WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Purchase order not found.' });
    }

    const order = rows[0];

    if (order.status !== 'Draft' && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: `Orders with status '${order.status}' cannot be deleted. Only 'Draft' orders can be deleted.`
      });
    }

    await db.query('DELETE FROM purchase_orders WHERE id = ?', [id]);

    await logAudit(req.user.id, 'DELETE_PO', `Deleted Purchase Order ${order.po_number}`);

    res.json({ success: true, message: `Purchase order ${order.po_number} deleted successfully.` });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting purchase order.' });
  }
};

// GET /api/orders/:id/pdf - Stream PDF of the Purchase Order
exports.getOrderPdf = async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await db.query(
      `SELECT 
        po.*,
        v.vendor_name,
        v.email AS vendor_email,
        v.phone AS vendor_phone,
        v.address AS vendor_address,
        v.gst_number AS vendor_gst,
        v.contact_person AS vendor_contact_person,
        u.name AS created_by_name,
        appr.name AS approved_by_name
      FROM purchase_orders po
      JOIN vendors v ON po.vendor_id = v.id
      JOIN users u ON po.created_by = u.id
      LEFT JOIN users appr ON po.approved_by = appr.id
      WHERE po.id = ?`,
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Purchase order not found.' });
    }

    const [items] = await db.query(
      `SELECT poi.*, p.sku, p.category 
       FROM purchase_order_items poi
       JOIN products p ON poi.product_id = p.id
       WHERE poi.order_id = ?`,
      [id]
    );

    const order = orders[0];
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${order.po_number}.pdf"`);

    generatePurchaseOrderPdf(order, items, res);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate PDF document.' });
  }
};

