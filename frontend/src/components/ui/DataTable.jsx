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
    <div 
      className="w-full overflow-x-auto rounded-2xl border backdrop-blur-md shadow-md"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-color)'
      }}
    >
      <table className="w-full border-collapse text-left font-sans">
        <thead>
          <tr 
            className="border-b select-none"
            style={{
              backgroundColor: 'var(--bg-hover)',
              borderColor: 'var(--border-color)'
            }}
          >
            {headers.map((h, idx) => (
              <th 
                key={idx} 
                className="px-6 py-4 text-th font-bold uppercase tracking-wider"
                style={{ color: 'var(--text-secondary)' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
          {loading ? (
            <tr className="border-0">
              <td colSpan={headers.length} className="px-6 py-8">
                <LoadingSkeleton variant="table" count={4} />
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr className="border-0 animate-in fade-in duration-200">
              <td colSpan={headers.length} className="px-6 py-8">
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
                className="border-b transition-colors hover:bg-black/5 dark:hover:bg-white/5 animate-in fade-in duration-150 text-td"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-main)'
                }}
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
