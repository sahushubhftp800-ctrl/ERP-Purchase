import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  IndianRupee, 
  Filter, 
  Building2, 
  Package, 
  PieChart,
  FileSpreadsheet
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';

export const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      let query = '';
      const params = [];
      if (startDate) params.push(`start_date=${startDate}`);
      if (endDate) params.push(`end_date=${endDate}`);
      if (params.length > 0) query = '?' + params.join('&');

      const res = await api.get(`/reports/analytics${query}`);
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate]);

  // Export CSV Data
  const handleExportCsv = () => {
    if (!reportData || !reportData.vendorReport) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Vendor Name,GSTIN,Orders Count,Subtotal (INR),Tax Paid (INR),Total Spend (INR)\n';

    reportData.vendorReport.forEach((v) => {
      csvContent += `"${v.vendor_name}","${v.gst_number || ''}",${v.orders_count},${v.subtotal},${v.tax_paid},${v.total_spend}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ERP_Procurement_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const summary = reportData?.summary || {};

  return (
    <div className="space-y-6">
      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            Procurement Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Analyze vendor spends, product inventory volume, tax liabilities and historical audit totals
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Vendor Spend CSV</span>
        </button>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-4 text-xs">
        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-slate-400" />
          Filter Period:
        </span>
        <div className="flex items-center gap-2">
          <label className="text-slate-500">From:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-slate-500">To:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        {(startDate || endDate) && (
          <button
            onClick={() => { setStartDate(''); setEndDate(''); }}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Reset Dates
          </button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Purchase Orders</span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{summary.total_orders || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total PO Subtotal</span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(summary.total_subtotal || 0)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">5% GST Tax Collected</span>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{formatCurrency(summary.total_tax || 0)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Order Value</span>
          <p className="text-2xl font-bold text-indigo-600 mt-2">{formatCurrency(summary.average_order_value || 0)}</p>
        </div>
      </div>

      {/* Two Columns: Vendor Spend & Product Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-indigo-600" />
            Supplier Procurement Spend
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-3 py-2">Vendor</th>
                  <th className="px-3 py-2 text-center">Orders</th>
                  <th className="px-3 py-2 text-right">Tax Paid</th>
                  <th className="px-3 py-2 text-right">Total Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData?.vendorReport?.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-semibold text-slate-800">{v.vendor_name}</td>
                    <td className="px-3 py-2.5 text-center text-slate-600">{v.orders_count}</td>
                    <td className="px-3 py-2.5 text-right text-slate-500">{formatCurrency(v.tax_paid)}</td>
                    <td className="px-3 py-2.5 text-right font-bold text-slate-900">{formatCurrency(v.total_spend)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-indigo-600" />
            Product Demand & Spend Volume
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-3 py-2">Product Name</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2 text-center">Qty Ordered</th>
                  <th className="px-3 py-2 text-right">Total Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData?.productReport?.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-semibold text-slate-800">{p.product_name}</td>
                    <td className="px-3 py-2.5 text-slate-500">{p.category}</td>
                    <td className="px-3 py-2.5 text-center font-bold text-slate-700">{p.total_quantity_ordered}</td>
                    <td className="px-3 py-2.5 text-right font-bold text-slate-900">{formatCurrency(p.total_spend)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
