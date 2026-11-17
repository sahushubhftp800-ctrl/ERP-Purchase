const db = require('../config/db');

// GET /api/reports/analytics - Procurement summary and detailed breakdowns
exports.getAnalyticsReport = async (req, res) => {
  try {
    const { start_date, end_date, vendor_id } = req.query;

    const conditions = [];
    const params = [];

    if (start_date) {
      conditions.push('po.order_date >= ?');
      params.push(start_date);
    }
    if (end_date) {
      conditions.push('po.order_date <= ?');
      params.push(end_date);
    }
    if (vendor_id) {
      conditions.push('po.vendor_id = ?');
      params.push(vendor_id);
    }

    const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

    // 1. Overall Metrics
    const [[metrics]] = await db.query(`
      SELECT 
        COUNT(po.id) AS total_orders,
        COALESCE(SUM(po.subtotal), 0) AS total_subtotal,
        COALESCE(SUM(po.tax_amount), 0) AS total_tax,
        COALESCE(SUM(po.grand_total), 0) AS total_grand_total,
        COALESCE(AVG(po.grand_total), 0) AS average_order_value
      FROM purchase_orders po
      ${whereClause}
    `, params);

    // 2. Vendor-Wise Spend Summary
    const [vendorReport] = await db.query(`
      SELECT 
        v.id,
        v.vendor_name,
        v.gst_number,
        COUNT(po.id) AS orders_count,
        COALESCE(SUM(po.subtotal), 0) AS subtotal,
        COALESCE(SUM(po.tax_amount), 0) AS tax_paid,
        COALESCE(SUM(po.grand_total), 0) AS total_spend
      FROM vendors v
      LEFT JOIN purchase_orders po ON v.id = po.vendor_id ${conditions.length > 0 ? ' AND ' + conditions.join(' AND ') : ''}
      GROUP BY v.id, v.vendor_name, v.gst_number
      ORDER BY total_spend DESC
    `, params);

    // 3. Product-Wise Purchase Volume & Spend
    const [productReport] = await db.query(`
      SELECT 
        p.id,
        p.product_name,
        p.sku,
        p.category,
        COALESCE(SUM(poi.quantity), 0) AS total_quantity_ordered,
        COALESCE(SUM(poi.line_total), 0) AS total_spend
      FROM products p
      LEFT JOIN purchase_order_items poi ON p.id = poi.product_id
      LEFT JOIN purchase_orders po ON poi.order_id = po.id
      ${whereClause}
      GROUP BY p.id, p.product_name, p.sku, p.category
      ORDER BY total_spend DESC
    `, params);

    // 4. Status Distribution
    const [statusReport] = await db.query(`
      SELECT 
        status, 
        COUNT(*) AS count, 
        COALESCE(SUM(grand_total), 0) AS total_value 
      FROM purchase_orders po
      ${whereClause}
      GROUP BY status
    `, params);

    res.json({
      success: true,
      data: {
        summary: metrics,
        vendorReport,
        productReport,
        statusReport
      }
    });
  } catch (error) {
    console.error('Analytics report error:', error);
    res.status(500).json({ success: false, message: 'Server error while generating analytics report.' });
  }
};
