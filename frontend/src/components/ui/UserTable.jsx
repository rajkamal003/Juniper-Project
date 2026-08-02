// frontend/src/components/ui/UserTable.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CheckCircle2, XCircle, Power, Key, Calendar, Building2 } from 'lucide-react';
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
  onViewDetails,
  currentUserRole
}) => {
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleLabel = (roleName) => {
    switch (roleName) {
      case 'Super Admin': return 'Super Admin';
      case 'Parent Visitor': return 'Parent Visitor';
      default: return roleName;
    }
  };

  // Determine if any guests are in the current visible rows
  const hasGuests = users.some(u => u.role_id === 5);

  const isAdmin = currentUserRole === 'Super Admin' || currentUserRole === 1;

  return (
    <div
      className="w-full overflow-x-auto rounded-2xl border backdrop-blur-md shadow-md"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-color)'
      }}
    >
      <table className="w-full text-left border-collapse font-sans min-w-[1100px]">
        <thead>
          <tr
            className="border-b text-th font-bold uppercase tracking-wider select-none"
            style={{
              backgroundColor: 'var(--bg-hover)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)'
            }}
          >
            <th className="py-4 px-5 text-center w-14">Avatar</th>
            <th className="py-4 px-5">Name / ID</th>
            <th className="py-4 px-5">Email</th>
            <th className="py-4 px-5">Phone</th>
            <th className="py-4 px-5">Role</th>
            <th className="py-4 px-5">Dept / Guest Info</th>
            <th className="py-4 px-5">Status</th>
            <th className="py-4 px-5">Created Date</th>
            <th className="py-4 px-5">Last Login</th>
            <th className="py-4 px-5 text-center w-28">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
          {users.length === 0 ? (
            <tr className="select-none">
              <td colSpan="10" className="py-14 text-center text-td font-medium" style={{ color: 'var(--text-secondary)' }}>
                No operators or campus users found.
              </td>
            </tr>
          ) : (
            users.map((u) => {
              const isGuest = u.role_id === 5;
              return (
                <tr
                  key={u.id}
                  className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-td"
                  style={{ color: 'var(--text-main)' }}
                >
                  {/* Avatar */}
                  <td className="py-4 px-5 text-center">
                    <div
                      className="w-9 h-9 rounded-xl border text-white font-bold flex items-center justify-center mx-auto font-mono select-none overflow-hidden"
                      style={{ backgroundColor: isGuest ? '#7c3aed' : 'var(--color-primary)', borderColor: 'var(--border-color)' }}
                    >
                      <UserAvatar src={u.profile_image} name={u.fullname} />
                    </div>
                  </td>

                  {/* Name / ID */}
                  <td className="py-4 px-5 font-semibold max-w-[180px]">
                    <div className="truncate">{u.fullname}</div>
                    {/* Guest ID */}
                    {u.role_id === 5 && u.roll_number && (
                      <span className="text-[10px] text-violet-500 block font-mono font-bold leading-tight mt-0.5">
                        🪪 {u.roll_number}
                      </span>
                    )}
                    {/* Student ID */}
                    {u.role_id === 3 && u.roll_number && (
                      <span className="text-[10px] text-slate-400 block font-mono font-medium leading-tight mt-0.5">({u.roll_number})</span>
                    )}
                    {/* Faculty ID */}
                    {u.role_id === 2 && u.employee_id && (
                      <span className="text-[10px] text-slate-400 block font-mono font-medium leading-tight mt-0.5">({u.employee_id})</span>
                    )}
                    {/* Admin ID */}
                    {u.role_id === 1 && u.employee_id && (
                      <span className="text-[10px] text-slate-400 block font-mono font-medium leading-tight mt-0.5">({u.employee_id})</span>
                    )}
                    {/* Parent linked roll */}
                    {u.role_id === 4 && u.parent_student_roll && (
                      <span className="text-[10px] text-slate-400 block font-mono font-medium leading-tight mt-0.5">(Parent: {u.parent_student_roll})</span>
                    )}
                  </td>

                  {/* Email */}
                  <td className="py-4 px-5 font-mono text-xs truncate max-w-[200px]" style={{ color: 'var(--text-secondary)' }}>
                    {u.email}
                  </td>

                  {/* Phone */}
                  <td className="py-4 px-5 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {u.phone || '—'}
                  </td>

                  {/* Role */}
                  <td className="py-4 px-5 font-medium text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {isGuest ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-violet-100 text-violet-700 font-bold text-[10px] dark:bg-violet-950/40 dark:text-violet-300">
                        Guest
                      </span>
                    ) : getRoleLabel(u.role?.role_name)}
                  </td>

                  {/* Department / Guest Info */}
                  <td className="py-4 px-5 text-xs max-w-[220px]" style={{ color: 'var(--text-secondary)' }}>
                    {isGuest ? (
                      <div className="space-y-0.5">
                        {u.purpose && (
                          <div className="font-medium text-[10px] truncate" title={u.purpose}>
                            <span className="font-bold text-brand-text">Purpose:</span> {u.purpose}
                          </div>
                        )}
                        {u.host_faculty && (
                          <div className="text-[10px] truncate">
                            <span className="font-bold text-brand-text">Host:</span> {u.host_faculty}
                          </div>
                        )}
                        {u.visit_date && (
                          <div className="text-[10px] flex items-center gap-1">
                            <Calendar className="w-3 h-3 shrink-0" />
                            {formatDate(u.visit_date)}
                          </div>
                        )}
                        {u.duration && (
                          <div className="text-[10px]">
                            <span className="font-bold text-brand-text">Duration:</span> {u.duration}
                          </div>
                        )}
                        {!u.purpose && !u.host_faculty && !u.visit_date && (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                    ) : (
                      <span>{u.department || '—'}</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-5">
                    <StatusBadge status={u.account_status} />
                  </td>

                  {/* Created Date */}
                  <td className="py-4 px-5 font-medium text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {formatDate(u.created_at)}
                  </td>

                  {/* Last Login */}
                  <td className="py-4 px-5 font-medium text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {formatDate(u.last_login)}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onViewDetails ? onViewDetails(u) : navigate(`/users/${u.id}`)}
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

                          {(u.account_status === 'Suspended' || u.account_status === 'Rejected') && (
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
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
