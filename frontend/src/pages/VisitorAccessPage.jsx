// frontend/src/pages/VisitorAccessPage.jsx
import React, { useState, useEffect } from 'react';
import { Network, ShieldAlert, Key, RefreshCw, Clock } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Card } from '../components/ui/Card';
import { SectionTitle } from '../components/ui/SectionTitle';
import { StatusCard } from '../components/ui/StatusCard';
import { EmptyState } from '../components/feedback/EmptyState';
import api from '../services/api';
import { toast } from 'sonner';

export const VisitorAccessPage = () => {
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGuestAccess = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/guest/access');
      if (response.data?.success) {
        setAccess(response.data.data);
      } else {
        setError('No active temporary Wi-Fi access pass found.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Guest Wi-Fi telemetry is currently offline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "SecureCampus AI | Visitor Access";
    fetchGuestAccess();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    return new Date(dateStr).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = access ? new Date(access.expires_at) < new Date() : false;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ name: "Visitor Access details", path: "/visitor-access" }]} />

      <PageHeader
        title="Visitor Access & Wi-Fi Management"
        subtitle="Manage temporary Wi-Fi logins, MAC address settings, and guest network access leases"
      >
        <button
          onClick={fetchGuestAccess}
          disabled={loading}
          className="flex items-center justify-center p-2 rounded-lg border border-[#334155] bg-slate-900/50 hover:bg-slate-800 text-brand-secondary hover:text-brand-text transition-colors"
          title="Refresh Wi-Fi Status"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </PageHeader>

      {loading ? (
        <div className="p-12 text-center border border-[#334155]/60 bg-slate-950/20 rounded-2xl flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
          <p className="text-xs text-brand-secondary">Retrieving temporary guest network lease...</p>
        </div>
      ) : error ? (
        <EmptyState
          icon={Network}
          title="No active guest lease found"
          description={error}
          className="h-full min-h-[350px]"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Network status */}
          <div className="md:col-span-1 space-y-6">
            <StatusCard
              title="Access Lease State"
              status={isExpired ? "Access Expired" : "Access Permit Verified"}
              statusType={isExpired ? "error" : "success"}
              message={isExpired 
                ? "Your guest network lease has expired. Please contact support or submit a new request."
                : "Your guest connection has a temporary lease active. Ensure device MAC settings are verified."
              }
              icon={Key}
            />

            <Card className="p-5 select-none space-y-3">
              <SectionTitle>Temporary Network SSID Parameters</SectionTitle>
              <div className="space-y-3 text-xs opacity-65">
                <div className="flex justify-between items-center">
                  <span>SSID Name</span>
                  <span className="font-bold text-brand-text">{access.ssid}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>VLAN Assignment</span>
                  <span className="font-semibold text-brand-text font-mono">VLAN {access.vlan}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Lease Expiry</span>
                  <span className="font-semibold text-brand-text font-mono">{formatDate(access.expires_at)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Access log details */}
          <div className="md:col-span-2">
            <Card className="p-6 space-y-6">
              <div className="border-b border-[#334155]/50 pb-4">
                <h3 className="text-sm font-extrabold text-brand-text">Guest Wi-Fi Credentials</h3>
                <p className="text-[11px] text-brand-secondary mt-1">Use the temporary login credentials below to connect to the campus internet.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-slate-950/30 border border-[#334155]/30">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-brand-secondary">Wi-Fi Username</span>
                  <p className="font-mono font-bold text-brand-text mt-1 text-sm">{access.username}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/30 border border-[#334155]/30">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-brand-secondary">Wi-Fi Password</span>
                  <p className="font-mono font-bold text-brand-text mt-1 text-sm">
                    {access.temporary_password || '•••••••• (Encrypted)'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-[11px] text-[#94a3b8] leading-relaxed flex gap-2">
                <Clock className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-brand-text">Lease Notice: </span>
                  Your password is only shown plaintext during approval. Hashed passwords are saved in the database for compliance. This session will expire at {formatDate(access.expires_at)}.
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorAccessPage;
