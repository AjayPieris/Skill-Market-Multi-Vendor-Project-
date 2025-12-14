import { db } from "@/lib/db"; // Prisma database instance
import Link from "next/link"; // Client-side navigation (no page reload)
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // UI card components
import SearchInput from "@/components/SearchInput"; // Smart search input component

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
      OR: [
        { title: { contains: searchTerm, mode: "insensitive" } }, // Match title
        { description: { contains: searchTerm, mode: "insensitive" } }, // Match description
        { category: { contains: searchTerm, mode: "insensitive" } }, // Match category
      ],
    },
    include: { vendor: true }, // Also fetch vendor details
  });

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen"> {/* Page wrapper */}

      {/* SEARCH BAR SECTION */}
      <div className="max-w-2xl mx-auto mb-12 text-center space-y-4"> {/* Centered search area */}
        <h1 className="text-3xl font-bold">Find the perfect talent</h1> {/* Page heading */}

        {/* Search input that updates the URL */}
        <div className="max-w-md mx-auto">
          <SearchInput /> {/* Debounced URL-based search input */}
        </div>
      </div>

      {/* RESULTS SECTION */}
      <div>
        {gigs.length === 0 ? ( // Check if no results found

          <div className="text-center py-20 bg-gray-50 rounded-lg"> {/* Empty state */}
            <h2 className="text-xl font-semibold text-gray-600">No services found</h2> {/* Message */}
            <p className="text-gray-400">Try typing "Design", "Logo", or "React".</p> {/* Suggestion */}
          </div>

        ) : ( // If results exist

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> {/* Responsive grid */}
            {gigs.map((gig) => ( // Loop through gigs

              <Link href={`/gigs/${gig.id}`} key={gig.id}> {/* Navigate to gig detail page */}
                <Card className="hover:shadow-lg transition cursor-pointer h-full flex flex-col"> {/* Gig card */}

                  {/* Gig image */}
                  <div className="h-48 w-full bg-gray-200 relative overflow-hidden rounded-t-lg">
                    <img
                      src={gig.imageUrl} // Gig cover image URL
                      alt={gig.title} // Accessibility text
                      className="object-cover w-full h-full" // Image styling
                    />
                  </div>

                  <CardHeader>
                    <CardTitle className="text-lg leading-tight line-clamp-2">
                      {gig.title} {/* Gig title (max 2 lines) */}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="flex-grow"> {/* Card body */}
                    <p className="text-sm text-gray-500 font-medium mb-2">
                      {gig.category} {/* Gig category */}
                    </p>

                    <div className="flex items-center gap-2">
                      <img
                        src={gig.vendor.image || ""} // Vendor profile image
                        className="w-6 h-6 rounded-full" // Avatar styling
                      />
                      <span className="text-xs text-gray-400 truncate">
                        by {gig.vendor.name} {/* Vendor name */}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="border-t pt-4"> {/* Card footer */}
                    <span className="font-bold text-lg">
                      ${gig.price} {/* Gig price */}
                    </span>
                  </CardFooter>

                </Card>
              </Link>

            ))}
          </div>
        )}
      </div>

    </div>
  );
}
