import React from 'react';
import { getStatusBadgeClass } from '../utils/formatters';

export const StatusBadge = ({ status }) => {
  const badgeClasses = getStatusBadgeClass(status);

  // Status dot color
  let dotColor = 'bg-slate-400';
  if (status === 'Approved') dotColor = 'bg-emerald-500';
  if (status === 'Submitted') dotColor = 'bg-amber-500';
  if (status === 'Received') dotColor = 'bg-blue-500';
  if (status === 'Rejected') dotColor = 'bg-rose-500';
  if (status === 'Draft') dotColor = 'bg-slate-400';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {status}
    </span>
  );
};
