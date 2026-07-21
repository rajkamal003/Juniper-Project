// frontend/src/pages/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, ChevronRight, ChevronLeft, Building2, Terminal, Eye, EyeOff } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { StepIndicator } from '../components/ui/StepIndicator';
import { FileUpload } from '../components/forms/FileUpload';
import { DEPARTMENTS, STUDENT_YEARS, GUEST_DURATIONS, RELATIONSHIPS } from '../constants/constants';

const registerSchema = z.object({
  fullname: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required').regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number.'),
  role_id: z.string().min(1, 'Please select a role'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[@$!%*?&#]/, 'Password must contain at least one special character'),
  confirm_password: z.string(),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms'),
  
  // Conditional fields
  department: z.string().optional(),
  roll_number: z.string().optional(),
  employee_id: z.string().optional(),
  parent_student_roll: z.string().optional(),
  relationship: z.string().optional(),
  purpose: z.string().optional(),
  duration: z.string().optional(),
  profile_image: z.string().optional(),
  college_id_upload: z.string().optional()
}).superRefine((data, ctx) => {
  if (data.password !== data.confirm_password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["confirm_password"]
    });
  }

  const roleId = parseInt(data.role_id, 10);
  
  if (roleId === 2) {
    if (!data.employee_id || !data.employee_id.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Employee ID is required", path: ["employee_id"] });
    }
    if (!data.department || !data.department.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Department is required", path: ["department"] });
    }
  } else if (roleId === 3) {
    if (!data.roll_number || !data.roll_number.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Roll Number is required", path: ["roll_number"] });
    }
    if (!data.department || !data.department.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Department is required", path: ["department"] });
    }
    if (!data.duration || !data.duration.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Year is required", path: ["duration"] });
    }
  } else if (roleId === 4) {
    if (!data.parent_student_roll || !data.parent_student_roll.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Student Roll Number is required", path: ["parent_student_roll"] });
    }
    if (!data.relationship || !data.relationship.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Relationship status is required", path: ["relationship"] });
    }
  } else if (roleId === 5) {
    if (!data.purpose || !data.purpose.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Purpose of visit is required", path: ["purpose"] });
    }
    if (!data.duration || !data.duration.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Visit duration is required", path: ["duration"] });
    }
  }
});

export const RegisterPage = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "SecureCampus AI | Create Account";
  }, []);

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
      role_id: '',
      password: '',
      confirm_password: '',
      terms: false,
      department: '',
      roll_number: '',
      employee_id: '',
      parent_student_roll: '',
      relationship: '',
      purpose: '',
      duration: '',
      profile_image: '',
      college_id_upload: ''
    }
  });

  const watchName = watch('fullname');
  const watchEmail = watch('email');
  const watchPhone = watch('phone');
  const watchRoleIdStr = watch('role_id');
  const selectedRoleId = watchRoleIdStr ? parseInt(watchRoleIdStr, 10) : null;
  const password = watch('password');
  const confirmPassword = watch('confirm_password');
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

  // Next Step validation locks
  const isStep1Valid = watchName && watchEmail && watchPhone && !errors.fullname && !errors.email && !errors.phone;
  
  const getIsStep2Valid = () => {
    if (!selectedRoleId) return false;
    if (errors.role_id) return false;
    if (selectedRoleId === 2) return watch('employee_id') && watch('department') && !errors.employee_id && !errors.department;
    if (selectedRoleId === 3) return watch('roll_number') && watch('department') && watch('duration') && !errors.roll_number && !errors.department && !errors.duration;
    if (selectedRoleId === 4) return watch('parent_student_roll') && watch('relationship') && !errors.parent_student_roll && !errors.relationship;
    if (selectedRoleId === 5) return watch('purpose') && watch('duration') && !errors.purpose && !errors.duration;
    return true;
  };
  const isStep2Valid = getIsStep2Valid();

  const nextStep = async () => {
    if (step === 1) {
      const ok = await trigger(['fullname', 'email', 'phone']);
      if (ok) setStep(2);
    } else if (step === 2) {
      const fields = ['role_id'];
      if (selectedRoleId === 2) fields.push('employee_id', 'department');
      if (selectedRoleId === 3) fields.push('roll_number', 'department', 'duration');
      if (selectedRoleId === 4) fields.push('parent_student_roll', 'relationship');
      if (selectedRoleId === 5) fields.push('purpose', 'duration');
      const ok = await trigger(fields);
      if (ok) setStep(3);
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
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
      0: { label: 'Very Weak', color: 'bg-brand-danger', textClass: 'text-brand-danger' },
      1: { label: 'Very Weak', color: 'bg-brand-danger', textClass: 'text-brand-danger' },
      2: { label: 'Weak', color: 'bg-red-500', textClass: 'text-red-500' },
      3: { label: 'Medium', color: 'bg-yellow-500', textClass: 'text-yellow-500' },
      4: { label: 'Strong', color: 'bg-brand-primary', textClass: 'text-brand-primary' },
      5: { label: 'Very Strong', color: 'bg-brand-success', textClass: 'text-brand-success' }
    };
    return { ...levels[score], score };
  };

  const { score, label, color, textClass } = getPasswordStrength(password);
  
  // Submit lock validations
  const isPasswordValid = criteria.length && criteria.upper && criteria.lower && criteria.number && criteria.special;
  const isPasswordsMatching = password === confirmPassword;
  const isFinalStepValid = isPasswordValid && isPasswordsMatching && termsAccepted && !errors.password && !errors.confirm_password;

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        role_id: parseInt(data.role_id, 10)
      };
      await registerAuth(payload);
      navigate('/login');
    } catch {
      // Handled by AuthContext toast notification
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full sm:max-w-[480px] lg:max-w-[500px] z-10"
    >
      <Card className="sm:max-w-none lg:max-w-none">
        {/* Card Header */}
        <div className="flex flex-col items-center gap-1.5 mb-6 text-center select-none animate-pulse-slow">
          <h2 className="text-xl font-bold tracking-tight text-brand-text">Create Account</h2>
          <p className="text-xs text-brand-secondary">Setup security credentials</p>
        </div>

        <StepIndicator currentStep={step} steps={['Basic', 'Role', 'Security']} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          
          {/* Step 1: Basic Information */}
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
                autoFocus={true}
                error={errors.fullname}
                isValid={watchName?.length >= 3 && !errors.fullname}
                disabled={loading}
                required
                {...register('fullname')}
              />
              
              <Input
                label="Security Email"
                type="email"
                placeholder="operator@securecampus.com"
                icon={Mail}
                autoComplete="email"
                error={errors.email}
                isValid={watchEmail !== '' && !errors.email}
                disabled={loading}
                required
                {...register('email')}
              />

              <Input
                label="Phone Number"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                placeholder="9876543210"
                icon={Phone}
                error={errors.phone}
                isValid={watchPhone?.length === 10 && !errors.phone}
                disabled={loading}
                required
                {...register('phone')}
              />
            </motion.div>
          )}

          {/* Step 2: Role Details */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="block text-[13px] font-medium text-brand-secondary uppercase tracking-wider select-none">
                  Choose System Role <span className="text-brand-danger font-bold">*</span>
                </label>
                <select
                  {...register('role_id')}
                  className={`h-12 w-full px-4 bg-slate-900/40 border rounded-xl focus-ring-blue text-[15px] outline-none text-brand-text ${
                    errors.role_id ? 'border-brand-danger' : 'border-[#334155]'
                  }`}
                >
                  <option value="" className="bg-[#1e293b] text-slate-500">Select Role</option>
                  <option value="2" className="bg-[#1e293b] text-brand-text">Faculty</option>
                  <option value="3" className="bg-[#1e293b] text-brand-text">Student</option>
                  <option value="4" className="bg-[#1e293b] text-brand-text">Parent Visitor</option>
                  <option value="5" className="bg-[#1e293b] text-brand-text">Guest</option>
                </select>
                {errors.role_id && <p className="text-[12px] text-brand-danger font-medium pl-1">{errors.role_id.message}</p>}
              </div>

              {/* Conditional Fields */}
              {selectedRoleId && (
                <div className="p-4 rounded-xl border border-[#334155]/60 bg-slate-900/20 space-y-4 animate-float-medium">
                  
                  {/* Faculty */}
                  {selectedRoleId === 2 && (
                    <>
                      <Input
                        label="Employee ID"
                        placeholder="FAC-2098"
                        icon={Terminal}
                        error={errors.employee_id}
                        isValid={watch('employee_id') !== '' && !errors.employee_id}
                        required
                        {...register('employee_id')}
                      />
                      <div className="space-y-1">
                        <label className="block text-[13px] font-medium text-brand-secondary uppercase tracking-wider select-none">
                          Department <span className="text-brand-danger font-bold">*</span>
                        </label>
                        <select
                          {...register('department')}
                          className="h-12 w-full px-4 bg-slate-900/40 border border-[#334155] rounded-xl focus-ring-blue text-brand-text"
                        >
                          <option value="" className="bg-[#1e293b] text-slate-500">Choose Department</option>
                          {DEPARTMENTS.map((d, i) => (
                            <option key={i} value={d} className="bg-[#1e293b] text-brand-text">{d}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {/* Student */}
                  {selectedRoleId === 3 && (
                    <>
                      <Input
                        label="Student Roll Number"
                        placeholder="22CSE1092"
                        icon={Terminal}
                        error={errors.roll_number}
                        isValid={watch('roll_number') !== '' && !errors.roll_number}
                        required
                        {...register('roll_number')}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[13px] font-medium text-brand-secondary uppercase tracking-wider select-none">
                            Department <span className="text-brand-danger font-bold">*</span>
                          </label>
                          <select
                            {...register('department')}
                            className="h-12 w-full px-4 bg-slate-900/40 border border-[#334155] rounded-xl focus-ring-blue text-brand-text"
                          >
                            <option value="" className="bg-[#1e293b] text-slate-500">Select</option>
                            {DEPARTMENTS.map((d, i) => (
                              <option key={i} value={d} className="bg-[#1e293b] text-brand-text">{d}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="block text-[13px] font-medium text-brand-secondary uppercase tracking-wider select-none">
                            Academic Year <span className="text-brand-danger font-bold">*</span>
                          </label>
                          <select
                            {...register('duration')}
                            className="h-12 w-full px-4 bg-slate-900/40 border border-[#334155] rounded-xl focus-ring-blue text-brand-text"
                          >
                            <option value="" className="bg-[#1e293b] text-slate-500">Year</option>
                            {STUDENT_YEARS.map((y, i) => (
                              <option key={i} value={y.value} className="bg-[#1e293b] text-brand-text">{y.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Parent Visitor */}
                  {selectedRoleId === 4 && (
                    <>
                      <Input
                        label="Student Roll Number"
                        placeholder="22CSE1092"
                        icon={Terminal}
                        error={errors.parent_student_roll}
                        isValid={watch('parent_student_roll') !== '' && !errors.parent_student_roll}
                        required
                        {...register('parent_student_roll')}
                      />
                      <div className="space-y-1">
                        <label className="block text-[13px] font-medium text-brand-secondary uppercase tracking-wider select-none">
                          Relationship Status <span className="text-brand-danger font-bold">*</span>
                        </label>
                        <select
                          {...register('relationship')}
                          className="h-12 w-full px-4 bg-slate-900/40 border border-[#334155] rounded-xl focus-ring-blue text-brand-text"
                        >
                          <option value="" className="bg-[#1e293b] text-slate-500">Select Relationship</option>
                          {RELATIONSHIPS.map((r, i) => (
                            <option key={i} value={r} className="bg-[#1e293b] text-brand-text">{r}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {/* Guest */}
                  {selectedRoleId === 5 && (
                    <>
                      <Input
                        label="Purpose of Visit"
                        placeholder="Research collaboration meeting"
                        icon={Building2}
                        error={errors.purpose}
                        isValid={watch('purpose') !== '' && !errors.purpose}
                        required
                        {...register('purpose')}
                      />
                      <div className="space-y-1">
                        <label className="block text-[13px] font-medium text-brand-secondary uppercase tracking-wider select-none">
                          Expected Duration <span className="text-brand-danger font-bold">*</span>
                        </label>
                        <select
                          {...register('duration')}
                          className="h-12 w-full px-4 bg-slate-900/40 border border-[#334155] rounded-xl focus-ring-blue text-brand-text"
                        >
                          <option value="" className="bg-[#1e293b] text-slate-500">Choose Duration</option>
                          {GUEST_DURATIONS.map((g, i) => (
                            <option key={i} value={g} className="bg-[#1e293b] text-brand-text">{g}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Security & Credentials */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Password Input */}
              <div className="relative">
                <Input
                  label="Access Password"
                  type={showPassword ? 'text' : 'password'}
                  icon={Lock}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  error={errors.password}
                  isValid={password !== '' && !errors.password}
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

              {/* Confirm Password Input */}
              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  icon={Lock}
                  placeholder="••••••••"
                  error={errors.confirm_password}
                  isValid={confirmPassword !== '' && isPasswordsMatching}
                  disabled={loading}
                  required
                  {...register('confirm_password')}
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

              {/* Match Indicators */}
              {confirmPassword && (
                <p className={`text-[11px] font-bold ${isPasswordsMatching ? 'text-brand-success' : 'text-brand-danger'}`}>
                  {isPasswordsMatching ? '✓ Passwords Match' : '✗ Passwords Do Not Match'}
                </p>
              )}

              {/* Password strength checklist display */}
              <div className="p-4 rounded-xl border border-[#334155]/60 bg-slate-900/20 space-y-3 select-none">
                <div className="flex justify-between items-center text-[11px] font-semibold tracking-wider">
                  <span className="text-brand-secondary">STRENGTH METER:</span>
                  <span className={`${textClass} font-bold uppercase`}>{label}</span>
                </div>
                
                {/* Strength Bar */}
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((levelIndex) => (
                    <div key={levelIndex} className={`h-1.5 rounded-full transition-all duration-300 ${score >= levelIndex ? color : 'bg-[#334155]'}`} />
                  ))}
                </div>

                <ul className="space-y-1.5 text-[11px] font-semibold text-brand-secondary pt-2">
                  <li className={criteria.length ? 'text-brand-success' : ''}>{criteria.length ? '✓' : '•'} Minimum 8 characters</li>
                  <li className={criteria.upper ? 'text-brand-success' : ''}>{criteria.upper ? '✓' : '•'} Contains uppercase letter</li>
                  <li className={criteria.lower ? 'text-brand-success' : ''}>{criteria.lower ? '✓' : '•'} Contains lowercase letter</li>
                  <li className={criteria.number ? 'text-brand-success' : ''}>{criteria.number ? '✓' : '•'} Contains number</li>
                  <li className={criteria.special ? 'text-brand-success' : ''}>{criteria.special ? '✓' : '•'} Contains special character (@$!%*?&#)</li>
                </ul>
              </div>

              {/* File Uploads (Mock) */}
              <FileUpload
                label="Upload Profile Photo"
                maxSizeMB={2}
                allowedTypes={['image/jpeg', 'image/png']}
                onFileLoaded={(url) => setValue('profile_image', url, { shouldDirty: true })}
              />
              
              <FileUpload
                label="Upload College ID / Identification"
                maxSizeMB={5}
                allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                onFileLoaded={(url) => setValue('college_id_upload', url, { shouldDirty: true })}
              />

              {/* Terms checkbox */}
              <div className="flex items-start select-none pt-2">
                <input
                  id="terms"
                  type="checkbox"
                  disabled={loading}
                  {...register('terms')}
                  className="w-4.5 h-4.5 rounded border-[#334155] text-brand-primary focus:ring-blue-500/40 bg-slate-900/40 mt-0.5 cursor-pointer"
                />
                <label htmlFor="terms" className="ml-2.5 text-xs text-brand-secondary font-medium leading-tight cursor-pointer">
                  I agree to the <span className="text-brand-primary font-bold hover:underline">Terms & Conditions</span> and <span className="text-brand-primary font-bold hover:underline">Privacy Policy</span>.
                </label>
              </div>
            </motion.div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between items-center gap-4 pt-4 border-t border-[#334155]/20 select-none">
            {step > 1 ? (
              <Button variant="secondary" onClick={prevStep} disabled={loading} className="w-1/3">
                <ChevronLeft className="w-4 h-4 inline" /> Prev
              </Button>
            ) : (
              <div className="w-1/3" />
            )}
            
            {step < 3 ? (
              <Button variant="primary" onClick={nextStep} disabled={step === 1 ? !isStep1Valid : !isStep2Valid} className="w-2/3">
                Next <ChevronRight className="w-4 h-4 inline" />
              </Button>
            ) : (
              <Button type="submit" variant="primary" loading={loading} loadingText="Creating Account..." disabled={!isFinalStepValid || loading} className="w-2/3">
                Create Account
              </Button>
            )}
          </div>

          {/* Sign in footer */}
          <div className="text-center text-xs text-brand-secondary border-t border-[#334155]/20 pt-4 select-none">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-primary hover:underline">
              Sign In
            </Link>
          </div>

        </form>
      </Card>
    </motion.div>
  );
};

export default RegisterPage;
