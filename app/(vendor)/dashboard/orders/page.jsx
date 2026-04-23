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
  const incomingOrders = await db.order.findMany({
    where: {
      gig: {
        vendorId: dbUser.id,
      },
    },
    include: {
      gig: true, // Get Gig title
      buyer: true, // Get Buyer name
    },
    orderBy: { createdAt: "desc" },
  });

  // FETCH ORDERS: Find all orders placed by this user (buyer)
  const purchasedOrders = await db.order.findMany({
    where: {
      buyerId: dbUser.id,
    },
    include: {
      gig: {
        include: {
          vendor: true, // Get Vendor name
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Incoming Orders (Selling)</h2>

        <div className="border rounded-md bg-white shadow-sm">
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
              {incomingOrders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 text-gray-500"
                  >
                    No received orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                incomingOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.gig.title}
                    </TableCell>
                    <TableCell>{order.buyer.name}</TableCell>
                    <TableCell>${order.price}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {order.createdAt.toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">My Orders (Purchases)</h2>

        <div className="border rounded-md bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gig</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchasedOrders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 text-gray-500"
                  >
                    You haven't bought any gigs yet.
                  </TableCell>
                </TableRow>
              ) : (
                purchasedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.gig.title}
                    </TableCell>
                    <TableCell>{order.gig.vendor.name}</TableCell>
                    <TableCell>${order.price}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {order.createdAt.toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
