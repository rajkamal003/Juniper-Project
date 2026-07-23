// frontend/src/components/ui/LoadingSkeleton.jsx
import React from 'react';
import { motion } from 'framer-motion';

export const LoadingSkeleton = ({ variant = 'card', count = 3, className = '' }) => {
  const items = Array.from({ length: count });

  const skeletonPulse = {
    animate: {
      opacity: [0.4, 0.85, 0.4],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    }
  };

  if (variant === 'table') {
    return (
      <div className={`space-y-3 w-full ${className}`}>
        {items.map((_, i) => (
          <motion.div 
            key={i} 
            {...skeletonPulse}
            className="flex gap-4 items-center justify-between w-full h-12 px-5 rounded-xl border"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
          >
            <div className="h-4 rounded w-1/12" style={{ backgroundColor: 'var(--bg-hover)' }} />
            <div className="h-4 rounded w-3/12" style={{ backgroundColor: 'var(--bg-hover)' }} />
            <div className="h-4 rounded w-2/12" style={{ backgroundColor: 'var(--bg-hover)' }} />
            <div className="h-4 rounded w-2/12" style={{ backgroundColor: 'var(--bg-hover)' }} />
            <div className="h-4 rounded w-1/12" style={{ backgroundColor: 'var(--bg-hover)' }} />
          </motion.div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {items.map((_, i) => (
          <motion.div 
            key={i} 
            {...skeletonPulse}
            className="h-14 rounded-xl w-full flex items-center justify-between px-5 border"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
          >
            <div className="h-4 rounded w-1/3" style={{ backgroundColor: 'var(--bg-hover)' }} />
            <div className="h-4 rounded w-1/12" style={{ backgroundColor: 'var(--bg-hover)' }} />
          </motion.div>
        ))}
      </div>
    );
  }

  // Card Variant
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {items.map((_, i) => (
        <motion.div 
          key={i} 
          {...skeletonPulse}
          className="glass-panel border rounded-2xl p-6 space-y-4"
          style={{ backgroundColor: 'var(--bg-surface-glass)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl shrink-0" style={{ backgroundColor: 'var(--bg-hover)' }} />
            <div className="space-y-2 flex-1">
              <div className="h-4 rounded w-2/3" style={{ backgroundColor: 'var(--bg-hover)' }} />
              <div className="h-3 rounded w-1/3" style={{ backgroundColor: 'var(--bg-hover)' }} />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-3 rounded w-full" style={{ backgroundColor: 'var(--bg-hover)' }} />
            <div className="h-3 rounded w-5/6" style={{ backgroundColor: 'var(--bg-hover)' }} />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
