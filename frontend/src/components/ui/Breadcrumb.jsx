// frontend/src/components/ui/Breadcrumb.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb = ({ items = [] }) => {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center gap-1.5 text-[10px] font-bold text-brand-secondary uppercase tracking-wider mb-4 select-none">
      <button
        onClick={() => navigate('/dashboard')}
        className="hover:text-brand-text flex items-center gap-1 transition-colors focus:outline-none"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </button>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3 h-3 text-[#334155]/85" />
            {isLast ? (
              <span className="text-brand-text">{item.name}</span>
            ) : (
              <button
                onClick={() => item.path && navigate(item.path)}
                className="hover:text-brand-text transition-colors focus:outline-none"
              >
                {item.name}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
