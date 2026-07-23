// frontend/src/pages/UserDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { UserNetworkAnalyticsDashboard } from '../components/ui/UserNetworkAnalyticsDashboard';

export const UserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);

  
  // Dialog Actions State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: '',
    loading: false
  });
  const [tempPassword, setTempPassword] = useState('Temp@Access123');

  useEffect(() => {
    document.title = "SecureCampus AI | User Details";
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      // 1. Fetch user data
      const userResp = await api.get(`/api/users/${id}`);
      setUser(userResp.data);

      // 2. Fetch their sessions if Admin
      if (currentUser?.role_id === 1) {
        const sessResp = await api.get(`/api/users/${id}/sessions`);
        setSessions(sessResp.data);
      }
    } catch {
      toast.error('Failed to load user details');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const executeStatusChange = async (targetStatus) => {
    try {
      await api.post(`/api/users/${id}/status`, { account_status: targetStatus });
      toast.success(`Account status updated to ${targetStatus}`);
      fetchUserDetails();
    } catch {
      toast.error('Failed to update account status');
    }
  };

  const handleAction = async () => {
    const { type } = confirmDialog;
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    try {
      if (type === 'approve') {
        await executeStatusChange('Active');
      } else if (type === 'reject') {
        await executeStatusChange('Rejected');
      } else if (type === 'suspend') {
        await executeStatusChange('Suspended');
      } else if (type === 'activate') {
        await executeStatusChange('Active');
      } else if (type === 'reset') {
        if (tempPassword.length < 8) {
          toast.error('Password must be at least 8 characters');
          setConfirmDialog(prev => ({ ...prev, loading: false }));
          return;
        }
        await api.post(`/api/users/${id}/force-reset`, { new_password: tempPassword });
        toast.success('Temporary password overwritten. User forced to change it at next login.');
      }
      setConfirmDialog({ isOpen: false, type: '', loading: false });
    } catch {
      setConfirmDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const isAdmin = currentUser?.role_id === 1;
  const isSelf = currentUser?.id === parseInt(id, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-xs text-brand-secondary select-none font-bold">
        Loading secure user records...
      </div>
    );
  }

  const getRoleLabel = (roleName) => {
    if (roleName === 'Super Admin') return 'Super Administrator';
    return roleName || 'Operator';
  };

  const isDocumentImage = (url) => {
    if (!url) return false;
    return url.startsWith('data:image/') || url.match(/\.(jpeg|jpg|gif|png)$/) != null || url.includes('uploads/');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-left">
      {/* Header Bar */}
      <div className="flex items-center justify-between select-none">
        <button
          onClick={() => navigate('/users')}
          className="flex items-center gap-2 text-xs text-brand-secondary hover:text-brand-text font-bold transition-colors focus:outline-none"
        >
          <ArrowLeft className="w-4.5 h-4.5" /> Back to Directory
        </button>

        {isAdmin && !isSelf && (
          <div className="flex gap-2">
            {user.account_status === 'Pending' && (
              <>
                <Button
                  variant="primary"
                  onClick={() => setConfirmDialog({ isOpen: true, type: 'approve', loading: false })}
                  className="h-9 px-4 text-xs font-bold w-auto"
                >
                  Approve Account
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setConfirmDialog({ isOpen: true, type: 'reject', loading: false })}
                  className="h-9 px-4 text-xs font-bold w-auto"
                >
                  Reject
                </Button>
              </>
            )}

            {user.account_status === 'Active' && (
              <Button
                variant="danger"
                onClick={() => setConfirmDialog({ isOpen: true, type: 'suspend', loading: false })}
                className="h-9 px-4 text-xs font-bold w-auto"
              >
                Suspend
              </Button>
            )}

            {user.account_status === 'Suspended' && (
              <Button
                variant="primary"
                onClick={() => setConfirmDialog({ isOpen: true, type: 'activate', loading: false })}
                className="h-9 px-4 text-xs font-bold w-auto"
              >
                Re-Activate
              </Button>
            )}

            <Button
              variant="secondary"
              onClick={() => setConfirmDialog({ isOpen: true, type: 'reset', loading: false })}
              className="h-9 px-4 text-xs font-bold w-auto"
            >
              Reset Password
            </Button>
          </div>
        )}
      </div>      <UserNetworkAnalyticsDashboard user={user} />

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, type: '' })}
        onConfirm={handleAction}
        title={
          confirmDialog.type === 'approve' ? 'Approve Registration' :
          confirmDialog.type === 'reject' ? 'Reject Registration' :
          confirmDialog.type === 'suspend' ? 'Suspend Account' :
          confirmDialog.type === 'activate' ? 'Re-Activate Account' :
          'Overwrite Password'
        }
        description={
          confirmDialog.type === 'approve' ? `Approve user access enrollment for ${user.fullname}?` :
          confirmDialog.type === 'reject' ? `Reject the access request for ${user.fullname}?` :
          confirmDialog.type === 'suspend' ? `Suspend all credentials and terminate active sessions for ${user.fullname}?` :
          confirmDialog.type === 'activate' ? `Restore active network access permissions for ${user.fullname}?` :
          `Administratively overwrite password for ${user.fullname}. User must update it on their next login.`
        }
        confirmText={
          confirmDialog.type === 'approve' ? 'Approve User' :
          confirmDialog.type === 'reject' ? 'Reject Registration' :
          confirmDialog.type === 'suspend' ? 'Suspend Account' :
          confirmDialog.type === 'activate' ? 'Activate User' :
          'Force Change'
        }
        confirmVariant={
          ['reject', 'suspend'].includes(confirmDialog.type) ? 'danger' : 'primary'
        }
        loading={confirmDialog.loading}
      >
        {confirmDialog.type === 'reset' && (
          <div className="space-y-2 select-none text-left">
            <label className="block text-[11px] font-bold text-brand-secondary uppercase tracking-wider">
              Temporary Overwrite Password
            </label>
            <input
              type="text"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              className="h-9 w-full px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-400 font-semibold font-mono"
            />
          </div>
        )}
      </ConfirmationDialog>

    </div>
  );
};

export default UserDetailsPage;
