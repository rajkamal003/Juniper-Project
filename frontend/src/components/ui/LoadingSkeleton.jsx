// frontend/src/components/ui/LoadingSkeleton.jsx
import React from 'react';

export const LoadingSkeleton = ({ variant = 'card', count = 3, className = '' }) => {
  const items = Array.from({ length: count });

  if (variant === 'table') {
    return (
      <div className={`space-y-4 w-full animate-pulse ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="flex gap-4 items-center justify-between w-full h-8 px-4 rounded-lg bg-slate-800/40">
            <div className="h-3 bg-slate-700/60 rounded w-1/12"></div>
            <div className="h-3 bg-slate-700/60 rounded w-3/12"></div>
            <div className="h-3 bg-slate-700/60 rounded w-2/12"></div>
            <div className="h-3 bg-slate-700/60 rounded w-2/12"></div>
            <div className="h-3 bg-slate-700/60 rounded w-1/12"></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`space-y-3 animate-pulse ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="h-12 bg-slate-800/40 rounded-xl w-full flex items-center justify-between px-4">
            <div className="h-3 bg-slate-700/60 rounded w-1/3" />
            <div className="h-3 bg-slate-700/60 rounded w-1/12" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'profile') {
    return (
      <div className={`space-y-6 animate-pulse p-4 ${className}`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-800" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-slate-800 rounded w-1/3" />
            <div className="h-3 bg-slate-800 rounded w-1/4" />
          </div>
        </div>
        <div className="space-y-4 border-t border-[#334155]/20 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-8 bg-slate-800/60 rounded-xl" />
            <div className="h-8 bg-slate-800/60 rounded-xl" />
            <div className="h-8 bg-slate-800/60 rounded-xl" />
            <div className="h-8 bg-slate-800/60 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Card Variant
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse ${className}`}>
      {items.map((_, i) => (
        <div key={i} className="glass-panel border border-[#334155]/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-slate-700 rounded w-2/3" />
              <div className="h-2.5 bg-slate-800 rounded w-1/3" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-3 bg-slate-800 rounded w-full" />
            <div className="h-3 bg-slate-800 rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
