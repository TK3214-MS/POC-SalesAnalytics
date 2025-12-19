'use client';

import * as BasePopover from '@base-ui/react/popover';

interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export function Popover({ trigger, children }: PopoverProps) {
  return (
    <BasePopover.Root>
      <BasePopover.Trigger asChild>{trigger}</BasePopover.Trigger>
      <BasePopover.Portal>
        <BasePopover.Popup className="z-50 rounded-xl backdrop-blur-xl bg-slate-900/90 border border-white/20 shadow-2xl p-4 animate-fade-in">
          {children}
          <BasePopover.Arrow className="fill-slate-900/90" />
        </BasePopover.Popup>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
