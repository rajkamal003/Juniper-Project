// frontend/src/pages/ForbiddenPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const ForbiddenPage = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = "SecureCampus AI | 403 Forbidden";
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc] flex flex-col items-center justify-center p-6 select-none font-sans">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Animated Icon Card */}
        <div className="inline-flex w-20 h-20 rounded-2xl bg-red-500/10 border-2 border-red-500/20 text-brand-danger items-center justify-center shadow-lg shadow-red-500/5 animate-bounce-slow">
          <ShieldAlert className="w-10 h-10" />
        </div>

        {/* Text Block */}
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-brand-danger">403</h1>
          <h2 className="text-xl font-bold tracking-tight text-brand-text">Access Denied</h2>
          <p className="text-xs text-brand-secondary leading-relaxed">
            You do not have permission to access this page. Your current session credentials do not possess the required security level clearances.
          </p>
        </div>

        {/* Actions Button */}
        <div className="pt-2">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="secondary"
            className="w-full sm:w-auto px-6 h-11 text-xs flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
