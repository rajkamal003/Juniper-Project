// frontend/src/pages/VisitorRequestsPage.jsx
import React, { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { SearchBar } from '../components/ui/SearchBar';
import { ActionToolbar } from '../components/ui/ActionToolbar';
import { DataTable } from '../components/ui/DataTable';
import { EmptyState } from '../components/feedback/EmptyState';
import { Button } from '../components/ui/Button';

export const VisitorRequestsPage = () => {
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    document.title = "SecureCampus AI | Visitor Requests";
  }, []);

  const headers = ["Request ID", "Visit Date", "Purpose description", "Mapped Host Faculty", "Security Clearance Code", "Status"];

  const customEmptyState = (
    <EmptyState
      icon={Calendar}
      title="No visitor clearance permits found"
      description="This module will become active after backend integration in Stage 5."
    />
  );

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ name: "Visitor Requests", path: "/visitor-requests" }]} />

      <PageHeader
        title="Visitation Permits & Clearances"
        subtitle="Manage and request temp physical entries and scheduled visitation permits"
      >
        <Button
          variant="primary"
          disabled
          className="h-10 px-4 text-xs font-bold flex items-center gap-2 cursor-not-allowed opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>New Visitation Permit</span>
        </Button>
      </PageHeader>

      <ActionToolbar
        searchBar={
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search visitor logs..."
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

export default VisitorRequestsPage;
