const PDFDocument = require('pdfkit');

/**
 * Generate a professional ERP Purchase Order PDF document
 * @param {Object} order - Purchase Order master record
 * @param {Array} items - Line items
 * @param {Stream} res - Express response stream
 */
exports.generatePurchaseOrderPdf = (order, items, res) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Stream directly to response
  doc.pipe(res);

  // Set HTTP headers in caller or before piping
  const primaryColor = '#1e3a8a'; // Deep Navy Blue
  const secondaryColor = '#475569';
  const lightBg = '#f8fafc';
  const borderColor = '#cbd5e1';

  // --- HEADER SECTION ---
  doc
    .fillColor(primaryColor)
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('ERP PURCHASE ORDER', 40, 40);

  doc
    .fillColor(secondaryColor)
    .fontSize(10)
    .font('Helvetica')
    .text('Enterprise Procurement & Inventory System', 40, 68)
    .text('GSTIN: 07AAACG1234D1Z9 | contact@enterprise-erp.com', 40, 82)
    .text('HQ: Tech Park Tower B, New Delhi, India 110001', 40, 96);

  // PO Number & Status Badge (Right aligned)
  doc
    .fillColor(primaryColor)
    .fontSize(16)
    .font('Helvetica-Bold')
    .text(order.po_number, 350, 40, { align: 'right' });

  doc
    .fillColor('#0284c7')
    .fontSize(11)
    .font('Helvetica-Bold')
    .text(`Status: ${order.status.toUpperCase()}`, 350, 62, { align: 'right' });

  doc
    .fillColor(secondaryColor)
    .fontSize(9)
    .font('Helvetica')
    .text(`Date: ${new Date(order.order_date).toLocaleDateString('en-IN')}`, 350, 78, { align: 'right' })
    .text(`Terms: ${order.payment_terms || 'Net 30 Days'}`, 350, 92, { align: 'right' });

  // Divider Line
  doc
    .strokeColor(borderColor)
    .lineWidth(1)
    .moveTo(40, 115)
    .lineTo(555, 115)
    .stroke();

  // --- VENDOR & SHIPPING DETAILS ---
  const boxTop = 125;
  const colWidth = 245;

  // Vendor Card
  doc
    .rect(40, boxTop, colWidth, 90)
    .fillAndStroke(lightBg, borderColor);

  doc
    .fillColor(primaryColor)
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('VENDOR INFORMATION', 50, boxTop + 8);

  doc
    .fillColor('#0f172a')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text(order.vendor_name || 'N/A', 50, boxTop + 24)
    .font('Helvetica')
    .fontSize(9)
    .fillColor(secondaryColor)
    .text(`Contact: ${order.vendor_contact_person || 'Purchasing Dept'}`, 50, boxTop + 38)
    .text(`Email: ${order.vendor_email || 'N/A'} | Phone: ${order.vendor_phone || 'N/A'}`, 50, boxTop + 50)
    .text(`GSTIN: ${order.vendor_gst || 'N/A'}`, 50, boxTop + 62)
    .text(`Address: ${order.vendor_address || 'N/A'}`, 50, boxTop + 74, { width: colWidth - 20, ellipsis: true });

  // Ship To Card
  doc
    .rect(310, boxTop, colWidth, 90)
    .fillAndStroke(lightBg, borderColor);

  doc
    .fillColor(primaryColor)
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('DELIVERY & ORDER DETAILS', 320, boxTop + 8);

  doc
    .fillColor('#0f172a')
    .fontSize(9)
    .font('Helvetica')
    .text('Delivery Address: Central Warehouse Dock 3, Tech Park', 320, boxTop + 24)
    .fillColor(secondaryColor)
    .text(`Created By: ${order.created_by_name || 'Procurement Agent'}`, 320, boxTop + 38)
    .text(`Approved By: ${order.approved_by_name || 'Pending Approval'}`, 320, boxTop + 50)
    .text(`Expected Delivery: ${order.expected_delivery_date ? new Date(order.expected_delivery_date).toLocaleDateString('en-IN') : 'Standard Delivery'}`, 320, boxTop + 62);

  // --- LINE ITEMS TABLE ---
  let tableTop = 230;

  // Table Header Background
  doc
    .rect(40, tableTop, 515, 22)
    .fill(primaryColor);

  doc
    .fillColor('#ffffff')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('#', 45, tableTop + 6)
    .text('Product Description', 70, tableTop + 6)
    .text('SKU', 290, tableTop + 6)
    .text('Qty', 370, tableTop + 6, { align: 'right', width: 30 })
    .text('Unit Price (₹)', 410, tableTop + 6, { align: 'right', width: 65 })
    .text('Total (₹)', 485, tableTop + 6, { align: 'right', width: 65 });

  tableTop += 24;

  let alternate = false;
  items.forEach((item, index) => {
    const rowHeight = 24;

    if (alternate) {
      doc.rect(40, tableTop - 2, 515, rowHeight).fill('#f1f5f9');
    }
    alternate = !alternate;

    doc
      .fillColor('#1e293b')
      .fontSize(9)
      .font('Helvetica')
      .text(String(index + 1), 45, tableTop + 4)
      .text(item.product_name, 70, tableTop + 4, { width: 215, ellipsis: true })
      .text(item.sku || 'N/A', 290, tableTop + 4)
      .text(String(item.quantity), 370, tableTop + 4, { align: 'right', width: 30 })
      .text(parseFloat(item.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 }), 410, tableTop + 4, { align: 'right', width: 65 })
      .font('Helvetica-Bold')
      .text(parseFloat(item.line_total).toLocaleString('en-IN', { minimumFractionDigits: 2 }), 485, tableTop + 4, { align: 'right', width: 65 });

    tableTop += rowHeight;
  });

  // Table bottom border
  doc
    .strokeColor(borderColor)
    .lineWidth(1)
    .moveTo(40, tableTop)
    .lineTo(555, tableTop)
    .stroke();

  // --- CALCULATION TOTALS SUMMARY ---
  tableTop += 12;

  const totalsBoxX = 330;
  const totalsBoxWidth = 225;

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor(secondaryColor)
    .text('Subtotal:', totalsBoxX, tableTop)
    .font('Helvetica-Bold')
    .fillColor('#0f172a')
    .text(`₹ ${parseFloat(order.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, totalsBoxX, tableTop, { align: 'right', width: totalsBoxWidth });

  tableTop += 16;
  doc
    .font('Helvetica')
    .fillColor(secondaryColor)
    .text(`GST Tax (${order.tax_rate}%):`, totalsBoxX, tableTop)
    .font('Helvetica-Bold')
    .fillColor('#0f172a')
    .text(`₹ ${parseFloat(order.tax_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, totalsBoxX, tableTop, { align: 'right', width: totalsBoxWidth });

  tableTop += 18;
  doc
    .rect(totalsBoxX - 5, tableTop - 4, totalsBoxWidth + 10, 26)
    .fill('#e0e7ff');

  doc
    .fontSize(11)
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text('Grand Total:', totalsBoxX, tableTop + 4)
    .text(`₹ ${parseFloat(order.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, totalsBoxX, tableTop + 4, { align: 'right', width: totalsBoxWidth });

  // Notes & Remarks
  if (order.notes) {
    tableTop += 38;
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('Notes / Instructions:', 40, tableTop);

    doc
      .fontSize(8.5)
      .font('Helvetica')
      .fillColor(secondaryColor)
      .text(order.notes, 40, tableTop + 14, { width: 300 });
  }

  // --- SIGNATURE SECTION ---
  const footerY = 720;
  doc
    .strokeColor(borderColor)
    .lineWidth(0.8)
    .moveTo(40, footerY)
    .lineTo(200, footerY)
    .moveTo(395, footerY)
    .lineTo(555, footerY)
    .stroke();

  doc
    .fontSize(8.5)
    .font('Helvetica')
    .fillColor(secondaryColor)
    .text('Authorized Purchasing Signatory', 40, footerY + 5)
    .text('Finance / Approver Approval', 395, footerY + 5, { align: 'right', width: 160 })
    .fontSize(7.5)
    .text('This is a computer-generated Purchase Order and is legally binding per organization policy.', 40, 775, { align: 'center', width: 515 });

  doc.end();
};
