// frontend/src/components/feedback/EmptyState.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Database } from 'lucide-react';
import { emptyStateVariants } from '../../constants/motionVariants';

export const EmptyState = ({
  icon: Icon = Database,
  title = "No data available",
  description = "There are currently no active logs or entries in this segment.",
  className = ""
}) => {
  return (
    <motion.div 
      variants={emptyStateVariants}
      initial="initial"
      animate="animate"
      className={`flex flex-col items-center justify-center p-8 text-center glass-panel rounded-2xl border ${className}`}
      style={{
        backgroundColor: 'var(--bg-surface-glass)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      <motion.div 
        whileHover={{ scale: 1.1, rotate: 8 }}
        transition={{ duration: 0.15 }}
        className="w-13 h-13 rounded-2xl border flex items-center justify-center mb-4 shadow-xs"
        style={{ backgroundColor: 'var(--bg-hover)', borderColor: 'var(--border-color)', color: 'var(--color-primary)' }}
      >
        <Icon className="w-6 h-6" />
      </motion.div>
      <h3 className="text-subheading font-bold mb-1 select-none" style={{ color: 'var(--text-main)' }}>{title}</h3>
      <p className="text-body text-sm max-w-xs" style={{ color: 'var(--text-secondary)' }}>{description}</p>
    </motion.div>
  );
};
export default EmptyState;
