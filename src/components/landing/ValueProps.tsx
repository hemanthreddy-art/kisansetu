'use client';

import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { TrendingUp, Scale, ShieldCheck, Truck } from 'lucide-react';

export function ValueProps() {
  const { t } = useLanguage();

  const props = [
    {
      title: t.valueProps.p1Title,
      description: t.valueProps.p1Desc,
      icon: <TrendingUp className="w-6 h-6 text-emerald-700" />,
      tag: 'PRICING & ARRIVALS',
    },
    {
      title: t.valueProps.p2Title,
      description: t.valueProps.p2Desc,
      icon: <Scale className="w-6 h-6 text-amber-700" />,
      tag: 'CORE USP ENGINE',
    },
    {
      title: t.valueProps.p3Title,
      description: t.valueProps.p3Desc,
      icon: <ShieldCheck className="w-6 h-6 text-emerald-800" />,
      tag: 'KYC & PHYSICAL CHECKS',
    },
    {
      title: t.valueProps.p4Title,
      description: t.valueProps.p4Desc,
      icon: <Truck className="w-6 h-6 text-sky-700" />,
      tag: 'DOORSTEP FLEET',
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            Core Value Proposition
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {t.valueProps.title}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            {t.valueProps.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {props.map((p, idx) => (
            <Card
              key={idx}
              className="hover:border-emerald-300 hover:shadow-md transition-all duration-200"
            >
              <CardHeader className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                  {p.icon}
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-gray-400 block mb-1">
                    {p.tag}
                  </span>
                  <CardTitle className="text-lg font-bold">{p.title}</CardTitle>
                </div>
                <CardDescription className="text-sm text-gray-600 leading-relaxed">
                  {p.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
