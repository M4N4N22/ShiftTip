"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MembershipSuccessPage() {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get("checkoutId");

  const [status, setStatus] = useState<"pending" | "success" | "fail">(
    "pending"
  );

  useEffect(() => {
    if (!checkoutId) return;

    const interval = setInterval(async () => {
      const res = await fetch("/api/memberships/checkout-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutId }),
      });

      const data = await res.json();
      if (data.status && data.status !== "pending") {
        setStatus(data.status);
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [checkoutId]);

  if (status === "pending") {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p>Confirming your payment…</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">You’re subscribed!</h1>
        <Link href="/feed">Go to content</Link>
      </div>
    );
  }

  return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Payment failed</h1>
      <Link href="/">Try again</Link>
    </div>
  );
}
