"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleBlockVendor(vendorId: string, currentlyBlocked: boolean) {
  await db.user.update({
    where: { id: vendorId },
    data: { isBlocked: !currentlyBlocked },
  });
  revalidatePath("/admin-panel/vendors");
  revalidatePath("/admin-panel");
}

export async function revokeVendorPrivilege(vendorId: string) {
  await db.user.update({
    where: { id: vendorId },
    data: { role: "customer" },
  });
  revalidatePath("/admin-panel/vendors");
  revalidatePath("/admin-panel");
}
