// frontend/src/components/ui/Card.jsx
import React from 'react';

export const Card = ({ children, className = '' }) => {
  return (
    <div className={`w-full sm:max-w-[480px] lg:max-w-[420px] glass-panel rounded-2xl p-10 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};
export default Card;
