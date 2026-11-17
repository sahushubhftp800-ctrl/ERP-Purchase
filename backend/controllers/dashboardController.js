const db = require('../config/db');

// GET /api/dashboard - Comprehensive real-time ERP analytics and statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. KPI Counts
    const [[vendorCount]] = await db.query('SELECT COUNT(*) AS total FROM vendors');
    const [[productCount]] = await db.query('SELECT COUNT(*) AS total FROM products');
    const [[orderCount]] = await db.query('SELECT COUNT(*) AS total FROM purchase_orders');

    // 2. Orders by Status
    const [statusCounts] = await db.query(`
      SELECT 
        status, 
        COUNT(*) AS count,
        COALESCE(SUM(grand_total), 0) AS total_value
      FROM purchase_orders 
      GROUP BY status
    `);

    // Map counts by status for instant lookup
    const statusMap = {
      Draft: 0,
      Submitted: 0,
      Approved: 0,
      Rejected: 0,
      Received: 0,
      Cancelled: 0
    };

    let totalApprovedSpend = 0;

    statusCounts.forEach((row) => {
      statusMap[row.status] = row.count;
      if (row.status === 'Approved' || row.status === 'Received') {
        totalApprovedSpend += parseFloat(row.total_value);
      }
    });

    // 3. Recent Purchase Orders
    const [recentOrders] = await db.query(`
      SELECT 
        po.id,
        po.po_number,
        po.order_date,
        po.status,
        po.grand_total,
        v.vendor_name,
        u.name AS created_by_name
      FROM purchase_orders po
      JOIN vendors v ON po.vendor_id = v.id
      JOIN users u ON po.created_by = u.id
      ORDER BY po.id DESC
      LIMIT 6
    `);

    // 4. Monthly Spend Trend (last 6 months)
    const [monthlyTrend] = await db.query(`
      SELECT 
        DATE_FORMAT(order_date, '%b %Y') AS month_label,
        DATE_FORMAT(order_date, '%Y-%m') AS sort_month,
        COUNT(*) AS order_count,
        COALESCE(SUM(grand_total), 0) AS total_amount
      FROM purchase_orders
      WHERE status IN ('Approved', 'Received', 'Submitted')
      GROUP BY sort_month, month_label
      ORDER BY sort_month DESC
      LIMIT 6
    `);

    // 5. Top 5 Vendors by Spend
    const [topVendors] = await db.query(`
      SELECT 
        v.id,
        v.vendor_name,
        COUNT(po.id) AS order_count,
        COALESCE(SUM(po.grand_total), 0) AS total_spend
      FROM vendors v
      JOIN purchase_orders po ON v.id = po.vendor_id
      WHERE po.status IN ('Approved', 'Received')
      GROUP BY v.id, v.vendor_name
      ORDER BY total_spend DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        totalVendors: vendorCount.total,
        totalProducts: productCount.total,
        totalOrders: orderCount.total,
        pendingApprovals: statusMap.Submitted,
        approvedOrders: statusMap.Approved,
        rejectedOrders: statusMap.Rejected,
        draftOrders: statusMap.Draft,
        receivedOrders: statusMap.Received,
        totalApprovedSpend: Math.round(totalApprovedSpend * 100) / 100,
        statusBreakdown: statusMap,
        recentOrders,
        monthlyTrend: monthlyTrend.reverse(),
        topVendors
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching dashboard statistics.' });
  }
};
