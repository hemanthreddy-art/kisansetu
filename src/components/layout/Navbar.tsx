'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Locale } from '@/i18n/translations';
import {
  Sprout,
  Globe,
  Mic,
  X,
  ChevronDown,
  User,
  UserCheck,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { FarmerVoiceAssistant } from '@/components/farmer/FarmerVoiceAssistant';
import { MobileNav } from '@/components/layout/MobileNav';

export function Navbar() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLanguage();
  const { user, logout, switchRole, isAuthenticated } = useAuth();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isGovernanceOpen, setIsGovernanceOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const languages: { code: Locale; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'mr', label: 'मराठी' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'hi', label: 'हिन्दी' },
  ];

  const primaryNavItems = [
    { href: '/farmer', label: t.nav.farmer },
    { href: '/buyer', label: t.nav.buyer },
    { href: '/transporter', label: t.nav.transporter },
    { href: '/markets', label: t.nav.markets },
    { href: '/calculator', label: t.nav.calculator },
    { href: '/lots', label: t.nav.lots },
    { href: '/transactions', label: t.nav.transactions },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#D8D2C4]">
        {/* Top Government Initiative Header Strip */}
        <div className="bg-[#1B4332] text-[#EAF2ED] px-4 py-1 text-xs font-medium border-b border-[#2D6A4F]">
          <div className="container mx-auto max-w-7xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">
                Government of Maharashtra • Agricultural Marketing & Price Discovery
              </span>
              <span className="sm:hidden text-center w-full">
                Govt of Maharashtra • Krishi Panan
              </span>
            </div>
            <div className="hidden md:flex items-center gap-3 text-emerald-200 text-[11px]">
              <Link href="/inspector" className="hover:text-white transition-colors">
                {t.nav.inspector}
              </Link>
              <span>•</span>
              <Link href="/disputes" className="hover:text-white transition-colors">
                {t.nav.disputes}
              </Link>
              <span>•</span>
              <Link href="/admin" className="hover:text-white transition-colors">
                {t.nav.admin}
              </Link>
            </div>
          </div>
        </div>

        {/* Main Desktop & Mobile Header Bar */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Identity */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-[4px] bg-[#1B4332] flex items-center justify-center text-white transition-colors group-hover:bg-[#2D6A4F]">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold font-heading tracking-tight text-[#1B4332]">
                    {t.brand.name}
                  </span>
                  <span className="text-[10px] bg-[#ECE7DE] text-[#635E59] px-1.5 py-0.2 rounded-[2px] font-semibold border border-[#D8D2C4]">
                    MH
                  </span>
                </div>
                <p className="text-[11px] font-body text-[#635E59] font-medium hidden sm:block leading-none">
                  {t.brand.tagline}
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
              {primaryNavItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-2.5 py-1.5 rounded-[4px] text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-[#1B4332] text-white'
                        : 'text-[#262320] hover:text-[#1B4332] hover:bg-[#ECE7DE]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* Governance Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsGovernanceOpen(!isGovernanceOpen)}
                  className="px-2.5 py-1.5 rounded-[4px] text-xs font-semibold text-[#635E59] hover:text-[#262320] hover:bg-[#ECE7DE] flex items-center gap-1 transition-colors"
                >
                  <span>{t.nav.governance}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {isGovernanceOpen && (
                  <div
                    className="absolute right-0 mt-1 w-48 bg-white border border-[#D8D2C4] rounded-[4px] shadow-sm py-1 z-50"
                    onMouseLeave={() => setIsGovernanceOpen(false)}
                  >
                    <Link
                      href="/inspector"
                      onClick={() => setIsGovernanceOpen(false)}
                      className="block px-3 py-2 text-xs text-[#262320] hover:bg-[#ECE7DE]"
                    >
                      {t.nav.inspector}
                    </Link>
                    <Link
                      href="/disputes"
                      onClick={() => setIsGovernanceOpen(false)}
                      className="block px-3 py-2 text-xs text-[#262320] hover:bg-[#ECE7DE]"
                    >
                      {t.nav.disputes}
                    </Link>
                    <Link
                      href="/admin"
                      onClick={() => setIsGovernanceOpen(false)}
                      className="block px-3 py-2 text-xs text-[#262320] hover:bg-[#ECE7DE]"
                    >
                      {t.nav.admin}
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            {/* Language Selector, Account & Voice Action */}
            <div className="flex items-center gap-2">
              {/* Account / Login State */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAccountOpen(!isAccountOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-xs font-bold bg-[#EAF2ED] text-[#1B4332] border border-[#B7D5C4] hover:bg-[#D4E8DC] transition-colors min-h-[38px] sm:min-h-[36px]"
                    aria-label="Open account menu"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-[#1B4332]" />
                    <span className="max-w-[120px] sm:max-w-[150px] truncate">
                      {user.fullName.split('(')[0].trim()} · {user.role === 'FARMER' ? t.common.authRolePillFarmer : user.role === 'BUYER' ? t.common.authRolePillBuyer : t.common.authRolePillTransporter}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#1B4332]" />
                  </button>

                  {isAccountOpen && (
                    <div
                      className="absolute right-0 mt-1 w-64 bg-white border border-[#D8D2C4] rounded-[4px] shadow-md py-2 z-50 animate-fadeIn"
                      onMouseLeave={() => setIsAccountOpen(false)}
                    >
                      <div className="px-3 pb-2 mb-2 border-b border-[#D8D2C4]">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#635E59]">
                          {t.common.authCurrentRole}
                        </div>
                        <div className="text-xs font-bold text-[#262320] truncate">
                          {user.fullName}
                        </div>
                        {user.organization && (
                          <div className="text-[11px] text-[#635E59] truncate">
                            {user.organization}
                          </div>
                        )}
                      </div>

                      <Link
                        href={user.portalPath}
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#262320] hover:bg-[#ECE7DE]"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#1B4332]" />
                        <span>{t.nav.myDashboard}</span>
                      </Link>

                      <div className="px-3 py-1.5 text-[11px] font-bold text-[#635E59] uppercase tracking-wider">
                        {t.nav.switchRole}
                      </div>
                      <div className="grid grid-cols-3 gap-1 px-3 mb-2">
                        {(['FARMER', 'BUYER', 'TRANSPORTER'] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => {
                              setIsAccountOpen(false);
                              switchRole(r);
                            }}
                            className={`py-1 px-1 text-[10px] font-bold rounded-[3px] border text-center transition-colors ${
                              user.role === r
                                ? 'bg-[#1B4332] text-white border-[#1B4332]'
                                : 'bg-[#ECE7DE] text-[#262320] border-[#D8D2C4] hover:bg-[#D8D2C4]'
                            }`}
                          >
                            {r === 'FARMER' ? t.common.authRolePillFarmer : r === 'BUYER' ? t.common.authRolePillBuyer : t.common.authRolePillTransporter}
                          </button>
                        ))}
                      </div>

                      <div className="border-t border-[#D8D2C4] pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAccountOpen(false);
                            logout();
                          }}
                          className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#92400E] hover:bg-[#FEF3C7]"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t.nav.logout}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-bold bg-[#1B4332] text-white hover:bg-[#2D6A4F] transition-colors min-h-[38px] sm:min-h-[36px]"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{t.nav.login}</span>
                </Link>
              )}

              {/* Voice Access Button */}
              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                aria-label="Open voice assistant"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-semibold border border-[#1B4332] text-[#1B4332] bg-[#EAF2ED] hover:bg-[#1B4332] hover:text-white transition-colors min-h-[38px] sm:min-h-[36px]"
              >
                <Mic className="w-4 h-4" />
                <span className="hidden sm:inline">{t.nav.speak}</span>
              </button>

              {/* Desktop Language Selector Pills */}
              <div className="hidden sm:flex items-center bg-[#ECE7DE] rounded-[4px] p-0.5 border border-[#D8D2C4]">
                <Globe className="w-3.5 h-3.5 text-[#635E59] ml-1.5 mr-1" />
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLocale(lang.code)}
                    className={`px-2 py-0.5 text-xs font-bold rounded-[3px] transition-all ${
                      locale === lang.code
                        ? 'bg-[#1B4332] text-white'
                        : 'text-[#635E59] hover:text-[#1B4332]'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* Mobile Quick Language Toggle */}
              <button
                type="button"
                onClick={() => {
                  const next: Record<Locale, Locale> = { en: 'mr', mr: 'te', te: 'hi', hi: 'en' };
                  setLocale(next[locale]);
                }}
                className="sm:hidden px-2.5 py-1.5 text-xs font-bold bg-[#ECE7DE] text-[#1B4332] border border-[#D8D2C4] rounded-[4px] flex items-center gap-1 min-h-[38px]"
                aria-label="Switch language"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>
                  {locale === 'en' ? 'EN' : locale === 'mr' ? 'मराठी' : locale === 'te' ? 'తెలుగు' : 'हिन्दी'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Global Farmer Voice Assistant Modal */}
      {isVoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div
            className="fixed inset-0"
            onClick={() => setIsVoiceOpen(false)}
            aria-hidden="true"
          />
          <div className="relative bg-[#FFFFFF] border border-[#D8D2C4] rounded-[8px] max-w-xl w-full p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D8D2C4]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[4px] bg-[#1B4332] text-white flex items-center justify-center">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-base text-[#262320]">
                    {t.voice?.buttonLabel || 'Farmer Voice Assistant'}
                  </h2>
                  <p className="text-xs font-body text-[#635E59]">
                    {t.voice?.buttonHint || 'Ask about prices, buyers, transport, or net profit'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVoiceOpen(false)}
                className="p-1.5 text-[#635E59] hover:text-[#262320] rounded-[4px] hover:bg-[#ECE7DE]"
                aria-label="Close voice dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <FarmerVoiceAssistant />
          </div>
        </div>
      )}

      {/* Mount Mobile Navigation Bar */}
      <MobileNav onOpenVoice={() => setIsVoiceOpen(true)} />
    </>
  );
}
