"use client";

import React from "react";

const COMPANIES = [
  "TECHNOVA",
  "QUARK",
  "FLOWSTATE",
  "NEXUS.IO",
  "ZENITH",
  "LUMINA",
  "SYNTAX",
  "AURA",
];

export default function TrustedCompaniesMarquee() {
  return (
    <section className="relative w-full py-16 bg-[#f8f9fa] border-b border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <h3 className="text-center text-[10px] md:text-xs font-bold text-gray-400 tracking-[0.2em] uppercase">
          Trusted by innovative companies worldwide
        </h3>
      </div>

      <div className="relative flex overflow-x-hidden group">
        {/* Left gradient fade */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[10%] md:w-1/6 bg-gradient-to-r from-[#f8f9fa] to-transparent z-10" />

        {/* Marquee Wrapper */}
        <div className="animate-marquee flex gap-12 md:gap-24 items-center py-4 px-6 md:px-12 w-max">
          {[...COMPANIES, ...COMPANIES, ...COMPANIES, ...COMPANIES].map(
            (company, i) => (
              <div
                key={i}
                className="px-6 py-2 rounded-xl bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.8)] text-gray-400 font-black text-xl md:text-3xl italic tracking-tighter hover:text-gray-600 transition-colors whitespace-nowrap"
              >
                {company}
              </div>
            ),
          )}
        </div>

        {/* Right gradient fade */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[10%] md:w-1/6 bg-gradient-to-l from-[#f8f9fa] to-transparent z-10" />
      </div>
    </section>
  );
}
