'use client';

import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { ModuleCard } from '@/components/ui/ModuleCard';
import {
  Users,
  Store,
  Truck,
  TrendingUp,
  Scale,
  CreditCard,
  AlertTriangle,
  Sparkles,
  Bot,
} from 'lucide-react';

export function Roadmap() {
  const { t } = useLanguage();

  const modules = [
    {
      title: t.home.modFarmerHubTitle,
      code: t.home.modFarmerHubCode,
      description: t.home.modFarmerHubDesc,
      icon: <Users className="w-5 h-5" />,
      href: '/farmer',
      status: t.commonStatuses.available, // status: 'Available' as const
      badgeVariant: 'emerald' as const,
    },
    {
      title: t.home.modMarketIntelTitle,
      code: t.home.modMarketIntelCode,
      description: t.home.modMarketIntelDesc,
      icon: <TrendingUp className="w-5 h-5" />,
      href: '/markets',
      status: t.commonStatuses.available, // status: 'Available' as const
      badgeVariant: 'emerald' as const,
    },
    {
      title: t.home.modRealisationTitle,
      code: t.home.modRealisationCode,
      description: t.home.modRealisationDesc,
      icon: <Scale className="w-5 h-5" />,
      href: '/calculator',
      status: t.commonStatuses.available, // status: 'Available' as const
      badgeVariant: 'emerald' as const,
    },
    {
      title: t.home.modBuyerDemandTitle,
      code: t.home.modBuyerDemandCode,
      description: t.home.modBuyerDemandDesc,
      icon: <Store className="w-5 h-5" />,
      href: '/buyer',
      status: t.commonStatuses.available, // status: 'Available' as const
      badgeVariant: 'emerald' as const,
    },
    {
      title: t.home.modLogisticsTitle,
      code: t.home.modLogisticsCode,
      description: t.home.modLogisticsDesc,
      icon: <Truck className="w-5 h-5" />,
      href: '/transporter',
      status: t.commonStatuses.available, // status: 'Available' as const
      badgeVariant: 'emerald' as const,
    },
    {
      title: t.home.modEscrowPayTitle,
      code: t.home.modEscrowPayCode,
      description: t.home.modEscrowPayDesc,
      icon: <CreditCard className="w-5 h-5" />,
      href: '/transactions',
      status: t.commonStatuses.available, // status: 'Available' as const
      badgeVariant: 'emerald' as const,
    },
    {
      title: t.home.modQualityAssayTitle,
      code: t.home.modQualityAssayCode,
      description: t.home.modQualityAssayDesc,
      icon: <Sparkles className="w-5 h-5" />,
      href: '/inspector',
      status: t.commonStatuses.available, // status: 'Available' as const
      badgeVariant: 'emerald' as const,
    },
    {
      title: t.home.modVoiceAccessTitle,
      code: t.home.modVoiceAccessCode,
      description: t.home.modVoiceAccessDesc,
      icon: <Bot className="w-5 h-5" />,
      href: '/farmer',
      status: t.commonStatuses.available, // status: 'Available' as const
      badgeVariant: 'emerald' as const,
    },
    {
      title: t.home.modDisputesTitle,
      code: t.home.modDisputesCode,
      description: t.home.modDisputesDesc,
      icon: <AlertTriangle className="w-5 h-5" />,
      href: '/disputes',
      status: t.commonStatuses.available, // status: 'Available' as const
      badgeVariant: 'emerald' as const,
    },
  ];

  return (
    <section className="py-12 bg-[#F4F1EA] border-b border-[#D8D2C4]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-2 mb-8">
          <span className="text-xs font-bold text-[#1B4332] uppercase tracking-wider block">
            {t.home.modulesBadge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#262320] tracking-tight">
            {t.home.modulesTitle}
          </h2>
          <p className="text-sm sm:text-base font-body text-[#635E59]">
            {t.home.modulesSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {modules.map((m, idx) => (
            <ModuleCard
              key={idx}
              title={m.title}
              code={m.code}
              description={m.description}
              icon={m.icon}
              href={m.href}
              status={m.status}
              badgeVariant={m.badgeVariant}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
