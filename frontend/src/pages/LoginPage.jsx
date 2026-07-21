// frontend/src/pages/LoginPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, RefreshCw, ShieldCheck } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  captchaInput: z.string().min(1, 'Please enter the CAPTCHA.'),
  rememberMe: z.boolean().default(false)
});

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // CAPTCHA State
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  const generateCaptcha = useCallback(() => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setCaptchaCode(newCode);
    setCaptchaError('');
  }, []);

  useEffect(() => {
    document.title = "SecureCampus AI | Sign In";
    generateCaptcha();
  }, [generateCaptcha]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      captchaInput: '',
      rememberMe: false
    }
  });

  const watchEmail = watch('email');
  const watchPassword = watch('password');
  const watchCaptcha = watch('captchaInput');

  const handleRefreshCaptcha = () => {
    generateCaptcha();
    setValue('captchaInput', '');
  };

  const onSubmit = async (data) => {
    // Validate CAPTCHA match
    if (!data.captchaInput) {
      setCaptchaError('Please enter the CAPTCHA.');
      generateCaptcha();
      setValue('captchaInput', '');
      return;
    }

    if (data.captchaInput.trim() !== captchaCode) {
      setCaptchaError('Invalid CAPTCHA.');
      generateCaptcha();
      setValue('captchaInput', '');
      return;
    }

    setLoading(true);
    try {
      await login(data.email, data.password, data.rememberMe);
      navigate('/dashboard');
    } catch {
      // Regenerate CAPTCHA after failed login attempt
      generateCaptcha();
      setValue('captchaInput', '');
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
          <h2 className="text-xl font-bold tracking-tight text-brand-text">Sign In</h2>
          <p className="text-xs text-brand-secondary">Sign in to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
          <div className="space-y-4">
            {/* Email Input */}
            <Input
              label="Security Email"
              type="email"
              icon={Mail}
              placeholder="operator@securecampus.com"
              autoComplete="email"
              autoFocus={true}
              error={errors.email}
              isValid={watchEmail !== '' && !errors.email}
              disabled={loading}
              required
              {...register('email')}
            />

            {/* Password Input */}
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="••••••••"
                autoComplete="current-password"
                error={errors.password}
                isValid={watchPassword !== '' && !errors.password}
                disabled={loading}
                required
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-[38px] text-[#94a3b8] hover:text-[#f8fafc] focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* CAPTCHA Section */}
            <div className="space-y-2 select-none">
              <label className="block text-[13px] font-medium text-brand-secondary uppercase tracking-wider">
                CAPTCHA <span className="text-brand-danger font-bold">*</span>
              </label>

              {/* CAPTCHA Box */}
              <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-[#334155]/60 rounded-xl">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-primary" />
                  <span className="font-mono text-lg font-extrabold tracking-[0.3em] text-brand-primary select-all">
                    {captchaCode || '••••••'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRefreshCaptcha}
                  disabled={loading}
                  aria-label="Generate New CAPTCHA"
                  title="Generate New CAPTCHA"
                  className="flex items-center gap-1 text-xs text-brand-secondary hover:text-brand-primary transition-colors focus:outline-none focus:ring-1 focus:ring-brand-primary rounded p-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline text-[11px] font-bold">Refresh</span>
                </button>
              </div>

              {/* CAPTCHA Input Field */}
              <Input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="Enter CAPTCHA"
                disabled={loading}
                required
                error={captchaError ? { message: captchaError } : errors.captchaInput}
                isValid={watchCaptcha !== '' && watchCaptcha === captchaCode && !captchaError}
                {...register('captchaInput', {
                  onChange: () => {
                    if (captchaError) setCaptchaError('');
                  }
                })}
              />
            </div>
          </div>

          {/* Remember & Forgot Row */}
          <div className="flex justify-between items-center text-xs select-none">
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                disabled={loading}
                {...register('rememberMe')}
                className="w-4 h-4 rounded border-[#334155] text-brand-primary focus:ring-blue-500/40 bg-slate-900/40 cursor-pointer"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 text-brand-secondary font-medium cursor-pointer"
              >
                Remember me
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="font-semibold text-brand-primary hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit */}
          <Button type="submit" loading={loading} loadingText="Signing In..." disabled={loading}>
            Sign In
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6 select-none">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#334155]"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#1e293b] px-3 text-[10px] font-bold tracking-widest text-[#94a3b8]">
              New Operator
            </span>
          </div>
        </div>

        {/* Register Link */}
        <Button variant="secondary" onClick={() => navigate('/register')} disabled={loading}>
          Create Account
        </Button>
      </Card>
    </motion.div>
  );
};

export default LoginPage;
