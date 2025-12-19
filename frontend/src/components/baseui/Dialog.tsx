'use client';

import { useEffect, useRef } from 'react';
import * as BaseDialog from '@base-ui/react/dialog';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <BaseDialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop
          ref={backdropRef}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        />
        <BaseDialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg animate-slide-up">
          <div className="rounded-2xl backdrop-blur-xl bg-slate-900/90 border border-white/20 shadow-2xl p-6 space-y-4">
            {title && (
              <BaseDialog.Title className="text-2xl font-bold">
                {title}
              </BaseDialog.Title>
            )}
            <BaseDialog.Description asChild>
              <div>{children}</div>
            </BaseDialog.Description>
            <BaseDialog.Close
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              ✕
            </BaseDialog.Close>
          </div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
