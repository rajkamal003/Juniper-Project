// frontend/src/components/layout/DashboardLayout.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
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
          { name: 'Users', icon: Users, path: '/users' },
          { name: 'Devices', icon: Cpu, path: '/devices' },
          { name: 'Network', icon: Globe, path: '/network' },
          { name: 'Firewall', icon: AlertOctagon, path: '/firewall' },
          { name: 'Reports', icon: FileSpreadsheet, path: '/reports' },
          { name: 'Settings', icon: Settings, path: '/settings' },
          { name: 'Profile', icon: User, path: '/profile' }
        ];
      case 'Faculty':
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
          { name: 'Students', icon: Users, path: '/students' },
          { name: 'Attendance', icon: Calendar, path: '/attendance' },
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
    // If mobile viewport (width < 1024), toggle mobile drawer. Else toggle desktop collapse.
    if (window.innerWidth < 1024) {
      setIsMobileDrawerOpen(!isMobileDrawerOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const SidebarContent = ({ isMobile = false }) => {
    return (
      <div className="h-full flex flex-col justify-between select-none">
        <div className="space-y-7">
          {/* Logo container */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 shrink-0">
                <Shield className="w-4.5 h-4.5" />
              </div>
              {(!isSidebarCollapsed || isMobile) && (
                <div className="text-left animate-in fade-in duration-200">
                  <p className="text-xs font-bold text-brand-text leading-none">Console Manager</p>
                  <p className="text-[9px] text-brand-secondary mt-1 font-mono uppercase tracking-widest">NOC GATE</p>
                </div>
              )}
            </div>
            {isMobile && (
              <button 
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-[#94a3b8] hover:text-[#f8fafc]"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {sidebarItems.map((item, idx) => {
              // Exact or starting route match
              const isActive = location.pathname === item.path || 
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (isMobile) setIsMobileDrawerOpen(false);
                    navigate(item.path);
                  }}
                  title={isSidebarCollapsed && !isMobile ? item.name : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive 
                      ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' 
                      : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#334155]/20 border border-transparent'
                  } ${isSidebarCollapsed && !isMobile ? 'justify-center' : 'justify-start'}`}
                >
                  <item.icon className="w-4.5 h-4.5 shrink-0" />
                  {(!isSidebarCollapsed || isMobile) && (
                    <span className="animate-in fade-in duration-150">{item.name}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Terminate Session */}
        <button
          onClick={handleLogout}
          title={isSidebarCollapsed && !isMobile ? "Terminate Session" : undefined}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-brand-danger/30 hover:bg-red-500/5 text-brand-danger font-bold text-xs rounded-xl transition-all ${
            isSidebarCollapsed && !isMobile ? 'px-0' : 'px-4'
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {(!isSidebarCollapsed || isMobile) && <span className="animate-in fade-in duration-150">Terminate Session</span>}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#0f172a] text-[#f8fafc] transition-colors duration-500 font-sans">
      
      {/* Permanent Desktop Sidebar */}
      <aside 
        className={`bg-[#1e293b] border-r border-[#334155]/60 flex flex-col p-6 shrink-0 relative transition-all duration-300 hidden lg:block ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent />
        
        {/* Collapse Button Arrow */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3.5 top-18 w-7 h-7 rounded-full bg-[#1e293b] border border-[#334155] text-[#94a3b8] hover:text-[#f8fafc] flex items-center justify-center shadow-md shadow-slate-950/20 z-50 focus:outline-none"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* Mobile Drawer (Slide-over overlay) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-50 lg:hidden animate-in fade-in duration-200">
          <div className="fixed inset-y-0 left-0 w-64 bg-[#1e293b] border-r border-[#334155]/60 p-6 animate-in slide-in-from-left duration-300">
            <SidebarContent isMobile={true} />
          </div>
        </div>
      )}

      {/* Main Panel */}
      <div className="flex-grow flex flex-col min-w-0">
        <TopBar onToggleSidebar={toggleSidebar} />

        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
