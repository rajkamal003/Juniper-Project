// frontend/src/pages/ParentDashboardPage.jsx
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
  Video, 
  MessageSquare, 
  Cpu, 
  ShieldAlert,
  ListCollapse,
  RefreshCw,
  Search,
  Mail,
  BookOpen
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { AppUsageGrid } from '../components/dashboard/AppUsageGrid';
import { generateAppUsage } from '../utils/appDataGenerator';
import { RefreshButton } from '../components/ui/RefreshButton';

export const ParentDashboardPage = () => {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [telemetry, setTelemetry] = useState(null);
  const [appUsage, setAppUsage] = useState([]);

  useEffect(() => {
    document.title = "SecureCampus AI | Parent Network Dashboard";
  }, []);

  useEffect(() => {
    // Generate seeded random data using a seed based on the user's name or ID + date
    const userIdSeed = user?.id || 101;
    const generateSeededValue = (min, max, step = 1) => {
      const x = Math.sin(userIdSeed + Math.random()) * 10000;
      const rand = x - Math.floor(x);
      const val = min + rand * (max - min);
      return Math.round(val / step) * step;
    };

    const sessionHrs = generateSeededValue(1, 4);
    const sessionMins = generateSeededValue(10, 59);
    const todayGb = (generateSeededValue(1, 5, 0.1)).toFixed(1);
    const monthlyGb = (generateSeededValue(30, 95, 0.1)).toFixed(1);
    const speed = generateSeededValue(10, 45);
    const signalDbm = generateSeededValue(50, 75);

    setTelemetry({
      ssid: "SecureCampus-WiFi-6",
      ap: `AP${generateSeededValue(10, 45)}-Block-${String.fromCharCode(65 + generateSeededValue(0, 3))}`,
      signalStrength: `-${signalDbm} dBm (Excellent)`,
      ipAddress: `10.152.12.${generateSeededValue(10, 254)}`,
      macAddress: `3C:58:12:F1:A2:${generateSeededValue(10, 99)}`,
      connectionSpeed: `${generateSeededValue(400, 900)} Mbps`,
      currentDevice: generateSeededValue(0, 1) === 0 ? "MacBook Pro 16" : "iPhone 15 Pro",
      sessionTime: `${sessionHrs}h ${sessionMins}m`,
      todayUsage: `${todayGb} GB`,
      monthlyUsage: `${monthlyGb} GB`,
      status: "Online / Secure",
      bandwidthUsed: `${speed} Mbps`,
      peakTime: "02:00 PM - 04:00 PM",
      dataDownload: `${(monthlyGb * 0.9).toFixed(1)} GB`,
      dataUpload: `${(monthlyGb * 0.1).toFixed(1)} GB`
    });

    setAppUsage(generateAppUsage('Parent'));
  }, [user, isRefreshing]);
  const handleRefresh = () => {
    setIsRefreshing(true);
    setAppUsage(generateAppUsage('Parent'));
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  if (!telemetry) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
        <p className="text-xs text-brand-secondary">Loading dynamic WiFi analytics telemetry...</p>
      </div>
    );
  }

  const recentSessions = [
    { login: "2026-07-23 13:34:01", logout: "Active Session", duration: telemetry.sessionTime, location: "NOC Lab Subnet" },
    { login: "2026-07-22 09:15:22", logout: "2026-07-22 17:30:10", duration: "8h 14m", location: "Main Library AP" },
    { login: "2026-07-21 11:02:15", logout: "2026-07-21 14:15:00", duration: "3h 12m", location: "Seminar Block" },
    { login: "2026-07-20 08:30:00", logout: "2026-07-20 12:45:11", duration: "4h 15m", location: "Academic Block A" }
  ];

  return (
    <div className="space-y-6 text-left select-none font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#334155]/20 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-brand-text tracking-tight">Parent WiFi Security Dashboard</h1>
          <p className="text-xs text-brand-secondary mt-1">AI-Powered Smart Campus Network Analytics telemetry</p>
        </div>
        <RefreshButton
          isRefreshing={isRefreshing}
          setIsRefreshing={setIsRefreshing}
          onRefresh={handleRefresh}
          pageName="Parent Dashboard"
        />
      </div>

      <div className={`space-y-6 transition-opacity duration-300 ${isRefreshing ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        {/* Row 1: KPI Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Connected WiFi */}
        <Card className="p-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Connected WiFi</p>
              <h3 className="text-sm font-extrabold text-brand-text mt-1">{telemetry.ssid}</h3>
            </div>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Wifi className="w-5 h-5 animate-pulse" />
            </div>
          </div>
        </Card>

        {/* Current Device */}
        <Card className="p-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Current Device</p>
              <h3 className="text-sm font-extrabold text-brand-text mt-1">{telemetry.currentDevice}</h3>
            </div>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Laptop className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Current Session Time */}
        <Card className="p-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Current Session Time</p>
              <h3 className="text-sm font-extrabold text-brand-text mt-1">{telemetry.sessionTime}</h3>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Bandwidth & Usage */}
        <Card className="p-4 relative overflow-hidden">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Monthly Usage */}
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Monthly Usage</p>
            <h4 className="text-base font-extrabold text-brand-text mt-0.5">{telemetry.monthlyUsage}</h4>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
            Safe Profile
          </span>
        </Card>

        {/* Network Status */}
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Network Status</p>
            <h4 className="text-base font-extrabold text-emerald-400 mt-0.5">{telemetry.status}</h4>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        </Card>

        {/* Bandwidth Used */}
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Bandwidth Speed</p>
            <h4 className="text-base font-extrabold text-brand-text mt-0.5">{telemetry.bandwidthUsed}</h4>
          </div>
          <Activity className="w-5 h-5 text-brand-primary" />
        </Card>
      </div>

      {/* Grid: Analytics vs Network Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Analytics Box */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Usage Analytics Grid */}
          <Card className="p-6">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-text mb-4">Data Usage Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-[#334155]/20 pb-4 mb-4">
              <div>
                <p className="text-[10px] font-bold text-brand-secondary uppercase">Download Total</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <ArrowDown className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-extrabold text-brand-text">{telemetry.dataDownload}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-brand-secondary uppercase">Upload Total</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <ArrowUp className="w-4 h-4 text-brand-primary" />
                  <span className="text-sm font-extrabold text-brand-text">{telemetry.dataUpload}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-brand-secondary uppercase">Peak Activity Window</p>
                <div className="text-xs font-bold text-brand-text mt-1.5">{telemetry.peakTime}</div>
              </div>
            </div>

             {/* Custom Interactive Mock Data Charts */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-500">Daily WiFi Session Target</span>
                  <span className="text-slate-800 font-bold">{telemetry.todayUsage} / 6.0 GB</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-primary rounded-full" style={{ width: `${Math.min(100, (parseFloat(telemetry.todayUsage) / 6.0) * 100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-500">Monthly Data Bandwidth Cap</span>
                  <span className="text-slate-800 font-bold">{telemetry.monthlyUsage} / 150.0 GB</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (parseFloat(telemetry.monthlyUsage) / 150.0) * 100)}%` }} />
                </div>
              </div>
            </div>
          </Card>

          {/* Application Usage */}
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
              Network Access Configuration
            </h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-brand-secondary">SSID Profile</span>
                <span className="font-semibold text-brand-text">{telemetry.ssid}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-secondary">Connected Access Point</span>
                <span className="font-mono font-semibold text-brand-text">{telemetry.ap}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-secondary">Signal Strength</span>
                <span className="font-semibold text-brand-text">{telemetry.signalStrength}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-secondary">Client IP Address</span>
                <span className="font-mono font-semibold text-brand-text">{telemetry.ipAddress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-secondary">Hardware MAC Address</span>
                <span className="font-mono font-semibold text-brand-text">{telemetry.macAddress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-secondary">Negotiated Connection Link</span>
                <span className="font-semibold text-brand-text">{telemetry.connectionSpeed}</span>
              </div>
            </div>
          </Card>

          {/* Security Banner Card */}
          <Card className="p-5 bg-emerald-500/5 border-emerald-500/20 text-emerald-400">
            <h4 className="font-bold text-xs flex items-center gap-1.5 uppercase tracking-wider">
              🟢 Network Shield Active
            </h4>
            <p className="text-[10px] text-brand-secondary mt-2 leading-relaxed">
              Automated gateway rules are actively monitoring anomalous connections. Unsafe subnets and blacklisted domains are automatically locked out from the child's profile session.
            </p>
          </Card>
        </div>

      </div>       {/* Row 4: Recent Sessions Logs */}
      <Card className="p-6">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-4">Recent Connection Sessions Logs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="pb-3 px-3">Session Start</th>
                <th className="pb-3 px-3">Session End</th>
                <th className="pb-3 px-3">Duration</th>
                <th className="pb-3 px-3 text-right">AP Location Subnet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentSessions.map((sess, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-800">{sess.login}</td>
                  <td className="py-3 px-3 font-semibold">
                    {sess.logout === 'Active Session' ? (
                      <span className="text-emerald-600 animate-pulse font-bold">Active Session</span>
                    ) : (
                      <span className="text-slate-500">{sess.logout}</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500">{sess.duration}</td>
                  <td className="py-3 px-3 text-right text-slate-500">{sess.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      </div>
    </div>
  );
};

export default ParentDashboardPage;
