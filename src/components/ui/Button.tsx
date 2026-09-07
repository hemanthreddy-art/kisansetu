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
      'inline-flex items-center justify-center font-semibold rounded-[4px] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99]';

    const variants = {
      primary:
        'bg-[#1B4332] hover:bg-[#2D6A4F] text-white focus:ring-[#1B4332] border border-[#1B4332] shadow-none',
      secondary:
        'bg-[#B45309] hover:bg-[#92400E] text-white focus:ring-[#B45309] border border-[#B45309] shadow-none',
      outline:
        'border border-[#D8D2C4] text-[#262320] bg-white hover:bg-[#ECE7DE] hover:border-[#1B4332] focus:ring-[#1B4332] shadow-none',
      ghost:
        'text-[#262320] hover:bg-[#ECE7DE] focus:ring-[#D8D2C4] bg-transparent',
      danger:
        'bg-[#B91C1C] hover:bg-[#991B1B] text-white focus:ring-[#B91C1C] border border-[#991B1B] shadow-none',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs sm:text-sm min-h-[38px]',
      md: 'px-5 py-2.5 text-sm sm:text-base min-h-[48px]', // Minimum 48px touch target for mobile
      lg: 'px-7 py-3.5 text-base sm:text-lg min-h-[52px]', // Generous mobile tap target
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
