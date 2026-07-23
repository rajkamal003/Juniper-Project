// frontend/src/pages/UserManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Search, Filter, ShieldAlert, Key, Settings, Check, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { UserTable } from '../components/ui/UserTable';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { DEPARTMENTS } from '../constants/constants';
import { PageHeader } from '../components/ui/PageHeader';
import { RefreshButton } from '../components/ui/RefreshButton';
import { UserNetworkAnalyticsDashboard } from '../components/ui/UserNetworkAnalyticsDashboard';

export const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // Access Control: Block Student (3) and Guest (5)
  useEffect(() => {
    if (currentUser && [3, 5].includes(currentUser.role_id)) {
      toast.error('Access restricted to administrators and operators');
      navigate('/403');
    }
  }, [currentUser, navigate]);

  // Page States
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [systemSettings, setSystemSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters State
  const [search, setSearch] = useState('');
  const [roleId, setRoleId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Confirmation Modals State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: '', // approve, reject, suspend, activate, reset
    user: null,
    loading: false
  });

  // Admin Overwrite Password Form state
  const [tempPassword, setTempPassword] = useState('');
  const [selectedUserForAnalytics, setSelectedUserForAnalytics] = useState(null);

  useEffect(() => {
    document.title = "SecureCampus AI | User Management";
    fetchUsers();
    fetchSystemSettings();
  }, [page, roleId, statusFilter, deptFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: pageSize,
        search: search || undefined,
        role_id: roleId ? parseInt(roleId, 10) : undefined,
        account_status: statusFilter || undefined,
        department: deptFilter || undefined
      };
      const response = await api.get('/api/users', { params });
      setUsers(response.data.users);
      setTotal(response.data.total);
    } catch {
      toast.error('Failed to load campus users');
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemSettings = async () => {
    try {
      const response = await api.get('/api/auth/settings');
      setSystemSettings(response.data);
    } catch {
      // Handled silently
    }
  };

  const toggleApprovalMode = async () => {
    if (!systemSettings) return;
    setLoadingSettings(true);
    const newMode = systemSettings.account_approval_mode === 'AUTO' ? 'ADMIN' : 'AUTO';
    try {
      const response = await api.put('/api/users/settings/config', {
        account_approval_mode: newMode
      });
      setSystemSettings(response.data);
      toast.success(`Account registration set to: ${newMode === 'AUTO' ? 'Auto-Approve' : 'Manual Admin Approval'}`);
    } catch {
      toast.error('Failed to update system settings');
    } finally {
      setLoadingSettings(false);
    }
  };

  // Triggers for ConfirmationDialog
  const triggerApprove = (u) => {
    setConfirmDialog({
      isOpen: true,
      type: 'approve',
      user: u,
      loading: false
    });
  };

  const triggerReject = (u) => {
    setConfirmDialog({
      isOpen: true,
      type: 'reject',
      user: u,
      loading: false
    });
  };

  const triggerSuspend = (u) => {
    setConfirmDialog({
      isOpen: true,
      type: 'suspend',
      user: u,
      loading: false
    });
  };

  const triggerActivate = (u) => {
    setConfirmDialog({
      isOpen: true,
      type: 'activate',
      user: u,
      loading: false
    });
  };

  const triggerResetPassword = (u) => {
    setTempPassword('Temp@Access123'); // Default temp password
    setConfirmDialog({
      isOpen: true,
      type: 'reset',
      user: u,
      loading: false
    });
  };

  const executeAction = async () => {
    const { type, user } = confirmDialog;
    if (!user) return;

    setConfirmDialog(prev => ({ ...prev, loading: true }));
    try {
      if (type === 'approve' || type === 'activate') {
        await api.post(`/api/users/${user.id}/status`, { account_status: 'Active' });
        toast.success(`User account ${user.fullname} is now active.`);
      } else if (type === 'reject') {
        await api.post(`/api/users/${user.id}/status`, { account_status: 'Rejected' });
        toast.success(`User registration ${user.fullname} has been rejected.`);
      } else if (type === 'suspend') {
        await api.post(`/api/users/${user.id}/status`, { account_status: 'Suspended' });
        toast.success(`User account ${user.fullname} has been suspended.`);
      } else if (type === 'reset') {
        if (tempPassword.length < 8) {
          toast.error('Temporary password must be at least 8 characters');
          setConfirmDialog(prev => ({ ...prev, loading: false }));
          return;
        }
        await api.post(`/api/users/${user.id}/force-reset`, { new_password: tempPassword });
        toast.success(`Password has been administratively overwritten. Forced change set for next login.`);
      }
      
      setConfirmDialog({ isOpen: false, type: '', user: null, loading: false });
      fetchUsers();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Administrative action failed.';
      toast.error(errorMsg);
      setConfirmDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  const getModalDetails = () => {
    const { type, user } = confirmDialog;
    if (!user) return {};

    switch (type) {
      case 'approve':
        return {
          title: 'Approve Registration',
          description: `Are you sure you want to approve the enrollment registration for ${user.fullname} (${user.email})? They will immediately receive access authorization.`,
          confirmText: 'Approve User',
          confirmVariant: 'primary'
        };
      case 'reject':
        return {
          title: 'Reject Registration',
          description: `Are you sure you want to reject the registration request for ${user.fullname}? This will prevent them from logging in.`,
          confirmText: 'Reject Registration',
          confirmVariant: 'danger'
        };
      case 'suspend':
        return {
          title: 'Suspend Account',
          description: `Are you sure you want to suspend the user account for ${user.fullname}? All their active sessions will be terminated and access will be revoked immediately.`,
          confirmText: 'Suspend Account',
          confirmVariant: 'danger'
        };
      case 'activate':
        return {
          title: 'Re-Activate Account',
          description: `Are you sure you want to re-activate the account for ${user.fullname}? This will restore their system access permissions.`,
          confirmText: 'Activate User',
          confirmVariant: 'primary'
        };
      case 'reset':
        return {
          title: 'Overwrite Password',
          description: `Define a temporary password to administratively overwrite ${user.fullname}'s credentials. The user will be forced to change it at their next login.`,
          confirmText: 'Force Password Change',
          confirmVariant: 'primary'
        };
      default:
        return {};
    }
  };

  const modalDetails = getModalDetails();

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      <PageHeader
        title="User & Operator Directory"
        subtitle="Manage secure campus user identities, roles, departments, and account authorization states"
      >
        <RefreshButton
          isRefreshing={isRefreshing}
          setIsRefreshing={setIsRefreshing}
          onRefresh={fetchUsers}
          pageName="Users"
        />
      </PageHeader>

      <div className={`space-y-6 transition-opacity duration-300 ${isRefreshing ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Settings Panel & Mode Toggler */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-2xl border border-slate-200 bg-slate-50 gap-4 select-none"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-primary" />
            <h2 className="text-base font-bold text-brand-text">Enrollment & Approval Protocol</h2>
          </div>
          <p className="text-xs text-brand-secondary max-w-xl">
            Configure system registration behavior. In manual review mode, new faculty/student operators must be approved by a Super Admin prior to login access.
          </p>
        </div>

        {systemSettings && (
          <div className="flex items-center gap-4 shrink-0 bg-white p-3 rounded-xl border border-slate-200 w-full md:w-auto justify-between md:justify-start">
            <div className="text-left">
              <p className="text-[10px] text-brand-secondary font-bold uppercase tracking-wider">Approval Mode</p>
              <span className="text-xs font-semibold text-brand-text">
                {systemSettings.account_approval_mode === 'AUTO' ? 'Auto-Approve Active' : 'Manual Admin Review'}
              </span>
            </div>
            <Button
              onClick={toggleApprovalMode}
              disabled={loadingSettings}
              variant={systemSettings.account_approval_mode === 'AUTO' ? 'secondary' : 'primary'}
              className="h-9 px-4 text-xs font-bold w-auto"
            >
              {loadingSettings ? 'Updating...' : 'Toggle Mode'}
            </Button>
          </div>
        )}
      </motion.div>

      {/* Search & Filters Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="w-full"
      >
        <Card className="max-w-none sm:max-w-none lg:max-w-none p-6">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            
            {/* Search Input */}
            <div className="md:col-span-2 space-y-1">
              <label className="block text-[10px] font-bold text-brand-secondary uppercase tracking-wider select-none">
                Search Users
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                <input
                  type="text"
                  placeholder="Search by Name, Email, Phone, Roll, Employee ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-400 placeholder-slate-400 font-semibold"
                />
              </div>
            </div>

            {/* Filter Role */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-brand-secondary uppercase tracking-wider select-none">
                System Role
              </label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="h-10 w-full px-3.5 bg-white border border-slate-200 rounded-xl focus:border-blue-400 text-xs text-slate-800 outline-none font-semibold"
              >
                <option value="">All Roles</option>
                <option value="1">Super Admin</option>
                <option value="2">Faculty</option>
                <option value="3">Student</option>
                <option value="4">Parent Visitor</option>
                <option value="5">Guest</option>
              </select>
            </div>

            {/* Submit & Reset Row */}
            <div className="flex gap-2">
              <Button type="submit" variant="primary" className="h-10 text-xs font-bold grow">
                Apply Search
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setSearch('');
                  setRoleId('');
                  setStatusFilter('');
                  setDeptFilter('');
                  setPage(1);
                }}
                className="h-10 px-4 text-xs font-bold shrink-0"
              >
                Reset Filters
              </Button>
            </div>

          </form>

          {/* Secondary Filters row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 select-none pt-4 border-t border-[#334155]/20">
            {/* Status */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-brand-secondary uppercase tracking-wider">
                Account Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 w-full px-3 bg-white border border-slate-200 rounded-xl focus:border-blue-400 text-xs text-slate-800 outline-none font-semibold"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
                <option value="Suspended">Suspended</option>
                <option value="Locked">Locked</option>
              </select>
            </div>

            {/* Department */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-brand-secondary uppercase tracking-wider">
                Department
              </label>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="h-9 w-full px-3 bg-white border border-slate-200 rounded-xl focus:border-blue-400 text-xs text-slate-800 outline-none font-semibold"
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map((d, i) => (
                  <option key={i} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Users Grid Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full"
      >
        <Card className="max-w-none sm:max-w-none lg:max-w-none p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider">
                Operator & Campus User Directory
              </h3>
              <p className="text-[9px] text-brand-secondary">
                Showing {users.length} of {total} total records
              </p>
            </div>
            {currentUser?.role_id === 1 && (
              <Button
                onClick={() => navigate('/users/create')}
                variant="primary"
                className="h-9 px-4 text-xs font-bold w-auto"
              >
                Add New User
              </Button>
            )}
          </div>

          <UserTable
            users={users}
            onApprove={triggerApprove}
            onReject={triggerReject}
            onSuspend={triggerSuspend}
            onActivate={triggerActivate}
            onResetPassword={triggerResetPassword}
            onViewDetails={(u) => setSelectedUserForAnalytics(u)}
            currentUserRole={currentUser?.role?.role_name}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#334155]/20 pt-4 select-none">
              <span className="text-[10px] text-brand-secondary font-bold">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="h-8 px-3 text-xs w-auto font-bold"
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage(p => p + 1)}
                  className="h-8 px-3 text-xs w-auto font-bold"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Confirmation Modals */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, type: '', user: null, loading: false })}
        onConfirm={executeAction}
        title={modalDetails.title}
        description={modalDetails.description}
        confirmText={modalDetails.confirmText}
        confirmVariant={modalDetails.confirmVariant}
        loading={confirmDialog.loading}
      >
        {/* Custom dialog body inject for password overwrite inputs */}
        {confirmDialog.type === 'reset' && (
          <div className="mt-4 space-y-2 select-none text-left">
            <label className="block text-[11px] font-bold text-brand-secondary uppercase tracking-wider">
              Temporary Overwrite Password
            </label>
            <input
              type="text"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              className="h-9 w-full px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-400 font-semibold font-mono"
            />
            <p className="text-[10px] text-brand-secondary mt-1">
              Minimum 8 characters containing uppercase, lowercase, numbers, and symbols.
            </p>
          </div>
        )}
      </ConfirmationDialog>

      {/* Slide-out Analytics Panel */}
      {selectedUserForAnalytics && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedUserForAnalytics(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />
          {/* Panel Container */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 250 }}
            className="relative w-full max-w-5xl h-full bg-white shadow-2xl z-10 overflow-hidden"
          >
            <UserNetworkAnalyticsDashboard 
              user={selectedUserForAnalytics} 
              onClose={() => setSelectedUserForAnalytics(null)} 
            />
          </motion.div>
        </div>
      )}

      </div>
    </div>
  );
};

export default UserManagementPage;
