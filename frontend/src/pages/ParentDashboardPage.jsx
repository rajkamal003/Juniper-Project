// frontend/src/pages/ParentDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, RefreshCw, MapPin, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { DashboardCard, QuickActionCard } from '../components/dashboard/DashboardComponents';
import api from '../services/api';

export const ParentDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [studentStatus, setStudentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudentStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/parent/student-status');
      if (response.data?.success) {
        setStudentStatus(response.data.data);
      } else {
        setError(response.data?.message || 'Failed to fetch student status');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Could not connect to student status services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "SecureCampus AI | Parent Dashboard";
    fetchStudentStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none text-left">
        <div>
          <h1 className="text-xl font-extrabold text-brand-text tracking-tight">Parent Visitor Portal</h1>
          <p className="text-xs text-brand-secondary mt-1">Smart Campus Security Verification Panel</p>
        </div>
        <button
          onClick={fetchStudentStatus}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#334155] bg-slate-900/50 hover:bg-slate-800 text-brand-secondary hover:text-brand-text transition-colors text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
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
                  <span className="font-semibold text-brand-text">{user?.relationship || 'Parent'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-secondary">Registration Status</span>
                  <span className="font-semibold text-brand-success">Authorized</span>
                </div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Portal Actions" subtitle="Oversight options">
            <div className="space-y-3 pt-1">
              <QuickActionCard
                title="Campus Pass Requests"
                description="Submit visitor permits for entry gates"
                onClick={() => navigate('/visitor-requests')}
              />
              <QuickActionCard
                title="Edit Account Details"
                description="Manage active browser session keys and password"
                onClick={() => navigate('/profile')}
              />
            </div>
          </DashboardCard>
        </div>

        {/* Right Column: Student telemetry or logs */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="p-12 text-center border border-[#334155]/60 bg-slate-950/20 rounded-2xl flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
              <p className="text-xs text-brand-secondary">Synchronizing linked student telemetry...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center border border-red-500/20 bg-red-950/10 rounded-2xl flex flex-col items-center justify-center gap-3 select-none">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <h4 className="text-xs font-bold text-brand-text">Student Status Offline</h4>
              <p className="text-[11px] text-brand-secondary max-w-sm">{error}</p>
              <button
                onClick={fetchStudentStatus}
                className="mt-2 px-4 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-xs font-bold"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardCard title="Student Information" subtitle="Associated student clearance status">
                  <div className="flex flex-col items-center justify-center text-center py-6 select-none bg-slate-950/10 border border-[#334155]/30 rounded-xl px-4">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2 border border-purple-500/20">
                      <User className="w-4.5 h-4.5" />
                    </div>
                    <h4 className="text-[12px] font-bold text-brand-text">Roll: {user?.parent_student_roll}</h4>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1.5 justify-center text-[10px] text-brand-secondary">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Attendance:</span>
                        <span className={`font-semibold ${studentStatus?.attendance_status === 'Present' ? 'text-brand-success' : 'text-yellow-400'}`}>
                          {studentStatus?.attendance_status || 'Absent'}
                        </span>
                      </div>
                    </div>
                  </div>
                </DashboardCard>

                <DashboardCard title="Real-Time Tracker" subtitle="Gate check-ins and campus locations">
                  <div className="flex flex-col items-center justify-center text-center py-6 select-none bg-slate-950/10 border border-[#334155]/30 rounded-xl px-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-brand-success flex items-center justify-center mb-2 border border-emerald-500/20">
                      <MapPin className="w-4.5 h-4.5" />
                    </div>
                    <h4 className="text-[12px] font-bold text-brand-text truncate max-w-full">
                      {studentStatus?.current_location || 'Campus Gate'}
                    </h4>
                    <div className="flex items-center gap-1 justify-center text-[9px] text-brand-secondary mt-1">
                      <Clock className="w-3 h-3" />
                      <span>Last Seen: {formatDate(studentStatus?.last_seen)}</span>
                    </div>
                  </div>
                </DashboardCard>
              </div>

              <DashboardCard title="Active Learning Block" subtitle="Current lecture details & remarks">
                <div className="p-4 rounded-xl bg-slate-950/20 border border-[#334155]/20 space-y-4 text-left">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-brand-secondary">Registered Course</span>
                      <h4 className="text-xs font-semibold text-brand-text mt-0.5">{studentStatus?.current_course || 'No active classes'}</h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shrink-0 select-none">
                      Active
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-brand-secondary">Supervisor Remarks</span>
                    <p className="text-[11px] text-[#94a3b8] mt-1 leading-relaxed italic">
                      "{studentStatus?.remarks || 'System reports standard campus behavioral profile. Check-ins are registered normally.'}"
                    </p>
                  </div>
                </div>
              </DashboardCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboardPage;
