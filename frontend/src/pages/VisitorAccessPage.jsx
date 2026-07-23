// frontend/src/pages/VisitorAccessPage.jsx
import React, { useState, useEffect } from 'react';
import { Network, ShieldAlert, Key, RefreshCw, Clock } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { RefreshButton } from '../components/ui/RefreshButton';
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
  const [isRefreshing, setIsRefreshing] = useState(false);

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
        <RefreshButton
          isRefreshing={isRefreshing}
          setIsRefreshing={setIsRefreshing}
          onRefresh={fetchGuestAccess}
          pageName="Visitor Access"
        />
      </PageHeader>

      <div className={`transition-opacity duration-300 ${isRefreshing ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
      {loading ? (
        <div className="p-12 text-center border border-slate-200 bg-slate-50 rounded-2xl flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-500">Retrieving temporary guest network lease...</p>
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
              <div className="space-y-3 text-xs text-slate-500">
                <div className="flex justify-between items-center">
                  <span>SSID Name</span>
                  <span className="font-bold text-slate-800">{access.ssid}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>VLAN Assignment</span>
                  <span className="font-semibold text-slate-800 font-mono">VLAN {access.vlan}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Lease Expiry</span>
                  <span className="font-semibold text-slate-800 font-mono">{formatDate(access.expires_at)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Access log details */}
          <div className="md:col-span-2">
            <Card className="p-6 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-extrabold text-slate-800">Guest Wi-Fi Credentials</h3>
                <p className="text-[11px] text-slate-500 mt-1">Use the temporary login credentials below to connect to the campus internet.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Wi-Fi Username</span>
                  <p className="font-mono font-bold text-slate-800 mt-1 text-sm">{access.username}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Wi-Fi Password</span>
                  <p className="font-mono font-bold text-slate-800 mt-1 text-sm">
                    {access.temporary_password || '•••••••• (Encrypted)'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-[11px] text-slate-600 leading-relaxed flex gap-2">
                <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800">Lease Notice: </span>
                  Your password is only shown plaintext during approval. Hashed passwords are saved in the database for compliance. This session will expire at {formatDate(access.expires_at)}.
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default VisitorAccessPage;
