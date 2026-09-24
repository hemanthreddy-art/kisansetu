'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth, DemoRole, DEMO_USERS } from '@/lib/AuthContext';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  Users,
  Store,
  Truck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Phone,
  RefreshCw,
  Info,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';

function LoginFormContent() {
  const { t } = useLanguage();
  const { user, login, logout, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();

  const roleParam = searchParams.get('role')?.toUpperCase() as DemoRole | null;
  const isSwitching = searchParams.get('switch') === 'true';

  const [selectedRole, setSelectedRole] = useState<DemoRole | null>(
    roleParam && ['FARMER', 'BUYER', 'TRANSPORTER', 'INSPECTOR', 'ADMIN'].includes(roleParam)
      ? roleParam
      : isSwitching
      ? null
      : user
      ? user.role
      : 'FARMER'
  );

  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('123456');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (selectedRole && DEMO_USERS[selectedRole]) {
      setPhone(DEMO_USERS[selectedRole].phone);
    }
  }, [selectedRole]);

  const handleRoleSelect = (role: DemoRole) => {
    setSelectedRole(role);
    setPhone(DEMO_USERS[role].phone);
  };

  const handleQuickLogin = (role: DemoRole) => {
    setIsSubmitting(true);
    login(role);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setIsSubmitting(true);
    login(selectedRole, phone);
  };

  const roleConfigs = [
    {
      key: 'FARMER' as DemoRole,
      title: t.common.authFarmerRole,
      desc: t.common.authFarmerDesc,
      icon: Users,
      badgeText: 'MSAMB Farmer Portal',
      demoUser: DEMO_USERS.FARMER,
      accentColor: '#1B4332',
      accentBg: '#EAF2ED',
      portalPath: '/farmer',
    },
    {
      key: 'BUYER' as DemoRole,
      title: t.common.authBuyerRole,
      desc: t.common.authBuyerDesc,
      icon: Store,
      badgeText: 'Verified Buyer Hub',
      demoUser: DEMO_USERS.BUYER,
      accentColor: '#B45309',
      accentBg: '#FEF3C7',
      portalPath: '/buyer',
    },
    {
      key: 'TRANSPORTER' as DemoRole,
      title: t.common.authTransporterRole,
      desc: t.common.authTransporterDesc,
      icon: Truck,
      badgeText: 'Fleet & Logistics Dispatch',
      demoUser: DEMO_USERS.TRANSPORTER,
      accentColor: '#1B4332',
      accentBg: '#EAF2ED',
      portalPath: '/transporter',
    },
  ];

  return (
    <PageContainer maxWidth="5xl" className="py-8 sm:py-12">
      {/* Existing Active Session Banner if logged in */}
      {isAuthenticated && user && !isSwitching && (
        <div className="mb-8 p-4 bg-[#EAF2ED] border border-[#B7D5C4] rounded-[8px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-[#1B4332] text-white flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1B4332] bg-[#FFFFFF] px-2 py-0.5 rounded-[2px] border border-[#B7D5C4]">
                  {t.common.authCurrentRole}: {user.role === 'FARMER' ? t.common.authFarmerRole : user.role === 'BUYER' ? t.common.authBuyerRole : user.role === 'TRANSPORTER' ? t.common.authTransporterRole : user.role === 'INSPECTOR' ? t.nav.inspector : t.nav.admin}
                </span>
              </div>
              <p className="text-sm font-bold text-[#262320] mt-0.5">
                {user.fullName} {user.organization ? `· ${user.organization}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={user.portalPath}
              className="px-4 py-2 bg-[#1B4332] text-white text-xs font-bold rounded-[4px] hover:bg-[#2D6A4F] transition-colors flex items-center gap-1.5 min-h-[44px]"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t.nav.myDashboard}</span>
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="px-3 py-2 bg-[#FFFFFF] text-[#262320] border border-[#D8D2C4] text-xs font-bold rounded-[4px] hover:bg-[#ECE7DE] transition-colors flex items-center gap-1.5 min-h-[44px]"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.nav.logout}</span>
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-[#ECE7DE] border border-[#D8D2C4] text-xs font-semibold text-[#635E59] mb-3">
          <ShieldCheck className="w-4 h-4 text-[#1B4332]" />
          <span>{t.brand.name} · {t.brand.sihBadge || 'Govt of Maharashtra Prototype'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#262320] tracking-tight mb-2">
          {t.common.authLoginTitle}
        </h1>
        <p className="text-sm sm:text-base font-body text-[#635E59] leading-relaxed">
          {t.common.authLoginSubtitle}
        </p>
      </div>

      {/* Step 1: Role Selector Cards */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#635E59] font-heading">
            {t.common.authChooseRole}
          </h2>
          {selectedRole && (
            <span className="text-xs text-[#1B4332] font-semibold bg-[#EAF2ED] px-2 py-0.5 rounded-[2px] border border-[#B7D5C4]">
              {selectedRole === 'FARMER' ? t.common.authFarmerRole : selectedRole === 'BUYER' ? t.common.authBuyerRole : selectedRole === 'TRANSPORTER' ? t.common.authTransporterRole : selectedRole === 'INSPECTOR' ? t.nav.inspector : t.nav.admin}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roleConfigs.map((cfg) => {
            const Icon = cfg.icon;
            const isSelected = selectedRole === cfg.key;
            return (
              <div
                key={cfg.key}
                onClick={() => handleRoleSelect(cfg.key)}
                className={`cursor-pointer rounded-[8px] border p-5 transition-all flex flex-col justify-between min-h-[220px] ${
                  isSelected
                    ? 'bg-[#FFFFFF] border-[#1B4332] ring-2 ring-[#1B4332]/20 shadow-xs'
                    : 'bg-[#FFFFFF] border-[#D8D2C4] hover:border-[#1B4332]/50 hover:bg-[#F9F8F5]'
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleRoleSelect(cfg.key);
                  }
                }}
                aria-pressed={isSelected}
                aria-label={`Select ${cfg.title} role`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-[4px] flex items-center justify-center"
                      style={{ backgroundColor: cfg.accentBg, color: cfg.accentColor }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#635E59] bg-[#ECE7DE] px-2 py-0.5 rounded-[2px] border border-[#D8D2C4]">
                      {cfg.badgeText}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-[#262320] mb-1.5 flex items-center gap-1.5">
                    <span>{cfg.title}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#1B4332]" />}
                  </h3>
                  <p className="text-xs font-body text-[#5A554E] leading-relaxed">
                    {cfg.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#D8D2C4] flex items-center justify-between">
                  <div className="text-[11px] text-[#7C766D] truncate max-w-[170px]">
                    <span className="font-medium text-[#262320]">{cfg.demoUser.fullName.split('(')[0].trim()}</span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-[4px] transition-colors ${
                      isSelected
                        ? 'bg-[#1B4332] text-white'
                        : 'text-[#1B4332] bg-[#EAF2ED]'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Choose'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Official & Regulatory Access Options */}
        <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-end gap-2 text-xs text-[#635E59]">
          <span className="font-semibold text-[#262320]">Official & Regulatory Access:</span>
          <button
            type="button"
            onClick={() => handleRoleSelect('INSPECTOR')}
            className={`px-3 py-1.5 rounded-[4px] border text-xs font-semibold transition-colors min-h-[36px] flex items-center gap-1.5 ${
              selectedRole === 'INSPECTOR'
                ? 'bg-[#1B4332] text-white border-[#1B4332]'
                : 'bg-[#FFFFFF] text-[#1B4332] border-[#D8D2C4] hover:bg-[#EAF2ED]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.nav.inspector}</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('ADMIN')}
            className={`px-3 py-1.5 rounded-[4px] border text-xs font-semibold transition-colors min-h-[36px] flex items-center gap-1.5 ${
              selectedRole === 'ADMIN'
                ? 'bg-[#1B4332] text-white border-[#1B4332]'
                : 'bg-[#FFFFFF] text-[#1B4332] border-[#D8D2C4] hover:bg-[#EAF2ED]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{t.nav.admin}</span>
          </button>
        </div>
      </div>

      {/* Step 2: Login Form for Selected Role */}
      {selectedRole && (
        <div className="bg-[#FFFFFF] border border-[#D8D2C4] rounded-[8px] p-6 sm:p-8 shadow-xs max-w-xl mx-auto">
          {/* Active Role Header Bar */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#D8D2C4]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[4px] bg-[#1B4332] text-white flex items-center justify-center">
                {selectedRole === 'FARMER' ? (
                  <Users className="w-4 h-4" />
                ) : selectedRole === 'BUYER' ? (
                  <Store className="w-4 h-4" />
                ) : selectedRole === 'TRANSPORTER' ? (
                  <Truck className="w-4 h-4" />
                ) : selectedRole === 'INSPECTOR' ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-[#262320]">
                  {selectedRole === 'FARMER'
                    ? t.common.authFarmerRole
                    : selectedRole === 'BUYER'
                    ? t.common.authBuyerRole
                    : selectedRole === 'TRANSPORTER'
                    ? t.common.authTransporterRole
                    : selectedRole === 'INSPECTOR'
                    ? t.nav.inspector
                    : t.nav.admin} Portal Login
                </h3>
                <p className="text-xs font-body text-[#635E59]">
                  {DEMO_USERS[selectedRole].fullName} ({DEMO_USERS[selectedRole].location})
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedRole(null)}
              className="text-xs font-semibold text-[#1B4332] hover:underline flex items-center gap-1 min-h-[44px] px-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.common.authChangeRole}</span>
            </button>
          </div>

          {/* Prototype Demo Disclaimer Notice */}
          <div className="mb-6 p-3.5 bg-[#FEF3C7] border border-[#FDE68A] rounded-[4px] flex items-start gap-2.5 text-xs text-[#92400E]">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">{t.common.prototypeDemo}: </span>
              <span>{t.common.authDemoNotice}</span>
            </div>
          </div>

          {/* Quick One-Click Demo Action */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => handleQuickLogin(selectedRole)}
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-[4px] bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 min-h-[48px] shadow-xs cursor-pointer disabled:opacity-70"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>
                {isSubmitting
                  ? t.common.authSigningIn
                  : `${t.common.authQuickDemoLogin} (${DEMO_USERS[selectedRole].fullName.split('(')[0].trim()})`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-[#D8D2C4]"></div>
            <span className="shrink-0 mx-4 text-xs font-medium text-[#7C766D] uppercase">
              Or Manual Demo Sign In
            </span>
            <div className="flex-grow border-t border-[#D8D2C4]"></div>
          </div>

          {/* Manual Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="mobile-input"
                className="block text-xs font-bold text-[#262320] mb-1.5"
              >
                {t.common.authMobileLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7C766D]">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="mobile-input"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.common.authMobilePlaceholder}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FFFFFF] border border-[#D8D2C4] rounded-[4px] text-sm text-[#262320] focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password-input"
                className="block text-xs font-bold text-[#262320] mb-1.5"
              >
                {t.common.authPasswordLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7C766D]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.common.authPasswordPlaceholder}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FFFFFF] border border-[#D8D2C4] rounded-[4px] text-sm text-[#262320] focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] min-h-[44px]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-[4px] bg-[#262320] hover:bg-[#3D3A35] text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 min-h-[48px] cursor-pointer disabled:opacity-70"
            >
              <span>{isSubmitting ? t.common.authSigningIn : t.common.authSignInBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Role Switch Links */}
          <div className="mt-6 pt-4 border-t border-[#D8D2C4] flex items-center justify-between text-xs text-[#635E59]">
            <span>{t.nav.switchRole}:</span>
            <div className="flex items-center gap-2 font-semibold">
              {roleConfigs
                .filter((r) => r.key !== selectedRole)
                .map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => handleRoleSelect(r.key)}
                    className="text-[#1B4332] hover:underline px-1 py-1 min-h-[44px] flex items-center"
                  >
                    {r.title}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Public Pages Navigation Guarantee */}
      <div className="mt-12 text-center text-xs text-[#635E59] space-x-3">
        <span>Public Portals:</span>
        <Link href="/" className="hover:text-[#1B4332] underline">
          {t.nav.home}
        </Link>
        <span>•</span>
        <Link href="/markets" className="hover:text-[#1B4332] underline">
          {t.nav.markets}
        </Link>
        <span>•</span>
        <Link href="/calculator" className="hover:text-[#1B4332] underline">
          {t.nav.calculator}
        </Link>
      </div>
    </PageContainer>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center text-[#635E59]">
          <span className="text-sm font-medium">Loading login portal...</span>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
