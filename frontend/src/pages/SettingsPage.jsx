// frontend/src/pages/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { Settings, User, Sliders, Shield, Users, Clock, Database, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Card } from '../components/ui/Card';
import { SectionTitle } from '../components/ui/SectionTitle';
import { Button } from '../components/ui/Button';

export const SettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [config, setConfig] = useState({
    account_approval_mode: 'AUTO',
    theme: 'dark',
    maintenance_mode: false,
    allow_guest_registration: true,
    exam_mode: false,
    otp_expiry: 300,
    session_timeout: 900
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/settings/config');
      if (response.data && response.data.success) {
        setConfig(response.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load system settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "SecureCampus AI | Settings";
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const response = await api.put('/api/settings/config', config);
      if (response.data && response.data.success) {
        toast.success(response.data.message || 'System settings updated successfully.');
        setConfig(response.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update system settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <Breadcrumb items={[{ name: "Settings", path: "/settings" }]} />

      <PageHeader
        title="Global Configuration Settings"
        subtitle="Manage campus network configurations, user session parameters, security presets, and platform layouts"
      >
        <div className="flex gap-2">
          <button
            onClick={fetchSettings}
            disabled={loading}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border-2 border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-800 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="Refresh Settings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Button
            variant="primary"
            onClick={handleSaveSettings}
            loading={saving}
            className="h-10 px-4 text-xs font-bold flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </Button>
        </div>
      </PageHeader>

      <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-xs text-left select-none mb-6">
        <p className="font-semibold">Enterprise Live Config Mode</p>
        <p className="mt-0.5 opacity-80">All configuration parameters below persist live across session validation rules and registration controllers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profile Settings Card */}
        <Card className="p-5 select-none text-left space-y-4">
          <div className="flex items-center gap-2 text-brand-primary">
            <User className="w-4 h-4" />
            <SectionTitle className="mb-0 pb-0 border-b-0">Profile Configurations</SectionTitle>
          </div>
          <div className="space-y-3 pt-2 text-xs opacity-80">
            <div>
              <label className="block text-[9px] font-bold text-brand-secondary uppercase tracking-wider mb-1">Full Operator Name</label>
              <input type="text" disabled value="Super Admin" className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg cursor-not-allowed outline-none text-slate-800" />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-brand-secondary uppercase tracking-wider mb-1">Associated Contact Email</label>
              <input type="email" disabled value="admin@securecampus.com" className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg cursor-not-allowed outline-none text-slate-800" />
            </div>
          </div>
        </Card>

        {/* Appearance Options Card */}
        <Card className="p-5 select-none text-left space-y-4">
          <div className="flex items-center gap-2 text-brand-primary">
            <Sliders className="w-4 h-4" />
            <SectionTitle className="mb-0 pb-0 border-b-0">Appearance & Maintenance</SectionTitle>
          </div>
          <div className="space-y-4 pt-2 text-xs">
            <div>
              <label className="block text-[9px] font-bold text-brand-secondary uppercase tracking-wider mb-1">Theme Mode</label>
              <select
                value={config.theme}
                onChange={(e) => setConfig({ ...config, theme: e.target.value })}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:border-blue-400"
              >
                <option value="dark">Dark Theme</option>
                <option value="light">Light Theme</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-brand-text">System Maintenance Mode</span>
              <input
                type="checkbox"
                checked={config.maintenance_mode}
                onChange={(e) => setConfig({ ...config, maintenance_mode: e.target.checked })}
                className="w-4 h-4 rounded accent-brand-primary cursor-pointer"
              />
            </div>
          </div>
        </Card>

        {/* Security Parameters Card */}
        <Card className="p-5 select-none text-left space-y-4">
          <div className="flex items-center gap-2 text-brand-primary">
            <Shield className="w-4 h-4" />
            <SectionTitle className="mb-0 pb-0 border-b-0">Security Guidelines</SectionTitle>
          </div>
          <div className="space-y-4 pt-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium text-brand-text">Campus Exam Enforcement Mode</span>
              <input
                type="checkbox"
                checked={config.exam_mode}
                onChange={(e) => setConfig({ ...config, exam_mode: e.target.checked })}
                className="w-4 h-4 rounded accent-brand-primary cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-brand-secondary uppercase tracking-wider mb-1">OTP Expiry (Seconds)</label>
              <input
                type="number"
                value={config.otp_expiry}
                onChange={(e) => setConfig({ ...config, otp_expiry: parseInt(e.target.value, 10) || 300 })}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:border-blue-400"
              />
            </div>
          </div>
        </Card>

        {/* Approval Workflow Rules Card */}
        <Card className="p-5 select-none text-left space-y-4">
          <div className="flex items-center gap-2 text-brand-primary">
            <Users className="w-4 h-4" />
            <SectionTitle className="mb-0 pb-0 border-b-0">Approval Workflows</SectionTitle>
          </div>
          <div className="space-y-4 pt-2 text-xs">
            <div>
              <label className="block text-[9px] font-bold text-brand-secondary uppercase tracking-wider mb-1">Account Approval Strategy</label>
              <select
                value={config.account_approval_mode}
                onChange={(e) => setConfig({ ...config, account_approval_mode: e.target.value })}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:border-blue-400"
              >
                <option value="AUTO">AUTO (Auto-Approve New Accounts)</option>
                <option value="ADMIN">ADMIN (Require Manual Verification)</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-brand-text">Allow Public Guest Registration</span>
              <input
                type="checkbox"
                checked={config.allow_guest_registration}
                onChange={(e) => setConfig({ ...config, allow_guest_registration: e.target.checked })}
                className="w-4 h-4 rounded accent-brand-primary cursor-pointer"
              />
            </div>
          </div>
        </Card>

        {/* Session Timeout configurations Card */}
        <Card className="p-5 select-none text-left space-y-4">
          <div className="flex items-center gap-2 text-brand-primary">
            <Clock className="w-4 h-4" />
            <SectionTitle className="mb-0 pb-0 border-b-0">Session Management</SectionTitle>
          </div>
          <div className="space-y-4 pt-2 text-xs">
            <div>
              <label className="block text-[9px] font-bold text-brand-secondary uppercase tracking-wider mb-1">Session Inactivity Timeout (Seconds)</label>
              <input
                type="number"
                value={config.session_timeout}
                onChange={(e) => setConfig({ ...config, session_timeout: parseInt(e.target.value, 10) || 900 })}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:border-blue-400"
              />
            </div>
          </div>
        </Card>

        {/* System Settings Card */}
        <Card className="p-5 select-none text-left space-y-4">
          <div className="flex items-center gap-2 text-brand-primary">
            <Database className="w-4 h-4" />
            <SectionTitle className="mb-0 pb-0 border-b-0">System Operations</SectionTitle>
          </div>
          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-brand-text font-medium">FastAPI REST Services</span>
              <span className="font-semibold text-brand-success font-mono uppercase tracking-wider">ONLINE</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-brand-text font-medium">Juniper Hardware Integration</span>
              <span className="font-semibold text-amber-400 font-mono uppercase tracking-wider">STAGE 6 DEFERRED</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
