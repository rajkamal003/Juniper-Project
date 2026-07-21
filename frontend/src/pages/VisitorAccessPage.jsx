// frontend/src/pages/VisitorAccessPage.jsx
import React from 'react';
import { Network, ShieldAlert, Key } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Card } from '../components/ui/Card';
import { SectionTitle } from '../components/ui/SectionTitle';
import { StatusCard } from '../components/ui/StatusCard';
import { EmptyState } from '../components/feedback/EmptyState';

export const VisitorAccessPage = () => {
  React.useEffect(() => {
    document.title = "SecureCampus AI | Visitor Access";
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ name: "Visitor Access details", path: "/visitor-access" }]} />

      <PageHeader
        title="Visitor Access & Wi-Fi Management"
        subtitle="Manage temporary Wi-Fi logins, MAC address settings, and guest network access leases"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Network status */}
        <div className="md:col-span-1 space-y-6">
          <StatusCard
            title="Access Lease State"
            status="Active Duration Mapped"
            statusType="warning"
            message="Your guest connection has a temporary lease active. Ensure device MAC settings are verified."
            icon={Key}
          />

          <Card className="p-5 select-none text-left space-y-3">
            <SectionTitle>Temporary Network SSID Parameters</SectionTitle>
            <div className="space-y-3 text-xs opacity-65">
              <div className="flex justify-between items-center">
                <span>SSID Name</span>
                <span className="font-bold text-brand-text">SecureCampus_Guest</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Bandwidth Cap</span>
                <span className="font-semibold text-brand-text font-mono">10 Mbps</span>
              </div>
              <div className="flex justify-between items-center">
                <span>VLAN Assignment</span>
                <span className="font-semibold text-brand-text font-mono">VLAN 99</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Access log details */}
        <div className="md:col-span-2">
          <EmptyState
            icon={Network}
            title="No visitor duration logs available"
            description="This module will become active after backend integration in Stage 5 and device integration in Stage 6."
            className="h-full min-h-[350px]"
          />
        </div>
      </div>
    </div>
  );
};

export default VisitorAccessPage;
