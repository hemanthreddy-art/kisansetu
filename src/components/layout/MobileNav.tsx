'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageContext';
import { Locale } from '@/i18n/translations';
import {
  Home,
  TrendingUp,
  Package,
  CreditCard,
  Menu,
  X,
  Users,
  Truck,
  Scale,
  ShieldCheck,
  Globe,
  Mic,
} from 'lucide-react';

interface MobileNavProps {
  onOpenVoice?: () => void;
}

export function MobileNav({ onOpenVoice }: MobileNavProps) {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLanguage();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const languages: { code: Locale; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'mr', label: 'मराठी' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'hi', label: 'हिन्दी' },
  ];

  const primaryTabs = [
    { href: '/', label: t.nav.home, icon: Home },
    { href: '/markets', label: t.nav.markets, icon: TrendingUp },
    { href: '/lots', label: t.nav.lots, icon: Package },
    { href: '/transactions', label: t.nav.transactions, icon: CreditCard },
  ];

  const secondaryLinks = [
    { href: '/farmer', label: t.nav.farmer, icon: Users, desc: t.nav.descFarmer },
    { href: '/buyer', label: t.nav.buyer, icon: Users, desc: t.nav.descBuyer },
    { href: '/transporter', label: t.nav.transporter, icon: Truck, desc: t.nav.descTransporter },
    { href: '/calculator', label: t.nav.calculator, icon: Scale, desc: t.nav.descCalculator },
  ];

  const governanceLinks = [
    { href: '/inspector', label: t.nav.inspector, icon: ShieldCheck, desc: t.nav.descInspector },
    { href: '/disputes', label: t.nav.disputes, icon: Scale, desc: t.nav.descDisputes },
    { href: '/admin', label: t.nav.admin, icon: Users, desc: t.nav.descAdmin },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Fixed Bottom Bar - Mobile/Tablet only */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[#FFFFFF] border-t border-[#D8D2C4] shadow-xs pb-safe"
      >
        <div className="grid grid-cols-5 h-16 items-center">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center min-h-[48px] px-1 transition-colors ${
                  active
                    ? 'text-[#1B4332] font-bold'
                    : 'text-[#635E59] hover:text-[#1B4332]'
                }`}
              >
                <div
                  className={`p-1 rounded-[4px] transition-colors ${
                    active ? 'bg-[#EAF2ED]' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] leading-tight truncate max-w-[64px] text-center mt-0.5">
                  {tab.label}
                </span>
              </Link>
            );
          })}

          {/* More Toggle */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            aria-label="Open more navigation options"
            className={`flex flex-col items-center justify-center min-h-[48px] px-1 transition-colors ${
              isMoreOpen
                ? 'text-[#1B4332] font-bold'
                : 'text-[#635E59] hover:text-[#1B4332]'
            }`}
          >
            <div
              className={`p-1 rounded-[4px] transition-colors ${
                isMoreOpen ? 'bg-[#EAF2ED]' : ''
              }`}
            >
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[11px] leading-tight truncate max-w-[64px] text-center mt-0.5">
              {t.nav.more}
            </span>
          </button>
        </div>
      </nav>

      {/* "More" Bottom Sheet / Modal Drawer */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-fadeIn">
          {/* Backdrop click */}
          <div className="flex-1" onClick={() => setIsMoreOpen(false)} />

          <div className="bg-[#FFFFFF] rounded-t-[12px] border-t border-[#D8D2C4] max-h-[85vh] overflow-y-auto p-5 space-y-5 shadow-lg">
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#D8D2C4]">
              <div>
                <h3 className="font-heading font-bold text-base text-[#262320]">
                  KisanSetu
                </h3>
                <p className="text-xs font-body text-[#635E59]">
                  {t.brand.tagline}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="p-2 rounded-[4px] text-[#635E59] hover:text-[#262320] hover:bg-[#ECE7DE]"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Voice Assistant Entry */}
            {onOpenVoice && (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    onOpenVoice();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-[#EAF2ED] border border-[#1B4332]/30 text-[#1B4332] font-semibold py-2.5 px-4 rounded-[4px] min-h-[48px] hover:bg-[#1B4332] hover:text-white transition-colors"
                >
                  <Mic className="w-5 h-5" />
                  <span>{t.nav.speak} ({t.voice?.buttonLabel || 'Voice Assistant'})</span>
                </button>
              </div>
            )}

            {/* Secondary Ecosystem Links */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#635E59] uppercase tracking-wider block px-1 mb-1">
                {t.nav.ecosystemPortals}
              </span>
              <div className="grid grid-cols-1 gap-1">
                {secondaryLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMoreOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-[4px] hover:bg-[#ECE7DE] transition-colors min-h-[48px]"
                    >
                      <div className="w-9 h-9 rounded-[4px] bg-[#EAF2ED] flex items-center justify-center text-[#1B4332] shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-[#262320]">{item.label}</div>
                        <div className="text-xs text-[#635E59] truncate">{item.desc}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Governance Links */}
            <div className="space-y-1 pt-2 border-t border-[#D8D2C4]">
              <span className="text-[11px] font-bold text-[#635E59] uppercase tracking-wider block px-1 mb-1">
                {t.nav.governanceVerification}
              </span>
              <div className="grid grid-cols-1 gap-1">
                {governanceLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMoreOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-[4px] hover:bg-[#ECE7DE] transition-colors min-h-[48px]"
                    >
                      <div className="w-9 h-9 rounded-[4px] bg-[#ECE7DE] flex items-center justify-center text-[#262320] shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-[#262320]">{item.label}</div>
                        <div className="text-xs text-[#635E59] truncate">{item.desc}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Language Selector in Drawer */}
            <div className="pt-2 border-t border-[#D8D2C4] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#635E59]">
                <Globe className="w-4 h-4" />
                <span>{t.nav.selectLanguage}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLocale(lang.code)}
                    className={`py-2 text-xs font-bold rounded-[4px] border min-h-[44px] transition-colors ${
                      locale === lang.code
                        ? 'bg-[#1B4332] text-white border-[#1B4332]'
                        : 'bg-[#ECE7DE] text-[#262320] border-[#D8D2C4] hover:bg-[#D8D2C4]'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
