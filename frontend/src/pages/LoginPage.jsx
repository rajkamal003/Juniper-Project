// frontend/src/pages/LoginPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  captchaInput: z.string().min(1, 'Please enter the CAPTCHA.'),
  rememberMe: z.boolean().default(false)
});

// Reversible encryption helper (shifts characters by +3 and encodes to base64)
const encryptPassword = (text) => {
  if (!text) return '';
  const shifted = text.split('').map(c => String.fromCharCode(c.charCodeAt(0) + 3)).join('');
  return btoa(unescape(encodeURIComponent(shifted)));
};

const decryptPassword = (encrypted) => {
  if (!encrypted) return '';
  try {
    const decoded = decodeURIComponent(escape(atob(encrypted)));
    return decoded.split('').map(c => String.fromCharCode(c.charCodeAt(0) - 3)).join('');
  } catch (e) {
    console.error("Failed to decrypt password", e);
    return '';
  }
};

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // CAPTCHA State
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  // Multiple Remembered Accounts State
  const [rememberedAccounts, setRememberedAccounts] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const generateCaptcha = useCallback(() => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setCaptchaCode(newCode);
    setCaptchaError('');
  }, []);

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
  const watchRememberMe = watch('rememberMe');

  // Load remembered accounts and initial credentials on mount
  useEffect(() => {
    document.title = "SecureCampus AI | Sign In";
    generateCaptcha();

    let accounts = [];
    try {
      accounts = JSON.parse(localStorage.getItem('remembered_accounts')) || [];
    } catch {
      accounts = [];
    }
    setRememberedAccounts(accounts);

    // Initial check for legacy / single account prefill
    const savedRememberMe = localStorage.getItem('remember_me_enabled') === 'true';
    if (savedRememberMe) {
      const savedEmail = localStorage.getItem('remember_me_email') || '';
      const savedPassword = localStorage.getItem('remember_me_password') || '';
      let decrypted = savedPassword;
      if (savedPassword && !savedPassword.includes(' ') && savedPassword.length % 4 === 0) {
        decrypted = decryptPassword(savedPassword) || savedPassword;
      }
      setValue('email', savedEmail);
      setValue('password', decrypted);
      setValue('rememberMe', true);
    }
  }, [generateCaptcha, setValue]);

  // Click outside to close accounts dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Unchecking Remember Me clears stored credentials immediately for current email
  useEffect(() => {
    if (watchRememberMe === false) {
      localStorage.removeItem('remember_me_enabled');
      localStorage.removeItem('remember_me_email');
      localStorage.removeItem('remember_me_password');

      const currentEmail = watchEmail;
      if (currentEmail) {
        let accounts = [];
        try {
          accounts = JSON.parse(localStorage.getItem('remembered_accounts')) || [];
          const updated = accounts.filter(acc => acc.email !== currentEmail);
          localStorage.setItem('remembered_accounts', JSON.stringify(updated));
          setRememberedAccounts(updated);
        } catch {
          // ignore
        }
      }
    }
  }, [watchRememberMe, watchEmail]);

  const handleRefreshCaptcha = () => {
    generateCaptcha();
    setValue('captchaInput', '');
  };

  const handleSelectAccount = (acc) => {
    let decrypted = acc.password;
    try {
      decrypted = decryptPassword(acc.password) || acc.password;
    } catch {
      // fallback
    }
    setValue('email', acc.email);
    setValue('password', decrypted);
    setValue('rememberMe', true);
    setIsDropdownOpen(false);
  };

  const handleDeleteAccount = (e, email) => {
    e.stopPropagation();
    const updated = rememberedAccounts.filter(acc => acc.email !== email);
    setRememberedAccounts(updated);
    localStorage.setItem('remembered_accounts', JSON.stringify(updated));

    if (watchEmail === email) {
      setValue('email', '');
      setValue('password', '');
      setValue('rememberMe', false);
    }
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to clear all remembered accounts?")) {
      setRememberedAccounts([]);
      localStorage.removeItem('remembered_accounts');
      localStorage.removeItem('remember_me_enabled');
      localStorage.removeItem('remember_me_email');
      localStorage.removeItem('remember_me_password');
      setValue('email', '');
      setValue('password', '');
      setValue('rememberMe', false);
      setIsDropdownOpen(false);
    }
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
      const userData = await login(data.email, data.password, data.rememberMe);

      let accounts = [];
      try {
        accounts = JSON.parse(localStorage.getItem('remembered_accounts')) || [];
      } catch {
        accounts = [];
      }

      if (data.rememberMe) {
        const encryptedPassword = encryptPassword(data.password);
        const lastLogin = new Date().toISOString();

        // Avoid duplicates: remove existing match
        accounts = accounts.filter(acc => acc.email !== data.email);

        // Add to front of array
        accounts.unshift({
          email: data.email,
          password: encryptedPassword,
          displayName: userData.fullname || null,
          lastLogin
        });

        // Sort descending by lastLogin
        accounts.sort((a, b) => new Date(b.lastLogin) - new Date(a.lastLogin));

        // Limit to 20
        if (accounts.length > 20) {
          accounts = accounts.slice(0, 20);
        }

        localStorage.setItem('remembered_accounts', JSON.stringify(accounts));

        // Sync with legacy single-account variables
        localStorage.setItem('remember_me_enabled', 'true');
        localStorage.setItem('remember_me_email', data.email);
        localStorage.setItem('remember_me_password', encryptedPassword);
      } else {
        // If Remember Me is unchecked, clear this account's details
        accounts = accounts.filter(acc => acc.email !== data.email);
        localStorage.setItem('remembered_accounts', JSON.stringify(accounts));

        localStorage.removeItem('remember_me_enabled');
        localStorage.removeItem('remember_me_email');
        localStorage.removeItem('remember_me_password');
      }

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
        <div className="flex flex-col items-center gap-2 mb-8 text-center select-none">
          <h2 className="text-h2 font-extrabold tracking-tight" style={{ color: 'var(--text-main)' }}>Sign In</h2>
          <p className="text-body text-sm" style={{ color: 'var(--text-secondary)' }}>Sign in to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
          <div className="space-y-4">
            {/* Email Input */}
            <div className="relative" ref={dropdownRef}>
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
                {...register('email', {
                  onFocus: () => setIsDropdownOpen(true)
                })}
              />

              {/* Remembered Accounts Dropdown */}
              {isDropdownOpen && rememberedAccounts.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-56 overflow-y-auto bg-slate-900 border border-[#334155] rounded-xl shadow-2xl divide-y divide-[#334155]/40 select-none">
                  {rememberedAccounts.map((acc, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectAccount(acc)}
                      className="p-3 flex justify-between items-center cursor-pointer hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="min-w-0 text-left">
                        <p className="font-semibold text-xs text-brand-text truncate">
                          {acc.displayName ? `${acc.displayName} (${acc.email})` : acc.email}
                        </p>
                        <p className="text-[9px] text-brand-secondary mt-0.5 font-mono">
                          Last seen: {new Date(acc.lastLogin).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteAccount(e, acc.email)}
                        className="p-1 hover:bg-red-500/10 text-brand-secondary hover:text-red-400 rounded-lg transition-colors"
                        title="Delete saved account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <div className="p-2 bg-slate-950/20 text-center">
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-[10px] font-bold text-red-400 hover:text-red-300 hover:underline transition-colors uppercase tracking-wider"
                    >
                      Clear all saved accounts
                    </button>
                  </div>
                </div>
              )}
            </div>

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
