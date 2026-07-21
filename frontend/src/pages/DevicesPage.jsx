// frontend/src/pages/DevicesPage.jsx
import React, { useState, useEffect } from 'react';
import { Network, Plus, Trash2, Edit, RefreshCw, X } from 'lucide-react';
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

export const DevicesPage = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncingJuniper, setSyncingJuniper] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(10);
  
  // Search and Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedDevice, setSelectedDevice] = useState(null);
  
  // Form Inputs
  const [formData, setFormData] = useState({
    device_name: '',
    model: '',
    ip_address: '',
    mac_address: '',
    device_type: 'Switch',
    status: 'Offline'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete Dialog States
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    deviceId: null,
    deviceName: ''
  });
  const [deleting, setDeleting] = useState(false);

  const headers = ["Device ID", "Model Name", "MAC Address", "Access Point IP", "Role Type", "Status", "Actions"];

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: search || undefined,
        device_type: typeFilter || undefined,
        status: statusFilter || undefined
      };
      const response = await api.get('/api/devices', { params });
      if (response.data && response.data.success) {
        setDevices(response.data.data.items);
        setTotal(response.data.data.total);
        setPages(response.data.data.pages);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load devices console data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncJuniper = async () => {
    setSyncingJuniper(true);
    try {
      const response = await api.post('/api/juniper/sync');
      if (response.data && response.data.success) {
        toast.success('Juniper hardware inventory synced successfully!');
        fetchDevices();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to sync Juniper hardware.');
    } finally {
      setSyncingJuniper(false);
    }
  };

  useEffect(() => {
    document.title = "SecureCampus AI | Devices";
    fetchDevices();
  }, [page, typeFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    fetchDevices();
  };

  const handleClearFilters = () => {
    setSearch('');
    setTypeFilter('');
    setStatusFilter('');
    setPage(1);
  };

  // Validators
  const validateForm = () => {
    const errors = {};
    if (!formData.device_name || !/^[a-zA-Z0-9.\-_]{1,253}$/.test(formData.device_name)) {
      errors.device_name = "Must be a valid alphanumeric hostname (no spaces, dots/dashes allowed).";
    }
    if (!formData.model.trim()) {
      errors.model = "Model is required.";
    }
    if (formData.ip_address) {
      const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
      if (!ipv4Regex.test(formData.ip_address) && !ipv6Regex.test(formData.ip_address)) {
        errors.ip_address = "IP address must be a valid IPv4 or IPv6 format.";
      }
    }
    if (formData.mac_address && !/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(formData.mac_address)) {
      errors.mac_address = "MAC address must be in format XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData({
      device_name: '',
      model: '',
      ip_address: '',
      mac_address: '',
      device_type: 'Switch',
      status: 'Offline'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (device) => {
    setModalMode('edit');
    setSelectedDevice(device);
    setFormData({
      device_name: device.device_name,
      model: device.model,
      ip_address: device.ip_address || '',
      mac_address: device.mac_address || '',
      device_type: device.device_type,
      status: device.status
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      if (modalMode === 'create') {
        const response = await api.post('/api/devices', formData);
        if (response.data && response.data.success) {
          toast.success(response.data.message || 'Device registered successfully.');
          setIsModalOpen(false);
          fetchDevices();
        }
      } else {
        const response = await api.put(`/api/devices/${selectedDevice.id}`, formData);
        if (response.data && response.data.success) {
          toast.success(response.data.message || 'Device configurations updated.');
          setIsModalOpen(false);
          fetchDevices();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit device configurations.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteDialog = (device) => {
    setDeleteDialog({
      isOpen: true,
      deviceId: device.id,
      deviceName: device.device_name
    });
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const response = await api.delete(`/api/devices/${deleteDialog.deviceId}`);
      if (response.data && response.data.success) {
        toast.success('Device soft-deleted successfully.');
        setDeleteDialog({ isOpen: false, deviceId: null, deviceName: '' });
        fetchDevices();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete device.');
    } finally {
      setDeleting(false);
    }
  };

  const customEmptyState = (
    <EmptyState
      icon={Network}
      title="No devices registered yet"
      description="Register enterprise nodes (Switches, Access Points, Firewalls) to track active configurations."
    />
  );

  return (
    <div className="space-y-6 text-left">
      <Breadcrumb items={[{ name: "Devices", path: "/devices" }]} />
      
      <PageHeader 
        title="Network Devices Console" 
        subtitle="Review, register, and monitor managed enterprise network nodes"
      >
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            onClick={handleSyncJuniper}
            loading={syncingJuniper}
            className="h-10 px-4 text-xs font-bold flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncingJuniper ? 'animate-spin' : ''}`} />
            <span>Sync Hardware Telemetry</span>
          </Button>
          <Button 
            variant="primary" 
            onClick={handleOpenCreateModal}
            className="h-10 px-4 text-xs font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Discover Node</span>
          </Button>
        </div>
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
                setTimeout(fetchDevices, 0);
              }}
              placeholder="Search managed nodes..."
            />
          }
          filterButton={
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-1.5 px-3 h-10 border rounded-xl text-xs font-bold transition-all ${
                isFilterOpen || typeFilter || statusFilter
                  ? 'border-brand-primary/50 bg-brand-primary/5 text-brand-primary'
                  : 'border-[#334155]/40 text-brand-secondary hover:text-brand-primary'
              }`}
            >
              <span>Filters</span>
              {(typeFilter || statusFilter) && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
              )}
            </button>
          }
          actions={
            <Button
              type="button"
              variant="secondary"
              onClick={fetchDevices}
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
              <label className="block text-[10px] font-bold text-brand-secondary uppercase tracking-wider mb-2">Device Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full h-10 px-3 bg-slate-900/40 border border-[#334155]/40 rounded-xl text-xs text-brand-text outline-none focus:border-brand-primary"
              >
                <option value="">All Types</option>
                <option value="Switch">Switch</option>
                <option value="Access Point">Access Point</option>
                <option value="Firewall">Firewall</option>
                <option value="Router">Router</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-brand-secondary uppercase tracking-wider mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 bg-slate-900/40 border border-[#334155]/40 rounded-xl text-xs text-brand-text outline-none focus:border-brand-primary"
              >
                <option value="">All Statuses</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Maintenance">Maintenance</option>
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
        rows={devices}
        loading={loading}
        emptyState={customEmptyState}
        renderRow={(device) => (
          <>
            <td className="px-5 py-3 font-semibold text-brand-text font-mono text-[11px]">
              {device.device_name}
            </td>
            <td className="px-5 py-3 font-medium text-brand-secondary">
              {device.model}
            </td>
            <td className="px-5 py-3 font-medium text-brand-secondary font-mono text-[11px]">
              {device.mac_address || '--'}
            </td>
            <td className="px-5 py-3 font-medium text-brand-secondary font-mono text-[11px]">
              {device.ip_address || '--'}
            </td>
            <td className="px-5 py-3 font-semibold text-brand-primary text-[11px]">
              {device.device_type}
            </td>
            <td className="px-5 py-3">
              <StatusBadge status={device.status} />
            </td>
            <td className="px-5 py-3 flex gap-2">
              <button 
                onClick={() => handleOpenEditModal(device)}
                className="p-1.5 border border-[#334155]/40 rounded-lg hover:border-brand-primary hover:text-brand-primary transition-colors"
                title="Edit Configuration"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => handleOpenDeleteDialog(device)}
                className="p-1.5 border border-red-500/25 rounded-lg hover:border-brand-danger hover:text-brand-danger transition-colors text-brand-secondary"
                title="De-register Device"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </td>
          </>
        )}
      />

      {/* Pagination Footer */}
      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-[#334155]/15 pt-4">
          <span className="text-[11px] font-semibold text-brand-secondary">
            Showing Page {page} of {pages} ({total} devices total)
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

      {/* Discover Node Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-slate-900 border border-[#334155] rounded-2xl p-6 shadow-2xl z-10 select-none overflow-hidden animate-in scale-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
                <Network className="w-5 h-5 text-brand-primary" />
                <span>{modalMode === 'create' ? 'Register New Device' : 'Edit Device Configuration'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors focus:outline-none">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <Input
                label="Device Hostname"
                required
                placeholder="e.g. Core-Switch-01"
                value={formData.device_name}
                onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
                error={formErrors.device_name ? { message: formErrors.device_name } : null}
              />
              <Input
                label="Device Model"
                required
                placeholder="e.g. EX2300-C"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                error={formErrors.model ? { message: formErrors.model } : null}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="IP Address (Optional)"
                  placeholder="e.g. 192.168.1.10"
                  value={formData.ip_address}
                  onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                  error={formErrors.ip_address ? { message: formErrors.ip_address } : null}
                />
                <Input
                  label="MAC Address (Optional)"
                  placeholder="e.g. AA:BB:CC:DD:EE:FF"
                  value={formData.mac_address}
                  onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
                  error={formErrors.mac_address ? { message: formErrors.mac_address } : null}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-brand-secondary uppercase tracking-wider mb-2">Device Type</label>
                  <select
                    value={formData.device_type}
                    onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
                    className="w-full h-12 px-4 bg-slate-900/40 border border-[#334155] rounded-xl text-[15px] text-brand-text outline-none focus:border-brand-primary"
                  >
                    <option value="Switch">Switch</option>
                    <option value="Access Point">Access Point</option>
                    <option value="Firewall">Firewall</option>
                    <option value="Router">Router</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-brand-secondary uppercase tracking-wider mb-2">Operational Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full h-12 px-4 bg-slate-900/40 border border-[#334155] rounded-xl text-[15px] text-brand-text outline-none focus:border-brand-primary"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]/30">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="h-11 px-5 w-auto">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={submitting} className="h-11 px-5 w-auto font-bold">
                  {modalMode === 'create' ? 'Register Node' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        title="De-register Device"
        confirmText="Confirm De-registration"
        confirmVariant="danger"
        loading={deleting}
        onClose={() => setDeleteDialog({ isOpen: false, deviceId: null, deviceName: '' })}
        onConfirm={handleConfirmDelete}
        description={`Are you sure you want to de-register ${deleteDialog.deviceName}? This operational device node configurations will be flagged as deleted and suspended.`}
      />
    </div>
  );
};

export default DevicesPage;
