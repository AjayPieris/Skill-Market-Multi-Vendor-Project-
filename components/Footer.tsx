import Link from "next/link";
import { Facebook, Instagram, X, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        
        {/* TOP SECTION: 4 COLUMNS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <h2 className="font-bold text-2xl text-blue-600">
              Skill<span className="text-black">Market</span>
            </h2>
            <p className="text-gray-500 text-sm">
              The world's largest marketplace for freelance services. Find the perfect talent for your project today.
            </p>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h3 className="font-bold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/search?query=design" className="hover:underline">Graphics & Design</Link></li>
              <li><Link href="/search?query=development" className="hover:underline">Programming & Tech</Link></li>
              <li><Link href="/search?query=marketing" className="hover:underline">Digital Marketing</Link></li>
              <li><Link href="/search?query=writing" className="hover:underline">Writing & Translation</Link></li>
            </ul>
          </div>

          {/* Column 3: About */}
          <div>
            <h3 className="font-bold mb-4">About</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/become-seller" className="hover:underline">Become a Seller</Link></li>
              <li><Link href="#" className="hover:underline">Careers</Link></li>
              <li><Link href="#" className="hover:underline">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:underline">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div>
            <h3 className="font-bold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="#" className="hover:underline">Help & Support</Link></li>
              <li><Link href="#" className="hover:underline">Trust & Safety</Link></li>
              <li><Link href="#" className="hover:underline">Selling on SkillMarket</Link></li>
              <li><Link href="#" className="hover:underline">Buying on SkillMarket</Link></li>
            </ul>
          </div>

        </div>

        {/* BOTTOM SECTION: Copyright & Socials */}
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} SkillMarket International Ltd.
          </p>
          
          <div className="flex gap-4 text-gray-500">
            <Link href="#" className="hover:text-blue-600"><X className="w-5 h-5" /></Link>
            <Link href="#" className="hover:text-blue-600"><Facebook className="w-5 h-5" /></Link>
            <Link href="#" className="hover:text-pink-600"><Linkedin className="w-5 h-5" /></Link>
            <Link href="#" className="hover:text-pink-600"><Instagram className="w-5 h-5" /></Link>
          </div>
        </div>

      </div>
    </footer>
  );
}