// frontend/src/components/ui/ThemeSwitcher.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, X } from 'lucide-react';

export const ThemeSwitcher = () => {
  const { theme, setTheme, themes, currentTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close panel on ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelectTheme = (themeId) => {
    setTheme(themeId);
    // Allow 180ms delay so user briefly sees the checkmark and color transition before smooth slide-out
    setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  return (
    <>
      {/* Compact Trigger Button inside Navbar / TopBar */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg transition-transform hover:scale-105 active:scale-95 focus:outline-none flex items-center justify-center gap-1.5 cursor-pointer border shadow-xs"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-main)'
        }}
        title="Theme Settings"
        aria-label="Theme Settings"
      >
        <Palette className="w-5 h-5 shrink-0" style={{ color: 'var(--color-primary)' }} />
        <div 
          className="w-2.5 h-2.5 rounded-full shrink-0 border"
          style={{ 
            backgroundColor: currentTheme?.primary || '#2563eb',
            borderColor: 'rgba(0,0,0,0.15)'
          }}
        />
      </button>

      {/* Floating Overlay Drawer mounted at document.body via React Portal */}
      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="font-sans select-none">
              {/* Semi-transparent Backdrop overlay over entire viewport (z-index 99998) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 bg-black/40 z-[99998]"
                onClick={() => setIsOpen(false)}
              />

              {/* Fixed Right Drawer (z-index 99999): Fixed top 0, right 0, width 170px, height 100vh */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed top-0 right-0 h-screen w-[170px] bg-white shadow-2xl flex flex-col rounded-none z-[99999] overflow-hidden"
              >
                {/* Purple Header (#6b21a8), Height ~55px */}
                <div className="h-[55px] bg-[#6b21a8] text-white px-3 flex items-center justify-between shrink-0 shadow-xs">
                  <span className="font-extrabold text-[12px] uppercase tracking-wider text-white">
                    THEME SETTINGS
                  </span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/80 hover:text-white transition-colors focus:outline-none cursor-pointer p-1"
                    aria-label="Close Theme Settings"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-3 flex-1 overflow-y-auto bg-white">
                  <p className="text-[12px] font-bold text-gray-700 mb-3 text-left">
                    Choose Theme Color
                  </p>

                  {/* 3 Columns Color Grid */}
                  <div className="grid grid-cols-3 gap-2.5 justify-items-center">
                    {themes.map((t) => {
                      const isSelected = theme === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => handleSelectTheme(t.id)}
                          className={`w-[34px] h-[34px] rounded-md flex items-center justify-center cursor-pointer transition-all border shadow-xs relative ${
                            isSelected ? 'ring-2 ring-purple-600 border-white' : 'hover:opacity-90 border-black/10'
                          }`}
                          style={{ backgroundColor: t.primary }}
                          title={t.name}
                          aria-label={t.name}
                        >
                          {isSelected && (
                            <Check className="w-4 h-4 text-white stroke-[3]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default ThemeSwitcher;
