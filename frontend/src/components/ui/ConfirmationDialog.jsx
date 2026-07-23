// frontend/src/components/ui/ConfirmationDialog.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';
import { modalVariants, modalBackdropVariants } from '../../constants/motionVariants';

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        {/* Backdrop overlay */}
        <motion.div
          variants={modalBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-xs"
        />

        {/* Modal content box */}
        <motion.div
          variants={modalVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl z-10 overflow-hidden border"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-main)',
            boxShadow: 'var(--shadow-hover)'
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="p-2.5 rounded-xl border flex items-center justify-center"
                style={{ 
                  backgroundColor: confirmVariant === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-hover)', 
                  borderColor: 'var(--border-color)',
                  color: confirmVariant === 'danger' ? '#ef4444' : 'var(--color-primary)' 
                }}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-card-title text-lg font-bold leading-tight" style={{ color: 'var(--text-main)' }}>{title}</h3>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-1 rounded-lg border transition-colors hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none cursor-pointer"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-body text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {description}
            </p>
            {children && <div className="mt-4">{children}</div>}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="h-10 text-sm px-4 w-auto"
            >
              Cancel
            </Button>
            <Button
              variant={confirmVariant}
              onClick={onConfirm}
              loading={loading}
              disabled={loading}
              className="h-10 text-sm px-4 w-auto font-bold"
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
