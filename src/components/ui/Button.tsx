import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm focus:ring-emerald-600 border border-emerald-800',
      secondary:
        'bg-amber-600 hover:bg-amber-700 text-white shadow-sm focus:ring-amber-500 border border-amber-700',
      outline:
        'border-2 border-emerald-700 text-emerald-800 hover:bg-emerald-50 focus:ring-emerald-600 bg-white',
      ghost:
        'text-gray-700 hover:bg-gray-100 focus:ring-gray-400 bg-transparent',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm min-h-[36px]',
      md: 'px-5 py-2.5 text-base min-h-[44px]',
      lg: 'px-7 py-3.5 text-lg min-h-[52px]', // Rural/mobile friendly large tap target
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
