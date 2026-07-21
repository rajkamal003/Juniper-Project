// frontend/src/components/forms/PasswordStrengthMeter.jsx
import React from 'react';

export const PasswordStrengthMeter = ({ password = '' }) => {
  const getStrength = (pwd) => {
    let score = 0;
    if (!pwd) return { score: 0, text: '', color: 'bg-transparent' };
    
    // Check constraints
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[@$!%*?&#]/.test(pwd)) score++;

    if (score <= 1) {
      return { score, text: 'Weak', color: 'bg-brand-danger', textColor: 'text-brand-danger' };
    } else if (score < 4) {
      return { score, text: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-500' };
    } else {
      return { score, text: 'Strong', color: 'bg-brand-success', textColor: 'text-brand-success' };
    }
  };

  const { score, text, color, textColor } = getStrength(password);

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex justify-between items-center text-[11px] font-semibold tracking-wider select-none">
        <span className="text-brand-secondary">PASSWORD STRENGTH:</span>
        <span className={`${textColor} uppercase font-bold`}>{text || 'None'}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className={`h-1.5 rounded-full transition-all duration-300 ${score >= 1 ? color : 'bg-[#334155]'}`} />
        <div className={`h-1.5 rounded-full transition-all duration-300 ${score >= 2 ? color : 'bg-[#334155]'}`} />
        <div className={`h-1.5 rounded-full transition-all duration-300 ${score >= 4 ? color : 'bg-[#334155]'}`} />
      </div>
      
      {password && score < 4 && (
        <p className="text-[10px] text-brand-secondary leading-tight mt-1">
          Add caps, numbers, and special symbols (@$!%*?&#) to strengthen your password.
        </p>
      )}
    </div>
  );
};
export default PasswordStrengthMeter;
