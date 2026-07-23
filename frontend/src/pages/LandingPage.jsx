// frontend/src/pages/LandingPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowRight } from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    document.title = "SecureCampus AI | Entry Portal";

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 10; // Max 10px shift
      const y = (e.clientY / innerHeight - 0.5) * 10;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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

  return (
    <div className="w-full h-full flex flex-col justify-center items-center my-auto py-6">
      <motion.div 
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto px-4 select-none my-auto"
      >
        {/* 1. Parallax Floating Shield Logo & AI Orb */}
        <motion.div 
          variants={itemVariants} 
          animate={{ x: mousePos.x, y: mousePos.y }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
          className="mb-6 relative"
        >
          {/* Background Glowing AI Orb */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.55, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-4 rounded-full blur-2xl pointer-events-none"
            style={{ backgroundColor: 'var(--color-primary)', opacity: 0.35 }}
          />

          {/* Rotating Scanning Radar Ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-3 rounded-3xl border border-dashed pointer-events-none opacity-40"
            style={{ borderColor: 'var(--color-primary)' }}
          />

          {/* Interactive Shield Box */}
          <motion.div 
            whileHover={{ scale: 1.08, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center border shadow-2xl relative cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-surface-glass)',
              borderColor: 'var(--border-color)',
              boxShadow: 'var(--shadow-hover)'
            }}
          >
            <Shield className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: 'var(--color-primary)' }} />
            <span 
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white animate-pulse"
              style={{ backgroundColor: '#10b981' }}
            />
          </motion.div>
        </motion.div>

        {/* 2. Enterprise Security Badge */}
        <motion.div variants={itemVariants} className="mb-4">
          <div 
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border text-xs font-bold shadow-xs relative overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)'
            }}
          >
            <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: '#10b981' }} />
            <span className="w-2 h-2 rounded-full absolute left-4" style={{ backgroundColor: '#10b981' }} />
            <span className="pl-2.5">AI Powered • Enterprise Security • Zero Trust</span>
          </div>
        </motion.div>

        {/* 3. Hero Title */}
        <motion.h1 
          variants={itemVariants} 
          className="text-hero text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4"
          style={{ color: 'var(--text-main)' }}
        >
          SecureCampus <span style={{ color: 'var(--color-primary)' }}>AI</span>
        </motion.h1>

        {/* 4. Subtitle */}
        <motion.p 
          variants={itemVariants} 
          className="text-subheading text-lg sm:text-xl md:text-2xl font-semibold max-w-2xl mb-10 leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          AI-Powered Smart Campus Network Security & Access Management
        </motion.p>

        {/* 5. Single Primary Action Button: "Choose Your Portal" */}
        <motion.div variants={itemVariants} className="flex justify-center w-full">
          <motion.button
            onClick={() => navigate('/select-role')}
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="w-full sm:w-[260px] h-[54px] rounded-[14px] font-bold text-[17px] whitespace-nowrap flex items-center justify-center gap-[12px] cursor-pointer shadow-lg text-white transition-colors duration-150 group"
            style={{ backgroundColor: 'var(--color-primary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; }}
          >
            <span>Choose Your Portal</span>
            <ArrowRight className="w-5 h-5 text-white shrink-0 transition-transform group-hover:translate-x-2" />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
