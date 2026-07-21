// frontend/src/pages/StudentsPage.jsx
import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { SearchBar } from '../components/ui/SearchBar';
import { ActionToolbar } from '../components/ui/ActionToolbar';
import { DataTable } from '../components/ui/DataTable';
import { EmptyState } from '../components/feedback/EmptyState';

export const StudentsPage = () => {
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    document.title = "SecureCampus AI | Students";
  }, []);

  const headers = ["Student ID", "Full Name", "Roll Number", "Department", "Parent Contact Email", "Status"];

  const customEmptyState = (
    <EmptyState
      icon={Users}
      title="No students mapped to roster"
      description="This module will become active after backend integration in Stage 5."
    />
  );

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ name: "Students Directory", path: "/students" }]} />

      <PageHeader
        title="Assigned Students Directory"
        subtitle="Manage and track active student profiles mapped to your curriculum rosters"
      />

      <ActionToolbar
        searchBar={
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search students directory..."
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

export default StudentsPage;
