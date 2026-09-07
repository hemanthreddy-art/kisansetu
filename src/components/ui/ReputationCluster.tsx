import React from 'react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

export interface ReputationClusterProps extends React.HTMLAttributes<HTMLDivElement> {
  ratingScore: number;
  completedDealsCount?: number;
  onTimeDeliveryPercent?: number;
  size?: 'sm' | 'md';
}

/**
 * ReputationCluster — Visual language for commercial trade reputation.
 * Distinct from verification badges: displays score, transaction count, fulfillment rate.
 */
export function ReputationCluster({
  ratingScore,
  completedDealsCount,
  onTimeDeliveryPercent,
  size = 'md',
  className,
  ...props
}: ReputationClusterProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 font-medium text-[#262320]',
        size === 'sm' ? 'text-xs' : 'text-sm',
        className
      )}
      {...props}
    >
      <span className="inline-flex items-center gap-1 font-bold text-[#1B4332] bg-[#EAF2ED] px-1.5 py-0.5 rounded-[4px] border border-[#B7D5C4]">
        <Star className={cn('fill-[#B45309] text-[#B45309]', size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
        <span className="font-heading">{ratingScore.toFixed(1)}</span>
      </span>

      {completedDealsCount !== undefined && (
        <>
          <span className="text-[#D8D2C4]">·</span>
          <span className="text-[#5A554E]">
            <strong className="text-[#262320] font-heading">{completedDealsCount}</strong> deals
          </span>
        </>
      )}

      {onTimeDeliveryPercent !== undefined && (
        <>
          <span className="text-[#D8D2C4]">·</span>
          <span className="text-[#5A554E]">
            <strong className="text-[#262320] font-heading">{onTimeDeliveryPercent}%</strong> on-time
          </span>
        </>
      )}
    </div>
  );
}
