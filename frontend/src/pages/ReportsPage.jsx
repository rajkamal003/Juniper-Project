// frontend/src/pages/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/feedback/EmptyState';
import { Card } from '../components/ui/Card';
import { SectionTitle } from '../components/ui/SectionTitle';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';

export const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Form States
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('Threat Intelligence Logs');
  const [submitting, setSubmitting] = useState(false);

  const headers = ["Report ID", "Report Title", "Type", "Status", "Requested At"];

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/reports', { params: { page, limit: 10 } });
      if (response.data && response.data.success) {
        setReports(response.data.data.items);
        setTotal(response.data.data.total);
        setPages(response.data.data.pages);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load report logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "SecureCampus AI | Reports";
    fetchReports();
  }, [page]);

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!reportName.trim()) {
      toast.error('Please enter a valid report title.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        report_name: reportName,
        report_type: reportType
      };
      const response = await api.post('/api/reports', payload);
      if (response.data && response.data.success) {
        toast.success(response.data.message || 'Report compile request submitted.');
        setReportName('');
        fetchReports();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <Breadcrumb items={[{ name: "Reports", path: "/reports" }]} />

      <PageHeader
        title="Audit Reports Console"
        subtitle="Compile, filter, and export threat intelligence and user action reports"
      >
        <Button
          variant="secondary"
          onClick={fetchReports}
          className="h-10 w-10 p-0 flex items-center justify-center"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Parameters Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-5 select-none text-left">
            <SectionTitle>Available Templates</SectionTitle>
            <div className="space-y-3 text-xs">
              <button
                type="button"
                onClick={() => setReportType('Threat Intelligence Logs')}
                className={`w-full flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                  reportType === 'Threat Intelligence Logs'
                    ? 'bg-brand-primary/10 border-brand-primary/40 text-brand-primary font-semibold'
                    : 'bg-slate-900/40 border-[#334155]/25 text-brand-secondary hover:text-brand-text'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                <span>Threat Intelligence Logs</span>
              </button>
              <button
                type="button"
                onClick={() => setReportType('User Session Activity')}
                className={`w-full flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                  reportType === 'User Session Activity'
                    ? 'bg-brand-primary/10 border-brand-primary/40 text-brand-primary font-semibold'
                    : 'bg-slate-900/40 border-[#334155]/25 text-brand-secondary hover:text-brand-text'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                <span>User Session Activity</span>
              </button>
              <button
                type="button"
                onClick={() => setReportType('Firewall Rule Logs')}
                className={`w-full flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                  reportType === 'Firewall Rule Logs'
                    ? 'bg-brand-primary/10 border-brand-primary/40 text-brand-primary font-semibold'
                    : 'bg-slate-900/40 border-[#334155]/25 text-brand-secondary hover:text-brand-text'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                <span>Firewall Rule Logs</span>
              </button>
            </div>
          </Card>

          <Card className="p-5 text-left">
            <SectionTitle>Request Compilation</SectionTitle>
            <form onSubmit={handleCreateReport} className="space-y-4">
              <Input
                label="Report Title"
                required
                placeholder="e.g. Q3 Campus Threat Audit"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              />
              <div>
                <label className="block text-[13px] font-medium text-brand-secondary uppercase tracking-wider mb-2">Selected Type</label>
                <input
                  type="text"
                  disabled
                  value={reportType}
                  className="w-full h-12 px-4 bg-slate-900/40 border border-[#334155] rounded-xl text-[14px] text-brand-primary font-semibold outline-none cursor-not-allowed"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                className="w-full h-11 text-xs font-bold flex items-center justify-center gap-2 mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Generate Report Request</span>
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Side: Compiled Requests Log */}
        <div className="lg:col-span-2 space-y-4">
          <DataTable
            headers={headers}
            rows={reports}
            loading={loading}
            emptyState={
              <EmptyState
                icon={FileSpreadsheet}
                title="No report compile requests submitted"
                description="Use the configuration panel to select a template and submit a report request."
                className="h-full min-h-[400px]"
              />
            }
            renderRow={(report) => (
              <>
                <td className="px-5 py-3 font-semibold text-brand-text font-mono text-[11px]">
                  #{report.id}
                </td>
                <td className="px-5 py-3 font-semibold text-brand-text">
                  {report.report_name}
                </td>
                <td className="px-5 py-3 font-medium text-brand-secondary text-[11px]">
                  {report.report_type}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={report.status} />
                </td>
                <td className="px-5 py-3 font-medium text-brand-secondary text-[11px] font-mono">
                  {new Date(report.created_at).toLocaleString()}
                </td>
              </>
            )}
          />

          {pages > 1 && (
            <div className="flex items-center justify-between border-t border-[#334155]/15 pt-4">
              <span className="text-[11px] font-semibold text-brand-secondary">
                Showing Page {page} of {pages} ({total} report requests)
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
      </div>
    </div>
  );
};

export default ReportsPage;
