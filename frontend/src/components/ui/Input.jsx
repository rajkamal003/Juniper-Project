// frontend/src/components/ui/Input.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export const Input = React.forwardRef(({
  label,
  icon: Icon,
  error,
  isValid = false,
  name,
  type = 'text',
  placeholder = '',
  disabled = false,
  required = false,
  className = '',
  onChange,
  onWheel,
  onFocus,
  onBlur,
  value,
  defaultValue,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(value || defaultValue));

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    setHasValue(Boolean(e.target.value));
    if (onBlur) onBlur(e);
  };

  const handleChange = (e) => {
    setHasValue(Boolean(e.target.value));
    if (type === 'tel' || props.inputMode === 'numeric') {
      const filtered = e.target.value.replace(/[^0-9]/g, '');
      e.target.value = filtered;
    }
    
    if (type === 'email' || name === 'email') {
      const sanitized = e.target.value.trim().toLowerCase();
      e.target.value = sanitized;
    }

    if (onChange) {
      onChange(e);
    }
  };

  const handleWheel = (e) => {
    if (type === 'tel' || props.inputMode === 'numeric') {
      e.preventDefault();
    }
    if (onWheel) onWheel(e);
  };

  const labelActive = isFocused || hasValue;

  return (
    <div className={`space-y-1.5 w-full text-left relative ${className}`}>
      {label && (
        <motion.label 
          initial={false}
          animate={{
            y: labelActive && placeholder ? -2 : 0,
            scale: isFocused ? 1.01 : 1,
            color: isFocused ? 'var(--color-primary)' : 'var(--text-secondary)'
          }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="block text-label font-semibold uppercase tracking-wider select-none pointer-events-none"
        >
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </motion.label>
      )}
      
      <motion.div 
        animate={{
          scale: isFocused ? 1.008 : 1,
          boxShadow: isFocused 
            ? '0 0 0 3px var(--glow-color), 0 4px 12px rgba(0, 0, 0, 0.05)' 
            : '0 1px 2px 0 rgba(0, 0, 0, 0.02)'
        }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="relative flex items-center rounded-xl overflow-hidden"
      >
        {Icon && (
          <span 
            className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-150 z-10"
            style={{ color: isFocused ? 'var(--color-primary)' : 'var(--text-muted)' }}
          >
            <Icon className="w-5 h-5 shrink-0" />
          </span>
        )}
        
        <input
          ref={ref}
          name={name}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onWheel={handleWheel}
          className={`h-12 w-full border text-input rounded-xl text-body transition-all duration-150 outline-none ${
            Icon ? 'pl-12 pr-11' : 'pl-4.5 pr-11'
          }`}
          style={{
            backgroundColor: 'var(--bg-input)',
            color: 'var(--text-main)',
            borderColor: error 
              ? '#ef4444' 
              : isValid 
              ? '#10b981' 
              : isFocused 
              ? 'var(--color-primary)' 
              : 'var(--border-color)',
          }}
          {...props}
        />

        {/* Valid checkmark status */}
        {isValid && !error && (
          <span className="absolute right-4 flex items-center text-emerald-500 pointer-events-none animate-pulse">
            <Check className="w-5 h-5" />
          </span>
        )}
      </motion.div>
      
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="text-sm text-red-500 font-semibold pl-1"
        >
          {error.message}
        </motion.p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
