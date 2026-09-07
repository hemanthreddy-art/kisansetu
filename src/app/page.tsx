'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { Hero } from '@/components/landing/Hero';
import { RealisationPreview } from '@/components/landing/RealisationPreview';
import { ValueProps } from '@/components/landing/ValueProps';
import { Ecosystem } from '@/components/landing/Ecosystem';
import { Roadmap } from '@/components/landing/Roadmap';
import { Button } from '@/components/ui/Button';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { ReputationCluster } from '@/components/ui/ReputationCluster';
import {
  PackagePlus,
  TrendingUp,
  Scale,
  Users,
  Truck,
  CreditCard,
  Mic,
  ShieldCheck,
  Star,
  ArrowRight,
} from 'lucide-react';

export default function HomePage() {
  const { t } = useLanguage();

  const steps = [
    { num: '1', title: t.home.step1Title, desc: t.home.step1Desc },
    { num: '2', title: t.home.step2Title, desc: t.home.step2Desc },
    { num: '3', title: t.home.step3Title, desc: t.home.step3Desc },
    { num: '4', title: t.home.step4Title, desc: t.home.step4Desc },
    { num: '5', title: t.home.step5Title, desc: t.home.step5Desc },
    { num: '6', title: t.home.step6Title, desc: t.home.step6Desc },
  ];

  const quickActions = [
    { label: t.home.quickMandiPrices, href: '/markets', icon: TrendingUp, desc: t.home.quickMandiPricesDesc },
    { label: t.home.quickCreateLot, href: '/lots?action=create', icon: PackagePlus, desc: t.home.quickCreateLotDesc },
    { label: t.home.quickNetRealisation, href: '/calculator', icon: Scale, desc: t.home.quickNetRealisationDesc },
    { label: t.home.quickFindBuyers, href: '/buyer', icon: Users, desc: t.home.quickFindBuyersDesc },
    { label: t.home.quickLogistics, href: '/transporter', icon: Truck, desc: t.home.quickLogisticsDesc },
    { label: t.home.quickTransactions, href: '/transactions', icon: CreditCard, desc: t.home.quickTransactionsDesc },
  ];

  return (
    <div className="flex flex-col">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Real Market Decision (Core USP Demonstration) */}
      <RealisationPreview />

      {/* 3. Why KisanSetu (4 Practical Pillars) */}
      <ValueProps />

      {/* 4. How It Works (6-Step Stepper) */}
      <section className="py-12 bg-white border-b border-[#D8D2C4]">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-2 mb-8">
            <span className="text-xs font-bold text-[#1B4332] uppercase tracking-wider block">
              {t.home.transparentProcess}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#262320] tracking-tight">
              {t.home.howItWorksTitle}
            </h2>
            <p className="text-sm sm:text-base font-body text-[#635E59]">
              {t.home.howItWorksSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 max-w-6xl mx-auto">
            {steps.map((s) => (
              <div
                key={s.num}
                className="bg-[#F4F1EA] border border-[#D8D2C4] rounded-[8px] p-4 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="w-7 h-7 rounded-[4px] bg-[#1B4332] text-white font-bold text-xs flex items-center justify-center font-heading">
                    {s.num}
                  </div>
                  <h3 className="font-heading font-bold text-sm text-[#262320] mt-2">
                    {s.title}
                  </h3>
                  <p className="text-xs font-body text-[#635E59] mt-1 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Farmer-First Quick Actions */}
      <section className="py-12 bg-[#F4F1EA] border-b border-[#D8D2C4]">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-2 mb-8">
            <span className="text-xs font-bold text-[#1B4332] uppercase tracking-wider block">
              {t.home.farmerToolsTitle}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#262320] tracking-tight">
              {t.home.farmerToolsTitle}
            </h2>
            <p className="text-sm sm:text-base font-body text-[#635E59]">
              {t.home.howItWorksSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link
                  key={idx}
                  href={action.href}
                  className="bg-white border border-[#D8D2C4] rounded-[8px] p-4 hover:border-[#1B4332] transition-colors flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-[4px] bg-[#EAF2ED] text-[#1B4332] flex items-center justify-center shrink-0 group-hover:bg-[#1B4332] group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-bold text-sm text-[#262320] group-hover:text-[#1B4332]">
                      {action.label}
                    </div>
                    <div className="text-xs text-[#635E59] truncate">{action.desc}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#635E59] group-hover:text-[#1B4332] shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Restrained Trust & Verification Decoupling */}
      <section className="py-12 bg-white border-b border-[#D8D2C4]">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-2 mb-8">
            <span className="text-xs font-bold text-[#1B4332] uppercase tracking-wider block">
              Market Integrity
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#262320] tracking-tight">
              Verification is not Reputation
            </h2>
            <p className="text-sm sm:text-base font-body text-[#635E59]">
              We strictly separate verified legal credentials from empirical historical performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Left: Verification */}
            <div className="bg-[#F4F1EA] border border-[#D8D2C4] rounded-[8px] p-5 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1B4332]" />
                <h3 className="font-heading font-bold text-base text-[#262320]">
                  Verification (Confirmed Credentials)
                </h3>
              </div>
              <p className="text-xs font-body text-[#635E59] leading-relaxed">
                Binary confirmation of identity, physical quality, and legal licensing:
              </p>
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-[4px] border border-[#D8D2C4]">
                  <span>FSSAI Food Processing License</span>
                  <VerificationBadge customLabel="Verified FSSAI" />
                </div>
                <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-[4px] border border-[#D8D2C4]">
                  <span>Commercial Transporter License</span>
                  <VerificationBadge customLabel="Verified Carrier" />
                </div>
                <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-[4px] border border-[#D8D2C4]">
                  <span>Physical Assayer Lot Quality</span>
                  <VerificationBadge type="physical" customLabel="Physically Verified" />
                </div>
                <div className="flex items-center justify-between text-xs bg-[#FEF3C7] p-2.5 rounded-[4px] border border-[#FDE68A]">
                  <span>Tier 1 AI Visual Screening</span>
                  <span className="text-[11px] font-bold text-[#92400E]">AI Screening — Not Physically Verified</span>
                </div>
              </div>
            </div>

            {/* Right: Reputation */}
            <div className="bg-[#F4F1EA] border border-[#D8D2C4] rounded-[8px] p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-[#B45309]" />
                <h3 className="font-heading font-bold text-base text-[#262320]">
                  Reputation (Historical Track Record)
                </h3>
              </div>
              <p className="text-xs font-body text-[#635E59] leading-relaxed">
                Empirical ratings calculated only after completed deliveries and verified settlements:
              </p>
              <div className="space-y-2 pt-1">
                <div className="bg-white p-2.5 rounded-[4px] border border-[#D8D2C4] flex items-center justify-between text-xs">
                  <span>Buyer ABC Foods</span>
                  <ReputationCluster ratingScore={4.7} completedDealsCount={140} onTimeDeliveryPercent={98} size="sm" />
                </div>
                <div className="bg-white p-2.5 rounded-[4px] border border-[#D8D2C4] flex items-center justify-between text-xs">
                  <span>Sahyadri Agri Logistics</span>
                  <ReputationCluster ratingScore={4.8} completedDealsCount={230} onTimeDeliveryPercent={96.5} size="sm" />
                </div>
                <div className="bg-white p-2.5 rounded-[4px] border border-[#D8D2C4] flex items-center justify-between text-xs">
                  <span>Nashik Agro FPO</span>
                  <ReputationCluster ratingScore={4.9} completedDealsCount={85} onTimeDeliveryPercent={100} size="sm" />
                </div>
              </div>
              <p className="text-[11px] text-[#635E59] italic pt-1">
                Transparency Note: We never claim statutory certifications or official AGMARK endorsement unless verified by authorized assayers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Language & Voice Practical Feature */}
      <section className="py-12 bg-[#F4F1EA] border-b border-[#D8D2C4]">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-white border border-[#D8D2C4] rounded-[8px] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#1B4332] uppercase tracking-wider block">
                  Multilingual Voice Access
                </span>
                <h2 className="text-2xl font-bold font-heading text-[#262320] mt-1">
                  Prefer speaking in your own language?
                </h2>
                <p className="text-sm font-body text-[#635E59] mt-1">
                  Ask questions in Marathi, Hindi, Telugu, or English. KisanSetu recognizes agricultural queries and speaks answers aloud.
                </p>
              </div>

              <Link href="/farmer#voice" className="shrink-0">
                <Button size="lg" variant="primary" className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white gap-2">
                  <Mic className="w-5 h-5" />
                  <span>Open Voice Assistant</span>
                </Button>
              </Link>
            </div>

            {/* Sample Queries */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#D8D2C4]">
              <div className="p-2.5 bg-[#F4F1EA] rounded-[4px] text-xs text-[#262320] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1B4332]" />
                <span>&ldquo;What is today&apos;s onion price?&rdquo; (कांद्याचा भाव काय आहे?)</span>
              </div>
              <div className="p-2.5 bg-[#F4F1EA] rounded-[4px] text-xs text-[#262320] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1B4332]" />
                <span>&ldquo;Find buyers for my onion.&rdquo; (माझ्या मालासाठी खरेदीदार शोधा)</span>
              </div>
              <div className="p-2.5 bg-[#F4F1EA] rounded-[4px] text-xs text-[#262320] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1B4332]" />
                <span>&ldquo;Which option gives me more money?&rdquo; (कोणता पर्याय जास्त नफा देईल?)</span>
              </div>
              <div className="p-2.5 bg-[#F4F1EA] rounded-[4px] text-xs text-[#262320] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1B4332]" />
                <span>&ldquo;Find transport for my lot.&rdquo; (वाहतूकदार शोधा)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Who Uses KisanSetu (Ecosystem) */}
      <Ecosystem />

      {/* 9. Platform Capabilities & Roadmap */}
      <Roadmap />
    </div>
  );
}
