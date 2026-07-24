// frontend/src/components/layout/TopBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Menu, User, Settings, LogOut, ChevronDown, X } from 'lucide-react';
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSimulated, setIsSimulated] = useState(() => localStorage.getItem('simulation_mode') !== 'false');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Command Palette Open State
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Searchable Items Database with redirection paths
  const searchDatabase = {
    'Super Admin': [
      { id: 'admin-dash', title: 'Admin Security Dashboard', category: 'Navigation', path: '/admin' },
      { id: 'admin-users', title: 'Manage Users & Permissions', category: 'Navigation', path: '/users' },
      { id: 'admin-devices', title: 'Device Inventory & Nodes', category: 'Navigation', path: '/devices' },
      { id: 'admin-net', title: 'Campus Network VLAN Ranges', category: 'Navigation', path: '/network' },
      { id: 'admin-fw', title: 'Firewall Policy Rules Control', category: 'Navigation', path: '/firewall' },
      { id: 'admin-rep', title: 'Security Traffic Reports', category: 'Navigation', path: '/reports' },
      { id: 'admin-set', title: 'System Administration Settings', category: 'Navigation', path: '/settings' },
      { id: 'sec-alert-1', title: 'Active Threat: Malicious port scanning detected', category: 'Alerts', path: '/security-alerts' },
      { id: 'sec-alert-2', title: 'Active Alert: Low signal access point AP32', category: 'Alerts', path: '/security-alerts' }
    ],
    'Faculty': [
      { id: 'fac-dash', title: 'Faculty Dashboard', category: 'Navigation', path: '/faculty' },
      { id: 'fac-profile', title: 'My Account Settings Profile', category: 'Navigation', path: '/profile' }
    ],
    'Student': [
      { id: 'stud-dash', title: 'Student Central Dashboard', category: 'Navigation', path: '/student' },
      { id: 'stud-profile', title: 'My Profile Preferences', category: 'Navigation', path: '/profile' },
      { id: 'stud-access', title: 'Campus Access WiFi request', category: 'WiFi', path: '/campus-access' }
    ],
    'Parent Visitor': [
      { id: 'parent-dash', title: 'Parent Dashboard Status', category: 'Navigation', path: '/parent' },
      { id: 'parent-stud', title: 'Student Status Profile', category: 'Status', path: '/student-status' }
    ]
  };

  const roleName = user?.role?.role_name || 'Guest';

  // Dynamic placeholder text
  const getPlaceholderText = () => {
    switch (roleName) {
      case 'Super Admin':
        return "Search users, devices, firewall... (Ctrl + K)";
      case 'Faculty':
        return "Search students, attendance... (Ctrl + K)";
      case 'Parent Visitor':
        return "Search student status... (Ctrl + K)";
      case 'Student':
      default:
        return "Search WiFi, devices, applications... (Ctrl + K)";
    }
  };

  // Setup Hotkeys (Ctrl + K and /)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle Command Palette
      if ((e.ctrlKey && e.key === 'k') || e.key === 'K') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      } else if (e.key === '/' && !isPaletteOpen && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaletteOpen]);

  // Debounced search hook (300ms)
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSelectedIndex(0);
      return;
    }
    
    setLoading(true);
    const delayDebounce = setTimeout(() => {
      const pool = searchDatabase[roleName] || searchDatabase['Student'] || [];
      const query = searchQuery.toLowerCase();
      const filtered = pool.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
      setSearchResults(filtered);
      setSelectedIndex(0);
      setLoading(false);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, roleName]);

  // Handle Palette result actions
  const selectResult = (item) => {
    setIsPaletteOpen(false);
    setSearchQuery('');
    toast.success(`Redirecting to: ${item.title}`);
    navigate(item.path);
  };

  // Keyboard navigation within results
  const handlePaletteKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        selectResult(searchResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsPaletteOpen(false);
    }
  };

  // Helper function to highlight matches
  const highlightMatch = (text, highlight) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/60 text-slate-900 dark:text-slate-100 rounded-xs px-0.5 font-bold">
              {part}
            </mark>
          ) : part
        )}
      </span>
    );
  };

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
    <>
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

        {/* Global Search Bar Trigger button */}
        <button 
          onClick={() => setIsPaletteOpen(true)}
          className="relative w-80 h-10 px-4 border rounded-xl transition-all duration-150 flex items-center gap-3 text-left shadow-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 hidden sm:flex select-none"
          style={{
            backgroundColor: 'var(--bg-input)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-main)'
          }}
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium truncate flex-1">
            {getPlaceholderText()}
          </span>
          <kbd className="hidden md:inline-flex h-5 select-none items-center gap-0.5 rounded border border-slate-200 px-1.5 font-mono text-[10px] font-bold text-slate-400 bg-slate-50">
            <span>⌘</span>K
          </kbd>
        </button>

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

      {/* VS Code Command Palette Overlay Modal */}
      {isPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] p-4">
          {/* Backdrop overlay */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsPaletteOpen(false)} />
          
          {/* Modal Container */}
          <div 
            className="relative w-full max-w-xl border rounded-2xl p-4.5 shadow-2xl z-10 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200 select-none"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)'
            }}
          >
            {/* Search Input Box */}
            <div className="relative flex items-center mb-3">
              <Search className="absolute left-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder={getPlaceholderText()}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handlePaletteKeyDown}
                className="w-full h-12 pl-11 pr-10 border rounded-xl text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-850 dark:text-slate-100"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-main)'
                }}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              )}
            </div>

            {/* Results Block */}
            <div className="max-h-[320px] overflow-y-auto pr-0.5 space-y-1.5">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-400 font-bold">Scanning secure indexes...</span>
                </div>
              ) : searchQuery.trim().length < 2 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-semibold select-none flex flex-col gap-1.5">
                  <span>Type at least 2 characters to search...</span>
                  <span className="text-[10px] text-slate-400/80">Tip: use Arrow Keys to navigate and Enter to select.</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-12 text-center select-none space-y-2">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No results found</p>
                  <p className="text-xs text-slate-400 font-medium">We couldn't find matches for "{searchQuery}" under your role scope.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                      <button
                        key={item.id}
                        onClick={() => selectResult(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex justify-between items-center transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span className="truncate mr-2">
                          {isSelected ? item.title : highlightMatch(item.title, searchQuery)}
                        </span>
                        <span className={`text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md shrink-0 select-none ${
                          isSelected 
                            ? 'bg-white/20 text-white' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}>
                          {item.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopBar;
