import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { AuthProvider } from '@/lib/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

import { Plus_Jakarta_Sans, Noto_Sans } from 'next/font/google';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
});

const notoSans = Noto_Sans({
  subsets: ['latin', 'devanagari'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'KisanSetu | Right Market. Right Buyer. Right Price.',
  description:
    'Smart Agricultural Market-Linkage and Net Realisation Platform for Farmers, FPOs, Buyers, and Transporters in Maharashtra and Andhra Pradesh.',
  keywords: [
    'KisanSetu',
    'Agricultural Market Linkage',
    'Maharashtra APMC',
    'Net Realisation',
    'Farmer Producer Organization',
    'Agricultural Marketing',
    'Mandi Prices',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mr" className={`${plusJakartaSans.variable} ${notoSans.variable}`}>
      <body className="min-h-screen flex flex-col antialiased bg-[#F4F1EA] text-[#262320] selection:bg-emerald-200 selection:text-emerald-900">
        <LanguageProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 pb-16 lg:pb-0">{children}</main>
            <Footer />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
