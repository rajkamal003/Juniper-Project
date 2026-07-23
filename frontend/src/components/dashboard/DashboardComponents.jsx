// frontend/src/components/dashboard/DashboardComponents.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight } from 'lucide-react';

// 1. DashboardCard
export const DashboardCard = ({ 
  children, 
  title, 
  subtitle, 
  loading = false, 
  empty = false, 
  emptyTitle = 'No data available',
  emptyDescription = 'There is currently no information to display here.',
  className = '' 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.008 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`glass-panel rounded-2xl p-6 border transition-all duration-300 ${className}`}
      style={{
        backgroundColor: 'var(--bg-surface-glass)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-main)',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      {(title || subtitle) && (
        <div className="mb-4 pb-3 border-b border-gray-200/20 select-none">
          {title && (
            <h3 className="text-card-title font-bold tracking-tight text-main">{title}</h3>
          )}
          {subtitle && (
            <p className="text-subheading text-secondary text-sm mt-1">{subtitle}</p>
          )}
        </div>
      )}
      
      {loading ? (
        <div className="space-y-3 py-3 animate-pulse">
          <div className="h-5 rounded-lg w-2/3" style={{ backgroundColor: 'var(--bg-hover)' }} />
          <div className="h-4 rounded-lg w-full" style={{ backgroundColor: 'var(--bg-hover)' }} />
          <div className="h-4 rounded-lg w-5/6" style={{ backgroundColor: 'var(--bg-hover)' }} />
        </div>
      ) : empty ? (
        <div className="flex flex-col items-center justify-center text-center py-8 select-none">
          <div className="w-12 h-12 rounded-2xl border flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--bg-hover)', borderColor: 'var(--border-color)' }}>
            <Shield className="w-6 h-6 opacity-70" style={{ color: 'var(--color-primary)' }} />
          </div>
          <h4 className="text-subheading font-bold text-main mb-1">{emptyTitle}</h4>
          <p className="text-body text-secondary text-sm max-w-sm">{emptyDescription}</p>
        </div>
      ) : (
        children
      )}
    </motion.div>
  );
};

// 2. StatCard
export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendType = 'neutral', 
  loading = false,
  className = '' 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`glass-panel rounded-2xl p-6 border flex items-center justify-between gap-4 transition-all duration-300 ${className}`}
      style={{
        backgroundColor: 'var(--bg-surface-glass)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      {loading ? (
        <div className="flex-1 space-y-3 animate-pulse">
          <div className="h-4 rounded w-1/2" style={{ backgroundColor: 'var(--bg-hover)' }} />
          <div className="h-8 rounded w-3/4" style={{ backgroundColor: 'var(--bg-hover)' }} />
        </div>
      ) : (
        <div className="min-w-0 text-left">
          <p className="text-label uppercase tracking-wider select-none mb-1 text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>{title}</p>
          <h4 className="text-h2 font-extrabold leading-none mb-2" style={{ color: 'var(--text-main)' }}>{value}</h4>
          {trend && (
            <span className="inline-flex items-center text-xs font-bold border px-2 py-0.5 rounded-lg uppercase tracking-wider select-none" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--color-primary)', borderColor: 'var(--border-color)' }}>
              {trend}
            </span>
          )}
        </div>
      )}
      
      {!loading && Icon && (
        <motion.div 
          whileHover={{ rotate: 12, scale: 1.1 }}
          transition={{ duration: 0.2 }}
          className="w-13 h-13 rounded-2xl border flex items-center justify-center shrink-0 shadow-md"
          style={{ 
            backgroundColor: 'var(--bg-hover)', 
            borderColor: 'var(--border-color)',
            color: 'var(--color-primary)' 
          }}
        >
          <Icon className="w-6 h-6" />
        </motion.div>
      )}
    </motion.div>
  );
};

// 3. QuickActionCard
export const QuickActionCard = ({ 
  title, 
  description, 
  onClick, 
  disabled = false, 
  badge = '',
  className = '' 
}) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02, x: 4 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.2 }}
      className={`w-full group text-left border rounded-xl p-4.5 flex items-center justify-between gap-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-subheading font-bold transition-colors group-hover:text-primary" style={{ color: 'var(--text-main)' }}>{title}</h4>
          {badge && (
            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full font-mono uppercase tracking-wider" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-body text-sm mt-1 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>{description}</p>
      </div>
      <div className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-all select-none group-hover:bg-primary group-hover:text-white" style={{ backgroundColor: 'var(--bg-hover)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </div>
    </motion.button>
  );
};

// 4. RoleBadge
export const RoleBadge = ({ role }) => {
  return (
    <span 
      className="inline-flex items-center text-xs font-bold border px-2.5 py-1 rounded-lg uppercase tracking-wider select-none shadow-xs"
      style={{
        backgroundColor: 'var(--bg-hover)',
        color: 'var(--color-primary)',
        borderColor: 'var(--border-color)'
      }}
    >
      {role || 'Guest'}
    </span>
  );
};

// 5. EmptyWidget
export const EmptyWidget = ({ 
  title, 
  description = 'Available in Future Stage', 
  className = '' 
}) => {
  return (
    <div className={`border border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center select-none ${className}`} style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-hover)' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 opacity-80" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--color-primary)' }}>
        <Shield className="w-5 h-5" />
      </div>
      <h4 className="text-subheading font-semibold leading-tight" style={{ color: 'var(--text-main)' }}>{title}</h4>
      <p className="text-body text-xs font-bold uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>{description}</p>
    </div>
  );
};

export default DashboardCard;
