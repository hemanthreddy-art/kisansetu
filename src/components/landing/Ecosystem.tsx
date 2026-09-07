'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Store, Truck, ShieldCheck, ArrowRight } from 'lucide-react';

export function Ecosystem() {
  const participants = [
    {
      title: 'Farmers & FPOs',
      role: 'PRODUCERS',
      description: 'Create produce lots, compare APMC net realisation, and review direct buyer offers.',
      href: '/farmer',
      icon: Users,
    },
    {
      title: 'Commercial Buyers',
      role: 'PROCUREMENT',
      description: 'Browse verified produce lots, assess quality reports, and issue binding digital offers.',
      href: '/buyer',
      icon: Store,
    },
    {
      title: 'Transporters',
      role: 'LOGISTICS',
      description: 'Provide corridor truck capacity, calculate trip freight, and secure delivery payouts.',
      href: '/transporter',
      icon: Truck,
    },
    {
      title: 'Inspectors & Governance',
      role: 'VERIFICATION',
      description: 'Perform physical assayer grading, resolve trade grievances, and supervise APMC standards.',
      href: '/inspector',
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="py-12 bg-white border-b border-[#D8D2C4]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-2 mb-8">
          <span className="text-xs font-bold text-[#1B4332] uppercase tracking-wider block">
            Ecosystem Integration
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#262320] tracking-tight">
            Who Uses KisanSetu
          </h2>
          <p className="text-sm sm:text-base font-body text-[#635E59]">
            A unified market-linkage network connecting all participants in the agricultural supply chain.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {participants.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#F4F1EA] border border-[#D8D2C4] rounded-[8px] p-5 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-[4px] bg-[#ECE7DE] text-[#1B4332] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#635E59] uppercase tracking-wider block">
                      {item.role}
                    </span>
                    <h3 className="font-heading font-bold text-base text-[#262320]">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs font-body text-[#635E59] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#1B4332] hover:text-[#2D6A4F] pt-2"
                >
                  <span>Open Portal</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
