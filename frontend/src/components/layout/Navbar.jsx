// frontend/src/components/layout/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import ThemeSwitcher from '../ui/ThemeSwitcher';

export const Navbar = () => {
  return (
    <nav 
      className="fixed top-0 left-0 w-full z-50 glass-panel border-b backdrop-blur-xl transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-navbar)',
        borderColor: 'var(--border-color)'
      }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Portal Info (Left) */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 select-none group">
              <div 
                className="w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-105"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <Shield className="w-5 h-5 animate-pulse" />
              </div>
              <span className="font-bold text-nav tracking-tight" style={{ color: 'var(--text-main)' }}>
                SecureCampus AI Portal
              </span>
            </Link>
            <span 
              className="text-xs px-2 py-0.5 rounded font-mono select-none font-bold hidden sm:inline"
              style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
            >
              v1.0.0
            </span>
          </div>

          {/* Theme Switcher (Right) */}
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
