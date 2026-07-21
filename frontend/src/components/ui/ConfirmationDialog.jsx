// frontend/src/components/ui/ConfirmationDialog.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  description = "Are you sure you want to perform this operation? This action might be irreversible.",
  confirmText = "Confirm",
  confirmVariant = "primary",
  loading = false,
  children
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm"
        />

        {/* Modal content box */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-md bg-slate-900 border border-[#334155] rounded-2xl p-6 shadow-2xl z-10 select-none overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${confirmVariant === 'danger' ? 'bg-red-500/10 text-brand-danger' : 'bg-blue-500/10 text-brand-primary'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-brand-text leading-tight">{title}</h3>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors focus:outline-none"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-xs text-brand-secondary leading-relaxed font-semibold">
              {description}
            </p>
            {children && <div className="mt-4">{children}</div>}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 border-t border-[#334155]/30 pt-4">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="h-10 text-xs px-4 w-auto"
            >
              Cancel
            </Button>
            <Button
              variant={confirmVariant}
              onClick={onConfirm}
              loading={loading}
              disabled={loading}
              className="h-10 text-xs px-4 w-auto font-bold"
            >
              {confirmText}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmationDialog;
