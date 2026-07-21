// frontend/src/pages/ForgotPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Info } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { OTPInput } from '../components/forms/OTPInput';

const emailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [debugOtp, setDebugOtp] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    document.title = "SecureCampus AI | Forgot Password";
  }, []);

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' }
  });

  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' }
  });

  const watchEmail = emailForm.watch('email');
  const watchOtp = otpForm.watch('otp');

  const startCooldown = () => {
    setCooldown(60);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onEmailSubmit = async (data) => {
    setLoading(true);
    setDebugOtp(null);
    try {
      const response = await api.post('/api/auth/forgot-password', { email: data.email });
      setEmailInput(data.email);
      toast.success(response.data.message);
      
      if (response.data.debug_otp) {
        setDebugOtp(response.data.debug_otp);
      }
      
      setStep(2);
      startCooldown();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Request failed. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const onOtpSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/verify-otp', {
        email: emailInput,
        otp: data.otp
      });
      toast.success('Verification code checked successfully!');
      
      navigate('/reset-password', {
        state: {
          email: emailInput,
          resetToken: response.data.reset_token
        }
      });
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'OTP verification failed.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    setDebugOtp(null);
    try {
      const response = await api.post('/api/auth/forgot-password', { email: emailInput });
      toast.success('A new verification code has been generated.');
      if (response.data.debug_otp) {
        setDebugOtp(response.data.debug_otp);
      }
      startCooldown();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Resend failed.';
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
          <h2 className="text-xl font-bold tracking-tight text-brand-text">Recover Credentials</h2>
          <p className="text-xs text-brand-secondary font-medium">Generate security OTP recovery keys</p>
        </div>

        {/* Step 1: Request OTP */}
        {step === 1 && (
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
            <Input
              label="Registered Email Address"
              type="email"
              icon={Mail}
              placeholder="operator@securecampus.com"
              autoComplete="email"
              autoFocus={true}
              error={emailForm.formState.errors.email}
              isValid={watchEmail !== '' && !emailForm.formState.errors.email}
              disabled={loading}
              required
              {...emailForm.register('email')}
            />

            <Button type="submit" loading={loading} loadingText="Sending OTP..." disabled={loading}>
              Generate Verification Code
            </Button>
          </form>
        )}

        {/* Step 2: Input Verification Code */}
        {step === 2 && (
          <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
            
            {/* Debug OTP Banner */}
            {debugOtp && (
              <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs flex gap-2.5 text-cyan-400 animate-pulse-slow select-none">
                <Info className="w-5 h-5 shrink-0" />
                <div>
                  <span className="font-bold">System Recovery Debug Console:</span>
                  <p className="mt-1 leading-relaxed">
                    Verification code is: <span className="font-mono bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded font-bold tracking-widest text-sm text-[#f8fafc]">{debugOtp}</span>
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-brand-secondary uppercase tracking-wider text-center select-none">
                Enter 6-Digit Verification Code
              </label>
              
              <OTPInput
                length={6}
                value={watchOtp}
                onChange={(val) => {
                  otpForm.setValue('otp', val, { shouldValidate: true });
                }}
              />
              
              {otpForm.formState.errors.otp && (
                <p className="text-[12px] text-brand-danger font-medium text-center mt-1 animate-shake">
                  {otpForm.formState.errors.otp.message}
                </p>
              )}
            </div>

            <div className="flex justify-between items-center text-xs select-none">
              <span className="text-brand-secondary">Didn't receive code?</span>
              <button
                type="button"
                disabled={cooldown > 0 || loading}
                onClick={handleResend}
                className={`font-semibold ${
                  cooldown > 0 ? 'text-slate-600 cursor-not-allowed' : 'text-brand-primary hover:underline focus:outline-none'
                }`}
              >
                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend Code'}
              </button>
            </div>

            <Button type="submit" loading={loading} loadingText="Verifying OTP..." disabled={loading || watchOtp?.length !== 6}>
              Verify OTP Code
            </Button>
          </form>
        )}

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

export default ForgotPasswordPage;
