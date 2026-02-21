import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Need to install this component first? See below.

export default async function MyGigsPage() {
  const user = await currentUser();
  const dbUser = await db.user.findUnique({
    where: { clerkId: user?.id },
    include: {
      gigs: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { orders: true } },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Services</h2>
        <Link href="/dashboard/gigs/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create New Gig
          </Button>
        </Link>
      </div>

      {/* GIGS LIST TABLE */}
      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Sales</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dbUser?.gigs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-10 text-gray-500"
                >
                  You have no gigs yet. Create one to start selling!
                </TableCell>
              </TableRow>
            ) : (
              dbUser?.gigs.map((gig) => (
                <TableRow
                  key={gig.id}
                  className={gig.deletedAt ? "bg-red-50" : ""}
                >
                  <TableCell
                    className={`font-medium ${
                      gig.deletedAt ? "text-red-500 line-through" : ""
                    }`}
                  >
                    {gig.title}
                  </TableCell>
                  <TableCell className={gig.deletedAt ? "text-red-400" : ""}>
                    ${gig.price}
                  </TableCell>
                  <TableCell className={gig.deletedAt ? "text-red-400" : ""}>
                    {gig.category}
                  </TableCell>
                  <TableCell className={gig.deletedAt ? "text-red-400" : ""}>
                    {gig._count.orders}
                  </TableCell>
                  <TableCell>
                    {gig.deletedAt ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        Deleted
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        Available
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
