// frontend/src/components/ui/SearchBar.jsx
import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar = ({ 
  value = '', 
  onChange, 
  onClear, 
  placeholder = "Search...", 
  className = '' 
}) => {
  return (
    <div className={`relative w-full max-w-sm ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-9 bg-slate-900/40 border border-[#334155]/40 rounded-xl text-xs text-brand-text placeholder-slate-500 outline-none focus:border-brand-primary/60 focus:bg-slate-900/60 transition-all"
      />
      {value && onClear && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-[#94a3b8] hover:text-brand-text hover:bg-slate-800/40 transition-colors focus:outline-none"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
