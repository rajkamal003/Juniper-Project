// frontend/src/pages/ComingSoonPage.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/feedback/EmptyState';

export const ComingSoonPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Resolve feature name from the active path
  const pathName = location.pathname.substring(1); // e.g. "devices", "network"
  const formattedName = pathName.charAt(0).toUpperCase() + pathName.slice(1);

  React.useEffect(() => {
    document.title = `SecureCampus AI | ${formattedName}`;
  }, [formattedName]);

  const getFeatureDetails = () => {
    switch (formattedName.toLowerCase()) {
      case 'devices':
        return {
          desc: 'The devices database matrix details network nodes, device configurations, status maps, and device telemetry.',
          stage: 'Stage 5 (Network Monitoring & Device Management)'
        };
      case 'network':
        return {
          desc: 'The network module manages subnets, access points, network topography, and performance logs.',
          stage: 'Stage 5 (Network Monitoring & Device Management)'
        };
      case 'firewall':
        return {
          desc: 'The firewall portal lets you review active rules, configure filters, block malicious traffic, and run packet audits.',
          stage: 'Stage 8 (Firewall Automation & Exam Mode)'
        };
      case 'reports':
        return {
          desc: 'The reports system compiles threat logs, attendance stats, and user action trails into downloadable tables and charts.',
          stage: 'Stage 9 (Reports & Analytics)'
        };
      case 'settings':
        return {
          desc: 'The settings console controls global platform configurations, security presets, and network access policies.',
          stage: 'Stage 10 (Deployment & Final Optimization)'
        };
      default:
        return {
          desc: 'This console module is currently disabled.',
          stage: 'a future development stage'
        };
    }
  };

  const details = getFeatureDetails();

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] text-center p-6 select-none font-sans">
      <div className="max-w-md w-full space-y-6">
        <EmptyState
          icon={Shield}
          title={`${formattedName} Panel`}
          description={`${details.desc} This module is scheduled for implementation in ${details.stage}.`}
        />

        <div className="pt-2">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="secondary"
            className="w-full sm:w-auto px-6 h-11 text-xs flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;
