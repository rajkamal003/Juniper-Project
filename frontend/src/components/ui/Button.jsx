// frontend/src/components/ui/Button.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';

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
  const baseStyle = "h-13 px-7 rounded-xl font-semibold text-btn flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-ring-dynamic select-none cursor-pointer shadow-md";
  
  const variants = {
    primary: "text-white shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30",
    secondary: "border shadow-sm",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-red-500/20 hover:shadow-lg",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 hover:shadow-lg",
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
      whileHover={{ scale: disabled || loading ? 1 : 1.05 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
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
