// frontend/src/pages/SecurityAlertsPage.jsx
import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw, Eye, CheckCircle, AlertOctagon, XCircle, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/feedback/EmptyState';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';

export const SecurityAlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [triggerSearch, setTriggerSearch] = useState(0);

  const headers = ["Alert", "Severity", "Confidence", "Status", "Timestamp", "Actions"];

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        status: statusFilter || undefined,
        severity: severityFilter || undefined,
        search: searchQuery || undefined
      };
      const response = await api.get('/api/analytics/alerts', { params });
      if (response.data && response.data.success) {
        setAlerts(response.data.data.items);
        setTotal(response.data.data.total);
        setPages(response.data.data.pages);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch security alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "SecureCampus AI | Security Alerts";
    fetchAlerts();
  }, [page, statusFilter, severityFilter, triggerSearch]);

  const handleUpdateStatus = async (alertId, newStatus) => {
    try {
      const response = await api.put(`/api/analytics/alerts/${alertId}`, { status: newStatus });
      if (response.data && response.data.success) {
        toast.success(`Alert marked as ${newStatus}.`);
        fetchAlerts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update alert status.');
    }
  };

  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'Critical': return 'bg-red-500/15 text-red-400 border border-red-500/30';
      case 'High': return 'bg-orange-500/15 text-orange-400 border border-orange-500/30';
      case 'Medium': return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      default: return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6 text-left">
      <Breadcrumb items={[{ name: "Security Alerts", path: "/security-alerts" }]} />

      <PageHeader
        title="AI Security Alerts Log"
        subtitle="Review, audit, and resolve heuristically generated infrastructure security events"
      >
        <Button
          variant="secondary"
          onClick={fetchAlerts}
          className="h-10 w-10 p-0 flex items-center justify-center"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </PageHeader>

      {/* Filter Row */}
      <Card className="p-4 flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-10 px-3 bg-slate-900 border border-[#334155] rounded-xl text-xs text-brand-text font-semibold outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Severity filter */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
              className="h-10 px-3 bg-slate-900 border border-[#334155] rounded-xl text-xs text-brand-text font-semibold outline-none"
            >
              <option value="">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80 flex gap-2">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-brand-secondary" />
            </span>
            <input
              type="text"
              placeholder="Search alert title or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setTriggerSearch(prev => prev + 1)}
              className="w-full h-10 pl-10 pr-4 bg-slate-900 border border-[#334155] rounded-xl text-xs text-brand-text placeholder-brand-secondary outline-none focus:border-brand-primary"
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => setTriggerSearch(prev => prev + 1)}
            className="h-10 px-4 text-xs font-bold w-auto"
          >
            Go
          </Button>
        </div>
      </Card>

      {/* Alerts Table */}
      <DataTable
        headers={headers}
        rows={alerts}
        loading={loading}
        emptyState={
          <EmptyState
            icon={ShieldAlert}
            title="No security alerts logged"
            description="All systems are operating normally. No heuristic anomalies detected."
            className="h-full min-h-[400px]"
          />
        }
        renderRow={(alert) => (
          <>
            <td className="px-5 py-4 max-w-xs">
              <div className="text-sm font-semibold text-brand-text">{alert.title}</div>
              <div className="text-xs text-brand-secondary mt-1">{alert.description}</div>
              <div className="text-[10px] text-brand-primary mt-2 font-mono uppercase tracking-wider bg-brand-primary/5 px-2 py-0.5 rounded border border-brand-primary/10 inline-block">
                Type: {alert.alert_type}
              </div>
            </td>
            <td className="px-5 py-4">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getSeverityColor(alert.severity)}`}>
                {alert.severity}
              </span>
            </td>
            <td className="px-5 py-4 font-mono text-xs font-bold text-brand-text">
              {(alert.confidence_score * 100).toFixed(0)}%
            </td>
            <td className="px-5 py-4">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                alert.status === 'Active' ? 'bg-red-500/10 text-red-400 border-red-500/20' : (
                  alert.status === 'Acknowledged' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : (
                    alert.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  )
                )
              }`}>
                {alert.status}
              </span>
            </td>
            <td className="px-5 py-4 font-mono text-xs text-brand-secondary">
              {new Date(alert.created_at).toLocaleString()}
            </td>
            <td className="px-5 py-4">
              <div className="flex gap-2">
                {alert.status === 'Active' && (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => handleUpdateStatus(alert.id, 'Acknowledged')}
                      className="h-8 px-2 text-[10px] w-auto font-bold flex items-center gap-1 border-amber-500/20 text-amber-400 hover:bg-amber-500/10"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Acknowledge</span>
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleUpdateStatus(alert.id, 'Resolved')}
                      className="h-8 px-2 text-[10px] w-auto font-bold flex items-center gap-1 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>Resolve</span>
                    </Button>
                  </>
                )}

                {alert.status === 'Acknowledged' && (
                  <Button
                    variant="secondary"
                    onClick={() => handleUpdateStatus(alert.id, 'Resolved')}
                    className="h-8 px-2 text-[10px] w-auto font-bold flex items-center gap-1 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>Resolve</span>
                  </Button>
                )}

                {alert.status === 'Resolved' && (
                  <Button
                    variant="secondary"
                    onClick={() => handleUpdateStatus(alert.id, 'Closed')}
                    className="h-8 px-2 text-[10px] w-auto font-bold flex items-center gap-1 border-slate-500/20 text-slate-400 hover:bg-slate-500/10"
                  >
                    <XCircle className="w-3 h-3" />
                    <span>Close</span>
                  </Button>
                )}

                {alert.status === 'Closed' && (
                  <span className="text-[10px] text-brand-secondary italic">Archived</span>
                )}
              </div>
            </td>
          </>
        )}
      />

      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-[#334155]/15 pt-4">
          <span className="text-[11px] font-semibold text-brand-secondary">
            Showing Page {page} of {pages} ({total} alerts)
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              className="h-8 px-3 text-[10px] w-auto font-bold"
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={page === pages}
              onClick={() => setPage(p => Math.min(p + 1, pages))}
              className="h-8 px-3 text-[10px] w-auto font-bold"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityAlertsPage;
