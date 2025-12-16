"use client";

import { useEffect, useState } from "react";

type MembershipStatsData = {
  activeMembers: number;
  monthlyRevenue: number;
  totalEarned: number;
};

export function useMembershipStats(creatorWallet: string) {
  const [data, setData] = useState<MembershipStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!creatorWallet) return;

    setLoading(true);
    setError(null);

    fetch("/api/creator/memberships/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creatorWallet }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || "Failed to fetch stats");
        }
        return res.json();
      })
      .then((json) => {
        setData({
          activeMembers: json.activeMembers,
          monthlyRevenue: json.monthlyRevenue,
          totalEarned: json.totalEarned,
        });
      })
      .catch((err) => {
        console.error("Failed to load membership stats:", err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [creatorWallet]);

  return { data, loading, error };
}
