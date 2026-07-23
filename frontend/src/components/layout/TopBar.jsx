// frontend/src/components/layout/TopBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Bell, Menu, User, Settings, Lock, LogOut, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { RoleBadge } from '../dashboard/DashboardComponents';
import ThemeSwitcher from '../ui/ThemeSwitcher';

// 1. NotificationButton
export const NotificationButton = () => {
  return (
    <button 
      type="button"
      className="p-2.5 rounded-xl transition-all duration-200 border shadow-xs hover:scale-[1.05] focus:outline-none relative"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-secondary)'
      }}
      title="Notifications"
      aria-label="Notifications"
    >
      <Bell className="w-5 h-5 shrink-0" />
      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
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
        className="flex items-center gap-3 border-l pl-4 hover:opacity-90 transition-opacity focus:outline-none cursor-pointer"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div 
          className="w-9 h-9 rounded-xl text-white flex items-center justify-center font-bold shadow-sm font-mono text-sm shrink-0"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {user?.profile_image ? (
            <img src={user.profile_image} alt={user.fullname} className="w-full h-full object-cover rounded-xl" />
          ) : (
            user?.fullname?.charAt(0).toUpperCase()
          )}
        </div>
        <span className="text-nav font-semibold hidden md:inline select-none" style={{ color: 'var(--text-main)' }}>
          {user?.fullname}
        </span>
        <ChevronDown 
          className={`w-4 h-4 hidden md:inline transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-secondary)' }}
        />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-3 w-64 border rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-main)',
            boxShadow: 'var(--shadow-hover)'
          }}
        >
          <div className="px-4 py-3 border-b border-gray-200/20 select-none">
            <p className="font-bold text-body truncate leading-none mb-1">{user?.fullname}</p>
            <p className="text-sm truncate mb-2" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            <RoleBadge role={user?.role?.role_name} />
          </div>

          <div className="p-1 space-y-1">
            <button
              onClick={() => { setIsOpen(false); navigate('/profile'); }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-nav font-medium text-left transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              style={{ color: 'var(--text-main)' }}
            >
              <User className="w-4.5 h-4.5" style={{ color: 'var(--color-primary)' }} />
              <span>Profile</span>
            </button>
            <button
              disabled
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-nav font-medium opacity-50 text-left cursor-not-allowed select-none"
              style={{ color: 'var(--text-muted)' }}
            >
              <Settings className="w-4.5 h-4.5" />
              <span>Settings (Placeholder)</span>
            </button>
            <button
              onClick={() => { setIsOpen(false); navigate('/profile'); }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-nav font-medium text-left transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              style={{ color: 'var(--text-main)' }}
            >
              <Lock className="w-4.5 h-4.5" style={{ color: 'var(--color-primary)' }} />
              <span>Change Password</span>
            </button>
          </div>

          <div className="border-t border-gray-200/20 p-1 mt-1">
            <button
              onClick={() => { setIsOpen(false); handleLogout(); }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-nav font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-left transition-colors"
            >
              <LogOut className="w-4.5 h-4.5" />
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
  return (
    <header 
      className="h-16 border-b backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 select-none shrink-0 z-40 transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-navbar)',
        borderColor: 'var(--border-color)'
      }}
    >
      {/* Sidebar Toggle for Mobile/Tablet */}
      <button
        onClick={onToggleSidebar}
        className="p-2.5 rounded-xl border focus:outline-none transition-all lg:hidden"
        aria-label="Toggle Sidebar Menu"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-secondary)'
        }}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Non-functional Search Box */}
      <div className="relative w-80 hidden sm:block">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search threat entries, nodes..."
          disabled
          className="w-full h-10 pl-10 pr-4 border rounded-xl text-placeholder outline-none cursor-not-allowed"
          style={{
            backgroundColor: 'var(--bg-input)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-muted)'
          }}
        />
      </div>

      {/* Actions & Theme Switcher */}
      <div className="flex items-center gap-3 ml-auto">
        <ThemeSwitcher />
        <NotificationButton />
        <ProfileMenu />
      </div>
    </header>
  );
};

export default TopBar;
