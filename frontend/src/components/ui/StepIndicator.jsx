// frontend/src/components/ui/StepIndicator.jsx
import React from 'react';
import { Check } from 'lucide-react';

export const StepIndicator = ({ currentStep = 1, steps = ['Basic', 'Role', 'Security'] }) => {
  return (
    <div className="flex items-center justify-between w-full select-none mb-6">
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <React.Fragment key={idx}>
            {/* Step Node */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border-2 ${
                  isCompleted
                    ? 'bg-brand-primary border-brand-primary text-white'
                    : isActive
                    ? 'bg-[#1e293b] border-brand-primary text-brand-primary shadow-lg shadow-blue-500/20'
                    : 'bg-[#1e293b] border-[#334155] text-brand-secondary'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
              </div>
              <span
                className={`text-[11px] font-semibold mt-1.5 uppercase tracking-wider absolute -bottom-6 whitespace-nowrap transition-colors duration-300 ${
                  isActive || isCompleted ? 'text-brand-primary' : 'text-brand-secondary'
                }`}
              >
                {step}
              </span>
            </div>

            {/* Connecting Bar */}
            {idx < steps.length - 1 && (
              <div className="flex-grow mx-4 relative h-0.5 bg-[#334155]">
                <div
                  className="absolute inset-y-0 left-0 bg-brand-primary transition-all duration-300"
                  style={{ width: isCompleted ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
export default StepIndicator;
