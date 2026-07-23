// frontend/src/components/ui/StatusBadge.jsx
import React from 'react';

export const StatusBadge = ({ status }) => {
  const getStatusStyle = (s) => {
    const val = (s || '').trim().toLowerCase();
    switch (val) {
      case 'active':
      case 'approved':
      case 'online':
        return 'bg-emerald-600 border-emerald-700 text-white shadow-sm';
      case 'pending':
      case 'maintenance':
        return 'bg-amber-600 border-amber-700 text-white shadow-sm';
      case 'suspended':
      case 'rejected':
      case 'locked':
      case 'offline':
        return 'bg-red-600 border-red-700 text-white shadow-sm';
      case 'inactive':
      case 'deleted':
      default:
        return 'bg-slate-600 border-slate-700 text-white shadow-sm';
    }
  };

  return (
    <span className={`inline-flex items-center justify-center px-3 py-1 text-[10px] font-semibold uppercase tracking-wider border rounded-full select-none h-[22px] shrink-0 ${getStatusStyle(status)}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
