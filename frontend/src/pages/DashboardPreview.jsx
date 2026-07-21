// frontend/src/pages/DashboardPreview.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Monitor, Globe, Clock, UserCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useSessionTimeout } from '../hooks/useSessionTimeout';

export const DashboardPreview = () => {
  const { user, sessionMetadata, logout } = useAuth();
  const navigate = useNavigate();
  
  // Track inactivity timeout
  useSessionTimeout();

  const [sessionSeconds, setSessionSeconds] = useState(0);

  useEffect(() => {
    document.title = "SecureCampus AI | Dashboard Preview";
    
    const interval = setInterval(() => {
      setSessionSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (sec) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Success Gate */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl border border-brand-primary/20 bg-gradient-to-r from-blue-500/10 via-cyan-500/5 to-transparent flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs text-brand-success font-semibold tracking-wider select-none">
            <CheckCircle2 className="w-4 h-4" />
            <span>Authentication Successful</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Access Granted • Dashboard Preview</h2>
          <p className="text-xs text-brand-secondary max-w-xl">
            Active security clearance: <span className="font-mono bg-slate-800 text-brand-text px-1.5 py-0.5 rounded text-[11px] font-bold">ROLE_{user?.role?.role_name?.toUpperCase() || 'OPERATOR'}</span>. Live firewall rules are active for this terminal connection.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 select-none">
          <Button onClick={handleLogout} variant="secondary" className="h-10 text-xs">
            Disconnect Session
          </Button>
        </div>
      </motion.div>

      {/* Telemetry Auditing Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="p-4 rounded-xl border border-[#334155]/60 bg-[#1e293b]/40 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-brand-primary flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Identified User</p>
            <p className="text-xs font-bold text-brand-text truncate">{user?.fullname}</p>
            <p className="text-[10px] text-brand-secondary truncate">{user?.email}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#334155]/60 bg-[#1e293b]/40 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <Monitor className="w-5 h-5" />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Source Device</p>
            <p className="text-xs font-bold text-brand-text truncate">{sessionMetadata?.browser || 'Web Client'}</p>
            <p className="text-[10px] text-brand-secondary truncate">{sessionMetadata?.operating_system || 'Terminal'}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#334155]/60 bg-[#1e293b]/40 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-brand-success flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Network Origin</p>
            <p className="text-xs font-bold text-brand-text truncate">{sessionMetadata?.ip_address || '127.0.0.1'}</p>
            <p className="text-[10px] text-brand-secondary truncate">MAC: 00:0A:95:9D:68:16</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#334155]/60 bg-[#1e293b]/40 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Session Duration</p>
            <p className="text-xs font-mono font-bold text-brand-text truncate">{formatDuration(sessionSeconds)}</p>
            <p className="text-[10px] text-brand-secondary truncate">Expires: 15 Mins Inactivity</p>
          </div>
        </div>

      </div>

      {/* Locked Preview Layer (Meraki/Mist Style with Blur Overlay) */}
      <div className="relative rounded-2xl border border-[#334155] overflow-hidden bg-slate-950/40 p-8 select-none min-h-[300px] flex flex-col justify-center items-center">
        
        {/* Mock Lock Message */}
        <div className="flex flex-col items-center justify-center text-center p-6 select-none max-w-md animate-pulse-slow">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-brand-primary flex items-center justify-center mb-4 border border-blue-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-brand-text mb-1.5 uppercase tracking-wider">
            Enterprise Console Mock
          </h3>
          <p className="text-xs text-brand-secondary">
            Authentication successfully verified. Custom dashboard elements, charts, active firewall policies, and live analytics will be fully implemented in Stage 3.
          </p>
        </div>

      </div>
    </div>
  );
};

export default DashboardPreview;
