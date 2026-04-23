import { db } from "@/lib/db"; // Prisma database instance
import Link from "next/link"; // Client-side navigation (no page reload)
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // UI card components
import SearchInput from "@/components/SearchInput"; // Smart search input component
import { Star, Heart } from "lucide-react";
import HoverImageCarousel from "@/components/HoverImageCarousel"; // Imported hover image carousel

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>; // URL query params (?query=...)
}) {
  const { query } = await searchParams; // Extract query from URL
  const searchTerm = query || ""; // Fallback to empty string if query is missing

  // Fetch gigs from database based on search term
  const gigs = await db.gig.findMany({
    where: {
      deletedAt: null, // Exclude soft-deleted gigs
      OR: [
        { title: { contains: searchTerm, mode: "insensitive" } }, // Match title
        { description: { contains: searchTerm, mode: "insensitive" } }, // Match description
        { category: { contains: searchTerm, mode: "insensitive" } }, // Match category
      ],
    },
    include: {
      vendor: true, // Also fetch vendor details
      _count: { select: { orders: true } },
      reviews: { select: { rating: true } },
    },
  });

  return (
    <div className="container mx-auto px-4 pt-32 pb-12 min-h-screen">
      {" "}
      {/* Page wrapper */}
      {/* SEARCH BAR SECTION */}
      <div className="max-w-2xl mx-auto mb-12 text-center space-y-4">
        {" "}
        {/* Centered search area */}
        <h1 className="text-3xl font-bold">Find the perfect talent</h1>{" "}
        {/* Page heading */}
        {/* Search input that updates the URL */}
        <div className="max-w-md mx-auto">
          <SearchInput /> {/* Debounced URL-based search input */}
        </div>
      </div>
      {/* RESULTS SECTION */}
      <div>
        {gigs.length === 0 ? ( // Check if no results found
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            {" "}
            {/* Empty state */}
            <h2 className="text-xl font-semibold text-gray-600">
              No services found
            </h2>{" "}
            {/* Message */}
            <p className="text-gray-400">
              Try typing &quot;Design&quot;, &quot;Logo&quot;, or
              &quot;React&quot;.
            </p>{" "}
            {/* Suggestion */}
          </div>
        ) : (
          // If results exist

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {" "}
            {/* Responsive grid */}
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
                    className="absolute inset-0 z-10"
                    aria-label={gig.title}
                  />

                  {/* Image Area */}
                  <div className="h-[200px] w-full bg-slate-200 relative overflow-hidden rounded-[16px] border border-gray-300 shadow-[inset_0_4px_8px_rgba(0,0,0,0.4)]">
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 z-20 bg-gradient-to-b from-gray-50 to-gray-200 px-3 py-1 rounded-full text-[10px] font-bold text-slate-700 tracking-wider uppercase shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_1px_white] border border-gray-300 pointer-events-none">
                      {gig.category}
                    </div>

                    {/* Favorite Button */}
                    <button
                      type="button"
                      className="absolute top-4 right-4 z-20 w-8 h-8 bg-gradient-to-b from-white to-gray-200 rounded-full flex items-center justify-center transition-transform hover:from-gray-50 hover:to-gray-300 active:translate-y-[1px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] shadow-[0_3px_6px_rgba(0,0,0,0.3),inset_0_1px_1px_white] border border-gray-300"
                      aria-label="Save to favorites"
                    >
                      <Heart className="w-4 h-4 text-slate-700 hover:text-red-500 fill-transparent hover:fill-red-500 transition-colors" />
                    </button>

                    <HoverImageCarousel
                      images={gig.images}
                      fallbackImage={gig.imageUrl}
                      alt={gig.title}
                      className="w-full h-full mix-blend-multiply opacity-90 relative z-20 pointer-events-auto"
                      imageClassName="object-cover"
                    />

                    {/* Inner bezel shadow overlay for physical recessed screen look */}
                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_8px_16px_rgba(0,0,0,0.3),inset_0_-2px_6px_rgba(255,255,255,0.4)] rounded-[16px] z-10" />
                  </div>

                  <div className="px-2 pt-4 pb-3 flex flex-col flex-1 bg-transparent">
                    {/* Author and Rating Row */}
                    <div className="flex justify-between items-center mb-3">
                      {/* Author Info */}
                      <div className="flex items-center gap-2 relative z-20">
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
                      <div className="shrink-0">
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
                    <h3 className="text-[15px] font-bold text-slate-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] leading-snug mb-4 line-clamp-2 pr-2">
                      {gig.title}
                    </h3>

                    <div className="mt-auto"></div>

                    {/* Footer Row (Price) */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-300 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset]">
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
        )}
      </div>
    </div>
  );
}
