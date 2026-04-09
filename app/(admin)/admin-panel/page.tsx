import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  Users,
  Store,
  Package,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminDashboard() {
  const clerkUser = await currentUser();

  // Platform-wide stats
  const totalUsers = await db.user.count();
  const totalVendors = await db.user.count({ where: { role: "vendor" } });
  const blockedVendors = await db.user.count({
    where: { role: "vendor", isBlocked: true },
  });
  const totalGigs = await db.gig.count({ where: { deletedAt: null } });
  const totalOrders = await db.order.count();
  const allOrders = await db.order.findMany({ select: { price: true } });
  const totalRevenue = allOrders.reduce((acc, o) => acc + o.price, 0);

  // Recent users
  const recentUsers = await db.user.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">
        Welcome back, {clerkUser?.firstName}!
      </h1>

      {/* STATS CARDS — same as vendor dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All-time platform earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVendors}</div>
            <p className="text-xs text-muted-foreground">
              {blockedVendors} currently blocked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Gigs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGigs}</div>
            <p className="text-xs text-muted-foreground">Live service listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">All-time transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Order Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalOrders > 0
                ? `$${(totalRevenue / totalOrders).toFixed(2)}`
                : "$0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Revenue per order</p>
          </CardContent>
        </Card>
      </div>

      {/* NEWEST USERS TABLE */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-slate-800">
            Newest Joined Users
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Most recently registered accounts.
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="font-semibold text-slate-500">Name</TableHead>
                <TableHead className="font-semibold text-slate-500">Email</TableHead>
                <TableHead className="font-semibold text-slate-500">Role</TableHead>
                <TableHead className="font-semibold text-slate-500">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsers.map((u) => (
                <TableRow key={u.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-semibold">
                    {u.name || "Unknown"}
                  </TableCell>
                  <TableCell className="text-slate-600">{u.email}</TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        u.role === "admin"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : u.role === "vendor"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {u.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {new Date(u.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
