import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CrossIcon } from './Icons';

type ModalAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'danger' | 'neutral';
};

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  children?: React.ReactNode;
  onClose: () => void;
  primaryAction?: ModalAction;
  secondaryAction?: ModalAction;
}

const Modal: React.FC<ModalProps> = ({
  open,
  title,
  description,
  children,
  onClose,
  primaryAction,
  secondaryAction,
}) => {
  const getButtonClasses = (variant: ModalAction['variant']) => {
    if (variant === 'danger') {
      return 'bg-red-600 text-white hover:bg-red-700 shadow-red-200';
    }
    if (variant === 'neutral') {
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200 shadow-transparent';
    }
    return 'bg-pakGreen-600 text-white hover:bg-pakGreen-700 shadow-pakGreen-200';
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
            initial={{ y: 24, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 24, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            <div className="px-5 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/60 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug break-words">
                  {title}
                </h3>
                {description && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
                aria-label="Close modal"
              >
                <CrossIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 sm:px-6 py-4 max-h-[70vh] overflow-y-auto">
              {children}
            </div>

            {(primaryAction || secondaryAction) && (
              <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row gap-3 sm:justify-end">
                {secondaryAction && (
                  <button
                    onClick={secondaryAction.onClick}
                    disabled={secondaryAction.disabled}
                    className={`w-full sm:w-auto px-4 py-2.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.99] disabled:opacity-50 disabled:active:scale-100 ${getButtonClasses(
                      secondaryAction.variant ?? 'neutral'
                    )}`}
                  >
                    {secondaryAction.label}
                  </button>
                )}
                {primaryAction && (
                  <button
                    onClick={primaryAction.onClick}
                    disabled={primaryAction.disabled}
                    className={`w-full sm:w-auto px-4 py-2.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.99] shadow-md disabled:opacity-50 disabled:shadow-none disabled:active:scale-100 ${getButtonClasses(
                      primaryAction.variant ?? 'primary'
                    )}`}
                  >
                    {primaryAction.label}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;

