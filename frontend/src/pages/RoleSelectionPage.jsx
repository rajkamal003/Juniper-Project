// frontend/src/pages/RoleSelectionPage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, GraduationCap, User, Briefcase, ArrowLeft, ArrowRight, Shield } from 'lucide-react';

export const RoleSelectionPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "SecureCampus AI | Select Identity Role";
  }, []);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const roles = [
    {
      id: 'student',
      title: 'Student',
      badge: 'Academics & Services',
      description: 'Access academic services, campus resources, and your personal dashboard.',
      icon: GraduationCap,
      path: '/student/signin',
      color: 'var(--color-primary)'
    },
    {
      id: 'faculty',
      title: 'Faculty',
      badge: 'Enterprise & MFA',
      description: 'Manage classes, monitor campus operations, and securely access enterprise resources.',
      icon: Briefcase,
      path: '/faculty/signin',
      color: '#7c3aed' // Purple Accent
    },
    {
      id: 'parent',
      title: 'Parent',
      badge: 'Family & Visitor',
      description: 'Monitor student status and manage visitor requests.',
      icon: Users,
      path: '/parent/signin',
      color: '#ec4899' // Pink/Magenta Accent
    },
    {
      id: 'guest',
      title: 'Guest',
      badge: 'Visitor & Wi-Fi',
      description: 'Request visitor access and temporary campus Wi-Fi services.',
      icon: User,
      path: '/guest/request',
      color: '#10b981' // Green Accent
    }
  ];

  return (
    <div className="w-full h-full flex flex-col justify-center items-center my-auto py-6 select-none">
      <motion.div 
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto px-4 my-auto w-full"
      >
        {/* Back Bar */}
        <motion.div variants={itemVariants} className="w-full flex items-center justify-start mb-4">
          <motion.button
            whileHover={{ x: -3 }}
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl border shadow-xs cursor-pointer transition-colors"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)'
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal Home</span>
          </motion.button>
        </motion.div>

        {/* Page Title & Subtitle */}
        <motion.div variants={itemVariants} className="mb-8">
          <div 
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold mb-3 shadow-xs"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
              color: 'var(--color-primary)'
            }}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Step 2 • Multi-Role Enterprise Access</span>
          </div>
          <h1 className="text-hero text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--text-main)' }}>
            Choose Your Role
          </h1>
          <p className="text-subheading text-base sm:text-lg font-medium max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Select the portal that matches your identity to continue.
          </p>
        </motion.div>

        {/* 4 Interactive Role Cards (2 x 2 Grid) */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-4xl mb-4">
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <motion.div
                key={role.id}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(role.path)}
                className="glass-panel p-6 rounded-2xl border text-left flex flex-col justify-between cursor-pointer group transition-all duration-200 relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--bg-surface-glass)',
                  borderColor: 'var(--border-color)',
                  boxShadow: 'var(--shadow-card)'
                }}
              >
                {/* Glow Backdrop */}
                <div 
                  className="absolute top-0 right-0 w-28 h-28 rounded-full blur-2xl opacity-10 group-hover:opacity-25 transition-opacity pointer-events-none"
                  style={{ backgroundColor: role.color }}
                />

                <div>
                  {/* Card Icon & Title Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs transition-transform group-hover:scale-1.1"
                      style={{ 
                        backgroundColor: 'var(--bg-surface)', 
                        borderColor: 'var(--border-color)' 
                      }}
                    >
                      <IconComponent className="w-6 h-6" style={{ color: role.color }} />
                    </div>
                    <span 
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border"
                      style={{
                        backgroundColor: 'var(--bg-hover)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-muted)'
                      }}
                    >
                      {role.badge}
                    </span>
                  </div>

                  {/* Role Title */}
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>
                    {role.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                    {role.description}
                  </p>
                </div>

                {/* Card Action Link */}
                <div className="flex items-center justify-between pt-3.5 border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>
                    Enter Portal
                  </span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" style={{ color: 'var(--color-primary)' }} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RoleSelectionPage;
