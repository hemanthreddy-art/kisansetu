import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from './Card';
import { Badge } from './Badge';
import { ArrowRight } from 'lucide-react';

export interface ModuleCardProps {
  title: string;
  code: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  status: 'Active' | 'Live' | 'Available' | 'Ready' | string;
  badgeVariant?: 'emerald' | 'amber' | 'blue';
}

export function ModuleCard({
  title,
  code,
  description,
  icon,
  href,
  status,
  badgeVariant = 'emerald',
}: ModuleCardProps) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full hover:border-[#1B4332] transition-colors">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="p-2.5 bg-[#EAF2ED] rounded-[4px] text-[#1B4332] group-hover:bg-[#1B4332] group-hover:text-white transition-colors">
              {icon}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-[#7C766D] font-medium">{code}</span>
              <Badge variant={badgeVariant}>{status}</Badge>
            </div>
          </div>
          <CardTitle className="mt-3 group-hover:text-[#1B4332] transition-colors text-base sm:text-lg flex items-center justify-between">
            <span>{title}</span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#1B4332]" />
          </CardTitle>
          <CardDescription className="line-clamp-2 mt-1.5 text-xs sm:text-sm">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
