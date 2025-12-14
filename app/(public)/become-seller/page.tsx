import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, DollarSign, Globe, Zap } from "lucide-react";

export default function BecomeSellerPage() {
  return (
    <div className="min-h-screen">
      
      {/* HERO SECTION */}
      <section className="bg-black text-white py-24">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold">
            Work Your Way
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            You bring the skill. We make earning easy. Become a seller on SkillMarket and turn your passion into profit.
          </p>
          <Link href="/dashboard">
             <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6 h-auto">
               Start Selling
             </Button>
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">How it works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Step 1 */}
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">1. Create a Gig</h3>
              <p className="text-gray-600">
                Sign up for free, set up your Gig, and offer your work to our global audience.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">2. Deliver Great Work</h3>
              <p className="text-gray-600">
                Get notified when you get an order and use our system to discuss details with customers.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto text-purple-600">
                <DollarSign className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">3. Get Paid</h3>
              <p className="text-gray-600">
                Get paid on time, every time. Payment is transferred to you upon order completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY STATS */}
      <section className="py-20 bg-gray-50 border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Join our growing freelance community</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-green-600" />
                  <span>Connect to clients worldwide</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-green-600" />
                  <span>Low transaction fees</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-green-600" />
                  <span>24/7 Support</span>
                </div>
              </div>
              <Link href="/dashboard">
                <Button variant="outline" size="lg">Join Community</Button>
              </Link>
            </div>

            <div className="h-64 md:h-96 bg-gray-200 rounded-xl overflow-hidden relative">
               <img 
                 src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                 alt="Team working" 
                 className="w-full h-full object-cover"
               />
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}