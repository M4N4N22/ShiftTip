"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type PublicMembershipPlan = {
  id: string;
  name: string;
  description: string;
  perks: string[];
  price: number;
  token: string;
  network: string;
  creator: {
    name?: string | null;
    avatar?: string | null;
    wallet: string;
  };
};

export function SubscribePlan({ planId }: { planId: string }) {
  const { address } = useAccount();

  const [plan, setPlan] = useState<PublicMembershipPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // -----------------------------
  // Fetch public plan
  // -----------------------------
  useEffect(() => {
    setLoading(true);

    fetch(`/api/public/memberships/${planId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Plan not found");
        return res.json();
      })
      .then((data) => setPlan(data))
      .catch(() => setError("Membership not found"))
      .finally(() => setLoading(false));
  }, [planId]);

  // -----------------------------
  // Subscribe handler (stub)
  // -----------------------------
  const handleSubscribe = async () => {
    if (!plan) {
      console.error("Subscribe called without loaded plan");
      return;
    }

    if (!address) {
      alert("Connect wallet to continue");
      return;
    }

    try {
      setSubscribing(true);

      const res = await fetch("/api/sideshift/membership", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: plan.id,
          settleCoin: plan.token,
          settleNetwork: plan.network,
          price: plan.price.toString(),
          subscriberWallet: address,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Subscribe error:", data);
        alert("Failed to start subscription");
        return;
      }

      // 🚀 Redirect to SideShift Pay
      window.location.href = data.redirectUrl;
    } catch (err) {
      console.error("Subscribe failed:", err);
      alert("Something went wrong");
    } finally {
      setSubscribing(false);
    }
  };

  // -----------------------------
  // Loading
  // -----------------------------
  if (loading) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="p-8 space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-full mt-4" />
        </CardContent>
      </Card>
    );
  }

  // -----------------------------
  // Error
  // -----------------------------
  if (error || !plan) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="p-8 text-center text-muted-foreground">
          Membership not found
        </CardContent>
      </Card>
    );
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{plan.name}</h1>
        <p className="text-muted-foreground">{plan.description}</p>
      </div>

      {/* Plan Card */}
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Price */}
          <div className="text-center">
            <div className="text-4xl font-bold">${plan.price}</div>
            <div className="text-sm text-muted-foreground">
              per month · paid in {plan.token}
            </div>
          </div>

          {/* Perks */}
          {plan.perks.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">What you get</p>
              <ul className="space-y-1 text-sm">
                {plan.perks.map((perk, i) => (
                  <li key={i}>• {perk}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Network info */}
          <div className="flex justify-center">
            <Badge variant="secondary">{plan.network}</Badge>
          </div>

          {/* CTA */}
          <Button
            className="w-full"
            size="lg"
            disabled={subscribing}
            onClick={handleSubscribe}
          >
            {subscribing ? "Redirecting…" : "Subscribe"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Secure crypto checkout powered by SideShift
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
