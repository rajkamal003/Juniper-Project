// frontend/src/components/ui/UserTable.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CheckCircle2, XCircle, Power, Key } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

const UserAvatar = ({ src, name }) => {
  const [error, setError] = React.useState(false);
  if (src && !error) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setError(true)}
        className="w-full h-full object-cover rounded-xl"
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
    <div 
      className="w-full overflow-x-auto rounded-2xl border backdrop-blur-md shadow-md"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-color)'
      }}
    >
      <table className="w-full text-left border-collapse font-sans">
        <thead>
          <tr 
            className="border-b text-th font-bold uppercase tracking-wider select-none"
            style={{
              backgroundColor: 'var(--bg-hover)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)'
            }}
          >
            <th className="py-4.5 px-6 text-center w-14">Avatar</th>
            <th className="py-4.5 px-6">Name</th>
            <th className="py-4.5 px-6">Email</th>
            <th className="py-4.5 px-6">Role</th>
            <th className="py-4.5 px-6">Department</th>
            <th className="py-4.5 px-6">Status</th>
            <th className="py-4.5 px-6">Created Date</th>
            <th className="py-4.5 px-6">Last Login</th>
            <th className="py-4.5 px-6 text-center w-28">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
          {users.length === 0 ? (
            <tr className="select-none">
              <td colSpan="9" className="py-14 text-center text-td font-medium" style={{ color: 'var(--text-secondary)' }}>
                No operators or campus users found.
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <tr 
                key={u.id} 
                className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-td"
                style={{ color: 'var(--text-main)' }}
              >
                {/* Avatar */}
                <td className="py-4 px-6 text-center">
                  <div 
                    className="w-9 h-9 rounded-xl border text-white font-bold flex items-center justify-center mx-auto font-mono select-none overflow-hidden"
                    style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--border-color)' }}
                  >
                    <UserAvatar src={u.profile_image} name={u.fullname} />
                  </div>
                </td>

                {/* Name */}
                <td className="py-4 px-6 font-semibold truncate max-w-[180px]">
                  <div>{u.fullname}</div>
                  {u.role_id === 3 && u.roll_number && (
                    <span className="text-[10px] text-slate-400 block font-mono font-medium leading-tight mt-0.5">({u.roll_number})</span>
                  )}
                  {u.role_id === 2 && u.employee_id && (
                    <span className="text-[10px] text-slate-400 block font-mono font-medium leading-tight mt-0.5">({u.employee_id})</span>
                  )}
                  {u.role_id === 5 && u.roll_number && (
                    <span className="text-[10px] text-slate-400 block font-mono font-medium leading-tight mt-0.5">({u.roll_number})</span>
                  )}
                  {u.role_id === 1 && u.employee_id && (
                    <span className="text-[10px] text-slate-400 block font-mono font-medium leading-tight mt-0.5">({u.employee_id})</span>
                  )}
                  {u.role_id === 4 && u.parent_student_roll && (
                    <span className="text-[10px] text-slate-400 block font-mono font-medium leading-tight mt-0.5">(Parent: {u.parent_student_roll})</span>
                  )}
                </td>

                {/* Email */}
                <td className="py-4 px-6 font-mono text-sm truncate max-w-[200px]" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>

                {/* Role */}
                <td className="py-4 px-6 font-medium" style={{ color: 'var(--text-secondary)' }}>{getRoleLabel(u.role?.role_name)}</td>

                {/* Department */}
                <td className="py-4 px-6 font-medium" style={{ color: 'var(--text-secondary)' }}>{u.department || '—'}</td>

                {/* Status */}
                <td className="py-4 px-6">
                  <StatusBadge status={u.account_status} />
                </td>

                {/* Created Date */}
                <td className="py-4 px-6 font-medium" style={{ color: 'var(--text-secondary)' }}>{formatDate(u.created_at || u.created_date)}</td>

                {/* Last Login */}
                <td className="py-4 px-6 font-medium" style={{ color: 'var(--text-secondary)' }}>{formatDate(u.last_login)}</td>

                {/* Actions */}
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => navigate(`/users/${u.id}`)}
                      className="p-2 rounded-xl transition-colors focus:outline-none hover:bg-black/5 dark:hover:bg-white/10"
                      style={{ color: 'var(--color-primary)' }}
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>

                    {isAdmin && u.role_id !== 1 && (
                      <>
                        {u.account_status === 'Pending' && (
                          <>
                            <button
                              onClick={() => onApprove(u)}
                              className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors focus:outline-none"
                              title="Approve Account"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => onReject(u)}
                              className="p-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors focus:outline-none"
                              title="Reject Account"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}

                        {u.account_status === 'Active' && (
                          <button
                            onClick={() => onSuspend(u)}
                            className="p-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors focus:outline-none"
                            title="Suspend Account"
                          >
                            <Power className="w-5 h-5" />
                          </button>
                        )}

                        {u.account_status === 'Suspended' && (
                          <button
                            onClick={() => onActivate(u)}
                            className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors focus:outline-none"
                            title="Activate Account"
                          >
                            <Power className="w-5 h-5" />
                          </button>
                        )}

                        <button
                          onClick={() => onResetPassword(u)}
                          className="p-2 rounded-xl text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors focus:outline-none"
                          title="Force Password Reset"
                        >
                          <Key className="w-5 h-5" />
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
