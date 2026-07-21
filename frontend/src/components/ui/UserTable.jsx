// frontend/src/components/ui/UserTable.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ShieldAlert, CheckCircle2, XCircle, Power, Key } from 'lucide-react';
import StatusBadge from './StatusBadge';

const UserAvatar = ({ src, name }) => {
  const [error, setError] = React.useState(false);
  if (src && !error) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setError(true)}
        className="w-full h-full object-cover rounded-lg"
      />
    );
  }
  return name?.charAt(0).toUpperCase();
};

export const UserTable = ({
  users = [],
  onApprove,
  onReject,
  onSuspend,
  onActivate,
  onResetPassword,
  currentUserRole
}) => {
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleLabel = (roleName) => {
    switch (roleName) {
      case 'Super Admin':
        return 'Super Admin';
      case 'Parent Visitor':
        return 'Parent Visitor';
      default:
        return roleName;
    }
  };

  const isAdmin = currentUserRole === 'Super Admin' || currentUserRole === 1;

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[#334155]/60 bg-slate-900/20">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#334155] bg-slate-950/40 text-[10px] font-bold uppercase tracking-wider text-brand-secondary select-none">
            <th className="py-4 px-6 text-center w-12">Avatar</th>
            <th className="py-4 px-6">Name</th>
            <th className="py-4 px-6">Email</th>
            <th className="py-4 px-6">Role</th>
            <th className="py-4 px-6">Department</th>
            <th className="py-4 px-6">Status</th>
            <th className="py-4 px-6">Created Date</th>
            <th className="py-4 px-6">Last Login</th>
            <th className="py-4 px-6 text-center w-24">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#334155]/30">
          {users.length === 0 ? (
            <tr className="select-none">
              <td colSpan="9" className="py-12 text-center text-xs text-brand-secondary font-medium">
                No operators or campus users found.
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/10 transition-colors text-xs text-brand-text">
                {/* Avatar */}
                <td className="py-3 px-6 text-center">
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-bold flex items-center justify-center mx-auto font-mono select-none overflow-hidden">
                    <UserAvatar src={u.profile_image} name={u.fullname} />
                  </div>
                </td>

                {/* Name */}
                <td className="py-3 px-6 font-semibold truncate max-w-[160px]">{u.fullname}</td>

                {/* Email */}
                <td className="py-3 px-6 font-mono text-[#94a3b8] truncate max-w-[180px]">{u.email}</td>

                {/* Role */}
                <td className="py-3 px-6 font-medium text-brand-secondary">{getRoleLabel(u.role?.role_name)}</td>

                {/* Department */}
                <td className="py-3 px-6 text-brand-secondary font-medium">{u.department || '—'}</td>

                {/* Status */}
                <td className="py-3 px-6">
                  <StatusBadge status={u.account_status} />
                </td>

                {/* Created Date */}
                <td className="py-3 px-6 text-brand-secondary font-medium">{formatDate(u.created_at || u.created_date)}</td>

                {/* Last Login */}
                <td className="py-3 px-6 text-brand-secondary font-medium">{formatDate(u.last_login)}</td>

                {/* Actions */}
                <td className="py-3 px-6">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => navigate(`/users/${u.id}`)}
                      className="p-1.5 rounded-lg text-brand-primary hover:bg-brand-primary/10 transition-colors focus:outline-none"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {isAdmin && u.role_id !== 1 && (
                      <>
                        {u.account_status === 'Pending' && (
                          <>
                            <button
                              onClick={() => onApprove(u)}
                              className="p-1.5 rounded-lg text-brand-success hover:bg-brand-success/10 transition-colors focus:outline-none"
                              title="Approve Account"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onReject(u)}
                              className="p-1.5 rounded-lg text-brand-danger hover:bg-brand-danger/10 transition-colors focus:outline-none"
                              title="Reject Account"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {u.account_status === 'Active' && (
                          <button
                            onClick={() => onSuspend(u)}
                            className="p-1.5 rounded-lg text-brand-danger hover:bg-brand-danger/10 transition-colors focus:outline-none"
                            title="Suspend Account"
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        )}

                        {u.account_status === 'Suspended' && (
                          <button
                            onClick={() => onActivate(u)}
                            className="p-1.5 rounded-lg text-brand-success hover:bg-brand-success/10 transition-colors focus:outline-none"
                            title="Activate Account"
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => onResetPassword(u)}
                          className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-400/10 transition-colors focus:outline-none"
                          title="Force Password Reset"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
