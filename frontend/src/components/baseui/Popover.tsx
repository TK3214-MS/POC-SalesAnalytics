'use client';

import { ReactNode } from 'react';

interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
}

// Simplified Popover without Base UI
export function Popover({ trigger, children }: PopoverProps) {
  return (
    <div className="relative group inline-block">
      {trigger}
      <div className="absolute z-50 hidden group-hover:block mt-2 rounded-xl backdrop-blur-xl bg-slate-900/90 border border-white/20 shadow-2xl p-4">
        {children}
      </div>
    </div>
  );
}
