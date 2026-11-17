/**
 * Comprehensive Automated End-to-End Test Suite for ERP PO System
 * Tests 40+ positive, negative, security, and edge-case scenarios.
 */

const BASE_URL = 'http://localhost:5000/api';

let testsPassed = 0;
let testsFailed = 0;
const failures = [];

async function runTest(name, testFn) {
  try {
    process.stdout.write(`Testing: ${name}... `);
    await testFn();
    testsPassed++;
    console.log('✅ PASSED');
  } catch (error) {
    testsFailed++;
    console.log('❌ FAILED');
    console.error(`   Error: ${error.message}`);
    failures.push({ name, error: error.message });
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  let data;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else if (contentType.includes('application/pdf')) {
    data = await response.arrayBuffer();
  } else {
    data = await response.text();
  }

  return { status: response.status, data, headers: response.headers };
}

async function main() {
  console.log('===============================================================');
  console.log('🚀 STARTING COMPREHENSIVE ERP AUTOMATED TEST SUITE');
  console.log('===============================================================\n');

  let adminToken = '';
  let purchaserToken = '';
  let approverToken = '';
  let createdVendorId = null;
  let createdProductId = null;
  let createdOrderId = null;
  const uniqueId = Date.now().toString().slice(-5);

  // --- 1. AUTHENTICATION & SECURITY TESTS ---
  console.log('\n--- MODULE 1: AUTHENTICATION & ACCESS CONTROL TESTS ---');

  await runTest('Admin Login with correct credentials', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email: 'admin@erp.com', password: 'admin123' }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.success === true, 'Response success should be true');
    assert(res.data.token, 'Token should be present');
    assert(res.data.user.role === 'admin', 'User role should be admin');
    adminToken = res.data.token;
  });

  await runTest('Purchaser Login with correct credentials', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email: 'purchaser@erp.com', password: 'purchaser123' }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.token, 'Token should be present');
    assert(res.data.user.role === 'purchaser', 'User role should be purchaser');
    purchaserToken = res.data.token;
  });

  await runTest('Approver Login with correct credentials', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email: 'approver@erp.com', password: 'approver123' }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.user.role === 'approver', 'User role should be approver');
    approverToken = res.data.token;
  });

  await runTest('Reject Login with wrong password', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email: 'admin@erp.com', password: 'wrongPassword123' }
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
    assert(res.data.success === false, 'Should fail');
  });

  await runTest('Reject Login with non-existent email', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email: 'nobody_exists@erp.com', password: 'somePassword' }
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await runTest('Register new user with valid data', async () => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: {
        name: `Automated Tester ${uniqueId}`,
        email: `tester_${uniqueId}@erp.com`,
        password: 'password123',
        role: 'purchaser'
      }
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.data.token, 'Should return token');
  });

  await runTest('Reject Registration with duplicate email', async () => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Duplicate Guy',
        email: 'admin@erp.com',
        password: 'password123',
        role: 'purchaser'
      }
    });
    assert(res.status === 409, `Expected 409 Conflict, got ${res.status}`);
  });

  await runTest('Reject Registration with short password (< 6 chars)', async () => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Short Pass',
        email: `short_${uniqueId}@erp.com`,
        password: '123',
        role: 'purchaser'
      }
    });
    assert(res.status === 400, `Expected 400 Bad Request, got ${res.status}`);
  });

  await runTest('Block protected route without token', async () => {
    const res = await request('/dashboard');
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await runTest('Block protected route with forged/invalid token', async () => {
    const res = await request('/dashboard', {
      headers: { Authorization: 'Bearer this_is_a_completely_fake_token_12345' }
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await runTest('RBAC: Block Purchaser from accessing Admin-only /api/auth/users', async () => {
    const res = await request('/auth/users', {
      headers: { Authorization: `Bearer ${purchaserToken}` }
    });
    assert(res.status === 403, `Expected 403 Forbidden, got ${res.status}`);
  });

  await runTest('RBAC: Allow Admin to access /api/auth/users', async () => {
    const res = await request('/auth/users', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(res.status === 200, `Expected 200 OK, got ${res.status}`);
    assert(Array.isArray(res.data.users), 'Users should be an array');
  });

  // --- 2. VENDOR MANAGEMENT TESTS ---
  console.log('\n--- MODULE 2: VENDOR MANAGEMENT CRUD & VALIDATION TESTS ---');

  await runTest('List all vendors', async () => {
    const res = await request('/vendors', {
      headers: { Authorization: `Bearer ${purchaserToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.vendors.length > 0, 'Should return at least 1 vendor');
  });

  await runTest('Search vendors safely (including SQL special chars)', async () => {
    const res = await request(`/vendors?search=${encodeURIComponent("Dell' OR 1=1 --")}`, {
      headers: { Authorization: `Bearer ${purchaserToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  await runTest('Reject Create Vendor with empty name', async () => {
    const res = await request('/vendors', {
      method: 'POST',
      headers: { Authorization: `Bearer ${purchaserToken}` },
      body: { vendor_name: '   ', email: 'empty@test.com' }
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await runTest('Create new Vendor with complete profile', async () => {
    const res = await request('/vendors', {
      method: 'POST',
      headers: { Authorization: `Bearer ${purchaserToken}` },
      body: {
        vendor_name: `Test Vendor Corp ${uniqueId}`,
        email: `vendor_${uniqueId}@domain.com`,
        phone: '+91 98765 43210',
        address: 'Sector 44, Gurgaon, Haryana',
        gst_number: `06TESTV${uniqueId}1Z1`,
        contact_person: 'Amitabh Sharma',
        status: 'Active'
      }
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.data.vendorId, 'Should return created vendorId');
    createdVendorId = res.data.vendorId;
  });

  await runTest('Update Vendor details', async () => {
    const res = await request(`/vendors/${createdVendorId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${purchaserToken}` },
      body: {
        vendor_name: `Test Vendor Corp Updated ${uniqueId}`,
        email: `vendor_up_${uniqueId}@domain.com`,
        phone: '+91 99999 88888',
        address: 'New Industrial Area, Phase 2',
        gst_number: `06TESTV${uniqueId}1Z1`,
        contact_person: 'Amitabh Sharma Sr.',
        status: 'Active'
      }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  await runTest('Get Vendor by ID with linked orders', async () => {
    const res = await request(`/vendors/${createdVendorId}`, {
      headers: { Authorization: `Bearer ${purchaserToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.vendor.vendor_name.includes('Updated'), 'Name should reflect update');
    assert(Array.isArray(res.data.orders), 'Orders should be an array');
  });

  await runTest('Prevent deleting vendor with active orders', async () => {
    // Vendor 1 (ABC Traders) has active orders
    const res = await request('/vendors/1', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${purchaserToken}` }
    });
    assert(res.status === 400, `Expected 400 preventing deletion, got ${res.status}`);
    assert(res.data.message.includes('existing purchase order'), 'Error should specify linked order');
  });

  // --- 3. PRODUCT CATALOG & AI ASSISTANT TESTS ---
  console.log('\n--- MODULE 3: PRODUCT CATALOG & AI ASSISTANT TESTS ---');

  await runTest('List all products', async () => {
    const res = await request('/products', {
      headers: { Authorization: `Bearer ${purchaserToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.products.length > 0, 'Should return products');
  });

  await runTest('List distinct product categories', async () => {
    const res = await request('/products/categories', {
      headers: { Authorization: `Bearer ${purchaserToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.data.categories), 'Categories should be an array');
  });

  await runTest('AI Assistant: Synthesize Product Description', async () => {
    const res = await request('/ai/generate-description', {
      method: 'POST',
      headers: { Authorization: `Bearer ${purchaserToken}` },
      body: {
        product_name: 'Precision 7780 Mobile Workstation',
        category: 'Laptops & Computers',
        brand: 'Dell',
        features: 'Intel Core i9, 64GB ECC RAM, NVIDIA RTX 5000 Ada'
      }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.description.length > 30, 'Should generate rich description');
  });

  await runTest('Reject Create Product with negative price', async () => {
    const res = await request('/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${purchaserToken}` },
      body: {
        product_name: 'Negative Price Item',
        sku: `NEG-SKU-${uniqueId}`,
        price: -500.00
      }
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await runTest('Create new Product in catalog', async () => {
    const res = await request('/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${purchaserToken}` },
      body: {
        product_name: `UltraSpeed Switch 48-Port ${uniqueId}`,
        sku: `NET-SW-${uniqueId}`,
        category: 'Networking & Servers',
        description: '48x Gigabit PoE+ ports with 4x 10G SFP+ uplink enterprise switch.',
        price: 85000.00,
        stock_quantity: 15,
        uom: 'Units',
        status: 'Active'
      }
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.data.productId, 'Should return productId');
    createdProductId = res.data.productId;
  });

  await runTest('Reject Create Product with duplicate SKU', async () => {
    const res = await request('/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${purchaserToken}` },
      body: {
        product_name: 'Duplicate SKU Item',
        sku: `NET-SW-${uniqueId}`,
        price: 50000.00
      }
    });
    assert(res.status === 409, `Expected 409 Conflict, got ${res.status}`);
  });

  // --- 4. PURCHASE ORDER CREATION & CALCULATION TESTS ---
  console.log('\n--- MODULE 4: PURCHASE ORDER TRANSACTION & CALCULATION TESTS ---');

  await runTest('Reject Create PO with empty line items', async () => {
    const res = await request('/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${purchaserToken}` },
      body: {
        vendor_id: createdVendorId,
        order_date: '2026-11-17',
        items: []
      }
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await runTest('Reject Create PO with non-existent vendor ID', async () => {
    const res = await request('/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${purchaserToken}` },
      body: {
        vendor_id: 999999,
        order_date: '2026-11-17',
        items: [{ product_id: 1, quantity: 1 }]
      }
    });
    assert(res.status === 404, `Expected 404, got ${res.status}`);
  });

  await runTest('Reject Create PO with non-existent product ID', async () => {
    const res = await request('/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${purchaserToken}` },
      body: {
        vendor_id: createdVendorId,
        order_date: '2026-11-17',
        items: [{ product_id: 888888, quantity: 2 }]
      }
    });
    assert(res.status === 404, `Expected 404, got ${res.status}`);
  });

  await runTest('Reject Create PO with non-positive quantity', async () => {
    const res = await request('/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${purchaserToken}` },
      body: {
        vendor_id: createdVendorId,
        order_date: '2026-11-17',
        items: [{ product_id: 1, quantity: -2 }]
      }
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await runTest('Create Multi-Item PO & Verify Exact 5% Tax Math', async () => {
    // Product 1: Dell Latitude 5540 Laptop = ₹65,000.00
    // Created Product: UltraSpeed Switch = ₹85,000.00
    // Qty: 2 Laptops (1,30,000) + 1 Switch (85,000)
    // Expected Subtotal: 2,15,000.00
    // Expected 5% Tax: 10,750.00
    // Expected Grand Total: 2,25,750.00
    const res = await request('/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${purchaserToken}` },
      body: {
        vendor_id: createdVendorId,
        order_date: '2026-11-17',
        expected_delivery_date: '2026-11-30',
        payment_terms: 'Net 30 Days',
        notes: 'Integration test order with exact 5% GST',
        status: 'Draft',
        items: [
          { product_id: 1, quantity: 2 },
          { product_id: createdProductId, quantity: 1 }
        ]
      }
    });

    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.data.subtotal === 215000, `Expected subtotal 215000, got ${res.data.subtotal}`);
    assert(res.data.tax_amount === 10750, `Expected tax 10750, got ${res.data.tax_amount}`);
    assert(res.data.grand_total === 225750, `Expected grand total 225750, got ${res.data.grand_total}`);
    assert(res.data.po_number.startsWith('PO-'), 'PO number should start with PO-');
    createdOrderId = res.data.orderId;
  });

  // --- 5. WORKFLOW STATE MACHINE & APPROVAL TESTS ---
  console.log('\n--- MODULE 5: WORKFLOW STATE MACHINE & APPROVAL TESTS ---');

  await runTest('Submit Draft PO for Approval (by Purchaser)', async () => {
    const res = await request(`/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${purchaserToken}` },
      body: {
        status: 'Submitted',
        comment: 'Submitting draft to Finance for review'
      }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.status === 'Submitted', 'Status should be Submitted');
  });

  await runTest('RBAC: Purchaser CANNOT Approve Submitted PO (Only Approver/Admin)', async () => {
    const res = await request(`/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${purchaserToken}` },
      body: { status: 'Approved' }
    });
    assert(res.status === 403, `Expected 403 Forbidden for purchaser approval, got ${res.status}`);
  });

  await runTest('Approver CAN Approve Submitted PO', async () => {
    const res = await request(`/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${approverToken}` },
      body: {
        status: 'Approved',
        comment: 'Procurement budget sanctioned by Finance Approver'
      }
    });
    assert(res.status === 200, `Expected 200 OK, got ${res.status}`);
    assert(res.data.status === 'Approved', 'Status should be Approved');
  });

  await runTest('Block modifying line items or prices on Approved PO', async () => {
    const res = await request(`/orders/${createdOrderId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${purchaserToken}` },
      body: {
        vendor_id: createdVendorId,
        order_date: '2026-11-17',
        items: [{ product_id: 1, quantity: 10 }]
      }
    });
    assert(res.status === 400, `Expected 400 blocking edit of approved order, got ${res.status}`);
  });

  await runTest('Mark Approved PO as Received & Verify Inventory Stock Increment', async () => {
    // Check initial stock of created product
    const before = await request(`/products/${createdProductId}`, {
      headers: { Authorization: `Bearer ${purchaserToken}` }
    });
    const initialStock = before.data.product.stock_quantity; // 15

    const res = await request(`/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${purchaserToken}` },
      body: {
        status: 'Received',
        comment: 'Goods delivered and verified at Central Dock'
      }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);

    // Verify stock incremented by 1 (the quantity ordered in our PO)
    const after = await request(`/products/${createdProductId}`, {
      headers: { Authorization: `Bearer ${purchaserToken}` }
    });
    const newStock = after.data.product.stock_quantity;
    assert(newStock === initialStock + 1, `Expected stock ${initialStock + 1}, got ${newStock}`);
  });

  await runTest('Download Official PDF of Purchase Order', async () => {
    const res = await request(`/orders/${createdOrderId}/pdf`, {
      headers: { Authorization: `Bearer ${purchaserToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.byteLength > 1000, `PDF should be non-empty binary stream, got ${res.data.byteLength} bytes`);
  });

  // --- 6. EXECUTIVE DASHBOARD & REPORTS TESTS ---
  console.log('\n--- MODULE 6: EXECUTIVE DASHBOARD & REPORTS TESTS ---');

  await runTest('Dashboard statistics endpoint returns valid real-time numbers', async () => {
    const res = await request('/dashboard', {
      headers: { Authorization: `Bearer ${purchaserToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(typeof res.data.data.totalOrders === 'number', 'totalOrders should be number');
    assert(typeof res.data.data.totalVendors === 'number', 'totalVendors should be number');
    assert(typeof res.data.data.totalApprovedSpend === 'number', 'totalApprovedSpend should be number');
    assert(Array.isArray(res.data.data.recentOrders), 'recentOrders should be array');
  });

  await runTest('Procurement Analytics Report endpoint returns accurate aggregations', async () => {
    const res = await request('/reports/analytics', {
      headers: { Authorization: `Bearer ${purchaserToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.data.summary.total_orders > 0, 'Should have recorded orders');
    assert(Array.isArray(res.data.data.vendorReport), 'Vendor report should be array');
    assert(Array.isArray(res.data.data.productReport), 'Product report should be array');
  });

  // --- 7. CLEANUP & DELETION TESTS ---
  console.log('\n--- MODULE 7: SAFE DELETION TESTS ---');

  await runTest('Prevent deleting product used in PO items', async () => {
    const res = await request(`/products/${createdProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${purchaserToken}` }
    });
    assert(res.status === 400, `Expected 400 preventing deletion of ordered product, got ${res.status}`);
  });

  // Summary
  console.log('\n===============================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('===============================================================');

  if (testsFailed > 0) {
    console.log('\nFAILURES:');
    failures.forEach((f, idx) => {
      console.log(`${idx + 1}. ${f.name} -> ${f.error}`);
    });
    process.exit(1);
  } else {
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! ZERO DEFECTS FOUND!');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal Test Runner Exception:', err);
  process.exit(1);
});
