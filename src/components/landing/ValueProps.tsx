'use client';

import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { TrendingUp, Scale, ShieldCheck, Truck } from 'lucide-react';

export function ValueProps() {
  const { t } = useLanguage();

  const pillars = [
    {
      icon: TrendingUp,
      title: t.valueProps.p1Title,
      description: t.valueProps.p1Desc,
    },
    {
      icon: Scale,
      title: t.valueProps.p2Title,
      description: t.valueProps.p2Desc,
    },
    {
      icon: ShieldCheck,
      title: t.valueProps.p3Title,
      description: t.valueProps.p3Desc,
    },
    {
      icon: Truck,
      title: t.valueProps.p4Title,
      description: t.valueProps.p4Desc,
    },
  ];

  return (
    <section className="py-12 bg-[#F4F1EA] border-b border-[#D8D2C4]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-2 mb-8">
          <span className="text-xs font-bold text-[#1B4332] uppercase tracking-wider block">
            {t.valueProps.title}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#262320] tracking-tight">
            {t.usp.title}
          </h2>
          <p className="text-sm sm:text-base font-body text-[#635E59]">
            {t.valueProps.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-[#D8D2C4] rounded-[8px] p-5 space-y-3"
              >
                <div className="w-10 h-10 rounded-[4px] bg-[#EAF2ED] text-[#1B4332] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-base text-[#262320]">
                  {p.title}
                </h3>
                <p className="text-xs sm:text-sm font-body text-[#635E59] leading-relaxed">
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
