// frontend/src/pages/ParentDashboardPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Heart, User, CheckCircle2 } from 'lucide-react';
import { DashboardCard, QuickActionCard, EmptyWidget } from '../components/dashboard/DashboardComponents';

export const ParentDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = "SecureCampus AI | Parent Dashboard";
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-left select-none">
        <h1 className="text-xl font-extrabold text-brand-text tracking-tight">Parent Visitor Portal</h1>
        <p className="text-xs text-brand-secondary mt-1">Smart Campus Security Verification Panel</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Identity details & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <DashboardCard title="Parent Identity" subtitle="Active visitor clearance record">
            <div className="space-y-4 pt-1 text-xs select-none">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/30 border border-[#334155]/20">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm shrink-0">
                  {user?.fullname?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 text-left">
                  <p className="font-bold text-brand-text truncate">{user?.fullname}</p>
                  <p className="text-[10px] text-brand-secondary truncate">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-brand-secondary">Linked Student Roll</span>
                  <span className="font-mono font-bold text-brand-text">{user?.parent_student_roll || 'Not Mapped'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-secondary">Relationship</span>
                  <span className="font-semibold text-brand-text">{user?.relationship || 'Not Configured'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-secondary">Registration Date</span>
                  <span className="font-mono text-brand-text">20-07-2026</span>
                </div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Portal Actions" subtitle="Oversight options">
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
            <DashboardCard title="Student Information" subtitle="Associated student clearance status">
              <div className="flex flex-col items-center justify-center text-center py-6 select-none bg-slate-950/10 border border-dashed border-[#334155]/40 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2 border border-purple-500/20">
                  <User className="w-4.5 h-4.5" />
                </div>
                <h4 className="text-[11px] font-semibold text-brand-text">Student Roll Linked</h4>
                <p className="text-[9px] text-brand-secondary font-semibold uppercase tracking-wider mt-1">
                  Seeded ID Match: {user?.parent_student_roll || 'None'}
                </p>
              </div>
            </DashboardCard>

            <DashboardCard title="Visitor Access Cleared" subtitle="Campus portal entry gates">
              <div className="flex flex-col items-center justify-center text-center py-6 select-none bg-slate-950/10 border border-dashed border-[#334155]/40 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-brand-success flex items-center justify-center mb-2 border border-emerald-500/20">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <h4 className="text-[11px] font-semibold text-brand-text">Access Authorized</h4>
                <p className="text-[9px] text-brand-secondary font-semibold uppercase tracking-wider mt-1">
                  Parent Clearance Verified
                </p>
              </div>
            </DashboardCard>
          </div>

          <DashboardCard title="Linked Child Activity Logs" subtitle="Attendance & Threat Logs placeholder">
            <EmptyWidget 
              title="Child Records Database Lock" 
              description="Detailed student tracking logs, logs audits, and class attendance will be implemented in Stage 5." 
            />
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboardPage;
