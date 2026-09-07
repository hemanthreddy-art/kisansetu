'use client';

import React from 'react';
import { ModuleCard } from '@/components/ui/ModuleCard';
import {
  Users,
  Store,
  Truck,
  TrendingUp,
  PackageCheck,
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
      title: 'Quality Verification Desk',
      code: 'QUALITY DESK',
      description: 'Two-tier verification: AI visual screening separated from official physical inspection certificates.',
      icon: <PackageCheck className="w-5 h-5" />,
      href: '/inspector',
      status: 'Available' as const,
      badgeVariant: 'emerald' as const,
    },
    {
      title: 'Transactions & Escrow',
      code: 'ESCROW SETTLEMENT',
      description: 'Deal agreements, delivery tracking milestones, and secured escrow payout settlements.',
      icon: <CreditCard className="w-5 h-5" />,
      href: '/transactions',
      status: 'Available' as const,
      badgeVariant: 'emerald' as const,
    },
    {
      title: 'Evidence-Based Disputes',
      code: 'GRIEVANCE',
      description: 'Grievance resolution backed by agreed lot specs, weighing slips, and inspector certificates.',
      icon: <AlertTriangle className="w-5 h-5" />,
      href: '/disputes',
      status: 'Available' as const,
      badgeVariant: 'emerald' as const,
    },
    {
      title: 'State Governance Admin',
      code: 'GOVERNANCE',
      description: 'Maharashtra Agriculture & APMC oversight monitoring price stabilization and grievances.',
      icon: <Settings className="w-5 h-5" />,
      href: '/admin',
      status: 'Available' as const,
      badgeVariant: 'emerald' as const,
    },
    {
      title: 'Multilingual Voice UI',
      code: 'VOICE ASSISTANT',
      description: 'Voice-based Marathi, Telugu, and Hindi audio queries for rural farmers with limited literacy.',
      icon: <Bot className="w-5 h-5 text-purple-700" />,
      href: '/farmer',
      status: 'Available' as const,
      badgeVariant: 'emerald' as const,
    },
  ];

  return (
    <section className="py-16 bg-gray-50 border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Platform Capabilities</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Integrated Agricultural Ecosystem
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            End-to-end transparent market linkage connecting farmers, buyers, quality inspectors, and logistics providers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {modules.map((m) => (
            <ModuleCard key={m.code} {...m} />
          ))}
        </div>
      </div>
    </section>
  );
}
