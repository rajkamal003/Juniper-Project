// frontend/src/components/ui/ActionToolbar.jsx
import React from 'react';

export const ActionToolbar = ({ searchBar, filterButton, actions }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#334155]/15 pb-4 mb-4 select-none">
      <div className="flex items-center gap-3 w-full sm:max-w-md">
        {searchBar}
        {filterButton}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
          {actions}
        </div>
      )}
    </div>
  );
};

export default ActionToolbar;
