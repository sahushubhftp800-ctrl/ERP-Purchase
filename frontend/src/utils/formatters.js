// Currency Formatter for Indian Rupees (₹)
export const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0;
  return '₹' + num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Date Formatter
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Status styling badge classes
export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Approved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Submitted':
      return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
    case 'Draft':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'Received':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Rejected':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'Cancelled':
      return 'bg-gray-100 text-gray-500 border-gray-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};
