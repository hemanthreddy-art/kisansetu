'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';
import {
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  PlusCircle,
  Store,
  PlayCircle,
  Scale,
} from 'lucide-react';

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/80 via-white to-white pt-10 pb-16 lg:pt-16 lg:pb-20 border-b border-gray-100">
      {/* Decorative background blur circles */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Government / SIH Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/90 text-emerald-900 border border-emerald-300 text-xs sm:text-sm font-semibold tracking-wide shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>{t.hero.badge || t.brand.sihBadge}</span>
          </div>

          {/* Core Brand & Tagline */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight">
              Kisan<span className="text-emerald-700">Setu</span>
            </h1>
            <p className="text-lg sm:text-2xl font-bold text-amber-800 tracking-tight">
              &ldquo;{t.hero.tagline}&rdquo;
            </p>
            <p className="text-xs sm:text-sm uppercase tracking-widest font-bold text-gray-500">
              {t.hero.descriptor}
            </p>
          </div>

          {/* Core USP Callout Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white shadow-md border border-emerald-700/50 max-w-3xl mx-auto text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[11px] font-black uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" />
              <span>The KisanSetu Principle</span>
            </div>
            <p className="text-base sm:text-xl font-black tracking-tight text-emerald-50">
              &ldquo;{t.hero.coreUsp}&rdquo;
            </p>
            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-2xl mx-auto leading-relaxed">
              {t.hero.description}
            </p>
          </div>

          {/* Four Primary Action CTAs */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <Link href="/markets" className="w-full">
              <Button size="md" variant="outline" fullWidth className="gap-1.5 text-xs sm:text-sm bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-900 font-bold shadow-xs">
                <TrendingUp className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{t.hero.exploreMarket}</span>
              </Button>
            </Link>

            <Link href="/farmer" className="w-full">
              <Button size="md" variant="primary" fullWidth className="gap-1.5 text-xs sm:text-sm font-bold shadow-xs bg-emerald-700 hover:bg-emerald-800 text-white">
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span>{t.hero.createProduceLot}</span>
              </Button>
            </Link>

            <Link href="/buyer" className="w-full">
              <Button size="md" variant="outline" fullWidth className="gap-1.5 text-xs sm:text-sm bg-white hover:bg-amber-50 border-amber-200 text-amber-900 font-bold shadow-xs">
                <Store className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{t.hero.findBuyers}</span>
              </Button>
            </Link>

            <Link href="/lots" className="w-full">
              <Button size="md" variant="outline" fullWidth className="gap-1.5 text-xs sm:text-sm bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-950 font-black shadow-xs">
                <PlayCircle className="w-4 h-4 text-amber-800 shrink-0" />
                <span>{t.hero.viewDemo}</span>
              </Button>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-700 bg-gray-50/80 py-2 px-3 rounded-xl border border-gray-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t.hero.statsFarmers}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-700 bg-gray-50/80 py-2 px-3 rounded-xl border border-gray-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t.hero.statsMandis}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-700 bg-gray-50/80 py-2 px-3 rounded-xl border border-gray-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t.hero.statsBuyers}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
