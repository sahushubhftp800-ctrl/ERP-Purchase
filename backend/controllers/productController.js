const db = require('../config/db');

// Get All Products (with search, category filter, stock level filter)
exports.getProducts = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let sql = 'SELECT * FROM products';
    const params = [];
    const conditions = [];

    if (search) {
      conditions.push('(product_name LIKE ? OR sku LIKE ? OR description LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY id DESC';

    const [products] = await db.query(sql, params);
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching products.' });
  }
};

// Get Product Categories
exports.getCategories = async (req, res) => {
  try {
    const [categories] = await db.query(
      'SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != "" ORDER BY category ASC'
    );
    res.json({
      success: true,
      categories: categories.map(c => c.category)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
};

// Get Product By ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const [products] = await db.query('SELECT * FROM products WHERE id = ?', [id]);

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, product: products[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching product.' });
  }
};

// Create Product
exports.createProduct = async (req, res) => {
  try {
    const { product_name, sku, category, description, price, stock_quantity, uom, status } = req.body;

    if (!product_name || !sku || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: 'Product name, SKU, and unit price are required.'
      });
    }

    if (parseFloat(price) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative.'
      });
    }

    // Check unique SKU
    const [existing] = await db.query('SELECT id FROM products WHERE sku = ?', [sku.toUpperCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Product with SKU '${sku.toUpperCase()}' already exists.`
      });
    }

    const [result] = await db.query(
      `INSERT INTO products (product_name, sku, category, description, price, stock_quantity, uom, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product_name.trim(),
        sku.toUpperCase().trim(),
        category ? category.trim() : 'General',
        description ? description.trim() : null,
        parseFloat(price),
        parseInt(stock_quantity, 10) || 0,
        uom || 'Units',
        status || 'Active'
      ]
    );

    // Audit log
    await db.query(
      'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
      [req.user.id, 'CREATE_PRODUCT', `Added product: ${product_name} (${sku})`]
    );

    res.status(201).json({
      success: true,
      message: 'Product added successfully.',
      productId: result.insertId
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating product.' });
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, sku, category, description, price, stock_quantity, uom, status } = req.body;

    if (!product_name || !sku || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: 'Product name, SKU, and unit price are required.'
      });
    }

    // Check unique SKU on other products
    const [existing] = await db.query(
      'SELECT id FROM products WHERE sku = ? AND id != ?',
      [sku.toUpperCase().trim(), id]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Another product with SKU '${sku.toUpperCase()}' already exists.`
      });
    }

    const [result] = await db.query(
      `UPDATE products 
       SET product_name = ?, sku = ?, category = ?, description = ?, price = ?, stock_quantity = ?, uom = ?, status = ?
       WHERE id = ?`,
      [
        product_name.trim(),
        sku.toUpperCase().trim(),
        category ? category.trim() : 'General',
        description ? description.trim() : null,
        parseFloat(price),
        parseInt(stock_quantity, 10) || 0,
        uom || 'Units',
        status || 'Active',
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, message: 'Product updated successfully.' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating product.' });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product is in any PO items
    const [used] = await db.query(
      'SELECT id, order_id FROM purchase_order_items WHERE product_id = ? LIMIT 1',
      [id]
    );

    if (used.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete product because it has associated purchase order items. Mark it as Discontinued instead.'
      });
    }

    const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting product.' });
  }
};
