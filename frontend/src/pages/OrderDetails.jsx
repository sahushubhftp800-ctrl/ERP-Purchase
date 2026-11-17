import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Building2, 
  ArrowLeft, 
  Download, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  AlertCircle,
  Truck,
  Send,
  Trash2,
  Calendar,
  CreditCard,
  UserCheck,
  Edit2
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const { addToast } = useToast();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Rejection modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.order);
        setItems(res.data.items);
        setHistory(res.data.history);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch purchase order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  // Handle Status Transitions
  const handleStatusChange = async (targetStatus, extraData = {}) => {
    try {
      setActionLoading(true);
      const res = await api.patch(`/orders/${id}/status`, {
        status: targetStatus,
        ...extraData
      });

      if (res.data.success) {
        addToast(`Order ${order.po_number} status updated to ${targetStatus}!`, 'success');
        setIsRejectModalOpen(false);
        fetchOrderDetails();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Status transition failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Reject Submit
  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      addToast('Please enter an explicit rejection reason.', 'error');
      return;
    }
    handleStatusChange('Rejected', {
      rejection_reason: rejectionReason,
      comment: `Rejected by ${user.name}: ${rejectionReason}`
    });
  };

  // Delete Draft
  const handleDeleteDraft = async () => {
    if (!window.confirm(`Permanently delete Draft Purchase Order ${order.po_number}?`)) {
      return;
    }

    try {
      await api.delete(`/orders/${id}`);
      addToast(`Purchase Order ${order.po_number} deleted.`, 'info');
      navigate('/orders');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete order.', 'error');
    }
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    try {
      addToast('Preparing official PO PDF document...', 'info');
      const response = await api.get(`/orders/${id}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${order.po_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast(`Downloaded ${order.po_number}.pdf`, 'success');
    } catch (err) {
      addToast('Failed to download PDF.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-medium">Fetching Purchase Order record...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-center gap-3">
        <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
        <div>
          <h3 className="font-semibold text-sm">Order Not Found</h3>
          <p className="text-xs text-rose-600">{error || 'Unable to locate specified order.'}</p>
          <Link to="/orders" className="text-xs font-bold text-indigo-600 mt-2 inline-block">
            ← Return to Purchase Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                {order.po_number}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Issued on {formatDate(order.order_date)} by {order.created_by_name}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Approver / Admin Actions */}
          {order.status === 'Submitted' && hasRole(['admin', 'approver']) && (
            <>
              <button
                disabled={actionLoading}
                onClick={() => handleStatusChange('Approved', { comment: `Approved by Approver ${user.name}` })}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Order</span>
              </button>
              <button
                disabled={actionLoading}
                onClick={() => setIsRejectModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Order</span>
              </button>
            </>
          )}

          {/* Draft Actions for Purchaser */}
          {order.status === 'Draft' && hasRole(['admin', 'purchaser']) && (
            <>
              <button
                onClick={() => navigate(`/orders/${id}/edit`)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Draft PO</span>
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleStatusChange('Submitted', { comment: 'Submitted for manager approval' })}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <Send className="w-4 h-4" />
                <span>Submit for Approval</span>
              </button>
              <button
                onClick={handleDeleteDraft}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Draft</span>
              </button>
            </>
          )}

          {/* Received action when goods arrive at warehouse */}
          {order.status === 'Approved' && hasRole(['admin', 'purchaser']) && (
            <button
              disabled={actionLoading}
              onClick={() => handleStatusChange('Received', { comment: 'Shipment delivered at warehouse, inventory updated.' })}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Truck className="w-4 h-4" />
              <span>Mark Received (Update Stock)</span>
            </button>
          )}

          {/* PDF Download Button */}
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download PDF</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print PO</span>
          </button>
        </div>
      </div>

      {/* Rejection Alert if applicable */}
      {order.status === 'Rejected' && order.rejection_reason && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-rose-600" />
            Order Rejection Notice
          </p>
          <p className="text-rose-700">{order.rejection_reason}</p>
        </div>
      )}

      {/* PRINTABLE PURCHASE ORDER DOCUMENT CARD */}
      <div id="printable-po" className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-8 space-y-8">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                ERP PURCHASE ORDER
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                Official
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Enterprise Procurement Management System</p>
            <p className="text-xs text-slate-500">HQ: Tech Park Tower B, New Delhi, India • GSTIN: 07AAACG1234D1Z9</p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-lg font-bold font-mono text-indigo-600">{order.po_number}</p>
            <p className="text-xs text-slate-500 mt-1">Date: {formatDate(order.order_date)}</p>
            <p className="text-xs text-slate-500">Payment Terms: {order.payment_terms || 'Net 30 Days'}</p>
            {order.expected_delivery_date && (
              <p className="text-xs text-slate-500">Expected Delivery: {formatDate(order.expected_delivery_date)}</p>
            )}
          </div>
        </div>

        {/* Vendor & Shipping Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Vendor Details
            </h3>
            <p className="text-sm font-bold text-slate-900">{order.vendor_name}</p>
            <div className="text-xs text-slate-600 space-y-0.5">
              <p>Contact Person: {order.vendor_contact_person || 'Purchasing Contact'}</p>
              <p>Email: {order.vendor_email || 'N/A'}</p>
              <p>Phone: {order.vendor_phone || 'N/A'}</p>
              <p>GSTIN: <span className="font-mono font-semibold">{order.vendor_gst || 'Unregistered'}</span></p>
              <p className="text-slate-500">Address: {order.vendor_address || 'Address not listed'}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-indigo-600" />
              Delivery & Order Routing
            </h3>
            <div className="text-xs text-slate-600 space-y-1">
              <p><span className="font-semibold text-slate-700">Delivery Address:</span> Central Warehouse Dock 3, Tech Park Campus</p>
              <p><span className="font-semibold text-slate-700">Created By:</span> {order.created_by_name} ({order.created_by_email})</p>
              <p><span className="font-semibold text-slate-700">Authorized Approver:</span> {order.approved_by_name ? `${order.approved_by_name} (${formatDate(order.approved_at)})` : 'Pending Approval'}</p>
              <p><span className="font-semibold text-slate-700">Order Status:</span> <span className="font-bold">{order.status}</span></p>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Purchased Products & Line Items
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">#</th>
                  <th className="px-4 py-3">Product Name & Specifications</th>
                  <th className="px-4 py-3 w-28">SKU</th>
                  <th className="px-4 py-3 w-28 text-center">Quantity</th>
                  <th className="px-4 py-3 w-36 text-right">Unit Price (₹)</th>
                  <th className="px-4 py-3 w-40 text-right">Line Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5 text-center font-semibold text-slate-400">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-800">
                      {item.product_name}
                      {item.notes && <p className="text-[10px] text-slate-400 font-normal mt-0.5">{item.notes}</p>}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">
                      {item.sku}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-slate-800">
                      {item.quantity} {item.uom || 'units'}
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-700">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900 text-sm">
                      {formatCurrency(item.line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculation Totals Breakdown */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
          <div className="sm:max-w-md space-y-1">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Special Instructions / Notes:
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              {order.notes || 'Standard procurement terms apply. Goods subject to receiving inspection.'}
            </p>
          </div>

          <div className="w-full sm:w-80 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>Items Subtotal:</span>
              <span className="font-semibold text-slate-800">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>GST Tax ({order.tax_rate}%):</span>
              <span className="font-semibold text-slate-800">{formatCurrency(order.tax_amount)}</span>
            </div>
            <div className="flex justify-between py-2.5 bg-indigo-50 px-3.5 rounded-xl border border-indigo-100 text-indigo-950 font-bold text-sm">
              <span>Grand Total:</span>
              <span className="text-indigo-600 text-base">{formatCurrency(order.grand_total)}</span>
            </div>
          </div>
        </div>

        {/* Authorized Signatures Block */}
        <div className="pt-10 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
          <div>
            <div className="w-48 border-b border-slate-400 mb-2"></div>
            <p className="font-bold text-slate-800">Purchasing Agent</p>
            <p className="text-[11px] text-slate-400">Authorized Signature & Seal</p>
          </div>
          <div className="text-right">
            <div className="w-48 border-b border-slate-400 mb-2 ml-auto"></div>
            <p className="font-bold text-slate-800">Financial Approver</p>
            <p className="text-[11px] text-slate-400">
              {order.approved_by_name ? `Approved by ${order.approved_by_name}` : 'Awaiting Final Signature'}
            </p>
          </div>
        </div>
      </div>

      {/* STATUS HISTORY & AUDIT LOG TIMELINE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4 no-print">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          Workflow Status History & Audit Log
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {history.map((h, i) => (
            <div key={h.id} className="relative">
              <span className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-indigo-50"></span>
              <div className="text-xs">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 border border-slate-200">
                    {h.status}
                  </span>
                  <span>by {h.changed_by_name} ({h.changed_by_role})</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    {formatDate(h.created_at)}
                  </span>
                </div>
                {h.comment && (
                  <p className="text-slate-600 mt-1 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {h.comment}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reject Reason Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              Reject Purchase Order
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Please enter an explicit reason for rejecting {order.po_number}. This will be permanently recorded in the audit trail.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  required
                  rows="3"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Budget ceiling exceeded for Q3 hardware renewals."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
