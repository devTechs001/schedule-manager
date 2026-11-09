import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-5xl',
  full: 'max-w-[95vw]',
};

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (event) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) onClose?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 bg-neutral-950/55 backdrop-blur-sm"
              onClick={handleOverlayClick}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 16 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              className={`relative w-full ${SIZES[size] || SIZES.md} overflow-hidden rounded-t-3xl border border-line bg-surface-raised shadow-lift sm:rounded-3xl`}
            >
              {(title || showCloseButton) && (
                <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
                  <div>
                    {title && <h3 className="text-lg font-semibold text-content">{title}</h3>}
                    {subtitle && <p className="mt-0.5 text-sm text-content-muted">{subtitle}</p>}
                  </div>
                  {showCloseButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close dialog"
                      className="rounded-lg p-1.5 text-content-subtle transition-colors hover:bg-gray-100 hover:text-content dark:hover:bg-white/5"
                    >
                      <FaTimes size={16} />
                    </button>
                  )}
                </div>
              )}

              <div className="max-h-[calc(100vh-13rem)] overflow-y-auto px-6 py-5">{children}</div>

              {footer && (
                <div className="flex items-center justify-end gap-2 border-t border-line bg-surface-sunken/70 px-6 py-3.5">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
