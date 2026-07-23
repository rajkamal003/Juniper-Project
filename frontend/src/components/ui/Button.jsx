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
  const baseStyle = "h-12 px-6 rounded-xl font-semibold text-btn flex items-center justify-center gap-2.5 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none focus:outline-none select-none cursor-pointer";

  const variants = {
    primary: "text-white shadow-sm hover:shadow-md hover:brightness-110",
    secondary: "bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-500/20 hover:shadow-md",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 hover:shadow-md",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800"
  };

  const getStyle = () => {
    if (variant === 'primary') {
      return { backgroundColor: 'var(--color-primary)', color: '#ffffff' };
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
      style={getStyle()}
      className={`${baseStyle} ${variants[variant] ?? ''} ${className}`}
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
