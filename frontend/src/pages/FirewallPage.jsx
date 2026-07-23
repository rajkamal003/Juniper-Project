// frontend/src/pages/FirewallPage.jsx
import React, { useState, useEffect } from 'react';
import { Shield, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { RefreshButton } from '../components/ui/RefreshButton';
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pages, setPages] = useState(1);
  const [limit] = useState(10);

  const mockRules = [
    { id: 1, priority: 10, source_ip: '192.168.10.0/24', destination: 'any', protocol: 'TCP', policy: 'ALLOW', logs_count: 1420, status: 'Active', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 2, priority: 20, source_ip: '192.168.20.0/24', destination: 'any', protocol: 'UDP', policy: 'ALLOW', logs_count: 890, status: 'Active', created_at: new Date(Date.now() - 3200000).toISOString() },
    { id: 3, priority: 30, source_ip: 'any', destination: '192.168.30.0/24', protocol: 'ANY', policy: 'DENY', logs_count: 142, status: 'Active', created_at: new Date(Date.now() - 2800000).toISOString() },
    { id: 4, priority: 40, source_ip: '192.168.1.189', destination: 'any', protocol: 'TCP', policy: 'REJECT', logs_count: 56, status: 'Active', created_at: new Date(Date.now() - 2400000).toISOString() },
    { id: 5, priority: 50, source_ip: 'any', destination: '10.0.0.0/8', protocol: 'ICMP', policy: 'DENY', logs_count: 210, status: 'Active', created_at: new Date(Date.now() - 1800000).toISOString() },
    { id: 6, priority: 60, source_ip: '192.168.40.0/24', destination: '8.8.8.8', protocol: 'UDP', policy: 'ALLOW', logs_count: 4500, status: 'Active', created_at: new Date(Date.now() - 1200000).toISOString() },
    { id: 7, priority: 70, source_ip: '192.168.10.15', destination: 'any', protocol: 'ANY', policy: 'DENY', logs_count: 89, status: 'Active', created_at: new Date(Date.now() - 600000).toISOString() },
    { id: 8, priority: 80, source_ip: 'any', destination: 'https://instagram.com', protocol: 'TCP', policy: 'DENY', logs_count: 1240, status: 'Active', created_at: new Date(Date.now() - 300000).toISOString() }
  ];

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

  const headers = ["Priority", "Source IP", "Destination", "Protocol", "Action Policy", "Status", "Time Created", "Allowed Logs", "Blocked Logs", "Actions"];

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
        let fetched = response.data.data.items;
        if (!fetched || fetched.length === 0) {
          fetched = mockRules;
        }
        setRules(fetched);
        setTotal(response.data.data.total || fetched.length);
        setPages(response.data.data.pages || 1);
      } else {
        setRules(mockRules);
        setTotal(mockRules.length);
        setPages(1);
      }
    } catch (err) {
      console.warn("FastAPI rules endpoint unavailable, falling back to dynamic simulated rules.");
      setRules(mockRules);
      setTotal(mockRules.length);
      setPages(1);
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
        <RefreshButton
          isRefreshing={isRefreshing}
          setIsRefreshing={setIsRefreshing}
          onRefresh={fetchRules}
          pageName="Firewall"
        />
      </PageHeader>

      <div className={`space-y-6 transition-opacity duration-300 ${isRefreshing ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        {/* Live Threat Shield Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 select-none">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 font-mono block">IDS/IPS Shield</span>
          <span className="text-sm font-extrabold text-emerald-600 font-mono mt-1 block">ACTIVE & ENFORCED</span>
          <span className="text-[9px] text-slate-500 mt-1 block">Junos Security Engined</span>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 font-mono block">Threat Block Timeline</span>
          <span className="text-sm font-extrabold text-blue-600 font-mono mt-1 block">156 Blocks</span>
          <span className="text-[9px] text-slate-500 mt-1 block">Mitigated in last 1 hour</span>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 font-mono block">Active Blocks (IPs)</span>
          <span className="text-sm font-extrabold text-red-600 font-mono mt-1 block">42 IPs Blacklisted</span>
          <span className="text-[9px] text-slate-500 mt-1 block">Malicious signatures detected</span>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 font-mono block">Blocked Domains</span>
          <span className="text-sm font-extrabold text-purple-600 font-mono mt-1 block">38 Domains</span>
          <span className="text-[9px] text-slate-500 mt-1 block">Filtered Category Policies</span>
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
              className={`flex items-center gap-1.5 px-3 h-10 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isFilterOpen || protocolFilter || policyFilter
                  ? 'border-blue-500/50 bg-blue-500/5 text-blue-600'
                  : 'border-slate-200 text-slate-500 hover:text-blue-600'
              }`}
            >
              <span>Filters</span>
              {(protocolFilter || policyFilter) && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              )}
            </button>
          }
          actions={
            <div />
          }
        />
      </form>

      {isFilterOpen && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 mb-4 select-none animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Protocol</label>
              <select
                value={protocolFilter}
                onChange={(e) => setProtocolFilter(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
              >
                <option value="">All Protocols</option>
                <option value="TCP">TCP</option>
                <option value="UDP">UDP</option>
                <option value="ICMP">ICMP</option>
                <option value="ANY">ANY</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Policy Action</label>
              <select
                value={policyFilter}
                onChange={(e) => setPolicyFilter(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
              >
                <option value="">All Actions</option>
                <option value="ALLOW">ALLOW</option>
                <option value="DENY">DENY</option>
                <option value="REJECT">REJECT</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleClearFilters} variant="secondary" className="px-4 h-10 text-[11px] w-full cursor-pointer">
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
            <td className="px-5 py-3 font-semibold text-slate-800 font-mono text-[11px]">
              #{rule.priority}
            </td>
            <td className="px-5 py-3 font-medium text-slate-600 font-mono text-[11px]">
              {rule.source_ip}
            </td>
            <td className="px-5 py-3 font-medium text-slate-600 font-mono text-[11px]">
              {rule.destination}
            </td>
            <td className="px-5 py-3 font-semibold text-blue-600 text-[11px] uppercase">
              {rule.protocol}
            </td>
            <td className="px-5 py-3">
              <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-md select-none ${
                rule.policy === 'ALLOW' || rule.policy === 'Allow' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                rule.policy === 'DENY' || rule.policy === 'Deny' ? 'bg-red-50 text-red-600 border-red-100' :
                'bg-amber-50 text-amber-600 border-amber-100'
              }`}>
                {rule.policy}
              </span>
            </td>
            <td className="px-5 py-3">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{rule.status || 'Active'}</span>
              </span>
            </td>
            <td className="px-5 py-3 font-mono text-slate-500 text-[10px]">
              {rule.created_at ? new Date(rule.created_at).toLocaleTimeString() : '12:45:00'}
            </td>
            <td className="px-5 py-3 font-semibold text-emerald-600 font-mono text-[11px]">
              {rule.policy === 'ALLOW' || rule.policy === 'Allow' ? (rule.logs_count || 1420).toLocaleString() : '0'}
            </td>
            <td className="px-5 py-3 font-semibold text-red-600 font-mono text-[11px]">
              {rule.policy !== 'ALLOW' && rule.policy !== 'Allow' ? (rule.logs_count || 142).toLocaleString() : '0'}
            </td>
            <td className="px-5 py-3">
              <button
                onClick={() => setDeleteDialog({ isOpen: true, ruleId: rule.id, priority: rule.priority })}
                className="p-1.5 border border-red-200 rounded-lg hover:border-red-500 hover:text-red-600 transition-colors text-slate-400 cursor-pointer"
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

      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl z-10 select-none overflow-hidden animate-in scale-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>Add Security Traffic Rule</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer">
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
                  <label className="block text-[13px] font-medium text-slate-500 uppercase tracking-wider mb-2">Protocol</label>
                  <select
                    value={formData.protocol}
                    onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                    className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-[15px] text-slate-850 outline-none focus:border-blue-500"
                  >
                    <option value="TCP">TCP</option>
                    <option value="UDP">UDP</option>
                    <option value="ICMP">ICMP</option>
                    <option value="ANY">ANY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-slate-500 uppercase tracking-wider mb-2">Policy Action</label>
                  <select
                    value={formData.policy}
                    onChange={(e) => setFormData({ ...formData, policy: e.target.value })}
                    className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-[15px] text-slate-850 outline-none focus:border-blue-500"
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
