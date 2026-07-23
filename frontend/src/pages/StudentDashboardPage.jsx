// frontend/src/pages/StudentDashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wifi, 
  Laptop, 
  Clock, 
  HardDrive, 
  Activity, 
  ArrowUp, 
  ArrowDown, 
  Globe, 
  Cpu, 
  ShieldAlert,
  RefreshCw,
  Search,
  MessageSquare,
  Video,
  ListCollapse,
  Terminal,
  ShieldCheck
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { AppUsageGrid } from '../components/dashboard/AppUsageGrid';
import { generateAppUsage } from '../utils/appDataGenerator';

export const StudentDashboardPage = () => {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [appUsage, setAppUsage] = useState([]);

  useEffect(() => {
    document.title = "SecureCampus AI | Student WiFi Security Dashboard";
    setAppUsage(generateAppUsage('Student'));
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setAppUsage(generateAppUsage('Student'));
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Student specific Mist AI network metrics
  const telemetry = {
    ssid: "SecureCampus-WiFi-6",
    ap: "AP32 – Block A, Floor 2",
    signalStrength: "-58 dBm (Excellent)",
    ipAddress: "10.152.142.102",
    macAddress: "7A:B4:9C:2D:E1:5B",
    connectionSpeed: "780 Mbps",
    currentDevice: "Dell XPS 15",
    sessionTime: "1h 42m",
    todayUsage: "1.8 GB",
    monthlyUsage: "38.4 GB",
    status: "Secure Connection Active",
    bandwidthUsed: "18.5 Mbps",
    peakTime: "10:00 AM - 12:00 PM",
    dataDownload: "34.2 GB",
    dataUpload: "4.2 GB",
    blockedAttempts: 2,
    securityStatus: "Fully Protected"
  };

  const recentSessions = [
    { login: "2026-07-23 14:49:10", logout: "Active Session", duration: "1h 42m", location: "AP32 – Block A, Floor 2" },
    { login: "2026-07-22 08:30:15", logout: "2026-07-22 17:15:30", duration: "8h 45m", location: "AP12 – Main Library" },
    { login: "2026-07-21 09:00:00", logout: "2026-07-21 16:30:12", duration: "7h 30m", location: "AP04 – Central Cafeteria" }
  ];

  return (
    <div className="space-y-6 text-left select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#334155]/20 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-brand-text tracking-tight">Student WiFi Security Dashboard</h1>
          <p className="text-xs text-brand-secondary mt-1">Smart Campus Portal • Mist AI Telemetry Feed</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#334155] bg-slate-900/50 hover:bg-slate-800 text-brand-secondary hover:text-brand-text transition-colors text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Row 1: KPI Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Connected WiFi */}
        <Card className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Current WiFi</p>
              <h3 className="text-sm font-extrabold text-brand-text mt-1">{telemetry.ssid}</h3>
            </div>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Wifi className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Current Device */}
        <Card className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Connected Device</p>
              <h3 className="text-sm font-extrabold text-brand-text mt-1">{telemetry.currentDevice}</h3>
            </div>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Laptop className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Current Session Time */}
        <Card className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Current Session</p>
              <h3 className="text-sm font-extrabold text-brand-text mt-1">{telemetry.sessionTime}</h3>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Today's Usage */}
        <Card className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Today's Usage</p>
              <h3 className="text-sm font-extrabold text-brand-text mt-1">{telemetry.todayUsage}</h3>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: Secondary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Monthly Usage */}
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Monthly Usage</p>
            <h4 className="text-sm font-extrabold text-brand-text mt-0.5">{telemetry.monthlyUsage}</h4>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-400">Stable Profile</span>
        </Card>

        {/* Bandwidth Speed */}
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Negotiated Bandwidth</p>
            <h4 className="text-sm font-extrabold text-brand-text mt-0.5">{telemetry.bandwidthUsed}</h4>
          </div>
          <Activity className="w-5 h-5 text-brand-primary" />
        </Card>

        {/* Access Point */}
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Access Point</p>
            <h4 className="text-sm font-extrabold text-brand-text mt-0.5 truncate max-w-[150px]" title={telemetry.ap}>{telemetry.ap}</h4>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">AP32</span>
        </Card>

        {/* Blocked attempts */}
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Blocked Attempts</p>
            <h4 className="text-sm font-extrabold text-red-500 mt-0.5">{telemetry.blockedAttempts}</h4>
          </div>
          <ShieldAlert className="w-5 h-5 text-red-500" />
        </Card>
      </div>

      {/* Grid: Analytics vs Network Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Analytics Box */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Usage Analytics Grid */}
          <Card className="p-6">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-text mb-4">Traffic Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-[#334155]/20 pb-4 mb-4 text-xs">
              <div>
                <p className="text-[10px] font-bold text-brand-secondary uppercase">Download Total</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <ArrowDown className="w-4 h-4 text-emerald-400" />
                  <span className="font-extrabold text-brand-text">{telemetry.dataDownload}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-brand-secondary uppercase">Upload Total</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <ArrowUp className="w-4 h-4 text-brand-primary" />
                  <span className="font-extrabold text-brand-text">{telemetry.dataUpload}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-brand-secondary uppercase">Security Status</p>
                <div className="flex items-center gap-1.5 mt-1 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{telemetry.securityStatus}</span>
                </div>
              </div>
            </div>

            {/* Custom Interactive Mock Data Charts */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-brand-secondary">Weekly WiFi Data Budget</span>
                  <span className="text-brand-text font-bold">12.5 GB / 20.0 GB (62%)</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-primary rounded-full" style={{ width: '62%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-brand-secondary">Monthly Data Bandwidth Cap</span>
                  <span className="text-brand-text font-bold">38.4 GB / 80.0 GB (48%)</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '48%' }} />
                </div>
              </div>
            </div>
          </Card>

          {/* Application & Web Subnet Consumption */}
          <Card className="p-6">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-text mb-4">Application & Web Subnet Consumption</h3>
            <AppUsageGrid apps={appUsage} />
          </Card>

        </div>

        {/* Right Side: Network Info */}
        <div className="space-y-6">
          {/* Detailed Network Settings */}
          <Card className="p-6">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-text mb-4 border-b border-[#334155]/20 pb-3">
              Network Settings
            </h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-brand-secondary">Signal Strength</span>
                <span className="font-semibold text-brand-text">{telemetry.signalStrength}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-secondary">Current Access Point</span>
                <span className="font-semibold text-brand-text truncate max-w-[150px]">{telemetry.ap}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-secondary">IP Address</span>
                <span className="font-mono font-semibold text-brand-text">{telemetry.ipAddress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-secondary">MAC Address</span>
                <span className="font-mono font-semibold text-brand-text">{telemetry.macAddress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-secondary">Connection Link</span>
                <span className="font-semibold text-brand-text">{telemetry.connectionSpeed}</span>
              </div>
            </div>
          </Card>

          {/* Security Banner Card */}
          <Card className="p-5 bg-blue-500/5 border-blue-500/20 text-blue-400">
            <h4 className="font-bold text-xs flex items-center gap-1.5 uppercase tracking-wider">
              🛡️ Student Network Profile
            </h4>
            <p className="text-[10px] text-brand-secondary mt-2 leading-relaxed">
              Student WiFi sessions are regulated through SecureCampus AI firewalls. Access is permitted across education resources. Attempting to bypass restricted domains will generate automatic security flags.
            </p>
          </Card>
        </div>

      </div>

      {/* Row 4: Recent Sessions Logs */}
      <Card className="p-6">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-text mb-4">Connection History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#334155]/20 text-brand-secondary uppercase font-semibold">
                <th className="pb-3 px-3">Session Start</th>
                <th className="pb-3 px-3">Session End</th>
                <th className="pb-3 px-3">Duration</th>
                <th className="pb-3 px-3 text-right">AP Location Subnet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/10">
              {recentSessions.map((sess, idx) => (
                <tr key={idx} className="hover:bg-slate-900/30 transition-colors">
                  <td className="py-3 px-3 font-semibold text-brand-text">{sess.login}</td>
                  <td className="py-3 px-3 font-semibold">
                    {sess.logout === 'Active Session' ? (
                      <span className="text-emerald-400 animate-pulse">Active Session</span>
                    ) : (
                      <span className="text-brand-secondary">{sess.logout}</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-brand-secondary">{sess.duration}</td>
                  <td className="py-3 px-3 text-right text-brand-secondary">{sess.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};

export default StudentDashboardPage;
