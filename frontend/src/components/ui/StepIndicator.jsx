// frontend/src/components/ui/StepIndicator.jsx
import React from 'react';
import { Check } from 'lucide-react';

export const StepIndicator = ({ currentStep = 1, steps = ['Basic', 'Role', 'Security'] }) => {
  return (
    <div className="w-full select-none mb-8">
      <div className="relative flex items-start justify-between w-full">
        {/* Background Line */}
        <div className="absolute left-[16.6%] right-[16.6%] top-4 h-0.5 bg-[#334155] -z-0" />
        
        {/* Progress Line */}
        <div 
          className="absolute left-[16.6%] top-4 h-0.5 bg-brand-primary transition-all duration-500 -z-0"
          style={{ 
            width: steps.length > 1 
              ? `${((Math.min(currentStep, steps.length) - 1) / (steps.length - 1)) * 66.8}%` 
              : '0%' 
          }}
        />

        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <div key={idx} className="flex flex-col items-center flex-1 z-10 px-1 text-center">
              {/* Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border-2 shrink-0 ${
                  isCompleted
                    ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/20'
                    : isActive
                    ? 'bg-[#1e293b] border-brand-primary text-brand-primary shadow-lg shadow-blue-500/20'
                    : 'bg-[#1e293b] border-[#334155] text-brand-secondary'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
              </div>
              
              {/* Label */}
              <span
                className={`text-[10px] sm:text-[11px] font-semibold mt-2.5 uppercase tracking-wider transition-colors duration-300 break-words max-w-[100px] leading-tight ${
                  isActive || isCompleted ? 'text-brand-primary' : 'text-brand-secondary'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;

