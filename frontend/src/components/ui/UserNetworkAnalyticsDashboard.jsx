// frontend/src/components/ui/UserNetworkAnalyticsDashboard.jsx
import React, { useState, useMemo } from 'react';
import { 
  Shield, Wifi, Globe, Smartphone, BarChart3, Activity, Clock, Download, 
  Search, ShieldAlert, CheckCircle2, AlertTriangle, Info, Printer, FileSpreadsheet
} from 'lucide-react';

// Dynamic Simulation Data Generator
const generateSimulationData = (user) => {
  if (!user) return null;
  const roleName = user.role?.role_name || 'Guest';

  // Seeded/randomized values based on user and time
  const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));
  const formatBytes = (mb) => mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb} MB`;

  // Base IDs
  const displayId = user.roll_number || user.employee_id || `GST-${user.id || randomBetween(1000, 9999)}`;
  const dept = user.department || 'General Administration';

  // Security Score and threats
  const securityScore = randomBetween(72, 99);
  const threatCount = securityScore > 90 ? randomBetween(0, 2) : randomBetween(3, 12);
  const mfaStatus = roleName === 'Faculty' || roleName === 'Super Admin' ? 'Enabled' : 'Disabled';
  const failedLogins = randomBetween(0, 3);
  
  // Login times & statistics
  const loginsToday = randomBetween(1, 6);
  const avgSessionMin = randomBetween(20, 180);
  const todayMinutes = loginsToday * avgSessionMin;
  const weeklyHours = randomFloat(10, 45);
  const monthlyHours = weeklyHours * 4.2;

  // Devices generator
  const deviceManufacturers = {
    Laptop: ['Apple', 'Dell', 'Lenovo', 'HP'],
    Mobile: ['Apple', 'Samsung', 'OnePlus', 'Google'],
    Tablet: ['Apple', 'Samsung', 'Lenovo'],
    Desktop: ['Custom PC', 'HP', 'Dell']
  };

  const deviceTypes = roleName === 'Student' ? ['Laptop', 'Mobile'] : 
                      roleName === 'Faculty' ? ['Laptop', 'Mobile', 'Tablet'] :
                      roleName === 'Parent Visitor' ? ['Mobile'] : ['Mobile', 'Laptop'];
  
  const connectedDevices = deviceTypes.map((type, idx) => {
    const brand = deviceManufacturers[type][randomBetween(0, deviceManufacturers[type].length - 1)];
    const deviceName = `${brand} ${type}`;
    const os = type === 'Laptop' ? (brand === 'Apple' ? 'macOS Sequoia' : 'Windows 11 Pro') : 
               type === 'Mobile' ? (brand === 'Apple' ? 'iOS 17.5' : 'Android 14') : 'Android 13';
    const browser = brand === 'Apple' ? 'Safari Mobile' : 'Google Chrome';
    const ip = `192.168.1.${randomBetween(100, 250)}`;
    const mac = Array.from({ length: 6 }, () => randomBetween(16, 255).toString(16).toUpperCase()).join(':');
    const hostname = `${user.fullname.replace(/\s+/g, '-').toLowerCase()}-${type.toLowerCase()}`;
    const ap = `AP-${dept.replace(/\s+/g, '')}-0${idx + 1}`;
    const ssid = roleName === 'Student' ? 'SecureCampus-Student' : 
                 roleName === 'Faculty' ? 'SecureCampus-Faculty' : 'SecureCampus-Guest';
    
    const upMB = randomBetween(20, 1500);
    const downMB = randomBetween(100, 8000);

    return {
      deviceName,
      manufacturer: brand,
      deviceType: type,
      os,
      browser,
      ipAddress: ip,
      macAddress: mac,
      hostname,
      connectionType: type === 'Desktop' ? 'Ethernet' : 'WiFi',
      accessPoint: ap,
      ssid,
      signalStrength: `-${randomBetween(45, 80)} dBm`,
      connectionTime: `${randomBetween(8, 11)}:00 AM`,
      disconnectionTime: idx === 0 ? 'Active Now' : `${randomBetween(12, 17)}:00 PM`,
      status: idx === 0 ? 'Active' : 'Disconnected',
      upload: upMB,
      download: downMB,
      bandwidthUsed: upMB + downMB
    };
  });

  // Visited websites generator
  const websiteTemplates = [
    { url: 'google.com', category: 'Search Engine', risk: 1, allowed: true },
    { url: 'youtube.com', category: 'Entertainment', risk: 3, allowed: true },
    { url: 'github.com', category: 'Education', risk: 1, allowed: true },
    { url: 'chat.openai.com', category: 'Productivity', risk: 2, allowed: true },
    { url: 'gmail.com', category: 'Communication', risk: 1, allowed: true },
    { url: 'kluniversity.in', category: 'Education', risk: 1, allowed: true },
    { url: 'linkedin.com', category: 'Social Media', risk: 2, allowed: true },
    { url: 'stackoverflow.com', category: 'Education', risk: 1, allowed: true },
    { url: 'zoom.us', category: 'Communication', risk: 2, allowed: true },
    { url: 'facebook.com', category: 'Social Media', risk: 4, allowed: roleName === 'Faculty' },
    { url: 'torrent-download.org', category: 'Entertainment', risk: 8, allowed: false, reason: 'P2P File Sharing Blocked' },
    { url: 'malicious-phishing.net', category: 'Search Engine', risk: 10, allowed: false, reason: 'Heuristic Threat Intelligence Blocked' }
  ];

  const visitedWebsites = websiteTemplates.map((site) => {
    const upMB = randomBetween(2, 200);
    const downMB = randomBetween(5, 2000);
    const openHour = randomBetween(8, 17);
    const openMin = randomBetween(10, 59);
    const durationMin = randomBetween(1, 45);

    return {
      url: site.url,
      category: site.category,
      openTime: `${openHour.toString().padStart(2, '0')}:${openMin.toString().padStart(2, '0')}`,
      closeTime: `${(openHour + Math.floor((openMin + durationMin) / 60)).toString().padStart(2, '0')}:${((openMin + durationMin) % 60).toString().padStart(2, '0')}`,
      duration: `${durationMin}m`,
      refreshCount: randomBetween(1, 15),
      upload: upMB,
      download: downMB,
      bandwidthUsed: upMB + downMB,
      status: site.allowed ? 'Allowed' : 'Blocked',
      blockedReason: site.allowed ? '—' : site.reason,
      riskScore: site.risk
    };
  });

  // App analytics generator
  const appTemplates = [
    { name: 'Chrome', pct: 40 },
    { name: 'ChatGPT', pct: 15 },
    { name: 'GitHub', pct: 12 },
    { name: 'VS Code', pct: 18 },
    { name: 'Microsoft Teams', pct: 5 },
    { name: 'Zoom', pct: 8 },
    { name: 'Google Drive', pct: 6 },
    { name: 'WhatsApp Web', pct: 4 },
    { name: 'KL ERP', pct: 10 },
    { name: 'KL LMS', pct: 12 }
  ];

  const applicationAnalytics = appTemplates.map(app => {
    const down = randomBetween(10, 3000);
    const up = randomBetween(2, 500);
    return {
      appName: app.name,
      duration: `${randomBetween(10, 240)} mins`,
      upload: up,
      download: down,
      dataConsumed: up + down,
      usagePercentage: app.pct + randomBetween(-3, 3)
    };
  });

  // Network metrics
  const currentDevice = connectedDevices[0] || {};
  const networkAnalytics = {
    currentIp: currentDevice.ipAddress || '192.168.1.100',
    previousIps: [`192.168.1.${randomBetween(10, 99)}`, `10.0.12.${randomBetween(100, 250)}`],
    macAddress: currentDevice.macAddress || '00:00:00:00:00:00',
    accessPoint: currentDevice.accessPoint || 'AP-MainHall-01',
    ssid: currentDevice.ssid || 'SecureCampus-WiFi',
    signalStrength: currentDevice.signalStrength || '-60 dBm',
    bandwidthTotal: formatBytes(connectedDevices.reduce((acc, d) => acc + d.bandwidthUsed, 0)),
    peakSpeed: `${randomBetween(40, 250)} Mbps`,
    averageSpeed: `${randomBetween(15, 120)} Mbps`,
    packetLoss: `${randomFloat(0, 1.5)}%`,
    latency: `${randomBetween(8, 48)} ms`
  };

  // Activity Timeline
  const timelineEvents = [
    { time: '08:45 AM', type: 'system', event: 'Authentication succeeded', desc: 'Secure login via WPA3 protocol.' },
    { time: '08:47 AM', type: 'network', event: `Connected to ${networkAnalytics.accessPoint}`, desc: `SSID: ${networkAnalytics.ssid} with signal ${networkAnalytics.signalStrength}` },
    { time: '08:49 AM', type: 'app', event: 'Launched Chrome Browser', desc: 'Session initialized on desktop agent.' },
    { time: '08:50 AM', type: 'web', event: 'Visited google.com', desc: 'Search engine access, duration: 4m.' },
    { time: '08:55 AM', type: 'web', event: 'Visited chat.openai.com', desc: 'Productivity assistance, 1.2 MB exchanged.' },
    { time: '09:15 AM', type: 'web', event: 'Visited github.com', desc: 'Academic repository synced.' },
    { time: '10:05 AM', type: 'security', event: 'Blocked domain request', desc: 'Attempt to reach torrent-download.org was dropped by security rule #4.' },
    { time: '10:20 AM', type: 'network', event: 'Large file download completed', desc: 'Data transfer: 450 MB fetched.' },
    { time: '11:00 AM', type: 'system', event: 'Active state poll verified', desc: 'Continuous network handshake succeeded.' }
  ];

  // AI Insights
  const aiInsights = [];
  if (roleName === 'Student') {
    aiInsights.push({ type: 'warning', text: 'High YouTube streaming detected during core instructional hours.' });
    aiInsights.push({ type: 'info', text: 'Heavy GitHub code pushes detected - excellent academic engagement.' });
  }
  if (connectedDevices.length > 2) {
    aiInsights.push({ type: 'warning', text: `Multiple concurrent devices (${connectedDevices.length}) linked to single credentials.` });
  }
  if (securityScore < 85) {
    aiInsights.push({ type: 'critical', text: 'Low security score due to attempted blocklisted site accesses.' });
  } else {
    aiInsights.push({ type: 'success', text: 'Excellent network hygiene. No active threats detected.' });
  }
  aiInsights.push({ type: 'info', text: `Primary traffic routing through access point: ${networkAnalytics.accessPoint}.` });

  return {
    overview: {
      fullname: user.fullname,
      role: roleName,
      displayId,
      department: dept,
      email: user.email,
      phone: user.phone || '9988776655',
      created_at: user.created_at || new Date().toISOString(),
      account_status: user.account_status || 'Active',
      securityScore,
      onlineStatus: currentDevice.status === 'Active' ? 'Online' : 'Offline'
    },
    logins: {
      currentLogin: '08:45 AM',
      currentLogout: 'Active',
      prevLogin: 'Yesterday, 09:15 AM',
      prevLogout: 'Yesterday, 04:30 PM',
      sessionDuration: '2h 15m',
      todayOnline: `${(todayMinutes / 60).toFixed(1)} hrs`,
      weeklyOnline: `${weeklyHours} hrs`,
      monthlyOnline: `${monthlyHours.toFixed(0)} hrs`,
      loginsCount: loginsToday,
      avgSession: `${avgSessionMin} mins`
    },
    devices: connectedDevices,
    websites: visitedWebsites,
    applications: applicationAnalytics,
    network: networkAnalytics,
    security: {
      securityScore,
      threatCount,
      blockedCount: visitedWebsites.filter(w => w.status === 'Blocked').length,
      allowedCount: visitedWebsites.filter(w => w.status === 'Allowed').length,
      failedLogins,
      mfaStatus,
      firewallEvents: threatCount + randomBetween(0, 5),
      anomaly: securityScore < 80 ? 'Suspicious P2P traffic footprint' : 'None detected',
      aiRiskLevel: securityScore > 90 ? 'Low' : securityScore > 80 ? 'Medium' : 'High'
    },
    timeline: timelineEvents,
    insights: aiInsights
  };
};

export const UserNetworkAnalyticsDashboard = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [simulationVersion, setSimulationVersion] = useState(0);

  // Generate simulated data memoized per user instance and simulation version
  const data = useMemo(() => generateSimulationData(user), [user, simulationVersion]);

  if (!data) return null;

  const { overview, logins, devices, websites, applications, network, security, timeline, insights } = data;

  // Dynamically calculate category stats for the donut chart
  const categoryStats = useMemo(() => {
    // ── APPROVED category → color map ──────────────────────────────────────
    const CATEGORY_COLORS = {
      'Education':     '#2563eb',   // Blue
      'Productivity':  '#a855f7',   // Purple
      'Entertainment': '#f59e0b',   // Orange
      'Search Engine': '#10b981',   // Emerald/Green
      'Social Media':  '#ec4899',   // Pink
      'Communication': '#06b6d4',   // Cyan
      'Other':         '#94a3b8',   // Slate/Grey (explicit fallback)
    };

    // 1. Aggregate bandwidth per category
    const stats = {};
    let totalBandwidth = 0;
    websites.forEach(w => {
      const cat = CATEGORY_COLORS[w.category] ? w.category : 'Other';
      stats[cat] = (stats[cat] || 0) + w.bandwidthUsed;
      totalBandwidth += w.bandwidthUsed;
    });

    if (totalBandwidth === 0) return [];

    // 2. Compute raw floating-point percentages (NO Math.round yet)
    const categories = Object.keys(stats);
    const rawPercentages = categories.map(cat => (stats[cat] / totalBandwidth) * 100);

    // 3. Normalize so the values sum to EXACTLY 100 (largest-remainder method)
    const floored = rawPercentages.map(p => Math.floor(p));
    const remainders = rawPercentages.map((p, i) => ({ i, r: p - floored[i] }));
    let remainder = 100 - floored.reduce((a, b) => a + b, 0);
    remainders.sort((a, b) => b.r - a.r);
    remainders.forEach(({ i }) => {
      if (remainder <= 0) return;
      floored[i]++;
      remainder--;
    });

    // 4. Build SVG stroke props
    // SVG circle r="15.915" → circumference = 2π×15.915 ≈ 100.002 ≈ 100
    // The SVG is CSS-rotated -90°, so stroke starts at 12 o'clock naturally.
    // strokeDashoffset = circumference - cumulative dash already placed
    // → each segment starts exactly where the previous one ended, no gaps.
    const CIRCUMFERENCE = 100;
    let cumulativeOffset = 0;
    const result = categories.map((cat, idx) => {
      const pct = floored[idx];
      const dashLen = (pct / 100) * CIRCUMFERENCE;
      const gapLen  = CIRCUMFERENCE - dashLen;
      // Positive offset "delays" the dash start. Start of this segment = total
      // circumference minus all previously placed dashes.
      const offset  = CIRCUMFERENCE - cumulativeOffset;
      cumulativeOffset += dashLen;

      return {
        category:         cat,
        percentage:       pct,
        color:            CATEGORY_COLORS[cat] || '#94a3b8',
        strokeDasharray:  `${dashLen.toFixed(3)} ${gapLen.toFixed(3)}`,
        strokeDashoffset: offset.toFixed(3),
      };
    });

    // 5. Debug guard — log any mismatch (dev only)
    const totalPct = result.reduce((s, r) => s + r.percentage, 0);
    if (totalPct !== 100) {
      console.warn('[CategoryDonut] percentages do not sum to 100:', totalPct, result);
    }

    // Filter out 0% slices so they don't create invisible "gap" segments
    return result.filter(r => r.percentage > 0);
  }, [websites]);

  // Filter handlers
  const filteredWebsites = websites.filter(w => 
    w.url.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDevices = devices.filter(d => 
    d.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.ipAddress.includes(searchTerm) || 
    d.macAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredApps = applications.filter(a => 
    a.appName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTimeline = timeline.filter(t => 
    t.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // PDF Export Trigger
  const handlePrint = () => {
    window.print();
  };

  // Excel CSV Export Trigger
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `User Profile Report: ${overview.fullname}\n`;
    csvContent += `Role: ${overview.role}, ID: ${overview.displayId}, Department: ${overview.department}\n\n`;
    
    // Website monitoring segment
    csvContent += "VISITED WEBSITES HISTORY\n";
    csvContent += "URL,Category,Open Time,Duration,Bandwidth Used (MB),Status,Risk Score\n";
    websites.forEach(w => {
      csvContent += `"${w.url}","${w.category}","${w.openTime}","${w.duration}",${w.bandwidthUsed},"${w.status}",${w.riskScore}\n`;
    });

    csvContent += "\nCONNECTED DEVICES\n";
    csvContent += "Device Name,IP Address,MAC Address,SSID,Access Point,Status\n";
    devices.forEach(d => {
      csvContent += `"${d.deviceName}","${d.ipAddress}","${d.macAddress}","${d.ssid}","${d.accessPoint}","${d.status}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `network_analytics_${overview.fullname.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Color helper functions
  const getSecurityScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 80) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="flex flex-col bg-white text-slate-800 rounded-3xl h-full shadow-2xl border border-slate-200/80 overflow-hidden font-sans select-none print:shadow-none print:border-none print:bg-white print:text-black">
      
      {/* Title Bar */}
      <div className="flex items-center justify-between px-8 py-5 bg-gradient-to-r from-blue-50 to-indigo-50/30 border-b border-slate-100 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl text-white">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">User Network Analytics</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Live Simulation Console</p>
              <span className="text-slate-300">•</span>
              <button 
                type="button"
                onClick={() => setSimulationVersion(prev => prev + 1)}
                className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase cursor-pointer"
                title="Regenerate all simulated values"
              >
                🔄 Re-simulate
              </button>
            </div>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200/60 rounded-xl transition-colors text-slate-500 hover:text-slate-800 text-sm font-bold"
          >
            Close Panel
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row grow overflow-hidden">
        
        {/* Left Side: Profile Summary Card */}
        <div className="w-full md:w-80 bg-slate-50/50 border-r border-slate-100 p-6 flex flex-col justify-between overflow-y-auto print:border-none print:w-full">
          <div className="space-y-6">
            
            {/* Avatar & Basics */}
            <div className="text-center space-y-3">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-600 font-extrabold text-2xl flex items-center justify-center font-mono shadow-sm">
                  {overview.fullname.charAt(0).toUpperCase()}
                </div>
                <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${overview.onlineStatus === 'Online' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">{overview.fullname}</h4>
                <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded mt-1">
                  {overview.role}
                </span>
              </div>
            </div>

            {/* Core Metrics */}
            <div className="space-y-3.5 bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Identifier</span>
                <span className="font-mono font-bold text-slate-900">{overview.displayId}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Department</span>
                <span className="font-semibold text-slate-800">{overview.department}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Status</span>
                <span className={`font-semibold px-2 py-0.5 rounded text-[10px] font-bold ${overview.onlineStatus === 'Online' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 bg-slate-100'}`}>
                  {overview.onlineStatus}
                </span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Security Index</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded border ${getSecurityScoreColor(overview.securityScore)}`}>
                  {overview.securityScore}%
                </span>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-3 text-xs bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                <p className="font-semibold text-slate-800 truncate">{overview.email}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</span>
                <p className="font-semibold text-slate-800">{overview.phone}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Enrollment Date</span>
                <p className="font-semibold text-slate-800">{new Date(overview.created_at).toLocaleDateString()}</p>
              </div>
            </div>

          </div>

          {/* Quick Stats */}
          <div className="mt-6 pt-4 border-t border-slate-200/80 space-y-2.5 print:hidden">
            <button 
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-500/10 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print User Report
            </button>
            <button 
              onClick={handleExportCSV}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export CSV Spreadsheet
            </button>
          </div>
        </div>

        {/* Right Side: Navigation Tabs & Detailed Panels */}
        <div className="grow flex flex-col overflow-hidden bg-white">
          
          {/* Tab Headers */}
          <div className="flex overflow-x-auto border-b border-slate-100 p-2 gap-1.5 shrink-0 bg-slate-50/30 scrollbar-none print:hidden">
            {[
              { id: 'overview', label: '📊 Overview' },
              { id: 'devices', label: '💻 Devices' },
              { id: 'websites', label: '🌐 Websites' },
              { id: 'apps', label: '📱 Apps' },
              { id: 'network', label: '📈 Network' },
              { id: 'security', label: '🛡️ Security' },
              { id: 'timeline', label: '📄 Timeline' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchTerm('');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar inside panels */}
          {['websites', 'devices', 'apps', 'timeline'].includes(activeTab) && (
            <div className="px-6 pt-4 print:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          )}

          {/* Tab Content Panel */}
          <div className="grow overflow-y-auto p-6 space-y-6">
            
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Visual SVG Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Chart 1: Bandwidth usage (Line chart) */}
                  <div className="border border-slate-100 shadow-sm rounded-2xl p-5 bg-white">
                    <h5 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-4">Traffic Bandwidth Consumption (MB)</h5>
                    <div className="h-40 w-full">
                      <svg viewBox="0 0 100 30" className="w-full h-full">
                        {/* Gradients */}
                        <defs>
                          <linearGradient id="bandwidthGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25"/>
                            <stop offset="100%" stopColor="#2563eb" stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        {/* Area */}
                        <path d="M0,30 L10,18 L20,25 L30,12 L40,20 L50,8 L60,15 L70,5 L80,18 L90,10 L100,28 L100,30 Z" fill="url(#bandwidthGradient)" />
                        {/* Line */}
                        <path d="M0,30 L10,18 L20,25 L30,12 L40,20 L50,8 L60,15 L70,5 L80,18 L90,10 L100,28" fill="none" stroke="#2563eb" strokeWidth="1.2" />
                        {/* Grid lines */}
                        <line x1="0" y1="10" x2="100" y2="10" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2,2" />
                        <line x1="0" y1="20" x2="100" y2="20" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2,2" />
                      </svg>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-2.5">
                      <span>09:00 AM</span>
                      <span>12:00 PM</span>
                      <span>03:00 PM</span>
                      <span>06:00 PM</span>
                    </div>
                  </div>

                  {/* Chart 2: Website categories (Donut Chart) */}
                  <div className="border border-slate-100 shadow-sm rounded-2xl p-5 bg-white flex flex-col justify-between">
                    <h5 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-4">Browsing Category Footprint</h5>
                    <div className="flex items-center gap-6 justify-center">
                      <div className="w-24 h-24 shrink-0 relative">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                          {/* Background track — transparent so no white bleed-through */}
                          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3.5" strokeLinecap="butt" />

                          {/* Dynamic sectors — rendered in order, offset accumulates */}
                          {categoryStats.map((item, idx) => (
                            <circle
                              key={idx}
                              cx="18"
                              cy="18"
                              r="15.915"
                              fill="none"
                              stroke={item.color}
                              strokeWidth="3.5"
                              strokeLinecap="butt"
                              strokeDasharray={item.strokeDasharray}
                              strokeDashoffset={item.strokeDashoffset}
                              className="transition-all duration-500"
                            />
                          ))}
                        </svg>
                        {/* Center label */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-[9px] font-extrabold text-slate-500 leading-tight text-center">100%</span>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-[10px] text-slate-600 font-bold max-h-32 overflow-y-auto pr-1">
                        {categoryStats.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="truncate">{item.category} ({item.percentage}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* AI Security Recommendations */}
                <div className="space-y-3">
                  <h5 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">AI Insights & Network Health Checks</h5>
                  <div className="space-y-2">
                    {insights.map((insight, idx) => (
                      <div key={idx} className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                        insight.type === 'critical' ? 'bg-red-50 border-red-100 text-red-800' :
                        insight.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                        insight.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                        'bg-blue-50 border-blue-100 text-blue-800'
                      }`}>
                        <div className="shrink-0 mt-0.5">
                          {insight.type === 'critical' && <ShieldAlert className="w-4.5 h-4.5 text-red-600" />}
                          {insight.type === 'warning' && <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />}
                          {insight.type === 'success' && <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />}
                          {insight.type === 'info' && <Info className="w-4.5 h-4.5 text-blue-600" />}
                        </div>
                        <div className="text-xs">
                          <span className="font-bold uppercase tracking-wider block text-[9px] mb-0.5">
                            {insight.type} notification
                          </span>
                          <p className="font-semibold">{insight.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connection History Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Device IP</span>
                    <p className="text-sm font-bold text-slate-850 font-mono mt-1">{network.currentIp}</p>
                  </div>
                  <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Today Logins</span>
                    <p className="text-sm font-bold text-slate-850 mt-1">{logins.loginsCount} Times</p>
                  </div>
                  <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Bandwidth</span>
                    <p className="text-sm font-bold text-slate-850 mt-1">{network.bandwidthTotal}</p>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: DEVICES */}
            {activeTab === 'devices' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <h5 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">Registered Connected Devices ({filteredDevices.length})</h5>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredDevices.map((device, idx) => (
                    <div key={idx} className="border border-slate-200/80 rounded-2xl p-5 bg-white relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                          <Smartphone className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h6 className="text-xs font-bold text-slate-900">{device.deviceName}</h6>
                          <p className="text-[10px] text-slate-500 font-semibold">{device.manufacturer} ({device.deviceType})</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-[10px] font-semibold text-slate-600">
                        <div>
                          <span className="block text-[9px] text-slate-400 font-bold uppercase">IP Address</span>
                          <span className="font-mono text-slate-800">{device.ipAddress}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-slate-400 font-bold uppercase">MAC Address</span>
                          <span className="font-mono text-slate-800">{device.macAddress}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-slate-400 font-bold uppercase">Access Point</span>
                          <span className="text-slate-850">{device.accessPoint}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-slate-400 font-bold uppercase">Signal</span>
                          <span className="text-slate-850 font-mono">{device.signalStrength}</span>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 flex gap-1">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${device.status === 'Active' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100'}`}>
                          {device.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: WEBSITES */}
            {activeTab === 'websites' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <h5 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">Domain Browsing Footprints ({filteredWebsites.length})</h5>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-sm">
                  <table className="w-full text-left border-collapse text-[11px] font-semibold">
                    <thead>
                      <tr className="bg-slate-50 text-[9px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                        <th className="p-3">Domain</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3">Bandwidth</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-center">Threat Risk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredWebsites.map((w, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/55 transition-colors">
                          <td className="p-3 font-bold text-slate-900 font-mono">{w.url}</td>
                          <td className="p-3">{w.category}</td>
                          <td className="p-3 font-mono">{w.openTime}</td>
                          <td className="p-3 font-mono">{w.duration}</td>
                          <td className="p-3 font-mono">{(w.bandwidthUsed).toFixed(1)} MB</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${w.status === 'Allowed' ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                              {w.status}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-block w-6 py-0.5 rounded font-mono font-bold text-[9px] text-white ${w.riskScore > 6 ? 'bg-red-500' : w.riskScore > 3 ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                              {w.riskScore}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: APPS */}
            {activeTab === 'apps' && (
              <div className="space-y-6 animate-fadeIn">
                <h5 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">Application Analytics Usage ({filteredApps.length})</h5>
                <div className="space-y-4">
                  {filteredApps.map((app, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800">{app.appName}</span>
                        <div className="text-[10px] text-slate-500 font-bold">
                          <span>{app.duration}</span>
                          <span className="mx-2">|</span>
                          <span className="font-mono text-slate-800">{(app.dataConsumed).toFixed(1)} MB consumed</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(app.usagePercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: NETWORK */}
            {activeTab === 'network' && (
              <div className="space-y-6 animate-fadeIn">
                <h5 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">Detailed LAN & Access Point Connection</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* LAN Attributes */}
                  <div className="border border-slate-200/80 rounded-2xl p-5 bg-white space-y-4.5 shadow-sm">
                    <h6 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2.5">Addressing & Interface</h6>
                    <div className="space-y-3.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Allocated IP</span>
                        <span className="font-mono font-bold text-slate-900">{network.currentIp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Subnet Mask</span>
                        <span className="font-mono font-bold text-slate-900">255.255.255.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Gateway Node</span>
                        <span className="font-mono font-bold text-slate-900">192.168.1.1</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">MAC Address</span>
                        <span className="font-mono font-bold text-slate-900">{network.macAddress}</span>
                      </div>
                    </div>
                  </div>

                  {/* RF Attributes */}
                  <div className="border border-slate-200/80 rounded-2xl p-5 bg-white space-y-4.5 shadow-sm">
                    <h6 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2.5">Wireless RF Metrics</h6>
                    <div className="space-y-3.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Associated AP</span>
                        <span className="font-semibold text-slate-900">{network.accessPoint}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">SSID</span>
                        <span className="font-mono font-bold text-slate-900">{network.ssid}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">RSSI Signal</span>
                        <span className="font-mono font-bold text-slate-900">{network.signalStrength}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Connection Mode</span>
                        <span className="font-semibold text-slate-800">802.11ax (Wi-Fi 6)</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB: SECURITY */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-fadeIn">
                <h5 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">Firewall Rules & Threat Prevention Log</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Threat Count</span>
                    <p className="text-2xl font-extrabold text-red-600 mt-1">{security.threatCount}</p>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Blocked Websites</span>
                    <p className="text-2xl font-extrabold text-amber-600 mt-1">{security.blockedCount}</p>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Firewall Block Triggers</span>
                    <p className="text-2xl font-extrabold text-slate-800 mt-1">{security.firewallEvents}</p>
                  </div>
                </div>

                <div className="border border-slate-200/80 rounded-2xl p-5 bg-white space-y-4 shadow-sm">
                  <h6 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2.5">Device Threat Auditing</h6>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase">MFA Status</span>
                      <span className="text-slate-800">{security.mfaStatus}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase">Failed Logins Today</span>
                      <span className="text-slate-850 font-mono">{security.failedLogins}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase">Anomaly Pattern</span>
                      <span className="text-slate-850">{security.anomaly}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase">AI Risk Level</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit inline-block ${
                        security.aiRiskLevel === 'Low' ? 'text-emerald-700 bg-emerald-50' : 
                        security.aiRiskLevel === 'Medium' ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50'
                      }`}>
                        {security.aiRiskLevel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: TIMELINE */}
            {activeTab === 'timeline' && (
              <div className="space-y-6 animate-fadeIn">
                <h5 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">Sequential Session Logs</h5>
                <div className="relative border-l-2 border-blue-500/20 pl-6 ml-3 space-y-6">
                  {filteredTimeline.map((t, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-blue-600 border-2 border-white ring-4 ring-blue-50" />
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400 font-bold">{t.time}</span>
                          <span className="text-xs font-bold text-slate-850">{t.event}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
export default UserNetworkAnalyticsDashboard;
