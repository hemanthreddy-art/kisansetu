'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { Locale } from '@/i18n/translations';
import { Sprout, Menu, X, Globe, Scale, TrendingUp, Truck, Users, CreditCard, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const { locale, setLocale, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const languages: { code: Locale; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'mr', label: 'मराठी' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'hi', label: 'हिन्दी' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-emerald-100 shadow-xs">
      {/* Top Govt / Agricultural Initiative Bar */}
      <div className="bg-emerald-900 text-emerald-100 px-4 py-1 text-xs font-medium text-center flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">
              Government of Maharashtra • Agricultural Marketing & Price Discovery
            </span>
            <span className="sm:hidden text-center w-full">Govt of Maharashtra • Krishi Panan</span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-emerald-200 text-[11px]">
            <Link href="/inspector" className="hover:text-white transition-colors">Inspector</Link>
            <span>•</span>
            <Link href="/disputes" className="hover:text-white transition-colors">Grievances</Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-white transition-colors">State Admin</Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 flex items-center justify-center text-white shadow-md group-hover:bg-emerald-800 transition-colors">
              <Sprout className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold tracking-tight text-emerald-900">
                  {t.brand.name}
                </span>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold border border-amber-200">
                  MH
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium hidden sm:block">
                {t.brand.tagline}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/farmer"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-emerald-800 hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
            >
              <Users className="w-4 h-4 text-emerald-700" />
              {t.nav.farmer}
            </Link>
            <Link
              href="/buyer"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
            >
              {t.nav.buyer}
            </Link>
            <Link
              href="/transporter"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-emerald-800 hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4 text-emerald-700" />
              {t.nav.transporter}
            </Link>
            <Link
              href="/markets"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-emerald-800 hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              {t.nav.markets}
            </Link>
            <Link
              href="/calculator"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200 flex items-center gap-1.5"
            >
              <Scale className="w-4 h-4 text-amber-700" />
              {t.nav.calculator}
            </Link>
            <Link
              href="/transactions"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-200 flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4 text-emerald-700" />
              <span>{t.transactions?.hubTitle ? 'Transactions' : 'Transactions'}</span>
            </Link>
          </nav>

          {/* Language Selector & CTA */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Pills */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200">
              <Globe className="w-4 h-4 text-gray-500 ml-2 mr-1" />
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLocale(lang.code)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    locale === lang.code
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-gray-700 hover:text-emerald-800'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <Link href="/farmer">
              <Button size="md" variant="primary">
                {t.nav.getStarted}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Quick language toggle for mobile */}
            <button
              onClick={() => {
                const next: Record<Locale, Locale> = { en: 'mr', mr: 'te', te: 'hi', hi: 'en' };
                setLocale(next[locale]);
              }}
              className="px-2.5 py-1 text-xs font-bold bg-gray-100 text-emerald-900 border border-gray-300 rounded-lg flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5" />
              {locale === 'en' ? 'EN' : locale === 'mr' ? 'मराठी' : locale === 'te' ? 'తెలుగు' : 'हिन्दी'}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-4 gap-1 p-1 bg-gray-100 rounded-xl mb-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLocale(lang.code)}
                className={`py-2 text-xs font-bold rounded-lg text-center ${
                  locale === lang.code
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-gray-700 hover:text-emerald-800'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col space-y-1">
            <Link
              href="/farmer"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl font-semibold text-gray-800 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-3 text-base"
            >
              <Users className="w-5 h-5 text-emerald-700" />
              {t.nav.farmer}
            </Link>
            <Link
              href="/buyer"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl font-semibold text-gray-800 hover:bg-emerald-50 hover:text-emerald-800 text-base"
            >
              {t.nav.buyer}
            </Link>
            <Link
              href="/transporter"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl font-semibold text-gray-800 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-3 text-base"
            >
              <Truck className="w-5 h-5 text-emerald-700" />
              {t.nav.transporter}
            </Link>
            <Link
              href="/markets"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl font-semibold text-gray-800 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-3 text-base"
            >
              <TrendingUp className="w-5 h-5 text-emerald-700" />
              {t.nav.markets}
            </Link>
            <Link
              href="/calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 flex items-center gap-3 text-base"
            >
              <Scale className="w-5 h-5 text-amber-700" />
              {t.nav.calculator}
            </Link>
            <Link
              href="/transactions"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-3 text-base"
            >
              <CreditCard className="w-5 h-5 text-emerald-700" />
              Transactions Hub
            </Link>
            <div className="pt-2 border-t border-gray-100 mt-2 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 block">Governance & Roles</span>
              <Link
                href="/inspector"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Quality Inspector Desk
              </Link>
              <Link
                href="/disputes"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                <Scale className="w-4 h-4 text-rose-700" />
                Disputes & Grievances
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                <Users className="w-4 h-4 text-purple-700" />
                State Admin Portal
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <Link href="/farmer" onClick={() => setMobileMenuOpen(false)}>
              <Button size="lg" variant="primary" fullWidth>
                {t.nav.getStarted}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
