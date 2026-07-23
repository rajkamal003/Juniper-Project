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
          className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3 transition-all duration-300 hover:border-slate-300 hover:shadow-md cursor-default"
          style={{
            boxShadow: hoveredApp === app.name 
              ? `0 4px 20px -2px rgba(0,0,0,0.08), 0 0 10px ${app.color}18`
              : '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <div className="flex justify-between items-center select-none">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-xl flex items-center justify-center transition-all duration-300"
                style={{ 
                  backgroundColor: hoveredApp === app.name ? `${app.color}20` : `${app.color}12`, 
                  color: app.color,
                  boxShadow: hoveredApp === app.name ? `0 0 8px ${app.color}30` : 'none'
                }}
              >
                <app.icon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-extrabold text-[11px] text-slate-800 leading-tight">{app.name}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">{app.timeUsed} active</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-extrabold text-[11px] text-slate-800 leading-tight">{app.percentage}%</p>
              <p className="text-[9px] text-slate-400 mt-0.5">{app.dataUsed}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${app.percentage}%`,
                background: `linear-gradient(90deg, ${app.color}bb, ${app.color})`,
                boxShadow: hoveredApp === app.name 
                  ? `0 0 8px ${app.color}80` 
                  : `0 0 3px ${app.color}40`,
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
