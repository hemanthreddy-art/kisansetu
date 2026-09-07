import { Hero } from '@/components/landing/Hero';
import { RealisationPreview } from '@/components/landing/RealisationPreview';
import { Ecosystem } from '@/components/landing/Ecosystem';
import { ValueProps } from '@/components/landing/ValueProps';
import { Roadmap } from '@/components/landing/Roadmap';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* 1. Hero Section with Brand, Tagline, Problem USP & Dual CTAs */}
      <Hero />

      {/* 2. Interactive Net Realisation Engine Live Teaser (The Core USP) */}
      <RealisationPreview />

      {/* 3. Three Pillars of the Ecosystem: Farmer/FPO, Buyer, Transporter */}
      <Ecosystem />

      {/* 4. Four Core Value Propositions: Intelligence, Net Realisation, Trust, Logistics */}
      <ValueProps />

      {/* 5. Complete SIH Modular Monolith Roadmap */}
      <Roadmap />
    </div>
  );
}
