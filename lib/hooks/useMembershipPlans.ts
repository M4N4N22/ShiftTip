"use client";

import { useEffect, useState } from "react";
import { MembershipPlan } from "@/components/dashboard/memberships/types";

export function useMembershipPlans(creatorWallet?: string) {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!creatorWallet) return;

    setLoading(true);

    fetch("/api/creator/memberships/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creatorWallet }),
    })
      .then((res) => res.json())
      .then((json) => {
        setPlans(json.plans ?? []);
      })
      .finally(() => setLoading(false));
  }, [creatorWallet]);

  return { plans, loading };
}
