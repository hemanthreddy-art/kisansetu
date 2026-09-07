import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'emerald' | 'amber' | 'blue' | 'gray' | 'purple' | 'red';
  pill?: boolean;
}

export function Badge({
  className,
  variant = 'emerald',
  pill = false,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    emerald: 'bg-[#EAF2ED] text-[#1B4332] border-[#B7D5C4]',
    amber: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
    blue: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
    gray: 'bg-[#ECE7DE] text-[#262320] border-[#D8D2C4]',
    purple: 'bg-[#F3E8FF] text-[#6B21A8] border-[#D8B4FE]',
    red: 'bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-semibold border tracking-wider uppercase',
        pill ? 'rounded-full' : 'rounded-[4px]',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
