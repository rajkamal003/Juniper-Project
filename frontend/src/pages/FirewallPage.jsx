// frontend/src/pages/FirewallPage.jsx
import React, { useState, useEffect } from 'react';
import { Shield, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { SearchBar } from '../components/ui/SearchBar';
import { ActionToolbar } from '../components/ui/ActionToolbar';
import { DataTable } from '../components/ui/DataTable';
import { EmptyState } from '../components/feedback/EmptyState';
import { Button } from '../components/ui/Button';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { Input } from '../components/ui/Input';

export const FirewallPage = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(10);

  // Search and Filters
  const [search, setSearch] = useState('');
  const [protocolFilter, setProtocolFilter] = useState('');
  const [policyFilter, setPolicyFilter] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    priority: '',
    source_ip: '',
    destination: '',
    protocol: 'TCP',
    policy: 'ALLOW',
    status: 'Active'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete Dialog States
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    ruleId: null,
    priority: ''
  });
  const [deleting, setDeleting] = useState(false);

  const headers = ["Rule Priority", "Source IP", "Destination", "Protocol", "Action Policy", "Audit Logs", "Actions"];

  const fetchRules = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: search || undefined,
        protocol: protocolFilter || undefined,
        policy_action: policyFilter || undefined
      };
      const response = await api.get('/api/firewall/rules', { params });
      if (response.data && response.data.success) {
        setRules(response.data.data.items);
        setTotal(response.data.data.total);
        setPages(response.data.data.pages);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load security policies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "SecureCampus AI | Firewall";
    fetchRules();
  }, [page, protocolFilter, policyFilter]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    fetchRules();
  };

  const handleClearFilters = () => {
    setSearch('');
    setProtocolFilter('');
    setPolicyFilter('');
    setPage(1);
  };

  const validateForm = () => {
    const errors = {};
    const prio = parseInt(formData.priority, 10);
    if (isNaN(prio) || prio <= 0) {
      errors.priority = "Priority must be a positive integer.";
    }
    if (!formData.source_ip.trim()) {
      errors.source_ip = "Source IP/CIDR is required.";
    }
    if (!formData.destination.trim()) {
      errors.destination = "Destination IP/CIDR is required.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      const payload = {
        priority: parseInt(formData.priority, 10),
        source_ip: formData.source_ip,
        destination: formData.destination,
        protocol: formData.protocol,
        policy: formData.policy,
        status: formData.status
      };
      const response = await api.post('/api/firewall/rules', payload);
      if (response.data && response.data.success) {
        toast.success(response.data.message || 'Traffic policy rule created.');
        setIsModalOpen(false);
        setFormData({ priority: '', source_ip: '', destination: '', protocol: 'TCP', policy: 'ALLOW', status: 'Active' });
        fetchRules();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create traffic rule.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const response = await api.delete(`/api/firewall/rules/${deleteDialog.ruleId}`);
      if (response.data && response.data.success) {
        toast.success('Security policy rule soft-deleted successfully.');
        setDeleteDialog({ isOpen: false, ruleId: null, priority: '' });
        fetchRules();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete traffic rule.');
    } finally {
      setDeleting(false);
    }
  };

  const customEmptyState = (
    <EmptyState
      icon={Shield}
      title="No security policy rules logged"
      description="Create traffic inspection rules (Allow/Deny/Reject) to filter incoming campus network requests."
    />
  );

  return (
    <div className="space-y-6 text-left">
      <Breadcrumb items={[{ name: "Firewall", path: "/firewall" }]} />

      <PageHeader
        title="Firewall Control Panel"
        subtitle="Manage inbound traffic rules, IP blocks, and campus port policies"
      >
        <Button
          variant="primary"
          onClick={() => {
            setFormData({ priority: '', source_ip: '', destination: '', protocol: 'TCP', policy: 'ALLOW', status: 'Active' });
            setFormErrors({});
            setIsModalOpen(true);
          }}
          className="h-10 px-4 text-xs font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Traffic Rule</span>
        </Button>
      </PageHeader>

      {/* Live Threat Shield Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 select-none">
        <div className="p-4 bg-slate-900 border border-[#334155]/40 rounded-2xl">
          <span className="text-[10px] font-extrabold uppercase text-slate-500 font-mono block">IDS/IPS Shield</span>
          <span className="text-lg font-extrabold text-emerald-400 font-mono mt-1 block">ACTIVE & ENFORCED</span>
          <span className="text-[9px] text-brand-secondary mt-1 block">Junos Security Engined</span>
        </div>
        <div className="p-4 bg-slate-900 border border-[#334155]/40 rounded-2xl">
          <span className="text-[10px] font-extrabold uppercase text-slate-500 font-mono block">Threat Block Timeline</span>
          <span className="text-lg font-extrabold text-brand-primary font-mono mt-1 block">156 Blocks</span>
          <span className="text-[9px] text-brand-secondary mt-1 block">Mitigated in last 1 hour</span>
        </div>
        <div className="p-4 bg-slate-900 border border-[#334155]/40 rounded-2xl">
          <span className="text-[10px] font-extrabold uppercase text-slate-500 font-mono block">Active Blocks (IPs)</span>
          <span className="text-lg font-extrabold text-red-400 font-mono mt-1 block">42 IPs Blacklisted</span>
          <span className="text-[9px] text-brand-secondary mt-1 block">Malicious signatures detected</span>
        </div>
        <div className="p-4 bg-slate-900 border border-[#334155]/40 rounded-2xl">
          <span className="text-[10px] font-extrabold uppercase text-slate-500 font-mono block">Blocked Domains</span>
          <span className="text-lg font-extrabold text-purple-400 font-mono mt-1 block">38 Domains</span>
          <span className="text-[9px] text-brand-secondary mt-1 block">Filtered Category Policies</span>
        </div>
      </div>

      <form onSubmit={handleSearchSubmit}>
        <ActionToolbar
          searchBar={
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => {
                setSearch('');
                setPage(1);
                setTimeout(fetchRules, 0);
              }}
              placeholder="Search active policies..."
            />
          }
          filterButton={
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-1.5 px-3 h-10 border rounded-xl text-xs font-bold transition-all ${
                isFilterOpen || protocolFilter || policyFilter
                  ? 'border-brand-primary/50 bg-brand-primary/5 text-brand-primary'
                  : 'border-[#334155]/40 text-brand-secondary hover:text-brand-primary'
              }`}
            >
              <span>Filters</span>
              {(protocolFilter || policyFilter) && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
              )}
            </button>
          }
          actions={
            <Button
              type="button"
              variant="secondary"
              onClick={fetchRules}
              className="h-10 w-10 p-0 flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          }
        />
      </form>

      {isFilterOpen && (
        <div className="bg-slate-900/30 border border-[#334155]/30 rounded-xl p-4 space-y-4 mb-4 select-none animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-[10px] font-bold text-brand-secondary uppercase tracking-wider mb-2">Protocol</label>
              <select
                value={protocolFilter}
                onChange={(e) => setProtocolFilter(e.target.value)}
                className="w-full h-10 px-3 bg-slate-900/40 border border-[#334155]/40 rounded-xl text-xs text-brand-text outline-none focus:border-brand-primary"
              >
                <option value="">All Protocols</option>
                <option value="TCP">TCP</option>
                <option value="UDP">UDP</option>
                <option value="ICMP">ICMP</option>
                <option value="ANY">ANY</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-brand-secondary uppercase tracking-wider mb-2">Policy Action</label>
              <select
                value={policyFilter}
                onChange={(e) => setPolicyFilter(e.target.value)}
                className="w-full h-10 px-3 bg-slate-900/40 border border-[#334155]/40 rounded-xl text-xs text-brand-text outline-none focus:border-brand-primary"
              >
                <option value="">All Actions</option>
                <option value="ALLOW">ALLOW</option>
                <option value="DENY">DENY</option>
                <option value="REJECT">REJECT</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleClearFilters} variant="secondary" className="px-4 h-10 text-[11px] w-full">
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      <DataTable
        headers={headers}
        rows={rules}
        loading={loading}
        emptyState={customEmptyState}
        renderRow={(rule) => (
          <>
            <td className="px-5 py-3 font-semibold text-brand-text font-mono text-[11px]">
              #{rule.priority}
            </td>
            <td className="px-5 py-3 font-medium text-brand-secondary font-mono text-[11px]">
              {rule.source_ip}
            </td>
            <td className="px-5 py-3 font-medium text-brand-secondary font-mono text-[11px]">
              {rule.destination}
            </td>
            <td className="px-5 py-3 font-semibold text-brand-primary text-[11px] uppercase">
              {rule.protocol}
            </td>
            <td className="px-5 py-3">
              <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-md select-none ${
                rule.policy === 'ALLOW' ? 'bg-emerald-500/10 text-brand-success border-brand-success/20' :
                rule.policy === 'DENY' ? 'bg-red-500/10 text-brand-danger border-brand-danger/20' :
                'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {rule.policy}
              </span>
            </td>
            <td className="px-5 py-3 font-medium text-brand-secondary">
              {rule.logs_count} matched
            </td>
            <td className="px-5 py-3">
              <button
                onClick={() => setDeleteDialog({ isOpen: true, ruleId: rule.id, priority: rule.priority })}
                className="p-1.5 border border-red-500/25 rounded-lg hover:border-brand-danger hover:text-brand-danger transition-colors text-brand-secondary"
                title="Delete Policy Rule"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </td>
          </>
        )}
      />

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-[#334155]/15 pt-4">
          <span className="text-[11px] font-semibold text-brand-secondary">
            Showing Page {page} of {pages} ({total} policy rules total)
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-slate-900 border border-[#334155] rounded-2xl p-6 shadow-2xl z-10 select-none overflow-hidden animate-in scale-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand-primary" />
                <span>Add Security Traffic Rule</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors focus:outline-none">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <Input
                label="Rule Priority Order"
                required
                type="number"
                placeholder="e.g. 10"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                error={formErrors.priority ? { message: formErrors.priority } : null}
              />
              <Input
                label="Source IP / Subnet (CIDR or 'any')"
                required
                placeholder="e.g. 192.168.1.0/24 or any"
                value={formData.source_ip}
                onChange={(e) => setFormData({ ...formData, source_ip: e.target.value })}
                error={formErrors.source_ip ? { message: formErrors.source_ip } : null}
              />
              <Input
                label="Destination IP / Subnet (CIDR or 'any')"
                required
                placeholder="e.g. 10.0.0.0/8 or any"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                error={formErrors.destination ? { message: formErrors.destination } : null}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-brand-secondary uppercase tracking-wider mb-2">Protocol</label>
                  <select
                    value={formData.protocol}
                    onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                    className="w-full h-12 px-4 bg-slate-900/40 border border-[#334155] rounded-xl text-[15px] text-brand-text outline-none focus:border-brand-primary"
                  >
                    <option value="TCP">TCP</option>
                    <option value="UDP">UDP</option>
                    <option value="ICMP">ICMP</option>
                    <option value="ANY">ANY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-brand-secondary uppercase tracking-wider mb-2">Policy Action</label>
                  <select
                    value={formData.policy}
                    onChange={(e) => setFormData({ ...formData, policy: e.target.value })}
                    className="w-full h-12 px-4 bg-slate-900/40 border border-[#334155] rounded-xl text-[15px] text-brand-text outline-none focus:border-brand-primary"
                  >
                    <option value="ALLOW">ALLOW</option>
                    <option value="DENY">DENY</option>
                    <option value="REJECT">REJECT</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]/30">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="h-11 px-5 w-auto">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={submitting} className="h-11 px-5 w-auto font-bold">
                  Add Rule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Traffic Rule"
        confirmText="Delete Rule"
        confirmVariant="danger"
        loading={deleting}
        onClose={() => setDeleteDialog({ isOpen: false, ruleId: null, priority: '' })}
        onConfirm={handleConfirmDelete}
        description={`Are you sure you want to delete policy rule priority #${deleteDialog.priority}? Inbound packet filtering will bypass this rule.`}
      />
    </div>
  );
};

export default FirewallPage;
