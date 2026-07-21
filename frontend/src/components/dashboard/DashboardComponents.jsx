// frontend/src/components/dashboard/DashboardComponents.jsx
import React from 'react';
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
    <div className={`bg-slate-900/40 border border-[#334155]/40 rounded-2xl p-5 backdrop-blur-md transition-all hover:border-[#334155]/80 hover:shadow-lg hover:shadow-slate-950/20 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4 border-b border-[#334155]/20 pb-3 select-none">
          {title && <h3 className="text-sm font-bold text-brand-text uppercase tracking-wider leading-none">{title}</h3>}
          {subtitle && <p className="text-[10px] text-brand-secondary mt-1">{subtitle}</p>}
        </div>
      )}
      
      {loading ? (
        <div className="space-y-3 py-2 animate-pulse">
          <div className="h-4 bg-slate-800 rounded w-2/3"></div>
          <div className="h-3 bg-slate-800 rounded w-full"></div>
          <div className="h-3 bg-slate-800 rounded w-5/6"></div>
        </div>
      ) : empty ? (
        <div className="flex flex-col items-center justify-center text-center py-6 select-none">
          <div className="w-10 h-10 rounded-xl bg-slate-850 border border-slate-800/80 text-brand-secondary flex items-center justify-center mb-3">
            <Shield className="w-4.5 h-4.5 opacity-60" />
          </div>
          <h4 className="text-xs font-semibold text-brand-text mb-1">{emptyTitle}</h4>
          <p className="text-[10px] text-brand-secondary max-w-xs">{emptyDescription}</p>
        </div>
      ) : (
        children
      )}
    </div>
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
  const getIconColor = () => {
    switch (trendType) {
      case 'success': return 'bg-emerald-500/10 text-brand-success border-emerald-500/20';
      case 'danger': return 'bg-red-500/10 text-brand-danger border-red-500/20';
      case 'warning': return 'bg-amber-500/10 text-brand-warning border-amber-500/20';
      default: return 'bg-blue-500/10 text-brand-primary border-blue-500/20';
    }
  };

  const getTrendColor = () => {
    switch (trendType) {
      case 'success': return 'text-brand-success bg-emerald-500/5 border-emerald-500/10';
      case 'danger': return 'text-brand-danger bg-red-500/5 border-red-500/10';
      case 'warning': return 'text-brand-warning bg-amber-500/5 border-amber-500/10';
      default: return 'text-brand-secondary bg-slate-800/5 border-slate-700/10';
    }
  };

  return (
    <div className={`bg-slate-900/40 border border-[#334155]/40 rounded-2xl p-5 backdrop-blur-md flex items-center justify-between gap-4 transition-all hover:border-[#334155]/80 hover:shadow-lg ${className}`}>
      {loading ? (
        <div className="flex-1 space-y-3 animate-pulse">
          <div className="h-3 bg-slate-800 rounded w-1/2"></div>
          <div className="h-6 bg-slate-800 rounded w-3/4"></div>
        </div>
      ) : (
        <div className="min-w-0 text-left">
          <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider select-none mb-1">{title}</p>
          <h4 className="text-xl font-bold text-brand-text leading-none mb-2">{value}</h4>
          {trend && (
            <span className={`inline-flex items-center text-[9px] font-bold border px-1.5 py-0.5 rounded uppercase tracking-wider select-none ${getTrendColor()}`}>
              {trend}
            </span>
          )}
        </div>
      )}
      
      {!loading && Icon && (
        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-inner ${getIconColor()}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
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
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full group text-left bg-slate-950/20 border border-[#334155]/30 rounded-xl p-4 flex items-center justify-between gap-4 transition-all hover:bg-brand-primary/5 hover:border-brand-primary/30 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:border-[#334155]/30 disabled:cursor-not-allowed ${className}`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-xs font-bold text-brand-text group-hover:text-brand-primary transition-colors">{title}</h4>
          {badge && (
            <span className="text-[8px] font-extrabold bg-[#334155]/40 text-[#94a3b8] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
              {badge}
            </span>
          )}
        </div>
        <p className="text-[10px] text-brand-secondary mt-1 line-clamp-1">{description}</p>
      </div>
      <div className="w-7 h-7 rounded-lg bg-[#334155]/20 text-[#94a3b8] group-hover:bg-brand-primary/10 group-hover:text-brand-primary flex items-center justify-center shrink-0 transition-all select-none">
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
};

// 4. RoleBadge
export const RoleBadge = ({ role }) => {
  const getBadgeStyle = () => {
    switch (role) {
      case 'Super Admin':
        return 'from-rose-500/20 to-amber-500/10 text-rose-400 border-rose-500/30';
      case 'Faculty':
        return 'from-blue-500/20 to-cyan-500/10 text-blue-400 border-blue-500/30';
      case 'Student':
        return 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30';
      case 'Parent Visitor':
        return 'from-purple-500/20 to-pink-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'from-slate-600/20 to-slate-700/10 text-slate-400 border-slate-600/30';
    }
  };

  return (
    <span className={`inline-flex items-center text-[9px] font-extrabold bg-gradient-to-r border px-2 py-0.5 rounded-md uppercase tracking-wider select-none ${getBadgeStyle()}`}>
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
    <div className={`border border-dashed border-[#334155]/40 rounded-xl p-5 flex flex-col items-center justify-center text-center select-none bg-slate-950/10 ${className}`}>
      <div className="w-8 h-8 rounded-lg bg-[#334155]/10 text-brand-secondary flex items-center justify-center mb-2.5 opacity-65">
        <Shield className="w-4 h-4" />
      </div>
      <h4 className="text-[11px] font-semibold text-brand-text leading-tight">{title}</h4>
      <p className="text-[9px] text-brand-secondary font-semibold uppercase tracking-wider mt-1">{description}</p>
    </div>
  );
};
