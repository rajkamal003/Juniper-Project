// frontend/src/pages/NetworkPage.jsx
import React, { useState, useEffect } from 'react';
import { Globe, Plus, Search, Trash2, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/ui/PageHeader';
import { RefreshButton } from '../components/ui/RefreshButton';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { SearchBar } from '../components/ui/SearchBar';
import { ActionToolbar } from '../components/ui/ActionToolbar';
import { DataTable } from '../components/ui/DataTable';
import { EmptyState } from '../components/feedback/EmptyState';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { Input } from '../components/ui/Input';
import { simulationEngine } from '../services/simulationEngine';

export const NetworkPage = () => {
  const [subnets, setSubnets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  
  // Dynamic stats
  const [stats, setStats] = useState({
    health: '99.85%',
    latency: '4.2 ms',
    loss: '0.002%',
    clients: 142
  });

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    subnet_range: '',
    gateway: '',
    vlan_id: '',
    status: 'Active'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete Dialog States
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    subnetId: null,
    subnetRange: ''
  });
  const [deleting, setDeleting] = useState(false);

  const headers = ["Subnet Range", "Active Clients", "Access Points Count", "Gateway", "VLAN Mapped", "Status", "Actions"];

  // Reordered Flow: clear previous -> generate NEW data -> validate -> update state -> render
  const fetchSubnets = async () => {
    setLoading(true);
    try {
      // 1. Clear previous data
      setSubnets([]);
      
      // 2. Generate simulated subnet records
      const allGenerated = simulationEngine.generateSubnets();
      
      // 3. Filter/Search local simulation logic
      let filtered = allGenerated;
      if (search.trim()) {
        const query = search.toLowerCase();
        filtered = allGenerated.filter(s => 
          s.subnet_range.toLowerCase().includes(query) ||
          (s.vlan_id && s.vlan_id.toString().includes(query)) ||
          (s.gateway && s.gateway.toLowerCase().includes(query))
        );
      }

      // 4. Update React state
      const startIndex = (page - 1) * limit;
      const paginated = filtered.slice(startIndex, startIndex + limit);
      
      setSubnets(paginated);
      setTotal(filtered.length);
      setPages(Math.ceil(filtered.length / limit) || 1);

      // Recalculate stats dynamically based on current batch
      const calculatedStats = simulationEngine.calculateSubnetStats(filtered);
      setStats(calculatedStats);

    } catch (err) {
      toast.error('Failed to load subnets simulation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "SecureCampus AI | Network";
    fetchSubnets();
  }, [page, search]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    fetchSubnets();
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.subnet_range || !/^([0-9]{1,3}\.){3}[0-9]{1,3}\/[0-9]{1,2}$/.test(formData.subnet_range)) {
      errors.subnet_range = "Subnet range must be in valid CIDR format (e.g. 192.168.1.0/24).";
    }
    if (formData.gateway && !/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(formData.gateway)) {
      errors.gateway = "Gateway must be a valid IPv4 address.";
    }
    if (formData.vlan_id) {
      const vlan = parseInt(formData.vlan_id, 10);
      if (isNaN(vlan) || vlan < 1 || vlan > 4094) {
        errors.vlan_id = "VLAN ID must be an integer between 1 and 4094.";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      const newSubnet = {
        id: `subnet-custom-${Date.now()}`,
        subnet_range: formData.subnet_range,
        gateway: formData.gateway || '192.168.1.1',
        vlan_id: formData.vlan_id ? parseInt(formData.vlan_id, 10) : null,
        active_clients: Math.floor(Math.random() * 50) + 1,
        ap_count: Math.floor(Math.random() * 5) + 1,
        status: formData.status,
        network_health: '100.00%',
        packet_loss: '0.000%',
        latency: '3.5 ms'
      };

      setSubnets(prev => [newSubnet, ...prev]);
      setTotal(prev => prev + 1);
      toast.success('Subnet provisioned successfully.');
      setIsModalOpen(false);
      setFormData({ subnet_range: '', gateway: '', vlan_id: '', status: 'Active' });
    } catch (err) {
      toast.error('Failed to provision subnet.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      // Remove row immediately
      const updated = subnets.filter(s => s.id !== deleteDialog.subnetId);
      setSubnets(updated);
      setTotal(prev => Math.max(0, prev - 1));

      // Recalculate totals
      const calculatedStats = simulationEngine.calculateSubnetStats(updated);
      setStats(calculatedStats);

      toast.success('Subnet de-provisioned successfully.');
      setDeleteDialog({ isOpen: false, subnetId: null, subnetRange: '' });
    } catch (err) {
      toast.error('Failed to de-provision subnet.');
    } finally {
      setDeleting(false);
    }
  };

  const customEmptyState = (
    <EmptyState
      icon={Globe}
      title="No active network subnets provisioned"
      description="Provision dynamic subnets and assign VLAN ranges to manage client access loads."
    />
  );

  return (
    <div className="space-y-6 text-left">
      <Breadcrumb items={[{ name: "Network", path: "/network" }]} />

      <PageHeader
        title="Campus Networks Overview"
        subtitle="Manage VLAN parameters, dynamic subnets, and client load configurations"
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            onClick={() => {
              setFormData({ subnet_range: '', gateway: '', vlan_id: '', status: 'Active' });
              setFormErrors({});
              setIsModalOpen(true);
            }}
            className="h-10 px-4 text-xs font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Provision subnet</span>
          </Button>
          <RefreshButton
            isRefreshing={isRefreshing}
            setIsRefreshing={setIsRefreshing}
            onRefresh={fetchSubnets}
            pageName="Network"
          />
        </div>
      </PageHeader>

      <div className={`space-y-6 transition-opacity duration-300 ${isRefreshing ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        {/* Real-time Network Operations Center Overview Grid - Responsive layout for different screen sizes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
          <div className="p-4 bg-white border border-slate-200/80 shadow-sm rounded-2xl">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 font-mono block">Network Health</span>
            <span className="text-lg font-extrabold text-emerald-600 font-mono mt-1 block">{stats.health}</span>
            <span className="text-[9px] text-slate-500 mt-1 block">Excellent Link Integrity</span>
          </div>
          <div className="p-4 bg-white border border-slate-200/80 shadow-sm rounded-2xl">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 font-mono block">Network Latency</span>
            <span className="text-lg font-extrabold text-blue-600 font-mono mt-1 block">{stats.latency}</span>
            <span className="text-[9px] text-slate-500 mt-1 block">Standard Gateway Ping RTT</span>
          </div>
          <div className="p-4 bg-white border border-slate-200/80 shadow-sm rounded-2xl">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 font-mono block">Packet Loss Rate</span>
            <span className="text-lg font-extrabold text-slate-800 font-mono mt-1 block">{stats.loss}</span>
            <span className="text-[9px] text-emerald-600 mt-1 block">Highly Secure Shield Link</span>
          </div>
          <div className="p-4 bg-white border border-slate-200/80 shadow-sm rounded-2xl">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 font-mono block">Mist Wireless Clients</span>
            <span className="text-lg font-extrabold text-purple-600 font-mono mt-1 block">{stats.clients}</span>
            <span className="text-[9px] text-slate-500 mt-1 block">Load-Balanced across APs</span>
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
                }}
                placeholder="Search subnets, VLAN IDs..."
              />
            }
            actions={<div />}
          />
        </form>

        <DataTable
          headers={headers}
          rows={subnets}
          loading={loading}
          emptyState={customEmptyState}
          renderRow={(subnet) => (
            <>
              <td className="px-5 py-3 font-semibold text-brand-text font-mono text-[11px]">
                {subnet.subnet_range}
              </td>
              <td className="px-5 py-3 font-medium text-brand-secondary">
                {subnet.active_clients}
              </td>
              <td className="px-5 py-3 font-medium text-brand-secondary">
                {subnet.ap_count}
              </td>
              <td className="px-5 py-3 font-medium text-brand-secondary font-mono text-[11px]">
                {subnet.gateway || '--'}
              </td>
              <td className="px-5 py-3 font-semibold text-brand-primary text-[11px] font-mono">
                {subnet.vlan_id ? `VLAN ${subnet.vlan_id}` : '--'}
              </td>
              <td className="px-5 py-3">
                <StatusBadge status={subnet.status} />
              </td>
              <td className="px-5 py-3">
                <button
                  onClick={() => setDeleteDialog({ isOpen: true, subnetId: subnet.id, subnetRange: subnet.subnet_range })}
                  className="p-1.5 border border-red-500/25 rounded-lg hover:border-brand-danger hover:text-brand-danger transition-colors text-brand-secondary cursor-pointer"
                  title="De-provision Subnet"
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
              Showing Page {page} of {pages} ({total} subnets total)
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

      {/* Provision Subnet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-slate-900 border border-[#334155] rounded-2xl p-6 shadow-2xl z-10 select-none overflow-hidden animate-in scale-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
                <Globe className="w-5 h-5 text-brand-primary" />
                <span>Provision Network Subnet</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors focus:outline-none cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <Input
                label="Subnet Range (CIDR)"
                required
                placeholder="e.g. 192.168.1.0/24"
                value={formData.subnet_range}
                onChange={(e) => setFormData({ ...formData, subnet_range: e.target.value })}
                error={formErrors.subnet_range ? { message: formErrors.subnet_range } : null}
              />
              <Input
                label="Gateway IP (Optional)"
                placeholder="e.g. 192.168.1.1"
                value={formData.gateway}
                onChange={(e) => setFormData({ ...formData, gateway: e.target.value })}
                error={formErrors.gateway ? { message: formErrors.gateway } : null}
              />
              <Input
                label="VLAN ID (1-4094, Optional)"
                placeholder="e.g. 100"
                value={formData.vlan_id}
                onChange={(e) => setFormData({ ...formData, vlan_id: e.target.value })}
                error={formErrors.vlan_id ? { message: formErrors.vlan_id } : null}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]/30">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="h-11 px-5 w-auto">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={submitting} className="h-11 px-5 w-auto font-bold">
                  Provision Subnet
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        title="De-provision Subnet"
        confirmText="De-provision Subnet"
        confirmVariant="danger"
        loading={deleting}
        onClose={() => setDeleteDialog({ isOpen: false, subnetId: null, subnetRange: '' })}
        onConfirm={handleConfirmDelete}
        description={`Are you sure you want to de-provision subnet ${deleteDialog.subnetRange}? Active IP leases and gateway routes associated with this range will be soft-deleted.`}
      />
    </div>
  );
};

export default NetworkPage;
