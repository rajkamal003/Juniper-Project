// frontend/src/components/ui/PageTransition.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { pageVariants } from '../../constants/motionVariants';

export const PageTransition = ({ children, className = '' }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`w-full min-h-full ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
