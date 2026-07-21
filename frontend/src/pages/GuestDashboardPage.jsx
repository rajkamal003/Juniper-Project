// frontend/src/pages/GuestDashboardPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Network, Compass, ShieldAlert } from 'lucide-react';
import { DashboardCard, QuickActionCard, EmptyWidget } from '../components/dashboard/DashboardComponents';

export const GuestDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = "SecureCampus AI | Guest Dashboard";
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-left select-none">
        <h1 className="text-xl font-extrabold text-brand-text tracking-tight">Guest Access Portal</h1>
        <p className="text-xs text-brand-secondary mt-1">Smart Campus Visitor Access Telemetry</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Identity details & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <DashboardCard title="Guest Information" subtitle="Active visitor clearance record">
            <div className="space-y-4 pt-1 text-xs select-none">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/30 border border-[#334155]/20">
                <div className="w-10 h-10 rounded-lg bg-slate-700/10 text-slate-400 flex items-center justify-center font-bold text-sm shrink-0">
                  {user?.fullname?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 text-left">
                  <p className="font-bold text-brand-text truncate">{user?.fullname}</p>
                  <p className="text-[10px] text-brand-secondary truncate">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-brand-secondary">Purpose of Visit</span>
                  <span className="font-semibold text-brand-text truncate max-w-[150px]">{user?.purpose || 'General Visit'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-secondary">Host Department</span>
                  <span className="font-semibold text-brand-text">{user?.department || 'Not Mapped'}</span>
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

        {/* Right Column: Placeholders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardCard title="Access Expiry" subtitle="Lease timeframe countdown">
              <div className="flex flex-col items-center justify-center text-center py-6 select-none bg-slate-950/10 border border-dashed border-[#334155]/40 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-brand-warning flex items-center justify-center mb-2 border border-amber-500/20">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <h4 className="text-[11px] font-semibold text-brand-text">Duration Limit Mapped</h4>
                <p className="text-[9px] text-brand-secondary font-mono uppercase tracking-wider mt-1">
                  Active Limit: {user?.duration || '10 Hours'}
                </p>
              </div>
            </DashboardCard>

            <DashboardCard title="Network Access Status" subtitle="Smart campus Wi-Fi routing">
              <div className="flex flex-col items-center justify-center text-center py-6 select-none bg-slate-950/10 border border-dashed border-[#334155]/40 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-brand-primary flex items-center justify-center mb-2 border border-blue-500/20">
                  <Network className="w-4.5 h-4.5 animate-pulse" />
                </div>
                <h4 className="text-[11px] font-semibold text-brand-text">Active Network Link</h4>
                <p className="text-[9px] text-brand-secondary font-semibold uppercase tracking-wider mt-1">
                  Guest Wi-Fi Profile Connected
                </p>
              </div>
            </DashboardCard>
          </div>

          <DashboardCard title="Visitor Access Details" subtitle="Stage 5 logging and locations telemetry">
            <EmptyWidget 
              title="Location Telemetry Offline" 
              description="Detailed network access location logs, logs audits, and active packet streams will be implemented in Stage 5." 
            />
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default GuestDashboardPage;
