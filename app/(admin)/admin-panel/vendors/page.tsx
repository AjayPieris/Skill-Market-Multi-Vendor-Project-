import { db } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Store, ShieldOff, ShieldCheck } from "lucide-react";
import { toggleBlockVendor, revokeVendorPrivilege } from "@/app/actions/admin";

export default async function VendorsPage() {
  // Fetch vendors with their gigs and gig orders (correct revenue source)
  const vendors = await db.user.findMany({
    where: { role: "vendor" },
    include: {
      gigs: {
        where: { deletedAt: null },
        include: {
          orders: { select: { price: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalVendors = vendors.length;
  const activeVendors = vendors.filter((v) => !v.isBlocked).length;
  const blockedVendors = vendors.filter((v) => v.isBlocked).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Vendors Directory
        </h1>
        <p className="text-slate-500 mt-1">
          Manage all service providers on the platform.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Store className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Vendors</p>
            <p className="text-2xl font-bold text-slate-900">{totalVendors}</p>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-xl">
            <ShieldCheck className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Active Vendors</p>
            <p className="text-2xl font-bold text-slate-900">{activeVendors}</p>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-xl">
            <ShieldOff className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Blocked Vendors</p>
            <p className="text-2xl font-bold text-slate-900">{blockedVendors}</p>
          </div>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-slate-800">All Vendors</h2>
          <p className="text-slate-500 text-sm">
            Block/Unblock or revoke vendor access from the platform.
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-slate-500 font-semibold">Vendor</TableHead>
                <TableHead className="text-slate-500 font-semibold">Email</TableHead>
                <TableHead className="text-slate-500 font-semibold">Active Gigs</TableHead>
                <TableHead className="text-slate-500 font-semibold">Revenue Earned</TableHead>
                <TableHead className="text-slate-500 font-semibold">Status</TableHead>
                <TableHead className="text-slate-500 font-semibold">Joined</TableHead>
                <TableHead className="text-slate-500 font-semibold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-slate-500 py-10"
                  >
                    No vendors found on the platform yet.
                  </TableCell>
                </TableRow>
              )}
              {vendors.map((v) => {
                // Correct revenue: sum orders through their gigs
                const revenue = v.gigs.reduce(
                  (gigSum, gig) =>
                    gigSum +
                    gig.orders.reduce((ordSum, o) => ordSum + o.price, 0),
                  0
                );

                return (
                  <TableRow
                    key={v.id}
                    className={`border-slate-100 transition-colors hover:bg-slate-50 ${
                      v.isBlocked ? "opacity-60 bg-red-50/30" : ""
                    }`}
                  >
                    {/* Avatar + Name */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {v.image ? (
                          <img
                            src={v.image}
                            alt={v.name ?? "Vendor"}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {v.name?.charAt(0).toUpperCase() ?? "V"}
                          </div>
                        )}
                        <span className="font-semibold text-slate-800">
                          {v.name || "Unknown"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      {v.email}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-700">
                      {v.gigs.length}
                    </TableCell>
                    <TableCell className="font-semibold text-green-700">
                      ${revenue.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {v.isBlocked ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                          Blocked
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                          Active
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {new Date(v.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Block / Unblock */}
                        <form
                          action={toggleBlockVendor.bind(null, v.id, v.isBlocked)}
                        >
                          <Button
                            type="submit"
                            size="sm"
                            variant={v.isBlocked ? "outline" : "destructive"}
                            className={`text-xs font-semibold px-3 rounded-full gap-1 ${
                              v.isBlocked
                                ? "border-green-300 text-green-700 hover:bg-green-50"
                                : ""
                            }`}
                          >
                            {v.isBlocked ? (
                              <>
                                <ShieldCheck className="w-3 h-3" /> Unblock
                              </>
                            ) : (
                              <>
                                <ShieldOff className="w-3 h-3" /> Block
                              </>
                            )}
                          </Button>
                        </form>
                        {/* Revoke vendor privilege */}
                        <form action={revokeVendorPrivilege.bind(null, v.id)}>
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="text-xs font-semibold px-3 rounded-full border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200"
                          >
                            Revoke
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
