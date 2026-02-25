import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { CheckCircle2, Star } from "lucide-react";
import { createCheckoutSessionAction } from "@/app/actions/order";
import { currentUser } from "@clerk/nextjs/server";
import ContactSellerButton from "@/components/ContactSellerButton";
import Link from "next/link";
import ReviewForm from "@/components/ReviewForm";

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
    <div className="container mx-auto px-4 py-6 md:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
        <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {gig.title}
          </h1>
          <div className="flex items-center gap-3">
            <img
              src={gig.vendor.image || "https://github.com/shadcn.png"}
              alt={gig.vendor.name || "User"}
              className="w-12 h-12 rounded-full border"
            />
            <div>
              <p className="font-bold text-sm">{gig.vendor.name}</p>
              <div className="flex items-center gap-1 text-yellow-500 text-xs">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3 h-3 ${
                      avgRating !== null && s <= Math.round(avgRating)
                        ? "fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                {avgRating !== null ? (
                  <span className="text-gray-500 ml-1">
                    ({avgRating.toFixed(1)}) · {gig.reviews.length} review
                    {gig.reviews.length !== 1 ? "s" : ""}
                  </span>
                ) : (
                  <span className="text-gray-400 ml-1">No reviews yet</span>
                )}
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

          {/* ── REVIEWS SECTION ── */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold">
                Reviews ({gig.reviews.length})
              </h3>
              {avgRating !== null && (
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-sm">
                    {avgRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Review form — only for buyers with an unreviewed order */}
            {unreviewedOrder && (
              <ReviewForm gigId={gig.id} orderId={unreviewedOrder.id} />
            )}

            {/* All reviews list */}
            {gig.reviews.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              <div className="space-y-4">
                {gig.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border rounded-xl p-5 bg-white space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            review.reviewer.image ||
                            "https://github.com/shadcn.png"
                          }
                          alt={review.reviewer.name || "User"}
                          className="w-8 h-8 rounded-full border"
                        />
                        <span className="font-semibold text-sm">
                          {review.reviewer.name || "Anonymous"}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 text-yellow-500">
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
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {review.comment}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-1 order-1 lg:order-2">
          <div className="border rounded-xl p-6 shadow-sm lg:sticky lg:top-24 bg-white">
            {isOwner ? (
              <div className="space-y-3">
                <div className="text-sm text-gray-600">This is your gig.</div>
                <Link href={`/dashboard/gigs/${gig.id}`} className="block">
                  <Button className="w-full" size="lg">
                    Edit Gig
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-gray-500">
                    Standard Package
                  </span>
                  <span className="text-2xl font-bold text-black">
                    ${gig.price}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  {gig.packageDescription ||
                    "I will provide a high-quality service."}
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>
                      {gig.deliveryDays}{" "}
                      {gig.deliveryDays === 1 ? "Day" : "Days"} Delivery
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>{gig.revisions} Revisions</span>
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
                <ContactSellerButton vendorId={gig.vendorId} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
