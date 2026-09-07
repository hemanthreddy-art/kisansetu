'use client';

import React from 'react';
import { ModuleCard } from '@/components/ui/ModuleCard';
import {
  Users,
  Store,
  Truck,
  TrendingUp,
  Scale,
  CreditCard,
  AlertTriangle,
  Settings,
  Sparkles,
  Bot,
} from 'lucide-react';

export function Roadmap() {
  const modules = [
    {
      title: 'Farmer & FPO Hub',
      code: 'FARMER HUB',
      description: 'Produce lot registration, FPO member pooling, and competitive buyer offer management.',
      icon: <Users className="w-5 h-5" />,
      href: '/farmer',
      status: 'Available' as const,
      badgeVariant: 'emerald' as const,
    },
    {
      title: 'Mandi Intelligence',
      code: 'MARKET INTEL',
      description: 'Daily APMC market prices, modal rates, and commodity arrival volumes across Maharashtra.',
      icon: <TrendingUp className="w-5 h-5" />,
      href: '/markets',
      status: 'Available' as const,
      badgeVariant: 'emerald' as const,
    },
    {
      title: 'Net Realisation Engine',
      code: 'REALISATION',
      description: 'Core calculation deducting transport freight, warehouse rent, and mandi fees to find true net profit.',
      icon: <Scale className="w-5 h-5" />,
      href: '/calculator',
      status: 'Available' as const,
      badgeVariant: 'emerald' as const,
    },
    {
      title: 'Buyer Portal & Matching',
      code: 'BUYER DEMAND',
      description: 'Procurement demand posting, verified lot browsing, and digital counter-offers.',
      icon: <Store className="w-5 h-5" />,
      href: '/buyer',
      status: 'Available' as const,
      badgeVariant: 'emerald' as const,
    },
    {
      title: 'Transporter Network',
      code: 'LOGISTICS',
      description: 'Farm dispatch booking, vehicle capacity allocation, and transparent freight quotations.',
      icon: <Truck className="w-5 h-5" />,
      href: '/transporter',
      status: 'Available' as const,
      badgeVariant: 'emerald' as const,
    },
    {
      title: 'Commercial Transactions',
      code: 'ESCROW & PAY',
      description: 'Milestone escrow payments, delivery acknowledgments, and dispute mediation.',
      icon: <CreditCard className="w-5 h-5" />,
      href: '/transactions',
      status: 'Available' as const,
      badgeVariant: 'emerald' as const,
    },
    {
      title: 'Quality Verification Desk',
      code: 'QUALITY ASSAY',
      description: 'Tier 1 AI visual screening and Tier 2 assayer physical inspection workflows.',
      icon: <Sparkles className="w-5 h-5" />,
      href: '/inspector',
      status: 'Available' as const,
      badgeVariant: 'emerald' as const,
    },
    {
      title: 'Voice-First Assistant',
      code: 'VOICE ACCESS',
      description: 'Multilingual speech inquiry for farmers in Marathi, Hindi, Telugu, and English.',
      icon: <Bot className="w-5 h-5" />,
      href: '/farmer',
      status: 'Available' as const,
      badgeVariant: 'emerald' as const,
    },
    {
      title: 'Grievance Redressal',
      code: 'DISPUTES',
      description: 'Transparent APMC arbitrator notes, evidence uploads, and dispute resolution.',
      icon: <AlertTriangle className="w-5 h-5" />,
      href: '/disputes',
      status: 'Available' as const,
      badgeVariant: 'emerald' as const,
    },
    {
      title: 'State APMC Administration',
      code: 'ADMIN PORTAL',
      description: 'Statewide market linkages, price discovery analytics, and governance controls.',
      icon: <Settings className="w-5 h-5" />,
      href: '/admin',
      status: 'Available' as const,
      badgeVariant: 'emerald' as const,
    },
  ];

  return (
    <section className="py-12 bg-[#F4F1EA] border-b border-[#D8D2C4]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-2 mb-8">
          <span className="text-xs font-bold text-[#1B4332] uppercase tracking-wider block">
            Platform Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#262320] tracking-tight">
            System Modules & Transparency
          </h2>
          <p className="text-sm sm:text-base font-body text-[#635E59]">
            All core modules are functional in the prototype demonstration with transparent status indicators.
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
