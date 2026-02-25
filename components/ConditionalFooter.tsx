"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

// Only show the footer on public pages (home, search, become-seller, gig details, etc.)
// Hide it on dashboard and admin pages
export default function ConditionalFooter() {
  const pathname = usePathname();

  const hideOnPrefixes = ["/dashboard", "/admin"];
  const shouldHide = hideOnPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (shouldHide) return null;
  return <Footer />;
}
