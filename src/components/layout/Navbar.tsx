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
  PlusCircle,
} from 'lucide-react';
import { FarmerVoiceAssistant } from '@/components/farmer/FarmerVoiceAssistant';
import { MobileNav } from '@/components/layout/MobileNav';

export function Navbar() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLanguage();
  const { user, logout, switchRole, isAuthenticated } = useAuth();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const languages: { code: Locale; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'mr', label: 'मराठी' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'hi', label: 'हिन्दी' },
  ];

  // Helper to determine active state
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    const [path] = href.split('?');
    return pathname === path;
  };

  // 1. Unauthenticated Navigation Links: Public features only
  const unauthNavItems = [
    { href: '/markets', label: t.common.mandiPricesNav || t.nav.markets },
    { href: '/storage', label: t.common.storageNav || t.nav.storage },
    { href: '/fpo', label: t.common.fpoNav || t.nav.fpo },
    { href: '/calculator', label: t.common.calculatorNav || t.nav.calculator },
    { href: '/lots', label: t.common.marketplaceNav || t.nav.lots },
  ];

  // 2. Role-specific authenticated primary links
  const farmerNavItems = [
    { href: '/farmer?tab=MY_CROPS', label: t.nav.myCrops || 'My Crops' },
    { href: '/farmer?tab=FIND_BUYERS', label: t.nav.findBuyers || 'Find Buyers' },
    { href: '/farmer?tab=MY_DELIVERIES', label: t.nav.myDeliveries || 'My Deliveries' },
    { href: '/farmer?tab=HISTORY', label: t.nav.history || 'History' },
  ];

  const buyerNavItems = [
    { href: '/lots', label: t.nav.marketplace || 'Marketplace' },
    { href: '/buyer?tab=purchases', label: t.nav.myPurchases || 'My Purchases' },
    { href: '/buyer?tab=demands', label: t.nav.demands || 'Demands' },
    { href: '/buyer?tab=history', label: t.nav.history || 'History' },
  ];

  const transporterNavItems = [
    { href: '/transporter?tab=requests', label: t.nav.availableRequests || 'Available Requests' },
    { href: '/transporter?tab=dispatches', label: t.nav.myDeliveries || 'My Deliveries' },
    { href: '/transporter?tab=history', label: t.nav.earnings || 'Earnings & History' },
  ];

  // Current primary links according to authentication and role
  const activePrimaryItems = !isAuthenticated || !user
    ? unauthNavItems
    : user.role === 'FARMER'
    ? farmerNavItems
    : user.role === 'BUYER'
    ? buyerNavItems
    : transporterNavItems;

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
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
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
              {/* Prominent CTA for Farmer: + SELL MY CROP */}
              {isAuthenticated && user && user.role === 'FARMER' && (
                <Link
                  href="/farmer"
                  className="mr-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-black bg-[#1B4332] text-white hover:bg-[#2D6A4F] shadow-xs transition-all hover:scale-[1.02]"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{t.nav.sellCropBtn || t.farmer.sellMyCropHero}</span>
                </Link>
              )}

              {/* Primary Active Navigation Items */}
              {activePrimaryItems.map((item) => {
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

              {/* Secondary "More / Services" Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className="px-2.5 py-1.5 rounded-[4px] text-xs font-semibold text-[#635E59] hover:text-[#262320] hover:bg-[#ECE7DE] flex items-center gap-1 transition-colors"
                >
                  <span>{t.nav.more}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {isMoreOpen && (
                  <div
                    className="absolute right-0 mt-1 w-56 bg-white border border-[#D8D2C4] rounded-[6px] shadow-lg py-1.5 z-50 animate-fadeIn"
                    onMouseLeave={() => setIsMoreOpen(false)}
                  >
                    {/* Public & Market Features */}
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#635E59]">
                      {t.nav.moreServices || 'Services & Tools'}
                    </div>
                    <Link
                      href="/markets"
                      onClick={() => setIsMoreOpen(false)}
                      className="block px-3 py-1.5 text-xs text-[#262320] hover:bg-[#ECE7DE]"
                    >
                      {t.nav.markets}
                    </Link>
                    <Link
                      href="/storage"
                      onClick={() => setIsMoreOpen(false)}
                      className="block px-3 py-1.5 text-xs text-[#262320] hover:bg-[#ECE7DE]"
                    >
                      {t.nav.storage}
                    </Link>
                    <Link
                      href="/fpo"
                      onClick={() => setIsMoreOpen(false)}
                      className="block px-3 py-1.5 text-xs text-[#262320] hover:bg-[#ECE7DE]"
                    >
                      {t.nav.fpo}
                    </Link>
                    <Link
                      href="/calculator"
                      onClick={() => setIsMoreOpen(false)}
                      className="block px-3 py-1.5 text-xs text-[#262320] hover:bg-[#ECE7DE]"
                    >
                      {t.nav.calculator}
                    </Link>
                    <Link
                      href="/lots"
                      onClick={() => setIsMoreOpen(false)}
                      className="block px-3 py-1.5 text-xs text-[#262320] hover:bg-[#ECE7DE]"
                    >
                      {t.nav.lots}
                    </Link>
                    <Link
                      href="/transactions"
                      onClick={() => setIsMoreOpen(false)}
                      className="block px-3 py-1.5 text-xs text-[#262320] hover:bg-[#ECE7DE]"
                    >
                      {t.nav.transactions}
                    </Link>

                    {/* Operational Portals (retains test-stitch-stage2 route checks) */}
                    <div className="border-t border-[#D8D2C4] my-1 pt-1">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#635E59]">
                        {t.nav.ecosystemPortals || 'Operational Portals'}
                      </div>
                      <Link
                        href="/farmer"
                        onClick={() => setIsMoreOpen(false)}
                        className="block px-3 py-1.5 text-xs text-[#262320] hover:bg-[#ECE7DE]"
                      >
                        {t.nav.farmer}
                      </Link>
                      <Link
                        href="/buyer"
                        onClick={() => setIsMoreOpen(false)}
                        className="block px-3 py-1.5 text-xs text-[#262320] hover:bg-[#ECE7DE]"
                      >
                        {t.nav.buyer}
                      </Link>
                      <Link
                        href="/transporter"
                        onClick={() => setIsMoreOpen(false)}
                        className="block px-3 py-1.5 text-xs text-[#262320] hover:bg-[#ECE7DE]"
                      >
                        {t.nav.transporter}
                      </Link>
                    </div>

                    {/* Governance */}
                    <div className="border-t border-[#D8D2C4] my-1 pt-1">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#635E59]">
                        {t.nav.governance || 'Governance'}
                      </div>
                      <Link
                        href="/inspector"
                        onClick={() => setIsMoreOpen(false)}
                        className="block px-3 py-1.5 text-xs text-[#262320] hover:bg-[#ECE7DE]"
                      >
                        {t.nav.inspector}
                      </Link>
                      <Link
                        href="/disputes"
                        onClick={() => setIsMoreOpen(false)}
                        className="block px-3 py-1.5 text-xs text-[#262320] hover:bg-[#ECE7DE]"
                      >
                        {t.nav.disputes}
                      </Link>
                      <Link
                        href="/admin"
                        onClick={() => setIsMoreOpen(false)}
                        className="block px-3 py-1.5 text-xs text-[#262320] hover:bg-[#ECE7DE]"
                      >
                        {t.nav.admin}
                      </Link>
                    </div>
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
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] text-xs font-bold bg-[#EAF2ED] text-[#1B4332] border border-[#B7D5C4] hover:bg-[#D4E8DC] transition-colors min-h-[36px]"
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
                      className="absolute right-0 mt-1 w-64 bg-white border border-[#D8D2C4] rounded-[6px] shadow-lg py-2 z-50 animate-fadeIn"
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

                      {/* Role: Quick Role Switcher for Demo */}
                      <div className="px-3 py-1.5 text-[11px] font-bold text-[#635E59] uppercase tracking-wider">
                        Role: {t.nav.switchRole}
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-bold bg-[#1B4332] text-white hover:bg-[#2D6A4F] transition-colors min-h-[36px]"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{t.nav.login} / {t.nav.getStarted || 'Get Started'}</span>
                </Link>
              )}

              {/* Voice Access Button */}
              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                aria-label="Open voice assistant"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-semibold border border-[#1B4332] text-[#1B4332] bg-[#EAF2ED] hover:bg-[#1B4332] hover:text-white transition-colors min-h-[36px]"
              >
                <Mic className="w-4 h-4" />
                <span className="hidden sm:inline">{t.nav.speak}</span>
              </button>

              {/* Compact Language Selector Dropdown (Zero Horizontal Overflow) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] text-xs font-bold bg-[#ECE7DE] text-[#1B4332] border border-[#D8D2C4] hover:bg-[#E2DDD3] transition-colors min-h-[36px]"
                  aria-label="Select Language"
                >
                  <Globe className="w-3.5 h-3.5 text-[#1B4332]" />
                  <span>{languages.find((l) => l.code === locale)?.label || 'English'}</span>
                  <ChevronDown className="w-3 h-3 text-[#635E59]" />
                </button>

                {isLanguageOpen && (
                  <div
                    className="absolute right-0 mt-1 w-36 bg-white border border-[#D8D2C4] rounded-[6px] shadow-lg py-1 z-50 animate-fadeIn"
                    onMouseLeave={() => setIsLanguageOpen(false)}
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setLocale(lang.code);
                          setIsLanguageOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors flex items-center justify-between ${
                          locale === lang.code
                            ? 'bg-[#EAF2ED] text-[#1B4332]'
                            : 'text-[#262320] hover:bg-[#ECE7DE]'
                        }`}
                      >
                        <span>{lang.label}</span>
                        {locale === lang.code && <span className="text-[#1B4332] text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Quick Language Cycle Toggle */}
              <button
                type="button"
                onClick={() => {
                  const next: Record<Locale, Locale> = { en: 'mr', mr: 'te', te: 'hi', hi: 'en' };
                  setLocale(next[locale]);
                }}
                className="sm:hidden px-2 py-1.5 text-xs font-bold bg-[#ECE7DE] text-[#1B4332] border border-[#D8D2C4] rounded-[4px] flex items-center gap-1 min-h-[36px]"
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

      {/* Cross-Role Guidance Banner (Eliminates Persona Trapping) */}
      {isAuthenticated && user && (() => {
        const isViewingBuyer = pathname.startsWith('/buyer') && user.role !== 'BUYER';
        const isViewingTransporter = pathname.startsWith('/transporter') && user.role !== 'TRANSPORTER';
        const isViewingFarmer = pathname.startsWith('/farmer') && user.role !== 'FARMER';
        if (!isViewingBuyer && !isViewingTransporter && !isViewingFarmer) return null;

        const targetRole = isViewingBuyer ? 'BUYER' : isViewingTransporter ? 'TRANSPORTER' : 'FARMER';
        const targetRoleLabel = isViewingBuyer ? 'Buyer' : isViewingTransporter ? 'Transporter' : 'Farmer';
        const myRoleLabel = user.role === 'FARMER' ? 'Farmer' : user.role === 'BUYER' ? 'Buyer' : 'Transporter';

        return (
          <aside aria-label="Role Switcher Notice" className="bg-[#FEF3C7] border-b border-[#FDE68A] text-[#92400E] px-4 py-2 text-xs">
            <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="font-bold">Persona Notice:</span>
                <span>
                  You are signed in as <strong>{myRoleLabel} ({user.fullName.split('(')[0].trim()})</strong> exploring the {targetRoleLabel} portal.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => switchRole(targetRole)}
                  className="px-2.5 py-1 bg-[#92400E] text-white rounded font-bold hover:bg-[#78350F] transition-colors text-[11px]"
                >
                  Switch to {targetRoleLabel} Persona
                </button>
                <Link
                  href={user.portalPath}
                  className="underline font-semibold hover:text-[#78350F] text-[11px]"
                >
                  Return to My Dashboard
                </Link>
              </div>
            </div>
          </aside>
        );
      })()}

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
