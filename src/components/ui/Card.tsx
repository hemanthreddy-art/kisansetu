import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'muted' | 'accent' | 'highlight';
}

export function Card({
  className,
  variant = 'default',
  children,
  ...props
}: CardProps) {
  const variants = {
    default: 'bg-white border border-gray-200 shadow-sm text-gray-900',
    muted: 'bg-gray-50 border border-gray-200 text-gray-800',
    accent: 'bg-emerald-50/70 border border-emerald-200 text-emerald-950',
    highlight: 'bg-amber-50/70 border border-amber-200 text-amber-950',
  };

  return (
    <div
      className={cn('rounded-2xl p-6 transition-all duration-200', variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-xl font-bold tracking-tight text-gray-900', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-gray-600', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('pt-0', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center pt-4 border-t border-gray-100 mt-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}
