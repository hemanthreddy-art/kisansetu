'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  backUrl?: string;
  backLabel?: string;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  action,
  backUrl,
  backLabel,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`pb-6 mb-6 border-b border-[#D8D2C4] ${className}`}>
      {backUrl && (
        <div className="mb-3">
          <Link
            href={backUrl}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] hover:text-[#2D6A4F] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{backLabel || 'Back'}</span>
          </Link>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          {badge && (
            <div className="mb-1">
              {typeof badge === 'string' ? <Badge variant="emerald">{badge}</Badge> : badge}
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#262320] tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm sm:text-base font-body text-[#635E59] max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
      </div>
    </div>
  );
}
