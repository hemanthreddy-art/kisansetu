'use client';

import React from 'react';
import { TrendingUp, Scale, ShieldCheck, Truck } from 'lucide-react';

export function ValueProps() {
  const pillars = [
    {
      icon: TrendingUp,
      title: '1. Market Prices',
      description: 'Compare modal rates and daily arrival volumes across nearby APMC mandis and regional trading hubs.',
    },
    {
      icon: Scale,
      title: '2. Net Realisation',
      description: 'Deduct road freight, warehouse rent, and mandi fees upfront to discover your true take-home earnings.',
    },
    {
      icon: ShieldCheck,
      title: '3. Verified Buyers',
      description: 'Connect directly with verified food processors and institutional buyers with independent trade ratings.',
    },
    {
      icon: Truck,
      title: '4. Transport & Storage',
      description: 'Include reliable corridor logistics and MSWC warehouse holding costs directly in your selling decision.',
    },
  ];

  return (
    <section className="py-12 bg-[#F4F1EA] border-b border-[#D8D2C4]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-2 mb-8">
          <span className="text-xs font-bold text-[#1B4332] uppercase tracking-wider block">
            Platform Pillars
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#262320] tracking-tight">
            Why KisanSetu
          </h2>
          <p className="text-sm sm:text-base font-body text-[#635E59]">
            Built specifically to solve post-harvest price uncertainty for Maharashtra and Andhra Pradesh producers.
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
