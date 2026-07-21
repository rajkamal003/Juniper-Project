// frontend/src/components/feedback/SkeletonLoader.jsx
import React from 'react';

export const SkeletonLoader = ({ variant = 'card', className = '' }) => {
  if (variant === 'card') {
    return (
      <div className={`glass-panel rounded-2xl p-6 space-y-4 animate-pulse ${className}`}>
        <div className="w-12 h-12 rounded-xl bg-slate-700" />
        <div className="h-4 bg-slate-700 rounded w-1/3" />
        <div className="space-y-2">
          <div className="h-3 bg-slate-700 rounded" />
          <div className="h-3 bg-slate-700 rounded w-5/6" />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      <div className="h-4 bg-slate-700 rounded w-1/4" />
      <div className="h-10 bg-slate-700 rounded-xl w-full" />
    </div>
  );
};
export default SkeletonLoader;
