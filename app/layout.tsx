import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; 
import ConditionalFooter from "@/components/ConditionalFooter";
import { ClerkProvider } from "@clerk/nextjs";
import "@uploadthing/react/styles.css";


const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Skill Market",
  description: "Find the best freelancers",
  icons: {
    icon: "/skill.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <ClerkProvider>
    <html lang="en">
      <body className={`${outfit.className} antialiased`}>
        {/* 2. Add it here! */}
        <Navbar />

        <main>{children}</main>
        {/* 3. Footer too */}
        <ConditionalFooter />
      </body>
    </html>
  </ClerkProvider>
  );
}
