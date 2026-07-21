// frontend/src/components/ui/StatusBadge.jsx
import React from 'react';

export const StatusBadge = ({ status }) => {
  const getStatusStyle = (s) => {
    switch (s) {
      case 'Active':
      case 'Approved':
      case 'Online':
        return 'bg-emerald-500/10 text-brand-success border-brand-success/20';
      case 'Pending':
      case 'Maintenance':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Suspended':
      case 'Rejected':
      case 'Locked':
      case 'Offline':
        return 'bg-red-500/10 text-brand-danger border-brand-danger/20';
      case 'Inactive':
      case 'Deleted':
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-md select-none ${getStatusStyle(status)}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
