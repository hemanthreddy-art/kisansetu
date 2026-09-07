'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { Sprout, ShieldCheck, Award } from 'lucide-react';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-gray-300 pt-14 pb-10 border-t border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-gray-800">
          {/* Col 1: Brand & USP */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white tracking-tight">
                  {t.brand.name}
                </span>
                <span className="block text-xs text-amber-400 font-medium">
                  {t.brand.tagline}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              KisanSetu is a smart market-linkage platform empowering Maharashtra farmers to
              discover their highest reliable <strong>Net Realisation</strong> by integrating
              transparent mandi prices, actual logistics freight, and verified buyer demand.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full flex items-center gap-1.5 font-medium">
                <Award className="w-3.5 h-3.5" /> Market Linkages & Price Discovery
              </span>
              <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full border border-gray-700">
                Govt of Maharashtra
              </span>
            </div>
          </div>

          {/* Col 2: Producer & Buyer Hubs */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              {t.nav.ecosystemPortals}
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/farmer" className="hover:text-emerald-400 transition-colors">
                  {t.nav.farmer}
                </Link>
              </li>
              <li>
                <Link href="/buyer" className="hover:text-emerald-400 transition-colors">
                  {t.nav.buyer}
                </Link>
              </li>
              <li>
                <Link href="/transporter" className="hover:text-emerald-400 transition-colors">
                  {t.nav.transporter}
                </Link>
              </li>
              <li>
                <Link href="/inspector" className="hover:text-emerald-400 transition-colors">
                  {t.nav.inspector}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-emerald-400 transition-colors">
                  {t.nav.admin}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Intelligence & Core USP */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              {t.nav.markets}
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/markets" className="hover:text-emerald-400 transition-colors">
                  {t.nav.markets}
                </Link>
              </li>
              <li>
                <Link href="/calculator" className="hover:text-amber-400 transition-colors font-semibold">
                  {t.nav.calculator}
                </Link>
              </li>
              <li>
                <Link href="/lots" className="hover:text-emerald-400 transition-colors">
                  {t.nav.lots}
                </Link>
              </li>
              <li>
                <Link href="/transactions" className="hover:text-emerald-400 transition-colors">
                  {t.nav.transactions}
                </Link>
              </li>
              <li>
                <Link href="/disputes" className="hover:text-emerald-400 transition-colors">
                  {t.nav.disputes}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Transparency Principles */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Trust Principles
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              • <strong>Realisation over Raw Price:</strong> Factoring transport, storage, and cess.
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              • <strong>Two-Tier Quality:</strong> AI visual estimate strictly separated from official physical verification.
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              • <strong>Verified Ratings:</strong> 3-way reviews tied exclusively to fulfilled transactions.
            </p>
          </div>
        </div>

        {/* Bottom Bar with Data Principle Notice */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>{t.footer.govtCredit}</p>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">{t.footer.phaseNotice}</span>
            <span>•</span>
            <span className="text-amber-500/90 font-medium">Demo Data Principle Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
