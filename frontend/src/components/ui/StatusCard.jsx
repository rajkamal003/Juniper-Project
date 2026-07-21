// frontend/src/components/ui/StatusCard.jsx
import React from 'react';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';

export const StatusCard = ({ 
  title, 
  status, 
  statusType = 'neutral', 
  message, 
  icon: Icon, 
  className = '' 
}) => {
  const getIconContainerColor = () => {
    switch (statusType) {
      case 'success': return 'bg-emerald-500/10 text-brand-success border-emerald-500/20';
      case 'danger': return 'bg-red-500/10 text-brand-danger border-red-500/20';
      case 'warning': return 'bg-amber-500/10 text-brand-warning border-amber-500/20';
      default: return 'bg-slate-800 text-brand-secondary border-slate-700/60';
    }
  };

  return (
    <Card className={`p-5 flex items-start gap-4 ${className}`}>
      {Icon && (
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 select-none ${getIconContainerColor()}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="flex-1 text-left min-w-0 select-none">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider leading-none">{title}</h3>
          {status && <StatusBadge status={status} variant={statusType} />}
        </div>
        {message && <p className="text-[10px] text-brand-secondary mt-2 leading-relaxed">{message}</p>}
      </div>
    </Card>
  );
};

export default StatusCard;
