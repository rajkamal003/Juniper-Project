// frontend/src/components/ui/Button.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  variant = 'primary',
  loading = false,
  loadingText = 'Processing...',
  disabled = false,
  onClick,
  type = 'button',
  children,
  className = ''
}) => {
  const baseStyle = "h-12 w-full px-6 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-blue-500/40";
  
  const variants = {
    primary: "bg-brand-primary hover:bg-blue-700 text-white shadow-lg shadow-blue-600/15",
    secondary: "bg-[#334155] hover:bg-[#475569] text-brand-text border border-[#475569]/30",
    danger: "bg-brand-danger hover:bg-red-600 text-white shadow-lg shadow-red-600/15",
    success: "bg-brand-success hover:bg-green-600 text-white shadow-lg shadow-green-600/15",
    ghost: "bg-transparent hover:bg-slate-800/50 text-[#94a3b8] hover:text-[#f8fafc]"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : children}
    </button>
  );
};
export default Button;
