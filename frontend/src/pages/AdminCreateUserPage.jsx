// frontend/src/pages/AdminCreateUserPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Phone, Lock, Eye, EyeOff, Shield, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { FileUpload } from '../components/forms/FileUpload';
import { PasswordStrengthMeter } from '../components/forms/PasswordStrengthMeter';
import { DEPARTMENTS } from '../constants/constants';

const adminCreateSchema = z.object({
  fullname: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be exactly 10 digits').regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit mobile number'),
  role_id: z.string().min(1, 'Please select a system role'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[@$!%*?&#]/, 'Password must contain at least one special character'),
  department: z.string().optional(),
  employee_id: z.string().optional(),
  roll_number: z.string().optional(),
  parent_student_roll: z.string().optional(),
  relationship: z.string().optional(),
  purpose: z.string().optional(),
  duration: z.string().optional(),
  profile_image: z.string().optional(),
  college_id_upload: z.string().optional(),
  account_status: z.string().default('Active')
}).superRefine((data, ctx) => {
  const role = parseInt(data.role_id, 10);
  
  if (role === 1) { // Admin
    if (data.employee_id && data.employee_id.trim()) {
      if (!/^ADM-[0-9]{3}$/.test(data.employee_id.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Admin ID must match ADM-XXX format (e.g. ADM-001)",
          path: ["employee_id"]
        });
      }
    }
  }
  if (role === 2) { // Faculty
    if (!data.employee_id || !data.employee_id.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Employee ID is required for Faculty",
        path: ["employee_id"]
      });
    } else if (!/^[0-9]{4,5}$/.test(data.employee_id.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Faculty ID must be exactly 4 or 5 digits numbers only",
        path: ["employee_id"]
      });
    }
  }
  if (role === 3) { // Student
    if (!data.roll_number || !data.roll_number.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Student ID is required for Students",
        path: ["roll_number"]
      });
    } else if (!/^[0-9]{10}$/.test(data.roll_number.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Student ID must be exactly 10 digits numbers only",
        path: ["roll_number"]
      });
    }
  }
  if (role === 4) { // Parent
    if (!data.parent_student_roll || !data.parent_student_roll.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Linked student roll number is required",
        path: ["parent_student_roll"]
      });
    } else if (!/^[0-9]{10}$/.test(data.parent_student_roll.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Student Roll Number must be exactly 10 digits numbers only",
        path: ["parent_student_roll"]
      });
    }
    if (!data.relationship || !data.relationship.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Relationship is required",
        path: ["relationship"]
      });
    }
  }
  if (role === 5) { // Guest
    if (data.roll_number && data.roll_number.trim()) {
      if (!/^GST-[0-9]{4}$/.test(data.roll_number.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Guest ID must match GST-XXXX format (e.g. GST-9021)",
          path: ["roll_number"]
        });
      }
    }
  }
});

export const AdminCreateUserPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.title = "SecureCampus AI | Manual User Registration";
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(adminCreateSchema),
    defaultValues: {
      fullname: '',
      email: '',
      phone: '',
      role_id: '',
      password: 'Temp@Access123', // Pre-filled default password
      department: '',
      employee_id: '',
      roll_number: '',
      parent_student_roll: '',
      relationship: '',
      purpose: '',
      duration: '',
      profile_image: '',
      college_id_upload: '',
      account_status: 'Active'
    }
  });

  const selectedRole = watch('role_id');
  const passwordVal = watch('password');
  const collegeIdUrl = watch('college_id_upload');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        role_id: parseInt(data.role_id, 10),
        // Exclude empty strings
        department: data.department || undefined,
        employee_id: data.employee_id || undefined,
        roll_number: data.roll_number || undefined,
        parent_student_roll: data.parent_student_roll || undefined,
        relationship: data.relationship || undefined,
        purpose: data.purpose || undefined,
        duration: data.duration || undefined,
        profile_image: data.profile_image || undefined,
        college_id_upload: data.college_id_upload || undefined
      };
      
      await api.post('/api/users/create', payload);
      toast.success(`User account for ${data.fullname} successfully created!`);
      navigate('/users');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Registration failed. Check details.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left">
      
      {/* Header links */}
      <div className="flex items-center justify-between select-none">
        <button
          onClick={() => navigate('/users')}
          className="flex items-center gap-2 text-xs text-brand-secondary hover:text-brand-text font-bold transition-colors focus:outline-none"
        >
          <ArrowLeft className="w-4.5 h-4.5" /> Back to Directory
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="max-w-none p-6">
          <div className="flex items-center gap-3 border-b border-[#334155]/20 pb-4 mb-6 select-none">
            <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-brand-text leading-tight">Manual User Registration</h2>
              <p className="text-[10px] text-brand-secondary mt-1">
                Onboard new operators and campus users directly. Onboarded users will be marked pre-verified and must reset their passwords on first login.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Core Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Enter full name"
                icon={User}
                error={errors.fullname}
                disabled={loading}
                required
                {...register('fullname')}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="username@domain.com"
                icon={Mail}
                error={errors.email}
                disabled={loading}
                required
                {...register('email')}
              />

              <Input
                label="Mobile Phone Number"
                type="tel"
                placeholder="9876543210"
                icon={Phone}
                error={errors.phone}
                disabled={loading}
                required
                {...register('phone')}
              />

              {/* Status Select */}
              <div className="space-y-1 select-none">
                <label className="block text-[11px] font-bold text-brand-secondary uppercase tracking-wider">
                  Initial Access Status
                </label>
                <select
                  disabled={loading}
                  {...register('account_status')}
                  className="h-10 w-full px-3.5 bg-slate-900 border border-[#334155] rounded-xl focus-ring-blue text-xs text-brand-text outline-none font-semibold"
                >
                  <option value="Active">Active (Onboarded)</option>
                  <option value="Pending">Pending (Requires Review)</option>
                  <option value="Suspended">Suspended (Locked)</option>
                </select>
              </div>

              {/* Role Select */}
              <div className="space-y-1 select-none">
                <label className="block text-[11px] font-bold text-brand-secondary uppercase tracking-wider">
                  System Authorization Role
                </label>
                <select
                  disabled={loading}
                  {...register('role_id')}
                  className="h-10 w-full px-3.5 bg-slate-900 border border-[#334155] rounded-xl focus-ring-blue text-xs text-brand-text outline-none font-semibold"
                >
                  <option value="">Select Role</option>
                  <option value="1">Super Admin</option>
                  <option value="2">Faculty</option>
                  <option value="3">Student</option>
                  <option value="4">Parent Visitor</option>
                  <option value="5">Guest</option>
                </select>
                {errors.role_id && (
                  <p className="text-[10px] text-brand-danger font-semibold mt-1">{errors.role_id.message}</p>
                )}
              </div>

              {/* Department Select */}
              <div className="space-y-1 select-none">
                <label className="block text-[11px] font-bold text-brand-secondary uppercase tracking-wider">
                  Department
                </label>
                <select
                  disabled={loading}
                  {...register('department')}
                  className="h-10 w-full px-3.5 bg-slate-900 border border-[#334155] rounded-xl focus-ring-blue text-xs text-brand-text outline-none font-semibold"
                >
                  <option value="">No Department</option>
                  {DEPARTMENTS.map((d, i) => (
                    <option key={i} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Role specific panels */}
            {selectedRole === '2' && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 gap-4 p-4 rounded-xl border border-brand-primary/10 bg-brand-primary/5 select-none"
              >
                <Input
                  label="Employee Identification Code"
                  placeholder="FAC-1234"
                  error={errors.employee_id}
                  disabled={loading}
                  required
                  {...register('employee_id')}
                />
              </motion.div>
            )}

            {selectedRole === '3' && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-brand-primary/10 bg-brand-primary/5 select-none"
              >
                <Input
                  label="Student Roll Number"
                  placeholder="22CSE1092"
                  error={errors.roll_number}
                  disabled={loading}
                  required
                  {...register('roll_number')}
                />
                
                <Input
                  label="Academic Year"
                  placeholder="e.g. III Year"
                  error={errors.duration}
                  disabled={loading}
                  {...register('duration')}
                />
              </motion.div>
            )}

            {selectedRole === '4' && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-brand-primary/10 bg-brand-primary/5 select-none"
              >
                <Input
                  label="Linked Student Roll Number"
                  placeholder="22CSE1092"
                  error={errors.parent_student_roll}
                  disabled={loading}
                  required
                  {...register('parent_student_roll')}
                />
                
                <Input
                  label="Relationship to Student"
                  placeholder="e.g. Father"
                  error={errors.relationship}
                  disabled={loading}
                  required
                  {...register('relationship')}
                />
              </motion.div>
            )}

            {selectedRole === '5' && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-brand-primary/10 bg-brand-primary/5 select-none"
              >
                <Input
                  label="Visit Purpose"
                  placeholder="e.g. Lab Seminar"
                  error={errors.purpose}
                  disabled={loading}
                  {...register('purpose')}
                />
                
                <Input
                  label="Stay Duration (Hours/Days)"
                  placeholder="e.g. 4 Hours"
                  error={errors.duration}
                  disabled={loading}
                  {...register('duration')}
                />
              </motion.div>
            )}

            {/* Document upload block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 select-none border-t border-[#334155]/20 pt-6">
              <FileUpload
                label="College ID / Verification Document"
                maxSizeMB={5}
                allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                onFileLoaded={(url) => setValue('college_id_upload', url)}
              />
              
              {collegeIdUrl && (
                <div className="flex items-center gap-3 p-4 bg-slate-950/40 rounded-xl border border-slate-800 self-end">
                  <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-lg font-bold">
                    ID
                  </div>
                  <div className="grow min-w-0 text-left text-xs">
                    <p className="font-bold text-brand-text truncate">Verification_Attached</p>
                    <button
                      type="button"
                      onClick={() => setValue('college_id_upload', '')}
                      className="text-brand-danger font-semibold hover:underline mt-0.5"
                    >
                      Remove Document
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Temporary password setup panel */}
            <div className="border-t border-[#334155]/20 pt-6 space-y-4">
              <div className="relative">
                <Input
                  label="Temporary Password"
                  type={showPassword ? 'text' : 'password'}
                  icon={Lock}
                  placeholder="••••••••"
                  error={errors.password}
                  disabled={loading}
                  required
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-[38px] text-[#94a3b8] focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <PasswordStrengthMeter password={passwordVal} />
            </div>

            {/* Onboarding Actions */}
            <div className="flex justify-end gap-3 border-t border-[#334155]/20 pt-6">
              <Button
                type="button"
                variant="secondary"
                disabled={loading}
                onClick={() => navigate('/users')}
                className="h-11 px-6 text-xs w-auto font-bold"
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                loadingText="Registering Operator..."
                disabled={loading}
                className="h-11 px-6 text-xs w-auto font-bold"
              >
                Register Account
              </Button>
            </div>

          </form>
        </Card>
      </motion.div>

    </div>
  );
};

export default AdminCreateUserPage;
