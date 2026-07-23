// frontend/src/pages/TermsOfServicePage.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Book, Globe, UserCheck, Calendar } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const TermsOfServicePage = () => {
  const { role } = useParams();
  const navigate = useNavigate();

  const normalizedRole = (role || 'student').toLowerCase();

  useEffect(() => {
    document.title = `SecureCampus AI | Terms of Service - ${normalizedRole.toUpperCase()}`;
  }, [normalizedRole]);

  const getTermsContent = () => {
    switch (normalizedRole) {
      case 'faculty':
        return {
          title: "Faculty Terms of Service",
          icon: UserCheck,
          description: "Terms governing academic research access and faculty network operations.",
          sections: [
            { title: "Research Access", desc: "Authorized access is provided exclusively for verified institutional research, academic tracking, and department management operations." },
            { title: "Internet Usage Guidelines", desc: "Unrestricted research internet access is subject to gateway logging. Commercial, unauthorized, or personal commercial operations are strictly forbidden." },
            { title: "MFA Policy", desc: "Multi-Factor Authentication (MFA) must remain enabled on all faculty devices. Loss of MFA credentials must be reported instantly to the NOC Administrator." },
            { title: "Security Policy Enforcement", desc: "All faculty accounts are subject to real-time intrusion monitoring. Any detected privilege anomalies will trigger automatic account lockouts." },
            { title: "Data Privacy", desc: "Faculty must maintain student privacy in accordance with institution guidelines. Exporting sensitive student tracking logs is prohibited." },
            { title: "Device Registration", desc: "Any device accessing the faculty network must be registered with its MAC address and run approved security software." },
            { title: "Acceptable Usage Agreement", desc: "By using the portal, you agree to comply with all ethical and security guidelines defined by the institution's IT Council." }
          ]
        };
      case 'parent':
      case 'parent visitor':
        return {
          title: "Parent Visitor Terms of Service",
          icon: Calendar,
          description: "Terms governing parental visitor access and student status telemetry tracking.",
          sections: [
            { title: "Internet Usage", desc: "Campus visitor WiFi access is provided for personal communication. Accessing non-academic database services via the student portal subnet is locked." },
            { title: "Privacy & Data Protection", desc: "We protect student and parent tracking logs. No visitor details are shared with external marketing or analytic agencies." },
            { title: "Student Information Access", desc: "Access to student status, subnets logs, and attendance telemetry is restricted to verified guardians. Sharing credentials with third parties violates campus policy." },
            { title: "Campus Network Rules", desc: "All parent devices connected to the campus guest WiFi must pass through the security gateway firewall logs." },
            { title: "Allowed Websites", desc: "Parents are granted access to official campus communication systems, academic results portals, fee gateways, and standard web browsing." },
            { title: "Blocked Websites", desc: "Access to file-sharing networks, streaming platforms, gambling, and darknets is completely prohibited." },
            { title: "Data Collection Consent", desc: "We record active session timings, connected Access Point locations, and device types to ensure campus safety." }
          ]
        };
      case 'guest':
        return {
          title: "Guest Terms of Service",
          icon: Globe,
          description: "Terms governing temporary campus visitor network access.",
          sections: [
            { title: "Temporary Access Limits", desc: "Guest credentials are valid for a limited period and will automatically expire at the end of the scheduled visit." },
            { title: "Usage Limits", desc: "Guest bandwidth is capped at 10 Mbps. Excessive download streams that disrupt academic subnet activities will be throttled." },
            { title: "Blocked Websites", desc: "The campus security firewall blocks guest access to streaming sites, gaming networks, P2P file sharing, and unauthorized VPN services." },
            { title: "Session Expiry Protocol", desc: "Your session will automatically terminate after the expiry time. All cached DHCP leases and network session tables will be cleared." },
            { title: "Privacy Policy", desc: "We collect basic identifying metadata (name, purpose of visit, phone, email) to authorize network credentials." },
            { title: "Security Policy Enforcement", desc: "Guest network traffic is scanned in real-time for malicious malware, bots, or unauthorized network probes." }
          ]
        };
      case 'student':
      default:
        return {
          title: "Student Terms of Service",
          icon: Book,
          description: "Terms governing student network operations, academic access, and exam restrictions.",
          sections: [
            { title: "Acceptable Internet Usage", desc: "WiFi and campus subnets must only be used for academic and authorized personal learning. Commercial use is strictly prohibited." },
            { title: "Website Monitoring", desc: "To maintain network hygiene, all web traffic is actively monitored. Accessing blacklisted websites or using bypass tunnels is blocked." },
            { title: "Exam Restrictions", desc: "During registered exams, the gateway enforces a complete lockdown of all student network nodes. Attempting to bypass lockdown triggers immediate alerts." },
            { title: "Privacy Policy", desc: "Student network telemetry and security profiles are securely cached. Logs are kept in accordance with campus safety compliance guidelines." },
            { title: "Network Rules", desc: "Students are assigned to specific subnets. MAC spoofing, packet sniffing, or attempting unauthorized router access results in suspension." },
            { title: "Security Policy Enforcement", desc: "Real-time threat detection logs flag suspicious activities, including brute-force login attempts and connection to malicious nodes." },
            { title: "AI Monitoring Compliance", desc: "Campus systems utilize automated AI logic to analyze anomalous network traffic and ensure network security integrity." },
            { title: "Disciplinary Actions", desc: "Violations of these terms are logged and sent to the Disciplinary Board, potentially leading to network privileges suspension." }
          ]
        };
    }
  };

  const terms = getTermsContent();
  const IconComponent = terms.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full sm:max-w-[640px] md:max-w-[720px] z-10 select-none my-6 mx-auto px-4"
    >
      <Card className="p-6 md:p-8 text-left">
        {/* Header navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                if (normalizedRole === 'faculty') navigate('/faculty/signin');
                else if (normalizedRole === 'student') navigate('/student/signin');
                else if (normalizedRole === 'parent') navigate('/parent/signin');
                else if (normalizedRole === 'guest') navigate('/guest/request');
                else navigate('/select-role');
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
          
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-secondary">
            <Shield className="w-4 h-4 text-brand-primary" />
            <span>SECURECAMPUS GATE</span>
          </div>
        </div>

        {/* Title Section */}
        <div className="flex items-start gap-4 pb-6 border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0">
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-brand-text">
              {terms.title}
            </h1>
            <p className="text-xs text-brand-secondary mt-1 max-w-md">
              {terms.description}
            </p>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="mt-6 space-y-6 max-h-[400px] overflow-y-auto pr-2">
          {terms.sections.map((sect, idx) => (
            <div key={idx} className="space-y-1.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-text flex items-center gap-1.5">
                <span className="w-1 h-3 bg-brand-primary rounded-full" />
                {idx + 1}. {sect.title}
              </h3>
              <p className="text-xs text-brand-secondary leading-relaxed pl-3">
                {sect.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Confirmation footer */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center text-[10px] text-brand-secondary">
          <span>Last Updated: July 2026</span>
          <span>Version 1.3 Security Council Compliance</span>
        </div>
      </Card>
    </motion.div>
  );
};

export default TermsOfServicePage;
