import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

export interface VerificationBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  type?: 'physical' | 'identity' | 'provisional';
  customLabel?: string;
}

/**
 * VerificationBadge — Visual language for verified status.
 * Strictly separate from reputation (e.g. star ratings or deal counts).
 */
export function VerificationBadge({
  className,
  type = 'identity',
  customLabel,
  ...props
}: VerificationBadgeProps) {
  if (type === 'provisional') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-xs font-semibold uppercase tracking-wider',
          'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]',
          className
        )}
        {...props}
      >
        <ShieldAlert className="w-3.5 h-3.5 text-[#92400E] shrink-0" />
        <span>{customLabel || 'AI Assessment — Not Verified'}</span>
      </span>
    );
  }

  const label =
    customLabel ||
    (type === 'physical' ? 'Physically Verified' : '✓ Verified');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-xs font-semibold uppercase tracking-wider',
        'bg-[#EAF2ED] text-[#1B4332] border border-[#B7D5C4]',
        className
      )}
      {...props}
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332] shrink-0" />
      <span>{label}</span>
    </span>
  );
}
