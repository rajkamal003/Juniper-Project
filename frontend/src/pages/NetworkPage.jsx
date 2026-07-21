// frontend/src/pages/NetworkPage.jsx
import React, { useState, useEffect } from 'react';
import { Globe, Plus, Search, Trash2, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { SearchBar } from '../components/ui/SearchBar';
import { ActionToolbar } from '../components/ui/ActionToolbar';
import { DataTable } from '../components/ui/DataTable';
import { EmptyState } from '../components/feedback/EmptyState';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { Input } from '../components/ui/Input';

export const NetworkPage = () => {
  const [subnets, setSubnets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');

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

  const fetchSubnets = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: search || undefined
      };
      const response = await api.get('/api/network/subnets', { params });
      if (response.data && response.data.success) {
        setSubnets(response.data.data.items);
        setTotal(response.data.data.total);
        setPages(response.data.data.pages);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load subnets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "SecureCampus AI | Network";
    fetchSubnets();
  }, [page]);

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
      const payload = {
        subnet_range: formData.subnet_range,
        gateway: formData.gateway || null,
        vlan_id: formData.vlan_id ? parseInt(formData.vlan_id, 10) : null,
        status: formData.status
      };
      const response = await api.post('/api/network/subnets', payload);
      if (response.data && response.data.success) {
        toast.success(response.data.message || 'Subnet provisioned successfully.');
        setIsModalOpen(false);
        setFormData({ subnet_range: '', gateway: '', vlan_id: '', status: 'Active' });
        fetchSubnets();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to provision subnet.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const response = await api.delete(`/api/network/subnets/${deleteDialog.subnetId}`);
      if (response.data && response.data.success) {
        toast.success('Subnet de-provisioned successfully.');
        setDeleteDialog({ isOpen: false, subnetId: null, subnetRange: '' });
        fetchSubnets();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to de-provision subnet.');
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
      </PageHeader>

      <form onSubmit={handleSearchSubmit}>
        <ActionToolbar
          searchBar={
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => {
                setSearch('');
                setPage(1);
                setTimeout(fetchSubnets, 0);
              }}
              placeholder="Search subnets, VLAN IDs..."
            />
          }
          actions={
            <Button
              type="button"
              variant="secondary"
              onClick={fetchSubnets}
              className="h-10 w-10 p-0 flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          }
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
                className="p-1.5 border border-red-500/25 rounded-lg hover:border-brand-danger hover:text-brand-danger transition-colors text-brand-secondary"
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
        <div className="flex items-center justify-between border-t border-[#334155]/15 pt-4">
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
              <button onClick={() => setIsModalOpen(false)} className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors focus:outline-none">
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
