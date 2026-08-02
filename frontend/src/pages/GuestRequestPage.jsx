// frontend/src/pages/GuestRequestPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Building2, Phone, Mail, CheckCircle2, Copy, Download,
  ArrowLeft, Shield, Wifi, Lock, Calendar, Briefcase
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';
import api from '../services/api';

export const GuestRequestPage = () => {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState('');
  const [purpose, setPurpose] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [hostFaculty, setHostFaculty] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredGuest, setRegisteredGuest] = useState(null);

  // Access Duration states
  const [durationUnit, setDurationUnit] = useState('Hours');
  const [durationValue, setDurationValue] = useState('8');

  useEffect(() => {
    document.title = 'SecureCampus AI | Guest Access Request';
    // Pre-fill today's date
    setVisitDate(new Date().toISOString().split('T')[0]);
  }, []);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).catch(() => {});
    toast.success(`${label} copied to clipboard!`);
  };

  const downloadCredentialsTxt = () => {
    if (!registeredGuest) return;
    const content = `=========================================
SECURECAMPUS AI - GUEST ACCESS CREDENTIALS
=========================================
Guest Name    : ${registeredGuest.fullname}
Guest ID      : ${registeredGuest.roll_number || 'Assigned by Admin'}
Email         : ${registeredGuest.email}
Phone         : ${registeredGuest.phone}
Purpose       : ${registeredGuest.purpose}
Host Faculty  : ${registeredGuest.host_faculty || '—'}
Visit Date    : ${registeredGuest.visit_date || '—'}
Duration      : ${registeredGuest.duration}
Status        : ${registeredGuest.account_status}
Registered At : ${new Date(registeredGuest.created_at).toLocaleString()}
=========================================
Please keep your credentials secure.`;

    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${registeredGuest.roll_number || 'Guest'}-Registration.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Registration details downloaded!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullname.trim() || !purpose.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();

    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      toast.error('Please enter a valid 10-digit phone number starting with 6–9.');
      return;
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[@$!%*?&#]/.test(password)) {
      toast.error('Password must contain uppercase, lowercase, number, and special character (@$!%*?&#).');
      return;
    }

    const duration = `${durationValue} ${durationUnit}`;
    const validDurations = ['2 Hours', '4 Hours', '8 Hours', '1 Day'];
    // Build a normalized duration string to match backend validator
    let normalizedDuration = duration;
    if (!validDurations.includes(normalizedDuration)) {
      // Map to nearest valid
      if (durationUnit === 'Hours') {
        const hrs = parseInt(durationValue);
        if (hrs <= 2) normalizedDuration = '2 Hours';
        else if (hrs <= 4) normalizedDuration = '4 Hours';
        else normalizedDuration = '8 Hours';
      } else {
        normalizedDuration = '1 Day';
      }
    }

    setLoading(true);
    try {
      const payload = {
        fullname: fullname.trim(),
        email: cleanEmail.toLowerCase(),
        phone: cleanPhone,
        password,
        confirm_password: password,
        role_id: 5,
        purpose: purpose.trim(),
        duration: normalizedDuration,
        host_faculty: hostFaculty.trim() || null,
        visit_date: visitDate || null,
      };

      const response = await api.post('/api/auth/register', payload);
      setRegisteredGuest(response.data);
      toast.success('Guest registration successful! Your access request is under review.');
    } catch (error) {
      const detail = error.response?.data?.detail;
      if (typeof detail === 'string') {
        toast.error(detail);
      } else if (Array.isArray(detail)) {
        toast.error(detail[0]?.msg || 'Registration failed.');
      } else {
        toast.error('Guest registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full sm:max-w-[500px] lg:max-w-[520px] z-10 select-none my-auto"
    >
      <Card>
        {/* Back Navigation */}
        <div className="flex justify-start mb-4">
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

        {!registeredGuest ? (
          /* Registration Form */
          <>
            <div className="flex flex-col items-center gap-2 mb-6 text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs mb-1"
                style={{ backgroundColor: 'var(--color-primary-light)', borderColor: 'var(--border-color)' }}
              >
                <User className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
              </div>
              <h2 className="text-h2 font-extrabold tracking-tight" style={{ color: 'var(--text-main)' }}>
                Guest Access Request
              </h2>
              <p className="text-body text-xs max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                Register for temporary campus visitor access. Your request will appear in the admin portal for review.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <Input
                label="Full Name *"
                placeholder="John Doe"
                icon={User}
                required
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                disabled={loading}
              />

              <Input
                label="Purpose of Visit *"
                placeholder="Research collaboration / Conference / Meeting..."
                icon={Building2}
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                disabled={loading}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Phone Number *"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="9876543210"
                  icon={Phone}
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    Visit Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                    <input
                      type="date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="h-11 w-full pl-10 pr-3 border rounded-xl text-sm outline-none transition-all font-medium"
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-main)'
                      }}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <Input
                label="Email Address *"
                type="email"
                placeholder="guest@example.com"
                icon={Mail}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />

              <Input
                label="Host Faculty / Contact Person"
                placeholder="Dr. K. Prasad (optional)"
                icon={Briefcase}
                value={hostFaculty}
                onChange={(e) => setHostFaculty(e.target.value)}
                disabled={loading}
              />

              <Input
                label="Password *"
                type="password"
                placeholder="Min 8 chars, 1 upper, 1 number, 1 symbol"
                icon={Lock}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Must contain uppercase, lowercase, number, and one of: @$!%*?&#
              </p>

              {/* Access Duration */}
              <div className="space-y-3">
                <label className="block text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Access Duration
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '2 Hours', unit: 'Hours', val: '2' },
                    { label: '4 Hours', unit: 'Hours', val: '4' },
                    { label: '8 Hours', unit: 'Hours', val: '8' },
                    { label: '1 Day',   unit: 'Days',  val: '1' },
                  ].map((opt) => {
                    const active = durationUnit === opt.unit && durationValue === opt.val;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => { setDurationUnit(opt.unit); setDurationValue(opt.val); }}
                        className="h-10 rounded-xl border text-xs font-bold transition-all"
                        style={{
                          backgroundColor: active ? 'var(--color-primary)' : 'var(--bg-hover)',
                          borderColor: active ? 'var(--color-primary)' : 'var(--border-color)',
                          color: active ? '#fff' : 'var(--text-secondary)'
                        }}
                        disabled={loading}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" loading={loading} loadingText="Registering..." disabled={loading}>
                  Register & Request Access
                </Button>
              </div>

              <p className="text-[10px] text-center" style={{ color: 'var(--text-secondary)' }}>
                Already registered? <button type="button" onClick={() => navigate('/guest/signin')} className="font-bold underline">Sign In</button>
              </p>
            </form>
          </>
        ) : (
          /* Registration Success Card */
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center space-y-5"
          >
            {/* Status Header */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                🟢 Registration Successful
              </span>
              <h2 className="text-xl font-bold tracking-tight mt-1" style={{ color: 'var(--text-main)' }}>
                Guest Account Created
              </h2>
              <p className="text-xs max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                Your registration is saved. An administrator will review and approve your campus access.
              </p>
            </div>

            {/* Details Card */}
            <div
              className="w-full p-4 rounded-2xl border text-left space-y-3 shadow-sm"
              style={{ backgroundColor: 'var(--bg-hover)', borderColor: 'var(--border-color)' }}
            >
              {[
                { label: 'Guest ID', value: registeredGuest.roll_number || 'Pending Assignment', mono: true },
                { label: 'Name', value: registeredGuest.fullname },
                { label: 'Email', value: registeredGuest.email, mono: true },
                { label: 'Phone', value: registeredGuest.phone },
                { label: 'Purpose', value: registeredGuest.purpose },
                { label: 'Host Faculty', value: registeredGuest.host_faculty || '—' },
                { label: 'Visit Date', value: registeredGuest.visit_date || '—' },
                { label: 'Duration', value: registeredGuest.duration },
                { label: 'Account Status', value: registeredGuest.account_status },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex justify-between items-start pb-2.5 border-b last:border-0 last:pb-0" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</p>
                    <p
                      className={`font-semibold text-sm mt-0.5 ${mono ? 'font-mono tracking-wide' : ''}`}
                      style={{ color: 'var(--text-main)' }}
                    >
                      {value}
                    </p>
                  </div>
                  {mono && value && value !== '—' && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(value, label)}
                      className="px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 ml-2 shrink-0 cursor-pointer transition-transform hover:scale-105"
                      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--color-primary)' }}
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2.5 w-full pt-1">
              <Button onClick={downloadCredentialsTxt} variant="primary" className="w-full">
                <Download className="w-4 h-4 shrink-0" />
                <span>Download Registration Details</span>
              </Button>
              <Button onClick={() => navigate('/select-role')} variant="secondary" className="w-full">
                <span>Done • Return to Portal</span>
              </Button>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default GuestRequestPage;
