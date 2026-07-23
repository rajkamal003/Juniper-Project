// frontend/src/pages/FacultyDashboardPage.jsx
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
  Cpu, 
  ShieldAlert,
  RefreshCw,
  Search,
  CheckCircle,
  FileText,
  Key,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { AppUsageGrid } from '../components/dashboard/AppUsageGrid';
import { generateAppUsage } from '../utils/appDataGenerator';

export const FacultyDashboardPage = () => {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [telemetry, setTelemetry] = useState(null);
  const [appUsage, setAppUsage] = useState([]);

  useEffect(() => {
    document.title = "SecureCampus AI | Faculty Network Console";
  }, []);

  useEffect(() => {
    // Generate seeded random data using a seed based on the user's name or ID + date
    const userIdSeed = user?.id || 202;
    const generateSeededValue = (min, max, step = 1) => {
      const x = Math.sin(userIdSeed + Math.random()) * 10000;
      const rand = x - Math.floor(x);
      const val = min + rand * (max - min);
      return Math.round(val / step) * step;
    };

    const speed = generateSeededValue(20, 85);
    const researchTraffic = (generateSeededValue(10, 45, 0.1)).toFixed(1);
    const deptDevices = generateSeededValue(4, 15);
    const connDevices = generateSeededValue(1, 4);
    const threatCount = generateSeededValue(0, 3);
    const securityVal = generateSeededValue(90, 99);

    setTelemetry({
      ssid: "SecureCampus-Faculty-WPA3",
      ap: `AP18-Faculty-Block-${String.fromCharCode(65 + generateSeededValue(0, 2))}`,
      signalStrength: "-52 dBm (Excellent)",
      ipAddress: `10.152.48.${generateSeededValue(10, 254)}`,
      macAddress: `00:1A:2B:3C:4D:${generateSeededValue(10, 99)}`,
      connectionSpeed: "1.2 Gbps",
      currentDevice: "Lenovo ThinkPad P16",
      sessionTime: `${generateSeededValue(3, 8)}h ${generateSeededValue(10, 59)}m`,
      researchUsage: `${researchTraffic} GB`,
      securityScore: `${securityVal}/100`,
      status: "Secured Subnet Mode",
      bandwidthUsed: `${speed} Mbps`,
      peakTime: "11:00 AM - 01:00 PM",
      deptDevicesCount: deptDevices,
      connectedDevicesCount: connDevices,
      vpnStatus: "Tunnel Active (IPSec)",
      mfaStatus: "Verified / Hardware Token",
      firewallAlerts: threatCount
    });

    setAppUsage(generateAppUsage('Faculty'));

  }, [user, isRefreshing]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setAppUsage(generateAppUsage('Faculty'));
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  if (!telemetry) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
        <p className="text-xs text-brand-secondary">Loading dynamic Faculty analytics telemetry...</p>
      </div>
    );
  }

  const recentSessions = [
    { login: "2026-07-23 09:12:15", logout: "Active Session", duration: telemetry.sessionTime, location: "AP18-Faculty-Block" },
    { login: "2026-07-22 08:30:10", logout: "2026-07-22 18:45:00", duration: "10h 15m", location: "AP12-NOC-Lab" }
  ];

  return (
    <div className="space-y-6 text-left select-none font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#334155]/20 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-brand-text tracking-tight">Faculty Console</h1>
          <p className="text-xs text-brand-secondary mt-1">Mist AI-Powered Smart Campus Academic Oversight & Security Console</p>
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
        {/* Research Usage */}
        <Card className="p-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Research Traffic</p>
              <h3 className="text-sm font-extrabold text-brand-text mt-1">{telemetry.researchUsage}</h3>
            </div>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Globe className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Security Score */}
        <Card className="p-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Security Score</p>
              <h3 className="text-sm font-extrabold text-brand-text mt-1">{telemetry.securityScore}</h3>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* VPN Status */}
        <Card className="p-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">VPN Status</p>
              <h3 className="text-sm font-extrabold text-brand-text mt-1">{telemetry.vpnStatus}</h3>
            </div>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* MFA Status */}
        <Card className="p-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">MFA Status</p>
              <h3 className="text-sm font-extrabold text-brand-text mt-1">{telemetry.mfaStatus}</h3>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Key className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: Secondary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Connected AP */}
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Current Access Point</p>
            <h4 className="text-sm font-extrabold text-brand-text mt-0.5">{telemetry.ap}</h4>
          </div>
          <span className="text-[10px] font-bold text-emerald-400">Excellent</span>
        </Card>

        {/* Bandwidth Used */}
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Current Bandwidth</p>
            <h4 className="text-sm font-extrabold text-brand-text mt-0.5">{telemetry.bandwidthUsed}</h4>
          </div>
          <Activity className="w-5 h-5 text-brand-primary" />
        </Card>

        {/* Dept Devices */}
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Department Devices</p>
            <h4 className="text-sm font-extrabold text-brand-text mt-0.5">{telemetry.deptDevicesCount} Online</h4>
          </div>
          <Smartphone className="w-5 h-5 text-purple-400" />
        </Card>

        {/* Connected Client Devices */}
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">My Connected Devices</p>
            <h4 className="text-sm font-extrabold text-brand-text mt-0.5">{telemetry.connectedDevicesCount} Active</h4>
          </div>
          <Laptop className="w-5 h-5 text-brand-primary" />
        </Card>
      </div>

      {/* Grid: Analytics vs Network Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Analytics Box */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Usage Analytics Grid */}
          <Card className="p-6">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-text mb-4">Traffic Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-[#334155]/20 pb-4 mb-4">
              <div>
                <p className="text-[10px] font-bold text-brand-secondary uppercase">VPN Tunnel Speed</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <ArrowDown className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-extrabold text-brand-text">{telemetry.connectionSpeed}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-brand-secondary uppercase">Firewall Alerts Today</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-extrabold text-red-500">{telemetry.firewallAlerts} Blocks</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-brand-secondary uppercase">Session Duration</p>
                <div className="text-xs font-bold text-brand-text mt-1.5">{telemetry.sessionTime}</div>
              </div>
            </div>

            {/* Custom Interactive Mock Data Charts */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-brand-secondary">Daily Academic Data Quota</span>
                  <span className="text-brand-text font-bold">12.2 GB / 25.0 GB (48%)</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-primary rounded-full" style={{ width: '48%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-brand-secondary">Monthly Research Grant Bandwidth</span>
                  <span className="text-brand-text font-bold">{telemetry.researchUsage} / 100.0 GB</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (parseFloat(telemetry.researchUsage) / 100.0) * 100)}%` }} />
                </div>
              </div>
            </div>
          </Card>

          {/* Application Usage */}
          <Card className="p-6">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-text mb-4">Academic & Research Platform Usage</h3>
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
              🟢 Faculty Shield Active
            </h4>
            <p className="text-[10px] text-brand-secondary mt-2 leading-relaxed">
              Automated gateway rules are actively monitoring academic subnets. Tunnel encryption is enforced. Firewall status is optimal.
            </p>
          </Card>
        </div>

      </div>

      {/* Row 4: Recent Sessions Logs */}
      <Card className="p-6">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-text mb-4">Recent Connection Sessions Logs</h3>
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

export default FacultyDashboardPage;
