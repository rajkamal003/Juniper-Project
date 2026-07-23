// frontend/src/components/ui/RefreshButton.jsx
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const RefreshButton = ({ 
  isRefreshing, 
  setIsRefreshing, 
  onRefresh, 
  pageName, 
  customSuccessMessage 
}) => {

  const handleClick = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    
    const startTime = Date.now();
    let success = true;
    
    try {
      await onRefresh();
    } catch (error) {
      console.error("Refresh failed: ", error);
      success = false;
    }
    
    // Ensure loading takes between 1.2 to 1.8 seconds for micro-animation satisfaction
    const elapsedTime = Date.now() - startTime;
    const minDelay = 1200; 
    if (elapsedTime < minDelay) {
      await new Promise(resolve => setTimeout(resolve, minDelay - elapsedTime));
    }
    
    setIsRefreshing(false);
    
    if (success) {
      toast.custom((t) => (
        <div className="max-w-md w-full bg-white shadow-xl rounded-xl border border-slate-100 pointer-events-auto flex border-l-4 border-l-blue-600 p-4 transition-all duration-300">
          <div className="flex items-start w-full">
            <div className="flex-shrink-0 pt-0.5">
              {/* Green Success Icon */}
              <div className="h-5 w-5 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="ml-3 flex-1 text-left">
              <p className="text-sm font-extrabold text-slate-900 leading-tight">
                Data Refreshed
              </p>
              <p className="mt-1 text-xs text-slate-500 font-medium font-sans">
                {customSuccessMessage || `${pageName} data updated successfully.`}
              </p>
            </div>
          </div>
        </div>
      ), {
        duration: 3000,
        position: 'top-right'
      });
    } else {
      toast.custom((t) => (
        <div className="max-w-md w-full bg-white shadow-xl rounded-xl border border-slate-100 pointer-events-auto flex border-l-4 border-l-red-600 p-4 transition-all duration-300">
          <div className="flex items-start w-full">
            <div className="flex-shrink-0 pt-0.5">
              {/* Red Error Icon */}
              <div className="h-5 w-5 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <div className="ml-3 flex-1 text-left">
              <p className="text-sm font-extrabold text-red-600 leading-tight">
                Refresh Failed
              </p>
              <p className="mt-1 text-xs text-slate-500 font-medium font-sans">
                Unable to load the latest data. Please try again.
              </p>
            </div>
          </div>
        </div>
      ), {
        duration: 3000,
        position: 'top-right'
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isRefreshing}
      type="button"
      className="h-10 px-4 rounded-xl border bg-white hover:bg-blue-50 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
      style={{
        borderColor: '#2563eb',
        color: '#2563eb',
        backgroundColor: '#ffffff'
      }}
    >
      <RefreshCw 
        className={`w-4 h-4 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} 
        style={{ color: '#2563eb', stroke: '#2563eb' }}
      />
      <span style={{ color: '#2563eb' }}>Refresh</span>
    </button>
  );
};

export default RefreshButton;
