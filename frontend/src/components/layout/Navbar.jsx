// frontend/src/components/layout/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, Shield } from 'lucide-react';

export const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass-panel border-b border-[#334155]/20 backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Info (Left) */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 select-none">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Shield className="w-4.5 h-4.5 animate-pulse-slow" />
              </div>
              <span className="font-bold text-sm tracking-tight text-brand-text">
                SecureCampus AI Portal
              </span>
            </Link>
            <span className="text-[10px] bg-slate-800 text-brand-secondary px-1.5 py-0.5 rounded font-mono select-none font-bold">
              v1.0.0
            </span>
          </div>

          {/* Theme Toggle (Right) */}
          <div className="flex items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-brand-secondary hover:text-brand-text hover:bg-slate-800/40 focus:outline-none"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
