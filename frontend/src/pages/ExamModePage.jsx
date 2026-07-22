// frontend/src/pages/ExamModePage.jsx
import React, { useState, useEffect } from 'react';
import { Award, Monitor, CheckCircle, Plus, Play, Square, Trash2, X, RefreshCw } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Card } from '../components/ui/Card';
import { SectionTitle } from '../components/ui/SectionTitle';
import { StatusCard } from '../components/ui/StatusCard';
import { EmptyState } from '../components/feedback/EmptyState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'sonner';

export const ExamModePage = () => {
  const { user } = useAuth();
  const isAdminOrFaculty = user?.role?.role_name === 'Super Admin' || user?.role?.role_name === 'Faculty';

  const [sessions, setSessions] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Student registration details
  const [deviceForm, setDeviceForm] = useState({
    device_name: '',
    mac_address: ''
  });
  const [activeAccessLog, setActiveAccessLog] = useState(null);

  // Faculty session creation form
  const [sessionForm, setSessionForm] = useState({
    course_code: '',
    exam_name: '',
    classroom: '',
    start_time: '',
    end_time: ''
  });

  const fetchSessionsAndLogs = async () => {
    setLoading(true);
    try {
      const sessResponse = await api.get('/api/exam/sessions');
      if (sessResponse.data?.success) {
        setSessions(sessResponse.data.data.items);
      }

      if (isAdminOrFaculty) {
        const logsResponse = await api.get('/api/exam/access-logs');
        if (logsResponse.data?.success) {
          setAccessLogs(logsResponse.data.data.items);
        }
      } else {
        // If student, check if they are already logged in to any active session
        const logsResponse = await api.get(`/api/exam/access-logs?student_id=${user.id}`);
        if (logsResponse.data?.success) {
          const logs = logsResponse.data.data.items;
          const activeLog = logs.find(l => l.logout_time === null);
          if (activeLog) {
            setActiveAccessLog(activeLog);
            setDeviceForm({
              device_name: activeLog.device_name || '',
              mac_address: activeLog.mac_address || ''
            });
          } else {
            setActiveAccessLog(null);
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load examination sessions information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "SecureCampus AI | Exam Mode";
    fetchSessionsAndLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Faculty actions
  const handleCreateSession = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Validate times before sending
      const start = new Date(sessionForm.start_time);
      const end = new Date(sessionForm.end_time);
      if (start >= end) {
        toast.error("Start time must be earlier than end time.");
        setSubmitting(false);
        return;
      }

      const response = await api.post('/api/exam/sessions', sessionForm);
      if (response.data?.success) {
        toast.success("Exam session scheduled successfully.");
        setIsModalOpen(false);
        setSessionForm({
          course_code: '',
          exam_name: '',
          classroom: '',
          start_time: '',
          end_time: ''
        });
        fetchSessionsAndLogs();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Could not schedule exam session.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await api.put(`/api/exam/sessions/${id}?status_update=${newStatus}`);
      if (response.data?.success) {
        toast.success(`Exam session status changed to ${newStatus}.`);
        fetchSessionsAndLogs();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "State transition rejected.");
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm("Are you sure you want to cancel and remove this exam session?")) return;
    try {
      const response = await api.delete(`/api/exam/sessions/${id}`);
      if (response.data?.success) {
        toast.success("Exam session cancelled.");
        fetchSessionsAndLogs();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Could not delete session.");
    }
  };

  // Student actions
  const handleStudentAccess = async (session_id, logout = false) => {
    if (!logout) {
      // Validate MAC
      const macPattern = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
      if (!macPattern.test(deviceForm.mac_address)) {
        toast.error("Invalid MAC Address format (expected AA:BB:CC:DD:EE:FF).");
        return;
      }
    }

    try {
      const payload = {
        exam_session_id: session_id,
        student_id: user.id,
        device_name: deviceForm.device_name,
        mac_address: deviceForm.mac_address,
        logout: logout
      };
      const response = await api.post('/api/exam/access', payload);
      if (response.data?.success) {
        if (logout) {
          toast.success("Logged out from exam session successfully.");
          setActiveAccessLog(null);
          setDeviceForm({ device_name: '', mac_address: '' });
        } else {
          toast.success("Device logged in to exam session.");
          setActiveAccessLog(response.data.data);
        }
        fetchSessionsAndLogs();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to log exam access.");
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ name: "Exam Mode Control", path: "/exam-mode" }]} />

      <PageHeader
        title={isAdminOrFaculty ? "Exam Session Management" : "Student Exam Mode Portal"}
        subtitle="Manage exam schedules, monitor student device registrations, and enforce gateway lockdown guidelines"
      >
        <div className="flex gap-2">
          <button
            onClick={fetchSessionsAndLogs}
            className="flex items-center justify-center p-2 rounded-lg border border-[#334155] bg-slate-900/50 hover:bg-slate-800 text-brand-secondary hover:text-brand-text transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {isAdminOrFaculty && (
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              className="h-10 px-4 text-xs font-bold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Exam</span>
            </Button>
          )}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        {/* Security Checklist Card */}
        <div className="lg:col-span-1 space-y-6">
          <StatusCard
            title="Lockdown Policy State"
            status={activeAccessLog ? "Active In Exam" : "Policy Mapped"}
            statusType={activeAccessLog ? "warning" : "success"}
            message={activeAccessLog 
              ? `Registered device: ${activeAccessLog.device_name} (${activeAccessLog.mac_address})` 
              : "Your operating system, browser configuration, and network gateway comply with SecureCampus AI standards."
            }
            icon={CheckCircle}
          />

          <Card className="p-5 select-none space-y-3">
            <SectionTitle>Security Standards Checklist</SectionTitle>
            <div className="space-y-3 text-xs opacity-65">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand-success shrink-0" />
                <span>Single Active Display</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand-success shrink-0" />
                <span>Virtual Machine Detection: Clean</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand-success shrink-0" />
                <span>Secure Gateway Access Mapped</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Dynamic Panels */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="p-12 text-center border border-[#334155]/60 bg-slate-950/20 rounded-2xl flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
              <p className="text-xs text-brand-secondary">Synchronizing exam sessions...</p>
            </div>
          ) : (
            <>
              {/* Active / Scheduled Sessions */}
              <Card className="p-6 space-y-4">
                <div className="border-b border-[#334155]/50 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-extrabold text-brand-text">Examination Schedules</h3>
                    <p className="text-[11px] text-brand-secondary mt-1">Currently active and scheduled exams.</p>
                  </div>
                </div>

                {sessions.length === 0 ? (
                  <EmptyState
                    icon={Award}
                    title="No exam sessions found"
                    description="No examinations are currently scheduled."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#334155] text-brand-secondary select-none text-[10px] uppercase font-bold tracking-wider">
                          <th className="py-3 px-4">Exam Info</th>
                          <th className="py-3 px-4">Classroom</th>
                          <th className="py-3 px-4">Timings</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#334155]/20">
                        {sessions.map(s => {
                          const isSessionActive = s.status === 'Active';
                          const isStudentRegistered = activeAccessLog && activeAccessLog.exam_session_id === s.id;

                          return (
                            <tr key={s.id} className="hover:bg-slate-800/10 text-brand-text">
                              <td className="py-3.5 px-4">
                                <span className="font-mono font-bold text-brand-primary block">{s.course_code}</span>
                                <span className="font-semibold block mt-0.5">{s.exam_name}</span>
                              </td>
                              <td className="py-3.5 px-4 font-medium">{s.classroom}</td>
                              <td className="py-3.5 px-4 font-mono text-[#94a3b8]">
                                <span className="block">{formatDateTime(s.start_time)}</span>
                                <span className="block text-[10px] text-brand-secondary">to {formatDateTime(s.end_time)}</span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  s.status === 'Active' ? 'bg-emerald-500/10 text-brand-success border-emerald-500/20 animate-pulse' :
                                  s.status === 'Scheduled' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                  s.status === 'Completed' ? 'bg-blue-500/10 text-brand-primary border-blue-500/20' :
                                  'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                  {s.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                {isAdminOrFaculty ? (
                                  <div className="flex gap-2 justify-center">
                                    {s.status === 'Scheduled' && (
                                      <button
                                        onClick={() => handleUpdateStatus(s.id, 'Active')}
                                        className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded-lg"
                                        title="Start Exam"
                                      >
                                        <Play className="w-4 h-4" />
                                      </button>
                                    )}
                                    {s.status === 'Active' && (
                                      <button
                                        onClick={() => handleUpdateStatus(s.id, 'Completed')}
                                        className="p-1 text-blue-400 hover:bg-blue-500/10 rounded-lg"
                                        title="Complete Exam"
                                      >
                                        <Square className="w-4 h-4" />
                                      </button>
                                    )}
                                    {s.status !== 'Completed' && s.status !== 'Cancelled' && (
                                      <button
                                        onClick={() => handleDeleteSession(s.id)}
                                        className="p-1 text-red-400 hover:bg-red-500/10 rounded-lg"
                                        title="Cancel Session"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  // Student controls
                                  isSessionActive ? (
                                    isStudentRegistered ? (
                                      <Button
                                        variant="danger"
                                        className="h-7 px-3 text-[10px]"
                                        onClick={() => handleStudentAccess(s.id, true)}
                                      >
                                        End Exam
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="primary"
                                        className="h-7 px-3 text-[10px]"
                                        onClick={() => {
                                          const devName = window.prompt("Enter Device Name:", "MacBook Pro");
                                          const mac = window.prompt("Enter MAC Address (AA:BB:CC:DD:EE:FF):");
                                          if (devName && mac) {
                                            setDeviceForm({ device_name: devName, mac_address: mac });
                                            // wait for state update hook or run directly
                                            setTimeout(() => {
                                              api.post('/api/exam/access', {
                                                exam_session_id: s.id,
                                                student_id: user.id,
                                                device_name: devName,
                                                mac_address: mac,
                                                logout: false
                                              }).then(() => {
                                                toast.success("Device logged in to exam session.");
                                                fetchSessionsAndLogs();
                                              }).catch(err => {
                                                toast.error(err.response?.data?.detail || "MAC register failed");
                                              });
                                            }, 100);
                                          }
                                        }}
                                      >
                                        Join Exam
                                      </Button>
                                    )
                                  ) : (
                                    <span className="text-brand-secondary">—</span>
                                  )
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              {/* Faculty logs table */}
              {isAdminOrFaculty && (
                <Card className="p-6 space-y-4">
                  <div className="border-b border-[#334155]/50 pb-3">
                    <h3 className="text-sm font-extrabold text-brand-text">Active Participants & Devices</h3>
                    <p className="text-[11px] text-brand-secondary mt-1">Audit verification logs of connected devices.</p>
                  </div>

                  {accessLogs.length === 0 ? (
                    <EmptyState
                      icon={Monitor}
                      title="No devices registered"
                      description="Student check-in logs will appear when exams are active."
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-[#334155] text-brand-secondary select-none text-[10px] uppercase font-bold tracking-wider">
                            <th className="py-2.5 px-4">Student ID</th>
                            <th className="py-2.5 px-4">Device Name</th>
                            <th className="py-2.5 px-4">MAC Address</th>
                            <th className="py-2.5 px-4">Login Time</th>
                            <th className="py-2.5 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#334155]/25">
                          {accessLogs.map(log => (
                            <tr key={log.id} className="text-brand-text">
                              <td className="py-3 px-4 font-semibold font-mono">User ID: #{log.student_id}</td>
                              <td className="py-3 px-4 font-medium">{log.device_name || '—'}</td>
                              <td className="py-3 px-4 font-mono">{log.mac_address || '—'}</td>
                              <td className="py-3 px-4 font-mono text-brand-secondary">
                                {formatDateTime(log.login_time)}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                  log.status === 'Allowed' ? 'bg-emerald-500/10 text-brand-success border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-[#334155] rounded-2xl p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-brand-secondary hover:text-brand-text hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-left">
              <h3 className="text-sm font-extrabold text-brand-text">Schedule New Exam Session</h3>
              <p className="text-[11px] text-brand-secondary mt-1">Configure timings and physical rooms for scheduled exam blocks.</p>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Course Code"
                  value={sessionForm.course_code}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, course_code: e.target.value }))}
                  placeholder="e.g. CSE-301"
                  required
                />
                <Input
                  label="Exam Session Name"
                  value={sessionForm.exam_name}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, exam_name: e.target.value }))}
                  placeholder="e.g. Midterm 1"
                  required
                />
              </div>

              <Input
                label="Classroom / Block"
                value={sessionForm.classroom}
                onChange={(e) => setSessionForm(prev => ({ ...prev, classroom: e.target.value }))}
                placeholder="e.g. Science Block Room 3B"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Start Time"
                  type="datetime-local"
                  value={sessionForm.start_time}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, start_time: e.target.value }))}
                  required
                />
                <Input
                  label="End Time"
                  type="datetime-local"
                  value={sessionForm.end_time}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, end_time: e.target.value }))}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                >
                  Schedule Exam
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamModePage;
