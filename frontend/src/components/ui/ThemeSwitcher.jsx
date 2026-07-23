// frontend/src/components/ui/ThemeSwitcher.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Palette, Check, Sparkles } from 'lucide-react';

export const ThemeSwitcher = () => {
  const { theme, setTheme, themes, currentTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Compact Trigger: Icon + Color Indicator Dot ONLY (No theme name text when closed) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-xl transition-all duration-200 border shadow-xs hover:scale-[1.05] active:scale-[0.97] focus:outline-none flex items-center justify-center gap-2 cursor-pointer"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-main)'
        }}
        title={currentTheme ? `Theme: ${currentTheme.name}` : "Theme System"}
        aria-label="Theme System"
      >
        <Palette className="w-5 h-5 shrink-0" style={{ color: 'var(--color-primary)' }} />
        <div 
          className="w-3 h-3 rounded-full border shrink-0 shadow-xs" 
          style={{ 
            backgroundColor: currentTheme?.primary || 'var(--color-primary)',
            borderColor: 'rgba(0,0,0,0.15)'
          }} 
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-3 w-80 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-3 duration-200"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-main)',
            boxShadow: 'var(--shadow-hover)'
          }}
        >
          {/* Header showing current active theme details */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4.5 h-4.5 shrink-0" style={{ color: 'var(--color-primary)' }} />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Current Theme</p>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base truncate">{currentTheme?.name || 'White + Blue'}</h3>
                  <div className="w-3 h-3 rounded-full shrink-0 border" style={{ backgroundColor: currentTheme?.primary, borderColor: 'rgba(0,0,0,0.15)' }} />
                </div>
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full font-bold shrink-0 ml-2" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
              10 Themes
            </span>
          </div>

          {/* Theme List */}
          <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
            {themes.map((t) => {
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all duration-150 group border cursor-pointer ${
                    isSelected ? 'font-bold shadow-xs' : 'hover:bg-black/5 dark:hover:bg-white/5 font-medium'
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'var(--bg-hover)' : 'transparent',
                    borderColor: isSelected ? 'var(--color-primary)' : 'transparent'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <div 
                        className="w-5.5 h-5.5 rounded-full border shadow-xs transition-transform group-hover:scale-110" 
                        style={{ backgroundColor: t.primary, borderColor: 'rgba(0,0,0,0.1)' }} 
                      />
                      <div 
                        className="w-2.5 h-2.5 rounded-full absolute -bottom-0.5 -right-0.5 border" 
                        style={{ backgroundColor: t.bg, borderColor: t.primary }} 
                      />
                    </div>
                    <span className="text-sm font-semibold">{t.name}</span>
                  </div>

                  {isSelected && (
                    <Check className="w-5 h-5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
