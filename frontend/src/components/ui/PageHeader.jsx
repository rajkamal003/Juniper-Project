// frontend/src/components/ui/PageHeader.jsx
import React from 'react';

export const PageHeader = ({ title, subtitle, children }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#334155]/20 pb-5 mb-6 select-none">
      <div className="text-left">
        <h1 className="text-xl font-extrabold text-brand-text tracking-tight leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-brand-secondary mt-1">{subtitle}</p>}
      </div>
      {children && (
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
