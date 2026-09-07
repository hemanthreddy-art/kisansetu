import React from 'react';

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: '5xl' | '6xl' | '7xl' | 'full';
}

export function PageContainer({
  children,
  className = '',
  maxWidth = '7xl',
}: PageContainerProps) {
  const maxClass =
    maxWidth === '5xl'
      ? 'max-w-5xl'
      : maxWidth === '6xl'
      ? 'max-w-6xl'
      : maxWidth === 'full'
      ? 'max-w-full'
      : 'max-w-7xl';

  return (
    <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${maxClass} ${className}`}>
      {children}
    </div>
  );
}
