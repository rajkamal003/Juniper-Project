// frontend/src/components/layout/AuthLayout.jsx
import React from 'react';
import { Shield } from 'lucide-react';
import Navbar from './Navbar';
import NetworkNodesCanvas from './NetworkNodesCanvas';

export const AuthLayout = ({ children }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden transition-colors duration-500 bg-[#0f172a] text-[#f8fafc] font-sans">
      <NetworkNodesCanvas />
      
      {/* Top Navbar */}
      <Navbar />
      
      {/* Centered Auth Card Area */}
      <main className="flex-grow flex justify-center items-center px-4 pt-24 pb-8 z-10">
        {children}
      </main>
      
      {/* Unified Enterprise Footer */}
      <footer className="glass-panel border-t border-[#334155]/20 py-6 mt-auto z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 font-bold text-sm text-brand-text">
                <Shield className="w-4 h-4 text-brand-primary animate-pulse-slow" />
                <span>SecureCampus AI Portal</span>
                <span className="text-[10px] bg-slate-800 text-brand-secondary px-1.5 py-0.5 rounded font-mono">
                  v1.0.0
                </span>
              </div>
              <p className="text-[11px] text-[#94a3b8]">
                Enterprise Smart Campus Access Management
              </p>
            </div>

            <div className="flex flex-col items-center sm:items-end gap-1.5">
              <div className="flex items-center gap-2.5 text-[11px] font-semibold text-[#94a3b8]">
                <span>Powered by Juniper Networks</span>
                <span>•</span>
                <span>EduSkills</span>
                <span>•</span>
                <span>KL University</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-brand-secondary select-none">
                <a href="#privacy" className="hover:text-brand-primary hover:underline">Privacy Policy</a>
                <span>•</span>
                <a href="#terms" className="hover:text-brand-primary hover:underline">Terms</a>
                <span>•</span>
                <a href="#help" className="hover:text-brand-primary hover:underline">Help</a>
              </div>
            </div>

            <div className="text-center sm:text-right select-none">
              <p className="text-[10px] text-brand-secondary">
                &copy; {currentYear} SecureCampus AI. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
