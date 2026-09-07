import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, helperText, id, disabled, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs sm:text-sm font-semibold text-[#262320]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full pl-3.5 pr-10 py-2.5 sm:py-3 text-sm sm:text-base text-[#262320] bg-white border rounded-[4px] min-h-[44px] sm:min-h-[48px] appearance-none transition-colors cursor-pointer',
              'border-[#D8D2C4] focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]',
              'disabled:bg-[#ECE7DE] disabled:text-[#7C766D] disabled:cursor-not-allowed',
              error && 'border-[#B91C1C] focus:border-[#B91C1C] focus:ring-[#B91C1C]',
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="w-4 h-4 text-[#5A554E] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        {error && (
          <p className="text-xs font-medium text-[#B91C1C]">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-[#5A554E]">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
