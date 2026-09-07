import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, label, helperText, id, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs sm:text-sm font-semibold text-[#262320]"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          ref={ref}
          disabled={disabled}
          className={cn(
            'w-full px-3.5 py-2.5 sm:py-3 text-sm sm:text-base text-[#262320] bg-white border rounded-[4px] min-h-[44px] sm:min-h-[48px] placeholder:text-[#7C766D] transition-colors',
            'border-[#D8D2C4] focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]',
            'disabled:bg-[#ECE7DE] disabled:text-[#7C766D] disabled:cursor-not-allowed',
            error && 'border-[#B91C1C] focus:border-[#B91C1C] focus:ring-[#B91C1C]',
            className
          )}
          {...props}
        />
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

Input.displayName = 'Input';
