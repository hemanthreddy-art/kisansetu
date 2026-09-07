'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, Store, Truck, ArrowRight, CheckCircle2 } from 'lucide-react';

export function Ecosystem() {
  const { t } = useLanguage();

  const participants = [
    {
      id: 'farmer',
      title: t.ecosystem.farmerTitle,
      role: 'PRODUCER & AGGREGATOR',
      description: t.ecosystem.farmerDesc,
      icon: <Users className="w-8 h-8 text-emerald-700" />,
      actionText: t.ecosystem.farmerAction,
      href: '/farmer',
      accentColor: 'emerald',
      features: [
        'List produce lots with digital photos',
        'AI visual screening + Physical inspection',
        'Multi-buyer competitive digital offers',
        'Net Realisation comparison across APMCs',
      ],
    },
    {
      id: 'buyer',
      title: t.ecosystem.buyerTitle,
      role: 'PROCUREMENT & COMMERCE',
      description: t.ecosystem.buyerDesc,
      icon: <Store className="w-8 h-8 text-amber-700" />,
      actionText: t.ecosystem.buyerAction,
      href: '/buyer',
      accentColor: 'amber',
      features: [
        'Direct procurement from verified farms & FPOs',
        'Transparent quality parameters & certificates',
        'Submit digital price offers with custom terms',
        'Protected milestone & escrow payment terms',
      ],
    },
    {
      id: 'transporter',
      title: t.ecosystem.transporterTitle,
      role: 'LOGISTICS & CARRIER',
      description: t.ecosystem.transporterDesc,
      icon: <Truck className="w-8 h-8 text-sky-700" />,
      actionText: t.ecosystem.transporterAction,
      href: '/transporter',
      accentColor: 'sky',
      features: [
        'Farm-to-market dispatch bookings',
        'Vehicle capacity matching (1T to 10T)',
        'Reduce empty return runs across districts',
        'Guaranteed freight payouts upon delivery',
      ],
    },
  ];

  return (
    <section className="py-16 bg-gray-50/70 border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            Ecosystem Integration
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {t.ecosystem.title}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            {t.ecosystem.subtitle}
          </p>
        </div>

        {/* End-to-End Trade Lifecycle Flowchart (Part 2 requirement) */}
        <div className="mb-14 p-6 sm:p-8 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
              {t.ecosystem.flowTitle}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-2xl mx-auto">
              {t.ecosystem.flowSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2">
            {[
              { step: '01', title: t.ecosystem.stepFarmer, href: '/farmer', bg: 'bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100' },
              { step: '02', title: t.ecosystem.stepMarket, href: '/markets', bg: 'bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100' },
              { step: '03', title: t.ecosystem.stepQuality, href: '/inspector', bg: 'bg-amber-50 text-amber-950 border-amber-200 hover:bg-amber-100' },
              { step: '04', title: t.ecosystem.stepMatching, href: '/buyer', bg: 'bg-amber-50 text-amber-950 border-amber-200 hover:bg-amber-100' },
              { step: '05', title: t.ecosystem.stepTransport, href: '/transporter', bg: 'bg-sky-50 text-sky-950 border-sky-200 hover:bg-sky-100' },
              { step: '06', title: t.ecosystem.stepNetRealisation, href: '/calculator', bg: 'bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100' },
              { step: '07', title: t.ecosystem.stepTransaction, href: '/transactions', bg: 'bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100' },
              { step: '08', title: t.ecosystem.stepTrust, href: '/disputes', bg: 'bg-rose-50 text-rose-950 border-rose-200 hover:bg-rose-100' },
            ].map((node, i) => (
              <Link
                key={i}
                href={node.href}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col justify-between group shadow-xs ${node.bg}`}
              >
                <span className="text-[10px] font-mono font-black text-gray-400 group-hover:text-gray-600 block">
                  STEP {node.step}
                </span>
                <span className="text-xs font-bold leading-tight block mt-1">
                  {node.title}
                </span>
                <span className="text-[10px] text-gray-400 font-semibold mt-2 block">
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {participants.map((item) => (
            <Card
              key={item.id}
              className="flex flex-col justify-between hover:shadow-lg transition-all duration-200 border-2 hover:border-emerald-400 bg-white"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-gray-100 rounded-2xl">{item.icon}</div>
                  <span className="text-[11px] font-mono font-bold tracking-wider text-gray-400 uppercase">
                    {item.role}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-2xl text-gray-900">{item.title}</CardTitle>
                  <CardDescription className="mt-2 text-sm text-gray-600 leading-relaxed">
                    {item.description}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-2.5 py-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Key Capabilities:
                </span>
                {item.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </CardContent>

              <CardFooter>
                <Link href={item.href} className="w-full">
                  <Button
                    size="md"
                    variant={item.id === 'farmer' ? 'primary' : 'outline'}
                    fullWidth
                    className="gap-2"
                  >
                    <span>{item.actionText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
