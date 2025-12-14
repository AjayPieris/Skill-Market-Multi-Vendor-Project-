import { db } from "@/lib/db"; // 1. Import our DB helper
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// 2. This is an Async Server Component
export default async function Home() {
  
  // 3. Fetch data directly from the DB
  const gigs = await db.gig.findMany({
    include: { vendor: true }, // Join with the User table to get the vendor's name
  });

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* HERO SECTION */}
      <section className="bg-zinc-900 text-white py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Find the perfect <span className="text-blue-400">freelance</span> services
        </h1>
        <p className="text-xl text-zinc-300 mb-8">
          Get work done securely with our multi-vendor marketplace.
        </p>
        <div className="flex justify-center gap-4">
           <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/search">
            Find Work</Link></Button>
           <Button size="lg" variant="outline" className="text-black bg-white">
            <Link href="/become-seller">
            Become a Seller</Link></Button>
        </div>
      </section>

      {/* GIGS GRID */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8">Popular Services</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {gigs.map((gig) => (
            <Link href={`/gigs/${gig.id}`} key={gig.id}>
              <Card className="hover:shadow-lg transition cursor-pointer h-full ">
                {/* Image Placeholder */}
                <div className="h-48 w-full bg-gray-200 relative overflow-hidden rounded-t-lg">
                   {/* We use a standard img tag for simplicity for now */}
                   <img src={gig.imageUrl} alt={gig.title} className="object-cover w-full h-full" />
                </div>
                
                <CardHeader>
                  <CardTitle className="text-lg leading-tight">{gig.title}</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-gray-500 font-medium">{gig.category}</p>
                  <div className="flex items-center gap-2 mt-2">
                     <img src={gig.vendor.image || ""} className="w-6 h-6 rounded-full" />
                     <span className="text-xs text-gray-400">by {gig.vendor.name}</span>
                  </div>
                </CardContent>
                
                <CardFooter className="border-t pt-4 flex justify-between items-center">
                  <span className="font-bold text-lg">${gig.price}</span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}