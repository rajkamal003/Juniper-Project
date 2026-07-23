// frontend/src/components/layout/DashboardLayout.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  LayoutDashboard, 
  Users, 
  Cpu, 
  Globe, 
  AlertOctagon, 
  FileSpreadsheet, 
  Settings, 
  User, 
  Calendar, 
  BookOpen, 
  Award, 
  UserCheck, 
  LogOut, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import TopBar from './TopBar';
import PageTransition from '../ui/PageTransition';

export const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Session terminated successfully');
      navigate('/');
    } catch {
      toast.error('Logout request failed');
    }
  };

  const getSidebarItems = (roleName) => {
    switch (roleName) {
      case 'Super Admin':
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
          { name: 'Security Analytics', icon: Shield, path: '/analytics' },
          { name: 'Security Alerts', icon: AlertOctagon, path: '/security-alerts' },
          { name: 'Users', icon: Users, path: '/users' },
          { name: 'Devices', icon: Cpu, path: '/devices' },
          { name: 'Network', icon: Globe, path: '/network' },
          { name: 'Firewall', icon: AlertOctagon, path: '/firewall' },
          { name: 'Reports', icon: FileSpreadsheet, path: '/reports' },
          { name: 'Settings', icon: Settings, path: '/settings' },
          { name: 'Exam Mode', icon: Award, path: '/exam-mode' },
          { name: 'Profile', icon: User, path: '/profile' }
        ];
      case 'Faculty':
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
          { name: 'Students', icon: Users, path: '/students' },
          { name: 'Attendance', icon: Calendar, path: '/attendance' },
          { name: 'Exam Mode', icon: Award, path: '/exam-mode' },
          { name: 'Profile', icon: User, path: '/profile' }
        ];
      case 'Student':
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
          { name: 'Courses', icon: BookOpen, path: '/courses' },
          { name: 'Exam Mode', icon: Award, path: '/exam-mode' },
          { name: 'Profile', icon: User, path: '/profile' }
        ];
      case 'Parent Visitor':
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
          { name: 'Student Status', icon: UserCheck, path: '/student-status' },
          { name: 'Profile', icon: User, path: '/profile' }
        ];
      case 'Guest':
      default:
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
          { name: 'Visitor Access', icon: Globe, path: '/visitor-access' },
          { name: 'Profile', icon: User, path: '/profile' }
        ];
    }
  };

  const roleName = user?.role?.role_name || 'Guest';
  const sidebarItems = getSidebarItems(roleName);

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileDrawerOpen(!isMobileDrawerOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const SidebarContent = ({ isMobile = false }) => {
    return (
      <div className="h-full flex flex-col justify-between select-none">
        <div className="space-y-6">
          {/* Logo container */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ rotate: 15 }}
                className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold shadow-md shrink-0"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <Shield className="w-5 h-5" />
              </motion.div>
              {(!isSidebarCollapsed || isMobile) && (
                <div className="text-left animate-in fade-in duration-200">
                  <p className="text-body font-bold leading-tight" style={{ color: 'var(--text-main)' }}>Console Manager</p>
                  <p className="text-xs font-mono uppercase tracking-widest mt-0.5 font-semibold" style={{ color: 'var(--text-muted)' }}>NOC GATE</p>
                </div>
              )}
            </div>
            {isMobile && (
              <button 
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-xl border hover:bg-black/5 dark:hover:bg-white/10"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {sidebarItems.map((item, idx) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              
              return (
                <motion.button
                  key={idx}
                  onClick={() => {
                    if (isMobile) setIsMobileDrawerOpen(false);
                    navigate(item.path);
                  }}
                  whileHover={{ x: isSidebarCollapsed && !isMobile ? 0 : 4 }}
                  whileTap={{ scale: 0.98 }}
                  title={isSidebarCollapsed && !isMobile ? item.name : undefined}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sidebar font-medium tracking-wide transition-all ${
                    isSidebarCollapsed && !isMobile ? 'justify-center' : 'justify-start'
                  }`}
                  style={{
                    backgroundColor: isActive ? 'var(--bg-hover)' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 500,
                    border: isActive ? '1px solid var(--border-focus)' : '1px solid transparent'
                  }}
                >
                  <motion.div whileHover={{ rotate: 10 }}>
                    <item.icon className="w-5 h-5 shrink-0" style={{ color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)' }} />
                  </motion.div>
                  {(!isSidebarCollapsed || isMobile) && (
                    <span className="truncate">{item.name}</span>
                  )}
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Terminate Session */}
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          title={isSidebarCollapsed && !isMobile ? "Terminate Session" : undefined}
          className={`w-full flex items-center justify-center gap-2.5 px-4 py-3 border border-red-500/30 text-red-600 font-bold text-btn rounded-xl transition-all hover:bg-red-500/10 cursor-pointer ${
            isSidebarCollapsed && !isMobile ? 'px-0' : 'px-4'
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {(!isSidebarCollapsed || isMobile) && <span>Terminate Session</span>}
        </motion.button>
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen flex transition-colors duration-500 font-sans"
      style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }}
    >
      {/* Permanent Desktop Sidebar with Framer Motion resize */}
      <motion.aside 
        animate={{ width: isSidebarCollapsed ? 84 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="border-r flex flex-col p-5 shrink-0 relative hidden lg:block"
        style={{
          backgroundColor: 'var(--bg-sidebar)',
          borderColor: 'var(--border-color)'
        }}
      >
        <SidebarContent />
        
        {/* Collapse Button Arrow */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-4 top-20 w-8 h-8 rounded-full border flex items-center justify-center shadow-lg z-50 focus:outline-none cursor-pointer transition-transform hover:scale-110"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-secondary)'
          }}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </motion.aside>

      {/* Mobile Drawer (Slide-over overlay) */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setIsMobileDrawerOpen(false)}
          >
            <motion.div 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 w-72 border-r p-6 shadow-2xl"
              style={{
                backgroundColor: 'var(--bg-sidebar)',
                borderColor: 'var(--border-color)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <SidebarContent isMobile={true} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Panel */}
      <div className="flex-grow flex flex-col min-w-0">
        <TopBar onToggleSidebar={toggleSidebar} />

        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto relative">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
