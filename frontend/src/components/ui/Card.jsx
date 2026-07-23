// frontend/src/components/ui/Card.jsx
import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`w-full glass-panel rounded-2xl p-8 border shadow-lg transition-all duration-300 ${className}`}
      style={{
        backgroundColor: 'var(--bg-surface-glass)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-main)',
        boxShadow: 'var(--shadow-card)'
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
export default Card;
