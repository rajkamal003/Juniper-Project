// frontend/src/contexts/ThemeContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

export const THEMES = [
  { id: 'white-blue', name: 'White + Blue (Default)', primary: '#2563eb', bg: '#ffffff', badgeBg: '#dbeafe', badgeText: '#1d4ed8' },
  { id: 'white-green', name: 'White + Green', primary: '#059669', bg: '#ffffff', badgeBg: '#d1fae5', badgeText: '#047857' },
  { id: 'white-pink', name: 'White + Pink', primary: '#db2777', bg: '#ffffff', badgeBg: '#fce7f3', badgeText: '#be185d' },
  { id: 'white-purple', name: 'White + Purple', primary: '#7c3aed', bg: '#ffffff', badgeBg: '#ede9fe', badgeText: '#6d28d9' },
  { id: 'white-orange', name: 'White + Orange', primary: '#ea580c', bg: '#ffffff', badgeBg: '#ffedd5', badgeText: '#c2410c' },
  { id: 'white-red', name: 'White + Red', primary: '#dc2626', bg: '#ffffff', badgeBg: '#fee2e2', badgeText: '#b91c1c' },
  { id: 'white-cyan', name: 'White + Cyan', primary: '#0891b2', bg: '#ffffff', badgeBg: '#cffaff', badgeText: '#0e7490' },
  { id: 'white-teal', name: 'White + Teal', primary: '#0d9488', bg: '#ffffff', badgeBg: '#ccfbf1', badgeText: '#0f766e' },
  { id: 'white-indigo', name: 'White + Indigo', primary: '#4f46e5', bg: '#ffffff', badgeBg: '#e0e7ff', badgeText: '#4338ca' }
];

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved && THEMES.some(t => t.id === saved)) {
      return saved;
    }
    return 'white-blue';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const changeTheme = (themeId) => {
    if (THEMES.some(t => t.id === themeId)) {
      setThemeState(themeId);
    }
  };

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'white-blue' ? 'white-indigo' : 'white-blue'));
  };

  const currentThemeObj = THEMES.find(t => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme: changeTheme, 
      toggleTheme, 
      isDark: false,
      currentTheme: currentThemeObj,
      themes: THEMES 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
