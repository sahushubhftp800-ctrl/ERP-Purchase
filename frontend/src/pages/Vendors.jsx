import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  AlertCircle,
  FileText
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const { addToast } = useToast();

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorOrders, setVendorOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    vendor_name: '',
    email: '',
    phone: '',
    address: '',
    gst_number: '',
    contact_person: '',
    status: 'Active'
  });

  const { hasRole } = useAuth();

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/vendors${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      if (res.data.success) {
        setVendors(res.data.vendors);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch vendors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchVendors();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setSelectedVendor(null);
    setFormData({
      vendor_name: '',
      email: '',
      phone: '',
      address: '',
      gst_number: '',
      contact_person: '',
      status: 'Active'
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vendor) => {
    setIsEditing(true);
    setSelectedVendor(vendor);
    setFormData({
      vendor_name: vendor.vendor_name,
      email: vendor.email || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      gst_number: vendor.gst_number || '',
      contact_person: vendor.contact_person || '',
      status: vendor.status || 'Active'
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenDetailModal = async (vendor) => {
    try {
      setSelectedVendor(vendor);
      setIsDetailModalOpen(true);
      const res = await api.get(`/vendors/${vendor.id}`);
      if (res.data.success) {
        setVendorOrders(res.data.orders);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isEditing) {
        await api.put(`/vendors/${selectedVendor.id}`, formData);
        addToast(`Vendor "${formData.vendor_name}" updated successfully.`, 'success');
      } else {
        await api.post('/vendors', formData);
        addToast(`Vendor "${formData.vendor_name}" created successfully.`, 'success');
      }
      setIsModalOpen(false);
      fetchVendors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save vendor details.');
      addToast(err.response?.data?.message || 'Failed to save vendor.', 'error');
    }
  };

  const handleDelete = async (vendor) => {
    if (!window.confirm(`Are you sure you want to delete vendor "${vendor.vendor_name}"?`)) {
      return;
    }

    try {
      await api.delete(`/vendors/${vendor.id}`);
      addToast(`Vendor "${vendor.vendor_name}" deleted.`, 'info');
      fetchVendors();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete vendor.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            Vendor Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage suppliers, GST compliance numbers, and procurement histories
          </p>
        </div>

        {hasRole(['admin', 'purchaser']) && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Vendor</span>
          </button>
        )}
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold transition">
          {successMsg}
        </div>
      )}

      {/* Search Input Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vendors by name, GSTIN, phone, or email..."
          className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-xs text-slate-400 hover:text-slate-600">
            Clear
          </button>
        )}
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Vendor Name</th>
                <th className="px-5 py-3.5">Contact Person</th>
                <th className="px-5 py-3.5">GST Number</th>
                <th className="px-5 py-3.5">Contact Details</th>
                <th className="px-5 py-3.5 text-center">Orders</th>
                <th className="px-5 py-3.5 text-right">Total Spend</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-5 py-10 text-center text-slate-500">
                    <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p>Loading vendor directory...</p>
                  </td>
                </tr>
              ) : vendors.length > 0 ? (
                vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {vendor.vendor_name}
                      <p className="text-[10px] font-normal text-slate-400 mt-0.5 line-clamp-1">{vendor.address || 'Address not listed'}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium">
                      {vendor.contact_person || 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600">
                      {vendor.gst_number || 'Unregistered'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {vendor.email || 'N/A'}</span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-500"><Phone className="w-3 h-3 text-slate-400" /> {vendor.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-slate-700">
                      {vendor.total_orders}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                      {formatCurrency(vendor.total_spend)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        vendor.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenDetailModal(vendor)}
                          title="View Vendor Profile & Orders"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {hasRole(['admin', 'purchaser']) && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(vendor)}
                              title="Edit Vendor"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-600 transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDelete(vendor)}
                              title="Delete Vendor"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-5 py-10 text-center text-slate-400">
                    No vendors found matching "{search}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Vendor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {isEditing ? 'Edit Vendor Details' : 'Add New Vendor'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Vendor Name *</label>
                <input
                  type="text"
                  required
                  value={formData.vendor_name}
                  onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                  placeholder="e.g. ABC Traders & Solutions"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    placeholder="e.g. Anil Gupta"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={formData.gst_number}
                    onChange={(e) => setFormData({ ...formData, gst_number: e.target.value.toUpperCase() })}
                    placeholder="e.g. 07AAAAA0000A1Z5"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs uppercase font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. sales@vendor.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98200 12345"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Business Address</label>
                <textarea
                  rows="2"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, City, State, PIN"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vendor Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm transition"
                >
                  {isEditing ? 'Save Changes' : 'Create Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vendor Details & Orders View Modal */}
      {isDetailModalOpen && selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{selectedVendor.vendor_name}</h2>
                  <p className="text-xs text-slate-500">GSTIN: {selectedVendor.gst_number || 'N/A'}</p>
                </div>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-100 text-xs">
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Contact Person</p>
                <p className="font-semibold text-slate-800">{selectedVendor.contact_person || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Phone</p>
                <p className="font-semibold text-slate-800">{selectedVendor.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Email</p>
                <p className="font-semibold text-slate-800">{selectedVendor.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Address</p>
                <p className="font-semibold text-slate-800">{selectedVendor.address || 'N/A'}</p>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Linked Purchase Orders ({vendorOrders.length})
              </h3>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="px-3 py-2">PO Number</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2 text-right">Grand Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vendorOrders.length > 0 ? (
                      vendorOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-bold text-indigo-600">{ord.po_number}</td>
                          <td className="px-3 py-2 text-slate-500">{formatDate(ord.order_date)}</td>
                          <td className="px-3 py-2"><StatusBadge status={ord.status} /></td>
                          <td className="px-3 py-2 text-right font-semibold text-slate-800">{formatCurrency(ord.grand_total)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-3 py-4 text-center text-slate-400">
                          No purchase orders issued to this vendor yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
