import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Package, 
  ShoppingCart, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  IndianRupee, 
  ArrowUpRight, 
  Plus, 
  TrendingUp,
  FileText,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Loading ERP metrics & live analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-center gap-3">
        <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
        <div>
          <h3 className="font-semibold text-sm">Dashboard Error</h3>
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl shadow-slate-900/10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Procurement Dashboard
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Welcome back, <span className="font-semibold text-white">{user?.name}</span> ({user?.role}) • Real-time database metrics
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {hasRole(['admin', 'purchaser']) && (
            <button
              onClick={() => navigate('/orders/create')}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Purchase Order</span>
            </button>
          )}
          <Link
            to="/reports"
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
          >
            <TrendingUp className="w-4 h-4" />
            <span>View Reports</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total POs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Purchase Orders</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{stats?.totalOrders || 0}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <span className="font-medium text-emerald-600 flex items-center">
              {stats?.approvedOrders || 0} approved
            </span>
            <span>•</span>
            <span className="text-slate-400">{stats?.draftOrders || 0} drafts</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/20 to-transparent shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending Approvals</span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-900 mt-3">{stats?.pendingApprovals || 0}</p>
          <p className="text-xs text-amber-600 mt-2 font-medium">
            Requires sign-off from Approver
          </p>
        </div>

        {/* Total Spend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Spend</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3 truncate">
            {formatCurrency(stats?.totalApprovedSpend || 0)}
          </p>
          <p className="text-xs text-emerald-600 mt-2 font-medium">
            Includes 5% GST calculations
          </p>
        </div>

        {/* Vendors & Products Combined Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Catalog & Vendors</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{stats?.totalVendors || 0}</p>
              <p className="text-xs text-slate-500">Active Vendors</p>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{stats?.totalProducts || 0}</p>
              <p className="text-xs text-slate-500">Products Catalog</p>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Order Status Distribution + Top Vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Progress */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            Order Status Breakdown
          </h2>

          <div className="space-y-3.5">
            {[
              { label: 'Approved', count: stats?.approvedOrders || 0, color: 'bg-emerald-500', text: 'text-emerald-700' },
              { label: 'Pending Approval', count: stats?.pendingApprovals || 0, color: 'bg-amber-500', text: 'text-amber-700' },
              { label: 'Received & Stocked', count: stats?.receivedOrders || 0, color: 'bg-blue-500', text: 'text-blue-700' },
              { label: 'Drafts', count: stats?.draftOrders || 0, color: 'bg-slate-400', text: 'text-slate-700' },
              { label: 'Rejected', count: stats?.rejectedOrders || 0, color: 'bg-rose-500', text: 'text-rose-700' },
            ].map((item) => {
              const total = stats?.totalOrders || 1;
              const percent = Math.round((item.count / total) * 100);
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">{item.label}</span>
                    <span className={item.text}>{item.count} orders ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Vendors by Spend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Top Suppliers by Procurement Volume
            </h2>
            <Link to="/vendors" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              All Vendors <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <th className="pb-3">Vendor / Supplier</th>
                  <th className="pb-3 text-center">Orders</th>
                  <th className="pb-3 text-right">Total Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.topVendors?.length > 0 ? (
                  stats.topVendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 font-semibold text-slate-800">{vendor.vendor_name}</td>
                      <td className="py-3 text-center text-slate-600">{vendor.order_count}</td>
                      <td className="py-3 text-right font-bold text-slate-900">
                        {formatCurrency(vendor.total_spend)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-6 text-center text-slate-400">
                      No approved supplier spend recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Purchase Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Purchase Orders</h2>
            <p className="text-xs text-slate-500">Latest PO transactions recorded in MySQL</p>
          </div>
          <Link
            to="/orders"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View All Orders <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">PO Number</th>
                <th className="px-5 py-3.5">Vendor</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Created By</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Grand Total (₹)</th>
                <th className="px-5 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentOrders?.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3.5 font-bold text-indigo-600">
                      <Link to={`/orders/${order.id}`} className="hover:underline">
                        {order.po_number}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      {order.vendor_name}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {formatDate(order.order_date)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {order.created_by_name}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                      {formatCurrency(order.grand_total)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Link
                        to={`/orders/${order.id}`}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-medium transition"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400">
                    No purchase orders found. Click "+ New Purchase Order" to create one.
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
