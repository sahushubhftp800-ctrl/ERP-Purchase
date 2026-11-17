import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ShoppingCart, 
  Building2, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Save, 
  Send, 
  AlertCircle,
  FileCheck2,
  Calendar,
  CreditCard,
  Calculator
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

export const CreateOrder = ({ isEditMode = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToast } = useToast();

  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [existingPoNumber, setExistingPoNumber] = useState('');

  // Form Header State
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30 Days');
  const [notes, setNotes] = useState('');

  // Dynamic Line Items State
  const [items, setItems] = useState([
    { product_id: '', product_name: '', sku: '', unit_price: 0, quantity: 1, line_total: 0, notes: '' }
  ]);

  // Load catalogs and order if editing
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [vRes, pRes] = await Promise.all([
          api.get('/vendors?status=Active'),
          api.get('/products?status=Active')
        ]);
        if (vRes.data.success) setVendors(vRes.data.vendors);
        if (pRes.data.success) setProducts(pRes.data.products);

        // If in edit mode, fetch existing order
        if (isEditMode && id) {
          const ordRes = await api.get(`/orders/${id}`);
          if (ordRes.data.success) {
            const ord = ordRes.data.order;
            if (ord.status !== 'Draft') {
              addToast(`Orders in '${ord.status}' status cannot be edited.`, 'error');
              navigate(`/orders/${id}`);
              return;
            }
            setExistingPoNumber(ord.po_number);
            setSelectedVendorId(ord.vendor_id);
            const foundV = vRes.data.vendors.find(v => v.id === ord.vendor_id);
            setSelectedVendor(foundV || null);
            setOrderDate(ord.order_date ? ord.order_date.split('T')[0] : '');
            setDeliveryDate(ord.expected_delivery_date ? ord.expected_delivery_date.split('T')[0] : '');
            setPaymentTerms(ord.payment_terms || 'Net 30 Days');
            setNotes(ord.notes || '');

            if (ordRes.data.items && ordRes.data.items.length > 0) {
              setItems(ordRes.data.items.map(it => ({
                product_id: it.product_id,
                product_name: it.product_name,
                sku: it.sku || '',
                unit_price: parseFloat(it.unit_price),
                quantity: it.quantity,
                line_total: parseFloat(it.line_total),
                notes: it.notes || ''
              })));
            }
          }
        }
      } catch (err) {
        setError('Failed to load master catalogs.');
        addToast('Failed to load catalogs or order details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isEditMode, id]);

  const handleVendorChange = (vendorId) => {
    setSelectedVendorId(vendorId);
    const found = vendors.find(v => String(v.id) === String(vendorId));
    setSelectedVendor(found || null);
  };

  const handleProductSelect = (index, productId) => {
    if (!productId) {
      const newItems = [...items];
      newItems[index] = { product_id: '', product_name: '', sku: '', unit_price: 0, quantity: 1, line_total: 0, notes: '' };
      setItems(newItems);
      return;
    }

    // Check duplicate selection across other rows
    const isDuplicate = items.some((it, i) => i !== index && String(it.product_id) === String(productId));
    if (isDuplicate) {
      addToast('This product is already added to another line. Adjust the quantity there instead of duplicating rows.', 'info');
    }

    const prod = products.find(p => String(p.id) === String(productId));
    const newItems = [...items];

    if (prod) {
      const price = parseFloat(prod.price) || 0;
      const qty = parseInt(newItems[index].quantity, 10) || 1;
      newItems[index] = {
        ...newItems[index],
        product_id: prod.id,
        product_name: prod.product_name,
        sku: prod.sku,
        unit_price: price,
        line_total: Math.round(price * qty * 100) / 100
      };
    }

    setItems(newItems);
  };

  const handleQuantityChange = (index, value) => {
    const qty = Math.max(1, parseInt(value, 10) || 1);
    const newItems = [...items];
    const unitPrice = parseFloat(newItems[index].unit_price) || 0;
    newItems[index].quantity = qty;
    newItems[index].line_total = Math.round(unitPrice * qty * 100) / 100;
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { product_id: '', product_name: '', sku: '', unit_price: 0, quantity: 1, line_total: 0, notes: '' }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) {
      addToast('A purchase order must contain at least one item.', 'error');
      return;
    }
    const filtered = items.filter((_, i) => i !== index);
    setItems(filtered);
  };

  // Dynamic Frontend Calculations
  const subtotal = items.reduce((acc, curr) => acc + (parseFloat(curr.line_total) || 0), 0);
  const taxRate = 5.00; // 5% GST
  const taxAmount = Math.round(subtotal * 0.05 * 100) / 100;
  const grandTotal = Math.round((subtotal + taxAmount) * 100) / 100;

  // Form Submission (Create or Update)
  const handleSubmitOrder = async (targetStatus) => {
    setError('');

    if (!selectedVendorId) {
      setError('Please select a supplier/vendor.');
      addToast('Please select a vendor.', 'error');
      return;
    }

    const validItems = items.filter(it => it.product_id && it.quantity > 0);
    if (validItems.length === 0) {
      setError('Please select at least one valid product with quantity > 0.');
      addToast('Please select at least one valid product.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        vendor_id: selectedVendorId,
        order_date: orderDate,
        expected_delivery_date: deliveryDate || null,
        payment_terms: paymentTerms,
        notes,
        status: targetStatus,
        items: validItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          notes: item.notes || null
        }))
      };

      if (isEditMode && id) {
        const res = await api.put(`/orders/${id}`, payload);
        if (res.data.success) {
          addToast(`Purchase Order ${existingPoNumber} updated successfully.`, 'success');
          navigate(`/orders/${id}`);
        }
      } else {
        const res = await api.post('/orders', payload);
        if (res.data.success) {
          addToast(`Purchase Order ${res.data.po_number} created successfully!`, 'success');
          navigate(`/orders/${res.data.orderId}`);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save purchase order.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-medium">Preparing Purchase Order workstation...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(isEditMode ? `/orders/${id}` : '/orders')}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isEditMode ? `Edit Draft Purchase Order (${existingPoNumber})` : 'Create Purchase Order (PO)'}
            </h1>
            <p className="text-xs text-slate-500">
              Multi-product vendor requisition with automatic 5% GST computation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmitOrder('Draft')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmitOrder('Submitted')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Submit for Approval</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* SECTION A: Vendor & Order Header Details */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-600" />
          Section A: Vendor & Order Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Supplier / Vendor *
            </label>
            <select
              value={selectedVendorId}
              onChange={(e) => handleVendorChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              <option value="">-- Choose Vendor --</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vendor_name} ({v.gst_number || 'Unregistered'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Order Date *
            </label>
            <input
              type="date"
              required
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Expected Delivery Date
            </label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
        </div>

        {selectedVendor && (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs animate-in fade-in duration-150">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Contact Person</span>
              <span className="font-semibold text-slate-800">{selectedVendor.contact_person || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Email & Phone</span>
              <span className="text-slate-700">{selectedVendor.email || 'N/A'} • {selectedVendor.phone || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">GSTIN Number</span>
              <span className="font-mono font-semibold text-slate-800">{selectedVendor.gst_number || 'Unregistered'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Dispatch Address</span>
              <span className="text-slate-600 line-clamp-1">{selectedVendor.address || 'Address not registered'}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Terms
            </label>
            <select
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              <option value="Net 30 Days">Net 30 Days</option>
              <option value="Net 15 Days">Net 15 Days</option>
              <option value="Immediate on Delivery">Immediate on Delivery</option>
              <option value="50% Advance, 50% on Delivery">50% Advance, 50% on Delivery</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Internal PO Notes / Delivery Instructions
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Deliver to IT Department Warehouse, Dock 3"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* SECTION B: Dynamic Product Line Items Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-indigo-600" />
            Section B: Products & Line Item Quantities
          </h2>
          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Another Product</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-100">
              <tr>
                <th className="px-3 py-2.5 w-10">#</th>
                <th className="px-3 py-2.5 min-w-[240px]">Product Selection *</th>
                <th className="px-3 py-2.5 w-32">SKU</th>
                <th className="px-3 py-2.5 w-32 text-right">Unit Price (₹)</th>
                <th className="px-3 py-2.5 w-28 text-center">Quantity</th>
                <th className="px-3 py-2.5 w-36 text-right">Line Total (₹)</th>
                <th className="px-3 py-2.5 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50/50">
                  <td className="px-3 py-3 font-semibold text-slate-400">{index + 1}</td>
                  <td className="px-3 py-3">
                    <select
                      value={item.product_id}
                      onChange={(e) => handleProductSelect(index, e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">-- Choose Product --</option>
                      {products.map((p) => {
                        const isAlreadySelected = items.some((it, i) => i !== index && String(it.product_id) === String(p.id));
                        return (
                          <option key={p.id} value={p.id}>
                            {p.product_name} ({formatCurrency(p.price)}) {isAlreadySelected ? '• [Already Added]' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </td>
                  <td className="px-3 py-3 font-mono text-slate-600">{item.sku || '-'}</td>
                  <td className="px-3 py-3 text-right font-medium text-slate-700">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                      className="w-20 px-2 py-1 text-center rounded-lg border border-slate-300 text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-slate-900 text-sm">
                    {formatCurrency(item.line_total)}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Remove Row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION C & D: Calculation Engine & Order Finalization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Automatic Calculation Engine Formula
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The subtotal is computed as the sum of all item line totals. The standard 5.0% GST tax is computed and added to generate the final Grand Total.
          </p>
          <div className="font-mono text-xs p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-indigo-300 space-y-1">
            <p>LineTotal = Quantity × UnitPrice</p>
            <p>Subtotal  = Σ(LineTotal)</p>
            <p>Tax (5%)  = Subtotal × 0.05</p>
            <p>GrandTotal = Subtotal + Tax</p>
          </div>
          <p className="text-[11px] text-slate-400">
            * Note: Backend recalculates all prices directly from MySQL database tables to prevent frontend tampering.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            Financial Calculation Summary
          </h3>

          <div className="flex justify-between text-xs py-1.5 border-b border-slate-100 text-slate-600">
            <span>Items Subtotal:</span>
            <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex justify-between text-xs py-1.5 border-b border-slate-100 text-slate-600">
            <span>GST Tax (5.0%):</span>
            <span className="font-semibold text-slate-800">{formatCurrency(taxAmount)}</span>
          </div>

          <div className="flex justify-between text-base py-3 bg-indigo-50/70 px-3.5 rounded-xl border border-indigo-100 text-indigo-950 font-bold">
            <span>Grand Total:</span>
            <span className="text-indigo-600 text-lg">{formatCurrency(grandTotal)}</span>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(isEditMode ? `/orders/${id}` : '/orders')}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmitOrder('Submitted')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? 'Saving Order...' : isEditMode ? 'Update & Submit Order' : 'Submit Purchase Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
