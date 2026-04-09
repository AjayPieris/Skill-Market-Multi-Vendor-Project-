import { db } from "@/lib/db"; // 1. Import our DB helper
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Star, Search, ArrowRight, BadgeCheck, Heart } from "lucide-react";
import HoverImageCarousel from "@/components/HoverImageCarousel"; // Added hover image carousel
import TrustedCompaniesMarquee from "@/components/TrustedCompaniesMarquee";

// 2. This is an Async Server Component
export default async function Home() {
  // 3. Fetch data directly from the DB
  const gigs = await db.gig.findMany({
    where: { deletedAt: null }, // Exclude soft-deleted gigs
    include: {
      vendor: true, // Join with the User table to get the vendor's name
      _count: { select: { orders: true } },
      reviews: { select: { rating: true } },
    },
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f8f9fc] via-white to-[#f0f4ff] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          {/* Left Text Content */}
          <div className="flex-1 w-full max-w-2xl flex flex-col justify-center text-center lg:text-left">
            <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold tracking-tight text-slate-900 leading-[1.1] animate-fade-in-up">
              Your Vision,
              <br />
              <span className="text-[#104bce]">Built by Experts.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 animate-fade-in-up animation-delay-100">
              Connect with the world's most talented digital architects,
              writers, and developers. Transform your boldest ideas into reality
              with high-end freelance expertise.
            </p>

            {/* Search Bar */}
            <div className="relative mt-8 max-w-xl w-full mx-auto lg:mx-0 flex items-center bg-slate-100/80 backdrop-blur-sm border border-slate-200/50 rounded-full p-2 shadow-sm focus-within:ring-2 focus-within:ring-[#104bce]/30 transition-shadow animate-fade-in-up animation-delay-200">
              <Search className="w-5 h-5 text-slate-400 ml-4 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search for any service..."
                className="flex-1 bg-transparent border-none outline-none px-4 text-slate-700 placeholder:text-slate-400 text-base md:text-lg min-w-0"
              />
              <Button className="bg-[#2442af] hover:bg-[#1a3285] text-white rounded-full px-6 md:px-8 py-2 md:py-6 h-auto text-sm md:text-base font-semibold flex-shrink-0 transition-colors shadow-md">
                Search
              </Button>
            </div>

            {/* Popular tags */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 md:gap-3 mt-6 animate-fade-in-up animation-delay-300">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-2 md:mr-4">
                Popular:
              </span>
              {[
                "Logo Design",
                "Web Development",
                "Copywriting",
                "AI Artist",
              ].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-1.5 bg-[#eef2fc] text-[#3451b2] font-semibold rounded-full text-[13px] whitespace-nowrap cursor-pointer hover:bg-[#dfe6f7] transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 mt-10 animate-fade-in-up animation-delay-400">
              <Button
                size="lg"
                className="bg-[#304bc0] hover:bg-[#253a99] text-white rounded-full px-8 py-6 text-base md:text-lg font-semibold shadow-lg shadow-[#304bc0]/20 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
              >
                <Link href="/search" className="w-full">
                  Find Talent
                </Link>
              </Button>
              <Link
                href="/become-seller"
                className="text-[#304bc0] font-bold text-base md:text-lg hover:text-[#1e307d] transition-colors flex items-center gap-2 group w-full sm:w-auto justify-center"
              >
                Join as a Pro{" "}
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Image Grid Content */}
          <div className="flex-1 w-full max-w-2xl relative">
            <div className="grid grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6 min-h-[400px] md:min-h-[500px]">
              {/* Left Column in Grid (Sarah + Stats) */}
              <div className="flex flex-col gap-4 md:gap-6 lg:col-span-7">
                {/* Sarah Image */}
                <div className="relative rounded-[24px] md:rounded-[32px] overflow-hidden bg-slate-200 shadow-xl flex-auto min-h-[200px] md:min-h-[300px] group animate-scale-in animation-delay-300">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"
                    alt="Professional UX Architect"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale"
                  />
                  {/* Subtle vignette/overlay for text readability */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Floating Info Card */}
                  <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 bg-[#cacdc9] rounded-[16px] p-3 md:p-4 shadow-lg border border-white/20 transform transition-transform group-hover:-translate-y-1">
                    <div className="font-bold text-base md:text-lg text-[#104bce]">
                      Sarah J.
                    </div>
                    <div className="text-xs md:text-sm font-semibold text-slate-800 mt-0.5">
                      Senior UX Architect • 4.9/5
                    </div>
                  </div>
                </div>

                {/* Stats Card */}
                <div className="bg-[#eceff4] rounded-[24px] md:rounded-[32px] p-6 md:p-8 flex items-center justify-center shadow-inner relative overflow-hidden group animate-fade-in-up animation-delay-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex w-full items-center justify-between relative z-10">
                    <div className="flex-1 text-center border-r-[1.5px] border-slate-300/60 pr-2">
                      <div className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-800 tracking-tight">
                        50k+
                      </div>
                      <div className="text-[9px] md:text-[11px] font-bold text-slate-500 mt-1 md:mt-2 uppercase tracking-[0.2em]">
                        EXPERTS
                      </div>
                    </div>
                    <div className="flex-1 text-center pl-2">
                      <div className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-800 tracking-tight">
                        98%
                      </div>
                      <div className="text-[9px] md:text-[11px] font-bold text-slate-500 mt-1 md:mt-2 uppercase tracking-[0.2em]">
                        SUCCESS RATE
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column in Grid (Vetted + Man Image) */}
              <div className="flex flex-col gap-4 md:gap-6 lg:col-span-5 md:mt-8 lg:mt-12">
                {/* Vetted Pro Square */}
                <div className="bg-[#0b5cff] rounded-[24px] md:rounded-[32px] aspect-square flex flex-col items-center justify-center text-white shadow-2xl shadow-[#106be8]/30 transform transition-transform hover:-translate-y-2 animate-scale-in animation-delay-400 relative overflow-hidden">
                  {/* Decorative glow */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 blur-2xl rounded-full" />

                  <BadgeCheck
                    fill="white"
                    className="w-12 h-12 md:w-16 md:h-16 mb-2 text-[#0b5cff] drop-shadow-md"
                  />
                  <span className="font-bold text-sm md:text-base tracking-wide">
                    Vetted Pro
                  </span>
                </div>

                {/* Vertical Man Image */}
                <div className="relative rounded-[24px] md:rounded-[32px] overflow-hidden bg-slate-800 shadow-xl flex-auto min-h-[250px] md:min-h-[350px] group animate-fade-in-up animation-delay-600">
                  <img
                    src="https://images.unsplash.com/photo-1600486913747-55e5470d6f40?auto=format&fit=crop&q=80&w=800"
                    alt="Professional Designer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GIGS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-10 bg-slate-50/50 rounded-[40px]">
        <div className="flex flex-col mb-10">
          <div className="max-w-2xl mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2 leading-tight tracking-tight">
              Curated Opportunities
            </h2>
            <p className="text-slate-500 text-sm md:text-base font-medium">
              Premium services from vetted professionals
            </p>
          </div>
          {/* Tags */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Link
              href="/search"
              className="px-4 py-1.5 bg-gray-200 text-gray-800 text-sm font-semibold rounded-full whitespace-nowrap hover:bg-gray-300 transition"
            >
              All
            </Link>
            <Link
              href="/search?query=Design"
              className="px-4 py-1.5 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-full whitespace-nowrap hover:bg-gray-50 transition"
            >
              Design
            </Link>
            <Link
              href="/search?query=Development"
              className="px-4 py-1.5 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-full whitespace-nowrap hover:bg-gray-50 transition"
            >
              Development
            </Link>
            <Link
              href="/search?query=Strategy"
              className="px-4 py-1.5 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-full whitespace-nowrap hover:bg-gray-50 transition"
            >
              Strategy
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {gigs.map((gig) => {
            const avgRating =
              gig.reviews.length > 0
                ? (
                    gig.reviews.reduce((s, r) => s + r.rating, 0) /
                    gig.reviews.length
                  ).toFixed(1)
                : null;
            return (
              <div
                key={gig.id}
                className="group flex flex-col hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full relative border border-[#d1d5db] shadow-[4px_8px_20px_rgba(0,0,0,0.15),inset_0_2px_3px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.05)] hover:shadow-[6px_12px_28px_rgba(0,0,0,0.2),inset_0_2px_3px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(0,0,0,0.05)] rounded-[24px] overflow-hidden bg-gradient-to-b from-[#fbfbfb] to-[#e8ebf0] p-2"
              >
                {/* Full-card gig link using CSS overlay */}
                <Link
                  href={`/gigs/${gig.id}`}
                  className="absolute inset-0 z-0"
                  aria-label={gig.title}
                />

                {/* Image Area */}
                <div className="h-[200px] w-full bg-slate-200 relative overflow-hidden rounded-[16px] border border-gray-300 shadow-[inset_0_4px_8px_rgba(0,0,0,0.4)]">
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 z-10 bg-gradient-to-b from-gray-50 to-gray-200 px-3 py-1 rounded-full text-[10px] font-bold text-slate-700 tracking-wider uppercase shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_1px_white] border border-gray-300">
                    {gig.category}
                  </div>

                  {/* Favorite Button */}
                  <button
                    type="button"
                    className="absolute top-4 right-4 z-10 w-8 h-8 bg-gradient-to-b from-white to-gray-200 rounded-full flex items-center justify-center transition-transform hover:from-gray-50 hover:to-gray-300 active:translate-y-[1px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] shadow-[0_3px_6px_rgba(0,0,0,0.3),inset_0_1px_1px_white] border border-gray-300"
                    aria-label="Save to favorites"
                  >
                    <Heart className="w-4 h-4 text-slate-700 hover:text-red-500 fill-transparent hover:fill-red-500 transition-colors" />
                  </button>

                  <HoverImageCarousel
                    images={gig.images}
                    fallbackImage={gig.imageUrl}
                    alt={gig.title}
                    className="w-full h-full mix-blend-multiply opacity-90"
                    imageClassName="object-cover"
                  />

                  {/* Inner bezel shadow overlay for physical recessed screen look */}
                  <div className="absolute inset-0 pointer-events-none shadow-[inset_0_8px_16px_rgba(0,0,0,0.3),inset_0_-2px_6px_rgba(255,255,255,0.4)] rounded-[16px]" />
                </div>

                <div className="px-2 pt-4 pb-3 flex flex-col flex-1 bg-transparent">
                  {/* Author and Rating Row */}
                  <div className="flex justify-between items-center mb-3">
                    {/* Author Info */}
                    <div className="flex items-center gap-2 relative z-10">
                      <Link
                        href={`/members/${gig.vendor.id}`}
                        className="block rounded-full overflow-hidden shrink-0 w-8 h-8 bg-gradient-to-tr from-gray-300 to-gray-100 flex items-center justify-center font-bold text-slate-600 shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.8)] border border-gray-300"
                      >
                        {gig.vendor.image ? (
                          <img
                            src={gig.vendor.image}
                            className="w-full h-full object-cover"
                            alt={gig.vendor.name ?? "Vendor"}
                          />
                        ) : (
                          <span className="text-[9px]">
                            {(gig.vendor.name || "U")
                              .substring(0, 2)
                              .toUpperCase()}
                          </span>
                        )}
                      </Link>
                      <Link
                        href={`/members/${gig.vendor.id}`}
                        className="text-sm font-semibold text-slate-800 hover:text-blue-600 truncate"
                      >
                        {gig.vendor.name}
                      </Link>
                    </div>

                    {/* Rating Info */}
                    <div className="shrink-0 relative z-10">
                      {avgRating ? (
                        <div className="flex items-center gap-1 text-sm font-semibold text-slate-800">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 -mt-0.5" />
                          <span>{avgRating}</span>
                          <span className="text-slate-400 font-medium ml-0.5">
                            (
                            {gig.reviews.length >= 1000
                              ? (gig.reviews.length / 1000).toFixed(1) + "k"
                              : gig.reviews.length}
                            )
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
                          <Star className="w-3 h-3 text-gray-300" />
                          New
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-[15px] font-bold text-slate-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] leading-snug mb-4 line-clamp-2 pr-2 relative z-10">
                    {gig.title}
                  </h3>

                  <div className="mt-auto"></div>

                  {/* Footer Row (Price) */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-300 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset] relative z-10">
                    <span className="text-[10px] font-extrabold text-slate-500 tracking-widest uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                      STARTING AT
                    </span>
                    <span className="text-[18px] font-black text-slate-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                      ${gig.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button */}
        <div className="flex justify-center mt-6">
          <Link
            href="/search"
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-slate-800 text-sm font-semibold rounded-full transition-colors"
          >
            Load More Opportunities
          </Link>
        </div>
      </section>

      {/* Trusted Companies right above footer */}
      <TrustedCompaniesMarquee />
    </div>
  );
}
