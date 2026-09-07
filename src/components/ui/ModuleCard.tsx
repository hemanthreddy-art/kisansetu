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
      <Card className="h-full hover:shadow-md hover:border-emerald-300 transition-all">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800 group-hover:bg-emerald-100 transition-colors">
              {icon}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-gray-400 font-medium">{code}</span>
              <Badge variant={badgeVariant}>{status}</Badge>
            </div>
          </div>
          <CardTitle className="mt-3 group-hover:text-emerald-800 transition-colors text-lg flex items-center justify-between">
            <span>{title}</span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-emerald-700" />
          </CardTitle>
          <CardDescription className="line-clamp-2 mt-1">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
