// frontend/src/pages/StudentStatusPage.jsx
import React from 'react';
import { User, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { StatusCard } from '../components/ui/StatusCard';
import { EmptyState } from '../components/feedback/EmptyState';

export const StudentStatusPage = () => {
  React.useEffect(() => {
    document.title = "SecureCampus AI | Student Status";
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ name: "Student Status Tracker", path: "/student-status" }]} />

      <PageHeader
        title="Linked Student Tracking"
        subtitle="Review associated student class attendance logs, active subnets mappings, and safety alarms"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Status Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <StatusCard
            title="Clearance Status"
            status="Roll Number Mapped"
            statusType="success"
            message="Your visitor profile is successfully associated with your child's student roll configuration."
            icon={CheckCircle2}
          />
        </div>

        {/* Right Side: Data Logs */}
        <div className="lg:col-span-2">
          <EmptyState
            icon={User}
            title="No attendance tracking details available"
            description="This module will become active after backend integration in Stage 5."
            className="h-full min-h-[350px]"
          />
        </div>
      </div>
    </div>
  );
};

export default StudentStatusPage;
