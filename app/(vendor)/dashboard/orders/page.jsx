import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function VendorOrdersPage() {
  const user = await currentUser();
  const dbUser = await db.user.findUnique({
    where: { clerkId: user?.id },
  });

  if (!dbUser) return null;

  // FETCH ORDERS: Find all orders where the Gig belongs to ME (the vendor)
  const orders = await db.order.findMany({
    where: {
      gig: {
        vendorId: dbUser.id // This is the magic filter
      }
    },
    include: {
      gig: true,   // Get Gig title
      buyer: true, // Get Buyer name
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Incoming Orders</h2>
      
      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gig</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                  No orders yet.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.gig.title}</TableCell>
                  <TableCell>{order.buyer.name}</TableCell>
                  <TableCell>${order.price}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}