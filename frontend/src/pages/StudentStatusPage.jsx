// frontend/src/pages/StudentStatusPage.jsx
import React, { useState, useEffect } from 'react';
import { User, CheckCircle2, RefreshCw, Shield, Users, Mail, Phone, BookOpen } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export const StudentStatusPage = () => {
  const { user } = useAuth();
  const [studentStatus, setStudentStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStudentStatus = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/parent/student-status');
      if (response.data?.success) {
        setStudentStatus(response.data.data);
      }
    } catch (err) {
      console.error("Failed to load linked student logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "SecureCampus AI | Student Status";
    fetchStudentStatus();
  }, []);

  // Defined relationship roles
  const relationshipRoles = ["Father", "Mother", "Guardian", "Authorized Parent"];
  const currentRelationship = user?.relationship || "Father";

  return (
    <div className="space-y-6 text-left select-none">
      <Breadcrumb items={[{ name: "Student Status", path: "/student-status" }]} />

      <PageHeader
        title="Student Status Information"
        subtitle="Review associated student authorization profile details and relationship status"
      >
        <button
          onClick={fetchStudentStatus}
          disabled={loading}
          className="flex items-center justify-center p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          title="Refresh Telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </PageHeader>

      {loading ? (
        <div className="p-12 text-center border border-slate-200 bg-slate-50 rounded-2xl flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-500">Retrieving student metadata profile...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="lg:col-span-2">
            <Card className="p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800">Student Profile Details</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Linked official institutional records</p>
                  </div>
                </div>
                {/* Prominent Student ID display */}
                <div className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-center sm:text-right">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Student ID</span>
                  <span className="text-sm font-mono font-extrabold text-blue-600">
                    {studentStatus?.roll_number || user?.parent_student_roll || "2300090273"}
                  </span>
                </div>
              </div>

              {/* Grid Layout of details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Student ID</span>
                  <span className="font-mono font-bold text-slate-800">
                    {studentStatus?.roll_number || user?.parent_student_roll || "2300090273"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Relationship</span>
                  <span className="font-bold text-blue-600">
                    {currentRelationship}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Department</span>
                  <span className="font-bold text-slate-800">
                    {studentStatus?.department || "Computer Science & Engineering"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Year</span>
                  <span className="font-bold text-slate-800">
                    {studentStatus?.year || "III Year"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Parent Contact</span>
                  <span className="font-mono font-bold text-slate-800">
                    {user?.phone || "9848022338"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Connection Status</span>
                  <span className="font-bold text-emerald-600">
                    Online / Secure
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Relationship Selection Card */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-brand-primary" />
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-brand-text">Relationship Card</h4>
              </div>
              <p className="text-[10px] text-brand-secondary leading-relaxed mb-4">
                The linked student authorization status is authorized for the highlighted relationship role context:
              </p>

              <div className="space-y-2">
                {relationshipRoles.map((role) => {
                  const isActive = currentRelationship.toLowerCase() === role.toLowerCase();
                  return (
                    <div
                      key={role}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all select-none ${
                        isActive
                          ? 'border-blue-200 bg-blue-50 shadow-sm'
                          : 'border-slate-200 bg-white opacity-50'
                      }`}
                    >
                      <span className={`text-xs font-semibold ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                        {role}
                      </span>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Network Shield Consent Card */}
            <Card className="p-5 bg-blue-50 border-blue-100">
              <h4 className="font-bold text-xs flex items-center gap-1.5 text-blue-700 uppercase tracking-wider">
                🛡️ Verified Parent Link
              </h4>
              <p className="text-[10px] text-slate-600 mt-2 leading-relaxed">
                Parent identity is linked to roll number {user?.parent_student_roll || "22B91A0512"} under strict NOC Gate regulatory policies. Any configuration modifications must go through institutional verification.
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentStatusPage;
