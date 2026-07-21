// frontend/src/pages/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const resetSchema = z.object({
  new_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[@$!%*?&#]/, 'Password must contain at least one special character'),
  confirm_password: z.string(),
}).superRefine((data, ctx) => {
  if (data.new_password !== data.confirm_password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["confirm_password"]
    });
  }
});

export const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const email = location.state?.email || '';
  const resetToken = location.state?.resetToken || '';

  useEffect(() => {
    document.title = "SecureCampus AI | Reset Password";
    
    if (!resetToken || !email) {
      toast.error('Unauthorized access. Please generate an OTP code first.');
      navigate('/forgot-password', { replace: true });
    }
  }, [email, resetToken, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      new_password: '',
      confirm_password: ''
    }
  });

  const password = watch('new_password');
  const confirmPassword = watch('confirm_password');

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
  const isPasswordsMatching = password === confirmPassword;

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/reset-password', {
        email,
        reset_token: resetToken,
        new_password: data.new_password,
        confirm_password: data.confirm_password
      });
      toast.success(response.data.message);
      navigate('/login', { replace: true });
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Credentials reset failed.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="w-full sm:w-auto z-10"
    >
      <Card>
        {/* Card Header */}
        <div className="flex flex-col items-center gap-1.5 mb-8 text-center select-none">
          <h2 className="text-xl font-bold tracking-tight text-brand-text">Reset Password</h2>
          <p className="text-xs text-brand-secondary">Configure new access password</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            
            {/* New Password Input */}
            <div className="relative">
              <Input
                label="New Access Password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="••••••••"
                autoComplete="new-password"
                autoFocus={true}
                error={errors.new_password}
                isValid={password !== '' && !errors.new_password}
                disabled={loading}
                required
                {...register('new_password')}
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
                label="Confirm Access Password"
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

            {/* Strength Meter & Checklist */}
            <div className="p-4 rounded-xl border border-[#334155]/60 bg-slate-900/20 space-y-3 select-none">
              <div className="flex justify-between items-center text-[11px] font-semibold tracking-wider">
                <span className="text-brand-secondary">STRENGTH METER:</span>
                <span className={`${textClass} font-bold uppercase`}>{label}</span>
              </div>
              
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((levelIdx) => (
                  <div key={levelIdx} className={`h-1.5 rounded-full transition-all duration-300 ${score >= levelIdx ? color : 'bg-[#334155]'}`} />
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

          </div>

          <Button type="submit" loading={loading} loadingText="Resetting Password..." disabled={loading || !isPasswordsMatching || score < 4}>
            Commit Password Reset
          </Button>
        </form>

        {/* Return Links */}
        <div className="mt-6 flex justify-center border-t border-[#334155]/20 pt-4 select-none">
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-xs text-brand-secondary hover:text-brand-text font-semibold transition-colors duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>

      </Card>
    </motion.div>
  );
};

export default ResetPasswordPage;
