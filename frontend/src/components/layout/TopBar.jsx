// frontend/src/components/layout/TopBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Search, Bell, Sun, Moon, Menu, User, Settings, Lock, LogOut, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { RoleBadge } from '../dashboard/DashboardComponents';

// 1. NotificationButton
export const NotificationButton = () => {
  return (
    <button 
      type="button"
      className="p-2 rounded-xl text-[#94a3b8] hover:text-[#f8fafc] hover:bg-slate-800/40 relative focus:outline-none transition-all"
    >
      <Bell className="w-4.5 h-4.5" />
      <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
    </button>
  );
};

// 2. ProfileMenu
export const ProfileMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Session terminated successfully');
      navigate('/');
    } catch {
      toast.error('Logout request failed');
    }
  };

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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border-l border-[#334155] pl-4 hover:opacity-85 transition-opacity focus:outline-none"
      >
        <div className="w-7 h-7 rounded-lg bg-brand-primary text-white flex items-center justify-center text-xs font-bold font-mono">
          {user?.profile_image ? (
            <img src={user.profile_image} alt={user.fullname} className="w-full h-full object-cover rounded-lg" />
          ) : (
            user?.fullname?.charAt(0).toUpperCase()
          )}
        </div>
        <span className="text-xs font-semibold text-brand-text hidden md:inline select-none">{user?.fullname}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#94a3b8] hidden md:inline transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-[#334155] rounded-xl shadow-xl shadow-slate-950/40 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-2.5 border-b border-[#334155]/40 select-none">
            <p className="text-xs font-bold text-brand-text truncate leading-none">{user?.fullname}</p>
            <p className="text-[10px] text-brand-secondary truncate mt-1 mb-2 leading-none">{user?.email}</p>
            <RoleBadge role={user?.role?.role_name} />
          </div>

          <div className="p-1">
            <button
              onClick={() => { setIsOpen(false); navigate('/profile'); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-brand-secondary hover:text-brand-text hover:bg-slate-800/40 text-left transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>
            <button
              disabled
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#94a3b8] opacity-50 hover:bg-transparent text-left cursor-not-allowed select-none"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings (Placeholder)</span>
            </button>
            <button
              onClick={() => { setIsOpen(false); navigate('/profile'); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-brand-secondary hover:text-brand-text hover:bg-slate-800/40 text-left transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Change Password</span>
            </button>
          </div>

          <div className="border-t border-[#334155]/40 p-1 mt-1">
            <button
              onClick={() => { setIsOpen(false); handleLogout(); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-brand-danger hover:bg-red-500/5 text-left transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 3. TopBar Component
export const TopBar = ({ onToggleSidebar }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="h-14 border-b border-[#334155]/30 bg-[#1e293b]/30 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 select-none shrink-0 z-40">
      {/* Sidebar Toggle for Tablet/Mobile */}
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-xl text-[#94a3b8] hover:text-[#f8fafc] hover:bg-slate-800/40 focus:outline-none transition-all lg:hidden"
        aria-label="Toggle Sidebar Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Non-functional Search Box */}
      <div className="relative w-72 hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
        <input
          type="text"
          placeholder="Search threat entries, nodes..."
          disabled
          className="w-full h-8 pl-9 pr-4 bg-slate-900/40 border border-[#334155] rounded-lg text-xs outline-none cursor-not-allowed placeholder-slate-600 focus:outline-none"
        />
      </div>

      {/* Actions & Dropdown */}
      <div className="flex items-center gap-3 ml-auto">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-[#94a3b8] hover:text-[#f8fafc] hover:bg-slate-800/40 focus:outline-none transition-all"
          aria-label="Toggle Theme Mode"
        >
          {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        <NotificationButton />
        
        <ProfileMenu />
      </div>
    </header>
  );
};

export default TopBar;
