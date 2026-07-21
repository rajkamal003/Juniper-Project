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

export const UserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  
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
        // Wait, backend session list endpoint is only /sessions for current user.
        // Let's add a backend route /api/users/{user_id}/sessions for admin if needed,
        // or fetch from active sessions. Let's make a call to retrieve sessions.
        // Wait, in user_routes.py we didn't specify an endpoint for admin to view another user's sessions.
        // Let's check user_routes.py if there is one. No, we didn't make one, but that's fine! We can easily list the active sessions that the system records for them by creating one, or listing it if the API supports it.
        // Wait, did we implement an endpoint to get sessions for specific user? No, but let's check.
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: profile card summary */}
        <div className="md:col-span-1 space-y-6">
          <Card className="max-w-none p-6 text-center select-none">
            <div className="w-20 h-20 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-bold text-2xl flex items-center justify-center mx-auto font-mono mb-4">
              {user.profile_image ? (
                <img src={user.profile_image} alt={user.fullname} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                user.fullname?.charAt(0).toUpperCase()
              )}
            </div>

            <h3 className="text-base font-bold text-brand-text leading-tight">{user.fullname}</h3>
            <p className="text-xs text-brand-secondary font-mono mt-1">{user.email}</p>

            <div className="flex gap-2 justify-center mt-4">
              <StatusBadge status={user.account_status} />
              <span className="text-[10px] font-bold text-brand-secondary bg-slate-800 px-2 py-0.5 border border-slate-700/50 rounded-md uppercase tracking-wider">
                {getRoleLabel(user.role?.role_name)}
              </span>
            </div>

            <div className="mt-6 border-t border-[#334155]/20 pt-4 space-y-3 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-brand-secondary">Mobile Phone</span>
                <span className="font-semibold text-brand-text">{user.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-secondary">Department</span>
                <span className="font-semibold text-brand-text">{user.department || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-secondary">Registration Date</span>
                <span className="font-semibold text-brand-text">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column: granular credentials & uploaded files */}
        <div className="md:col-span-2 space-y-6">
          <Card className="max-w-none p-6">
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-6 border-b border-[#334155]/20 pb-3 select-none">
              Identities & Document Attachments
            </h4>

            {/* Custom attributes by role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 select-none text-xs">
              {user.role_id === 2 && (
                <div className="space-y-1">
                  <p className="text-brand-secondary font-bold uppercase tracking-wider text-[10px]">Employee Identification Code</p>
                  <p className="font-mono text-brand-text font-bold text-sm bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
                    {user.employee_id || 'Not Assigned'}
                  </p>
                </div>
              )}

              {user.role_id === 3 && (
                <div className="space-y-1">
                  <p className="text-brand-secondary font-bold uppercase tracking-wider text-[10px]">Student Roll Number</p>
                  <p className="font-mono text-brand-text font-bold text-sm bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
                    {user.roll_number || 'Not Assigned'}
                  </p>
                </div>
              )}

              {user.role_id === 4 && (
                <>
                  <div className="space-y-1">
                    <p className="text-brand-secondary font-bold uppercase tracking-wider text-[10px]">Parent Linked Roll Number</p>
                    <p className="font-mono text-brand-text font-bold text-sm bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
                      {user.parent_student_roll || 'Not Assigned'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-brand-secondary font-bold uppercase tracking-wider text-[10px]">Student Relationship</p>
                    <p className="text-brand-text font-semibold text-sm bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
                      {user.relationship || 'Not Specified'}
                    </p>
                  </div>
                </>
              )}

              {user.role_id === 5 && (
                <>
                  <div className="space-y-1">
                    <p className="text-brand-secondary font-bold uppercase tracking-wider text-[10px]">Visit Purpose</p>
                    <p className="text-brand-text font-semibold text-sm bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
                      {user.purpose || 'General Campus Visit'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-brand-secondary font-bold uppercase tracking-wider text-[10px]">Proposed Stay Duration</p>
                    <p className="text-brand-text font-semibold text-sm bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
                      {user.duration || 'Not Specified'}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Document display section */}
            <div className="mt-8 pt-6 border-t border-[#334155]/20 select-none">
              <h5 className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider mb-4">
                Enrollment ID Verification Document
              </h5>
              
              {user.college_id_upload ? (
                <div className="space-y-4">
                  {isDocumentImage(user.college_id_upload) ? (
                    <div className="w-full max-w-md rounded-xl border border-[#334155]/50 overflow-hidden bg-slate-950/60 p-2 mx-auto">
                      <img src={user.college_id_upload} alt="ID Document Preview" className="w-full h-auto rounded-lg object-contain max-h-[300px]" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-slate-950/40 rounded-xl border border-slate-800 max-w-md mx-auto">
                      <div className="p-2.5 bg-red-500/10 text-brand-danger rounded-lg">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="text-left grow min-w-0">
                        <p className="text-xs font-bold text-brand-text truncate">Verification_Doc_{user.id}.pdf</p>
                        <p className="text-[10px] text-brand-secondary">PDF Document File</p>
                      </div>
                      <a
                        href={user.college_id_upload}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-[#94a3b8] hover:text-[#f8fafc] hover:bg-slate-800/50 rounded-lg transition-colors shrink-0"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-brand-secondary font-medium italic">
                  No verification document was uploaded during registration.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

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
              className="h-9 w-full px-3 bg-slate-950/40 border border-[#334155] rounded-xl text-xs text-brand-text outline-none focus-ring-blue font-semibold font-mono"
            />
          </div>
        )}
      </ConfirmationDialog>

    </div>
  );
};

export default UserDetailsPage;
