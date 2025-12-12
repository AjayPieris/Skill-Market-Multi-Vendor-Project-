import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingBag } from "lucide-react"; // Icons

export default async function DashboardPage() {
  const user = await currentUser();
  
  // Fetch stats for this specific user
  // (We use clerkId because that is what we have in the session)
  const dbUser = await db.user.findUnique({
    where: { clerkId: user?.id },
    include: { gigs: true } // Load their gigs to count them
  });

  if (!dbUser) return null; // Should not happen due to layout sync

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Welcome back, {dbUser.name}!</h1>
      
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Gigs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dbUser.gigs.length}</div>
            <p className="text-xs text-muted-foreground">Services currently for sale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}