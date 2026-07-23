// frontend/src/pages/LoginPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, RefreshCw, ShieldCheck, Trash2, ArrowLeft } from 'lucide-react';
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

export const LoginPage = ({ roleContext }) => {
  const { login, verifyFacultyMFA } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // CAPTCHA State
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [loginErrorMessage, setLoginErrorMessage] = useState('');

  // Faculty TOTP MFA State
  const [mfaData, setMfaData] = useState(null);
  const [totpCode, setTotpCode] = useState('');
  const [totpLoading, setTotpLoading] = useState(false);

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
    setError,
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
    document.title = roleContext ? `SecureCampus AI | ${roleContext} Sign In` : "SecureCampus AI | Sign In";
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
        decrypted = decryptPassword(savedPassword);
      }
      if (savedEmail) setValue('email', savedEmail);
      if (decrypted) setValue('password', decrypted);
      setValue('rememberMe', true);
    }
  }, [generateCaptcha, setValue, roleContext]);

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
    setValue('email', acc.email);
    let decrypted = acc.password;
    if (acc.password && !acc.password.includes(' ') && acc.password.length % 4 === 0) {
      decrypted = decryptPassword(acc.password);
    }
    setValue('password', decrypted || '');
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
    // Role-specific Email Domain Check for Student & Faculty
    const normalizedEmail = (data.email || '').trim().toLowerCase();
    const isKLUEmail = normalizedEmail.endsWith('@kluniversity.in') || normalizedEmail.includes('.kluniversity.in');

    if (roleContext === 'Student' && !isKLUEmail) {
      setError('email', {
        type: 'manual',
        message: 'Students must sign in using their official KL University email (@kluniversity.in).'
      });
      return;
    }

    if (roleContext === 'Faculty' && !isKLUEmail) {
      setError('email', {
        type: 'manual',
        message: 'Faculty must sign in using their official KL University email (@kluniversity.in).'
      });
      return;
    }

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
      const res = await login(data.email, data.password, data.rememberMe, roleContext);

      if (res && res.mfa_required) {
        setMfaData(res);
        setLoading(false);
        return;
      }

      const userData = res;
      let accounts = [];
      try {
        accounts = JSON.parse(localStorage.getItem('remembered_accounts')) || [];
      } catch {
        accounts = [];
      }

      if (data.rememberMe) {
        const encryptedPassword = encryptPassword(data.password);
        const lastLogin = new Date().toISOString();

        accounts = accounts.filter(acc => acc.email !== data.email);
        accounts.unshift({
          email: data.email,
          password: encryptedPassword,
          displayName: userData?.fullname || null,
          lastLogin
        });

        accounts.sort((a, b) => new Date(b.lastLogin) - new Date(a.lastLogin));
        if (accounts.length > 20) accounts = accounts.slice(0, 20);

        localStorage.setItem('remembered_accounts', JSON.stringify(accounts));
        localStorage.setItem('remember_me_enabled', 'true');
        localStorage.setItem('remember_me_email', data.email);
        localStorage.setItem('remember_me_password', encryptedPassword);
      } else {
        accounts = accounts.filter(acc => acc.email !== data.email);
        localStorage.setItem('remembered_accounts', JSON.stringify(accounts));
        localStorage.removeItem('remember_me_enabled');
        localStorage.removeItem('remember_me_email');
        localStorage.removeItem('remember_me_password');
      }

      setLoginErrorMessage('');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid credentials';
      setLoginErrorMessage(msg);
      generateCaptcha();
      setValue('captchaInput', '');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMFA = async (e) => {
    e.preventDefault();
    if (!totpCode || totpCode.trim().length !== 6) {
      setLoginErrorMessage("Please enter a valid 6-digit Authenticator Code.");
      return;
    }
    setTotpLoading(true);
    try {
      await verifyFacultyMFA(mfaData.temp_token, totpCode.trim(), watchRememberMe);
      setMfaData(null);
      navigate('/dashboard');
    } catch (err) {
      setTotpCode('');
      setLoginErrorMessage(err.response?.data?.detail || "Invalid Authenticator Code.");
    } finally {
      setTotpLoading(false);
    }
  };

  const handleCreateAccount = () => {
    if (roleContext === 'Student') navigate('/student/register');
    else if (roleContext === 'Faculty') navigate('/faculty/register');
    else if (roleContext === 'Parent') navigate('/parent/register');
    else navigate('/select-role');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="w-full sm:w-auto z-10"
    >
      <Card>
        {/* Back Navigation */}
        <div className="flex justify-start mb-3 select-none">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/select-role');
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border shadow-xs cursor-pointer transition-colors"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)'
            }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Card Header */}
        <div className="flex flex-col items-center gap-2 mb-8 text-center select-none">
          {roleContext && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-1 border shadow-xs"
              style={{
                backgroundColor: roleContext === 'Admin' ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-primary-light)',
                borderColor: roleContext === 'Admin' ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-color)',
                color: roleContext === 'Admin' ? '#ef4444' : 'var(--color-primary)'
              }}
            >
              <span>{roleContext === 'Admin' ? '🛡️ Administrator Portal' : `${roleContext} Portal Sign In`}</span>
            </div>
          )}
          <h2 className="text-h2 font-extrabold tracking-tight" style={{ color: 'var(--text-main)' }}>
            {roleContext === 'Admin' ? 'Admin Portal Sign In' : (roleContext ? `${roleContext} Sign In` : 'Sign In')}
          </h2>
          <p className="text-body text-sm" style={{ color: 'var(--text-secondary)' }}>
            {roleContext === 'Admin'
              ? 'Restricted portal for SecureCampus AI administrators.'
              : (roleContext ? `Sign in to access your ${roleContext} portal` : 'Sign in to continue')}
          </p>
          
        </div>

        {/* Error Banner when Account Not Found or Credentials Failed */}
        {loginErrorMessage && (
          <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center justify-between gap-2 mb-4 select-none">
            <span>{loginErrorMessage}</span>
            {loginErrorMessage.includes("No account found") && (
              <button 
                type="button" 
                onClick={handleCreateAccount}
                className="px-3 py-1 rounded-lg bg-amber-500 text-white font-bold hover:bg-amber-600 cursor-pointer shrink-0 transition-colors shadow-xs"
              >
                Create Account
              </button>
            )}
          </div>
        )}

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
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl divide-y divide-slate-100 select-none">
                  {rememberedAccounts.map((acc, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectAccount(acc)}
                      className="p-3 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0 text-left">
                        <p className="font-semibold text-xs text-slate-800 truncate">
                          {acc.displayName ? `${acc.displayName} (${acc.email})` : acc.email}
                        </p>
                        <p className="text-[9px] text-slate-500 mt-0.5 font-mono">
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
                        className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                        title="Delete saved account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <div className="p-2 bg-slate-50 text-center">
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-[10px] font-bold text-red-500 hover:text-red-600 hover:underline transition-colors uppercase tracking-wider"
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
                className="absolute right-3.5 top-[40px] transition-colors focus:outline-none cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* CAPTCHA Section */}
            <div className="space-y-2 select-none">
              <label className="block text-label font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                CAPTCHA <span className="text-red-500 font-bold">*</span>
              </label>

              {/* CAPTCHA Box */}
              <div 
                className="flex items-center justify-between p-3.5 border rounded-xl shadow-xs transition-colors duration-200"
                style={{
                  backgroundColor: 'var(--color-primary-light)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                  <span className="font-mono text-lg font-bold tracking-[4px] select-all" style={{ color: 'var(--color-primary)' }}>
                    {captchaCode || '••••••'}
                  </span>
                </div>
                <motion.button
                  type="button"
                  onClick={handleRefreshCaptcha}
                  disabled={loading}
                  whileHover={{ rotate: 180, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  aria-label="Generate New CAPTCHA"
                  title="Generate New CAPTCHA"
                  className="flex items-center gap-1.5 text-xs font-semibold rounded-lg p-1.5 border shadow-xs cursor-pointer focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--color-primary)'
                  }}
                >
                  <RefreshCw className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline text-xs font-bold">Refresh</span>
                </motion.button>
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
          <div className="flex justify-between items-center text-sm select-none pt-1">
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                disabled={loading}
                {...register('rememberMe')}
                className="w-4 h-4 rounded cursor-pointer"
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <label
                htmlFor="rememberMe"
                className="ml-2.5 font-medium cursor-pointer"
                style={{ color: 'var(--text-secondary)' }}
              >
                Remember me
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="font-semibold hover:underline"
              style={{ color: 'var(--color-primary)' }}
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit */}
          <Button type="submit" loading={loading} loadingText="Signing In..." disabled={loading}>
            Sign In
          </Button>
        </form>

        {/* New Operator Divider (Hidden for Admin) */}
        {roleContext !== 'Admin' && (
          <>
            <div className="relative my-7 select-none">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: 'var(--border-color)' }}></div>
              </div>
              <div className="relative flex justify-center">
                <span 
                  className="px-3.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-white shadow-xs"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  NEW OPERATOR
                </span>
              </div>
            </div>

            {/* Create Account Button */}
            <motion.button
              type="button"
              onClick={handleCreateAccount}
              disabled={loading}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full h-12 rounded-xl font-semibold text-btn flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer shadow-xs border"
              style={{
                backgroundColor: 'var(--color-primary-light)',
                borderColor: 'var(--border-color)',
                color: 'var(--color-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
            >
              {roleContext ? `Create ${roleContext} Account` : 'Create Account'}
            </motion.button>
          </>
        )}
      </Card>

      {/* Faculty TOTP MFA Overlay Modal */}
      {mfaData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-5 text-center"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-500 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">Faculty Authenticator MFA</h3>
              <p className="text-xs text-muted-foreground" style={{ color: 'var(--text-secondary)' }}>
                {mfaData.is_mfa_setup ? "Enter 6-digit code from Google or Microsoft Authenticator" : "Scan QR Code with Google / Microsoft Authenticator app"}
              </p>
            </div>

            {!mfaData.is_mfa_setup && mfaData.qr_code_url && (
              <div className="p-4 rounded-xl border flex flex-col items-center gap-3 bg-white/5" style={{ borderColor: 'var(--border-color)' }}>
                <img src={mfaData.qr_code_url} alt="Authenticator QR Code" className="w-40 h-40 rounded-lg shadow-sm border bg-white p-2" />
                <div className="text-left w-full space-y-1">
                  <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Setup Key (Manual Entry)</p>
                  <p className="font-mono text-xs font-bold tracking-wider select-all break-all" style={{ color: 'var(--color-primary)' }}>
                    {mfaData.secret_key}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleVerifyMFA} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  6-Digit Authenticator Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full h-12 text-center text-xl font-mono tracking-widest rounded-xl border outline-none font-bold transition-all"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setMfaData(null)}
                  className="w-1/2"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  loading={totpLoading} 
                  loadingText="Verifying..." 
                  disabled={totpLoading || totpCode.length !== 6}
                  className="w-1/2"
                >
                  Verify Code
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default LoginPage;
