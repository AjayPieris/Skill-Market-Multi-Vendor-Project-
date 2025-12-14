import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { redirect } from "next/navigation";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  // 1. Get the search term from the URL (e.g. ?query=design)
  const { query } = await searchParams;
  const searchTerm = query || "";

  // 2. Ask Database: "Find gigs where title contains 'design'..."
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

  // 3. Simple Server Action to handle the search input submission
  async function searchAction(formData: FormData) {
    "use server";
    const term = formData.get("term") as string;
    redirect(`/search?query=${term}`);
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      
      {/* SEARCH BAR SECTION */}
      <div className="max-w-2xl mx-auto mb-12 text-center space-y-4">
        <h1 className="text-3xl font-bold">Find the perfect talent</h1>
        <form action={searchAction} className="flex gap-2">
          <Input 
            name="term" 
            placeholder="Search for 'logo', 'react', 'design'..." 
            defaultValue={searchTerm}
            className="bg-white"
          />
          <Button type="submit">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </form>
      </div>

      {/* RESULTS GRID */}
      <div>
        {gigs.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-600">No services found for "{searchTerm}"</h2>
            <p className="text-gray-400">Try searching for something else like "Design" or "Web".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gigs.map((gig) => (
              <Link href={`/gigs/${gig.id}`} key={gig.id}>
                <Card className="hover:shadow-lg transition cursor-pointer h-full flex flex-col">
                  {/* Image */}
                  <div className="h-48 w-full bg-gray-200 relative overflow-hidden rounded-t-lg">
                     <img src={gig.imageUrl} alt={gig.title} className="object-cover w-full h-full" />
                  </div>
                  
                  {/* Details */}
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