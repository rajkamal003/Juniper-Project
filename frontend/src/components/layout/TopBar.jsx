// frontend/src/components/layout/TopBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { RoleBadge } from '../dashboard/DashboardComponents';
import ThemeSwitcher from '../ui/ThemeSwitcher';

// 1. NotificationButton
export const NotificationButton = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const roleName = user?.role?.role_name || 'Guest';
    let list = [];
    if (roleName === 'Student') {
      list = [
        { id: 1, text: 'Blocked Website Attempt', read: false },
        { id: 2, text: 'Exam Mode Enabled', read: false },
        { id: 3, text: 'Assignment Uploaded', read: false },
        { id: 4, text: 'Attendance Updated', read: false },
        { id: 5, text: 'WiFi Connected', read: false }
      ];
    } else if (roleName === 'Faculty') {
      list = [
        { id: 1, text: 'Device Connected', read: false },
        { id: 2, text: 'Meeting Reminder', read: false },
        { id: 3, text: 'Firewall Alert', read: false },
        { id: 4, text: 'MFA Login Successful', read: false },
        { id: 5, text: 'Research Access Granted', read: false }
      ];
    } else if (roleName === 'Parent Visitor') {
      list = [
        { id: 1, text: 'Usage Limit Warning', read: false },
        { id: 2, text: 'Session Started', read: false },
        { id: 3, text: 'Visitor Pass Approved', read: false },
        { id: 4, text: 'Monthly Report Generated', read: false },
        { id: 5, text: 'Child Connected to Campus WiFi', read: false }
      ];
    } else {
      list = [
        { id: 1, text: 'Low Signal', read: false },
        { id: 2, text: 'WiFi Session Expired', read: false },
        { id: 3, text: 'WiFi Session Started', read: false },
        { id: 4, text: 'Access Expiring', read: false },
        { id: 5, text: 'Access Approved', read: false }
      ];
    }
    
    const saved = localStorage.getItem(`notifications_${user?.id || 'anon'}`);
    if (saved) {
      setNotifications(JSON.parse(saved));
    } else {
      setNotifications(list);
    }
  }, [user]);

  const saveAndSetNotifications = (newVal) => {
    setNotifications(newVal);
    localStorage.setItem(`notifications_${user?.id || 'anon'}`, JSON.stringify(newVal));
  };

  const markAsRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveAndSetNotifications(updated);
  };

  const clearAll = () => {
    saveAndSetNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
      <motion.button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05, rotate: 6 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="p-2.5 rounded-xl border shadow-xs focus:outline-none relative cursor-pointer"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-secondary)'
        }}
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 shrink-0" />
        {unreadCount > 0 && (
          <>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-ping bg-red-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600" />
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-80 border rounded-2xl shadow-2xl p-2.5 z-50 backdrop-blur-xl"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-main)',
              boxShadow: 'var(--shadow-hover)'
            }}
          >
            <div className="px-3 py-2 border-b border-gray-200/10 flex items-center justify-between select-none">
              <span className="font-extrabold text-xs uppercase tracking-wider text-brand-text">Alerts</span>
              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <button 
                    onClick={clearAll}
                    className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto mt-2 space-y-1.5 pr-0.5">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-brand-secondary select-none">
                  No notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex items-start justify-between gap-3 p-2.5 rounded-xl text-[11px] font-medium border transition-colors select-none ${
                      notif.read 
                        ? 'bg-transparent border-transparent opacity-50' 
                        : 'bg-brand-primary/5 border-brand-primary/10'
                    }`}
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${notif.read ? 'bg-slate-500' : 'bg-brand-primary'}`} />
                      <p className="text-brand-text leading-tight truncate pr-1" title={notif.text}>{notif.text}</p>
                    </div>
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="text-[9px] font-bold text-brand-primary hover:underline shrink-0 cursor-pointer"
                      >
                        Read
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className="flex items-center gap-3 border-l pl-4 hover:opacity-90 transition-opacity focus:outline-none cursor-pointer"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div 
          className="w-9 h-9 rounded-xl text-white flex items-center justify-center font-bold shadow-xs font-mono text-sm shrink-0"
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
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-64 border rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl"
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
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-nav font-medium text-left transition-colors hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                style={{ color: 'var(--text-main)' }}
              >
                <User className="w-4.5 h-4.5" style={{ color: 'var(--color-primary)' }} />
                <span>My Account</span>
              </button>
            </div>
 
            <div className="border-t border-gray-200/20 p-1 mt-1">
              <button
                onClick={() => { setIsOpen(false); handleLogout(); }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-nav font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-left transition-colors cursor-pointer"
              >
                <LogOut className="w-4.5 h-4.5" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 3. TopBar Component
export const TopBar = ({ onToggleSidebar }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSimulated, setIsSimulated] = useState(() => localStorage.getItem('simulation_mode') !== 'false');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const handleSimModeChange = () => {
      setIsSimulated(localStorage.getItem('simulation_mode') !== 'false');
    };
    window.addEventListener('storage', handleSimModeChange);
    window.addEventListener('simulation_mode_changed', handleSimModeChange);
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleSimModeChange);
      window.removeEventListener('simulation_mode_changed', handleSimModeChange);
      clearInterval(timer);
    };
  }, []);

  const formattedDateTime = currentTime.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <header 
      className="h-16 border-b backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 select-none shrink-0 z-40 transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-navbar)',
        borderColor: 'var(--border-color)'
      }}
    >
      {/* Sidebar Toggle for Mobile/Tablet */}
      <motion.button
        onClick={onToggleSidebar}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="p-2.5 rounded-xl border focus:outline-none transition-all lg:hidden cursor-pointer"
        aria-label="Toggle Sidebar Menu"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-secondary)'
        }}
      >
        <Menu className="w-5 h-5" />
      </motion.button>

      {/* Non-functional Search Box with Motion Glow */}
      <motion.div 
        animate={{ scale: isSearchFocused ? 1.01 : 1 }}
        transition={{ duration: 0.15 }}
        className="relative w-80 hidden sm:block"
      >
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search threat entries, nodes..."
          disabled
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="w-full h-10 pl-10 pr-4 border rounded-xl text-placeholder outline-none cursor-not-allowed transition-all duration-150"
          style={{
            backgroundColor: 'var(--bg-input)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-muted)'
          }}
        />
      </motion.div>

      {/* Actions & Theme Switcher */}
      <div className="flex items-center gap-3 ml-auto">
        {isSimulated && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-[11px] font-extrabold animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Simulation Mode (Hardware Pending)</span>
          </div>
        )}
        {/* Current Date & Time */}
        <div 
          className="hidden lg:flex items-center px-3 py-1.5 rounded-xl border text-xs font-mono font-bold"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-secondary)'
          }}
        >
          {formattedDateTime}
        </div>
        <ThemeSwitcher />
        <NotificationButton />
        <ProfileMenu />
      </div>
    </header>
  );
};

export default TopBar;
