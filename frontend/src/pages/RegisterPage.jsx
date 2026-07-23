// frontend/src/pages/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, ChevronRight, ChevronLeft, Building2, Eye, EyeOff, GraduationCap, Briefcase, Users, ArrowLeft } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { StepIndicator } from '../components/ui/StepIndicator';
import { DEPARTMENTS, STUDENT_YEARS, RELATIONSHIPS } from '../constants/constants';

const registerSchema = z.object({
  fullname: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required').regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number.'),
  role_id: z.string().min(1, 'Role is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[@$!%*?&#]/, 'Password must contain at least one special character')
    .regex(/^\S*$/, 'Password cannot contain spaces'),
  confirm_password: z.string(),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms'),
  
  // Conditional fields
  department: z.string().optional(),
  roll_number: z.string().optional(),
  employee_id: z.string().optional(),
  parent_student_roll: z.string().optional(),
  relationship: z.string().optional(),
  duration: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirm_password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["confirm_password"]
    });
  }

  const roleId = parseInt(data.role_id, 10);
  const cleanEmail = (data.email || '').trim().toLowerCase();
  const isKluEmail = cleanEmail.endsWith('@kluniversity.in') || cleanEmail.includes('.kluniversity.in');

  if (roleId === 2) {
    if (!isKluEmail) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Faculty must register using their official KL University email (@kluniversity.in).", path: ["email"] });
    }
    if (!data.employee_id || !data.employee_id.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Faculty ID is required", path: ["employee_id"] });
    } else if (!/^[0-9]{4,5}$/.test(data.employee_id.trim())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Faculty ID must be 4 or 5 digits numbers only", path: ["employee_id"] });
    }
    if (!data.department || !data.department.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Department is required", path: ["department"] });
    }
  } else if (roleId === 3) {
    if (!isKluEmail) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Students must register using their official KL University email (@kluniversity.in).", path: ["email"] });
    }
    if (!data.roll_number || !data.roll_number.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Student ID is required", path: ["roll_number"] });
    } else if (!/^[0-9]{10}$/.test(data.roll_number.trim())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Student ID must be exactly 10 digits numbers only", path: ["roll_number"] });
    }
    if (!data.department || !data.department.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Department is required", path: ["department"] });
    }
    if (!data.duration || !data.duration.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Academic Year is required", path: ["duration"] });
    }
  } else if (roleId === 4) {
    if (!data.parent_student_roll || !data.parent_student_roll.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Student Roll Number is required", path: ["parent_student_roll"] });
    }
    if (!data.relationship || !data.relationship.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Relationship status is required", path: ["relationship"] });
    }
  }
});

export const RegisterPage = ({ roleContext: propRoleContext }) => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Determine active role from prop or route path
  const getActiveRoleInfo = () => {
    const path = location.pathname.toLowerCase();
    let roleName = propRoleContext || 'Student';
    if (path.includes('faculty')) roleName = 'Faculty';
    else if (path.includes('parent')) roleName = 'Parent';
    else if (path.includes('student')) roleName = 'Student';

    if (roleName === 'Faculty') {
      return { roleName: 'Faculty', roleId: 2, icon: Briefcase, badge: '👨‍🏫 Faculty Portal', title: 'Create Faculty Account', signInPath: '/faculty/signin' };
    } else if (roleName === 'Parent') {
      return { roleName: 'Parent', roleId: 4, icon: Users, badge: '👨‍👩‍👧 Parent Portal', title: 'Create Parent Account', signInPath: '/parent/signin' };
    } else {
      return { roleName: 'Student', roleId: 3, icon: GraduationCap, badge: '🎓 Student Portal', title: 'Create Student Account', signInPath: '/student/signin' };
    }
  };

  const roleInfo = getActiveRoleInfo();
  const RoleIcon = roleInfo.icon;

  useEffect(() => {
    document.title = `SecureCampus AI | ${roleInfo.title}`;
  }, [roleInfo]);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      fullname: '',
      email: '',
      phone: '',
      role_id: String(roleInfo.roleId),
      department: '',
      roll_number: '',
      employee_id: '',
      parent_student_roll: '',
      relationship: '',
      duration: '',
      password: '',
      confirm_password: '',
      terms: false
    }
  });

  // Ensure role_id stays in sync
  useEffect(() => {
    setValue('role_id', String(roleInfo.roleId));
  }, [roleInfo, setValue]);

  const watchName = watch('fullname');
  const watchEmail = watch('email');
  const watchPhone = watch('phone');
  const password = watch('password') || '';
  const confirmPassword = watch('confirm_password') || '';
  const termsAccepted = watch('terms');

  // Trigger beforeunload browser prompt
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const nextStep = async () => {
    let fieldsToValidate = ['fullname', 'email', 'phone'];
    if (roleInfo.roleId === 2) fieldsToValidate.push('employee_id', 'department');
    if (roleInfo.roleId === 3) fieldsToValidate.push('roll_number', 'department', 'duration');
    if (roleInfo.roleId === 4) fieldsToValidate.push('parent_student_roll', 'relationship');

    const ok = await trigger(fieldsToValidate);
    if (ok) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  // Password checklist conditions
  const criteria = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&#]/.test(password)
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: 'None', color: 'bg-transparent', score: 0, textClass: 'text-slate-500' };
    let score = 0;
    if (criteria.length) score++;
    if (criteria.upper) score++;
    if (criteria.lower) score++;
    if (criteria.number) score++;
    if (criteria.special) score++;

    const levels = {
      0: { label: 'Very Weak', color: 'bg-red-500', textClass: 'text-red-500' },
      1: { label: 'Very Weak', color: 'bg-red-500', textClass: 'text-red-500' },
      2: { label: 'Weak', color: 'bg-red-400', textClass: 'text-red-400' },
      3: { label: 'Medium', color: 'bg-yellow-500', textClass: 'text-yellow-500' },
      4: { label: 'Strong', color: 'bg-emerald-500', textClass: 'text-emerald-500' },
      5: { label: 'Very Strong', color: 'bg-emerald-600', textClass: 'text-emerald-600' }
    };
    return { ...levels[score], score };
  };

  const { score, label, color, textClass } = getPasswordStrength(password);
  
  const isPasswordValid = criteria.length && criteria.upper && criteria.lower && criteria.number && criteria.special && !password.includes(' ');
  const isPasswordsMatching = password === confirmPassword && confirmPassword.length > 0;
  const isStep2Valid = isPasswordValid && isPasswordsMatching && termsAccepted && !errors.password && !errors.confirm_password;

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        role_id: roleInfo.roleId
      };
      await registerAuth(payload);
      navigate(roleInfo.signInPath);
    } catch {
      // Toast notification displayed by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full sm:max-w-[480px] lg:max-w-[500px] z-10 my-auto"
    >
      <Card className="sm:max-w-none lg:max-w-none">
        {/* Back Navigation */}
        <div className="flex justify-start mb-3">
          <button
            type="button"
            onClick={() => navigate('/select-role')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border shadow-xs cursor-pointer transition-colors"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)'
            }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change Role</span>
          </button>
        </div>

        {/* Card Header with Role Badge & Icon */}
        <div className="flex flex-col items-center gap-2 mb-6 text-center select-none">
          <div 
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border shadow-xs"
            style={{
              backgroundColor: 'var(--color-primary-light)',
              borderColor: 'var(--border-color)',
              color: 'var(--color-primary)'
            }}
          >
            <span>{roleInfo.badge}</span>
          </div>
          <h2 className="text-h2 font-extrabold tracking-tight" style={{ color: 'var(--text-main)' }}>
            {roleInfo.title}
          </h2>
          <p className="text-body text-xs max-w-xs" style={{ color: 'var(--text-secondary)' }}>
            Setup official security credentials for your {roleInfo.roleName} account.
          </p>
        </div>

        {/* 2-Step Wizard Indicator */}
        <StepIndicator currentStep={step} steps={['Basic Information', 'Security Setup']} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-4 text-left">
          
          {/* Step 1: Basic Information + Role Fields */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <Input
                label="Full Name"
                placeholder="John Doe"
                icon={User}
                required
                autoComplete="name"
                error={errors.fullname}
                isValid={Boolean(watchName && watchName.length >= 3 && !errors.fullname)}
                {...register('fullname')}
              />

              <Input
                label="Security Email"
                type="email"
                placeholder={roleInfo.roleId === 4 ? "parent@example.com" : "username@kluniversity.in"}
                icon={Mail}
                required
                autoComplete="email"
                error={errors.email}
                isValid={Boolean(watchEmail && !errors.email)}
                {...register('email')}
              />

              <Input
                label="Mobile Number"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="9876543210"
                icon={Phone}
                required
                autoComplete="tel"
                error={errors.phone}
                isValid={Boolean(watchPhone && watchPhone.length === 10 && !errors.phone)}
                {...register('phone')}
              />

              {/* Role-Specific Fields */}
              {roleInfo.roleId === 3 && (
                <>
                  <Input
                    label="Student ID (Roll Number)"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="2400000000"
                    icon={Building2}
                    required
                    error={errors.roll_number}
                    isValid={Boolean(watch('roll_number') && watch('roll_number').length === 10 && !errors.roll_number)}
                    {...register('roll_number')}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-label font-semibold uppercase tracking-wider select-none">
                      Department <span className="text-red-500 font-bold">*</span>
                    </label>
                    <select
                      className="h-12 w-full border text-input rounded-xl text-body transition-all duration-150 outline-none px-4"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-main)',
                        borderColor: errors.department ? '#ef4444' : 'var(--border-color)'
                      }}
                      {...register('department')}
                    >
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    {errors.department && <p className="text-sm text-red-500 font-semibold pl-1">{errors.department.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-label font-semibold uppercase tracking-wider select-none">
                      Academic Year <span className="text-red-500 font-bold">*</span>
                    </label>
                    <select
                      className="h-12 w-full border text-input rounded-xl text-body transition-all duration-150 outline-none px-4"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-main)',
                        borderColor: errors.duration ? '#ef4444' : 'var(--border-color)'
                      }}
                      {...register('duration')}
                    >
                      <option value="">Select Academic Year</option>
                      {STUDENT_YEARS.map((yr) => (
                        <option key={yr.value} value={yr.value}>{yr.label}</option>
                      ))}
                    </select>
                    {errors.duration && <p className="text-sm text-red-500 font-semibold pl-1">{errors.duration.message}</p>}
                  </div>
                </>
              )}

              {roleInfo.roleId === 2 && (
                <>
                  <Input
                    label="Faculty ID (Employee ID)"
                    inputMode="numeric"
                    maxLength={5}
                    placeholder="1234"
                    icon={Building2}
                    required
                    error={errors.employee_id}
                    isValid={Boolean(watch('employee_id') && !errors.employee_id)}
                    {...register('employee_id')}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-label font-semibold uppercase tracking-wider select-none">
                      Department <span className="text-red-500 font-bold">*</span>
                    </label>
                    <select
                      className="h-12 w-full border text-input rounded-xl text-body transition-all duration-150 outline-none px-4"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-main)',
                        borderColor: errors.department ? '#ef4444' : 'var(--border-color)'
                      }}
                      {...register('department')}
                    >
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    {errors.department && <p className="text-sm text-red-500 font-semibold pl-1">{errors.department.message}</p>}
                  </div>
                </>
              )}

              {roleInfo.roleId === 4 && (
                <>
                  <Input
                    label="Student Roll Number"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="2400000000"
                    icon={Building2}
                    required
                    error={errors.parent_student_roll}
                    isValid={Boolean(watch('parent_student_roll') && !errors.parent_student_roll)}
                    {...register('parent_student_roll')}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-label font-semibold uppercase tracking-wider select-none">
                      Relationship to Student <span className="text-red-500 font-bold">*</span>
                    </label>
                    <select
                      className="h-12 w-full border text-input rounded-xl text-body transition-all duration-150 outline-none px-4"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-main)',
                        borderColor: errors.relationship ? '#ef4444' : 'var(--border-color)'
                      }}
                      {...register('relationship')}
                    >
                      <option value="">Select Relationship</option>
                      {RELATIONSHIPS.map((rel) => (
                        <option key={rel} value={rel}>{rel}</option>
                      ))}
                    </select>
                    {errors.relationship && <p className="text-sm text-red-500 font-semibold pl-1">{errors.relationship.message}</p>}
                  </div>
                </>
              )}

              <Button type="button" onClick={nextStep} className="w-full mt-4">
                <span>Continue to Security Setup</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Security Setup */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Password Input */}
              <div className="relative">
                <Input
                  label="Create Password"
                  type={showPassword ? 'text' : 'password'}
                  icon={Lock}
                  required
                  placeholder="••••••••"
                  autoComplete="new-password"
                  error={errors.password}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-200 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Progress Bar & Checklist */}
              {password && (
                <div className="space-y-2 p-3 rounded-xl border bg-black/10" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span style={{ color: 'var(--text-muted)' }}>Password Strength:</span>
                    <span className={`font-bold ${textClass}`}>{label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${color}`} style={{ width: `${(score / 5) * 100}%` }} />
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1.5 font-medium">
                    <span className={criteria.length ? 'text-emerald-500 font-semibold' : 'text-slate-500'}>
                      {criteria.length ? '✓' : '•'} Min 8 Characters
                    </span>
                    <span className={criteria.upper ? 'text-emerald-500 font-semibold' : 'text-slate-500'}>
                      {criteria.upper ? '✓' : '•'} 1 Uppercase Letter
                    </span>
                    <span className={criteria.lower ? 'text-emerald-500 font-semibold' : 'text-slate-500'}>
                      {criteria.lower ? '✓' : '•'} 1 Lowercase Letter
                    </span>
                    <span className={criteria.number ? 'text-emerald-500 font-semibold' : 'text-slate-500'}>
                      {criteria.number ? '✓' : '•'} 1 Numeric Digit
                    </span>
                    <span className={criteria.special ? 'text-emerald-500 font-semibold' : 'text-slate-500'}>
                      {criteria.special ? '✓' : '•'} 1 Special Character
                    </span>
                    <span className={!password.includes(' ') ? 'text-emerald-500 font-semibold' : 'text-red-500'}>
                      {!password.includes(' ') ? '✓' : '✗'} No Spaces Allowed
                    </span>
                  </div>
                </div>
              )}

              {/* Confirm Password */}
              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  icon={Lock}
                  required
                  placeholder="••••••••"
                  autoComplete="new-password"
                  error={errors.confirm_password}
                  isValid={isPasswordsMatching}
                  {...register('confirm_password')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-200 transition-colors p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 w-4 h-4 rounded border-slate-700 text-brand-primary focus:ring-brand-primary cursor-pointer"
                  {...register('terms')}
                />
                <label htmlFor="terms" className="text-xs select-none cursor-pointer leading-tight" style={{ color: 'var(--text-secondary)' }}>
                  I agree to the <a href={`/terms/${propRoleContext?.toLowerCase() || 'student'}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-primary hover:underline">Terms of Service</a> and Privacy Policy.
                </label>
              </div>
              {errors.terms && <p className="text-xs text-red-500 font-semibold">{errors.terms.message}</p>}

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={prevStep} className="w-1/3">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
                <Button 
                  type="submit" 
                  loading={loading} 
                  loadingText="Creating Account..." 
                  disabled={loading || !isStep2Valid}
                  className="w-2/3"
                >
                  Create Account
                </Button>
              </div>
            </motion.div>
          )}

          {/* Footer Link */}
          <div className="text-center pt-2 select-none border-t" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Already registered?{' '}
              <Link to={roleInfo.signInPath} className="font-bold hover:underline" style={{ color: 'var(--color-primary)' }}>
                Sign In to {roleInfo.roleName} Portal
              </Link>
            </p>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

export default RegisterPage;
