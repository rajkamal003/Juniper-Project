// frontend/src/components/forms/OTPInput.jsx
import React, { useState, useRef, useEffect } from 'react';

export const OTPInput = ({ length = 6, value = '', onChange }) => {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    // Populate from parent value if needed
    if (value && value.length === length) {
      setOtp(value.split(''));
    }
  }, [value, length]);

  const handleChange = (element, index) => {
    const val = element.value.replace(/[^0-9]/g, '');
    if (!val) return;

    const newOtp = [...otp];
    // Keep only the last character entered
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);
    
    // Call parent onChange
    const fullOtp = newOtp.join('');
    if (onChange) {
      onChange(fullOtp);
    }

    // Auto-focus next input box
    if (element.value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      // If box is already empty, clear previous box and focus it
      if (!otp[index] && index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
        
        const fullOtp = newOtp.join('');
        if (onChange) onChange(fullOtp);
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
        const fullOtp = newOtp.join('');
        if (onChange) onChange(fullOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
    if (pasteData.length >= length) {
      const newOtp = pasteData.slice(0, length).split('');
      setOtp(newOtp);
      inputRefs.current[length - 1].focus();
      
      const fullOtp = newOtp.join('');
      if (onChange) {
        onChange(fullOtp);
      }
    }
  };

  return (
    <div className="flex justify-between items-center gap-2.5 max-w-[340px] mx-auto select-none" onPaste={handlePaste}>
      {otp.map((digit, index) => (
        <input
          key={index}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          ref={(el) => (inputRefs.current[index] = el)}
          value={digit}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-11 h-12 text-center bg-slate-900/40 border border-[#334155] text-brand-text rounded-xl focus-ring-blue font-mono font-bold text-lg select-all transition-all duration-200"
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
};
export default OTPInput;
