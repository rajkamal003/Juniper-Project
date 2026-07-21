// frontend/src/components/ui/DataTable.jsx
import React from 'react';
import { LoadingSkeleton } from './LoadingSkeleton';
import { EmptyState } from '../feedback/EmptyState';

export const DataTable = ({ 
  headers = [], 
  rows = [], 
  renderRow, 
  loading = false, 
  emptyState 
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-[#334155]/40 bg-slate-900/10 backdrop-blur-md">
      <table className="w-full border-collapse text-left text-xs font-sans">
        <thead>
          <tr className="border-b border-[#334155]/30 bg-slate-900/50 select-none">
            {headers.map((h, idx) => (
              <th 
                key={idx} 
                className="px-5 py-3.5 font-bold text-brand-secondary uppercase tracking-wider text-[10px]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr className="border-0">
              <td colSpan={headers.length} className="px-5 py-8">
                <LoadingSkeleton variant="table" count={4} />
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr className="border-0 animate-in fade-in duration-200">
              <td colSpan={headers.length} className="px-5 py-8">
                {emptyState || (
                  <EmptyState 
                    title="No logs available" 
                    description="This panel has no active registers matching the query filters." 
                  />
                )}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr 
                key={idx} 
                className="border-b border-[#334155]/15 hover:bg-[#334155]/10 last:border-b-0 transition-colors animate-in fade-in duration-150"
              >
                {renderRow(row, idx)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
