// frontend/src/components/ui/SectionTitle.jsx
import React from 'react';

export const SectionTitle = ({ children, className = '' }) => {
  return (
    <h3 className={`text-xs font-bold text-brand-text uppercase tracking-wider pb-2.5 border-b border-[#334155]/20 mb-4 select-none ${className}`}>
      {children}
    </h3>
  );
};

export default SectionTitle;
