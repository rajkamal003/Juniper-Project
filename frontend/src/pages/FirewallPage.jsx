// frontend/src/pages/FirewallPage.jsx
import React, { useState, useEffect } from 'react';
import { Shield, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
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
import { simulationEngine } from '../services/simulationEngine';

export const FirewallPage = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pages, setPages] = useState(1);
  const [limit] = useState(10);

  // Dynamic metrics state
  const [stats, setStats] = useState({
    activeRules: 0,
    blockCount: 0,
    threatScore: 0,
    blockedDomains: 0
  });

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

  const headers = ["Rule Name", "Priority", "Source (IP:Port)", "Destination (IP:Port)", "Protocol", "Action Policy", "Status", "Time Created", "Allowed Logs", "Blocked Logs", "Actions"];

  // Reordered Flow: clear -> generate -> validate -> set state -> render
  const fetchRules = async () => {
    setLoading(true);
    try {
      // 1. Clear previous
      setRules([]);

      // 2. Generate dynamic simulated firewall rules
      const allRules = simulationEngine.generateFirewallRules();

      // 3. Filter rules locally
      let filtered = allRules;
      if (search.trim()) {
        const query = search.toLowerCase();
        filtered = filtered.filter(r => 
          r.source_ip.toLowerCase().includes(query) ||
          r.destination.toLowerCase().includes(query) ||
          r.reason?.toLowerCase().includes(query)
        );
      }
      if (protocolFilter) {
        filtered = filtered.filter(r => r.protocol === protocolFilter);
      }
      if (policyFilter) {
        filtered = filtered.filter(r => r.policy === policyFilter);
      }

      // 4. Update React state
      const startIndex = (page - 1) * limit;
      const paginated = filtered.slice(startIndex, startIndex + limit);

      setRules(paginated);
      setTotal(filtered.length);
      setPages(Math.ceil(filtered.length / limit) || 1);

      // Recalculate stats based on simulated rules
      const calculatedStats = simulationEngine.calculateFirewallStats(filtered);
      setStats(calculatedStats);

    } catch (err) {
      toast.error("Failed to load simulated firewall rules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "SecureCampus AI | Firewall";
    fetchRules();
  }, [page, protocolFilter, policyFilter, search]);

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
      const newRule = {
        id: `rule-custom-${Date.now()}`,
        priority: parseInt(formData.priority, 10),
        source_ip: formData.source_ip,
        destination: formData.destination,
        protocol: formData.protocol,
        policy: formData.policy,
        status: formData.status,
        created_at: new Date().toISOString(),
        allowed_logs: formData.policy === 'ALLOW' ? Math.floor(Math.random() * 200) + 1 : 0,
        blocked_logs: formData.policy !== 'ALLOW' ? Math.floor(Math.random() * 200) + 1 : 0,
        threat_score: Math.floor(Math.random() * 30)
      };

      setRules(prev => [newRule, ...prev].sort((a, b) => a.priority - b.priority));
      setTotal(prev => prev + 1);
      toast.success('Traffic policy rule created.');
      setIsModalOpen(false);
      setFormData({ priority: '', source_ip: '', destination: '', protocol: 'TCP', policy: 'ALLOW', status: 'Active' });
    } catch (err) {
      toast.error('Failed to create traffic rule.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const updated = rules.filter(r => r.id !== deleteDialog.ruleId);
      setRules(updated);
      setTotal(prev => Math.max(0, prev - 1));

      // Recalculate totals
      const calculatedStats = simulationEngine.calculateFirewallStats(updated);
      setStats(calculatedStats);

      toast.success('Security policy rule soft-deleted successfully.');
      setDeleteDialog({ isOpen: false, ruleId: null, priority: '' });
    } catch (err) {
      toast.error('Failed to delete traffic rule.');
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
        {/* Live Threat Shield Metrics Grid - Responsive support */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 font-mono block">Active Rules</span>
            <span className="text-sm font-extrabold text-emerald-600 font-mono mt-1 block">{stats.activeRules} ENFORCED</span>
            <span className="text-[9px] text-slate-500 mt-1 block">Simulation Engine Shield</span>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 font-mono block">Threat Block Timeline</span>
            <span className="text-sm font-extrabold text-blue-600 font-mono mt-1 block">{stats.blockCount.toLocaleString()} Blocks</span>
            <span className="text-[9px] text-slate-500 mt-1 block">Mitigated overall logs</span>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 font-mono block">Max Threat Score</span>
            <span className="text-sm font-extrabold text-red-600 font-mono mt-1 block">{stats.threatScore} / 100</span>
            <span className="text-[9px] text-slate-500 mt-1 block">Highest threat index logged</span>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 font-mono block">Blocked Domains</span>
            <span className="text-sm font-extrabold text-purple-600 font-mono mt-1 block">{stats.blockedDomains} Domains</span>
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
            <td className="px-5 py-3 font-semibold text-slate-800 text-[11px] truncate max-w-[120px]" title={rule.rule_name}>
              {rule.rule_name || 'GEN_RULE'}
            </td>
            <td className="px-5 py-3 font-semibold text-slate-800 font-mono text-[11px]">
              #{rule.priority}
            </td>
            <td className="px-5 py-3 font-medium text-slate-600 font-mono text-[11px]">
              {rule.source_ip}:{rule.source_port || 'any'}
            </td>
            <td className="px-5 py-3 font-medium text-slate-600 font-mono text-[11px]">
              {rule.destination}:{rule.port || 'any'}
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
              {rule.policy === 'ALLOW' || rule.policy === 'Allow' ? (rule.allowed_logs || 0).toLocaleString() : '0'}
            </td>
            <td className="px-5 py-3 font-semibold text-red-600 font-mono text-[11px]">
              {rule.policy !== 'ALLOW' && rule.policy !== 'Allow' ? (rule.blocked_logs || 0).toLocaleString() : '0'}
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#334155]/15 pt-4">
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
