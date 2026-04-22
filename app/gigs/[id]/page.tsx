import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { CheckCircle2, Star } from "lucide-react";
import { createCheckoutSessionAction } from "@/app/actions/order";
import { currentUser } from "@clerk/nextjs/server";
import ContactSellerButton from "@/components/ContactSellerButton";
import Link from "next/link";
import ReviewForm from "@/components/ReviewForm";
import GigImageGallery from "@/components/GigImageGallery";

export default async function GigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const gig = await db.gig.findUnique({
    where: { id },
    include: {
      vendor: true,
      reviews: {
        include: { reviewer: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // Treat soft-deleted gigs as not found
  if (!gig || gig.deletedAt) return notFound();

  const viewer = await currentUser();
  const viewerDbUser = viewer
    ? await db.user.findUnique({ where: { clerkId: viewer.id } })
    : null;
  const isOwner = viewerDbUser?.id === gig.vendorId;

  // Find an order by this buyer for this gig that has no review yet
  const unreviewedOrder = viewerDbUser
    ? await db.order.findFirst({
        where: {
          gigId: gig.id,
          buyerId: viewerDbUser.id,
          review: null,
        },
      })
    : null;

  const avgRating =
    gig.reviews.length > 0
      ? gig.reviews.reduce((sum, r) => sum + r.rating, 0) / gig.reviews.length
      : null;

  const placeOrder = async () => {
    "use server";
    await createCheckoutSessionAction(gig.id);
  };

  return (
    <div className="container mx-auto px-4 pt-32 pb-8 md:pt-36 md:pb-12 max-w-[1440px]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Main Content (2/3) */}
        <div className="lg:col-span-8 order-2 lg:order-1 space-y-12">
          {/* Title & Vendor */}
          <section>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
              {gig.title}
            </h1>
            <div className="flex items-center gap-4 py-4">
              <Link href={`/members/${gig.vendor.id}`}>
                <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 hover:ring-2 hover:ring-blue-400 transition">
                  <img
                    src={gig.vendor.image || "https://github.com/shadcn.png"}
                    alt={gig.vendor.name || "User"}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/members/${gig.vendor.id}`}
                    className="font-bold text-lg hover:underline transition"
                  >
                    {gig.vendor.name}
                  </Link>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-widest uppercase ml-2">
                    Pro Vendor
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-bold text-sm">
                    {avgRating !== null ? avgRating.toFixed(1) : "New"}
                  </span>
                  <span className="text-sm text-slate-500">
                    ({gig.reviews.length} reviews)
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section>
            <GigImageGallery
              images={gig.images}
              fallbackImage={gig.imageUrl}
              title={gig.title}
            />
          </section>

          {/* About This Gig */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold border-b border-slate-200 pb-4 text-slate-900">
              About This Gig
            </h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">
                {gig.description}
              </p>
            </div>
          </section>

          {/* ── REVIEWS SECTION ── */}
          <section className="space-y-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900">
                Reviews ({gig.reviews.length})
              </h2>
            </div>

            {/* Review form — only for buyers with an unreviewed order */}
            {unreviewedOrder && (
              <div className="mb-8">
                <ReviewForm gigId={gig.id} orderId={unreviewedOrder.id} />
              </div>
            )}

            {/* All reviews list */}
            {gig.reviews.length === 0 ? (
              <p className="text-slate-500 text-sm">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              <div className="space-y-4">
                {gig.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-6 md:p-8 bg-white border border-slate-100 rounded-xl shadow-sm space-y-4"
                  >
                    <div className="flex items-center gap-4">
                      <Link href={`/members/${review.reviewer.id}`}>
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 hover:ring-2 hover:ring-blue-400 transition">
                          <img
                            src={
                              review.reviewer.image ||
                              "https://github.com/shadcn.png"
                            }
                            alt={review.reviewer.name || "User"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>
                      <div>
                        <Link
                          href={`/members/${review.reviewer.id}`}
                          className="hover:underline"
                        >
                          <h4 className="font-bold text-slate-900">
                            {review.reviewer.name || "Anonymous"}
                          </h4>
                        </Link>
                        <div className="flex text-yellow-500 text-xs gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= review.rating
                                  ? "fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="ml-auto text-xs text-slate-400">
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </div>
                    </div>
                    <p className="text-slate-600 italic leading-relaxed">
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
        <div className="lg:col-span-4 order-1 lg:order-2 relative">
          <div className="sticky top-28 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-200/60">
              {isOwner ? (
                <div className="space-y-4 text-center">
                  <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                    Owner View
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Manage your gig
                  </h3>
                  <Link href={`/dashboard/gigs/${gig.id}`} className="block">
                    <Button className="w-full py-6 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-md transition-all">
                      Edit Gig
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-extrabold text-slate-900">
                      Standard Package
                    </h3>
                    <span className="text-3xl font-extrabold text-blue-700">
                      ${gig.price}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-8 leading-relaxed">
                    {gig.packageDescription ||
                      "I will provide a high-quality service tailored to your requirements."}
                  </p>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-800">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      <span>
                        {gig.deliveryDays}{" "}
                        {gig.deliveryDays === 1 ? "Day" : "Days"} Delivery
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-800">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      <span>{gig.revisions} Revisions</span>
                    </div>
                  </div>
                  <form action={placeOrder}>
                    <Button
                      className="w-full mb-4 py-6 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all"
                      type="submit"
                    >
                      Continue (${gig.price})
                    </Button>
                  </form>
                  <div className="w-full">
                    <ContactSellerButton vendorId={gig.vendorId} />
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-xs text-slate-400 font-medium">
                      Secured Payments via Stripe
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
