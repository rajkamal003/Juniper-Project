// frontend/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, Shield, ShieldAlert, 
  Cpu, Network, Monitor, Laptop, Globe, Clock, CheckCircle, 
  ArrowLeft, Download, RefreshCw, AlertOctagon, Key, Settings
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PasswordStrengthMeter } from '../components/forms/PasswordStrengthMeter';
import { FileUpload } from '../components/forms/FileUpload';

const profileEditSchema = z.object({
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
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, history, session, security

  const fetchProfileDetails = async () => {
    setLoading(true);
    try {
      const [profRes, histRes, sessRes] = await Promise.all([
        api.get('/api/profile'),
        api.get('/api/profile/login-history'),
        api.get('/api/profile/active-session')
      ]);
      setProfileData(profRes.data);
      setLoginHistory(histRes.data);
      setActiveSession(sessRes.data);
    } catch (err) {
      console.error("Failed to load profile resources", err);
      toast.error("Error retrieving profile datasets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "SecureCampus AI | Security Profile";
    fetchProfileDetails();
  }, []);

  // Form wrappers
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    setValue: setProfileValue,
    watch: watchProfile,
    formState: { errors: profileErrors, isDirty: isProfileDirty }
  } = useForm({
    resolver: zodResolver(profileEditSchema),
    values: {
      phone: profileData?.phone || '',
      profile_image: profileData?.profile_image || ''
    }
  });

  const profileImageUrl = watchProfile('profile_image');

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

  const onProfileUpdate = async (data) => {
    try {
      await api.put('/api/profile', {
        phone: data.phone,
        profile_image: data.profile_image
      });
      toast.success('Profile details updated successfully');
      
      // Sync auth context user state
      if (user) {
        setUser({
          ...user,
          phone: data.phone,
          profile_image: data.profile_image
        });
      }
      fetchProfileDetails();
    } catch (err) {
      toast.error('Failed to update phone or avatar details');
    }
  };

  const onPasswordUpdate = async (data) => {
    setLoadingPassword(true);
    try {
      await api.put('/api/profile', {
        old_password: data.old_password,
        new_password: data.new_password
      });
      toast.success('Password updated successfully');
      resetPasswordForm();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Current password validation failed');
    } finally {
      setLoadingPassword(false);
    }
  };

  // Browser-history back navigation with fallback route depending on role context
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      const role = profileData?.role || 'Guest';
      if (role === 'Student') navigate('/dashboard');
      else if (role === 'Faculty') navigate('/dashboard');
      else if (role === 'Parent Visitor') navigate('/dashboard');
      else if (role === 'Super Admin') navigate('/dashboard');
      else navigate('/dashboard');
    }
  };

  // Profile PDF Generation download trigger
  const handleDownloadProfile = () => {
    if (!profileData) return;
    const jsonStr = JSON.stringify(profileData, null, 2);
    const blob = new Blob([`SECURECAMPUS AI - SECURITY PROFILE EXPORT\n======================================\n\n${jsonStr}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profileData.fullname.replace(/\s+/g, '_')}_Security_Profile.txt`;
    link.click();
    toast.success('Security profile manifest downloaded successfully!');
  };

  if (loading || !profileData) {
    return (
      <div className="p-8 space-y-6 text-left">
        <div className="h-8 bg-slate-800 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-800 rounded animate-pulse lg:col-span-1"></div>
          <div className="h-96 bg-slate-800 rounded animate-pulse lg:col-span-2"></div>
        </div>
      </div>
    );
  }

  const role = profileData.role;
  const spec = profileData.role_specific || {};
  const sess = profileData.session_details || {};
  const sec = profileData.security || {};

  return (
    <div className="space-y-6 text-left select-none">
      
      {/* Back button and PDF Action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#334155]/20 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoBack}
            className="flex items-center justify-center p-2.5 rounded-xl border border-[#334155] bg-slate-900/50 hover:bg-slate-800 text-brand-secondary hover:text-brand-text transition-colors cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-brand-text tracking-tight">Security Credentials Profile</h1>
            <p className="text-xs text-brand-secondary mt-1">Review associated subnet permissions and hardware access configurations</p>
          </div>
        </div>

        <button
          onClick={handleDownloadProfile}
          className="h-11 px-4 rounded-xl border border-[#334155] bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md shadow-brand-primary/5"
        >
          <Download className="w-4 h-4" />
          <span>Export Profile (.TXT)</span>
        </button>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Summary Card */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="p-6 text-center space-y-6">
            
            {/* Avatar upload/profile image edit */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-28 h-28 rounded-2xl bg-brand-primary/10 border-2 border-brand-primary/20 text-brand-primary font-bold text-4xl flex items-center justify-center font-mono shadow-lg relative overflow-hidden">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt={profileData.fullname} className="w-full h-full object-cover" />
                ) : (
                  profileData.fullname.charAt(0).toUpperCase()
                )}
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-brand-text">{profileData.fullname}</h3>
                <p className="text-[10px] text-brand-secondary font-mono mt-0.5">{profileData.email}</p>
              </div>

              <div className="flex gap-2 justify-center">
                <StatusBadge status={profileData.account_status} />
                <span className="text-[9px] font-bold text-white bg-brand-primary px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  {role}
                </span>
              </div>
            </div>

            {/* Profile Picture Uploader Component */}
            <div className="border-t border-[#334155]/20 pt-6">
              <FileUpload
                label="Update Identity Photo"
                maxSizeMB={2}
                allowedTypes={['image/jpeg', 'image/png']}
                onFileLoaded={(url) => setProfileValue('profile_image', url, { shouldDirty: true })}
              />
              {isProfileDirty && (
                <button
                  onClick={handleProfileSubmit(onProfileUpdate)}
                  className="mt-3 w-full h-9 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Save Photo & Phone Update
                </button>
              )}
            </div>

            {/* Common Details List */}
            <div className="border-t border-[#334155]/20 pt-6 text-xs space-y-3.5">
              <div className="flex justify-between items-center pb-2 border-b border-[#334155]/10">
                <span className="text-brand-secondary">Mobile Phone</span>
                <input
                  type="text"
                  maxLength={10}
                  className="bg-transparent text-right font-semibold text-brand-text focus:outline-none border-b border-transparent focus:border-brand-primary transition-colors pr-1 w-28"
                  {...registerProfile('phone')}
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-brand-secondary">Account Created</span>
                <span className="font-semibold text-brand-text">
                  {profileData.created_at ? new Date(profileData.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-brand-secondary">Last Login Time</span>
                <span className="font-semibold text-brand-text">
                  {profileData.last_login ? new Date(profileData.last_login).toLocaleTimeString() : 'N/A'}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Subnet Mapping Card */}
          <Card className="p-5 space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-brand-text">
              Network Location Mapping
            </h4>
            <div className="text-xs space-y-3 font-mono">
              <div className="flex justify-between">
                <span className="text-brand-secondary">IP</span>
                <span className="text-brand-text">{sess.ip_address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-secondary">MAC</span>
                <span className="text-brand-text">{sess.mac_address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-secondary">Connected AP</span>
                <span className="text-brand-text">{sess.access_point}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-secondary">SSID Profile</span>
                <span className="text-brand-text">{sess.connected_wifi}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Columns: Configuration Sections */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Tab Selection */}
          <div className="flex border-b border-[#334155]/20 gap-6 select-none">
            {['overview', 'history', 'session', 'security'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 font-bold text-xs uppercase tracking-wider cursor-pointer border-b-2 transition-colors ${
                  activeTab === tab 
                    ? 'border-brand-primary text-brand-primary' 
                    : 'border-transparent text-brand-secondary hover:text-brand-text'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview (Role-Specific Panels) */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* STUDENT PROFILE CARD */}
              {role === 'Student' && (
                <Card className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3 border-b border-[#334155]/20 pb-4">
                    <Shield className="w-5 h-5 text-brand-primary" />
                    <h3 className="font-extrabold text-sm text-brand-text uppercase tracking-wider">Student Academic Profile</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Student ID</span>
                      <span className="font-mono font-bold text-brand-text">{spec.student_id}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Department</span>
                      <span className="font-bold text-brand-text">{spec.department}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Academic Year</span>
                      <span className="font-bold text-brand-text">{spec.year}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Registered Hardware Devices</span>
                      <span className="font-bold text-brand-text">{spec.registered_devices} Device Nodes</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Negotiated Bandwidth</span>
                      <span className="font-bold text-brand-primary">{spec.current_bandwidth}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Monthly Data Accounted</span>
                      <span className="font-bold text-brand-text">{spec.monthly_data_usage}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Blocked URL Access Attempts</span>
                      <span className="font-bold text-brand-danger">{spec.blocked_website_attempts} Attempts</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Top Educational Domains</span>
                      <span className="font-bold text-brand-text truncate max-w-[200px]" title={spec.top_educational_websites}>
                        {spec.top_educational_websites}
                      </span>
                    </div>
                  </div>
                </Card>
              )}

              {/* FACULTY PROFILE CARD */}
              {role === 'Faculty' && (
                <Card className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3 border-b border-[#334155]/20 pb-4">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <h3 className="font-extrabold text-sm text-brand-text uppercase tracking-wider">Faculty Professional Profile</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Faculty ID</span>
                      <span className="font-mono font-bold text-brand-text">{spec.faculty_id}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Department Mapping</span>
                      <span className="font-bold text-brand-text">{spec.department}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Designation Role</span>
                      <span className="font-bold text-brand-text">{spec.designation}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">MFA Shield Configuration</span>
                      <span className="font-bold text-emerald-400">{spec.mfa_status}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Faculty Security Score</span>
                      <span className="font-bold text-brand-primary">{spec.security_score} / 100</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Bandwidth Allocated</span>
                      <span className="font-bold text-brand-text">{spec.bandwidth_usage}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Research Portal Domains</span>
                      <span className="font-bold text-brand-text truncate max-w-[200px]" title={spec.research_website_usage}>
                        {spec.research_website_usage}
                      </span>
                    </div>
                  </div>
                </Card>
              )}

              {/* PARENT PROFILE CARD */}
              {role === 'Parent Visitor' && (
                <Card className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3 border-b border-[#334155]/20 pb-4">
                    <Shield className="w-5 h-5 text-pink-400" />
                    <h3 className="font-extrabold text-sm text-brand-text uppercase tracking-wider">Parent Registry Profile</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Linked Student ID</span>
                      <span className="font-mono font-bold text-brand-text">{spec.linked_student_id}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Relationship Verified</span>
                      <span className="font-bold text-brand-text">{spec.relationship}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Student Department</span>
                      <span className="font-bold text-brand-text">{spec.student_department}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Allowed Portal Sites</span>
                      <span className="font-bold text-brand-text truncate max-w-[200px]">{spec.allowed_websites}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Monthly Data usage</span>
                      <span className="font-bold text-brand-primary">{spec.monthly_wifi_usage}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Visitor History</span>
                      <span className="font-bold text-brand-text">{spec.visitor_history}</span>
                    </div>
                  </div>
                </Card>
              )}

              {/* GUEST PROFILE CARD */}
              {role === 'Guest' && (
                <Card className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3 border-b border-[#334155]/20 pb-4">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-extrabold text-sm text-brand-text uppercase tracking-wider">Guest Visitor Profile</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Guest Account ID</span>
                      <span className="font-mono font-bold text-brand-text">{spec.guest_id}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Purpose of Visit</span>
                      <span className="font-bold text-brand-text">{spec.purpose_of_visit}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Visit Duration Lease</span>
                      <span className="font-bold text-brand-text">{spec.visit_duration}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Session Expiry Time</span>
                      <span className="font-bold text-brand-danger">{spec.session_expiry_time}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Remaining Lease Time</span>
                      <span className="font-bold text-brand-primary">{spec.remaining_time}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Allowed Subnets</span>
                      <span className="font-bold text-brand-text">{spec.allowed_websites}</span>
                    </div>
                  </div>
                </Card>
              )}

              {/* ADMIN PROFILE CARD */}
              {role === 'Super Admin' && (
                <Card className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3 border-b border-[#334155]/20 pb-4">
                    <Shield className="w-5 h-5 text-red-500" />
                    <h3 className="font-extrabold text-sm text-brand-text uppercase tracking-wider">Super Administrator Profile</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Administrator ID</span>
                      <span className="font-mono font-bold text-brand-text">{spec.admin_id}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Designation</span>
                      <span className="font-bold text-brand-text">{spec.designation}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Managed Campus Devices</span>
                      <span className="font-bold text-brand-text">{spec.managed_devices} Devices</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Active Gateway Sessions</span>
                      <span className="font-bold text-brand-primary">{spec.current_active_sessions} Active</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Firewall State</span>
                      <span className="font-bold text-emerald-400">{spec.firewall_status}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                      <span className="text-brand-secondary">Security Compliance Score</span>
                      <span className="font-bold text-brand-primary">{spec.security_score} / 100</span>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          )}

          {/* Tab 2: Login History */}
          {activeTab === 'history' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 md:p-8 space-y-4">
                <h3 className="text-sm font-extrabold text-brand-text uppercase tracking-wider mb-2">
                  Session Access History logs (Last 10)
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs select-none">
                    <thead>
                      <tr className="border-b border-[#334155]/30 text-brand-secondary uppercase tracking-wider font-semibold">
                        <th className="pb-3 px-4">Date & Time</th>
                        <th className="pb-3 px-4">Device</th>
                        <th className="pb-3 px-4">Platform</th>
                        <th className="pb-3 px-4 font-mono">IP Address</th>
                        <th className="pb-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#334155]/10">
                      {loginHistory.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-900/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-brand-text">{new Date(item.time).toLocaleDateString()}</div>
                            <div className="text-[10px] text-brand-secondary mt-0.5">{new Date(item.time).toLocaleTimeString()}</div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-brand-text">{item.device}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-brand-text">{item.browser}</div>
                            <div className="text-[10px] text-brand-secondary mt-0.5">{item.location}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-brand-secondary">{item.ip}</td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Tab 3: Active Session */}
          {activeTab === 'session' && activeSession && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-[#334155]/20 pb-4">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-5 h-5 text-brand-primary" />
                    <h3 className="font-extrabold text-sm text-brand-text uppercase tracking-wider">Current Terminal Session</h3>
                  </div>
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest animate-pulse">
                    Online
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
                  <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                    <span className="text-brand-secondary">Session Start</span>
                    <span className="font-bold text-brand-text">{new Date(activeSession.login_time).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                    <span className="text-brand-secondary">Device Name</span>
                    <span className="font-bold text-brand-text">{activeSession.device_name}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                    <span className="text-brand-secondary">Browser Client</span>
                    <span className="font-bold text-brand-text">{activeSession.browser}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                    <span className="text-brand-secondary">OS Platform</span>
                    <span className="font-bold text-brand-text">{activeSession.operating_system}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                    <span className="text-brand-secondary">Subnet IP Address</span>
                    <span className="font-bold text-brand-primary">{activeSession.ip_address}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                    <span className="text-brand-secondary">Gateway MAC Address</span>
                    <span className="font-bold text-brand-text">{activeSession.mac_address}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                    <span className="text-brand-secondary">SSID Profile</span>
                    <span className="font-bold text-brand-text">{activeSession.ssid}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#334155]/10">
                    <span className="text-brand-secondary">Access Point Node</span>
                    <span className="font-bold text-brand-text">{activeSession.access_point}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Tab 4: Security Section */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Password Strengths & Settings */}
              <Card className="p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-[#334155]/20 pb-4">
                  <Key className="w-5 h-5 text-brand-primary" />
                  <h3 className="font-extrabold text-sm text-brand-text uppercase tracking-wider">Security Profile Configuration</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs select-none pb-4 border-b border-[#334155]/10">
                  <div className="flex justify-between py-1.5">
                    <span className="text-brand-secondary">Remember Me Status</span>
                    <span className="font-bold text-emerald-400">Enabled</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-brand-secondary">MFA Status</span>
                    <span className={`font-bold ${sec.mfa_enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {sec.mfa_enabled ? 'MFA Protected' : 'Not Enabled'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-brand-secondary">Failed Login Attempts</span>
                    <span className={`font-bold ${sec.failed_login_attempts > 0 ? 'text-brand-danger' : 'text-emerald-400'}`}>
                      {sec.failed_login_attempts} Attempts
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-brand-secondary">Last Password Change</span>
                    <span className="font-bold text-brand-text">
                      {sec.last_password_change ? new Date(sec.last_password_change).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>

                {/* Change Password Form */}
                <form onSubmit={handlePasswordSubmit(onPasswordUpdate)} className="space-y-6 pt-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-brand-text mb-4">Change Access Password</h4>
                  
                  <div className="relative">
                    <Input
                      label="Current Access Password"
                      type={showOldPassword ? 'text' : 'password'}
                      icon={Lock}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      error={passwordErrors.old_password}
                      disabled={loadingPassword}
                      required
                      {...registerPassword('old_password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3.5 top-[38px] text-[#94a3b8] focus:outline-none cursor-pointer"
                    >
                      {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <Input
                        label="New Password"
                        type={showNewPassword ? 'text' : 'password'}
                        icon={Lock}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        error={passwordErrors.new_password}
                        disabled={loadingPassword}
                        required
                        {...registerPassword('new_password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-[38px] text-[#94a3b8] focus:outline-none cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="relative">
                      <Input
                        label="Confirm New Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        icon={Lock}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        error={passwordErrors.confirm_password}
                        disabled={loadingPassword}
                        required
                        {...registerPassword('confirm_password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-[38px] text-[#94a3b8] focus:outline-none cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {confirmPassword && (
                    <p className={`text-[11px] font-bold select-none ${isPasswordsMatching ? 'text-emerald-400' : 'text-brand-danger'}`}>
                      {isPasswordsMatching ? '✓ Passwords Match' : '✗ Passwords Do Not Match'}
                    </p>
                  )}

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
          )}

        </div>

      </div>

    </div>
  );
};

export default ProfilePage;
