// frontend/src/pages/StudentCoursesPage.jsx
import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { SearchBar } from '../components/ui/SearchBar';
import { ActionToolbar } from '../components/ui/ActionToolbar';
import { DataTable } from '../components/ui/DataTable';
import { EmptyState } from '../components/feedback/EmptyState';

export const StudentCoursesPage = () => {
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    document.title = "SecureCampus AI | My Courses";
  }, []);

  const headers = ["Course Code", "Course Title", "Faculty Instructor", "Credits Mapped", "Classroom Location", "Syllabus Status"];

  const customEmptyState = (
    <EmptyState
      icon={BookOpen}
      title="No courses registered"
      description="This module will become active after backend integration in Stage 5."
    />
  );

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ name: "My Registered Courses", path: "/courses" }]} />

      <PageHeader
        title="Student Curriculum Overview"
        subtitle="Track registered courses, semester timelines, academic credits, and exam schedules"
      />

      <ActionToolbar
        searchBar={
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search registered courses..."
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

export default StudentCoursesPage;
