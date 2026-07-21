// frontend/src/components/ui/InfoCard.jsx
import React from 'react';
import { Card } from './Card';
import { SectionTitle } from './SectionTitle';

export const InfoCard = ({ title, subtitle, items = [], className = '' }) => {
  return (
    <Card className={`p-5 ${className}`}>
      {title && <SectionTitle>{title}</SectionTitle>}
      {subtitle && <p className="text-[10px] text-brand-secondary -mt-2.5 mb-4 select-none">{subtitle}</p>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs pt-1 select-none">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col text-left border-b border-[#334155]/10 pb-2 sm:border-0 sm:pb-0">
            <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider mb-1">{item.label}</span>
            <span className="font-semibold text-brand-text break-all">{item.value || '—'}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default InfoCard;
