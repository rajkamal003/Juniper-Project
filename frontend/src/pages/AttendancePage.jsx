// frontend/src/pages/AttendancePage.jsx
import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { SearchBar } from '../components/ui/SearchBar';
import { ActionToolbar } from '../components/ui/ActionToolbar';
import { DataTable } from '../components/ui/DataTable';
import { EmptyState } from '../components/feedback/EmptyState';

export const AttendancePage = () => {
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    document.title = "SecureCampus AI | Attendance";
  }, []);

  const headers = ["Class Roster Date", "Course Name", "Assigned Students", "Present count", "VLAN Access logs", "Status"];

  const customEmptyState = (
    <EmptyState
      icon={Calendar}
      title="No attendance logs collected"
      description="This module will become active after backend integration in Stage 5 and device integration in Stage 6."
    />
  );

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ name: "Attendance Logs", path: "/attendance" }]} />

      <PageHeader
        title="Student Attendance Registry"
        subtitle="Audit automation logs, daily checklists, and subnet client entry registries"
      />

      <ActionToolbar
        searchBar={
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search class attendance calendars..."
          />
        }
      />

      <DataTable
        headers={headers}
        rows={[]}
        renderRow={() => null}
        loading={false}
        emptyState={customEmptyState}
      />
    </div>
  );
};

export default AttendancePage;
