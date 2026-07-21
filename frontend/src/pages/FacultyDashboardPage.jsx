// frontend/src/pages/FacultyDashboardPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Shield, FileText, UserCheck, Calendar } from 'lucide-react';
import { DashboardCard, QuickActionCard, EmptyWidget } from '../components/dashboard/DashboardComponents';

export const FacultyDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = "SecureCampus AI | Faculty Dashboard";
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-left select-none">
        <h1 className="text-xl font-extrabold text-brand-text tracking-tight">Faculty Console</h1>
        <p className="text-xs text-brand-secondary mt-1">Smart Campus Academic Oversight & Security Console</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Mapped Profile and Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Faculty Identity Details */}
          <DashboardCard title="My Faculty Profile" subtitle="Active academic identity records">
            <div className="space-y-4 pt-1 text-xs select-none">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/30 border border-[#334155]/20">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-brand-primary flex items-center justify-center font-bold text-sm shrink-0">
                  {user?.fullname?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 text-left">
                  <p className="font-bold text-brand-text truncate">{user?.fullname}</p>
                  <p className="text-[10px] text-brand-secondary truncate">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-brand-secondary">Employee ID</span>
                  <span className="font-mono font-bold text-brand-text">{user?.employee_id || 'Not Mapped'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-secondary">Department</span>
                  <span className="font-semibold text-brand-text">{user?.department || 'Not Configured'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-secondary">Phone</span>
                  <span className="font-semibold text-brand-text">{user?.phone}</span>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Quick links */}
          <DashboardCard title="Faculty Actions" subtitle="Shortcuts for classroom management">
            <div className="space-y-3 pt-1">
              <QuickActionCard
                title="Edit Identity Profile"
                description="Update security numbers and picture details"
                onClick={() => navigate('/profile')}
              />
              <QuickActionCard
                title="Assigned Students List"
                description="View mapping logs of associated students"
                disabled
                badge="Stage 5"
              />
            </div>
          </DashboardCard>
        </div>

        {/* Right Column: Placeholders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardCard title="Attendance Registry" subtitle="Automated smart card logs placeholder">
              <EmptyWidget 
                title="Attendance Logging Offline" 
                description="Implemented in Stage 5 (Network Monitoring & Device Management)" 
              />
            </DashboardCard>
            <DashboardCard title="Class Schedules" subtitle="Upcoming classroom reservations">
              <div className="flex flex-col items-center justify-center text-center py-6 select-none bg-slate-950/10 border border-dashed border-[#334155]/40 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-brand-primary flex items-center justify-center mb-2 border border-blue-500/20">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <h4 className="text-[11px] font-semibold text-brand-text">0 Active Schedules Today</h4>
                <p className="text-[9px] text-brand-secondary font-semibold uppercase tracking-wider mt-1">
                  Seeding active class timelines
                </p>
              </div>
            </DashboardCard>
          </div>

          <DashboardCard title="Assigned Students Directory" subtitle="Class roster list preview">
            <EmptyWidget 
              title="Roster Database Lock" 
              description="Roster tables and student mapping logs will be populated in Stage 5." 
            />
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboardPage;
