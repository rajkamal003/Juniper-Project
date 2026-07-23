// frontend/src/components/ui/Button.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { buttonHoverProps } from '../../constants/motionVariants';

export const Button = ({
  variant = 'primary',
  loading = false,
  success = false,
  loadingText = 'Processing...',
  successText = 'Success!',
  disabled = false,
  onClick,
  type = 'button',
  children,
  className = '',
  ...props
}) => {
  const baseStyle = "h-12 px-6 rounded-xl font-semibold text-btn flex items-center justify-center gap-2.5 transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-ring-dynamic select-none cursor-pointer shadow-xs";
  
  const variants = {
    primary: "text-white shadow-blue-500/20 hover:shadow-md",
    secondary: "border shadow-xs",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-red-500/20 hover:shadow-md",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 hover:shadow-md",
    ghost: "bg-transparent hover:bg-black/5 dark:hover:bg-white/10 shadow-none"
  };

  const getCustomStyle = () => {
    if (variant === 'primary') {
      return {
        backgroundColor: 'var(--color-primary)',
        color: '#ffffff'
      };
    }
    if (variant === 'secondary') {
      return {
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-main)'
      };
    }
    if (variant === 'ghost') {
      return {
        color: 'var(--text-secondary)'
      };
    }
    return {};
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={disabled || loading ? undefined : buttonHoverProps.whileHover}
      whileTap={disabled || loading ? undefined : buttonHoverProps.whileTap}
      style={getCustomStyle()}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin shrink-0" />
          <span>{loadingText}</span>
        </>
      ) : success ? (
        <>
          <CheckCircle2 className="w-5 h-5 text-white animate-bounce shrink-0" />
          <span>{successText}</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;
