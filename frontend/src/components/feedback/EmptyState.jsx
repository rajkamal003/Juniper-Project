// frontend/src/components/feedback/EmptyState.jsx
import React from 'react';
import { Database } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Database,
  title = "No data available",
  description = "There are currently no active logs or entries in this segment.",
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center glass-panel rounded-2xl border border-opacity-10 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-slate-800 text-brand-secondary flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-brand-text mb-1 select-none">{title}</h3>
      <p className="text-xs text-brand-secondary max-w-xs">{description}</p>
    </div>
  );
};
export default EmptyState;
