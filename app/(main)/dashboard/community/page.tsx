"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Users, Trophy, Clock } from "lucide-react";
import { useAccount } from "wagmi";
import { toast } from "sonner";

type Supporter = {
  address: string;
  totalAmount: number;
  donationCount: number;
  lastDonationAt?: string;
};

export default function CommunityPage() {
  const { address } = useAccount();

  const [loading, setLoading] = useState(false);
  const [totalSupporters, setTotalSupporters] = useState(0);
  const [topSupporters, setTopSupporters] = useState<Supporter[]>([]);
  const [recentSupporters, setRecentSupporters] = useState<Supporter[]>([]);

  useEffect(() => {
    if (!address) return;

    const fetchCommunity = async () => {
      setLoading(true);

      try {
        const res = await fetch("/api/dashboard/community", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: address }),
        });

        if (!res.ok) throw new Error("Failed to fetch community");

        const data = await res.json();

        setTotalSupporters(data.totalSupporters);
        setTopSupporters(data.topSupporters);
        setRecentSupporters(data.recentSupporters);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load community");
      } finally {
        setLoading(false);
      }
    };

    fetchCommunity();
  }, [address]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Community</h1>
        <p className="text-muted-foreground">
          People who support you and keep your stream going
        </p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <Users className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Total Supporters</p>
              <p className="text-2xl font-bold">{totalSupporters}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Supporters */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Trophy className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Top Supporters</h2>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-muted-foreground">Loading supporters...</p>
          ) : topSupporters.length === 0 ? (
            <p className="text-muted-foreground">
              No supporters yet. Your first one is coming 🚀
            </p>
          ) : (
            topSupporters.map((s, i) => (
              <div
                key={s.address}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">
                      {s.address.slice(0, 6)}...
                      {s.address.slice(-4)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.donationCount} donations
                    </p>
                  </div>
                </div>

                <p className="font-semibold">${s.totalAmount.toFixed(2)}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent Supporters */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Recent Supporters</h2>
        </CardHeader>

        <CardContent className="space-y-4">
          {recentSupporters.length === 0 ? (
            <p className="text-muted-foreground">No recent activity yet.</p>
          ) : (
            recentSupporters.map((s) => (
              <div
                key={s.address + s.lastDonationAt}
                className="flex items-center justify-between"
              >
                <p className="text-sm">
                  {s.address.slice(0, 6)}...{s.address.slice(-4)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {s.lastDonationAt}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Coming Soon */}
      <Card className="border-dashed">
        <CardContent className="py-6 text-center text-muted-foreground">
          Community features like badges, roles, and supporter perks are coming
          soon.
        </CardContent>
      </Card>
    </div>
  );
}
