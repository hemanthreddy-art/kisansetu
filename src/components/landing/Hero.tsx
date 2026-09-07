'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  TrendingUp,
  PlusCircle,
  Mic,
  Building2,
  Users,
  Store,
} from 'lucide-react';

export function Hero() {

  return (
    <section className="bg-[#F4F1EA] border-b border-[#D8D2C4] py-10 sm:py-14">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          {/* Trust strip badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-[#EAF2ED] border border-[#B7D5C4] text-[#1B4332] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#1B4332]" />
            <span>Government of Maharashtra • Market Linkages & Price Discovery</span>
          </div>

          {/* Primary Headline & Supporting Copy */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-[#262320] tracking-tight leading-tight">
              Sell where your produce earns more.
            </h1>
            <p className="text-base sm:text-lg font-body text-[#635E59] max-w-2xl mx-auto leading-relaxed">
              Compare market prices, buyer offers, transport and storage to understand your expected net realisation.
            </p>
          </div>

          {/* Core CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/markets" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto gap-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white">
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span>Check Market Prices</span>
              </Button>
            </Link>

            <Link href="/lots?action=create" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 border-[#1B4332] text-[#1B4332] hover:bg-[#EAF2ED]">
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span>Create a Produce Lot</span>
              </Button>
            </Link>

            <Link href="/farmer#voice" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto gap-2 bg-[#ECE7DE] border border-[#D8D2C4] text-[#262320] hover:bg-[#D8D2C4]">
                <Mic className="w-4 h-4 text-[#1B4332] shrink-0" />
                <span>Speak (बोलून विचारा)</span>
              </Button>
            </Link>
          </div>

          {/* Empirical Platform Highlights */}
          <div className="pt-6 border-t border-[#D8D2C4] grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#262320] bg-white py-2 px-3 rounded-[4px] border border-[#D8D2C4]">
              <Users className="w-4 h-4 text-[#1B4332] shrink-0" />
              <span>5,000+ Farmers & FPOs</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#262320] bg-white py-2 px-3 rounded-[4px] border border-[#D8D2C4]">
              <Building2 className="w-4 h-4 text-[#1B4332] shrink-0" />
              <span>300+ APMC Mandis</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#262320] bg-white py-2 px-3 rounded-[4px] border border-[#D8D2C4]">
              <Store className="w-4 h-4 text-[#1B4332] shrink-0" />
              <span>1,200+ Verified Buyers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
