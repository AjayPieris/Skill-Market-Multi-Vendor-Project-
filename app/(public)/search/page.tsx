import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import SearchInput from "@/components/SearchInput"; // <--- Import the new component

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;
  const searchTerm = query || "";

  // Fetch from DB based on URL
  const gigs = await db.gig.findMany({
    where: {
      OR: [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
        { category: { contains: searchTerm, mode: "insensitive" } },
      ],
    },
    include: { vendor: true },
  });

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      
      {/* SEARCH BAR SECTION */}
      <div className="max-w-2xl mx-auto mb-12 text-center space-y-4">
        <h1 className="text-3xl font-bold">Find the perfect talent</h1>
        
        {/* We use our new Smart Input here */}
        <div className="max-w-md mx-auto">
            <SearchInput />
        </div>
      </div>

      {/* RESULTS GRID */}
      <div>
        {gigs.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-600">No services found</h2>
            <p className="text-gray-400">Try typing "Design", "Logo", or "React".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gigs.map((gig) => (
              <Link href={`/gigs/${gig.id}`} key={gig.id}>
                <Card className="hover:shadow-lg transition cursor-pointer h-full flex flex-col">
                  <div className="h-48 w-full bg-gray-200 relative overflow-hidden rounded-t-lg">
                     <img src={gig.imageUrl} alt={gig.title} className="object-cover w-full h-full" />
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-lg leading-tight line-clamp-2">{gig.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <p className="text-sm text-gray-500 font-medium mb-2">{gig.category}</p>
                    <div className="flex items-center gap-2">
                       <img src={gig.vendor.image || ""} className="w-6 h-6 rounded-full" />
                       <span className="text-xs text-gray-400 truncate">by {gig.vendor.name}</span>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="border-t pt-4">
                    <span className="font-bold text-lg">${gig.price}</span>
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