// frontend/src/components/ui/FilterPanel.jsx
import React from 'react';
import { Button } from './Button';

export const FilterPanel = ({ children, onClear, onApply, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="bg-slate-900/30 border border-[#334155]/30 rounded-xl p-4 space-y-4 animate-in fade-in slide-in-from-top-3 duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
        {children}
      </div>
      
      {(onClear || onApply) && (
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#334155]/20 select-none">
          {onClear && (
            <Button
              onClick={onClear}
              variant="secondary"
              className="px-4 h-9 text-[10px]"
            >
              Clear Filters
            </Button>
          )}
          {onApply && (
            <Button
              onClick={onApply}
              variant="primary"
              className="px-4 h-9 text-[10px]"
            >
              Apply Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
