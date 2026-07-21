// frontend/src/pages/ExamModePage.jsx
import React from 'react';
import { Award, ShieldAlert, Monitor, CheckCircle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Card } from '../components/ui/Card';
import { SectionTitle } from '../components/ui/SectionTitle';
import { StatusCard } from '../components/ui/StatusCard';
import { EmptyState } from '../components/feedback/EmptyState';

export const ExamModePage = () => {
  React.useEffect(() => {
    document.title = "SecureCampus AI | Exam Mode";
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ name: "Exam Mode Control", path: "/exam-mode" }]} />

      <PageHeader
        title="Student Exam Mode Portal"
        subtitle="Manage and view browser security lockdowns and network firewall policies mapping for scheduled examinations"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lock Status Card */}
        <div className="md:col-span-1 space-y-6">
          <StatusCard
            title="Lockdown Policy State"
            status="Compliance Verified"
            statusType="success"
            message="Your operating system, browser configuration, and network gateway comply with SecureCampus AI standards."
            icon={CheckCircle}
          />

          <Card className="p-5 select-none text-left space-y-3">
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

        {/* Action / Grid Placeholders */}
        <div className="md:col-span-2">
          <EmptyState
            icon={Award}
            title="No examinations scheduled"
            description="This module will become active after backend integration in Stage 5 and device integration in Stage 6."
            className="h-full min-h-[350px]"
          />
        </div>
      </div>
    </div>
  );
};

export default ExamModePage;
