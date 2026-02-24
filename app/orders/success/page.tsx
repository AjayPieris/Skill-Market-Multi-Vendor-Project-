import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { fulfillOrderFromSessionAction } from "@/app/actions/order";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let fulfilled = false;
  let errorMsg: string | undefined;

  if (session_id) {
    const result = await fulfillOrderFromSessionAction(session_id);
    fulfilled = result.ok;
    errorMsg = result.error;
  }

  // If fulfillment failed, show a clear error so the user can report it
  if (!fulfilled && errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="bg-red-100 p-6 rounded-full">
          <XCircle className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold">Payment Received</h1>
        <p className="text-gray-600 max-w-md">
          Your payment was processed, but we could not record your order
          automatically. Please contact support with the reference below.
        </p>
        <p className="text-xs text-red-500 font-mono bg-red-50 px-4 py-2 rounded">
          {errorMsg}
        </p>
        {session_id && (
          <p className="text-xs text-gray-400 font-mono">
            Session: {session_id}
          </p>
        )}
        <Link href="/dashboard">
          <Button variant="outline">Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="bg-green-100 p-6 rounded-full">
        <CheckCircle2 className="w-16 h-16 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold">Order Placed Successfully!</h1>
      <p className="text-gray-600 max-w-md">
        Payment confirmed. The freelancer has been notified. Please check your dashboard for updates.
      </p>
      <div className="flex gap-4">
        <Link href="/dashboard">
          <Button variant="outline">Go to Dashboard</Button>
        </Link>
        <Link href="/">
          <Button>Explore More Jobs</Button>
        </Link>
      </div>
    </div>
  );
}
