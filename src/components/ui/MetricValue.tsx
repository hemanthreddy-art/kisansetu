import React from 'react';
import { cn } from '@/lib/utils';

export interface MetricValueProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number | string;
  currencyPrefix?: boolean;
  unit?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'ochre' | 'muted';
}

export function MetricValue({
  value,
  currencyPrefix = false,
  unit,
  label,
  size = 'md',
  variant = 'primary',
  className,
  ...props
}: MetricValueProps) {
  const formattedValue = typeof value === 'number' ? value.toLocaleString('en-IN') : value;

  const sizeStyles = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
  };

  const variantStyles = {
    primary: 'text-[#1B4332]',
    ochre: 'text-[#B45309]',
    muted: 'text-[#262320]',
  };

  return (
    <div className={cn('flex flex-col', className)} {...props}>
      {label && (
        <span className="text-xs font-semibold text-[#5A554E] uppercase tracking-wider mb-0.5">
          {label}
        </span>
      )}
      <div className="inline-flex items-baseline gap-1">
        <span
          className={cn(
            'font-heading font-extrabold tracking-tight',
            sizeStyles[size],
            variantStyles[variant]
          )}
        >
          {currencyPrefix && <span className="font-normal mr-0.5">₹</span>}
          {formattedValue}
        </span>
        {unit && (
          <span className="text-xs sm:text-sm font-semibold text-[#5A554E]">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
