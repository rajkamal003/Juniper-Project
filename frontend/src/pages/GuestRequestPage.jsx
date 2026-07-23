// frontend/src/pages/GuestRequestPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Building2, Phone, Mail, CheckCircle2, Copy, Download, ArrowLeft, Shield, Wifi } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';

export const GuestRequestPage = () => {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState('');
  const [purpose, setPurpose] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [approvedCredentials, setApprovedCredentials] = useState(null);

  useEffect(() => {
    document.title = "SecureCampus AI | Guest Access Request";
  }, []);

  const generateGuestCredentials = () => {
    // Generate Guest Username (GUEST-XXXXXX)
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const username = `GUEST-${randomCode}`;

    // Generate Secure Random Password (8-10 chars: Upper, Lower, Numbers)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    const length = 8 + Math.floor(Math.random() * 3);
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return {
      username,
      password,
      ssid: 'SecureCampus-Guest',
      validity: 'Until manually revoked',
      created_at: new Date().toLocaleString()
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullname.trim() || !purpose.trim()) {
      toast.error('Please fill in required fields (Full Name & Purpose).');
      return;
    }

    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();

    if (!cleanPhone) {
      toast.error('Phone Number is required.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      toast.error('Please enter a valid 10-digit phone number starting with 6-9.');
      return;
    }

    if (!cleanEmail) {
      toast.error('Email Address is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const creds = generateGuestCredentials();
      setApprovedCredentials(creds);
      setLoading(false);
      toast.success('Guest Access Approved Successfully!');
    }, 400);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const downloadCredentialsPDF = () => {
    if (!approvedCredentials) return;
    const content = `=========================================
SECURECAMPUS AI - GUEST ACCESS CREDENTIALS
=========================================
Guest Name : ${fullname}
Purpose    : ${purpose}
Username   : ${approvedCredentials.username}
Password   : ${approvedCredentials.password}
Wi-Fi SSID : ${approvedCredentials.ssid}
Validity   : ${approvedCredentials.validity}
Generated  : ${approvedCredentials.created_at}
=========================================
Please keep your temporary credentials secure.`;

    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${approvedCredentials.username}-Credentials.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Credentials file downloaded!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full sm:max-w-[480px] lg:max-w-[500px] z-10 select-none my-auto"
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

        {!approvedCredentials ? (
          /* Step 1: Guest Access Form */
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
                Request temporary visitor access & campus Wi-Fi services.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <Input
                label="Full Name"
                placeholder="John Doe"
                icon={User}
                required
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                disabled={loading}
              />

              <Input
                label="Purpose of Visit"
                placeholder="Research collaboration meeting"
                icon={Building2}
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                disabled={loading}
              />

              <Input
                label="Phone Number"
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

              <Input
                label="Email Address"
                type="email"
                placeholder="guest@example.com"
                icon={Mail}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />

              <div className="pt-2">
                <Button type="submit" loading={loading} loadingText="Generating Credentials..." disabled={loading}>
                  Request Access
                </Button>
              </div>
            </form>
          </>
        ) : (
          /* Step 2: Guest Access Approved Confirmation Card */
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
                🟢 Access Approved
              </span>
              <h2 className="text-xl font-bold tracking-tight mt-1" style={{ color: 'var(--text-main)' }}>
                Guest Credentials Generated
              </h2>
            </div>

            {/* Enterprise Credentials Card Box */}
            <div 
              className="w-full p-4.5 rounded-2xl border text-left space-y-3.5 shadow-sm"
              style={{
                backgroundColor: 'var(--bg-hover)',
                borderColor: 'var(--border-color)'
              }}
            >
              {/* Username Field */}
              <div className="flex justify-between items-center pb-2.5 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Guest Username</p>
                  <p className="font-mono text-base font-extrabold tracking-wider" style={{ color: 'var(--text-main)' }}>
                    {approvedCredentials.username}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(approvedCredentials.username, 'Username')}
                  className="px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer transition-transform hover:scale-105"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--color-primary)' }}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>

              {/* Password Field */}
              <div className="flex justify-between items-center pb-2.5 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Temporary Password</p>
                  <p className="font-mono text-base font-extrabold tracking-wider" style={{ color: 'var(--color-primary)' }}>
                    {approvedCredentials.password}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(approvedCredentials.password, 'Password')}
                  className="px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer transition-transform hover:scale-105"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--color-primary)' }}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>

              {/* Wi-Fi SSID & Validity */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Wi-Fi Network</p>
                  <p className="font-semibold flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-main)' }}>
                    <Wifi className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
                    <span>{approvedCredentials.ssid}</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Validity Period</p>
                  <p className="font-semibold mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {approvedCredentials.validity}
                  </p>
                </div>
              </div>
            </div>

            {/* Download & Finish Buttons */}
            <div className="flex flex-col gap-2.5 w-full pt-1">
              <Button onClick={downloadCredentialsPDF} variant="primary" className="w-full">
                <Download className="w-4 h-4 shrink-0" />
                <span>Download Credentials (.TXT)</span>
              </Button>

              <Button onClick={() => navigate('/select-role')} variant="secondary" className="w-full">
                <span>Done • Return to Role Portal</span>
              </Button>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default GuestRequestPage;
