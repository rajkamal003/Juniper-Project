// frontend/src/components/layout/Footer.jsx
import React from 'react';
import { Shield } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="glass-panel border-t py-6 mt-auto z-10 transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-surface-glass)',
        borderColor: 'var(--border-color)'
      }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          {/* Brand info */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-center sm:justify-start gap-2.5 font-bold text-footer" style={{ color: 'var(--text-main)' }}>
              <Shield className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              <span>SecureCampus AI</span>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                v1.0.0
              </span>
            </div>
            <p className="text-footer text-sm" style={{ color: 'var(--text-secondary)' }}>
              Intelligent Campus Access & Network Operations Monitor
            </p>
          </div>

          {/* Brand Links */}
          <div className="flex flex-col items-center sm:items-end gap-1.5">
            <div className="flex items-center gap-3 text-footer font-semibold select-none" style={{ color: 'var(--text-main)' }}>
              <span>SecureCampus AI Platform</span>
            </div>
            <div className="flex items-center gap-3 text-footer text-xs select-none" style={{ color: 'var(--text-secondary)' }}>
              <a href="#privacy" className="hover:underline hover:opacity-80">Privacy Policy</a>
              <span>•</span>
              <a href="#terms" className="hover:underline hover:opacity-80">Terms</a>
              <span>•</span>
              <a href="#help" className="hover:underline hover:opacity-80">Help</a>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center sm:text-right">
            <p className="text-footer text-xs" style={{ color: 'var(--text-muted)' }}>
              &copy; {currentYear} SecureCampus AI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
