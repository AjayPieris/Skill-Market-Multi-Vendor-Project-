import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminDashboard() {
  
  // 1. Fetch Global Stats
  const totalUsers = await db.user.count();
  const totalGigs = await db.gig.count();
  const totalOrders = await db.order.count();
  
  // Calculate Total Money Flow
  const allOrders = await db.order.findMany();
  const totalRevenue = allOrders.reduce((acc, order) => acc + order.price, 0);

  // 2. Fetch Recent Users
  const recentUsers = await db.user.findMany({
    take: 5,
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* SCOREBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader><CardTitle className="text-sm text-slate-400">Total Revenue</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-green-400">${totalRevenue}</div></CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader><CardTitle className="text-sm text-slate-400">Total Users</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{totalUsers}</div></CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader><CardTitle className="text-sm text-slate-400">Total Gigs</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{totalGigs}</div></CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader><CardTitle className="text-sm text-slate-400">Total Orders</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{totalOrders}</div></CardContent>
        </Card>
      </div>

      {/* USER MANAGEMENT TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Newest Users</h2>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400">Name</TableHead>
              <TableHead className="text-slate-400">Email</TableHead>
              <TableHead className="text-slate-400">Role</TableHead>
              <TableHead className="text-slate-400">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentUsers.map((u) => (
              <TableRow key={u.id} className="border-slate-800 hover:bg-slate-800">
                <TableCell className="font-medium text-slate-200">{u.name}</TableCell>
                <TableCell className="text-slate-400">{u.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'}`}>
                    {u.role}
                  </span>
                </TableCell>
                <TableCell className="text-slate-400">{u.createdAt.toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

    </div>
  );
}