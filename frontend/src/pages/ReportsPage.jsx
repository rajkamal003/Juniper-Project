// frontend/src/pages/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Plus, RefreshCw, Download, FileText, Settings, ShieldAlert, Users, Layers, Activity } from 'lucide-react';
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

export const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Form States
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('Security Summary');
  const [fileFormat, setFileFormat] = useState('PDF');
  const [submitting, setSubmitting] = useState(false);

  const headers = ["Report Title", "Type", "Format", "Size", "Duration", "Downloads", "Generated At", "Actions"];

  const templates = [
    { name: 'Security Summary', icon: ShieldAlert, desc: 'Overall security posture & metrics' },
    { name: 'Login Activity', icon: Users, desc: 'User logs, sessions & timestamps' },
    { name: 'Visitor Activity', icon: Users, desc: 'Visitor permits & access logs' },
    { name: 'Exam Sessions', icon: Layers, desc: 'Academic exam logs & statuses' },
    { name: 'Device Inventory', icon: Layers, desc: 'Connected APs, switch & firewalls' },
    { name: 'Device Health', icon: Activity, desc: 'CPU, Memory & temperature history' },
    { name: 'Firewall Policies', icon: ShieldAlert, desc: 'Active security rules telemetry' },
    { name: 'Alert History', icon: ShieldAlert, desc: 'AI-assisted threat alerts history' }
  ];

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/reports/history', { params: { page, limit: 10 } });
      if (response.data && response.data.success) {
        setReports(response.data.data.items);
        setTotal(response.data.data.total);
        setPages(response.data.data.pages);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load report history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "SecureCampus AI | Reports Console";
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
        report_type: reportType,
        file_format: fileFormat
      };
      const response = await api.post('/api/reports/generate', payload);
      if (response.data && response.data.success) {
        toast.success(response.data.message || 'Report generated successfully.');
        setReportName('');
        fetchReports();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate report.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (reportId, filename) => {
    try {
      const response = await api.get(`/api/reports/download/${reportId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report file download started.');
      // Refresh list to update download count
      fetchReports();
    } catch (err) {
      toast.error('Failed to download report file.');
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 text-left">
      <Breadcrumb items={[{ name: "Reports", path: "/reports" }]} />

      <PageHeader
        title="Audit Reports Console"
        subtitle="Compile, configure, and export rule-based campus analytics and security logs"
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
            <div className="space-y-2 mt-2 max-h-[300px] overflow-y-auto pr-1">
              {templates.map((t) => {
                const IconComponent = t.icon;
                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => {
                      setReportType(t.name);
                      if (!reportName) {
                        setReportName(`Audit - ${t.name}`);
                      }
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                      reportType === t.name
                        ? 'bg-brand-primary/10 border-brand-primary/40 text-brand-primary font-semibold'
                        : 'bg-slate-900/40 border-[#334155]/25 text-brand-secondary hover:text-brand-text'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="text-[13px] font-semibold">{t.name}</div>
                      <div className="text-[10px] opacity-75 font-normal">{t.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-5 text-left">
            <SectionTitle>Configure Export</SectionTitle>
            <form onSubmit={handleCreateReport} className="space-y-4 mt-2">
              <Input
                label="Report Document Name"
                required
                placeholder="e.g. Weekly Campus Security Audit"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              />
              
              <div>
                <label className="block text-[13px] font-medium text-brand-secondary uppercase tracking-wider mb-2">Selected Template</label>
                <input
                  type="text"
                  disabled
                  value={reportType}
                  className="w-full h-12 px-4 bg-slate-900/40 border border-[#334155] rounded-xl text-[14px] text-brand-primary font-semibold outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-brand-secondary uppercase tracking-wider mb-2">Export Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {['PDF', 'CSV', 'Excel'].map((format) => (
                    <button
                      key={format}
                      type="button"
                      onClick={() => setFileFormat(format)}
                      className={`h-11 rounded-xl border font-bold text-xs transition-all ${
                        fileFormat === format
                          ? 'bg-brand-primary/10 border-brand-primary/40 text-brand-primary'
                          : 'bg-slate-900/40 border-[#334155]/25 text-brand-secondary hover:text-brand-text'
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                className="w-full h-11 text-xs font-bold flex items-center justify-center gap-2 mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Generate Audit Report</span>
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
                title="No reports compiled yet"
                description="Select a template and export format in the left panel to compile a network audit report."
                className="h-full min-h-[400px]"
              />
            }
            renderRow={(report) => (
              <>
                <td className="px-5 py-3 font-semibold text-brand-text">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>{report.report_name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 font-medium text-brand-secondary text-[12px]">
                  {report.report_type}
                </td>
                <td className="px-5 py-3 font-semibold text-brand-text text-[11px]">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                    report.file_format === 'PDF' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : (
                      report.file_format === 'Excel' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    )
                  }`}>
                    {report.file_format}
                  </span>
                </td>
                <td className="px-5 py-3 font-medium text-brand-secondary text-[11px] font-mono">
                  {formatBytes(report.file_size)}
                </td>
                <td className="px-5 py-3 font-medium text-brand-secondary text-[11px] font-mono">
                  {report.generation_duration.toFixed(3)}s
                </td>
                <td className="px-5 py-3 font-medium text-brand-secondary text-[11px] font-mono text-center">
                  {report.download_count}
                </td>
                <td className="px-5 py-3 font-medium text-brand-secondary text-[11px] font-mono">
                  {new Date(report.generated_at).toLocaleString()}
                </td>
                <td className="px-5 py-3">
                  <Button
                    variant="secondary"
                    onClick={() => handleDownload(report.id, report.file_name)}
                    className="h-8 w-8 p-0 flex items-center justify-center text-brand-primary hover:text-white"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </>
            )}
          />

          {pages > 1 && (
            <div className="flex items-center justify-between border-t border-[#334155]/15 pt-4">
              <span className="text-[11px] font-semibold text-brand-secondary">
                Showing Page {page} of {pages} ({total} reports)
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
