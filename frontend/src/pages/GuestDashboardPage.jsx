// frontend/src/pages/GuestDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Network, Compass, ShieldAlert, RefreshCw, Key } from 'lucide-react';
import { DashboardCard, QuickActionCard, EmptyWidget } from '../components/dashboard/DashboardComponents';
import api from '../services/api';
import { toast } from 'sonner';
import { AppUsageGrid } from '../components/dashboard/AppUsageGrid';
import { generateAppUsage } from '../utils/appDataGenerator';

export const GuestDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appUsage, setAppUsage] = useState([]);

  const fetchGuestAccess = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/guest/access');
      if (response.data?.success) {
        setAccess(response.data.data);
        setAppUsage(generateAppUsage('Guest'));
      } else {
        setError('No active temporary Wi-Fi access pass found.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Guest Wi-Fi credentials lease offline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "SecureCampus AI | Guest Dashboard";
    fetchGuestAccess();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    return new Date(dateStr).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = access ? new Date(access.expires_at) < new Date() : false;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none text-left">
        <div>
          <h1 className="text-xl font-extrabold text-brand-text tracking-tight">Guest Access Portal</h1>
          <p className="text-xs text-brand-secondary mt-1">Smart Campus Visitor Access Telemetry</p>
        </div>
        <button
          onClick={fetchGuestAccess}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 transition-colors text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh lease</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        {/* Left Column: Identity details & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <DashboardCard title="Guest Information" subtitle="Active visitor clearance record">
            <div className="space-y-4 pt-1 text-xs select-none">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-lg bg-slate-200/50 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0">
                  {user?.fullname?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 text-left">
                  <p className="font-bold text-slate-800 truncate">{user?.fullname}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-brand-secondary">Purpose of Visit</span>
                  <span className="font-semibold text-brand-text truncate max-w-[150px]">{user?.purpose || 'General Visit'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-secondary">Role Assignment</span>
                  <span className="font-semibold text-brand-text">Temporary Guest</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-secondary">Clearance Ticket</span>
                  <span className="font-mono text-brand-text">GUEST_TEMP</span>
                </div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Guest Actions" subtitle="Account controls">
            <div className="space-y-3 pt-1">
              <QuickActionCard
                title="Edit Account Details"
                description="Manage active browser session keys and password"
                onClick={() => navigate('/profile')}
              />
            </div>
          </DashboardCard>
        </div>

        {/* Right Column: Telemetry */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="p-12 text-center border border-slate-200 bg-white rounded-2xl flex flex-col items-center justify-center gap-3 shadow-xs">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-xs text-slate-500">Retrieving temporary guest network lease...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center border border-yellow-200 bg-yellow-50 rounded-2xl flex flex-col items-center justify-center gap-3 select-none">
              <ShieldAlert className="w-8 h-8 text-amber-600" />
              <h4 className="text-xs font-bold text-slate-800">No Active Lease Pass</h4>
              <p className="text-[11px] text-slate-600 max-w-sm">{error}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardCard title="Access Expiry" subtitle="Lease timeframe countdown">
                  <div className="flex flex-col items-center justify-center text-center py-6 select-none bg-slate-50 border border-slate-200 rounded-xl px-4">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2 border border-amber-200">
                      <Clock className="w-4.5 h-4.5" />
                    </div>
                    <h4 className="text-[11px] font-semibold text-slate-800">
                      {isExpired ? 'Lease Expired' : 'Lease Active'}
                    </h4>
                    <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider mt-1">
                      Expires: {formatDate(access.expires_at)}
                    </p>
                  </div>
                </DashboardCard>

                <DashboardCard title="Network Access Status" subtitle="Smart campus Wi-Fi routing">
                  <div className="flex flex-col items-center justify-center text-center py-6 select-none bg-slate-50 border border-slate-200 rounded-xl px-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2 border border-blue-200">
                      <Network className="w-4.5 h-4.5 animate-pulse" />
                    </div>
                    <h4 className="text-[11px] font-semibold text-slate-800">SSID: {access.ssid}</h4>
                    <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-1">
                      VLAN Assignment: {access.vlan}
                    </p>
                  </div>
                </DashboardCard>
              </div>

              <DashboardCard title="Visitor Access Details" subtitle="Guest Wi-Fi logins credentials">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Username</span>
                    <p className="font-mono font-bold text-slate-800 mt-1 text-sm">{access.username}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Temporary Password</span>
                    <p className="font-mono font-bold text-slate-800 mt-1 text-sm">
                      {access.temporary_password || '•••••••• (Encrypted)'}
                    </p>
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard title="Application & Web Subnet Consumption" subtitle="Temporary Guest Session Traffic">
                <AppUsageGrid apps={appUsage} />
              </DashboardCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestDashboardPage;
