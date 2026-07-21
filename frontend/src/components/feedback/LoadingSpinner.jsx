// frontend/src/components/feedback/LoadingSpinner.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 gap-2 ${className}`}>
      <Loader2 className={`${sizes[size]} animate-spin text-brand-primary`} />
      <span className="text-xs font-semibold tracking-widest text-brand-secondary uppercase select-none">
        Querying Systems...
      </span>
    </div>
  );
};
export default LoadingSpinner;
