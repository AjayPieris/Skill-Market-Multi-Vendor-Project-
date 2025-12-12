import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="bg-green-100 p-6 rounded-full">
        <CheckCircle2 className="w-16 h-16 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold">Order Placed Successfully!</h1>
      <p className="text-gray-600 max-w-md">
        The vendor has been notified. You can track your order status in your dashboard.
      </p>
      <div className="flex gap-4">
        <Link href="/dashboard">
          <Button variant="outline">Go to Dashboard</Button>
        </Link>
        <Link href="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}