// frontend/src/pages/CampusAccessPage.jsx
import React, { useState } from 'react';
import { Network, Plus } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { SearchBar } from '../components/ui/SearchBar';
import { ActionToolbar } from '../components/ui/ActionToolbar';
import { DataTable } from '../components/ui/DataTable';
import { EmptyState } from '../components/feedback/EmptyState';
import { Button } from '../components/ui/Button';

export const CampusAccessPage = () => {
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    document.title = "SecureCampus AI | Campus Access";
  }, []);

  const headers = ["Device MAC", "Registered Device Name", "AP Interface Connection", "Lease IP Mapped", "Authentication Logs", "Status"];

  const customEmptyState = (
    <EmptyState
      icon={Network}
      title="No device connection logs found"
      description="This module will become active after backend integration in Stage 5 and device integration in Stage 6."
    />
  );

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ name: "Campus Access Logs", path: "/campus-access" }]} />

      <PageHeader
        title="Personal Campus Network Access"
        subtitle="Manage personal MAC configurations, client device entries, and authentication history logs"
      >
        <Button
          variant="primary"
          disabled
          className="h-10 px-4 text-xs font-bold flex items-center gap-2 cursor-not-allowed opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Device MAC</span>
        </Button>
      </PageHeader>

      <ActionToolbar
        searchBar={
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search connections logs..."
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

export default CampusAccessPage;
