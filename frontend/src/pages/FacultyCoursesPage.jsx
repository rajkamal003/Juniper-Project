// frontend/src/pages/FacultyCoursesPage.jsx
import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { SearchBar } from '../components/ui/SearchBar';
import { ActionToolbar } from '../components/ui/ActionToolbar';
import { DataTable } from '../components/ui/DataTable';
import { EmptyState } from '../components/feedback/EmptyState';

export const FacultyCoursesPage = () => {
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    document.title = "SecureCampus AI | Course Management";
  }, []);

  const headers = ["Course Code", "Course Name", "Mapped Department", "Year/Semester", "Classroom Location", "Registered Students"];

  const customEmptyState = (
    <EmptyState
      icon={BookOpen}
      title="No courses assigned"
      description="This module will become active after backend integration in Stage 5."
    />
  );

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ name: "Assigned Courses", path: "/courses" }]} />

      <PageHeader
        title="Faculty Course Management"
        subtitle="Review, verify, and details assigned academic curriculum structures and syllabus schedules"
      />

      <ActionToolbar
        searchBar={
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search course parameters..."
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

export default FacultyCoursesPage;
