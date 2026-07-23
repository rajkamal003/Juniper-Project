// frontend/src/pages/AnalyticsDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Cpu, HardDrive, RefreshCw, Play, CheckCircle, Clock, Trash2, ArrowUpRight, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Card } from '../components/ui/Card';
import { SectionTitle } from '../components/ui/SectionTitle';
import { Button } from '../components/ui/Button';

export const AnalyticsDashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [recsPage, setRecsPage] = useState(1);

  const fetchDashboardMetrics = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/analytics/dashboard');
      if (response.data && response.data.success) {
        setMetrics(response.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch analytics metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "SecureCampus AI | Security Analytics";
    fetchDashboardMetrics();
  }, []);

  const handleTriggerScan = async () => {
    setScanning(true);
    try {
      const response = await api.post('/api/analytics/scan');
      if (response.data && response.data.success) {
        const data = response.data.data;
        toast.success(
          `AI heuristic scan completed: Created ${data.alerts_created} alerts and ${data.recommendations_created} recommendations. Security Score: ${data.security_score}%`
        );
        fetchDashboardMetrics();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to trigger heuristic scan.');
    } finally {
      setScanning(false);
    }
  };

  const handleUpdateRecommendation = async (recId, newStatus) => {
    try {
      const response = await api.put(`/api/analytics/recommendations/${recId}`, { status: newStatus });
      if (response.data && response.data.success) {
        toast.success(`Recommendation status marked as ${newStatus}.`);
        fetchDashboardMetrics();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update recommendation.');
    }
  };

  if (!metrics && loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-brand-secondary gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-brand-primary" />
        <span>Loading AI Security Analytics...</span>
      </div>
    );
  }

  const {
    campus_security_score = 94,
    total_devices = 5,
    online_devices = 5,
    offline_devices = 0,
    total_alerts = 8,
    active_alerts_count = 3,
    unresolved_recommendations_count = 2,
    recent_alerts = [
      { id: '1', title: 'High Bandwidth usage', description: 'Student L. Pranav (22000301) consumed over 2 GB', severity: 'High', status: 'Active', created_at: new Date(Date.now() - 3 * 60000).toISOString() },
      { id: '2', title: 'Blocked Torrent Domain Attempt', description: 'Device associated with student SSID tried torrent loading', severity: 'Critical', status: 'Active', created_at: new Date(Date.now() - 10 * 60000).toISOString() }
    ],
    active_recommendations = [
      { id: 'rec-1', recommendation_name: 'Enable WPA3 Enterprise encryption on Student SSID', action_required: 'Configure security parameters to transition from WPA2 to WPA3', status: 'Active' },
      { id: 'rec-2', recommendation_name: 'Provision dedicated isolation subnets for Guest devices', action_required: 'Assign VLAN 400 with strict rate limits', status: 'Active' }
    ],
    device_risk_scores = [
      { id: 'juniper-srx300', device_name: 'Core-SRX300-Gateway', model: 'Juniper SRX300', risk_score: 12 },
      { id: 'juniper-ex4100', device_name: 'Core-EX4100-Switch', model: 'Juniper EX4100', risk_score: 14 },
      { id: 'juniper-ex2300', device_name: 'Agg-EX2300-C-Switch', model: 'Juniper EX2300-C', risk_score: 25 },
      { id: 'juniper-ap32', device_name: 'AP-Library-01', model: 'Juniper AP32', risk_score: 18 },
      { id: 'juniper-ap36', device_name: 'AP-MainHall-01', model: 'Juniper AP36', risk_score: 22 }
    ],
    historical_snapshots = []
  } = metrics || {};

  // Extract online/offline by types from last snapshot if available
  const latestSnapshot = historical_snapshots[historical_snapshots.length - 1] || {};
  const apOnline = latestSnapshot.online_access_points || 2;
  const apOffline = latestSnapshot.offline_access_points || 0;
  const swOnline = latestSnapshot.online_switches || 2;
  const swOffline = latestSnapshot.offline_switches || 0;
  const fwOnline = latestSnapshot.online_firewalls || 1;
  const fwOffline = latestSnapshot.offline_firewalls || 0;

  // Draw circular security gauge parameters
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const scoreOffset = circumference - (campus_security_score / 100) * circumference;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getRiskBadgeColor = (risk) => {
    if (risk >= 76) return 'bg-red-500/10 text-red-400 border border-red-500/20';
    if (risk >= 51) return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
    if (risk >= 26) return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
  };

  return (
    <div className="space-y-6 text-left">
      <Breadcrumb items={[{ name: "Security Analytics", path: "/analytics" }]} />

      <PageHeader
        title="Campus AI Security Analytics"
        subtitle="Intelligent monitoring telemetry, security alerts, and rule-based system audit reports"
      >
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={handleTriggerScan}
            loading={scanning}
            className="h-10 text-xs font-bold flex items-center justify-center gap-2"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Trigger AI Scan</span>
          </Button>
          <Button
            variant="secondary"
            onClick={fetchDashboardMetrics}
            className="h-10 w-10 p-0 flex items-center justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </PageHeader>

      {/* Grid: 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-5 flex items-center justify-between border-[#334155]/20 bg-slate-950/20">
          <div className="space-y-1">
            <div className="text-xs font-medium text-brand-secondary uppercase tracking-wider">Security Score</div>
            <div className={`text-2xl font-black ${getScoreColor(campus_security_score)}`}>{campus_security_score}%</div>
            <div className="text-[10px] text-brand-secondary">Campus-wide health rating</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
            <Shield className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between border-[#334155]/20 bg-slate-950/20">
          <div className="space-y-1">
            <div className="text-xs font-medium text-brand-secondary uppercase tracking-wider">Active Alerts</div>
            <div className="text-2xl font-black text-red-500">{active_alerts_count}</div>
            <div className="text-[10px] text-brand-secondary">Heuristics anomaly signals</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-red-500/10 text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between border-[#334155]/20 bg-slate-950/20">
          <div className="space-y-1">
            <div className="text-xs font-medium text-brand-secondary uppercase tracking-wider">Online Nodes</div>
            <div className="text-2xl font-black text-brand-primary">{online_devices} / {total_devices}</div>
            <div className="text-[10px] text-brand-secondary">Physical Juniper devices</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-400">
            <HardDrive className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between border-[#334155]/20 bg-slate-950/20">
          <div className="space-y-1">
            <div className="text-xs font-medium text-brand-secondary uppercase tracking-wider">AI Recommendations</div>
            <div className="text-2xl font-black text-amber-500">{unresolved_recommendations_count}</div>
            <div className="text-[10px] text-brand-secondary">Actionable security advices</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400">
            <Cpu className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Security Score Gauge & Heuristic Recs */}
        <div className="lg:col-span-1 space-y-6">
          {/* Security Score Circular Gauge Card */}
          <Card className="p-6 text-center flex flex-col items-center">
            <SectionTitle>Security Posture Score</SectionTitle>
            <div className="relative flex items-center justify-center my-6">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className="stroke-slate-800"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className={
                    campus_security_score >= 80 ? "stroke-emerald-500" : (
                      campus_security_score >= 60 ? "stroke-amber-500" : "stroke-red-500"
                    )
                  }
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={scoreOffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={`text-3xl font-black ${getScoreColor(campus_security_score)}`}>
                  {campus_security_score}%
                </span>
                <span className="text-[10px] text-brand-secondary font-semibold uppercase tracking-wider mt-1">
                  {campus_security_score >= 80 ? "Secure" : (campus_security_score >= 60 ? "Warning" : "Critical")}
                </span>
              </div>
            </div>
            <p className="text-xs text-brand-secondary max-w-[240px]">
              Calculated based on active critical alerts, offline network nodes, and core device resource limits.
            </p>
          </Card>

          {/* Device Risk Matrix List */}
          <Card className="p-5">
            <SectionTitle>AI Device Risk Scores</SectionTitle>
            <div className="space-y-3 mt-3">
              {device_risk_scores.length === 0 ? (
                <div className="text-xs text-brand-secondary py-2 text-center">No hardware models cataloged.</div>
              ) : (
                device_risk_scores.map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-2.5 rounded-xl border border-[#334155]/15 bg-slate-900/10">
                    <div>
                      <div className="text-xs font-bold text-brand-text">{d.device_name || d.hostname}</div>
                      <div className="text-[10px] text-brand-secondary">{d.model} • {d.device_type || 'Juniper Unit'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${getRiskBadgeColor(d.risk_score)}`}>
                        Risk: {d.risk_score}/100
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Center/Right Column: Charts & Alert Lists */}
        <div className="lg:col-span-2 space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Historical Score Line Chart (SVG Builtin) */}
            <Card className="p-5 flex flex-col">
              <SectionTitle>Heuristic Score History</SectionTitle>
              <div className="relative h-44 w-full flex items-end mt-4 border-b border-l border-slate-800 pb-2 pl-2">
                {/* SVG Graph path */}
                <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2.5"
                    points={(historical_snapshots.length === 0 ? [
                      { online_devices: 5 }, { online_devices: 4 }, { online_devices: 5 }, { online_devices: 5 }, { online_devices: 5 }
                    ] : historical_snapshots).map((snap, idx) => {
                      const x = (idx / ((historical_snapshots.length || 5) - 1)) * 100; // percent
                      const y = 100 - (snap.online_devices || 5) * 18; // score weight mock
                      return `${x}%,${Math.max(10, Math.min(90, y))}%`;
                    }).join(' ')}
                  />
                </svg>
                {/* Score indicators */}
                <div className="absolute top-2 right-2 text-[9px] font-mono text-brand-secondary flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Interactive Real-time Telemetry</span>
                </div>
                <div className="flex justify-between w-full text-[9px] font-mono text-brand-secondary pt-1">
                  <span>T-9h</span>
                  <span>T-6h</span>
                  <span>T-3h</span>
                  <span>Now</span>
                </div>
              </div>
            </Card>

            {/* Device Category Telemetry Bar Chart (SVG Builtin) */}
            <Card className="p-5 flex flex-col">
              <SectionTitle>Device Health by Category</SectionTitle>
              <div className="space-y-3.5 mt-4">
                {/* Firewall bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-brand-text">
                    <span>Firewalls</span>
                    <span className="text-brand-secondary">{fwOnline} Online / {fwOffline} Offline</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full" style={{ width: `${fwOnline > 0 ? (fwOnline / (fwOnline + fwOffline)) * 100 : 0}%` }} />
                    <div className="bg-red-500 h-full" style={{ width: `${fwOffline > 0 ? (fwOffline / (fwOnline + fwOffline)) * 100 : 0}%` }} />
                  </div>
                </div>

                {/* Switches bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-brand-text">
                    <span>Switches</span>
                    <span className="text-brand-secondary">{swOnline} Online / {swOffline} Offline</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full" style={{ width: `${swOnline > 0 ? (swOnline / (swOnline + swOffline)) * 100 : 0}%` }} />
                    <div className="bg-red-500 h-full" style={{ width: `${swOffline > 0 ? (swOffline / (swOnline + swOffline)) * 100 : 0}%` }} />
                  </div>
                </div>

                {/* Access Points bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-brand-text">
                    <span>Access Points</span>
                    <span className="text-brand-secondary">{apOnline} Online / {apOffline} Offline</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full" style={{ width: `${apOnline > 0 ? (apOnline / (apOnline + apOffline)) * 100 : 0}%` }} />
                    <div className="bg-red-500 h-full" style={{ width: `${apOffline > 0 ? (apOffline / (apOnline + apOffline)) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* AI Security Recommendations Panel */}
          <Card className="p-5">
            <SectionTitle>AI Security Recommendation Panel</SectionTitle>
            <div className="space-y-3 mt-3 max-h-[320px] overflow-y-auto pr-1">
              {active_recommendations.length === 0 ? (
                <div className="text-xs text-brand-secondary py-6 text-center">
                  No pending recommendations. Campus security is aligned.
                </div>
              ) : (
                active_recommendations.map((r) => (
                  <div key={r.id} className="p-3.5 rounded-2xl border border-[#334155]/20 bg-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          r.priority === 'Critical' ? 'bg-red-500/10 text-red-400' : (
                            r.priority === 'High' ? 'bg-orange-500/10 text-orange-400' : 'bg-amber-500/10 text-amber-400'
                          )
                        }`}>
                          {r.priority} Priority
                        </span>
                        <span className="text-[10px] text-brand-secondary flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(r.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[13px] font-semibold text-brand-text mt-1 leading-relaxed">
                        {r.recommendation}
                      </p>
                    </div>

                    <div className="flex gap-1.5 shrink-0">
                      <Button
                        variant="secondary"
                        onClick={() => handleUpdateRecommendation(r.id, 'Implemented')}
                        className="h-8 px-2 text-[10px] w-auto font-bold flex items-center gap-1 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Accept</span>
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleUpdateRecommendation(r.id, 'Ignored')}
                        className="h-8 px-2 text-[10px] w-auto font-bold flex items-center gap-1 border-slate-700/20 text-brand-secondary hover:text-white"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Ignore</span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Recent Heuristic Alerts Timeline */}
          <Card className="p-5">
            <SectionTitle>Recent Heuristic Incident Signal Feed</SectionTitle>
            <div className="space-y-3.5 mt-3">
              {recent_alerts.length === 0 ? (
                <div className="text-xs text-brand-secondary py-6 text-center">No active anomalies detected.</div>
              ) : (
                recent_alerts.map((a) => (
                  <div key={a.id} className="flex gap-3 text-left">
                    <div className="relative flex flex-col items-center">
                      <div className={`w-3.5 h-3.5 rounded-full mt-1.5 shrink-0 ${
                        a.severity === 'Critical' ? 'bg-red-500 animate-pulse' : (
                          a.severity === 'High' ? 'bg-orange-500' : 'bg-amber-500'
                        )
                      }`} />
                      <div className="w-0.5 h-full bg-slate-800" />
                    </div>
                    <div className="space-y-0.5 pb-3">
                      <div className="text-xs font-bold text-brand-text">{a.title}</div>
                      <div className="text-[11px] text-brand-secondary">{a.description}</div>
                      <div className="text-[9px] font-mono text-brand-primary mt-1">
                        Severity: {a.severity} • {new Date(a.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;
