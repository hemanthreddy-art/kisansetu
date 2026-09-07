import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

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
    <html lang="mr">
      <body className="min-h-screen flex flex-col antialiased selection:bg-emerald-200 selection:text-emerald-900">
        <LanguageProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
