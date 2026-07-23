// frontend/src/components/feedback/SkeletonLoader.jsx
import React from 'react';
import { motion } from 'framer-motion';

export const SkeletonLoader = ({ variant = 'card', className = '' }) => {
  const skeletonPulse = {
    animate: {
      opacity: [0.4, 0.85, 0.4],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    }
  };

  if (variant === 'card') {
    return (
      <motion.div 
        {...skeletonPulse}
        className={`glass-panel rounded-2xl p-6 space-y-4 border ${className}`}
        style={{ backgroundColor: 'var(--bg-surface-glass)', borderColor: 'var(--border-color)' }}
      >
        <div className="w-12 h-12 rounded-xl" style={{ backgroundColor: 'var(--bg-hover)' }} />
        <div className="h-4 rounded w-1/3" style={{ backgroundColor: 'var(--bg-hover)' }} />
        <div className="space-y-2">
          <div className="h-3 rounded" style={{ backgroundColor: 'var(--bg-hover)' }} />
          <div className="h-3 rounded w-5/6" style={{ backgroundColor: 'var(--bg-hover)' }} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...skeletonPulse} className={`space-y-3 ${className}`}>
      <div className="h-4 rounded w-1/4" style={{ backgroundColor: 'var(--bg-hover)' }} />
      <div className="h-12 rounded-xl w-full" style={{ backgroundColor: 'var(--bg-hover)' }} />
    </motion.div>
  );
};
export default SkeletonLoader;
