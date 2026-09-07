import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'emerald' | 'amber' | 'blue' | 'gray' | 'purple' | 'red';
}

export function Badge({
  className,
  variant = 'emerald',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    amber: 'bg-amber-100 text-amber-800 border-amber-300',
    blue: 'bg-sky-100 text-sky-800 border-sky-300',
    gray: 'bg-gray-100 text-gray-700 border-gray-300',
    purple: 'bg-purple-100 text-purple-800 border-purple-300',
    red: 'bg-rose-100 text-rose-800 border-rose-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border tracking-wide uppercase',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
