"use client";

import { useMembershipStats } from "@/lib/hooks/useMembershipStats";
import { Skeleton } from "@/components/ui/skeleton";

export function MembershipStats({
  creatorWallet,
}: {
  creatorWallet: string;
}) {
  const { data, loading, error } = useMembershipStats(creatorWallet);

  const stats = [
    {
      label: "Active Members",
      value: data?.activeMembers ?? 0,
    },
    {
      label: "Monthly Revenue",
      value: data ? `$${data.monthlyRevenue.toFixed(2)}` : "$0.00",
    },
    {
      label: "Total Earned",
      value: data ? `$${data.totalEarned.toFixed(2)}` : "$0.00",
    },
  ];

  if (error) {
    return (
      <div className="border-y p-6 text-sm text-destructive">
        Failed to load membership stats
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-y p-4 divide-x">
      {stats.map((stat) => (
        <div key={stat.label} className="p-6">
          <div className="text-xl text-muted-foreground">
            {stat.label}
          </div>

          {loading ? (
            <Skeleton className="h-8 w-24 mt-2" />
          ) : (
            <div className="text-3xl font-bold mb-1">
              {stat.value}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
