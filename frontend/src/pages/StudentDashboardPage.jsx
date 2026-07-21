// frontend/src/pages/StudentDashboardPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserCheck, Shield, Key, Network, Award, BookOpen } from 'lucide-react';
import { DashboardCard, QuickActionCard, EmptyWidget } from '../components/dashboard/DashboardComponents';

export const StudentDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = "SecureCampus AI | Student Dashboard";
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-left select-none">
        <h1 className="text-xl font-extrabold text-brand-text tracking-tight">Student Dashboard</h1>
        <p className="text-xs text-brand-secondary mt-1">Smart Campus Portal & Access Management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Identity Card */}
        <div className="lg:col-span-1 space-y-6">
          <DashboardCard title="Student Profile" subtitle="Active registration records">
            <div className="space-y-4 pt-1 text-xs select-none">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/30 border border-[#334155]/20">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-brand-success flex items-center justify-center font-bold text-sm shrink-0">
                  {user?.fullname?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 text-left">
                  <p className="font-bold text-brand-text truncate">{user?.fullname}</p>
                  <p className="text-[10px] text-brand-secondary truncate">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-brand-secondary">Roll Number</span>
                  <span className="font-mono font-bold text-brand-text">{user?.roll_number || 'Not Mapped'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-secondary">Department</span>
                  <span className="font-semibold text-brand-text">{user?.department || 'Not Configured'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-secondary">Academic Year</span>
                  <span className="font-semibold text-brand-text">4th Year (B.Tech)</span>
                </div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Student Actions" subtitle="Portal security tools">
            <div className="space-y-3 pt-1">
              <QuickActionCard
                title="Profile Settings"
                description="Manage active devices and change password"
                onClick={() => navigate('/profile')}
              />
              <QuickActionCard
                title="Registered Courses"
                description="View assigned curriculum schedules"
                disabled
                badge="Stage 5"
              />
            </div>
          </DashboardCard>
        </div>

        {/* Right Col: Access Telemetry */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardCard title="Campus Access Status" subtitle="Smart portal entry checks">
              <div className="flex flex-col items-center justify-center text-center py-6 select-none bg-slate-950/10 border border-dashed border-[#334155]/40 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-brand-success flex items-center justify-center mb-2 border border-emerald-500/20">
                  <UserCheck className="w-4.5 h-4.5" />
                </div>
                <h4 className="text-[11px] font-semibold text-brand-text">Authentication Valid</h4>
                <p className="text-[9px] text-brand-secondary font-semibold uppercase tracking-wider mt-1">
                  Active Network Access
                </p>
              </div>
            </DashboardCard>

            <DashboardCard title="Exam Mode Panel" subtitle="Security lock presets">
              <EmptyWidget 
                title="Exam Mode Inactive" 
                description="Scheduled for Stage 8 (Firewall Automation & Exam Mode)" 
              />
            </DashboardCard>
          </div>

          <DashboardCard title="Curriculum Overview" subtitle="Registered course details">
            <EmptyWidget 
              title="Course Database Lock" 
              description="Course lists and classroom mappings will be populated in Stage 5." 
            />
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;
