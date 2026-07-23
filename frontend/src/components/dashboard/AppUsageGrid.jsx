// frontend/src/components/dashboard/AppUsageGrid.jsx
import React, { useState } from 'react';

export const AppUsageGrid = ({ apps }) => {
  const [hoveredApp, setHoveredApp] = useState(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {apps.map((app) => (
        <div 
          key={app.name}
          onMouseEnter={() => setHoveredApp(app.name)}
          onMouseLeave={() => setHoveredApp(null)}
          className="p-3.5 rounded-xl border border-[#334155]/20 bg-slate-950/25 space-y-3 transition-all duration-300 hover:border-[#334155]/40 hover:bg-slate-900/30"
          style={{
            boxShadow: hoveredApp === app.name 
              ? `0 4px 20px -2px rgba(15, 23, 42, 0.5), 0 0 10px ${app.color}15`
              : 'none'
          }}
        >
          <div className="flex justify-between items-center select-none">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-xl flex items-center justify-center transition-all duration-300"
                style={{ 
                  backgroundColor: hoveredApp === app.name ? `${app.color}25` : `${app.color}12`, 
                  color: app.color,
                  boxShadow: hoveredApp === app.name ? `0 0 8px ${app.color}40` : 'none'
                }}
              >
                <app.icon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-extrabold text-[11px] text-brand-text leading-tight">{app.name}</p>
                <p className="text-[9px] text-brand-secondary mt-0.5">{app.timeUsed} active</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-extrabold text-[11px] text-brand-text leading-tight">{app.percentage}%</p>
              <p className="text-[9px] text-brand-secondary mt-0.5">{app.dataUsed}</p>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full h-2 bg-slate-800/60 rounded-full overflow-hidden relative">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out origin-left"
              style={{ 
                width: `${app.percentage}%`,
                background: `linear-gradient(90deg, ${app.color}cc, ${app.color})`,
                boxShadow: hoveredApp === app.name 
                  ? `0 0 12px ${app.color}, 0 0 16px ${app.color}80` 
                  : `0 0 4px ${app.color}60`,
                transform: hoveredApp === app.name ? 'scaleY(1.25)' : 'none',
                transformOrigin: 'left'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AppUsageGrid;
