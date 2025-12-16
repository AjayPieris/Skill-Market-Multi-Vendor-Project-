import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { CheckCircle2, Star } from "lucide-react";
import { placeOrderAction } from "@/app/actions/order";
import { startConversationAction } from "@/app/actions/conversation";

export default async function GigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const gig = await db.gig.findUnique({
    where: { id },
    include: { vendor: true },
  });

  if (!gig) return notFound();

  const placeOrder = async () => {
    "use server";
    await placeOrderAction(gig.id);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <h1 className="text-3xl font-bold text-gray-900">{gig.title}</h1>
          <div className="flex items-center gap-3">
            <img
              src={gig.vendor.image || "https://github.com/shadcn.png"}
              alt={gig.vendor.name || "User"}
              className="w-12 h-12 rounded-full border"
            />
            <div>
              <p className="font-bold text-sm">{gig.vendor.name}</p>
              <div className="flex items-center text-yellow-500 text-xs">
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
                <span className="text-gray-400 ml-1">(5.0)</span>
              </div>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border bg-gray-100">
            <img
              src={gig.imageUrl}
              alt={gig.title}
              className="w-full object-cover max-h-125"
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">About This Gig</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {gig.description}
            </p>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="border rounded-xl p-6 shadow-sm sticky top-24 bg-white">
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-gray-500">Standard Package</span>
              <span className="text-2xl font-bold text-black">
                ${gig.price}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              I will provide a high-quality service with unlimited revisions.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>3 Days Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Unlimited Revisions</span>
              </div>
            </div>
            <form action={placeOrder}>
              <Button
                className="w-full font-bold text-md"
                size="lg"
                type="submit"
              >
                Continue (${gig.price})
              </Button>
            </form>
            <form
              action={async () => {
                "use server";
                await startConversationAction(gig.vendorId);
              }}
            >
              <Button variant="outline" className="w-full mt-3" type="submit">
                Contact Seller
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
