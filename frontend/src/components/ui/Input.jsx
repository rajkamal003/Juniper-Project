// frontend/src/components/ui/Input.jsx
import React from 'react';
import { Check } from 'lucide-react';

export const Input = React.forwardRef(({
  label,
  icon: Icon,
  error,
  isValid = false, // Explicit success state flag
  name,
  type = 'text',
  placeholder = '',
  disabled = false,
  required = false,
  className = '',
  onChange,
  onWheel,
  ...props
}, ref) => {

  const handleChange = (e) => {
    // Intercept tel and numeric keyboards to block alphabets, spaces, symbols
    if (type === 'tel' || props.inputMode === 'numeric') {
      const filtered = e.target.value.replace(/[^0-9]/g, '');
      e.target.value = filtered;
    }
    
    // Convert email to lowercase and trim spaces
    if (type === 'email' || name === 'email') {
      const sanitized = e.target.value.trim().toLowerCase();
      e.target.value = sanitized;
    }

    if (onChange) {
      onChange(e);
    }
  };

  const handleWheel = (e) => {
    // Block mouse wheel actions on numerical controls
    if (type === 'tel' || props.inputMode === 'numeric') {
      e.preventDefault();
    }
    if (onWheel) {
      onWheel(e);
    }
  };

  return (
    <div className={`space-y-1 w-full text-left ${className}`}>
      {label && (
        <label className="block text-[13px] font-medium text-brand-secondary uppercase tracking-wider select-none">
          {label} {required && <span className="text-brand-danger font-bold">*</span>}
        </label>
      )}
      
      <div className="relative flex items-center">
        {Icon && (
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#94a3b8] pointer-events-none">
            <Icon className="w-4.5 h-4.5" />
          </span>
        )}
        
        <input
          ref={ref}
          name={name}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          onChange={handleChange}
          onWheel={handleWheel}
          className={`h-12 w-full bg-slate-900/40 border text-brand-text placeholder-slate-600 rounded-xl focus-ring-blue text-[15px] transition-all duration-200 ${
            Icon ? 'pl-11 pr-10' : 'pl-4 pr-10'
          } ${
            error 
              ? 'border-brand-danger focus:border-brand-danger focus:ring-brand-danger/20' 
              : isValid 
              ? 'border-brand-success focus:border-brand-success focus:ring-brand-success/20'
              : 'border-[#334155] focus:border-brand-primary'
          }`}
          {...props}
        />

        {/* Valid checkmark status */}
        {isValid && !error && (
          <span className="absolute right-3.5 flex items-center text-brand-success pointer-events-none animate-pulse-slow">
            <Check className="w-4 h-4" />
          </span>
        )}
      </div>
      
      {error && (
        <p className="text-[12px] text-brand-danger font-medium pl-1 animate-shake">
          {error.message}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
