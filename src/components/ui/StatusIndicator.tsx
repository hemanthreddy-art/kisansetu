import React from 'react';
import { cn } from '@/lib/utils';

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: 'available' | 'reserved' | 'completed' | 'pending' | 'cancelled' | string;
  label?: string;
  pulse?: boolean;
}

export function StatusIndicator({
  status,
  label,
  pulse = false,
  className,
  ...props
}: StatusIndicatorProps) {
  const normalized = status.toLowerCase();

  const configs: Record<string, { dot: string; text: string }> = {
    available: { dot: 'bg-[#1B4332]', text: 'text-[#1B4332]' },
    live: { dot: 'bg-[#1B4332]', text: 'text-[#1B4332]' },
    active: { dot: 'bg-[#1B4332]', text: 'text-[#1B4332]' },
    completed: { dot: 'bg-[#1B4332]', text: 'text-[#1B4332]' },
    verified: { dot: 'bg-[#1B4332]', text: 'text-[#1B4332]' },
    reserved: { dot: 'bg-[#0369A1]', text: 'text-[#0369A1]' },
    pending: { dot: 'bg-[#B45309]', text: 'text-[#B45309]' },
    draft: { dot: 'bg-[#5A554E]', text: 'text-[#5A554E]' },
    cancelled: { dot: 'bg-[#991B1B]', text: 'text-[#991B1B]' },
    rejected: { dot: 'bg-[#991B1B]', text: 'text-[#991B1B]' },
  };

  const config = configs[normalized] || { dot: 'bg-[#5A554E]', text: 'text-[#5A554E]' };
  const displayLabel = label || status;

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-xs font-semibold', config.text, className)}
      {...props}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', config.dot)} />
        )}
        <span className={cn('relative inline-flex rounded-full h-2 w-2', config.dot)} />
      </span>
      <span>{displayLabel}</span>
    </span>
  );
}
