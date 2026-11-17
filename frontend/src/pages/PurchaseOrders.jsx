import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Calendar,
  RotateCcw
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const { user, hasRole } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const statuses = ['All', 'Submitted', 'Approved', 'Draft', 'Received', 'Rejected'];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let query = `?status=${encodeURIComponent(statusFilter)}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (startDate) query += `&start_date=${encodeURIComponent(startDate)}`;
      if (endDate) query += `&end_date=${encodeURIComponent(endDate)}`;

      const res = await api.get(`/orders${query}`);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch purchase orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchOrders();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [search, statusFilter, startDate, endDate]);

  const handleQuickApprove = async (orderId, poNumber) => {
    if (!window.confirm(`Are you sure you want to approve Purchase Order ${poNumber}?`)) {
      return;
    }

    try {
      await api.patch(`/orders/${orderId}/status`, {
        status: 'Approved',
        comment: `Approved from quick actions by ${user.name}`
      });
      addToast(`Purchase Order ${poNumber} approved!`, 'success');
      fetchOrders();
    } catch (err) {
      addToast(err.response?.data?.message || 'Approval failed.', 'error');
    }
  };

  const handleDownloadPdf = async (orderId, poNumber) => {
    try {
      addToast(`Downloading ${poNumber}.pdf...`, 'info');
      const response = await api.get(`/orders/${orderId}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${poNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast(`Downloaded ${poNumber}.pdf`, 'success');
    } catch (err) {
      addToast('Failed to download PDF. Please try again.', 'error');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-indigo-600" />
            Purchase Order Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, track, review, and process corporate procurement orders
          </p>
        </div>

        {hasRole(['admin', 'purchaser']) && (
          <button
            onClick={() => navigate('/orders/create')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Order</span>
          </button>
        )}
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Status Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  statusFilter === s
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {(search || statusFilter !== 'All' || startDate || endDate) && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Inputs row: Search & Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-100">
          <div className="sm:col-span-1 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by PO# or vendor name..."
              className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-xs text-slate-700 bg-transparent focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-xs text-slate-700 bg-transparent focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">PO Number</th>
                <th className="px-5 py-3.5">Vendor</th>
                <th className="px-5 py-3.5">Order Date</th>
                <th className="px-5 py-3.5 text-center">Items</th>
                <th className="px-5 py-3.5 text-right">Subtotal</th>
                <th className="px-5 py-3.5 text-right">Tax (5%)</th>
                <th className="px-5 py-3.5 text-right">Grand Total (₹)</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-5 py-10 text-center text-slate-500">
                    <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p>Loading purchase orders...</p>
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5 font-bold font-mono text-indigo-600">
                      <Link to={`/orders/${order.id}`} className="hover:underline">
                        {order.po_number}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      {order.vendor_name}
                      <p className="text-[10px] text-slate-400 font-normal">By {order.created_by_name}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                      {formatDate(order.order_date)}
                    </td>
                    <td className="px-5 py-3.5 text-center font-semibold text-slate-700">
                      {order.total_items}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-600">
                      {formatCurrency(order.subtotal)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-500">
                      {formatCurrency(order.tax_amount)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-extrabold text-slate-900 text-sm">
                      {formatCurrency(order.grand_total)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          to={`/orders/${order.id}`}
                          title="View Order Details"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => handleDownloadPdf(order.id, order.po_number)}
                          title="Download Official PO PDF"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {order.status === 'Submitted' && hasRole(['admin', 'approver']) && (
                          <button
                            onClick={() => handleQuickApprove(order.id, order.po_number)}
                            title="Quick Approve"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-5 py-10 text-center text-slate-400">
                    No purchase orders found matching current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
