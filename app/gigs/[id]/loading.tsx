import { Skeleton } from "@/components/ui/skeleton";

export default function GigDetailLoading() {
  return (
    <div className="container mx-auto px-4 pt-32 pb-8 md:pt-36 md:pb-12 max-w-[1440px] animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Main Content (2/3) */}
        <div className="lg:col-span-8 order-2 lg:order-1 space-y-12">
          {/* Title & Vendor Skeleton */}
          <section>
            <div className="space-y-4 mb-8">
              <Skeleton className="h-10 md:h-14 w-full max-w-3xl rounded-xl" />
              <Skeleton className="h-10 md:h-14 w-3/4 rounded-xl" />
            </div>

            <div className="flex items-center gap-4 py-4">
              <Skeleton className="w-14 h-14 rounded-full flex-shrink-0" />
              <div className="space-y-3 w-full max-w-[200px]">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </section>

          {/* Gallery Skeleton */}
          <section className="space-y-4">
            <Skeleton className="w-full aspect-[4/3] max-h-[600px] rounded-2xl" />
            <div className="flex gap-4 overflow-x-auto pb-2">
              <Skeleton className="w-24 h-16 md:w-32 md:h-24 flex-shrink-0 rounded-xl" />
              <Skeleton className="w-24 h-16 md:w-32 md:h-24 flex-shrink-0 rounded-xl" />
              <Skeleton className="w-24 h-16 md:w-32 md:h-24 flex-shrink-0 rounded-xl" />
              <Skeleton className="w-24 h-16 md:w-32 md:h-24 flex-shrink-0 rounded-xl" />
            </div>
          </section>

          {/* About This Gig Skeleton */}
          <section className="space-y-6">
            <Skeleton className="h-8 w-48 mb-4 border-b pb-4" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[98%]" />
              <Skeleton className="h-4 w-[95%]" />
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[85%]" />
              <Skeleton className="h-4 w-full" />
            </div>
          </section>
        </div>

        {/* Sidebar (1/3) */}
        <div className="lg:col-span-4 order-1 lg:order-2">
          <div className="sticky top-28">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-200/60 space-y-8">
              <div className="flex justify-between items-start mb-6">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-9 w-24" />
              </div>

              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>

              <div className="space-y-5 pt-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-5 h-5 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="w-5 h-5 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>

              <div className="pt-6 space-y-4">
                <Skeleton className="h-14 w-full rounded-md" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>

              <div className="flex justify-center mt-6">
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
