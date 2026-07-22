// frontend/src/pages/StudentStatusPage.jsx
import React, { useState, useEffect } from 'react';
import { User, CheckCircle2, RefreshCw, AlertTriangle, MapPin, Calendar, Clock } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { StatusCard } from '../components/ui/StatusCard';
import { EmptyState } from '../components/feedback/EmptyState';
import { Card } from '../components/ui/Card';
import { SectionTitle } from '../components/ui/SectionTitle';
import api from '../services/api';

export const StudentStatusPage = () => {
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
      setError(err.response?.data?.detail || 'Linked student tracking telemetry offline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "SecureCampus AI | Student Status";
    fetchStudentStatus();
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
      <Breadcrumb items={[{ name: "Student Status Tracker", path: "/student-status" }]} />

      <PageHeader
        title="Linked Student Tracking"
        subtitle="Review associated student class attendance logs, active subnets mappings, and safety alarms"
      >
        <button
          onClick={fetchStudentStatus}
          disabled={loading}
          className="flex items-center justify-center p-2 rounded-lg border border-[#334155] bg-slate-900/50 hover:bg-slate-800 text-brand-secondary hover:text-brand-text transition-colors"
          title="Refresh Telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </PageHeader>

      {loading ? (
        <div className="p-12 text-center border border-[#334155]/60 bg-slate-950/20 rounded-2xl flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
          <p className="text-xs text-brand-secondary">Retrieving student location logs...</p>
        </div>
      ) : error ? (
        <EmptyState
          icon={AlertTriangle}
          title="Linked Student Status Offline"
          description={error}
          className="h-full min-h-[350px]"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          {/* Left Side: Status Info Card */}
          <div className="lg:col-span-1 space-y-6">
            <StatusCard
              title="Clearance Status"
              status={studentStatus.attendance_status === 'Present' ? "Student On Campus" : "Student Mapped"}
              statusType={studentStatus.attendance_status === 'Present' ? "success" : "warning"}
              message="Your parent visitor profile is verified and active."
              icon={CheckCircle2}
            />

            <Card className="p-5 select-none space-y-3">
              <SectionTitle>Student Information Details</SectionTitle>
              <div className="space-y-3 text-xs opacity-65">
                <div className="flex justify-between items-center">
                  <span>Student User ID</span>
                  <span className="font-bold text-brand-text">#{studentStatus.student_id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Attendance Status</span>
                  <span className={`font-semibold ${studentStatus.attendance_status === 'Present' ? 'text-brand-success' : 'text-yellow-400'}`}>
                    {studentStatus.attendance_status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Last Checked Location</span>
                  <span className="font-semibold text-brand-text">{studentStatus.current_location || 'Campus Entrance'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Last seen</span>
                  <span className="font-semibold text-brand-text font-mono">{formatDate(studentStatus.last_seen)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Side: Data Logs */}
          <div className="lg:col-span-2">
            <Card className="p-6 space-y-6">
              <div className="border-b border-[#334155]/50 pb-4">
                <h3 className="text-sm font-extrabold text-brand-text">Active Course Session</h3>
                <p className="text-[11px] text-brand-secondary mt-1">Real-time classroom activity checks.</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/30 border border-[#334155]/30 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-brand-secondary">Current Lecture Class</span>
                    <p className="font-semibold text-brand-text mt-0.5">{studentStatus.current_course || 'No active classes recorded'}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 select-none">
                    Verified Link
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/30 border border-[#334155]/30">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-brand-secondary">Safety Remarks & Alerts</span>
                  <p className="text-[11px] text-[#94a3b8] mt-1 italic">
                    "{studentStatus.remarks || 'No alerts recorded. Normal campus profile logs registered.'}"
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentStatusPage;
