// frontend/src/pages/AdminDashboardPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserCheck, Activity, RefreshCw, Server, Wifi, Shield, 
  Search, AlertTriangle, Globe, WifiOff, Cpu, Database, Laptop, Radio, Download
} from 'lucide-react';
import { toast } from 'sonner';
import { StatCard, DashboardCard, QuickActionCard } from '../components/dashboard/DashboardComponents';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import api from '../services/api';
import { RefreshButton } from '../components/ui/RefreshButton';

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [juniperDevices, setJuniperDevices] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    // Regenerate simulated stats
    setStats({
      totalUsers: '248',
      activeSessions: String(Math.floor(Math.random() * 30) + 130),
      totalTraffic: `${(Math.random() * 0.8 + 1.2).toFixed(2)} TB`,
      mitigatedThreats: Math.floor(Math.random() * 400 + 2100).toLocaleString()
    });
    setChartData(Array.from({ length: 10 }, () => Math.floor(Math.random() * 50) + 30));
    setAlertIndex(Math.floor(Math.random() * 5));
    // Fetch latest hardware from API
    await fetchDashboardData();
  };
  
  // Simulation Mode state
  const [isSimulated, setIsSimulated] = useState(() => localStorage.getItem('simulation_mode') !== 'false');
  
  // Real-time fluctuating counts with randomized starting values on refresh
  const [stats, setStats] = useState(() => ({
    totalUsers: '248',
    activeSessions: String(Math.floor(Math.random() * 30) + 130),
    totalTraffic: `${(Math.random() * 0.8 + 1.2).toFixed(2)} TB`,
    mitigatedThreats: Math.floor(Math.random() * 400 + 2100).toLocaleString()
  }));

  // Live Chart state initialized with random values on refresh
  const [chartData, setChartData] = useState(() => 
    Array.from({ length: 10 }, () => Math.floor(Math.random() * 50) + 30)
  );

  // Live Alerts rotation state
  const [alertIndex, setAlertIndex] = useState(() => Math.floor(Math.random() * 5));
  const liveAlerts = [
    { time: 'Just Now', severity: 'critical', desc: 'Intrusion attempt blocked by SRX300 (Source: 192.168.1.189)' },
    { time: '2 mins ago', severity: 'warning', desc: 'High bandwidth consumption on AP-MainHall-02 (User: Student)' },
    { time: '5 mins ago', severity: 'info', desc: 'Operator session authenticated successfully: Operator-03' },
    { time: '8 mins ago', severity: 'critical', desc: 'Blocked access attempt to forbidden domain: instagram.com' },
    { time: '12 mins ago', severity: 'warning', desc: 'Mismatched MAC Address signature detected on EX2300-C Port 4' }
  ];

  // Table Search and Data States
  const [webSearch, setWebSearch] = useState('');
  const [sessionSearch, setSessionSearch] = useState('');
  const [selectedSessionIdx, setSelectedSessionIdx] = useState(null);
  const [selectedWebIdx, setSelectedWebIdx] = useState(null);

  // Initial dummy websites data
  const initialWebsites = [
    { url: 'https://github.com', role: 'Faculty', bandwidth: '450 MB', status: 'Allowed', score: 1, action: 'Allowed', time: '17:42:15', closed: '17:55:00', duration: '12m 45s', refreshes: 4, download: '410 MB', upload: '40 MB', reason: 'Academic Repository' },
    { url: 'https://instagram.com', role: 'Student', bandwidth: '1.2 GB', status: 'Blocked', score: 9, action: 'Blocked', time: '17:35:10', closed: '17:35:12', duration: '2s', refreshes: 0, download: '0 MB', upload: '0 MB', reason: 'Forbidden Entertainment Domain Policy' },
    { url: 'https://stackoverflow.com', role: 'Student', bandwidth: '320 MB', status: 'Allowed', score: 2, action: 'Allowed', time: '17:20:18', closed: '17:45:30', duration: '25m 12s', refreshes: 9, download: '290 MB', upload: '30 MB', reason: 'Educational Development' },
    { url: 'https://kluniversity.in', role: 'Parent', bandwidth: '80 MB', status: 'Allowed', score: 1, action: 'Allowed', time: '17:10:05', closed: '17:18:22', duration: '8m 17s', refreshes: 3, download: '72 MB', upload: '8 MB', reason: 'University Portal' },
    { url: 'https://malicious-domain.xyz', role: 'Guest', bandwidth: '4 MB', status: 'Blocked', score: 10, action: 'Blocked', time: '17:48:00', closed: '17:48:01', duration: '1s', refreshes: 0, download: '0 MB', upload: '0 MB', reason: 'Heuristic Threat Intelligence Match' },
    { url: 'https://wikipedia.org', role: 'Student', bandwidth: '150 MB', status: 'Allowed', score: 1, action: 'Allowed', time: '17:05:00', closed: '17:28:40', duration: '23m 40s', refreshes: 2, download: '142 MB', upload: '8 MB', reason: 'Academic Reference' },
    { url: 'https://zoom.us', role: 'Faculty', bandwidth: '2.4 GB', status: 'Allowed', score: 3, action: 'Allowed', time: '16:00:15', closed: '16:45:00', duration: '44m 45s', refreshes: 1, download: '2.1 GB', upload: '300 MB', reason: 'Remote Instruction Class Session' },
    { url: 'https://youtube.com', role: 'Student', bandwidth: '1.8 GB', status: 'Allowed', score: 4, action: 'Allowed', time: '16:15:00', closed: '16:45:00', duration: '30m 00s', refreshes: 5, download: '1.7 GB', upload: '100 MB', reason: 'Academic Tutorials' },
    { url: 'https://chat.openai.com', role: 'Student', bandwidth: '95 MB', status: 'Allowed', score: 2, action: 'Allowed', time: '16:50:00', closed: '17:10:00', duration: '20m 00s', refreshes: 8, download: '80 MB', upload: '15 MB', reason: 'AI Code Assistant' },
    { url: 'https://whatsapp-web.com', role: 'Student', bandwidth: '580 MB', status: 'Allowed', score: 3, action: 'Allowed', time: '15:30:00', closed: '17:00:00', duration: '1h 30m', refreshes: 14, download: '490 MB', upload: '90 MB', reason: 'Communication' }
  ];

  // Initial user sessions data
  const initialSessions = [
    { 
      username: 'L. Pranav (2300090273)', 
      role: 'Student', 
      loginTime: '17:15', 
      duration: '28 mins', 
      device: 'Pranav-iPhone', 
      ip: '192.168.1.102', 
      mac: '00:1A:2B:3C:4D:5E', 
      ap: 'AP-MainHall-01', 
      data: '480 MB', 
      status: 'Online',
      os: 'iOS 16.4',
      browser: 'Safari Mobile',
      ssid: 'SecureCampus-Student-WPA3',
      download: '420 MB',
      upload: '60 MB',
      app: 'WhatsApp Web',
      timeSpent: '28m',
      refreshes: 6,
      blockedCount: 2,
      allowedCount: 14,
      securityScore: 88,
      whatsapp: { messagesSent: 42, messagesReceived: 68, calls: 2, voiceCalls: 1, fileUploads: 3, imagesShared: 5, videosShared: 1, bandwidth: '110 MB' }
    },
    { 
      username: 'Dr. Prasad (2158)', 
      role: 'Faculty', 
      loginTime: '16:02', 
      duration: '1h 41m', 
      device: 'Prasad-ThinkPad', 
      ip: '192.168.1.44', 
      mac: 'BC:A9:C0:11:22:33', 
      ap: 'AP-AdminBlock-02', 
      data: '1.8 GB', 
      status: 'Online',
      os: 'Windows 11 Enterprise',
      browser: 'Google Chrome',
      ssid: 'SecureCampus-Faculty-WPA3',
      download: '1.6 GB',
      upload: '200 MB',
      app: 'Google Classroom',
      timeSpent: '1h 22m',
      refreshes: 19,
      blockedCount: 0,
      allowedCount: 45,
      securityScore: 98,
      whatsapp: { messagesSent: 12, messagesReceived: 24, calls: 0, voiceCalls: 0, fileUploads: 1, imagesShared: 2, videosShared: 0, bandwidth: '24 MB' }
    },
    { 
      username: 'Srinivasa Rao (Parent - 2300090273)', 
      role: 'Parent Visitor', 
      loginTime: '16:45', 
      duration: '58 mins', 
      device: 'Srinivasa-Galaxy', 
      ip: '192.168.1.115', 
      mac: '70:F3:95:44:55:66', 
      ap: 'AP-Library-01', 
      data: '120 MB', 
      status: 'Online',
      os: 'Android 13',
      browser: 'Samsung Internet',
      ssid: 'SecureCampus-Guest-Portal',
      download: '105 MB',
      upload: '15 MB',
      app: 'KL ERP Parent Link',
      timeSpent: '45m',
      refreshes: 3,
      blockedCount: 0,
      allowedCount: 8,
      securityScore: 95,
      whatsapp: { messagesSent: 5, messagesReceived: 10, calls: 0, voiceCalls: 0, fileUploads: 0, imagesShared: 1, videosShared: 0, bandwidth: '8 MB' }
    },
    { 
      username: 'GST-9021', 
      role: 'Guest', 
      loginTime: '17:32', 
      duration: '11 mins', 
      device: 'OnePlus-Nord', 
      ip: '192.168.1.205', 
      mac: '90:0F:0C:77:88:99', 
      ap: 'AP-GuestNet-01', 
      data: '45 MB', 
      status: 'Online',
      os: 'Android 12',
      browser: 'Firefox Mobile',
      ssid: 'SecureCampus-Guest-Portal',
      download: '38 MB',
      upload: '7 MB',
      app: 'Google Search',
      timeSpent: '10m',
      refreshes: 1,
      blockedCount: 1,
      allowedCount: 4,
      securityScore: 82,
      whatsapp: { messagesSent: 2, messagesReceived: 4, calls: 0, voiceCalls: 0, fileUploads: 0, imagesShared: 0, videosShared: 0, bandwidth: '2 MB' }
    },
    { 
      username: 'K. Kavitha (2300090305)', 
      role: 'Student', 
      loginTime: '15:20', 
      duration: '2h 23m', 
      device: 'MacBook-Air', 
      ip: '192.168.1.112', 
      mac: 'F0:18:98:AA:BB:CC', 
      ap: 'AP-Library-03', 
      data: '1.2 GB', 
      status: 'Online',
      os: 'macOS Sonoma',
      browser: 'Safari',
      ssid: 'SecureCampus-Student-WPA3',
      download: '1.05 GB',
      upload: '150 MB',
      app: 'GitHub Codespaces',
      timeSpent: '2h 10m',
      refreshes: 32,
      blockedCount: 4,
      allowedCount: 68,
      securityScore: 85,
      whatsapp: { messagesSent: 85, messagesReceived: 120, calls: 4, voiceCalls: 2, fileUploads: 8, imagesShared: 14, videosShared: 3, bandwidth: '210 MB' }
    },
    { 
      username: 'M. Sriman (2300090311)', 
      role: 'Student', 
      loginTime: '17:05', 
      duration: '38 mins', 
      device: 'Sriman-Pixel', 
      ip: '192.168.1.108', 
      mac: '44:6D:57:DD:EE:FF', 
      ap: 'AP-MainHall-01', 
      data: '390 MB', 
      status: 'Online',
      os: 'Android 14',
      browser: 'Google Chrome Mobile',
      ssid: 'SecureCampus-Student-WPA3',
      download: '340 MB',
      upload: '50 MB',
      app: 'YouTube Tutorials',
      timeSpent: '35m',
      refreshes: 11,
      blockedCount: 0,
      allowedCount: 22,
      securityScore: 92,
      whatsapp: { messagesSent: 18, messagesReceived: 32, calls: 1, voiceCalls: 0, fileUploads: 1, imagesShared: 3, videosShared: 1, bandwidth: '36 MB' }
    }
  ];

  const [websites, setWebsites] = useState(initialWebsites);
  const [sessions, setSessions] = useState(initialSessions);

  const fetchDashboardData = async () => {
    try {
      // Fetch Juniper Telemetry
      const junosResp = await api.get('/api/juniper/inventory');
      if (junosResp.data && junosResp.data.success) {
        setJuniperDevices(junosResp.data.data);
      }

      // Fetch dynamic stats from Analytics dashboard
      const analyticsResp = await api.get('/api/analytics/dashboard');
      if (analyticsResp.data && analyticsResp.data.success) {
        const d = analyticsResp.data.data;
        setStats({
          totalUsers: String(d.total_users || 248),
          activeSessions: String(d.active_sessions_count || 142),
          totalTraffic: '4.2 TB',
          mitigatedThreats: String(d.total_alerts || 1280)
        });
      }
    } catch (error) {
      console.warn("Could not query dynamic telemetry, using mock fallbacks.", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "SecureCampus AI | Admin Dashboard";
    fetchDashboardData();
  }, []);

  // Fluctuations Effect (Simulation Mode)
  useEffect(() => {
    if (!isSimulated) return;

    const interval = setInterval(() => {
      // Fluctuate stats
      setStats(prev => {
        const currentActive = parseInt(prev.activeSessions);
        const shiftActive = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const nextActive = Math.max(120, Math.min(180, currentActive + shiftActive));

        const trafficBase = parseFloat(prev.totalTraffic);
        const nextTraffic = (trafficBase + Math.random() * 0.05).toFixed(2);

        const currentThreats = parseInt(prev.mitigatedThreats.replace(',', ''));
        const nextThreats = (currentThreats + (Math.random() > 0.7 ? 1 : 0)).toLocaleString();

        return {
          totalUsers: '248',
          activeSessions: nextActive.toString(),
          totalTraffic: `${nextTraffic} TB`,
          mitigatedThreats: nextThreats
        };
      });

      // Shift chart data points
      setChartData(prev => {
        const nextPoints = [...prev.slice(1)];
        const lastVal = prev[prev.length - 1];
        const shift = Math.floor(Math.random() * 15) - 7; // -7 to +7
        const newVal = Math.max(20, Math.min(100, lastVal + shift));
        nextPoints.push(newVal);
        return nextPoints;
      });

      // Update session bandwidth data slightly
      setSessions(prev => 
        prev.map(s => {
          if (s.status === 'Online' && Math.random() > 0.4) {
            const dataVal = parseFloat(s.data);
            const isGb = s.data.includes('GB');
            const inc = Math.random() * (isGb ? 0.02 : 25);
            const newVal = dataVal + inc;
            const newUnit = isGb ? 'GB' : newVal > 1000 ? 'GB' : 'MB';
            const finalVal = isGb ? newVal.toFixed(2) : newVal > 1000 ? (newVal / 1024).toFixed(2) : Math.floor(newVal);
            return { ...s, data: `${finalVal} ${newUnit}` };
          }
          return s;
        })
      );

      // Rotate Live Alerts
      setAlertIndex(prev => (prev + 1) % liveAlerts.length);

    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulated, liveAlerts.length]);

  const handleSyncJuniper = async () => {
    setSyncing(true);
    try {
      const response = await api.post('/api/juniper/sync');
      if (response.data && response.data.success) {
        toast.success('Juniper hardware inventory synchronized!');
        setJuniperDevices(response.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to sync Juniper hardware.');
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleSimulation = () => {
    const nextState = !isSimulated;
    setIsSimulated(nextState);
    localStorage.setItem('simulation_mode', nextState.toString());
    window.dispatchEvent(new Event('simulation_mode_changed'));
    toast.info(nextState ? 'Simulation Mode Activated' : 'Hardware Telemetry Mode Activated');
  };

  // SVG Chart path calculators
  const svgWidth = 500;
  const svgHeight = 120;
  const generatePath = () => {
    const points = chartData.map((val, idx) => {
      const x = (idx / (chartData.length - 1)) * svgWidth;
      const y = svgHeight - (val / 100) * (svgHeight - 10);
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  const generateAreaPath = () => {
    const linePath = generatePath();
    return `${linePath} L ${svgWidth},${svgHeight} L 0,${svgHeight} Z`;
  };

  // Filters
  const filteredWebsites = websites.filter(w => 
    w.url.toLowerCase().includes(webSearch.toLowerCase()) ||
    w.role.toLowerCase().includes(webSearch.toLowerCase()) ||
    w.status.toLowerCase().includes(webSearch.toLowerCase())
  );

  const filteredSessions = sessions.filter(s => 
    s.username.toLowerCase().includes(sessionSearch.toLowerCase()) ||
    s.role.toLowerCase().includes(sessionSearch.toLowerCase()) ||
    s.device.toLowerCase().includes(sessionSearch.toLowerCase()) ||
    s.ip.toLowerCase().includes(sessionSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left select-none">
      {/* Top Controls Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#334155]/20 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-text tracking-tight flex items-center gap-2">
            <Server className="w-6 h-6 text-brand-primary" />
            <span>NOC Operations Dashboard</span>
          </h1>
          <p className="text-xs text-brand-secondary mt-1">Live Unified Security Infrastructure Monitoring</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Simulation Toggle Switch */}
          <button
            onClick={handleToggleSimulation}
            className={`h-10 px-4 rounded-xl border font-bold text-xs flex items-center gap-2.5 transition-all cursor-pointer ${
              isSimulated 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded-full ${isSimulated ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>{isSimulated ? 'Simulation: ACTIVE' : 'Hardware Telemetry'}</span>
          </button>

          <Button
            variant="primary"
            onClick={handleSyncJuniper}
            loading={syncing}
            className="h-10 px-4 text-xs font-bold flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>Sync Hardware</span>
          </Button>

          <RefreshButton 
            isRefreshing={isRefreshing} 
            setIsRefreshing={setIsRefreshing} 
            onRefresh={handleRefresh} 
            pageName="Dashboard" 
          />
        </div>
      </div>

      {/* Grid: StatCards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-opacity duration-300 ${isRefreshing ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        <StatCard
          title="Active WiFi Sessions"
          value={stats.activeSessions}
          icon={Activity}
          trend="Real-Time Load"
          trendType="success"
          loading={loading}
        />
        <StatCard
          title="Total Data Consumed"
          value={stats.totalTraffic}
          icon={Database}
          trend="Accumulative Traffic"
          trendType="neutral"
          loading={loading}
        />
        <StatCard
          title="Security Actions"
          value={stats.mitigatedThreats}
          icon={Shield}
          trend="Threats Blocked Today"
          trendType="warning"
          loading={loading}
        />
        <StatCard
          title="NOC Operators"
          value={stats.totalUsers}
          icon={Users}
          trend="RBAC Accounts Active"
          trendType="success"
          loading={loading}
        />
      </div>

      {/* Dynamic Alerts Banner */}
      <div className="w-full bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <AlertTriangle className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 font-mono block">Threat Center • live activity</span>
            <span className="text-xs font-bold text-slate-800">{liveAlerts[alertIndex].desc}</span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-red-600 shrink-0 bg-red-100/50 px-2.5 py-1 rounded-md border border-red-200">
          {liveAlerts[alertIndex].time}
        </span>
      </div>

      {/* Main Charts & Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Bandwidth Live Chart (2 Cols) */}
        <div className="lg:col-span-2">
          <DashboardCard title="Live Bandwidth Utilization" subtitle="Real-time campus throughput tracking (Gbps)">
            <div className={`pt-2 relative flex flex-col justify-between h-48 transition-opacity duration-300 ${isRefreshing ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              {/* SVG Area & Line Chart */}
              <svg className="w-full h-32 overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d={generateAreaPath()} fill="url(#chartGlow)" />
                <path d={generatePath()} fill="none" stroke="var(--color-primary)" strokeWidth="3" className="transition-all duration-300" />
              </svg>

              <div className="flex justify-between items-center text-[10px] text-brand-secondary border-t border-[#334155]/20 pt-3">
                <span className="font-semibold uppercase tracking-wider text-slate-500">Last 30 seconds</span>
                <span className="font-mono text-brand-primary">Live refreshing telemetry</span>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Quick Administration Actions */}
        <div className="lg:col-span-1">
          <DashboardCard title="Control Panel Shortcuts" subtitle="Campus administrator links">
            <div className="space-y-3 pt-1">
              <QuickActionCard
                title="Verify Operators"
                description="Verify and update operator authorizations"
                onClick={() => navigate('/users')}
                badge="RBAC Active"
              />
              <QuickActionCard
                title="Juniper Inventory"
                description="Manage hardware and link devices"
                onClick={() => navigate('/devices')}
                badge="Telemetry"
              />
              <QuickActionCard
                title="Telemetry Reports"
                description="Download and export history reports"
                onClick={() => navigate('/reports')}
              />
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* Live User Session Monitor Table */}
      <DashboardCard title="Live User Session Monitor" subtitle="Real-time monitoring of campus network users & sessions (Click on a row to expand detailed analytics)">
        <div className="space-y-4 pt-2">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search user sessions..." 
              value={sessionSearch}
              onChange={(e) => setSessionSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs bg-white border-slate-200 outline-none text-slate-800 placeholder-slate-400 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Session Detail Drawer State */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Login Time</th>
                  <th className="p-3.5">IP Address</th>
                  <th className="p-3.5">MAC Address</th>
                  <th className="p-3.5">Access Point</th>
                  <th className="p-3.5 text-right">Data Consumed</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSessions.flatMap((s, idx) => {
                  const isExpanded = selectedSessionIdx === idx;
                  return [
                    <tr 
                      key={`row-${idx}`} 
                      onClick={() => setSelectedSessionIdx(isExpanded ? null : idx)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="p-3.5 font-bold text-slate-800 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                          {s.username.charAt(0)}
                        </div>
                        <div>
                          <span className="block">{s.username}</span>
                          <span className="text-[9px] text-slate-500 font-mono">{s.device}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-brand-secondary font-semibold">{s.role}</td>
                      <td className="p-3.5 font-mono text-brand-secondary">{s.loginTime} <span className="text-[9px] text-slate-500">({s.duration})</span></td>
                      <td className="p-3.5 font-mono text-brand-secondary">{s.ip}</td>
                      <td className="p-3.5 font-mono text-[10px] text-brand-secondary">{s.mac}</td>
                      <td className="p-3.5 font-semibold text-brand-secondary flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-brand-primary" />
                        <span>{s.ap}</span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-brand-primary">{s.data}</td>
                      <td className="p-3.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{s.status}</span>
                        </span>
                      </td>
                    </tr>,
                    isExpanded && (
                      <tr key={`expand-${idx}`} className="bg-slate-50/50">
                        <td colSpan="8" className="p-4 border-t border-slate-200">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 select-none">
                            <div className="space-y-2 border-r border-slate-100 pr-4">
                              <h4 className="font-extrabold uppercase text-[10px] text-blue-600 tracking-wider font-mono">Chassis Device Profile</h4>
                              <p className="flex justify-between"><span>Operating System:</span> <strong className="text-slate-800">{s.os}</strong></p>
                              <p className="flex justify-between"><span>Web Browser:</span> <strong className="text-slate-800">{s.browser}</strong></p>
                              <p className="flex justify-between"><span>SSID Network:</span> <strong className="text-slate-800 font-mono">{s.ssid}</strong></p>
                              <p className="flex justify-between"><span>Current AP Interface:</span> <strong className="text-slate-800">{s.ap}</strong></p>
                            </div>
                            <div className="space-y-2 border-r border-slate-100 pr-4">
                              <h4 className="font-extrabold uppercase text-[10px] text-purple-600 tracking-wider font-mono">App Usage & Network Traffic</h4>
                              <p className="flex justify-between"><span>Active Application:</span> <strong className="text-slate-800">{s.app}</strong></p>
                              <p className="flex justify-between"><span>Session Duration:</span> <strong className="text-slate-800">{s.timeSpent}</strong></p>
                              <p className="flex justify-between"><span>Page Refreshes:</span> <strong className="text-slate-800 font-mono">{s.refreshes} times</strong></p>
                              <p className="flex justify-between"><span>Upload / Download:</span> <strong className="text-slate-800 font-mono font-bold text-blue-600">▲ {s.upload} / ▼ {s.download}</strong></p>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-extrabold uppercase text-[10px] text-amber-600 tracking-wider font-mono">Security Profile</h4>
                              <p className="flex justify-between"><span>Security Score:</span> <strong className="text-emerald-600 font-bold font-mono">{s.securityScore}/100</strong></p>
                              <p className="flex justify-between"><span>Allowed Domains:</span> <strong className="text-slate-800 font-mono">{s.allowedCount}</strong></p>
                              <p className="flex justify-between"><span>Blocked Domains:</span> <strong className="text-red-600 font-bold font-mono">{s.blockedCount}</strong></p>
                              {s.whatsapp && (
                                <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1 text-[10px]">
                                  <h5 className="font-bold text-slate-500 font-mono uppercase">WhatsApp Web Activity</h5>
                                  <p className="flex justify-between"><span>Msgs (Sent/Recv):</span> <strong className="text-slate-800">{s.whatsapp.messagesSent} / {s.whatsapp.messagesReceived}</strong></p>
                                  <p className="flex justify-between"><span>Calls (Voice/Files):</span> <strong className="text-slate-800">{s.whatsapp.calls} calls / {s.whatsapp.fileUploads} files</strong></p>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  ];
                })}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardCard>

      {/* Website Activity Monitoring Table */}
      <DashboardCard title="Website Access Monitoring" subtitle="Inspect traffic logs & firewall security enforcement (Click on a row to expand firewall rules & reason details)">
        <div className="space-y-4 pt-2">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search website logs..." 
              value={webSearch}
              onChange={(e) => setWebSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs bg-white border-slate-200 outline-none text-slate-800 placeholder-slate-400 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Accessed URL</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Timeline (In/Out)</th>
                  <th className="p-3.5 font-mono">Refreshes</th>
                  <th className="p-3.5">Bandwidth (▲/▼)</th>
                  <th className="p-3.5 text-center">Risk Score</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWebsites.flatMap((w, idx) => {
                  const isWebExpanded = selectedWebIdx === idx;
                  return [
                    <tr 
                      key={`web-${idx}`} 
                      onClick={() => setSelectedWebIdx(isWebExpanded ? null : idx)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="p-3.5 font-semibold text-slate-800 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <span>{w.url}</span>
                      </td>
                      <td className="p-3.5 text-slate-600">{w.role}</td>
                      <td className="p-3.5 text-slate-600 font-mono">
                        {w.time} - {w.closed} <span className="text-[9px] text-slate-500">({w.duration})</span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">{w.refreshes}</td>
                      <td className="p-3.5 font-mono text-slate-600">
                        ▲ {w.upload} / ▼ {w.download}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          w.score > 7 ? 'bg-red-50 text-red-600 border border-red-200' : 
                          w.score > 4 ? 'bg-amber-50 text-amber-600 border border-amber-200' : 
                          'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}>
                          {w.score}/10
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          w.action === 'Blocked' 
                            ? 'bg-red-50 text-red-600 border border-red-100' 
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {w.action}
                        </span>
                      </td>
                    </tr>,
                    isWebExpanded && (
                      <tr key={`web-expand-${idx}`} className="bg-slate-50/50">
                        <td colSpan="7" className="p-4 border-t border-slate-200 font-mono text-[11px] text-left text-slate-600">
                          <div className="flex flex-col gap-1.5">
                            <p><span className="text-blue-600 font-bold">FIREWALL EVALUATION STATUS:</span> {w.action === 'Blocked' ? '🛑 PACKET DROPPED' : '✅ POLICY MATCH ALLOWED'}</p>
                            <p><span className="text-blue-600 font-bold">REASON / ENFORCEMENT CODE:</span> <span className={w.action === 'Blocked' ? 'text-red-600 font-bold' : 'text-slate-800'}>{w.reason}</span></p>
                            <p><span className="text-blue-600 font-bold">MATCHED ROUTE PATTERN:</span> {"WAN_SUBNET_OUTBOUND -> JUNIPER_SRX_IDS_IPS -> INTERNET"}</p>
                          </div>
                        </td>
                      </tr>
                    )
                  ];
                })}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};

export default AdminDashboardPage;
