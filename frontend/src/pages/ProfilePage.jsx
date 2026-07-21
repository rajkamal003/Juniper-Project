// frontend/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Eye, EyeOff, Shield, ShieldAlert, Cpu, Network, Monitor, Globe, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PasswordStrengthMeter } from '../components/forms/PasswordStrengthMeter';
import { FileUpload } from '../components/forms/FileUpload';

const profileEditSchema = z.object({
  fullname: z.string().min(3, 'Full name must be at least 3 characters'),
  phone: z.string().min(10, 'Enter a valid 10-digit mobile number.').regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit mobile number'),
  profile_image: z.string().optional()
});

const changePasswordSchema = z.object({
  old_password: z.string().min(1, 'Current password is required'),
  new_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[@$!%*?&#]/, 'Password must contain at least one special character'),
  confirm_password: z.string()
}).superRefine((data, ctx) => {
  if (data.new_password !== data.confirm_password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["confirm_password"]
    });
  }
});

export const ProfilePage = () => {
  const { user, setUser, sessionMetadata } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    document.title = "SecureCampus AI | User Profile";
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/api/users/sessions');
      setSessions(response.data);
    } catch {
      toast.error('Failed to load active sessions');
    }
  };

  const revokeSession = async (sessId) => {
    try {
      await api.post(`/api/users/sessions/revoke/${sessId}`);
      toast.success('Session terminated successfully');
      fetchSessions();
    } catch {
      toast.error('Failed to terminate session');
    }
  };

  const revokeAllSessions = async () => {
    try {
      await api.post('/api/users/sessions/revoke-all');
      toast.success('All other sessions terminated successfully');
      fetchSessions();
    } catch {
      toast.error('Failed to revoke all sessions');
    }
  };

  // Edit Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    watch: watchProfile,
    setValue: setProfileValue,
    formState: { errors: profileErrors, isDirty: isProfileDirty }
  } = useForm({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      fullname: user?.fullname || '',
      phone: user?.phone || '',
      profile_image: user?.profile_image || ''
    }
  });

  const profileImageUrl = watchProfile('profile_image');

  const onProfileUpdate = async (data) => {
    setLoadingProfile(true);
    try {
      const response = await api.put(`/api/users/${user.id}`, data);
      setUser(response.data);
      toast.success('Profile details updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  // Change Password Form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch: watchPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors }
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      old_password: '',
      new_password: '',
      confirm_password: ''
    }
  });

  const newPassword = watchPassword('new_password');
  const confirmPassword = watchPassword('confirm_password');
  const isPasswordsMatching = newPassword && newPassword === confirmPassword;

  const onPasswordUpdate = async (data) => {
    setLoadingPassword(true);
    try {
      await api.post('/api/users/change-password', data);
      toast.success('Password changed successfully. Other sessions revoked.');
      resetPasswordForm();
      fetchSessions();
    } catch (error) {
      const msg = error.response?.data?.detail || 'Current password check failed';
      toast.error(msg);
    } finally {
      setLoadingPassword(false);
    }
  };

  const getRoleLabel = (roleName) => {
    if (roleName === 'Super Admin') return 'Super Administrator';
    return roleName || 'Operator';
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
      
      {/* Col 1: Summary Card */}
      <div className="xl:col-span-1 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <Card className="max-w-none sm:max-w-none lg:max-w-none">
            <div className="flex flex-col items-center text-center space-y-4 select-none pt-4">
              {/* Profile Image Preview */}
              <div className="w-24 h-24 rounded-2xl bg-brand-primary/10 border-2 border-brand-primary/20 text-brand-primary font-bold text-3xl flex items-center justify-center font-mono shadow-lg relative overflow-hidden">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt={user?.fullname} className="w-full h-full object-cover" />
                ) : (
                  user?.fullname?.charAt(0).toUpperCase()
                )}
              </div>

              <div>
                <h2 className="text-lg font-bold text-brand-text leading-tight">{user?.fullname}</h2>
                <p className="text-xs text-brand-secondary font-mono mt-0.5">{user?.email}</p>
              </div>

              <div className="flex gap-2">
                <StatusBadge status={user?.account_status} />
                <span className="text-[10px] font-bold text-brand-secondary bg-slate-800 px-2 py-0.5 border border-slate-700/50 rounded-md uppercase tracking-wider">
                  {getRoleLabel(user?.role?.role_name)}
                </span>
              </div>
            </div>

            {/* Profile Fields list */}
            <div className="mt-8 border-t border-[#334155]/20 pt-6 space-y-4 text-xs select-none">
              <div className="flex justify-between items-center">
                <span className="text-brand-secondary">Security Phone</span>
                <span className="font-semibold text-brand-text">{user?.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-secondary">Department Mapping</span>
                <span className="font-semibold text-brand-text">{user?.department || 'Not Configured'}</span>
              </div>
              
              {user?.employee_id && (
                <div className="flex justify-between items-center">
                  <span className="text-brand-secondary">Employee Identification</span>
                  <span className="font-mono font-semibold text-brand-text">{user.employee_id}</span>
                </div>
              )}
              {user?.roll_number && (
                <div className="flex justify-between items-center">
                  <span className="text-brand-secondary">Student Roll Number</span>
                  <span className="font-mono font-semibold text-brand-text">{user.roll_number}</span>
                </div>
              )}
              {user?.parent_student_roll && (
                <div className="flex justify-between items-center">
                  <span className="text-brand-secondary">Student Roll Linked</span>
                  <span className="font-mono font-semibold text-brand-text">{user.parent_student_roll}</span>
                </div>
              )}
              {user?.relationship && (
                <div className="flex justify-between items-center">
                  <span className="text-brand-secondary">Student Relationship</span>
                  <span className="font-semibold text-brand-text">{user.relationship}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-brand-secondary">Enrollment Date</span>
                <span className="font-semibold text-brand-text">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-secondary">Last Security Login</span>
                <span className="font-semibold text-brand-text">
                  {user?.last_login ? new Date(user.last_login).toLocaleString() : 'First Session'}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Col 2 & 3: Configuration sections */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Profile Details Editing */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full"
        >
          <Card className="max-w-none sm:max-w-none lg:max-w-none">
            <h3 className="text-sm font-bold text-brand-text uppercase tracking-wider mb-6 border-b border-[#334155]/20 pb-3 select-none">
              Modify Identity Details
            </h3>

            <form onSubmit={handleProfileSubmit(onProfileUpdate)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  icon={User}
                  error={profileErrors.fullname}
                  disabled={loadingProfile}
                  required
                  {...registerProfile('fullname')}
                />
                
                <Input
                  label="Security Mobile Phone"
                  type="tel"
                  placeholder="9876543210"
                  icon={Phone}
                  error={profileErrors.phone}
                  disabled={loadingProfile}
                  required
                  {...registerProfile('phone')}
                />
              </div>

              {/* Profile Image Uploader */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <FileUpload
                  label="Update Avatar Photo"
                  maxSizeMB={2}
                  allowedTypes={['image/jpeg', 'image/png']}
                  onFileLoaded={(url) => setProfileValue('profile_image', url, { shouldDirty: true })}
                />
                
                {profileImageUrl && (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950/40 select-none">
                    <img src={profileImageUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                    <div className="text-[11px]">
                      <p className="text-brand-text font-bold">Preview Selected</p>
                      <button
                        type="button"
                        onClick={() => setProfileValue('profile_image', '', { shouldDirty: true })}
                        className="text-brand-danger font-semibold hover:underline mt-0.5"
                      >
                        Remove Photo
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={loadingProfile}
                loadingText="Updating Profile..."
                disabled={!isProfileDirty || loadingProfile}
                className="w-auto px-6 h-11 text-xs"
              >
                Save Details
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Change Password Panel */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full"
        >
          <Card className="max-w-none sm:max-w-none lg:max-w-none">
            <h3 className="text-sm font-bold text-brand-text uppercase tracking-wider mb-6 border-b border-[#334155]/20 pb-3 select-none">
              Update System Password
            </h3>

            <form onSubmit={handlePasswordSubmit(onPasswordUpdate)} className="space-y-6">
              
              {/* Current Password */}
              <div className="relative">
                <Input
                  label="Current Access Password"
                  type={showOldPassword ? 'text' : 'password'}
                  icon={Lock}
                  placeholder="••••••••"
                  error={passwordErrors.old_password}
                  disabled={loadingPassword}
                  required
                  {...registerPassword('old_password')}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3.5 top-[38px] text-[#94a3b8] focus:outline-none"
                  tabIndex={-1}
                >
                  {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* New Password */}
                <div className="relative">
                  <Input
                    label="New Password"
                    type={showNewPassword ? 'text' : 'password'}
                    icon={Lock}
                    placeholder="••••••••"
                    error={passwordErrors.new_password}
                    disabled={loadingPassword}
                    required
                    {...registerPassword('new_password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-[38px] text-[#94a3b8] focus:outline-none"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <Input
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    icon={Lock}
                    placeholder="••••••••"
                    error={passwordErrors.confirm_password}
                    disabled={loadingPassword}
                    required
                    {...registerPassword('confirm_password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-[38px] text-[#94a3b8] focus:outline-none"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Matching label */}
              {confirmPassword && (
                <p className={`text-[11px] font-bold select-none ${isPasswordsMatching ? 'text-brand-success' : 'text-brand-danger'}`}>
                  {isPasswordsMatching ? '✓ Passwords Match' : '✗ Passwords Do Not Match'}
                </p>
              )}

              {/* Password Strength Meter */}
              <PasswordStrengthMeter password={newPassword} />

              <Button
                type="submit"
                variant="primary"
                loading={loadingPassword}
                loadingText="Updating Password..."
                disabled={loadingPassword || !isPasswordsMatching || newPassword?.length < 8}
                className="w-auto px-6 h-11 text-xs"
              >
                Change Password
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Sessions Auditing */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full"
        >
          <Card className="max-w-none sm:max-w-none lg:max-w-none">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#334155]/20 pb-3 mb-6 select-none">
              <h3 className="text-sm font-bold text-brand-text uppercase tracking-wider">
                Active Session Terminals
              </h3>
              
              {sessions.length > 1 && (
                <button
                  type="button"
                  onClick={revokeAllSessions}
                  className="text-xs text-brand-danger font-bold hover:underline focus:outline-none"
                >
                  Revoke All Other Sessions
                </button>
              )}
            </div>

            <div className="space-y-4">
              {sessions.map((sess) => (
                <div
                  key={sess.session_id}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 select-none transition-all ${
                    sess.session_id === sessionMetadata?.session_id
                      ? 'border-brand-primary/20 bg-brand-primary/5'
                      : 'border-[#334155]/40 bg-slate-950/20'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 text-brand-secondary flex items-center justify-center shrink-0">
                      <Monitor className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-brand-text truncate">
                          {sess.browser || 'Web Client'} • {sess.operating_system || 'Terminal'}
                        </span>
                        
                        {sess.session_id === sessionMetadata?.session_id && (
                          <span className="text-[9px] bg-brand-primary/20 text-brand-primary border border-brand-primary/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            Current Session
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-brand-secondary mt-1 font-mono tracking-wide truncate">
                        IP: {sess.ip_address} | Logged: {new Date(sess.login_time).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => revokeSession(sess.session_id)}
                    className="text-xs font-bold text-brand-danger hover:underline shrink-0"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

      </div>

    </div>
  );
};

export default ProfilePage;
