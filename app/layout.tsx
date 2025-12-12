import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // <--- 1. Import it

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Skill Market",
  description: "Find the best freelancers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} antialiased`}>
        {/* 2. Add it here! */}
        <Navbar />

        <main>{children}</main>
      </body>
    </html>
  );
}
